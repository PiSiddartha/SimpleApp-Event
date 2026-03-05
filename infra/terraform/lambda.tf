# Lambda Functions for PayIntelli Academy
#
# Lambda deployment packages (lambdas/*.zip) are built by scripts/build_lambdas.sh.
# Terraform runs that script automatically before creating/updating Lambdas so
# that each zip contains: that Lambda's code + shared/ + requirements.txt deps.

resource "null_resource" "build_lambdas" {
  # Run build before any Lambda is created/updated. Change this value to force a rebuild.
  triggers = {
    run_build = var.lambda_build_trigger
  }

  provisioner "local-exec" {
    command     = "bash ${path.module}/../../scripts/build_lambdas.sh"
    working_dir = path.module
  }
}

# Common environment variables for all lambdas
locals {
  # AWS_REGION is reserved by Lambda and set automatically; do not add it here.
  lambda_env = {
    DB_HOST                = aws_db_instance.main.address
    DB_PORT                = "5432"
    DB_NAME                = var.db_name
    DB_USER                = var.db_username
    DB_PASSWORD            = var.db_password
    S3_MATERIALS_BUCKET    = aws_s3_bucket.materials.id
    COGNITO_USER_POOL_ID   = aws_cognito_user_pool.main.id
    COGNITO_APP_CLIENT_ID  = aws_cognito_user_pool_client.main.id
    CORS_ORIGIN            = "*"
  }
}

# Events Lambda
resource "aws_lambda_function" "events" {
  filename      = "../../lambdas/events.zip"
  function_name = "${var.project_name}-events"
  role         = aws_iam_role.lambda_exec.arn
  runtime      = var.python_runtime
  handler      = "events.handler.handler"

  timeout   = var.lambda_timeout
  memory_size = var.lambda_memory_size

  environment {
    variables = local.lambda_env
  }

  depends_on = [
    null_resource.build_lambdas,
    aws_iam_role_policy_attachment.lambda_basic,
    aws_iam_role_policy_attachment.lambda_rds,
    aws_iam_role_policy_attachment.lambda_secrets,
    aws_iam_role_policy_attachment.lambda_vpc
  ]

  # VPC configuration for RDS access
  vpc_config {
    subnet_ids         = ["${var.private_subnet_1_id}", "${var.private_subnet_2_id}"]
    security_group_ids = [aws_security_group.lambda.id]
  }
}

# Attendance Lambda
resource "aws_lambda_function" "attendance" {
  filename      = "../../lambdas/attendance.zip"
  function_name = "${var.project_name}-attendance"
  role         = aws_iam_role.lambda_exec.arn
  runtime      = var.python_runtime
  handler      = "attendance.handler.handler"

  timeout   = var.lambda_timeout
  memory_size = var.lambda_memory_size

  environment {
    variables = local.lambda_env
  }

  depends_on = [
    null_resource.build_lambdas,
    aws_iam_role_policy_attachment.lambda_basic,
    aws_iam_role_policy_attachment.lambda_rds,
    aws_iam_role_policy_attachment.lambda_secrets,
    aws_iam_role_policy_attachment.lambda_vpc
  ]

  vpc_config {
    subnet_ids         = ["${var.private_subnet_1_id}", "${var.private_subnet_2_id}"]
    security_group_ids = [aws_security_group.lambda.id]
  }
}

# Polls Lambda
resource "aws_lambda_function" "polls" {
  filename      = "../../lambdas/polls.zip"
  function_name = "${var.project_name}-polls"
  role         = aws_iam_role.lambda_exec.arn
  runtime      = var.python_runtime
  handler      = "polls.handler.handler"

  timeout   = var.lambda_timeout
  memory_size = var.lambda_memory_size

  environment {
    variables = local.lambda_env
  }

  depends_on = [
    null_resource.build_lambdas,
    aws_iam_role_policy_attachment.lambda_basic,
    aws_iam_role_policy_attachment.lambda_rds,
    aws_iam_role_policy_attachment.lambda_secrets,
    aws_iam_role_policy_attachment.lambda_vpc
  ]

  vpc_config {
    subnet_ids         = ["${var.private_subnet_1_id}", "${var.private_subnet_2_id}"]
    security_group_ids = [aws_security_group.lambda.id]
  }
}

# Materials Lambda
resource "aws_lambda_function" "materials" {
  filename      = "../../lambdas/materials.zip"
  function_name = "${var.project_name}-materials"
  role         = aws_iam_role.lambda_exec.arn
  runtime      = var.python_runtime
  handler      = "materials.handler.handler"

  timeout   = var.lambda_timeout
  memory_size = var.lambda_memory_size

  environment {
    variables = local.lambda_env
  }

  depends_on = [
    null_resource.build_lambdas,
    aws_iam_role_policy_attachment.lambda_basic,
    aws_iam_role_policy_attachment.lambda_rds,
    aws_iam_role_policy_attachment.lambda_secrets,
    aws_iam_role_policy_attachment.lambda_s3,
    aws_iam_role_policy_attachment.lambda_vpc
  ]

  vpc_config {
    subnet_ids         = ["${var.private_subnet_1_id}", "${var.private_subnet_2_id}"]
    security_group_ids = [aws_security_group.lambda.id]
  }
}

# Analytics Lambda
resource "aws_lambda_function" "analytics" {
  filename      = "../../lambdas/analytics.zip"
  function_name = "${var.project_name}-analytics"
  role         = aws_iam_role.lambda_exec.arn
  runtime      = var.python_runtime
  handler      = "analytics.handler.handler"

  timeout   = var.lambda_timeout
  memory_size = var.lambda_memory_size

  environment {
    variables = local.lambda_env
  }

  depends_on = [
    null_resource.build_lambdas,
    aws_iam_role_policy_attachment.lambda_basic,
    aws_iam_role_policy_attachment.lambda_rds,
    aws_iam_role_policy_attachment.lambda_secrets,
    aws_iam_role_policy_attachment.lambda_vpc
  ]

  vpc_config {
    subnet_ids         = ["${var.private_subnet_1_id}", "${var.private_subnet_2_id}"]
    security_group_ids = [aws_security_group.lambda.id]
  }
}

# Lambda Security Group
resource "aws_security_group" "lambda" {
  name        = "${var.project_name}-lambda-sg"
  description = "Security group for Lambda functions"
  vpc_id      = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-lambda-sg"
  }
}

# Lambda permissions for API Gateway HTTP API
resource "aws_lambda_permission" "api_events" {
  statement_id           = "AllowExecutionFromAPIGateway"
  action                 = "lambda:InvokeFunction"
  function_name          = aws_lambda_function.events.function_name
  principal              = "apigateway.amazonaws.com"
  source_arn             = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "api_attendance" {
  statement_id           = "AllowExecutionFromAPIGateway"
  action                 = "lambda:InvokeFunction"
  function_name          = aws_lambda_function.attendance.function_name
  principal              = "apigateway.amazonaws.com"
  source_arn             = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "api_polls" {
  statement_id           = "AllowExecutionFromAPIGateway"
  action                 = "lambda:InvokeFunction"
  function_name          = aws_lambda_function.polls.function_name
  principal              = "apigateway.amazonaws.com"
  source_arn             = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "api_materials" {
  statement_id           = "AllowExecutionFromAPIGateway"
  action                 = "lambda:InvokeFunction"
  function_name          = aws_lambda_function.materials.function_name
  principal              = "apigateway.amazonaws.com"
  source_arn             = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "api_analytics" {
  statement_id           = "AllowExecutionFromAPIGateway"
  action                 = "lambda:InvokeFunction"
  function_name          = aws_lambda_function.analytics.function_name
  principal              = "apigateway.amazonaws.com"
  source_arn             = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}
