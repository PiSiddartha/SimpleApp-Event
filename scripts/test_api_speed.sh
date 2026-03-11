#!/usr/bin/env bash
# Test API response time. Uses AWS profile (default jm) to get API URL from Terraform if needed.
# Usage:
#   AWS_PROFILE=jm ./scripts/test_api_speed.sh
#   ./scripts/test_api_speed.sh --profile jm
#   API_URL=https://your-api.execute-api.region.amazonaws.com ./scripts/test_api_speed.sh
#
# Measures GET /events (no auth) and prints total time in seconds.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
AWS_PROFILE="${AWS_PROFILE:-jm}"

while [[ $# -gt 0 ]]; do
  case $1 in
    --profile)
      AWS_PROFILE="$2"
      shift 2
      ;;
    *)
      shift
      ;;
  esac
done

if [[ -z "${API_URL:-}" ]]; then
  if [[ -d "$REPO_ROOT/infra/terraform" ]]; then
    export AWS_PROFILE="$AWS_PROFILE"
    API_URL=$(cd "$REPO_ROOT/infra/terraform" && terraform output -raw api_gateway_url 2>/dev/null || true)
  fi
fi

if [[ -z "${API_URL:-}" ]]; then
  echo "Set API_URL or run from a Terraform-configured repo (terraform output api_gateway_url). Example:"
  echo "  export API_URL=https://ggszk3v52a.execute-api.ap-south-1.amazonaws.com"
  echo "  AWS_PROFILE=jm $0"
  exit 1
fi

# Strip trailing slash
API_URL="${API_URL%/}"
echo "Testing $API_URL/events (profile: $AWS_PROFILE)"
echo -n "Response time: "
curl -s -o /dev/null -w "%{time_total}s\n" "$API_URL/events"
