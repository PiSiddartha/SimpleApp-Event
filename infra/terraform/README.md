# PayIntelli Academy - Terraform Infrastructure

This directory contains Terraform configuration to deploy the PayIntelli Academy backend to AWS.

## Components Deployed

| Component | Description |
|-----------|-------------|
| API Gateway | REST API with Cognito authorizer |
| Lambda Functions | 5 functions (events, attendance, polls, materials, analytics) |
| RDS PostgreSQL | Database for all application data |
| Cognito User Pool | Authentication for mobile app and admin dashboard |
| S3 Bucket | File storage for learning materials |
| IAM Roles | Execution roles with proper permissions |
| CloudWatch | Logging for API Gateway |

## Prerequisites

1. **AWS CLI** installed and configured
2. **Terraform** >= 1.0 installed
3. **Existing VPC** with private subnets (for RDS)

## Quick Start

1. Copy the example variables file:
```bash
cp terraform.tfvars.example terraform.tfvars
```

2. Edit `terraform.tfvars` with your values:
- VPC ID and subnet IDs
- Database password
- Project name

3. Initialize Terraform:
```bash
terraform init
```

4. Plan the deployment:
```bash
terraform plan
```

5. Apply the deployment:
```bash
terraform apply
```

## API Endpoints

After deployment, the API will be available at:
```
https://{api-id}.execute-api.{region}.amazonaws.com/v1/
```

### Available Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /events | Create event (admin) |
| GET | /events | List events |
| GET | /events/{id} | Get event |
| PUT | /events/{id} | Update event |
| DELETE | /events/{id} | Delete event |
| POST | /events/{id}/join | Join event (attendance) |
| GET | /events/{id}/analytics | Event analytics |
| POST | /polls | Create poll (admin) |
| GET | /polls?event_id= | List polls |
| POST | /polls/{id}/vote | Cast vote |
| GET | /polls/{id}/results | Poll results |
| POST | /materials | Upload material (admin) |
| GET | /materials?event_id= | List materials |
| POST | /materials/{id}/download | Get download URL |

## Environment Variables

The following environment variables are automatically configured for Lambda functions:

| Variable | Description |
|----------|-------------|
| AWS_REGION | AWS region |
| DB_HOST | RDS endpoint |
| DB_PORT | 5432 |
| DB_NAME | Database name |
| DB_USER | Database username |
| DB_PASSWORD | Database password |
| S3_MATERIALS_BUCKET | S3 bucket name |
| COGNITO_USER_POOL_ID | Cognito pool ID |
| COGNITO_APP_CLIENT_ID | Cognito app client ID |
| CORS_ORIGIN | CORS allowed origin |

## Security Considerations

1. **Database password** - Stored in Secrets Manager (configured in terraform)
2. **S3 bucket** - Public access blocked, only Lambda can access
3. **API Gateway** - Secured with Cognito JWT authorizer
4. **Lambda** - Runs in VPC with no public access

## Destroying Resources

To remove all resources:
```bash
terraform destroy
```

**Warning:** This will delete the database. Make sure to backup data first.

## Costs

Estimated monthly costs (us-east-1):
- API Gateway: ~$3.50/million requests
- Lambda: ~$0.20/million invocations
- RDS (db.t3.micro): ~$15/month
- S3: ~$0.02/GB
- Cognito: Free tier available

## Troubleshooting

### Lambda timeout errors
Increase `lambda_timeout` in terraform.tfvars

### Cannot connect to RDS
Check:
1. Lambda security group allows outbound 5432
2. RDS security group allows inbound 5432 from Lambda SG
3. Subnets have NAT gateway for outbound traffic

### CORS errors
Set `CORS_ORIGIN` to your frontend domain in terraform.tfvars
