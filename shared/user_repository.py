"""
User repository layer.
Data access for user operations.
"""

import logging
from typing import Optional, List

from shared.db import execute_query
from shared.models import User, UserRole, UserRepository as IUserRepository

logger = logging.getLogger(__name__)


class UserRepository(IUserRepository):
    """Repository for user data operations."""
    
    def get_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID."""
        result = execute_query(
            "SELECT * FROM users WHERE id = %s",
            (user_id,),
            fetch="one"
        )
        
        return self._row_to_user(result) if result else None
    
    def get_by_cognito_id(self, cognito_id: str) -> Optional[User]:
        """Get user by Cognito ID."""
        result = execute_query(
            "SELECT * FROM users WHERE cognito_id = %s",
            (cognito_id,),
            fetch="one"
        )
        
        return self._row_to_user(result) if result else None
    
    def create(self, user: User) -> User:
        """Create a new user."""
        execute_query(
            """
            INSERT INTO users (
                id, cognito_id, email, name, phone, company, role, created_at
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s
            )
            """,
            (
                user.id,
                user.cognito_id,
                user.email,
                user.name,
                user.phone,
                user.company,
                user.role.value,
                user.created_at,
            ),
            fetch="none"
        )
        
        logger.info(f"Created user: {user.id}")
        return user
    
    def update(self, user: User) -> User:
        """Update an existing user."""
        execute_query(
            """
            UPDATE users SET
                name = %s, phone = %s, company = %s, role = %s
            WHERE id = %s
            """,
            (
                user.name,
                user.phone,
                user.company,
                user.role.value,
                user.id,
            ),
            fetch="none"
        )
        
        logger.info(f"Updated user: {user.id}")
        return user
    
    def get_or_create_from_cognito(
        self, 
        cognito_id: str, 
        email: str, 
        name: Optional[str] = None
    ) -> User:
        """Get existing user or create new one from Cognito data."""
        existing = self.get_by_cognito_id(cognito_id)
        
        if existing:
            return existing
        
        # Create new user
        from shared.models import User
        import uuid
        
        user = User(
            id=str(uuid.uuid4()),
            cognito_id=cognito_id,
            email=email,
            name=name,
            role=UserRole.ATTENDEE,
        )
        
        return self.create(user)
    
    def _row_to_user(self, row: dict) -> User:
        """Convert database row to User model."""
        return User(
            id=row["id"],
            cognito_id=row["cognito_id"],
            email=row["email"],
            name=row.get("name"),
            phone=row.get("phone"),
            company=row.get("company"),
            role=UserRole(row.get("role", "attendee")),
            created_at=row.get("created_at"),
        )
