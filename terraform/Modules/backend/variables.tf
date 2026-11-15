variable "ecr_repository_name" {
  description = "The name of the ECR repository"
  type        = string
}

variable "vpc_id" { type = string }
variable "public_subnet_ids" { type = list(string) }
variable "private_subnet_ids" { type = list(string) }
variable "database_subnet_ids" { type = list(string) }

variable "backend_domain_name" {
  description = "The domain name for the backend API"
  type        = string
}

variable "frontend_domain_name" {
  description = "The domain name of the frontend (used for CORS and CSRF trusted origins)"
  type        = string
}

variable "app_env" {
  description = "Value of the ENV variable read by the Django app (DEV or PROD)"
  type        = string
  default     = "PROD"
}

variable "debug" {
  description = "Value of the DEBUG variable read by the Django app (\"True\" or \"False\")"
  type        = string
  default     = "False"
}

variable "alert_email" {
  description = "E-mail address that receives CloudWatch alarm notifications. Leave empty to create the SNS topic without an e-mail subscription."
  type        = string
  default     = ""
}
