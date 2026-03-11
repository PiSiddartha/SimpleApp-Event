"""
Events Lambda handler.
Entry point for event-related API requests.
"""

import json
import logging
from typing import Dict, Any

from shared.auth import require_auth, require_role, create_response, create_error_response

logger = logging.getLogger(__name__)

def _extract_event_id(path: str) -> str:
    parts = path.split("/")
    return parts[2] if len(parts) >= 3 else ""


def _load_json_body(event: Dict[str, Any]) -> Dict[str, Any]:
    body = event.get("body", "{}") or "{}"
    if isinstance(body, dict):
        return body
    try:
        return json.loads(body)
    except json.JSONDecodeError as exc:
        raise ValueError("Invalid JSON body") from exc


def _parse_limit(value: Any, default: int = 50) -> int:
    try:
        limit = int(value)
    except (TypeError, ValueError):
        return default
    return max(1, min(limit, 200))


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Main Lambda handler for events.
    
    Routes requests based on HTTP method and path.
    """
    try:
        # Get path and method from different API Gateway formats
        path = event.get("path", "/events")
        method = event.get("httpMethod", event.get("method", "GET"))
        
        # Route to appropriate handler
        if path == "/events" or path.startswith("/events?"):
            if method == "GET":
                return list_events(event, context)
            elif method == "POST":
                return create_event(event, context)
        elif path.startswith("/events/"):
            parts = path.split("/")
            if len(parts) >= 3:
                if method == "GET":
                    return get_event(event, context)
                elif method == "PUT":
                    return update_event(event, context)
                elif method == "DELETE":
                    return delete_event(event, context)
        
        return create_error_response(404, "Endpoint not found")
        
    except Exception as e:
        logger.error(f"Handler error: {e}", exc_info=True)
        return create_error_response(500, "Internal server error")


@require_role("admin")
def create_event(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Create a new event.
    Requires admin role.
    """
    from events.service import EventService
    from shared.user_repository import get_or_create_user_from_claims
    
    try:
        body = _load_json_body(event)
    except ValueError as exc:
        return create_error_response(400, str(exc))
    app_user = get_or_create_user_from_claims(event.get("user", {}))
    if not app_user:
        return create_error_response(400, "Authenticated user profile could not be resolved")
    
    service = EventService()
    result = service.create_event(
        name=body.get("name"),
        description=body.get("description"),
        location=body.get("location"),
        event_type=body.get("event_type", "offline"),
        start_time=body.get("start_time"),
        end_time=body.get("end_time"),
        max_attendees=body.get("max_attendees"),
        visibility=body.get("visibility", "global"),
        created_by=app_user.id,
    )
    
    # Format response with event_id and qr_url
    response = {
        "event_id": result.get("id"),
        "qr_url": result.get("qr_code"),
        "message": "Event created successfully"
    }
    
    return create_response(201, response)


@require_role("admin")
def update_event(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Update an existing event."""
    from events.service import EventService

    event_id = _extract_event_id(event.get("path", ""))
    if not event_id:
        return create_error_response(400, "event_id is required")
    
    try:
        body = _load_json_body(event)
    except ValueError as exc:
        return create_error_response(400, str(exc))
    
    service = EventService()
    result = service.update_event(
        event_id=event_id,
        user_id="",
        **body
    )
    
    if not result:
        return create_error_response(404, "Event not found")
    
    return create_response(200, result)


@require_role("admin")
def delete_event(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Delete an event."""
    from events.service import EventService

    event_id = _extract_event_id(event.get("path", ""))
    if not event_id:
        return create_error_response(400, "event_id is required")
    
    service = EventService()
    success = service.delete_event(event_id, "")
    
    if not success:
        return create_error_response(404, "Event not found")
    
    return create_response(204, {"message": "Event deleted"})


def get_event(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Get event by ID."""
    from events.service import EventService

    event_id = _extract_event_id(event.get("path", ""))
    if not event_id:
        return create_error_response(400, "event_id is required")
    
    service = EventService()
    result = service.get_event(event_id)
    
    if not result:
        return create_error_response(404, "Event not found")
    
    return create_response(200, result)


def list_events(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """List all events."""
    from events.service import EventService
    
    params = event.get("queryStringParameters", {}) or {}
    
    service = EventService()
    result = service.list_events(
        limit=_parse_limit(params.get("limit", 50)),
        visibility=params.get("visibility"),
    )
    
    return create_response(200, result)
