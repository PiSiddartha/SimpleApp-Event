#!/usr/bin/env bash
# Run Terraform using the jm profile. Unsets env credentials so the profile is used.
set -e
unset AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_SESSION_TOKEN
export AWS_PROFILE="${AWS_PROFILE:-jm}"
exec terraform "$@"
