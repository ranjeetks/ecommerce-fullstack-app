resource "aws_ssm_parameter" "secret_key" {
  name  = "/ecommerce/SECRET_KEY"
  type  = "SecureString"
  value = "placeholder"
  lifecycle { ignore_changes = [value] }
}
# after destroying all resurces, run the script to create the new parameter with a new value