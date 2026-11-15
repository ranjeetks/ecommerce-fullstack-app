output "vpc_id" {
  value = module.vpc.vpc_id
}

output "public_subnet_ids" { # alb-1, alb-2
  value = module.vpc.public_subnets
}

output "private_subnet_ids" { # app-1, app-2
  value = module.vpc.private_subnets
}

output "database_subnet_ids" { # database-1, database-2
  value = module.vpc.database_subnets
}