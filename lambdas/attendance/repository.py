"""
Attendance repository layer.
Data access for attendance operations.
"""

import logging
from typing import Optional, List

from shared.db import execute_query
from shared.models import Attendance, Event, EventStatus, EventType, EventVisibility, AttendanceRepository as IAttendanceRepository

logger = logging.getLogger(__name__)


class AttendanceRepository(IAttendanceRepository):
    """Repository for attendance data operations."""

    def get_event(self, event_id: str) -> Optional[Event]:
        """Fetch the related event without importing the events lambda package."""
        result = execute_query(
            "SELECT * FROM events WHERE id = %s",
            (event_id,),
            fetch="one",
        )
        if not result:
            return None
        return Event(
            id=result["id"],
            name=result["name"],
            description=result.get("description"),
            location=result.get("location"),
            event_type=EventType(result.get("event_type", "offline")),
            start_time=result.get("start_time"),
            end_time=result.get("end_time"),
            created_by=result.get("created_by"),
            status=EventStatus(result.get("status", "draft")),
            qr_code=result.get("qr_code"),
            max_attendees=result.get("max_attendees"),
            visibility=EventVisibility(result.get("visibility", "global")),
            created_at=result.get("created_at"),
        )
    
    def get_by_event_and_user(self, event_id: str, user_id: str) -> Optional[Attendance]:
        """Get attendance record by event and user."""
        result = execute_query(
            "SELECT * FROM attendance WHERE event_id = %s AND user_id = %s",
            (event_id, user_id),
            fetch="one"
        )
        
        return self._row_to_attendance(result) if result else None
    
    def get_attendance(self, user_id: str, event_id: str) -> Optional[Attendance]:
        """Get attendance record by user and event."""
        return self.get_by_event_and_user(event_id, user_id)
    
    def create_attendance(self, attendance: Attendance) -> Attendance:
        """Create a new attendance record."""
        execute_query(
            """
            INSERT INTO attendance (
                id, user_id, event_id, timestamp
            ) VALUES (
                %s, %s, %s, %s
            )
            """,
            (
                attendance.id,
                attendance.user_id,
                attendance.event_id,
                attendance.timestamp,
            ),
            fetch="none"
        )
        
        logger.info(f"Created attendance: {attendance.id}")
        return attendance
    
    def list_by_event(self, event_id: str) -> List[Attendance]:
        """List all attendance records for an event."""
        results = execute_query(
            """
            SELECT a.*, u.name as user_name, u.email as user_email
            FROM attendance a
            LEFT JOIN users u ON a.user_id = u.id
            WHERE a.event_id = %s
            ORDER BY a.timestamp DESC
            """,
            (event_id,),
            fetch="all"
        )
        
        return [self._row_to_attendance(row) for row in results]
    
    def list_by_user(self, user_id: str, limit: int = 50) -> List[Attendance]:
        """List attendance records for a user."""
        results = execute_query(
            """
            SELECT a.*, e.name as event_name
            FROM attendance a
            JOIN events e ON a.event_id = e.id
            WHERE a.user_id = %s
            ORDER BY a.timestamp DESC
            LIMIT %s
            """,
            (user_id, limit),
            fetch="all"
        )
        
        return [self._row_to_attendance(row) for row in results]
    
    def count_by_event(self, event_id: str) -> int:
        """Count attendance records for an event."""
        result = execute_query(
            "SELECT COUNT(*) as count FROM attendance WHERE event_id = %s",
            (event_id,),
            fetch="one"
        )
        
        return result["count"] if result else 0
    
    def _row_to_attendance(self, row: dict) -> Attendance:
        """Convert database row to Attendance model."""
        return Attendance(
            id=row["id"],
            user_id=row["user_id"],
            event_id=row["event_id"],
            timestamp=row.get("timestamp"),
        )
