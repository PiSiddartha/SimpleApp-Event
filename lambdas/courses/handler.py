"""
Courses Lambda handler.
Entry point for course-related API requests.
"""

import json
import logging
from typing import Dict, Any

from shared.auth import require_auth, require_role, create_response, create_error_response

logger = logging.getLogger(__name__)


def _extract_course_id(event: Dict[str, Any]) -> str:
    """Extract course_id from path or pathParameters."""
    params = event.get("pathParameters") or {}
    if params.get("course_id"):
        return params["course_id"]
    path = event.get("path", "/courses")
    parts = path.rstrip("/").split("/")
    if len(parts) >= 3 and parts[1] == "courses":
        return parts[2]
    return ""


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
    Main Lambda handler for courses.
    Routes: GET/POST /courses, GET/PUT/DELETE /courses/{id}, POST /courses/{id}/register.
    """
    try:
        path = event.get("path", "/courses").rstrip("/")
        method = event.get("httpMethod", event.get("method", "GET"))
        parts = path.split("/")

        if path == "/courses" or path.startswith("/courses?"):
            if method == "GET":
                return list_courses(event, context)
            if method == "POST":
                return create_course(event, context)
            return create_error_response(404, "Endpoint not found")

        if len(parts) >= 3 and parts[1] == "courses":
            course_id = parts[2]
            if len(parts) == 3:
                if method == "GET":
                    return get_course(event, context)
                if method == "PUT":
                    return update_course(event, context)
                if method == "DELETE":
                    return delete_course(event, context)
            if len(parts) == 4 and parts[3] == "register" and method == "POST":
                return register_course(event, context)

        return create_error_response(404, "Endpoint not found")
    except Exception as e:
        logger.error("Handler error: %s", e, exc_info=True)
        return create_error_response(500, "Internal server error")


def list_courses(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """List courses; optional query: status, full, limit."""
    from courses.service import CourseService
    params = event.get("queryStringParameters") or {}
    service = CourseService()
    status_filter = params.get("status")
    full = (params.get("full") or "").lower() in ("1", "true", "yes")
    limit = _parse_limit(params.get("limit", 50))
    result = service.list_courses(limit=limit, status_filter=status_filter, full=full)
    return create_response(200, result)


def get_course(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Get single course by ID."""
    from courses.service import CourseService
    course_id = _extract_course_id(event)
    if not course_id:
        return create_error_response(400, "course_id is required")
    service = CourseService()
    result = service.get_course(course_id)
    if not result:
        return create_error_response(404, "Course not found")
    return create_response(200, result)


@require_role("admin")
def create_course(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Create a new course (admin)."""
    from courses.service import CourseService
    try:
        body = _load_json_body(event)
    except ValueError as exc:
        return create_error_response(400, str(exc))
    service = CourseService()
    result = service.create_course(body)
    return create_response(201, result)


@require_role("admin")
def update_course(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Update an existing course (admin)."""
    from courses.service import CourseService
    course_id = _extract_course_id(event)
    if not course_id:
        return create_error_response(400, "course_id is required")
    try:
        body = _load_json_body(event)
    except ValueError as exc:
        return create_error_response(400, str(exc))
    service = CourseService()
    result = service.update_course(course_id, body)
    if not result:
        return create_error_response(404, "Course not found")
    return create_response(200, result)


@require_role("admin")
def delete_course(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Delete a course (admin)."""
    from courses.service import CourseService
    course_id = _extract_course_id(event)
    if not course_id:
        return create_error_response(400, "course_id is required")
    service = CourseService()
    success = service.delete_course(course_id)
    if not success:
        return create_error_response(404, "Course not found")
    return create_response(200, {"message": "Course deleted"})


@require_auth
def register_course(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Register current user for a course."""
    from courses.service import CourseService
    from shared.user_repository import get_or_create_user_from_claims
    course_id = _extract_course_id(event)
    if not course_id:
        return create_error_response(400, "course_id is required")
    app_user = get_or_create_user_from_claims(event.get("user", {}))
    if not app_user:
        return create_error_response(400, "Authenticated user profile could not be resolved")
    service = CourseService()
    success = service.register_course(course_id, app_user.id)
    if not success:
        return create_error_response(404, "Course not found")
    return create_response(200, {"registered": True, "message": "Registered for course"})
