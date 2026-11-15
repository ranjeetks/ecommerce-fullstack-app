resource "aws_security_group" "db" {
  name_prefix = "ecommerce-db-"
  description = "Postgres access from the backend service"
  vpc_id      = var.vpc_id

  lifecycle { create_before_destroy = true }
}

# Only the backend ECS tasks may reach Postgres
resource "aws_vpc_security_group_ingress_rule" "db_from_app" {
  security_group_id            = aws_security_group.db.id
  referenced_security_group_id = module.ecs.services["ecommerce-backend"].security_group_id
  from_port                    = 5432
  to_port                      = 5432
  ip_protocol                  = "tcp"
  description                  = "Postgres from backend tasks"
}
