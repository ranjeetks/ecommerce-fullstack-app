module "alb" {
  source = "terraform-aws-modules/alb/aws"

  name = "eshop-alb"

  # FASTER DESTROY: the module defaults to true, which makes `terraform destroy` fail on the ALB.
  # NOTE: if the ALB already exists, run `terraform apply` once before `destroy` so this reaches the real ALB.
  enable_deletion_protection = false
  vpc_id                     = var.vpc_id
  subnets                    = var.public_subnet_ids

  # Security Group
  security_group_ingress_rules = {
    all_http = {
      from_port   = 80
      to_port     = 80
      ip_protocol = "tcp"
      description = "HTTP web traffic"
      cidr_ipv4   = "0.0.0.0/0"
    }
    all_https = {
      from_port   = 443
      to_port     = 443
      ip_protocol = "tcp"
      description = "HTTPS web traffic"
      cidr_ipv4   = "0.0.0.0/0"
    }
  }
  security_group_egress_rules = {
    all = {
      ip_protocol = "-1"
      cidr_ipv4   = "10.0.0.0/16"
    }
  }

  # enable communication with ALB
  listeners = {
    ex-http-https-redirect = {
      port     = 80
      protocol = "HTTP"
      redirect = {
        port        = "443"
        protocol    = "HTTPS"
        status_code = "HTTP_301"
      }
    }
    ex-https = {
      port            = 443
      protocol        = "HTTPS"
      certificate_arn = aws_acm_certificate_validation.cert_validation.certificate_arn

      forward = {
        target_group_key = "ex-instance"
      }
    }
  }

  target_groups = {
    ex-instance = {
      name_prefix       = "app-"
      protocol          = "HTTP"
      port              = 8000 # Django application port
      target_type       = "ip"
      create_attachment = false # ECS service registers the Fargate tasks

      # FASTER DESTROY / REDEPLOY: default is 300s. The ALB keeps a stopping task in "draining" for this
      # long, and ECS waits for it. 5s is fine for a practice app with no long-running requests.
      deregistration_delay = 5

      health_check = {
        enabled = true
        path    = "/health"
        matcher = "200"
        # FASTER UP: a new task becomes "healthy" after healthy_threshold x interval.
        # Before: 2 x 30s = 60s. Now: 2 x 10s = 20s.
        interval            = 10
        timeout             = 5
        healthy_threshold   = 2
        unhealthy_threshold = 3
      }
    }
  }


}
