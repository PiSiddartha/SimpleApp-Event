"""
Attendance service layer.
Business logic for attendance operations.
"""

import uuid
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime, timezone, timedelta

from attendance.repository import AttendanceRepository

logger = logging.getLogger(__name__)


class AttendanceService:
    """Service for attendance-related business logic."""
    
    def __init__(self):
        self.attendance_repo = AttendanceRepository()
        self._engagement_service = None
    
    @property
    def engagement_service(self):
        """Lazy load engagement service to avoid circular imports."""
        if self._engagement_service is None:
            from shared.engagement import get_engagement_service
            self._engagement_service = get_engagement_service()
        return self._engagement_service
    
    def join_event(self, user_id: str, event_id: str) -> Optional[Dict[str, Any]]:
        """
        Join an event (mark attendance).
        
        Returns:
            - Dict with success message if attendance recorded
            - "duplicate" if already joined
            - "not_started" if event hasn't started
            - "ended" if event has ended
            - None if event not found
        """
        # Verify event exists
        event = self.attendance_repo.get_event(event_id)
        
        if not event:
            logger.warning(f"Event not found: {event_id}")
            return None
        
        # Check if user already joined
        existing = self.attendance_repo.get_attendance(user_id, event_id)
        if existing:
            logger.info(f"User {user_id} already joined event {event_id}")
            return "duplicate"
        
        # Check event timing (optional validation)
        now = datetime.now(timezone.utc)
        
        if event.start_time:
            # Allow joining 15 minutes before start
            start_utc = event.start_time
            if start_utc.tzinfo is None:
                start_utc = start_utc.replace(tzinfo=timezone.utc)
            allowed_start = start_utc - timedelta(minutes=15)
            if now < allowed_start:
                logger.info(f"Event {event_id} has not started yet")
                return "not_started"
        
        if event.end_time:
            # Check if event has ended
            event_end = event.end_time
            if event_end.tzinfo is None:
                event_end = event_end.replace(tzinfo=timezone.utc)
            if now > event_end:
                logger.info(f"Event {event_id} has already ended")
                return "ended"
        
        # Create attendance record
        from shared.models import Attendance
        attendance = Attendance(
            id=str(uuid.uuid4()),
            user_id=user_id,
            event_id=event_id,
            timestamp=now,
        )
        
        self.attendance_repo.create_attendance(attendance)
        
        # Track engagement event
        try:
            self.engagement_service.track_join_event(user_id, event_id)
        except Exception as e:
            logger.warning(f"Failed to track engagement: {e}")
        
        logger.info(f"User {user_id} joined event {event_id}")
        
        return {
            "message": "Attendance recorded successfully",
            "event_id": event_id,
            "timestamp": now.isoformat()
        }
    
    def get_event_attendance(self, event_id: str) -> List[Dict[str, Any]]:
        """Get all attendance records for an event."""
        records = self.attendance_repo.list_by_event(event_id)
        return [r.to_dict() for r in records]
    
    def get_attendance_count(self, event_id: str) -> int:
        """Get attendance count for an event."""
        return self.attendance_repo.count_by_event(event_id)
    
    def list_user_attendance(
        self,
        user_id: str,
        limit: int = 50,
    ) -> List[Dict[str, Any]]:
        """List attendance records for a user."""
        records = self.attendance_repo.list_by_user(user_id, limit)
        return [r.to_dict() for r in records]
