# Lets the GitHub Actions deploy workflow assume an AWS role without long-lived access keys.
# Scoped to the main branch of this repository and to the minimum S3 / CloudFront actions.

# GitHub now puts immutable numeric IDs in the OIDC `sub` claim (owner@ownerId/repo@repoId), so a
# renamed, deleted-and-recreated or transferred repo can never reuse this role.
# Copy the exact value from the "Debug OIDC claims" step of a deploy run if it ever changes.
variable "github_oidc_subject_prefix" {
  description = "OIDC `sub` claim prefix for the repo allowed to deploy the frontend"
  type        = string
  default     = "repo:Xuyen21@93767417/devops-ecommerce-fullstack-app@1444708921"
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
      test = "StringEquals"
      # decide who is this token for (audience)
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }
    condition {
      test = "StringEquals"
      # critical authorization
      variable = "token.actions.githubusercontent.com:sub" # only accept request from this subject
      values   = ["${var.github_oidc_subject_prefix}:ref:refs/heads/main"]
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

# ---------------------------------------------------------------------------------------------
# Backend deploy role: push images to ECR and roll out the ECS service.
# Same trust rules as the frontend role (this repo, main branch only), different permissions.
# ---------------------------------------------------------------------------------------------
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

resource "aws_iam_role" "github_backend_deploy" {
  name               = "github-actions-backend-deploy"
  assume_role_policy = data.aws_iam_policy_document.github_deploy_trust.json
}

data "aws_iam_policy_document" "github_backend_deploy" {
  # Docker login to ECR; this action does not support resource-level restriction
  statement {
    actions   = ["ecr:GetAuthorizationToken"]
    resources = ["*"]
  }
  # Push images to this repository only
  statement {
    actions = [
      "ecr:BatchCheckLayerAvailability",
      "ecr:BatchGetImage",
      "ecr:CompleteLayerUpload",
      "ecr:InitiateLayerUpload",
      "ecr:PutImage",
      "ecr:UploadLayerPart",
    ]
    resources = [module.backend.ecr_repository_arn]
  }
  # Roll out and watch this service only
  statement {
    actions = ["ecs:UpdateService", "ecs:DescribeServices"]
    resources = [
      "arn:aws:ecs:${data.aws_region.current.region}:${data.aws_caller_identity.current.account_id}:service/ecommerce-app/ecommerce-backend"
    ]
  }
}

resource "aws_iam_role_policy" "github_backend_deploy" {
  name   = "backend-deploy"
  role   = aws_iam_role.github_backend_deploy.id
  policy = data.aws_iam_policy_document.github_backend_deploy.json
}

output "github_backend_deploy_role_arn" {
  value = aws_iam_role.github_backend_deploy.arn
}
