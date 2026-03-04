"""
Analytics Lambda handler.
Entry point for analytics-related API requests.
"""

import json
import logging
from typing import Dict, Any

from shared.auth import require_role, create_response, create_error_response

logger = logging.getLogger(__name__)


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Main Lambda handler for analytics."""
    try:
        path = event.get("path", "/analytics")
        method = event.get("httpMethod", event.get("method", "GET"))
        
        # Route: GET /events/{event_id}/analytics
        if "/events/" in path and "/analytics" in path:
            parts = path.split("/")
            # /events/{event_id}/analytics
            if len(parts) >= 4 and parts[3] == "analytics":
                event_id = parts[2]
                if method == "GET":
                    return get_event_analytics(event_id, event, context)
        
        # Route: GET /analytics/overview (admin overview)
        if path == "/analytics/overview" or path.startswith("/analytics/overview"):
            if method == "GET":
                return get_overview(event, context)
        
        # Route: GET /analytics/student/{student_id}
        if "/analytics/student/" in path:
            parts = path.split("/")
            if len(parts) >= 4:
                student_id = parts[3]
                if method == "GET":
                    return get_student_analytics(student_id, event, context)
        
        return create_error_response(404, "Endpoint not found")
        
    except Exception as e:
        logger.error(f"Handler error: {e}", exc_info=True)
        return create_error_response(500, "Internal server error")


@require_role("admin", "organizer")
def get_event_analytics(event_id: str, event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Get analytics for a specific event.
    GET /events/{event_id}/analytics
    """
    from analytics.service import AnalyticsService
    
    service = AnalyticsService()
    result = service.get_event_analytics(event_id)
    
    if result is None:
        return create_error_response(404, "Event not found")
    
    return create_response(200, result)


@require_role("admin")
def get_overview(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Get platform-wide analytics overview.
    GET /analytics/overview
    """
    from analytics.service import AnalyticsService
    
    user = event.get("user", {})
    user_id = user.get("sub") or user.get("cognito:username")
    params = event.get("queryStringParameters", {}) or {}
    
    start_date = params.get("start_date")
    end_date = params.get("end_date")
    
    service = AnalyticsService()
    result = service.get_overview(
        user_id=user_id,
        start_date=start_date,
        end_date=end_date,
    )
    
    return create_response(200, result)


@require_role("admin")
def get_student_analytics(student_id: str, event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Get analytics for a specific student.
    GET /analytics/student/{student_id}
    """
    from analytics.service import AnalyticsService
    
    service = AnalyticsService()
    result = service.get_student_analytics(student_id)
    
    if result is None:
        return create_error_response(404, "Student not found")
    
    return create_response(200, result)
