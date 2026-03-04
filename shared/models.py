"""
Database models for PayIntelli Academy platform.
Uses dataclasses for structured data representation.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, List
from enum import Enum


class UserRole(str, Enum):
    """User roles in the system."""
    ADMIN = "admin"
    ORGANIZER = "organizer"
    ATTENDEE = "attendee"


class EventStatus(str, Enum):
    """Event status values."""
    DRAFT = "draft"
    PUBLISHED = "published"
    ONGOING = "ongoing"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class EventType(str, Enum):
    """Event type values."""
    OFFLINE = "offline"
    ONLINE = "online"
    HYBRID = "hybrid"


class PollStatus(str, Enum):
    """Poll status values."""
    DRAFT = "draft"
    ACTIVE = "active"
    CLOSED = "closed"


@dataclass
class User:
    """User model."""
    id: str
    cognito_id: str
    email: str
    name: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    role: UserRole = UserRole.ATTENDEE
    created_at: datetime = field(default_factory=datetime.utcnow)
    
    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "cognito_id": self.cognito_id,
            "email": self.email,
            "name": self.name,
            "phone": self.phone,
            "company": self.company,
            "role": self.role.value,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


@dataclass
class Event:
    """Event model."""
    id: str
    name: str
    description: Optional[str] = None
    location: Optional[str] = None
    event_type: EventType = EventType.OFFLINE
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    created_by: str = None
    status: EventStatus = EventStatus.DRAFT
    qr_code: Optional[str] = None
    max_attendees: Optional[int] = None
    created_at: datetime = field(default_factory=datetime.utcnow)
    
    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "location": self.location,
            "event_type": self.event_type.value if self.event_type else None,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "end_time": self.end_time.isoformat() if self.end_time else None,
            "created_by": self.created_by,
            "status": self.status.value,
            "qr_code": self.qr_code,
            "max_attendees": self.max_attendees,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


@dataclass
class Attendance:
    """Attendance record model."""
    id: str
    user_id: str
    event_id: str
    timestamp: datetime = field(default_factory=datetime.utcnow)
    
    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "event_id": self.event_id,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
        }


@dataclass
class Poll:
    """Poll model."""
    id: str
    event_id: str
    question: str
    created_by: Optional[str] = None
    status: PollStatus = PollStatus.DRAFT
    created_at: datetime = field(default_factory=datetime.utcnow)
    
    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "event_id": self.event_id,
            "question": self.question,
            "created_by": self.created_by,
            "status": self.status.value,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


@dataclass
class PollOption:
    """Poll option model."""
    id: str
    poll_id: str
    option_text: str
    
    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "poll_id": self.poll_id,
            "option_text": self.option_text,
        }


@dataclass
class Vote:
    """Vote model."""
    id: str
    poll_id: str
    option_id: str
    user_id: str
    created_at: datetime = field(default_factory=datetime.utcnow)
    
    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "poll_id": self.poll_id,
            "option_id": self.option_id,
            "user_id": self.user_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


@dataclass
class Material:
    """Learning material model."""
    id: str
    event_id: str
    title: str
    file_url: str
    file_type: Optional[str] = None
    uploaded_by: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.utcnow)
    
    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "event_id": self.event_id,
            "title": self.title,
            "file_url": self.file_url,
            "file_type": self.file_type,
            "uploaded_by": self.uploaded_by,
            "uploaded_at": self.created_at.isoformat() if self.created_at else None,
        }


# Repository interfaces


class UserRepository:
    """Interface for user data operations."""
    
    def get_by_id(self, user_id: str) -> Optional[User]:
        raise NotImplementedError
    
    def get_by_cognito_id(self, cognito_id: str) -> Optional[User]:
        raise NotImplementedError
    
    def create(self, user: User) -> User:
        raise NotImplementedError
    
    def update(self, user: User) -> User:
        raise NotImplementedError
    
    def get_or_create_from_cognito(self, cognito_id: str, email: str, name: Optional[str] = None) -> User:
        raise NotImplementedError


class EventRepository:
    """Interface for event data operations."""
    
    def get_by_id(self, event_id: str) -> Optional[Event]:
        raise NotImplementedError
    
    def create(self, event: Event) -> Event:
        raise NotImplementedError
    
    def update(self, event: Event) -> Event:
        raise NotImplementedError
    
    def delete(self, event_id: str) -> bool:
        raise NotImplementedError
    
    def list_by_organizer(self, organizer_id: str, limit: int = 50) -> List[Event]:
        raise NotImplementedError
    
    def list_published(self, limit: int = 50) -> List[Event]:
        raise NotImplementedError
    
    def list_all(self, limit: int = 50, offset: int = 0) -> List[Event]:
        raise NotImplementedError


class AttendanceRepository:
    """Interface for attendance data operations."""
    
    def get_by_event_and_user(self, event_id: str, user_id: str) -> Optional[Attendance]:
        raise NotImplementedError
    
    def create(self, attendance: Attendance) -> Attendance:
        raise NotImplementedError
    
    def list_by_event(self, event_id: str) -> List[Attendance]:
        raise NotImplementedError
    
    def list_by_user(self, user_id: str, limit: int = 50) -> List[Attendance]:
        raise NotImplementedError
    
    def count_by_event(self, event_id: str) -> int:
        raise NotImplementedError


class PollRepository:
    """Interface for poll data operations."""
    
    def get_by_id(self, poll_id: str) -> Optional[Poll]:
        raise NotImplementedError
    
    def create(self, poll: Poll) -> Poll:
        raise NotImplementedError
    
    def update(self, poll: Poll) -> Poll:
        raise NotImplementedError
    
    def delete(self, poll_id: str) -> bool:
        raise NotImplementedError
    
    def list_by_event(self, event_id: str) -> List[Poll]:
        raise NotImplementedError
    
    def get_active_poll(self, event_id: str) -> Optional[Poll]:
        raise NotImplementedError


class PollOptionRepository:
    """Interface for poll option data operations."""
    
    def get_by_id(self, option_id: str) -> Optional[PollOption]:
        raise NotImplementedError
    
    def create(self, option: PollOption) -> PollOption:
        raise NotImplementedError
    
    def get_by_poll(self, poll_id: str) -> List[PollOption]:
        raise NotImplementedError
    
    def delete_by_poll(self, poll_id: str) -> None:
        raise NotImplementedError


class VoteRepository:
    """Interface for vote data operations."""
    
    def has_voted(self, poll_id: str, user_id: str) -> bool:
        raise NotImplementedError
    
    def create(self, vote: Vote) -> Vote:
        raise NotImplementedError
    
    def count_by_option(self, option_id: str) -> int:
        raise NotImplementedError
    
    def list_by_poll(self, poll_id: str) -> List[Vote]:
        raise NotImplementedError


class MaterialRepository:
    """Interface for material data operations."""
    
    def get_by_id(self, material_id: str) -> Optional[Material]:
        raise NotImplementedError
    
    def create(self, material: Material) -> Material:
        raise NotImplementedError
    
    def delete(self, material_id: str) -> bool:
        raise NotImplementedError
    
    def list_by_event(self, event_id: str) -> List[Material]:
        raise NotImplementedError
