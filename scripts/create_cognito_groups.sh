#!/usr/bin/env bash
# Create Cognito User Pool groups Admins and Students (one-time after Terraform apply).
# Usage: USER_POOL_ID=ap-south-1_XXX ./scripts/create_cognito_groups.sh
# Or:   ./scripts/create_cognito_groups.sh ap-south-1_6SDlpRoIV
# Uses AWS_PROFILE or --profile jm.

set -e
USER_POOL_ID="${USER_POOL_ID:-$1}"
PROFILE="${AWS_PROFILE:-jm}"
REGION="${AWS_REGION:-ap-south-1}"

if [ -z "$USER_POOL_ID" ]; then
  echo "Usage: USER_POOL_ID=ap-south-1_XXX $0"
  echo "   or: $0 ap-south-1_6SDlpRoIV"
  exit 1
fi

echo "Creating Cognito groups in pool $USER_POOL_ID (profile=$PROFILE, region=$REGION)..."

aws cognito-idp create-group \
  --user-pool-id "$USER_POOL_ID" \
  --group-name "Admins" \
  --description "Admin dashboard users (create events, polls, view analytics)" \
  --precedence 1 \
  --profile "$PROFILE" --region "$REGION" 2>/dev/null || echo "Admins group already exists."

aws cognito-idp create-group \
  --user-pool-id "$USER_POOL_ID" \
  --group-name "Students" \
  --description "Mobile app users (join events, vote, download materials)" \
  --precedence 2 \
  --profile "$PROFILE" --region "$REGION" 2>/dev/null || echo "Students group already exists."

echo "Done. Add admin users with: aws cognito-idp admin-add-user-to-group --user-pool-id $USER_POOL_ID --username <email> --group-name Admins --profile $PROFILE --region $REGION"
