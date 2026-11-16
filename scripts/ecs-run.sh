#!/usr/bin/env bash
# Run a one-off command in the backend container, either in a shell inside the running task
# (ECS Exec) – handy for `manage.py createsuperuser` or `manage.py shell`.
#
# Usage:  ./scripts/ecs-run.sh                                   # interactive bash
#         ./scripts/ecs-run.sh python manage.py createsuperuser  # any command
# Env overrides: AWS_REGION, ECS_CLUSTER, ECS_SERVICE, CONTAINER
set -euo pipefail

AWS_REGION="${AWS_REGION:-us-east-1}"
ECS_CLUSTER="${ECS_CLUSTER:-ecommerce-app}"
ECS_SERVICE="${ECS_SERVICE:-ecommerce-backend}"
CONTAINER="${CONTAINER:-backend-container}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if [[ -f "$ROOT_DIR/.env" ]]; then
  set -a; source "$ROOT_DIR/.env"; set +a
fi

TASK=$(aws ecs list-tasks --region "$AWS_REGION" --cluster "$ECS_CLUSTER" \
  --service-name "$ECS_SERVICE" --desired-status RUNNING \
  --query 'taskArns[0]' --output text | awk -F/ '{print $NF}')
if [[ -z "$TASK" || "$TASK" == "None" ]]; then
  echo "No running task in $ECS_CLUSTER/$ECS_SERVICE" >&2; exit 1
fi

CMD="${*:-bash}"
exec aws ecs execute-command --region "$AWS_REGION" --cluster "$ECS_CLUSTER" \
  --task "$TASK" --container "$CONTAINER" --interactive --command "$CMD"
