# Terraform

Root modules (`main.tf`): `frontend`, `networking`, `backend`.

## Destroy backend + networking (keep frontend)

```bash
cd terraform
set -a; source ../.env; set +a   # repo .env credentials

# back up local state first
cp terraform.tfstate terraform.tfstate.pre-destroy

# preview
terraform plan -destroy -target=module.backend -target=module.networking

# destroy
terraform destroy -target=module.backend -target=module.networking
```

Terraform prints a `-target` warning; that is expected here.

### Check before running

- **Frontend dependencies:** `-target` does not destroy resources that depend on the targets. If the frontend reads backend outputs (e.g. the ALB DNS name for the CloudFront `/api/*` origin), it is left with a dangling reference. Run a plain `terraform plan` afterwards to see the drift.
- **ECR:** a repository that still holds images fails to delete unless `force_delete = true` (see `Modules/backend/ecr.tf`).
- **RDS:** `deletion_protection = true` or `skip_final_snapshot = false` in `Modules/backend/database.tf` makes the destroy fail or ask for a snapshot name. The database and its data are deleted.
- **Secrets Manager / SSM:** secrets with a recovery window stay scheduled for deletion. Recreating them under the same name right away can fail.
- **State:** state is a local `terraform.tfstate`, so keep the backup above.
