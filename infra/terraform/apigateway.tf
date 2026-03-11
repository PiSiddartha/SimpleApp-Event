# API Gateway HTTP API (v2) for PayIntelli Academy
# HTTP APIs are simpler, cheaper, and use the "HTTP" protocol in the AWS console.

# HTTP API
resource "aws_apigatewayv2_api" "main" {
  name          = "${var.project_name}-api"
  description   = "PayIntelli Academy API Gateway (HTTP API)"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_headers = ["Content-Type", "Authorization"]
  }

  tags = {
    Name = "${var.project_name}-api"
  }
}

# JWT Authorizer (Cognito User Pool)
resource "aws_apigatewayv2_authorizer" "cognito" {
  api_id           = aws_apigatewayv2_api.main.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]
  name             = "${var.project_name}-cognito-authorizer"

  jwt_configuration {
    audience = [aws_cognito_user_pool_client.main.id]
    issuer   = "https://cognito-idp.${var.aws_region}.amazonaws.com/${aws_cognito_user_pool.main.id}"
  }
}

# Lambda integrations (one per Lambda)
resource "aws_apigatewayv2_integration" "events" {
  api_id                 = aws_apigatewayv2_api.main.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.events.invoke_arn
  payload_format_version = "1.0"
}

resource "aws_apigatewayv2_integration" "attendance" {
  api_id                 = aws_apigatewayv2_api.main.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.attendance.invoke_arn
  payload_format_version = "1.0"
}

resource "aws_apigatewayv2_integration" "polls" {
  api_id                 = aws_apigatewayv2_api.main.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.polls.invoke_arn
  payload_format_version = "1.0"
}

resource "aws_apigatewayv2_integration" "materials" {
  api_id                 = aws_apigatewayv2_api.main.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.materials.invoke_arn
  payload_format_version = "1.0"
}

resource "aws_apigatewayv2_integration" "analytics" {
  api_id                 = aws_apigatewayv2_api.main.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.analytics.invoke_arn
  payload_format_version = "1.0"
}

resource "aws_apigatewayv2_integration" "users" {
  api_id                 = aws_apigatewayv2_api.main.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.users.invoke_arn
  payload_format_version = "1.0"
}

# ==================== ROUTES ====================
# Events
resource "aws_apigatewayv2_route" "events_post" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "POST /events"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
  target             = "integrations/${aws_apigatewayv2_integration.events.id}"
}

resource "aws_apigatewayv2_route" "events_get" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "GET /events"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
  target             = "integrations/${aws_apigatewayv2_integration.events.id}"
}

resource "aws_apigatewayv2_route" "events_id_get" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "GET /events/{event_id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
  target             = "integrations/${aws_apigatewayv2_integration.events.id}"
}

resource "aws_apigatewayv2_route" "events_id_put" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "PUT /events/{event_id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
  target             = "integrations/${aws_apigatewayv2_integration.events.id}"
}

resource "aws_apigatewayv2_route" "events_id_delete" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "DELETE /events/{event_id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
  target             = "integrations/${aws_apigatewayv2_integration.events.id}"
}

resource "aws_apigatewayv2_route" "events_join_post" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "POST /events/{event_id}/join"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
  target             = "integrations/${aws_apigatewayv2_integration.attendance.id}"
}

resource "aws_apigatewayv2_route" "events_analytics_get" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "GET /events/{event_id}/analytics"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
  target             = "integrations/${aws_apigatewayv2_integration.analytics.id}"
}

# Polls
resource "aws_apigatewayv2_route" "polls_post" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "POST /polls"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
  target             = "integrations/${aws_apigatewayv2_integration.polls.id}"
}

resource "aws_apigatewayv2_route" "polls_get" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "GET /polls"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
  target             = "integrations/${aws_apigatewayv2_integration.polls.id}"
}

resource "aws_apigatewayv2_route" "polls_id_get" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "GET /polls/{poll_id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
  target             = "integrations/${aws_apigatewayv2_integration.polls.id}"
}

resource "aws_apigatewayv2_route" "polls_vote_post" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "POST /polls/{poll_id}/vote"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
  target             = "integrations/${aws_apigatewayv2_integration.polls.id}"
}

resource "aws_apigatewayv2_route" "polls_results_get" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "GET /polls/{poll_id}/results"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
  target             = "integrations/${aws_apigatewayv2_integration.polls.id}"
}

resource "aws_apigatewayv2_route" "polls_id_put" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "PUT /polls/{poll_id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
  target             = "integrations/${aws_apigatewayv2_integration.polls.id}"
}

resource "aws_apigatewayv2_route" "polls_id_delete" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "DELETE /polls/{poll_id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
  target             = "integrations/${aws_apigatewayv2_integration.polls.id}"
}

# Materials
resource "aws_apigatewayv2_route" "materials_post" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "POST /materials"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
  target             = "integrations/${aws_apigatewayv2_integration.materials.id}"
}

resource "aws_apigatewayv2_route" "materials_get" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "GET /materials"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
  target             = "integrations/${aws_apigatewayv2_integration.materials.id}"
}

resource "aws_apigatewayv2_route" "materials_download_post" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "POST /materials/{material_id}/download"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
  target             = "integrations/${aws_apigatewayv2_integration.materials.id}"
}

resource "aws_apigatewayv2_route" "materials_id_get" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "GET /materials/{material_id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
  target             = "integrations/${aws_apigatewayv2_integration.materials.id}"
}

# Analytics (overview and student - if routed via same path pattern)
resource "aws_apigatewayv2_route" "analytics_overview_get" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "GET /analytics/overview"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
  target             = "integrations/${aws_apigatewayv2_integration.analytics.id}"
}

resource "aws_apigatewayv2_route" "analytics_student_get" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "GET /analytics/student/{student_id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
  target             = "integrations/${aws_apigatewayv2_integration.analytics.id}"
}

# Attendance list and event attendance
resource "aws_apigatewayv2_route" "attendance_get" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "GET /attendance"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
  target             = "integrations/${aws_apigatewayv2_integration.attendance.id}"
}

resource "aws_apigatewayv2_route" "attendance_event_get" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "GET /attendance/event/{event_id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
  target             = "integrations/${aws_apigatewayv2_integration.attendance.id}"
}

# Materials delete (GET /materials with event_id is list; we need DELETE /materials/{material_id})
resource "aws_apigatewayv2_route" "materials_id_delete" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "DELETE /materials/{material_id}"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
  target             = "integrations/${aws_apigatewayv2_integration.materials.id}"
}

# User management
resource "aws_apigatewayv2_route" "admin_users_get" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "GET /admin-users"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
  target             = "integrations/${aws_apigatewayv2_integration.users.id}"
}

resource "aws_apigatewayv2_route" "admin_users_post" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "POST /admin-users"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
  target             = "integrations/${aws_apigatewayv2_integration.users.id}"
}

resource "aws_apigatewayv2_route" "users_get" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "GET /users"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
  target             = "integrations/${aws_apigatewayv2_integration.users.id}"
}

resource "aws_apigatewayv2_route" "users_me_get" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "GET /users/me"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
  target             = "integrations/${aws_apigatewayv2_integration.users.id}"
}

# PUT /users/me – profile update (auth required)
resource "aws_apigatewayv2_route" "users_me_put" {
  api_id             = aws_apigatewayv2_api.main.id
  route_key          = "PUT /users/me"
  authorization_type = "JWT"
  authorizer_id      = aws_apigatewayv2_authorizer.cognito.id
  target             = "integrations/${aws_apigatewayv2_integration.users.id}"
}

# Default stage ($default = no stage prefix in URL; path is /events not /v1/events)
resource "aws_apigatewayv2_stage" "main" {
  api_id      = aws_apigatewayv2_api.main.id
  name        = "$default"
  auto_deploy = true

  default_route_settings {
    throttling_rate_limit  = 1000
    throttling_burst_limit = 5000
  }

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gateway.arn
    format = jsonencode({
      requestId      = "$context.requestId"
      ip             = "$context.identity.sourceIp"
      requestTime    = "$context.requestTime"
      httpMethod     = "$context.httpMethod"
      routeKey       = "$context.routeKey"
      status         = "$context.status"
      protocol       = "$context.protocol"
      responseLength = "$context.responseLength"
      integrationErr = "$context.integrationErrorMessage"
      errorMessage   = "$context.error.message"
    })
  }

  tags = {
    Name = "${var.project_name}-api-stage"
  }
}

# CloudWatch Log Group for API Gateway (optional; HTTP API can log to CloudWatch)
resource "aws_cloudwatch_log_group" "api_gateway" {
  name              = "/aws/apigateway/${var.project_name}"
  retention_in_days = 7

  tags = {
    Name = "${var.project_name}-api-gateway-logs"
  }
}
