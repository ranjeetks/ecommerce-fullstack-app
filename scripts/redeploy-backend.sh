#!/usr/bin/env bash
# Force ECS to replace the running backend tasks with fresh ones.
#
# WHEN TO RUN THIS
#   Run it when something changed that Terraform cannot see, because ECS only reads the
#   image and the secrets at task START and running tasks never refresh them:
#     - you pushed a new image under the same tag (e.g. ./scripts/push-backend-to-ecr.sh -> :latest)
#     - you changed an SSM / Secrets Manager value (e.g. ./scripts/set-secret-key.sh)
#
# WHEN YOU DO NOT NEED IT
#   - After editing Terraform (task definition, env vars, CPU/memory): `terraform apply` creates a
#     new task definition revision and rolls it out by itself.
#   - When a task crashed: the ECS service restarts it automatically.
#
# Usage: ./scripts/redeploy-backend.sh
# Env overrides: AWS_REGION, ECS_CLUSTER, ECS_SERVICE
set -euo pipefail

AWS_REGION="${AWS_REGION:-us-east-1}"
ECS_CLUSTER="${ECS_CLUSTER:-ecommerce-app}"
ECS_SERVICE="${ECS_SERVICE:-ecommerce-backend}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Load AWS credentials from the repo .env if present
if [[ -f "$ROOT_DIR/.env" ]]; then
  set -a; source "$ROOT_DIR/.env"; set +a
fi

aws ecs update-service \
  --cluster "$ECS_CLUSTER" \
  --service "$ECS_SERVICE" \
  --force-new-deployment \
  --region "$AWS_REGION" >/dev/null

echo "Redeploy started for $ECS_SERVICE in cluster $ECS_CLUSTER."
echo "Watch it:  aws logs tail /aws/ecs/ecommerce-backend/backend-container --follow --region $AWS_REGION"
