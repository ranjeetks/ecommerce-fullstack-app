# output "certificate" {
#   value     = module.frontend.certificate
#   sensitive = true
# }


output "certificate_validation_record" {
  value     = module.frontend.certificate_validation_record
  sensitive = true
}

output "certificate_validation_fqdns" {
  value     = module.frontend.certificate_validation_fqdns
  sensitive = true
}