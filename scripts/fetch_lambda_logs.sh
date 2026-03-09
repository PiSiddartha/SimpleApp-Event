#!/usr/bin/env bash
# Fetch or tail CloudWatch logs for project Lambdas.
# Usage:
#   ./scripts/fetch_lambda_logs.sh                    # tail all Lambdas (last 10m)
#   ./scripts/fetch_lambda_logs.sh --function users  # tail only users Lambda
#   ./scripts/fetch_lambda_logs.sh --since 1h        # last hour, no follow
#   ./scripts/fetch_lambda_logs.sh --since 30m --no-follow  # one-off dump
#
# Uses: AWS_PROFILE (default jm), AWS_REGION (default ap-south-1), PROJECT_NAME (default payintelli).

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJECT_NAME="${PROJECT_NAME:-payintelli}"
AWS_PROFILE="${AWS_PROFILE:-jm}"
AWS_REGION="${AWS_REGION:-ap-south-1}"
SINCE="${SINCE:-10m}"
FOLLOW=true
FUNC=""

while [[ $# -gt 0 ]]; do
  case $1 in
    --function)
      FUNC="$2"
      shift 2
      ;;
    --since)
      SINCE="$2"
      shift 2
      ;;
    --no-follow)
      FOLLOW=false
      shift
      ;;
    --profile)
      AWS_PROFILE="$2"
      shift 2
      ;;
    --region)
      AWS_REGION="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1" >&2
      echo "Usage: $0 [--function events|attendance|polls|materials|analytics|users] [--since 10m|1h] [--no-follow] [--profile PROFILE] [--region REGION]" >&2
      exit 1
      ;;
  esac
done

export AWS_PROFILE
export AWS_REGION

LAMBDA_NAMES=(events attendance polls materials analytics users)
if [[ -n "$FUNC" ]]; then
  if [[ " ${LAMBDA_NAMES[*]} " != *" $FUNC "* ]]; then
    echo "Unknown function: $FUNC. Choose from: ${LAMBDA_NAMES[*]}" >&2
    exit 1
  fi
  LOG_GROUPS=("/aws/lambda/${PROJECT_NAME}-${FUNC}")
else
  LOG_GROUPS=()
  for n in "${LAMBDA_NAMES[@]}"; do
    LOG_GROUPS+=("/aws/lambda/${PROJECT_NAME}-${n}")
  done
fi

for LOG_GROUP in "${LOG_GROUPS[@]}"; do
  if [[ "$FOLLOW" == true ]]; then
    echo "Tailing $LOG_GROUP (since $SINCE, Ctrl+C to stop)..."
    aws logs tail "$LOG_GROUP" --since "$SINCE" --follow --format short --region "$AWS_REGION" --profile "$AWS_PROFILE" 2>/dev/null &
  else
    echo "Fetching $LOG_GROUP (since $SINCE)..."
    aws logs tail "$LOG_GROUP" --since "$SINCE" --format short --region "$AWS_REGION" --profile "$AWS_PROFILE" 2>/dev/null || true
  fi
done
[[ "$FOLLOW" == true ]] && wait
