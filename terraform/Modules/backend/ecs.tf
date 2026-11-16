module "ecs" {
  source = "terraform-aws-modules/ecs/aws"

  cluster_name = "ecommerce-app"

  # Cluster capacity providers
  cluster_capacity_providers = ["FARGATE"]


  services = {
    ecommerce-backend = {
      # Task size (smallest Fargate combo that fits Django + gunicorn)
      cpu           = 256
      memory        = 512
      desired_count = 1

      # ECS Exec (SSM Session Manager): shell into the task and tunnel to RDS (private subnets)
      enable_execute_command = true

      # FASTER UP: ECS ignores failing ALB health checks for this long after a task starts, so a
      # slow start is not killed. Keep it short because Django starts in a few seconds.
      health_check_grace_period_seconds = 30

      # Allow the task execution role to read the SECRET_KEY parameter at container start
      task_exec_ssm_param_arns = [aws_ssm_parameter.secret_key.arn]

      # ...and the RDS-managed master password in Secrets Manager
      task_exec_secret_arns = [module.db.db_instance_master_user_secret_arn]

      # Container definition(s)
      container_definitions = {
        backend-container = {
          essential = true

          # CloudWatch log group for this container (created by the module).
          # Keep logs for 5 days, then CloudWatch deletes them automatically (module default: 14 days).
          cloudwatch_log_group_retention_in_days = 5
          image                                  = "${aws_ecr_repository.eccommerce-app.repository_url}:latest"
          portMappings = [
            {
              name          = "http"
              containerPort = 8000
              protocol      = "tcp"
            }
          ]
          # Non-secret config read by backend/config/settings.py
          environment = [
            { name = "ENV", value = var.app_env },
            { name = "DEBUG", value = var.debug },
            { name = "CORS_ALLOWED_ORIGINS", value = "https://${var.frontend_domain_name}" },
            { name = "CSRF_TRUSTED_ORIGINS", value = "https://${var.frontend_domain_name},https://${var.backend_domain_name}" },
            # Database connection (read by backend/config/settings.py when DB_HOST is set)
            { name = "DB_HOST", value = module.db.db_instance_address },
            { name = "DB_PORT", value = tostring(module.db.db_instance_port) },
            { name = "DB_NAME", value = module.db.db_instance_name },
            # The RDS module marks the username output sensitive; that taints the whole services map and
            # breaks the ECS module's for_each. A username is not a secret, so unwrap it.
            { name = "DB_USER", value = nonsensitive(module.db.db_instance_username) },
          ]

          secrets = [
            {
              name      = "SECRET_KEY"
              valueFrom = aws_ssm_parameter.secret_key.arn
            },
            {
              # RDS-managed secret is JSON; "<arn>:password::" injects only the password field
              name      = "DB_PASSWORD"
              valueFrom = "${module.db.db_instance_master_user_secret_arn}:password::"
            }
          ]

          # FASTER DESTROY / REDEPLOY: seconds ECS waits after SIGTERM before SIGKILL (default 30).
          # `python manage.py runserver` is PID 1 and ignores SIGTERM, so every stop would wait the full 30s.
          stopTimeout = 5

          readonlyRootFilesystem = false
        }

      }

      load_balancer = {
        service = {
          target_group_arn = module.alb.target_groups["ex-instance"].arn
          container_name   = "backend-container"
          container_port   = 8000
        }
      }

      # Tasks run in the private (app) subnets, no public IP; ECR is reached via NAT
      subnet_ids       = var.private_subnet_ids
      assign_public_ip = false

      # Only the ALB may reach the container
      security_group_ingress_rules = {
        alb_http = {
          description                  = "Traffic from the ALB"
          from_port                    = 8000
          to_port                      = 8000
          referenced_security_group_id = module.alb.security_group_id
        }
      }
      # Outbound: ECR pull, CloudWatch Logs, DB, etc.
      security_group_egress_rules = {
        all = {
          ip_protocol = "-1"
          cidr_ipv4   = "0.0.0.0/0"
        }
      }
    }
  }
}
