# Outputs for PayIntelli Academy infrastructure

# API Gateway (HTTP API)
output "api_gateway_url" {
  description = "API Gateway base URL (HTTP API)"
  value       = aws_apigatewayv2_stage.main.invoke_url
}

output "api_gateway_id" {
  description = "API Gateway ID"
  value       = aws_apigatewayv2_api.main.id
}

# RDS
output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint"
  value       = aws_db_instance.main.endpoint
}

output "rds_arn" {
  description = "RDS PostgreSQL ARN"
  value       = aws_db_instance.main.arn
}

# Cognito
output "cognito_user_pool_id" {
  description = "Cognito User Pool ID"
  value       = aws_cognito_user_pool.main.id
}

output "cognito_user_pool_arn" {
  description = "Cognito User Pool ARN"
  value       = aws_cognito_user_pool.main.arn
}

output "cognito_app_client_id" {
  description = "Cognito App Client ID"
  value       = aws_cognito_user_pool_client.main.id
}

output "cognito_domain" {
  description = "Cognito User Pool Domain"
  value       = aws_cognito_user_pool_domain.main.domain
}

# S3
output "materials_bucket" {
  description = "S3 bucket for materials"
  value       = aws_s3_bucket.materials.id
}

output "events_function_arn" {
  description = "Events Lambda function ARN"
  value       = aws_lambda_function.events.arn
}

output "attendance_function_arn" {
  description = "Attendance Lambda function ARN"
  value       = aws_lambda_function.attendance.arn
}

output "polls_function_arn" {
  description = "Polls Lambda function ARN"
  value       = aws_lambda_function.polls.arn
}

output "materials_function_arn" {
  description = "Materials Lambda function ARN"
  value       = aws_lambda_function.materials.arn
}

output "analytics_function_arn" {
  description = "Analytics Lambda function ARN"
  value       = aws_lambda_function.analytics.arn
}
