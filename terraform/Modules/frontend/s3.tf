module "s3_bucket" {
  source = "terraform-aws-modules/s3-bucket/aws"

  bucket = "ecommerce-app-s3-bucket-2026"

  # FASTER / CLEANER DESTROY: without this, `destroy` fails while the bucket still holds the built frontend files
  force_destroy = true

  control_object_ownership = true
  object_ownership         = "BucketOwnerEnforced"

}

# custom Trust policies

# permissions policywhat actions are allowed on the S3 bucket
data "aws_iam_policy_document" "s3_bucket_actions" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${module.s3_bucket.s3_bucket_arn}/*"]
    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }
    condition {
      test     = "StringEquals"
      variable = "aws:SourceArn"
      values   = [module.cloudfront_distribution.cloudfront_distribution_arn]
    }
  }
}

# resource-based policy, cloudfront uses direct service-to-service auth via OAC
# origin_access_control = {
#   s3 = {
#     signing_behavior = "always"
#     signing_protocol = "sigv4"
#   }
# }
# cloudfront does not assume a role 
resource "aws_s3_bucket_policy" "allow_access_from_another_account" {
  bucket = module.s3_bucket.s3_bucket_id
  policy = data.aws_iam_policy_document.s3_bucket_actions.json
}
