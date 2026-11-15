module "db" {
  source = "terraform-aws-modules/rds/aws"

  identifier = "ecommerce-db"

  engine            = "postgres"
  engine_version    = "18.6" # 18.7 is not offered in us-east-1; check: aws rds describe-orderable-db-instance-options
  instance_class    = "db.t3.micro"
  storage_type      = "gp3"
  allocated_storage = 20 # Postgres minimum for gp3 (also the free-tier amount)

  db_name  = "ecommercedb"
  username = "ecommerce_admin" # "user" is a reserved word and is rejected by RDS
  port     = 5432

  # RDS creates and stores the master password in Secrets Manager
  manage_master_user_password = true

  vpc_security_group_ids = [aws_security_group.db.id]
  publicly_accessible    = false
  multi_az               = false # single AZ keeps the cost minimal

  # DB subnet group (needs subnets in at least 2 AZs)
  create_db_subnet_group = true
  subnet_ids             = var.database_subnet_ids

  # DB parameter group (Postgres has no option groups)
  family                 = "postgres18"
  create_db_option_group = false

  # CloudWatch: export Postgres logs (retention keeps the log cost near zero).
  # Basic RDS metrics (CPU, connections, free storage, ...) are free; Enhanced Monitoring stays off.
  enabled_cloudwatch_logs_exports        = ["postgresql", "upgrade"]
  create_cloudwatch_log_group            = true
  cloudwatch_log_group_retention_in_days = 5
  monitoring_interval                    = 0
  performance_insights_enabled           = false

  # Cheap and easy to destroy while practicing; flip these for a real production DB
  backup_retention_period = 1
  skip_final_snapshot     = true

}
