# IAM Roles and Policies for Lambda Functions

# Lambda Execution Role
resource "aws_iam_role" "lambda_exec" {
  name = "${var.project_name}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

# Lambda Basic Execution Policy
resource "aws_iam_policy" "lambda_basic" {
  name = "${var.project_name}-lambda-basic"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect = "Allow"
        Action = [
          "ec2:CreateNetworkInterface",
          "ec2:DescribeNetworkInterfaces",
          "ec2:DeleteNetworkInterface"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = aws_iam_policy.lambda_basic.arn
}

# RDS Access Policy
resource "aws_iam_policy" "lambda_rds" {
  name = "${var.project_name}-lambda-rds"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "rds:DescribeDBInstances",
          "rds:Connect"
        ]
        Resource = aws_db_instance.main.arn
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_rds" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = aws_iam_policy.lambda_rds.arn
}

# Secrets Manager Access Policy
resource "aws_iam_policy" "lambda_secrets" {
  name = "${var.project_name}-lambda-secrets"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue",
          "secretsmanager:DescribeSecret"
        ]
        Resource = aws_secretsmanager_secret.db_credentials.arn
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_secrets" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = aws_iam_policy.lambda_secrets.arn
}

# S3 Access Policy
resource "aws_iam_policy" "lambda_s3" {
  name = "${var.project_name}-lambda-s3"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          aws_s3_bucket.materials.arn,
          "${aws_s3_bucket.materials.arn}/*"
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_s3" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = aws_iam_policy.lambda_s3.arn
}

# Cognito Access Policy
resource "aws_iam_policy" "lambda_cognito" {
  name = "${var.project_name}-lambda-cognito"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "cognito-idp:DescribeUserPool",
          "cognito-idp:DescribeUserPoolClient",
          "cognito-idp:ListUsers",
          "cognito-idp:ListUsersInGroup",
          "cognito-idp:AdminListGroupsForUser",
          "cognito-idp:AdminCreateUser",
          "cognito-idp:AdminAddUserToGroup"
        ]
        Resource = aws_cognito_user_pool.main.arn
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_cognito" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = aws_iam_policy.lambda_cognito.arn
}

# VPC Access Policy (for RDS in private subnet)
resource "aws_iam_policy" "lambda_vpc" {
  name = "${var.project_name}-lambda-vpc"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ec2:CreateNetworkInterface",
          "ec2:DescribeNetworkInterfaces",
          "ec2:DeleteNetworkInterface",
          "ec2:DescribeVpcs",
          "ec2:DescribeSubnets",
          "ec2:DescribeSecurityGroups"
        ]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_vpc" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = aws_iam_policy.lambda_vpc.arn
}

# Output IAM role ARN
output "lambda_role_arn" {
  value = aws_iam_role.lambda_exec.arn
}
