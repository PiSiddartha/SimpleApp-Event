# API Gateway for PayIntelli Academy

# API Gateway REST API
resource "aws_api_gateway_rest_api" "main" {
  name        = "${var.project_name}-api"
  description = "PayIntelli Academy API Gateway"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = {
    Name = "${var.project_name}-api"
  }
}

# API Gateway Usage Plan
resource "aws_api_gateway_usage_plan" "main" {
  name = "${var.project_name}-usage-plan"

  quota_settings {
    limit  = 1000000
    period = "MONTH"
  }

  throttle_settings {
    burst_limit = 5000
    rate_limit  = 1000
  }

  tags = {
    Name = "${var.project_name}-usage-plan"
  }
}

# API Gateway API Key
resource "aws_api_gateway_api_key" "main" {
  name = "${var.project_name}-api-key"

  tags = {
    Name = "${var.project_name}-api-key"
  }
}

# Link API key to usage plan
resource "aws_api_gateway_usage_plan_key" "main" {
  key_id        = aws_api_gateway_api_key.main.id
  key_type      = "API_KEY"
  usage_plan_id = aws_api_gateway_usage_plan.main.id
}

# Cognito Authorizer
resource "aws_api_gateway_authorizer" "cognito" {
  name                   = "${var.project_name}-cognito-authorizer"
  rest_api_id           = aws_api_gateway_rest_api.main.id
  authorizer_credentials = aws_iam_role.api_gateway_authorizer.arn
  type                   = "COGNITO_USER_POOLS"
  identity_source        = "method.request.header.Authorization"
  provider_arns          = [aws_cognito_user_pool.main.arn]
}

# IAM role for API Gateway authorizer
resource "aws_iam_role" "api_gateway_authorizer" {
  name = "${var.project_name}-api-gateway-authorizer"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "apigateway.amazonaws.com"
        }
      }
    ]
  })
}

# ==================== EVENTS ====================

# POST /events
resource "aws_api_gateway_method" "events_post" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.events.id
  http_method   = "POST"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

# GET /events
resource "aws_api_gateway_method" "events_get" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.events.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

# GET /events/{event_id}
resource "aws_api_gateway_method" "events_id_get" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.events_id.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

# PUT /events/{event_id}
resource "aws_api_gateway_method" "events_id_put" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.events_id.id
  http_method   = "PUT"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

# DELETE /events/{event_id}
resource "aws_api_gateway_method" "events_id_delete" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.events_id.id
  http_method   = "DELETE"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

# POST /events/{event_id}/join
resource "aws_api_gateway_method" "events_join_post" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.events_join.id
  http_method   = "POST"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

# GET /events/{event_id}/analytics
resource "aws_api_gateway_method" "events_analytics_get" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.events_analytics.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

# ==================== POLLS ====================

# POST /polls
resource "aws_api_gateway_method" "polls_post" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.polls.id
  http_method   = "POST"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

# GET /polls
resource "aws_api_gateway_method" "polls_get" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.polls.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

# POST /polls/{poll_id}/vote
resource "aws_api_gateway_method" "polls_vote_post" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.polls_vote.id
  http_method   = "POST"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

# GET /polls/{poll_id}/results
resource "aws_api_gateway_method" "polls_results_get" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.polls_results.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

# ==================== MATERIALS ====================

# POST /materials
resource "aws_api_gateway_method" "materials_post" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.materials.id
  http_method   = "POST"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

# GET /materials
resource "aws_api_gateway_method" "materials_get" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.materials.id
  http_method   = "GET"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

# POST /materials/{material_id}/download
resource "aws_api_gateway_method" "materials_download_post" {
  rest_api_id   = aws_api_gateway_rest_api.main.id
  resource_id   = aws_api_gateway_resource.materials_download.id
  http_method   = "POST"
  authorization = "COGNITO_USER_POOLS"
  authorizer_id = aws_api_gateway_authorizer.cognito.id
}

# ==================== API GATEWAY RESOURCES ====================

# /events resource
resource "aws_api_gateway_resource" "events" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "events"
}

# /events/{event_id} resource
resource "aws_api_gateway_resource" "events_id" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.events.id
  path_part   = "{event_id}"
}

# /events/{event_id}/join resource
resource "aws_api_gateway_resource" "events_join" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.events_id.id
  path_part   = "join"
}

# /events/{event_id}/analytics resource
resource "aws_api_gateway_resource" "events_analytics" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.events_id.id
  path_part   = "analytics"
}

# /polls resource
resource "aws_api_gateway_resource" "polls" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "polls"
}

# /polls/{poll_id}/vote resource
resource "aws_api_gateway_resource" "polls_vote" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.polls.id
  path_part   = "{poll_id}/vote"
}

# /polls/{poll_id}/results resource
resource "aws_api_gateway_resource" "polls_results" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.polls.id
  path_part   = "{poll_id}/results"
}

# /materials resource
resource "aws_api_gateway_resource" "materials" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_rest_api.main.root_resource_id
  path_part   = "materials"
}

# /materials/{material_id}/download resource
resource "aws_api_gateway_resource" "materials_download" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  parent_id   = aws_api_gateway_resource.materials.id
  path_part   = "{material_id}/download"
}

# ==================== LAMBDA INTEGRATIONS ====================

# Events Lambda integration
resource "aws_api_gateway_integration" "events_lambda" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.events.id
  http_method = aws_api_gateway_method.events_post.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.events.invoke_arn
}

resource "aws_api_gateway_integration" "events_get_lambda" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.events.id
  http_method = aws_api_gateway_method.events_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.events.invoke_arn
}

resource "aws_api_gateway_integration" "events_id_lambda" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.events_id.id
  http_method = aws_api_gateway_method.events_id_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.events.invoke_arn
}

resource "aws_api_gateway_integration" "events_id_put_lambda" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.events_id.id
  http_method = aws_api_gateway_method.events_id_put.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.events.invoke_arn
}

resource "aws_api_gateway_integration" "events_id_delete_lambda" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.events_id.id
  http_method = aws_api_gateway_method.events_id_delete.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.events.invoke_arn
}

# Attendance Lambda integration
resource "aws_api_gateway_integration" "events_join_lambda" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.events_join.id
  http_method = aws_api_gateway_method.events_join_post.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.attendance.invoke_arn
}

# Analytics Lambda integration
resource "aws_api_gateway_integration" "events_analytics_lambda" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.events_analytics.id
  http_method = aws_api_gateway_method.events_analytics_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.analytics.invoke_arn
}

# Polls Lambda integrations
resource "aws_api_gateway_integration" "polls_lambda" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.polls.id
  http_method = aws_api_gateway_method.polls_post.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.polls.invoke_arn
}

resource "aws_api_gateway_integration" "polls_get_lambda" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.polls.id
  http_method = aws_api_gateway_method.polls_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.polls.invoke_arn
}

resource "aws_api_gateway_integration" "polls_vote_lambda" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.polls_vote.id
  http_method = aws_api_gateway_method.polls_vote_post.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.polls.invoke_arn
}

resource "aws_api_gateway_integration" "polls_results_lambda" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.polls_results.id
  http_method = aws_api_gateway_method.polls_results_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.polls.invoke_arn
}

# Materials Lambda integrations
resource "aws_api_gateway_integration" "materials_lambda" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.materials.id
  http_method = aws_api_gateway_method.materials_post.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.materials.invoke_arn
}

resource "aws_api_gateway_integration" "materials_get_lambda" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.materials.id
  http_method = aws_api_gateway_method.materials_get.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.materials.invoke_arn
}

resource "aws_api_gateway_integration" "materials_download_lambda" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  resource_id = aws_api_gateway_resource.materials_download.id
  http_method = aws_api_gateway_method.materials_download_post.http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.materials.invoke_arn
}

# API Gateway Deployment
resource "aws_api_gateway_deployment" "main" {
  rest_api_id = aws_api_gateway_rest_api.main.id

  depends_on = [
    aws_api_gateway_integration.events_lambda,
    aws_api_gateway_integration.events_get_lambda,
    aws_api_gateway_integration.events_id_lambda,
    aws_api_gateway_integration.events_join_lambda,
    aws_api_gateway_integration.events_analytics_lambda,
    aws_api_gateway_integration.polls_lambda,
    aws_api_gateway_integration.polls_vote_lambda,
    aws_api_gateway_integration.materials_lambda,
  ]

  lifecycle {
    create_before_destroy = true
  }
}

# API Gateway Stage
resource "aws_api_gateway_stage" "main" {
  deployment_id = aws_api_gateway_deployment.main.id
  rest_api_id   = aws_api_gateway_rest_api.main.id
  stage_name    = "v1"

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gateway.arn
    format          = "$context.requestId: $context.httpMethod $context.path $context.status $context.responseLatency"
  }
}

# CloudWatch Log Group for API Gateway
resource "aws_cloudwatch_log_group" "api_gateway" {
  name              = "/aws/apigateway/${var.project_name}"
  retention_in_days = 7

  tags = {
    Name = "${var.project_name}-api-gateway-logs"
  }
}

# Link usage plan to stage
resource "aws_api_gateway_method_settings" "main" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  stage_name  = aws_api_gateway_stage.main.stage_name
  method_path = "*/*"

  settings {
    throttling_rate_limit  = 1000
    throttling_burst_limit = 5000
    caching_enabled        = false
  }
}
