"""
Event service layer.
Business logic for event operations.
"""

import uuid
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

from events.repository import EventRepository

logger = logging.getLogger(__name__)
IST = ZoneInfo("Asia/Kolkata")


def _parse_event_datetime(value: Optional[str]) -> Optional[datetime]:
    """Parse incoming event timestamps, treating timezone-less inputs as IST and storing UTC."""
    if not value:
        return None

    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=IST)
    return parsed.astimezone(timezone.utc)

class EventService:
    """Service for event-related business logic."""
    
    def __init__(self):
        self.repository = EventRepository()
    
    def create_event(
        self,
        name: str,
        description: Optional[str],
        created_by: str,
        location: Optional[str] = None,
        event_type: str = "offline",
        start_time: Optional[str] = None,
        end_time: Optional[str] = None,
        max_attendees: Optional[int] = None,
        visibility: Optional[str] = "global",
    ) -> Dict[str, Any]:
        """Create a new event."""
        from shared.models import Event, EventStatus, EventType, EventVisibility
        
        # Generate event ID
        event_id = str(uuid.uuid4())
        
        # Parse timestamps
        start_dt = None
        end_dt = None
        if start_time:
            try:
                start_dt = _parse_event_datetime(start_time)
            except ValueError:
                logger.warning(f"Invalid start_time format: {start_time}")
        if end_time:
            try:
                end_dt = _parse_event_datetime(end_time)
            except ValueError:
                logger.warning(f"Invalid end_time format: {end_time}")
        
        try:
            vis = EventVisibility(visibility) if visibility else EventVisibility.GLOBAL
        except (ValueError, TypeError):
            vis = EventVisibility.GLOBAL
        
        event = Event(
            id=event_id,
            name=name,
            description=description,
            location=location,
            event_type=EventType(event_type) if event_type else EventType.OFFLINE,
            start_time=start_dt,
            end_time=end_dt,
            created_by=created_by,
            status=EventStatus.DRAFT,
            max_attendees=max_attendees,
            visibility=vis,
        )
        
        # QR payload consumed by mobile scanner. Use event_id directly so it
        # works across environments and does not depend on a web route.
        event.qr_code = event_id
        
        # Save to database
        self.repository.create(event)
        
        logger.info(f"Created event: {event_id} by user: {created_by}")
        
        return event.to_dict()
    
    def update_event(
        self,
        event_id: str,
        user_id: str,
        **kwargs
    ) -> Optional[Dict[str, Any]]:
        """Update an existing event."""
        event = self.repository.get_by_id(event_id)
        
        if not event:
            return None
        
        # Update allowed fields
        updatable_fields = [
            "name", "description", "location", "event_type",
            "start_time", "end_time", "status", "max_attendees", "visibility"
        ]
        
        from shared.models import EventType as EventTypeEnum, EventStatus as EventStatusEnum, EventVisibility
        for key, value in kwargs.items():
            if key in updatable_fields and hasattr(event, key):
                if key == "visibility" and value:
                    try:
                        value = EventVisibility(value) if value in ("global", "private") else event.visibility
                    except (ValueError, TypeError):
                        pass
                elif key == "event_type" and value:
                    try:
                        value = EventTypeEnum(value) if value in ("offline", "online", "hybrid") else getattr(event, key)
                    except (ValueError, TypeError):
                        pass
                elif key == "status" and value:
                    try:
                        value = EventStatusEnum(value) if value in ("draft", "published", "ongoing", "completed", "cancelled") else getattr(event, key)
                    except (ValueError, TypeError):
                        pass
                elif key in ("start_time", "end_time") and value:
                    try:
                        value = _parse_event_datetime(value)
                    except ValueError:
                        logger.warning(f"Invalid {key} format: {value}")
                setattr(event, key, value)
        
        return self.repository.update(event).to_dict()
    
    def delete_event(self, event_id: str, user_id: str) -> bool:
        """Delete an event."""
        event = self.repository.get_by_id(event_id)
        
        if not event:
            return False

        return self.repository.delete(event_id)
    
    def get_event(self, event_id: str) -> Optional[Dict[str, Any]]:
        """Get event by ID."""
        event = self.repository.get_by_id(event_id)
        return event.to_dict() if event else None
    
    def list_events(self, limit: int = 50, visibility: Optional[str] = None) -> List[Dict[str, Any]]:
        """List all events, optionally filtered by visibility (e.g. 'global' for public list)."""
        events = self.repository.get_all_events(limit=limit, visibility=visibility)
        return [e.to_dict() for e in events]
