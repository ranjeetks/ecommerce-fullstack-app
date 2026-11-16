#!/usr/bin/env bash
# Open an SSM port-forward from localhost to the private RDS database, through the running
# backend Fargate task (ECS Exec). Then connect any Postgres client (VS Code PostgreSQL
# extension, DBeaver, psql) to localhost:$LOCAL_PORT.
#
# Usage:  ./scripts/db-tunnel.sh            # start the tunnel (keep this terminal open)
#         ./scripts/db-tunnel.sh --password # only print the DB master password
# Env overrides: AWS_REGION, ECS_CLUSTER, ECS_SERVICE, CONTAINER, DB_IDENTIFIER, LOCAL_PORT
#
# Needs: aws cli, session-manager-plugin, and enable_execute_command = true on the ECS service.
set -euo pipefail

AWS_REGION="${AWS_REGION:-us-east-1}"
ECS_CLUSTER="${ECS_CLUSTER:-ecommerce-app}"
ECS_SERVICE="${ECS_SERVICE:-ecommerce-backend}"
CONTAINER="${CONTAINER:-backend-container}"
DB_IDENTIFIER="${DB_IDENTIFIER:-ecommerce-db}"
LOCAL_PORT="${LOCAL_PORT:-5433}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if [[ -f "$ROOT_DIR/.env" ]]; then
  set -a; source "$ROOT_DIR/.env"; set +a
fi

db_password() {
  local secret_arn
  secret_arn=$(aws rds describe-db-instances --region "$AWS_REGION" \
    --db-instance-identifier "$DB_IDENTIFIER" \
    --query 'DBInstances[0].MasterUserSecret.SecretArn' --output text)
  aws secretsmanager get-secret-value --region "$AWS_REGION" --secret-id "$secret_arn" \
    --query SecretString --output text | python3 -c 'import sys,json; print(json.load(sys.stdin)["password"])'
}

if [[ "${1:-}" == "--password" ]]; then
  db_password
  exit 0
fi

command -v session-manager-plugin >/dev/null || { echo "session-manager-plugin not installed" >&2; exit 1; }

TASK=$(aws ecs list-tasks --region "$AWS_REGION" --cluster "$ECS_CLUSTER" \
  --service-name "$ECS_SERVICE" --desired-status RUNNING \
  --query 'taskArns[0]' --output text | awk -F/ '{print $NF}')
if [[ -z "$TASK" || "$TASK" == "None" ]]; then
  echo "No running task in $ECS_CLUSTER/$ECS_SERVICE" >&2; exit 1
fi

RUNTIME=$(aws ecs describe-tasks --region "$AWS_REGION" --cluster "$ECS_CLUSTER" --tasks "$TASK" \
  --query "tasks[0].containers[?name=='$CONTAINER'].runtimeId | [0]" --output text)

DB_HOST=$(aws rds describe-db-instances --region "$AWS_REGION" \
  --db-instance-identifier "$DB_IDENTIFIER" \
  --query 'DBInstances[0].Endpoint.Address' --output text)

cat <<EOF
Tunnel: localhost:$LOCAL_PORT -> $DB_HOST:5432 via task $TASK
Connect with:
  host=localhost  port=$LOCAL_PORT  db=ecommercedb  user=ecommerce_admin  sslmode=require
  password: run  ./scripts/db-tunnel.sh --password
Ctrl+C to stop.
EOF

exec aws ssm start-session --region "$AWS_REGION" \
  --target "ecs:${ECS_CLUSTER}_${TASK}_${RUNTIME}" \
  --document-name AWS-StartPortForwardingSessionToRemoteHost \
  --parameters "{\"host\":[\"$DB_HOST\"],\"portNumber\":[\"5432\"],\"localPortNumber\":[\"$LOCAL_PORT\"]}"
