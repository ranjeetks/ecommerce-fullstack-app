terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

locals {
  frontend_domain_name = "eshop.devops-pro.me"
  backend_domain_name  = "api.eshop.devops-pro.me"
}

module "frontend" {
  source              = "./Modules/frontend"
  domain_name         = local.frontend_domain_name
  backend_domain_name = local.backend_domain_name
}

module "networking" {
  source = "./Modules/networking"
}

module "backend" {
  source               = "./Modules/backend"
  ecr_repository_name  = "eccommerce-app"
  backend_domain_name  = local.backend_domain_name
  frontend_domain_name = local.frontend_domain_name
  vpc_id               = module.networking.vpc_id
  public_subnet_ids    = module.networking.public_subnet_ids
  private_subnet_ids   = module.networking.private_subnet_ids
  database_subnet_ids  = module.networking.database_subnet_ids
  alert_email = "furmanczuk22@gmail.com"
}
