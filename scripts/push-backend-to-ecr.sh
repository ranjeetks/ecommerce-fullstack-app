#!/usr/bin/env bash
# Build backend/Dockerfile.dev and push it to AWS ECR.
# Usage: ./scripts/push-backend-to-ecr.sh [tag]
# Env overrides: AWS_REGION, ECR_REPO
set -euo pipefail

AWS_REGION="${AWS_REGION:-us-east-1}"
ECR_REPO="${ECR_REPO:-eccommerce-app}"
TAG="${1:-latest}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Load AWS credentials from the repo .env if present
if [[ -f "$ROOT_DIR/.env" ]]; then
  set -a; source "$ROOT_DIR/.env"; set +a
fi

ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
REGISTRY="${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
IMAGE="${REGISTRY}/${ECR_REPO}:${TAG}"

# The repository is managed by Terraform (terraform/Modules/backend/ecr.tf); fail early if missing
aws ecr describe-repositories --repository-names "$ECR_REPO" --region "$AWS_REGION" >/dev/null 2>&1 \
  || { echo "ECR repo '$ECR_REPO' not found in $AWS_REGION. Run terraform apply first." >&2; exit 1; }

# Authenticate Docker to ECR
aws ecr get-login-password --region "$AWS_REGION" \
  | docker login --username AWS --password-stdin "$REGISTRY"

# Build (context = backend/) and push.
# --platform linux/amd64 matches Fargate's default x86_64 even when building on ARM.
docker build --platform linux/amd64 \
  -f "$ROOT_DIR/backend/Dockerfile.dev" \
  -t "$IMAGE" \
  "$ROOT_DIR/backend"

docker push "$IMAGE"

echo "Pushed: $IMAGE"
