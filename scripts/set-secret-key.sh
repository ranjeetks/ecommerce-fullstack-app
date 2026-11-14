#!/usr/bin/env bash
# Generate a random Django SECRET_KEY and store it in SSM Parameter Store (SecureString).
# The value is never printed or typed, so it stays out of shell history and the terminal.
# Usage: ./scripts/set-secret-key.sh
# Env overrides: AWS_REGION, PARAM_NAME
set -euo pipefail

AWS_REGION="${AWS_REGION:-us-east-1}"
PARAM_NAME="${PARAM_NAME:-/ecommerce/SECRET_KEY}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Load AWS credentials from the repo .env if present
if [[ -f "$ROOT_DIR/.env" ]]; then
  set -a; source "$ROOT_DIR/.env"; set +a
fi

# Pure-stdlib generator (same character set Django uses), so Django need not be installed
SECRET_VALUE="$(python3 -c 'import secrets,string; a=string.ascii_letters+string.digits+"!@#$%^&*(-_=+)"; print("".join(secrets.choice(a) for _ in range(64)))')"

aws ssm put-parameter \
  --name "$PARAM_NAME" \
  --type SecureString \
  --region "$AWS_REGION" \
  --overwrite \
  --value "$SECRET_VALUE" >/dev/null

echo "Stored SecureString $PARAM_NAME in $AWS_REGION"
