# Variables for PayIntelli Academy infrastructure

variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "payintelli"
}

# Database variables
variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "RDS allocated storage in GB"
  type        = number
  default     = 20
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "payintelli"
}

variable "db_username" {
  description = "Database master username"
  type        = string
  default     = "payintelli_admin"
}

# Cognito variables
variable "cognito_pool_name" {
  description = "Cognito User Pool name"
  type        = string
  default     = "payintelli-users"
}

variable "cognito_client_name" {
  description = "Cognito App Client name"
  type        = string
  default     = "payintelli-app"
}

# S3 variables
variable "materials_bucket_name" {
  description = "S3 bucket name for materials"
  type        = string
  default     = "payintelli-materials"
}

# Lambda variables
variable "lambda_timeout" {
  description = "Lambda function timeout in seconds"
  type        = number
  default     = 30
}

variable "lambda_memory_size" {
  description = "Lambda function memory size in MB"
  type        = number
  default     = 256
}

variable "python_runtime" {
  description = "Lambda Python runtime"
  type        = string
  default     = "python3.12"
}

# VPC variables (for RDS in private subnet)
variable "vpc_id" {
  description = "VPC ID for Lambda functions"
  type        = string
  default     = ""  # Set in terraform.tfvars
}

variable "private_subnet_1_id" {
  description = "Private subnet 1 ID"
  type        = string
  default     = ""  # Set in terraform.tfvars
}

variable "private_subnet_2_id" {
  description = "Private subnet 2 ID"
  type        = string
  default     = ""  # Set in terraform.tfvars
}

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

# Database password (use secretsmanager in production)
variable "db_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
  default     = ""  # Set in terraform.tfvars
}
