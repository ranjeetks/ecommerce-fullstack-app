resource "aws_ecr_repository" "eccommerce-app" {
  name                 = var.ecr_repository_name
  image_tag_mutability = "MUTABLE"

  # FASTER / CLEANER DESTROY: without this, `destroy` fails while the repo still holds images
  force_delete = true

  image_scanning_configuration {
    scan_on_push = true
  }
}
