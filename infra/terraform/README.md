# PayIntelli Academy - Terraform Infrastructure

This directory contains Terraform configuration to deploy the PayIntelli Academy backend to AWS.

## Components Deployed

| Component | Description |
|-----------|-------------|
| API Gateway | HTTP API with Cognito JWT authorizer |
| Lambda Functions | 5 functions (events, attendance, polls, materials, analytics) |
| RDS PostgreSQL | Database for all application data |
| Cognito User Pool | Authentication for mobile app and admin dashboard (same pool) |
| Cognito Groups | **Admins** (dashboard), **Students** (mobile); JWT includes `cognito:groups` for API auth |
| S3 Bucket | File storage for learning materials |
| IAM Roles | Execution roles with proper permissions |
| CloudWatch | Logging for API Gateway |

## Prerequisites

1. **AWS CLI** installed and configured
2. **Terraform** >= 1.0 installed
3. **Existing VPC** with private subnets (for RDS)
4. **AWS profile** – set `aws_profile` in `terraform.tfvars` (e.g. `aws_profile = "jm"`) so Terraform uses that profile for all AWS calls.
5. **IAM user/role** used by that profile must have permissions for all resources Terraform manages. If you hit quota limits on managed policies, use **inline policies** instead. Required inline policies are listed below.

## Required IAM permissions (inline policies if needed)

If you see **AccessDeniedException** (e.g. `logs:ListTagsForResource`, `cognito-identity:TagResource`, `s3:GetBucketPolicy`), add an **inline policy** to the IAM user (e.g. Pi-Siddartha) with the following. (Inline policies do not count toward the “managed policies per user” quota.)

The **total** of all inline policies on the user (non-whitespace chars) must be under **2048**. Use a single minimal policy:

**`iam-inline-policy-terraform-1.json`** — one policy with wildcard actions for logs, secretsmanager, cognito-identity, lambda, and s3. Covers everything Terraform needs and stays under the 2048 total inline policy limit.

**Steps:** IAM → Users → \<your-user\> → Add permissions → Create inline policy → JSON → paste contents of **`iam-inline-policy-terraform-1.json`** → name (e.g. `TerraformRun`) → Create. If you previously added two larger Terraform policies, remove those and use this one policy only to stay under the 2048 total.

**If you see `lambda:ListVersionsByFunction` AccessDenied** even though the policy includes Lambda: **Environment variables override the profile.** If `AWS_ACCESS_KEY_ID` or `AWS_SECRET_ACCESS_KEY` are set in your shell, Terraform uses those instead of the `jm` profile (which has the correct policy). Run Terraform with the profile and no env credentials:
  ```bash
  unset AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_SESSION_TOKEN
  export AWS_PROFILE=jm
  terraform plan
  terraform apply
  ```
  Or use the script: `./run_terraform.sh` (see below).

## Quick Start

1. Copy the example variables file:
```bash
cp terraform.tfvars.example terraform.tfvars
```

2. Edit `terraform.tfvars` with your values:
- VPC ID and subnet IDs
- **Database password**: must be 8+ characters; only printable ASCII allowed **except** `/`, `@`, `"`, and space (RDS requirement).
- Project name
- (Optional) `cognito_domain`: if the default domain is already in use, set a unique value (e.g. `payintelli-dev`) or leave empty to use `project_name-account_id`.

3. Initialize Terraform:
```bash
terraform init
```

4. **Build Lambda packages** (or let Terraform do it on apply):
   ```bash
   bash scripts/build_lambdas.sh   # from repo root
   ```
   This creates `lambdas/events.zip`, `lambdas/attendance.zip`, etc., each containing that Lambda’s code, the `shared/` module, and dependencies from `requirements.txt`. Terraform runs this script automatically before creating/updating Lambdas.

5. Plan and apply (use the profile; env credentials would override it):
```bash
unset AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_SESSION_TOKEN
export AWS_PROFILE=jm
terraform plan
terraform apply
```
   Or: `chmod +x run_terraform.sh && ./run_terraform.sh plan` and `./run_terraform.sh apply`.

### Troubleshooting apply errors

- **RDS `MasterUserPassword is not a valid password`**: Use only printable ASCII; do **not** use `/`, `@`, `"`, or space. Terraform validates this; fix `db_password` in `terraform.tfvars`.
- **Cognito `Domain already associated with another user pool`**: The default domain is now `project_name-account_id` (e.g. `payintelli-442042527593`). To use a custom name, set `cognito_domain` in `terraform.tfvars`.
- **Cognito Identity, S3, or Lambda AccessDenied** (e.g. `lambda:ListVersionsByFunction`): Ensure Terraform uses the `jm` profile—unset `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY`/`AWS_SESSION_TOKEN` and set `AWS_PROFILE=jm`, or use `./run_terraform.sh`. If the policy is missing Lambda, attach/update with `iam-inline-policy-terraform-1.json`.

## Cognito callback and sign-out URLs

The app client’s **Callback URL(s)** and **Sign out URL(s)** must match exactly what the app uses, or you’ll see `redirect_mismatch` on login/logout. In `cognito.tf`:

- **callback_urls**: where Cognito redirects after sign-in (e.g. `/callback`).
- **logout_urls**: where Cognito may redirect after sign-out. The app sends `logout_uri`/`redirect_uri` = `${appUrl}/logout`; that URL must be in this list. `/login` is also allowed so you can redirect to login after logout if needed.

If you add a new origin (e.g. staging), add its callback and logout URLs to these lists and re-apply.

## Cognito groups (admin vs mobile)

The same User Pool is used for both the **admin dashboard** and the **mobile app**. Two groups (**Admins**, **Students**) must exist; Terraform does not create them (to avoid needing extra IAM permissions). Create them once after the first apply:

```bash
./scripts/create_cognito_groups.sh ap-south-1_6SDlpRoIV
# Or: USER_POOL_ID=$(cd infra/terraform && terraform output -raw cognito_user_pool_id) ./scripts/create_cognito_groups.sh
```

If you previously ran apply and got `cognito-idp:GetGroup` errors, drop the group resources from state then apply again:
```bash
cd infra/terraform
terraform state rm 'aws_cognito_user_group.admins' 'aws_cognito_user_group.students' 2>/dev/null || true
./run_terraform.sh apply
```

| Group | Use | Backend / UI |
|-------|-----|--------------|
| **Admins** | Dashboard users (create events, polls, analytics) | API `@require_role("admin")`; dashboard only allows sign-in if user is in Admins |
| **Students** | Mobile app users (join events, vote, download) | No group required for mobile; admin/organizer routes require Cognito group |

**Add a user to the Admins group** (required for dashboard access):

**AWS Console:** Cognito → User pools → payintelli-users → Users → select user → Add user to group → choose **Admins**.

**AWS CLI:**
```bash
aws cognito-idp admin-add-user-to-group \
  --user-pool-id ap-south-1_6SDlpRoIV \
  --username "admin@example.com" \
  --group-name Admins \
  --profile jm --region ap-south-1
```

**Create the first admin user** (then add to Admins as above):
```bash
aws cognito-idp admin-create-user --user-pool-id ap-south-1_6SDlpRoIV \
  --username admin@example.com --temporary-password "TempPass123!" \
  --user-attributes Name=email,Value=admin@example.com Name=email_verified,Value=true \
  --message-action SUPPRESS --profile jm --region ap-south-1
aws cognito-idp admin-add-user-to-group --user-pool-id ap-south-1_6SDlpRoIV \
  --username admin@example.com --group-name Admins --profile jm --region ap-south-1
aws cognito-idp admin-set-user-password --user-pool-id ap-south-1_6SDlpRoIV \
  --username admin@example.com --password "YourSecurePass123!" --permanent \
  --profile jm --region ap-south-1
```

Mobile app users can sign up via the app (or Hosted UI); they do not need to be in any group unless you add an **Organizers** group and backend checks for it.

## API Endpoints

After deployment, the **HTTP API** will be available at (no stage in path when using `$default` stage):
```
https://{api-id}.execute-api.{region}.amazonaws.com
```
Example: `GET https://xxx.execute-api.ap-south-1.amazonaws.com/events`

**Important:** There is no `/v1` or `/api` in the path. Set your frontend `NEXT_PUBLIC_API_URL` to the invoke URL with **no** trailing path (e.g. `https://xxx.execute-api.ap-south-1.amazonaws.com`). Do **not** use `.../api` — routes are `GET /events`, `POST /polls`, etc. directly on that host; using `.../api` causes 404s (e.g. `GET .../api/events` is not a valid route).

### payintelli-api routes (as in Terraform)

| Method | Path | Description |
|--------|------|-------------|
| POST | /events | Create event |
| GET | /events | List events |
| GET | /events/{event_id} | Get event |
| PUT | /events/{event_id} | Update event |
| DELETE | /events/{event_id} | Delete event |
| POST | /events/{event_id}/join | Join event (attendance) |
| GET | /events/{event_id}/analytics | Event analytics |
| GET | /attendance | List attendance |
| GET | /attendance/event/{event_id} | Attendance for event |
| POST | /polls | Create poll |
| GET | /polls | List polls (optional ?event_id=) |
| GET | /polls/{poll_id} | Get poll |
| PUT | /polls/{poll_id} | Update poll |
| DELETE | /polls/{poll_id} | Delete poll |
| POST | /polls/{poll_id}/vote | Cast vote |
| GET | /polls/{poll_id}/results | Poll results |
| POST | /materials | Create material |
| GET | /materials | List materials (?event_id=) |
| GET | /materials/{material_id} | Get material |
| DELETE | /materials/{material_id} | Delete material |
| POST | /materials/{material_id}/download | Get download URL |
| GET | /analytics/overview | Analytics overview |
| GET | /analytics/student/{student_id} | Student analytics |

## Connecting to the database

**Public access (dev):** Set `db_publicly_accessible = true` and provide `public_subnet_1_id` and `public_subnet_2_id` in `terraform.tfvars` (subnets that have an Internet Gateway route — find in VPC → Subnets). After `terraform apply`, the RDS security group allows 5432 from `0.0.0.0/0` and you can connect from TablePlus/DBeaver using the RDS endpoint and credentials from tfvars.

**Private only (production):** Set `db_publicly_accessible = false` and leave public subnet IDs empty. Use a bastion or Session Manager to connect.

**Credentials** (from `terraform.tfvars`): use the **full** password, e.g. `PiResearchLabs2026#Secure` (not `PiResearchLabs2026#`). Database name: `PiResearchLabs`, user: `piresearchlabs_admin`, port: `5432`.

**Ways to connect:**

1. **Bastion + SSH tunnel**  
   Launch an EC2 instance in the same VPC (e.g. in a public subnet with SSH from your IP). Then from your machine:
   ```bash
   ssh -i your-key.pem -L 5432:RDS_ENDPOINT:5432 ec2-user@BASTION_IP
   ```
   In your DB client, connect to `localhost:5432` with the credentials above.

2. **AWS Session Manager + port forwarding**  
   If you have an EC2 (or other host) in the VPC with SSM agent, use Session Manager’s port forwarding to forward local 5432 to RDS, then connect to `localhost:5432`.

3. **Temporary public access (dev only)**  
   Set `publicly_accessible = true` on the RDS instance and add a security group rule allowing your IP on port 5432. Not recommended for production.

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

## Deploying to a new AWS account

If you switch to a **new AWS account** (e.g. a new profile like `jm`), the existing Terraform state still points at resources in the **old** account. Refresh will then fail with errors such as:

- `Access to IdentityPool '...' is forbidden`
- `User: arn:aws:iam::NEW_ACCOUNT:user/... is not authorized to perform: cognito-idp:DescribeUserPoolDomain`

**Fix: start with an empty state** so Terraform creates everything in the new account:

1. From `infra/terraform`, backup state (optional):
   ```bash
   cp terraform.tfstate terraform.tfstate.old.backup
   ```
2. Remove current state so Terraform stops tracking the old account:
   ```bash
   rm -f terraform.tfstate terraform.tfstate.backup
   ```
3. Re-initialize and apply (uses profile from `terraform.tfvars`, e.g. `jm`):
   ```bash
   terraform init
   terraform apply
   ```
4. Terraform will plan to **create** all resources (e.g. 84) in the new account. No destroy.

Ensure the credentials for the chosen profile have permissions for: Cognito (cognito-idp, cognito-identity), RDS, Lambda, API Gateway, S3, IAM, Secrets Manager, EC2/VPC.

If you see **Cognito** `TagResource` or `DescribeUserPoolDomain` errors, the IAM user/role for that profile needs broader Cognito access. Attach a policy that allows at least:
- `cognito-idp:TagResource`
- `cognito-idp:DescribeUserPoolDomain`
- (or use the managed policy **AmazonCognitoPowerUser** for Cognito User Pools)

## Lambda logs (AWS CLI)

To inspect Lambda logs (e.g. after a failed login or API error), use CloudWatch from the CLI:

```bash
# From repo root – tail all Lambdas (last 10m), follow live
./scripts/fetch_lambda_logs.sh

# Only the users Lambda (e.g. admin create user, list users)
./scripts/fetch_lambda_logs.sh --function users

# Last hour, one-off (no follow)
./scripts/fetch_lambda_logs.sh --since 1h --no-follow

# Custom profile/region
AWS_PROFILE=jm AWS_REGION=ap-south-1 ./scripts/fetch_lambda_logs.sh --function events
```

Log groups: `/aws/lambda/<project_name>-<events|attendance|polls|materials|analytics|users>`. Default `project_name` is `payintelli` (set `PROJECT_NAME` if you changed it in Terraform).

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
