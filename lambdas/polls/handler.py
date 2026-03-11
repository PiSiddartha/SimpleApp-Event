"""
Polls Lambda handler.
Entry point for poll-related API requests.
"""

import json
import logging
from typing import Dict, Any

from shared.auth import require_auth, require_role, create_response, create_error_response

logger = logging.getLogger(__name__)

def _extract_poll_id(path: str) -> str:
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


def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Main Lambda handler for polls."""
    try:
        path = event.get("path", "/polls")
        method = event.get("httpMethod", event.get("method", "GET"))
        
        # Route: POST /polls
        if path == "/polls":
            if method == "POST":
                return create_poll(event, context)
        
        # Route: /polls/{poll_id}/*
        if path.startswith("/polls/"):
            parts = path.split("/")
            if len(parts) >= 3:
                
                # POST /polls/{poll_id}/vote
                if len(parts) >= 4 and parts[3] == "vote" and method == "POST":
                    return cast_vote(event, context)
                
                # GET /polls/{poll_id}/results
                if len(parts) >= 4 and parts[3] == "results" and method == "GET":
                    return get_poll_results(event, context)
                
                # GET /polls/{poll_id}
                if method == "GET":
                    return get_poll(event, context)
                
                # PUT /polls/{poll_id} - update/close poll
                if method == "PUT":
                    return update_poll(event, context)
                
                # DELETE /polls/{poll_id}
                if method == "DELETE":
                    return delete_poll(event, context)
        
        # Route: GET /polls?event_id=xxx
        if path == "/polls" and method == "GET":
            return list_polls(event, context)
        
        return create_error_response(404, "Endpoint not found")
        
    except Exception as e:
        logger.error(f"Handler error: {e}", exc_info=True)
        return create_error_response(500, "Internal server error")


@require_role("admin")
def create_poll(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Create a new poll.
    POST /polls
    """
    from polls.service import PollService
    from shared.user_repository import get_or_create_user_from_claims
    
    try:
        body = _load_json_body(event)
    except ValueError as exc:
        return create_error_response(400, str(exc))
    app_user = get_or_create_user_from_claims(event.get("user", {}))
    if not app_user:
        return create_error_response(400, "Authenticated user profile could not be resolved")
    
    service = PollService()
    result = service.create_poll(
        event_id=body.get("event_id"),
        question=body.get("question"),
        options=body.get("options", []),
        created_by=app_user.id,
    )
    
    if not result:
        return create_error_response(400, "Failed to create poll")
    
    return create_response(201, {
        "poll_id": result.get("poll_id"),
        "message": "Poll created successfully"
    })


@require_role("admin")
def update_poll(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Update a poll (close, reopen, etc.)."""
    from polls.service import PollService
    
    poll_id = _extract_poll_id(event.get("path", ""))
    if not poll_id:
        return create_error_response(400, "poll_id is required")

    try:
        body = _load_json_body(event)
    except ValueError as exc:
        return create_error_response(400, str(exc))
    user = event.get("user", {})
    user_id = user.get("sub") or user.get("cognito:username")
    
    service = PollService()
    result = service.update_poll(
        poll_id=poll_id,
        user_id=user_id,
        **body
    )
    
    if not result:
        return create_error_response(404, "Poll not found")
    
    return create_response(200, result)


@require_role("admin")
def delete_poll(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Delete a poll."""
    from polls.service import PollService
    
    poll_id = _extract_poll_id(event.get("path", ""))
    if not poll_id:
        return create_error_response(400, "poll_id is required")

    user = event.get("user", {})
    user_id = user.get("sub") or user.get("cognito:username")
    
    service = PollService()
    success = service.delete_poll(poll_id, user_id)
    
    if not success:
        return create_error_response(404, "Poll not found")
    
    return create_response(204, {"message": "Poll deleted"})


@require_auth
def get_poll(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Get poll by ID."""
    from polls.service import PollService
    
    poll_id = _extract_poll_id(event.get("path", ""))
    if not poll_id:
        return create_error_response(400, "poll_id is required")

    service = PollService()
    result = service.get_poll(poll_id)
    
    if not result:
        return create_error_response(404, "Poll not found")
    
    return create_response(200, result)


@require_auth
def get_poll_results(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Get poll results.
    GET /polls/{poll_id}/results
    """
    from polls.service import PollService

    poll_id = _extract_poll_id(event.get("path", ""))
    if not poll_id:
        return create_error_response(400, "poll_id is required")
    
    service = PollService()
    result = service.get_results(poll_id)
    
    if not result:
        return create_error_response(404, "Poll not found")
    
    return create_response(200, result)


def list_polls(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """List polls for an event."""
    from polls.service import PollService
    
    params = event.get("queryStringParameters", {}) or {}
    event_id = params.get("event_id")
    
    if not event_id:
        return create_error_response(400, "event_id is required")
    
    service = PollService()
    result = service.list_polls(event_id)
    
    return create_response(200, {"polls": result})


@require_auth
def cast_vote(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Cast a vote on a poll.
    POST /polls/{poll_id}/vote
    """
    from polls.service import PollService
    from shared.user_repository import get_or_create_user_from_claims
    
    poll_id = _extract_poll_id(event.get("path", ""))
    if not poll_id:
        return create_error_response(400, "poll_id is required")

    try:
        body = _load_json_body(event)
    except ValueError as exc:
        return create_error_response(400, str(exc))
    app_user = get_or_create_user_from_claims(event.get("user", {}))
    if not app_user:
        return create_error_response(401, "User identity not found")
    
    option_id = body.get("option_id")
    if not option_id:
        return create_error_response(400, "option_id is required")
    
    service = PollService()
    result = service.cast_vote(
        poll_id=poll_id,
        user_id=app_user.id,
        option_id=option_id,
    )
    
    if result == "not_found":
        return create_error_response(404, "Poll not found")
    
    if result == "not_active":
        return create_error_response(400, "Poll is not active")
    
    if result == "invalid_option":
        return create_error_response(400, "Invalid option selected")
    
    if result == "duplicate":
        return create_error_response(400, "User has already voted in this poll")
    
    return create_response(200, {"message": "Vote recorded successfully"})
