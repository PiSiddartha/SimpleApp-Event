"""
Cognito Post-Confirmation trigger: add new sign-ups to the Students group.
Invoked by Cognito after a user confirms sign-up (email code).
"""

import os
import logging
from typing import Any, Dict

import boto3

logger = logging.getLogger(__name__)

STUDENTS_GROUP = "Students"


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Cognito PostConfirmation_ConfirmSignUp trigger.
    Adds the newly confirmed user to the Students group.
    """
    trigger_source = event.get("triggerSource", "")
    if trigger_source != "PostConfirmation_ConfirmSignUp":
        logger.info("Skipping non-PostConfirmation_ConfirmSignUp: %s", trigger_source)
        return event

    user_pool_id = event.get("userPoolId", "") or os.environ.get("COGNITO_USER_POOL_ID", "")
    if not user_pool_id:
        logger.warning("userPoolId not in event and COGNITO_USER_POOL_ID not set; skipping add to group")
        return event

    user_name = event.get("userName", "") or event.get("request", {}).get("userName", "")
    if not user_name:
        logger.warning("No userName in event; skipping add to group")
        return event

    try:
        client = boto3.client("cognito-idp")
        client.admin_add_user_to_group(
            UserPoolId=user_pool_id,
            Username=user_name,
            GroupName=STUDENTS_GROUP,
        )
        logger.info("Added user %s to group %s", user_name, STUDENTS_GROUP)
    except Exception as e:
        logger.exception("Failed to add user to group: %s", e)
        # Do not fail the trigger; user is already confirmed
        # They can be added to Students manually if needed

    return event
