"""
Analytics Lambda handler.
Entry point for analytics-related API requests.
"""

import json
import logging
from typing import Dict, Any

from shared.auth import require_auth, require_role, create_response, create_error_response

logger = logging.getLogger(__name__)

def _extract_event_id_from_path(path: str) -> str:
    parts = path.split("/")
    return parts[2] if len(parts) >= 4 and parts[1] == "events" and parts[3] == "analytics" else ""

def _extract_student_id_from_path(path: str) -> str:
    parts = path.split("/")
    return parts[3] if len(parts) >= 4 and parts[1] == "analytics" and parts[2] == "student" else ""


def _is_admin(user: Dict[str, Any]) -> bool:
    """Return whether the JWT claims represent an admin user."""
    groups = user.get("cognito:groups")
    if isinstance(groups, list):
        normalized = [str(group).strip().lower() for group in groups]
    else:
        raw = str(groups or "").strip()
        if raw.startswith("[") and raw.endswith("]"):
            raw = raw[1:-1]
        normalized = [
            part.strip().strip("'\"").lower()
            for part in raw.split(",")
            if part.strip().strip("'\"")
        ]
    return "admins" in normalized or "admin" in normalized


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Main Lambda handler for analytics."""
    try:
        path = event.get("path", "/analytics")
        method = event.get("httpMethod", event.get("method", "GET"))
        
        # Route: GET /events/{event_id}/analytics
        if "/events/" in path and "/analytics" in path:
            if method == "GET":
                return get_event_analytics(event, context)
        
        # Route: GET /analytics/overview (admin overview)
        if path == "/analytics/overview" or path.startswith("/analytics/overview"):
            if method == "GET":
                return get_overview(event, context)
        
        # Route: GET /analytics/student/{student_id}
        if "/analytics/student/" in path:
            if method == "GET":
                return get_student_analytics(event, context)
        
        return create_error_response(404, "Endpoint not found")
        
    except Exception as e:
        logger.error(f"Handler error: {e}", exc_info=True)
        return create_error_response(500, "Internal server error")


@require_auth
def get_event_analytics(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Get analytics for a specific event.
    GET /events/{event_id}/analytics
    """
    from analytics.service import AnalyticsService
    from shared.user_repository import get_or_create_user_from_claims

    event_id = _extract_event_id_from_path(event.get("path", ""))
    if not event_id:
        return create_error_response(400, "event_id is required")

    app_user = get_or_create_user_from_claims(event.get("user", {}))
    if not app_user:
        return create_error_response(400, "Authenticated user profile could not be resolved")

    service = AnalyticsService()
    if not service.repository.event_exists(event_id):
        return create_error_response(404, "Event not found")

    if not service.can_view_event_analytics(
        event_id=event_id,
        app_user_id=app_user.id,
        is_admin=_is_admin(event.get("user", {})),
    ):
        return create_error_response(403, "You do not have access to this event leaderboard")

    result = service.get_event_analytics(event_id)
    return create_response(200, result)


@require_role("admin")
def get_overview(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Get platform-wide analytics overview.
    GET /analytics/overview
    """
    from analytics.service import AnalyticsService
    from shared.user_repository import get_or_create_user_from_claims
    
    app_user = get_or_create_user_from_claims(event.get("user", {}))
    if not app_user:
        return create_error_response(400, "Authenticated user profile could not be resolved")
    params = event.get("queryStringParameters", {}) or {}
    
    start_date = params.get("start_date")
    end_date = params.get("end_date")
    
    service = AnalyticsService()
    result = service.get_overview(
        user_id=app_user.id,
        start_date=start_date,
        end_date=end_date,
    )
    
    return create_response(200, result)


@require_role("admin")
def get_student_analytics(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Get analytics for a specific student.
    GET /analytics/student/{student_id}
    """
    from analytics.service import AnalyticsService

    student_id = _extract_student_id_from_path(event.get("path", ""))
    if not student_id:
        return create_error_response(400, "student_id is required")

    service = AnalyticsService()
    result = service.get_student_analytics(student_id)
    
    if result is None:
        return create_error_response(404, "Student not found")
    
    return create_response(200, result)
