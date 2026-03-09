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
    
    body = json.loads(event.get("body", "{}"))
    
    service = EventService()
    result = service.create_event(
        name=body.get("name"),
        description=body.get("description"),
        location=body.get("location"),
        event_type=body.get("event_type", "offline"),
        start_time=body.get("start_time"),
        end_time=body.get("end_time"),
        max_attendees=body.get("max_attendees"),
        created_by=None,
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
    
    body = json.loads(event.get("body", "{}"))
    
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
        limit=int(params.get("limit", 50)),
    )
    
    return create_response(200, result)
