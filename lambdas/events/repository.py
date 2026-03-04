"""
Event repository layer.
Data access for event operations.
"""

import logging
from typing import Optional, List

from shared.db import execute_query
from shared.models import Event, EventStatus, EventType, EventRepository as IEventRepository

logger = logging.getLogger(__name__)


class EventRepository(IEventRepository):
    """Repository for event data operations."""
    
    def get_by_id(self, event_id: str) -> Optional[Event]:
        """Get event by ID."""
        result = execute_query(
            "SELECT * FROM events WHERE id = %s",
            (event_id,),
            fetch="one"
        )
        
        if not result:
            return None
        
        return self._row_to_event(result)
    
    def create(self, event: Event) -> Event:
        """Create a new event."""
        execute_query(
            """
            INSERT INTO events (
                id, name, description, location, event_type,
                start_time, end_time, created_by, status, qr_code, max_attendees,
                created_at
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
            )
            """,
            (
                event.id,
                event.name,
                event.description,
                event.location,
                event.event_type.value if event.event_type else EventType.OFFLINE.value,
                event.start_time,
                event.end_time,
                event.created_by,
                event.status.value,
                event.qr_code,
                event.max_attendees,
                event.created_at,
            ),
            fetch="none"
        )
        
        logger.info(f"Created event: {event.id}")
        return event
    
    def update(self, event: Event) -> Event:
        """Update an existing event."""
        execute_query(
            """
            UPDATE events SET
                name = %s, description = %s, location = %s,
                event_type = %s, start_time = %s, end_time = %s,
                status = %s, qr_code = %s, max_attendees = %s
            WHERE id = %s
            """,
            (
                event.name,
                event.description,
                event.location,
                event.event_type.value if event.event_type else EventType.OFFLINE.value,
                event.start_time,
                event.end_time,
                event.status.value,
                event.qr_code,
                event.max_attendees,
                event.id,
            ),
            fetch="none"
        )
        
        logger.info(f"Updated event: {event.id}")
        return event
    
    def delete(self, event_id: str) -> bool:
        """Delete an event."""
        execute_query(
            "DELETE FROM events WHERE id = %s",
            (event_id,),
            fetch="none"
        )
        
        logger.info(f"Deleted event: {event_id}")
        return True
    
    def get_all_events(self, limit: int = 50) -> List[Event]:
        """Get all events."""
        results = execute_query(
            """
            SELECT * FROM events 
            ORDER BY created_at DESC 
            LIMIT %s
            """,
            (limit,),
            fetch="all"
        )
        
        return [self._row_to_event(row) for row in results]
    
    def list_by_organizer(self, organizer_id: str, limit: int = 50) -> List[Event]:
        """List events by organizer."""
        results = execute_query(
            """
            SELECT * FROM events 
            WHERE created_by = %s 
            ORDER BY created_at DESC 
            LIMIT %s
            """,
            (organizer_id, limit),
            fetch="all"
        )
        
        return [self._row_to_event(row) for row in results]
    
    def list_published(self, limit: int = 50) -> List[Event]:
        """List published events."""
        results = execute_query(
            """
            SELECT * FROM events 
            WHERE status = %s 
            ORDER BY start_time ASC 
            LIMIT %s
            """,
            (EventStatus.PUBLISHED.value, limit),
            fetch="all"
        )
        
        return [self._row_to_event(row) for row in results]
    
    def list_all(self, limit: int = 50, offset: int = 0) -> List[Event]:
        """List all events with pagination."""
        results = execute_query(
            """
            SELECT * FROM events 
            ORDER BY created_at DESC 
            LIMIT %s OFFSET %s
            """,
            (limit, offset),
            fetch="all"
        )
        
        return [self._row_to_event(row) for row in results]
    
    def _row_to_event(self, row: dict) -> Event:
        """Convert database row to Event model."""
        return Event(
            id=row["id"],
            name=row["name"],
            description=row.get("description"),
            location=row.get("location"),
            event_type=EventType(row.get("event_type", "offline")),
            start_time=row.get("start_time"),
            end_time=row.get("end_time"),
            created_by=row.get("created_by"),
            status=EventStatus(row.get("status", "draft")),
            qr_code=row.get("qr_code"),
            max_attendees=row.get("max_attendees"),
            created_at=row.get("created_at"),
        )
