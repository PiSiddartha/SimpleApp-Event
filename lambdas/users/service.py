"""
Users service layer backed by Cognito.
"""

import os
from typing import Any, Dict, List, Optional, Tuple

import boto3
from botocore.exceptions import ClientError


def _as_bool(value: str) -> bool:
    return str(value).lower() in {"1", "true", "yes", "y"}


class UsersService:
    """Service for Cognito admin and app user management."""

    def __init__(self):
        self.user_pool_id = os.environ.get("COGNITO_USER_POOL_ID", "")
        self.client = boto3.client("cognito-idp")

    @staticmethod
    def _attributes_to_dict(attrs: List[Dict[str, str]]) -> Dict[str, str]:
        return {a.get("Name", ""): a.get("Value", "") for a in attrs or []}

    def _serialize_user(self, user: Dict[str, Any], groups: Optional[List[str]] = None) -> Dict[str, Any]:
        attrs = self._attributes_to_dict(user.get("Attributes") or user.get("UserAttributes") or [])
        username = user.get("Username")
        resolved_groups = groups
        if resolved_groups is None and username:
            groups_resp = self.client.admin_list_groups_for_user(
                UserPoolId=self.user_pool_id,
                Username=username,
            )
            resolved_groups = [g.get("GroupName") for g in groups_resp.get("Groups", []) if g.get("GroupName")]
        resolved_groups = resolved_groups or []

        return {
            "username": username,
            "email": attrs.get("email"),
            "given_name": attrs.get("given_name"),
            "family_name": attrs.get("family_name"),
            "name": attrs.get("name"),
            "sub": attrs.get("sub"),
            "enabled": user.get("Enabled"),
            "status": user.get("UserStatus"),
            "created_at": user.get("UserCreateDate").isoformat() if user.get("UserCreateDate") else None,
            "updated_at": user.get("UserLastModifiedDate").isoformat() if user.get("UserLastModifiedDate") else None,
            "groups": resolved_groups,
        }

    def list_users(
        self,
        group: Optional[str] = None,
        limit: int = 50,
        next_token: Optional[str] = None,
    ) -> Dict[str, Any]:
        """List users from Cognito, optionally restricted by group."""
        if group:
            kwargs: Dict[str, Any] = {
                "UserPoolId": self.user_pool_id,
                "GroupName": group,
                "Limit": limit,
            }
            if next_token:
                kwargs["NextToken"] = next_token
            resp = self.client.list_users_in_group(**kwargs)
            raw_users = resp.get("Users", [])
            users = [self._serialize_user(u, groups=[group]) for u in raw_users]
            return {"users": users, "next_token": resp.get("NextToken")}

        kwargs = {
            "UserPoolId": self.user_pool_id,
            "Limit": limit,
        }
        if next_token:
            kwargs["PaginationToken"] = next_token
        resp = self.client.list_users(**kwargs)
        raw_users = resp.get("Users", [])
        users = [self._serialize_user(u) for u in raw_users]
        return {"users": users, "next_token": resp.get("PaginationToken")}

    def create_admin_user(
        self,
        email: str,
        temp_password: str,
        given_name: Optional[str] = None,
        family_name: Optional[str] = None,
    ) -> Tuple[Optional[Dict[str, Any]], Optional[str]]:
        """Create a Cognito user and assign Admins group."""
        attrs = [
            {"Name": "email", "Value": email},
            {"Name": "email_verified", "Value": "true"},
        ]
        if given_name:
            attrs.append({"Name": "given_name", "Value": given_name})
        if family_name:
            attrs.append({"Name": "family_name", "Value": family_name})

        try:
            create_resp = self.client.admin_create_user(
                UserPoolId=self.user_pool_id,
                Username=email,
                TemporaryPassword=temp_password,
                UserAttributes=attrs,
                DesiredDeliveryMediums=["EMAIL"],
            )
            self.client.admin_add_user_to_group(
                UserPoolId=self.user_pool_id,
                Username=email,
                GroupName="Admins",
            )
            user = self._serialize_user(create_resp.get("User", {}))
            return user, None
        except self.client.exceptions.UsernameExistsException:
            return None, "User already exists"
        except ClientError as exc:
            return None, exc.response.get("Error", {}).get("Message", "Cognito error")
