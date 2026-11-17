output "certificate_arn" {
  value     = aws_acm_certificate_validation.cert_validation.certificate_arn
  sensitive = true
}

output "certificate_validation_record" {
  value     = aws_route53_record.cert_validation_add_CNAME_record
  sensitive = true
}

output "certificate_validation_fqdns" {
  value     = aws_acm_certificate_validation.cert_validation
  sensitive = true
}

output "s3_bucket_id" {
  value = module.s3_bucket.s3_bucket_id
}

output "s3_bucket_arn" {
  value = module.s3_bucket.s3_bucket_arn
}

output "cloudfront_distribution_id" {
  value = module.cloudfront_distribution.cloudfront_distribution_id
}

output "cloudfront_distribution_arn" {
  value = module.cloudfront_distribution.cloudfront_distribution_arn
}
