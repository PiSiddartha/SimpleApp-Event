"""
Cognito JWT authentication middleware for AWS Lambda.
Handles token verification and user extraction from JWT tokens.
"""

import os
import json
import logging
from typing import Optional, Dict, Any
from functools import wraps

import jwt
import requests
from jwt import PyJWKClient

logger = logging.getLogger(__name__)

# Cognito configuration
COGNITO_USER_POOL_ID = os.environ.get("COGNITO_USER_POOL_ID", "")
COGNITO_REGION = os.environ.get("AWS_REGION", "us-east-1")
COGNITO_APP_CLIENT_ID = os.environ.get("COGNITO_APP_CLIENT_ID", "")

# Cache for JWKS
_jwks_client: Optional[PyJWKClient] = None


def get_jwks_client() -> PyJWKClient:
    """Get or create JWKS client for token verification."""
    global _jwks_client
    
    if _jwks_client is None:
        cognito_issuer = f"https://cognito-idp.{COGNITO_REGION}.amazonaws.com/{COGNITO_USER_POOL_ID}"
        _jwks_client = PyJWKClient(
            f"{cognito_issuer}/.well-known/jwks.json",
            cache_keys=True
        )
        logger.info(f"JWKS client initialized for pool: {COGNITO_USER_POOL_ID}")
    
    return _jwks_client


def verify_token(token: str) -> Dict[str, Any]:
    """
    Verify JWT token from Cognito.
    
    Args:
        token: JWT token string from Authorization header
        
    Returns:
        Decoded token payload
        
    Raises:
        jwt.InvalidTokenError: If token is invalid
        jwt.ExpiredSignatureError: If token has expired
    """
    try:
        jwks_client = get_jwks_client()
        
        # Get signing key from JWKS
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        
        # Verify and decode token
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            audience=COGNITO_APP_CLIENT_ID,
            issuer=f"https://cognito-idp.{COGNITO_REGION}.amazonaws.com/{COGNITO_USER_POOL_ID}",
        )
        
        return payload
        
    except jwt.ExpiredSignatureError:
        logger.warning("Token has expired")
        raise
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid token: {e}")
        raise


def extract_token_from_header(auth_header: str) -> str:
    """
    Extract JWT token from Authorization header.
    
    Args:
        auth_header: "Bearer <token>" string
        
    Returns:
        JWT token string
        
    Raises:
        ValueError: If header format is invalid
    """
    if not auth_header:
        raise ValueError("Missing Authorization header")
    
    parts = auth_header.split()
    
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise ValueError("Invalid Authorization header format. Expected: 'Bearer <token>'")
    
    return parts[1]


def get_current_user(event: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Extract and verify user from Lambda event.
    
    Args:
        event: Lambda event dict
        
    Returns:
        User payload from token or None if not authenticated
    """
    # Try to get from Lambda Authorizer context (REST API Cognito: claims; HTTP API JWT: jwt.claims)
    if event.get("requestContext", {}).get("authorizer"):
        authorizer = event["requestContext"]["authorizer"]
        if "claims" in authorizer:
            return authorizer["claims"]
        if "jwt" in authorizer and "claims" in authorizer["jwt"]:
            return authorizer["jwt"]["claims"]
    
    # Try to get from headers
    headers = event.get("headers", {})
    auth_header = headers.get("authorization") or headers.get("Authorization")
    
    if not auth_header:
        return None
    
    try:
        token = extract_token_from_header(auth_header)
        payload = verify_token(token)
        return payload
    except (ValueError, jwt.InvalidTokenError) as e:
        logger.warning(f"Authentication failed: {e}")
        return None


def require_auth(func):
    """
    Decorator to require authentication for Lambda handler.
    
    Usage:
        @require_auth
        def handler(event, context):
            user = event.get("user")
            # ... handle request
    """
    @wraps(func)
    def wrapper(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
        user = get_current_user(event)
        
        if not user:
            return {
                "statusCode": 401,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({"error": "Unauthorized", "message": "Valid authentication required"})
            }
        
        # Add user to event for handler access
        event["user"] = user
        
        return func(event, context)
    
    return wrapper


# Cognito group name -> role name. JWT contains cognito:groups (list of group names).
COGNITO_GROUP_TO_ROLE = {"Admins": "admin", "Organizers": "organizer"}


def _user_roles_from_groups(user: Dict[str, Any]) -> set:
    """Derive role set from cognito:groups (and legacy custom:role)."""
    roles = set()
    groups = user.get("cognito:groups") or []
    if isinstance(groups, str):
        groups = [groups]
    for g in groups:
        if g in COGNITO_GROUP_TO_ROLE:
            roles.add(COGNITO_GROUP_TO_ROLE[g])
    # Legacy: custom:role if no groups
    if not roles and user.get("custom:role"):
        roles.add(user.get("custom:role"))
    return roles


def require_role(*allowed_roles: str):
    """
    Decorator to require Cognito group-based role for Lambda handler.
    Uses cognito:groups from JWT: Admins -> admin, Organizers -> organizer.
    Users in no group (e.g. Students only) have no admin/organizer role.

    Usage:
        @require_role("admin")
        def handler(event, context): ...
        @require_role("admin", "organizer")
        def handler(event, context): ...
    """
    allowed_set = set(allowed_roles)

    def decorator(func):
        @wraps(func)
        def wrapper(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
            user = get_current_user(event)

            if not user:
                return {
                    "statusCode": 401,
                    "headers": {"Content-Type": "application/json"},
                    "body": json.dumps({"error": "Unauthorized"})
                }

            user_roles = _user_roles_from_groups(user)
            if not (user_roles & allowed_set):
                return {
                    "statusCode": 403,
                    "headers": {"Content-Type": "application/json"},
                    "body": json.dumps({
                        "error": "Forbidden",
                        "message": f"Required one of: {list(allowed_set)} (your groups: {user.get('cognito:groups', [])})"
                    })
                }

            event["user"] = user
            return func(event, context)

        return wrapper
    return decorator


def create_response(
    status_code: int,
    body: Any,
    headers: Optional[Dict[str, str]] = None
) -> Dict[str, Any]:
    """
    Create standardized API Gateway response.
    
    Args:
        status_code: HTTP status code
        body: Response body (will be JSON serialized)
        headers: Optional additional headers
        
    Returns:
        Lambda response dict
    """
    default_headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": os.environ.get("CORS_ORIGIN", "*"),
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    }
    
    if headers:
        default_headers.update(headers)
    
    if isinstance(body, dict):
        body = json.dumps(body)
    elif not isinstance(body, str):
        body = json.dumps({"data": body})
    
    return {
        "statusCode": status_code,
        "headers": default_headers,
        "body": body
    }


def create_error_response(status_code: int, message: str, error_code: Optional[str] = None) -> Dict[str, Any]:
    """Create standardized error response."""
    body = {
        "error": error_code or "Error",
        "message": message
    }
    return create_response(status_code, body)
