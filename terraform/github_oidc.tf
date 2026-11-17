# Lets the GitHub Actions deploy workflow assume an AWS role without long-lived access keys.
# Scoped to the main branch of this repository and to the minimum S3 / CloudFront actions.

variable "github_repository" {
  description = "GitHub repo (owner/name) allowed to deploy the frontend"
  type        = string
  default     = "Xuyen21/devops-ecommerce-fullstack-app"
}

# NOTE: an AWS account can have only one OIDC provider per URL.
# If this account already has one for token.actions.githubusercontent.com, import it
# (terraform import aws_iam_openid_connect_provider.github <arn>) instead of creating a new one.
resource "aws_iam_openid_connect_provider" "github" {
  url            = "https://token.actions.githubusercontent.com"
  client_id_list = ["sts.amazonaws.com"]
}

data "aws_iam_policy_document" "github_deploy_trust" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]
    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github.arn]
    }
    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }
    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:${var.github_repository}:ref:refs/heads/main"]
    }
  }
}

resource "aws_iam_role" "github_frontend_deploy" {
  name               = "github-actions-frontend-deploy"
  assume_role_policy = data.aws_iam_policy_document.github_deploy_trust.json
}

data "aws_iam_policy_document" "github_frontend_deploy" {
  statement {
    actions   = ["s3:ListBucket"]
    resources = [module.frontend.s3_bucket_arn]
  }
  statement {
    actions   = ["s3:PutObject", "s3:DeleteObject"]
    resources = ["${module.frontend.s3_bucket_arn}/*"]
  }
  statement {
    actions   = ["cloudfront:CreateInvalidation"]
    resources = [module.frontend.cloudfront_distribution_arn]
  }
}

resource "aws_iam_role_policy" "github_frontend_deploy" {
  name   = "frontend-deploy"
  role   = aws_iam_role.github_frontend_deploy.id
  policy = data.aws_iam_policy_document.github_frontend_deploy.json
}

output "github_deploy_role_arn" {
  value = aws_iam_role.github_frontend_deploy.arn
}

output "frontend_bucket_name" {
  value = module.frontend.s3_bucket_id
}

output "frontend_cloudfront_distribution_id" {
  value = module.frontend.cloudfront_distribution_id
}
