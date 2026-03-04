"""
Attendance Lambda handler.
Entry point for attendance-related API requests.
"""

import json
import logging
from typing import Dict, Any

from shared.auth import require_auth, create_response, create_error_response

logger = logging.getLogger(__name__)


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Main Lambda handler for attendance."""
    try:
        path = event.get("path", "/attendance")
        method = event.get("httpMethod", event.get("method", "GET"))
        
        # Route: POST /events/{event_id}/join
        if "/events/" in path and "/join" in path:
            parts = path.split("/")
            # /events/{event_id}/join
            if len(parts) >= 4 and parts[-1] == "join":
                event_id = parts[2]
                if method == "POST":
                    return join_event(event_id, event, context)
        
        # Route: GET /attendance (user's attendance history)
        if path == "/attendance" or path.startswith("/attendance"):
            if method == "GET":
                return list_attendance(event, context)
        
        # Route: GET /attendance/event/{event_id}
        if path.startswith("/attendance/event/"):
            parts = path.split("/")
            if len(parts) >= 4:
                event_id = parts[3]
                if method == "GET":
                    return get_event_attendance(event_id, event, context)
        
        return create_error_response(404, "Endpoint not found")
        
    except Exception as e:
        logger.error(f"Handler error: {e}", exc_info=True)
        return create_error_response(500, "Internal server error")


@require_auth
def join_event(event_id: str, event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Join an event (mark attendance).
    POST /events/{event_id}/join
    """
    from attendance.service import AttendanceService
    
    user = event.get("user", {})
    user_id = user.get("sub") or user.get("cognito:username")
    
    if not user_id:
        return create_error_response(401, "User identity not found")
    
    service = AttendanceService()
    result = service.join_event(user_id=user_id, event_id=event_id)
    
    if result is None:
        return create_error_response(404, "Event not found")
    
    if result == "duplicate":
        return create_error_response(400, "User already checked into this event")
    
    if result == "not_started":
        return create_error_response(400, "Event has not started yet")
    
    if result == "ended":
        return create_error_response(400, "Event has already ended")
    
    return create_response(200, result)


@require_auth
def get_event_attendance(event_id: str, event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Get attendance records for an event."""
    from attendance.service import AttendanceService
    
    service = AttendanceService()
    result = service.get_event_attendance(event_id)
    
    return create_response(200, {"attendance": result})


@require_auth
def list_attendance(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """List attendance records for current user."""
    from attendance.service import AttendanceService
    
    user = event.get("user", {})
    user_id = user.get("sub") or user.get("cognito:username")
    params = event.get("queryStringParameters", {}) or {}
    
    service = AttendanceService()
    result = service.list_user_attendance(
        user_id=user_id,
        limit=int(params.get("limit", 50)),
    )
    
    return create_response(200, {"attendance": result})
