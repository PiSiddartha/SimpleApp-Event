"""
Event service layer.
Business logic for event operations.
"""

import uuid
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime

from events.repository import EventRepository

logger = logging.getLogger(__name__)

# Base URL for QR codes
QR_BASE_URL = "https://app.payintelli.com/event"


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
    ) -> Dict[str, Any]:
        """Create a new event."""
        from shared.models import Event, EventStatus, EventType
        
        # Generate event ID
        event_id = str(uuid.uuid4())
        
        # Parse timestamps
        start_dt = None
        end_dt = None
        if start_time:
            try:
                start_dt = datetime.fromisoformat(start_time.replace("Z", "+00:00"))
            except ValueError:
                logger.warning(f"Invalid start_time format: {start_time}")
        if end_time:
            try:
                end_dt = datetime.fromisoformat(end_time.replace("Z", "+00:00"))
            except ValueError:
                logger.warning(f"Invalid end_time format: {end_time}")
        
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
        )
        
        # Generate QR code URL
        event.qr_code = f"{QR_BASE_URL}/{event_id}"
        
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
        
        # Check ownership
        if event.created_by != user_id:
            raise PermissionError("Not authorized to update this event")
        
        # Update allowed fields
        updatable_fields = [
            "name", "description", "location", "event_type",
            "start_time", "end_time", "status", "max_attendees"
        ]
        
        for key, value in kwargs.items():
            if key in updatable_fields and hasattr(event, key):
                if key in ("start_time", "end_time") and value:
                    try:
                        value = datetime.fromisoformat(value.replace("Z", "+00:00"))
                    except ValueError:
                        logger.warning(f"Invalid {key} format: {value}")
                setattr(event, key, value)
        
        return self.repository.update(event).to_dict()
    
    def delete_event(self, event_id: str, user_id: str) -> bool:
        """Delete an event."""
        event = self.repository.get_by_id(event_id)
        
        if not event:
            return False
        
        if event.created_by != user_id:
            raise PermissionError("Not authorized to delete this event")
        
        return self.repository.delete(event_id)
    
    def get_event(self, event_id: str) -> Optional[Dict[str, Any]]:
        """Get event by ID."""
        event = self.repository.get_by_id(event_id)
        return event.to_dict() if event else None
    
    def list_events(self, limit: int = 50) -> List[Dict[str, Any]]:
        """List all events."""
        events = self.repository.get_all_events(limit)
        return [e.to_dict() for e in events]
