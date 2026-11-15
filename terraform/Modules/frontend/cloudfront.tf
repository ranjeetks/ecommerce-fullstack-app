data "aws_cloudfront_cache_policy" "cache-policy" {
  name = "Managed-CachingOptimized"
}

locals {
  api_origin_id = "backend-alb"
}

module "cloudfront_distribution" {
  source = "terraform-aws-modules/cloudfront/aws"

  aliases = [var.domain_name]

  # FASTER UP: do not block `apply` until the distribution finishes deploying (can take 5-15 min).
  # It is already serving requests in a few minutes; check the Console if you need to know exactly when.
  # (Destroy still has to disable the distribution and wait; CloudFront cannot skip that.)
  wait_for_deployment = false

  default_root_object = "index.html"

  # SPA routing: S3 returns 403 for missing keys when the bucket has no ListBucket permission
  custom_error_response = [
    {
      error_code         = 403
      response_code      = 200
      response_page_path = "/index.html"
    },
    {
      error_code         = 404
      response_code      = 200
      response_page_path = "/index.html"
    }
  ]

  # OAC method to connect to S3 service
  origin_access_control = {
    s3 = {
      description      = "CloudFront access to S3"
      origin_type      = "s3"
      signing_behavior = "always"
      signing_protocol = "sigv4"
    }
  }

  # define which bucket
  origin = {
    (var.origin_id) = {
      domain_name               = module.s3_bucket.s3_bucket_bucket_regional_domain_name
      origin_access_control_key = "s3" # key of the OAC defined above
    }

    # Backend API: the ALB, reached through its own hostname so the HTTPS certificate matches
    (local.api_origin_id) = {
      domain_name = var.backend_domain_name
      custom_origin_config = {
        http_port              = 80
        https_port             = 443
        origin_protocol_policy = "https-only"
        origin_ssl_protocols   = ["TLSv1.2"]
      }
    }
  }

  default_cache_behavior = {
    target_origin_id       = var.origin_id #must be the same as origin_id defined in the origin block
    viewer_protocol_policy = "redirect-to-https"

    allowed_methods = ["GET", "HEAD", "OPTIONS"]
    cached_methods  = ["GET", "HEAD"]
    compress        = true
    query_string    = true
    cache_policy_id = data.aws_cloudfront_cache_policy.cache-policy.id

  }

  # Same-origin API: /api/* goes to the ALB instead of S3 (no caching, all HTTP methods)
  ordered_cache_behavior = [
    {
      path_pattern           = "/api/*"
      target_origin_id       = local.api_origin_id
      viewer_protocol_policy = "https-only"

      allowed_methods = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
      cached_methods  = ["GET", "HEAD"]
      compress        = true

      cache_policy_name          = "Managed-CachingDisabled"
      origin_request_policy_name = "Managed-AllViewerExceptHostHeader" # forwards cookies, Authorization, query strings; Host = ALB hostname
    }
  ]

  viewer_certificate = {
    acm_certificate_arn = aws_acm_certificate.cert.arn
    ssl_support_method  = "sni-only"
  }
}
