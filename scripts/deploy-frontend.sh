#!/usr/bin/env bash
# Build the React frontend and publish it to the S3 bucket behind CloudFront.
#
# WHEN TO RUN THIS
#   After ANY change under frontend/ (the live site only serves the built files in S3).
#   No ECS redeploy is needed: the backend is a separate container.
#
# WHAT IT DOES
#   1. npm run build            -> frontend/dist
#   2. aws s3 sync --delete     -> uploads dist/, removes files that are no longer in the build
#   3. cloudfront invalidation  -> CloudFront caches files at the edge; without this you may keep
#                                  seeing the old version for hours
#
# NOTE: VITE_API_BASE_URL is intentionally NOT set. The browser calls /api on the same domain and
#       CloudFront forwards /api/* to the ALB (see terraform/Modules/frontend/cloudfront.tf).
#
# Usage: ./scripts/deploy-frontend.sh
# Env overrides: AWS_REGION, S3_BUCKET, CF_ALIAS (domain used to look up the distribution)
set -euo pipefail

AWS_REGION="${AWS_REGION:-us-east-1}"
S3_BUCKET="${S3_BUCKET:-ecommerce-app-s3-bucket-2026}"
CF_ALIAS="${CF_ALIAS:-eshop.devops-pro.me}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_DIR="$ROOT_DIR/frontend"

# Load AWS credentials from the repo .env if present
if [[ -f "$ROOT_DIR/.env" ]]; then
  set -a; source "$ROOT_DIR/.env"; set +a
fi

# Fail early if the bucket does not exist (it is created by terraform/Modules/frontend/s3.tf)
aws s3api head-bucket --bucket "$S3_BUCKET" --region "$AWS_REGION" 2>/dev/null \
  || { echo "Bucket '$S3_BUCKET' not found or not accessible. Run terraform apply first." >&2; exit 1; }

# Look up the CloudFront distribution by its custom domain (no need to copy the ID by hand)
DISTRIBUTION_ID="$(aws cloudfront list-distributions \
  --query "DistributionList.Items[?Aliases.Items && contains(Aliases.Items, '${CF_ALIAS}')].Id | [0]" \
  --output text)"
if [[ -z "$DISTRIBUTION_ID" || "$DISTRIBUTION_ID" == "None" ]]; then
  echo "No CloudFront distribution found for alias '$CF_ALIAS'. Run terraform apply first." >&2
  exit 1
fi

# 1. Build
cd "$FRONTEND_DIR"
if [[ ! -d node_modules ]]; then
  npm ci
fi
npm run build

# 2. Upload (--delete removes old hashed files such as index-<oldhash>.js)
aws s3 sync "$FRONTEND_DIR/dist/" "s3://${S3_BUCKET}/" --delete --region "$AWS_REGION"

# 3. Invalidate the CloudFront cache so visitors get the new files
INVALIDATION_ID="$(aws cloudfront create-invalidation \
  --distribution-id "$DISTRIBUTION_ID" \
  --paths "/*" \
  --query 'Invalidation.Id' --output text)"

echo "Deployed to s3://${S3_BUCKET} and started invalidation ${INVALIDATION_ID} on ${DISTRIBUTION_ID}."
echo "It takes a minute or two. Then hard-refresh (Ctrl+Shift+R) https://${CF_ALIAS}"
