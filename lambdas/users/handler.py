"""
Users Lambda handler.
"""

import json
import logging
from typing import Any, Dict

from shared.auth import create_error_response, create_response, require_role

logger = logging.getLogger(__name__)


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Main users handler routing for /admin-users and /users endpoints."""
    try:
        path = event.get("path", "/users")
        method = event.get("httpMethod", event.get("method", "GET"))

        if path == "/admin-users":
            if method == "GET":
                return list_admin_users(event, context)
            if method == "POST":
                return create_admin_user(event, context)

        if path == "/users" and method == "GET":
            return list_app_users(event, context)

        return create_error_response(404, "Endpoint not found")
    except Exception as exc:
        logger.error("Users handler error: %s", exc, exc_info=True)
        return create_error_response(500, "Internal server error")


@require_role("admin")
def list_admin_users(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """GET /admin-users."""
    from users.service import UsersService

    params = event.get("queryStringParameters", {}) or {}
    limit = int(params.get("limit", 50))
    next_token = params.get("next_token")

    service = UsersService()
    result = service.list_users(group="Admins", limit=limit, next_token=next_token)
    return create_response(200, result)


@require_role("admin")
def list_app_users(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """GET /users?group=Students."""
    from users.service import UsersService

    params = event.get("queryStringParameters", {}) or {}
    group = params.get("group", "Students")
    limit = int(params.get("limit", 50))
    next_token = params.get("next_token")

    service = UsersService()
    result = service.list_users(group=group, limit=limit, next_token=next_token)
    return create_response(200, result)


@require_role("admin")
def create_admin_user(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """POST /admin-users."""
    from users.service import UsersService

    body = json.loads(event.get("body", "{}"))
    email = (body.get("email") or "").strip().lower()
    temp_password = body.get("temp_password") or ""
    given_name = (body.get("given_name") or "").strip() or None
    family_name = (body.get("family_name") or "").strip() or None

    if not email:
        return create_error_response(400, "email is required")
    if not temp_password:
        return create_error_response(400, "temp_password is required")

    service = UsersService()
    user, error = service.create_admin_user(
        email=email,
        temp_password=temp_password,
        given_name=given_name,
        family_name=family_name,
    )

    if error:
        if "already exists" in error.lower():
            return create_error_response(409, error)
        return create_error_response(400, error)

    return create_response(
        201,
        {
            "message": "Admin user created successfully. Temporary password sent via email.",
            "user": user,
        },
    )

