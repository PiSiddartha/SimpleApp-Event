# S3 Bucket for Materials

# Materials S3 Bucket
resource "aws_s3_bucket" "materials" {
  bucket = var.materials_bucket_name

  tags = {
    Name        = var.materials_bucket_name
    Environment = var.environment
  }
}

# S3 Bucket Versioning
resource "aws_s3_bucket_versioning" "materials" {
  bucket = aws_s3_bucket.materials.id
  versioning_configuration {
    status = "Enabled"
  }
}

# S3 Bucket Encryption
resource "aws_s3_bucket_server_side_encryption_configuration" "materials" {
  bucket = aws_s3_bucket.materials.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# S3 Bucket Public Access Block
resource "aws_s3_bucket_public_access_block" "materials" {
  bucket = aws_s3_bucket.materials.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls     = true
  restrict_public_buckets = true
}

# S3 Bucket Lifecycle Rule (archive old materials)
resource "aws_s3_bucket_lifecycle_configuration" "materials" {
  bucket = aws_s3_bucket.materials.id

  rule {
    id     = "archive-old-materials"
    status = "Enabled"

    transition {
      days          = 90
      storage_class = "STANDARD_IA"
    }

    transition {
      days          = 365
      storage_class = "GLACIER"
    }

    expiration {
      days = 730
    }
  }
}

# S3 Bucket Policy - Allow Lambda access
resource "aws_s3_bucket_policy" "materials" {
  bucket = aws_s3_bucket.materials.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowLambdaAccess"
        Effect    = "Allow"
        Principal = {
          AWS = aws_iam_role.lambda_exec.arn
        }
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = [
          "arn:aws:s3:::${var.materials_bucket_name}/*"
        ]
      }
    ]
  })
}

# Output bucket name
output "materials_bucket_name" {
  value = aws_s3_bucket.materials.id
}
