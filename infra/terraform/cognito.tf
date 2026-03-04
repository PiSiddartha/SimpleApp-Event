# Cognito User Pool for PayIntelli Academy

# Cognito User Pool
resource "aws_cognito_user_pool" "main" {
  name = var.cognito_pool_name

  # Username attributes
  username_attributes = ["email"]

  # Password policy
  password_policy {
    minimum_length    = 8
    require_uppercase = true
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
  }

  # Auto-verified attributes
  auto_verified_attributes = ["email"]

  # Email configuration
  email_configuration {
    email_sending_account = "COGNITO_DEFAULT"
  }

  # Lambda triggers (optional - for custom workflows)
  # lambda_config {
  #   pre_sign_up = aws_lambda_function.pre_sign_up.arn
  # }

  # Admin create user (disabled for security)
  admin_create_user_config {
    allow_admin_create_user_only = false
  }

  # Device tracking
  device_configuration {
    challenge_required_on_new_device = true
  }

  # Tags
  tags = {
    Name = var.cognito_pool_name
  }
}

# Cognito App Client
resource "aws_cognito_user_pool_client" "main" {
  name                = var.cognito_client_name
  user_pool_id        = aws_cognito_user_pool.main.id

  # OAuth settings
  supported_identity_providers = ["COGNITO"]
  callback_urls            = ["https://app.payintelli.com/callback", "http://localhost:3000/callback"]
  logout_urls             = ["https://app.payintelli.com/logout", "http://localhost:3000/logout"]

  allowed_oauth_flows                  = ["code", "implicit"]
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_scopes                = ["phone", "email", "openid", "profile", "aws.cognito.signin.user.admin"]

  # Token settings (in hours)
  access_token_validity  = 1
  id_token_validity     = 1
  refresh_token_validity = 30

  # Enable token refresh
  enable_token_revocation = true

  # Security
  prevent_user_existence_errors = "ENABLED"
}

# Cognito Identity Pool (for unauthenticated access if needed)
resource "aws_cognito_identity_pool" "main" {
  identity_pool_name               = "${var.project_name}-identity-pool"
  allow_unauthenticated_identities = false

  cognito_identity_providers {
    client_id               = aws_cognito_user_pool_client.main.id
    provider_name           = aws_cognito_user_pool.main.endpoint
    server_side_token_check = false
  }

  tags = {
    Name = "${var.project_name}-identity-pool"
  }
}

# User Pool Domain
resource "aws_cognito_user_pool_domain" "main" {
  domain       = var.project_name
  user_pool_id = aws_cognito_user_pool.main.id
}
