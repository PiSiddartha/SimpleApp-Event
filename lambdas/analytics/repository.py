"""
Analytics repository layer.
Data access for analytics operations.
"""

import logging
from typing import Optional, Dict, Any

from shared.db import execute_query

logger = logging.getLogger(__name__)


class AnalyticsRepository:
    """Repository for analytics data operations."""

    def event_exists(self, event_id: str) -> bool:
        """Return whether the target event exists."""
        result = execute_query(
            "SELECT id FROM events WHERE id = %s",
            (event_id,),
            fetch="one"
        )
        return bool(result)

    def get_event_owner_id(self, event_id: str) -> Optional[str]:
        """Return the creator user id for an event."""
        result = execute_query(
            "SELECT created_by FROM events WHERE id = %s",
            (event_id,),
            fetch="one"
        )
        return result["created_by"] if result else None

    def is_event_attendee(self, event_id: str, user_id: str) -> bool:
        """Return whether the given app user has joined the event."""
        result = execute_query(
            """
            SELECT id
            FROM attendance
            WHERE event_id = %s AND user_id = %s
            LIMIT 1
            """,
            (event_id, user_id),
            fetch="one"
        )
        return bool(result)

    def user_exists(self, user_id: str) -> bool:
        """Return whether the target user exists."""
        result = execute_query(
            "SELECT id FROM users WHERE id = %s",
            (user_id,),
            fetch="one"
        )
        return bool(result)
    
    def get_attendance_count(self, event_id: str) -> int:
        """Get attendance count for an event."""
        result = execute_query(
            "SELECT COUNT(*) as count FROM attendance WHERE event_id = %s",
            (event_id,),
            fetch="one"
        )
        
        return result["count"] if result else 0
    
    def get_poll_stats(self, event_id: str) -> Dict[str, Any]:
        """Get poll statistics for an event."""
        # Count polls
        polls_result = execute_query(
            "SELECT COUNT(*) as total FROM polls WHERE event_id = %s",
            (event_id,),
            fetch="one"
        )
        
        # Count votes across all polls for this event
        votes_result = execute_query(
            """
            SELECT COUNT(*) as total_votes
            FROM votes v
            JOIN polls p ON v.poll_id = p.id
            WHERE p.event_id = %s
            """,
            (event_id,),
            fetch="one"
        )
        
        return {
            "total_polls": polls_result["total"] if polls_result else 0,
            "total_votes": votes_result["total_votes"] if votes_result else 0,
        }
    
    def get_material_count(self, event_id: str) -> int:
        """Get material count for an event."""
        result = execute_query(
            "SELECT COUNT(*) as count FROM materials WHERE event_id = %s",
            (event_id,),
            fetch="one"
        )
        
        return result["count"] if result else 0
    
    def get_event_stats(
        self,
        user_id: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Get event statistics for user's events."""
        query = """
            SELECT 
                COUNT(*) as total_events,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as upcoming,
                SUM(CASE WHEN status = 'ongoing' THEN 1 ELSE 0 END) as ongoing
            FROM events 
            WHERE created_by = %s
        """
        params = [user_id]
        
        if start_date:
            query += " AND created_at >= %s"
            params.append(start_date)
        
        if end_date:
            query += " AND created_at <= %s"
            params.append(end_date)
        
        result = execute_query(query, tuple(params), fetch="one")
        
        return {
            "total": result["total_events"] if result else 0,
            "completed": result["completed"] if result else 0,
            "upcoming": result["upcoming"] if result else 0,
            "ongoing": result["ongoing"] if result else 0,
        }
    
    def get_overall_attendance(
        self,
        user_id: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Get overall attendance statistics."""
        query = """
            SELECT 
                COUNT(DISTINCT a.id) as total_attendances,
                COUNT(DISTINCT a.user_id) as unique_attendees,
                COUNT(DISTINCT e.id) as events_with_attendance
            FROM attendance a
            JOIN events e ON a.event_id = e.id
            WHERE e.created_by = %s
        """
        params = [user_id]
        
        if start_date:
            query += " AND a.timestamp >= %s"
            params.append(start_date)
        
        if end_date:
            query += " AND a.timestamp <= %s"
            params.append(end_date)
        
        result = execute_query(query, tuple(params), fetch="one")
        
        return {
            "total_attendances": result["total_attendances"] if result else 0,
            "unique_attendees": result["unique_attendees"] if result else 0,
            "events_with_attendance": result["events_with_attendance"] if result else 0,
        }
    
    def get_overall_poll_stats(
        self,
        user_id: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Get overall poll statistics."""
        query = """
            SELECT 
                COUNT(DISTINCT p.id) as total_polls,
                COUNT(DISTINCT v.id) as total_votes,
                COUNT(DISTINCT v.user_id) as unique_voters
            FROM polls p
            JOIN events e ON p.event_id = e.id
            LEFT JOIN votes v ON p.id = v.poll_id
            WHERE e.created_by = %s
        """
        params = [user_id]
        
        if start_date:
            query += " AND p.created_at >= %s"
            params.append(start_date)
        
        if end_date:
            query += " AND p.created_at <= %s"
            params.append(end_date)
        
        result = execute_query(query, tuple(params), fetch="one")
        
        return {
            "total_polls": result["total_polls"] if result else 0,
            "total_votes": result["total_votes"] if result else 0,
            "unique_voters": result["unique_voters"] if result else 0,
        }
    
    def get_student_attendance(self, student_id: str) -> Optional[Dict[str, Any]]:
        """Get attendance history for a student."""
        result = execute_query(
            """
            SELECT 
                COUNT(*) as total_attendances,
                COUNT(DISTINCT event_id) as unique_events
            FROM attendance 
            WHERE user_id = %s
            """,
            (student_id,),
            fetch="one"
        )
        
        if not result or result["total_attendances"] == 0:
            return None
        
        # Calculate attendance rate (vs total events in system)
        total_events = execute_query(
            "SELECT COUNT(*) as count FROM events",
            fetch="one"
        )
        
        total = total_events["count"] if total_events else 1
        rate = round((result["total_attendances"] / total) * 100, 1)
        
        return {
            "total_attendances": result["total_attendances"],
            "unique_events": result["unique_events"],
            "attendance_rate": rate,
        }
    
    def get_student_poll_stats(self, student_id: str) -> Optional[Dict[str, Any]]:
        """Get poll participation for a student."""
        result = execute_query(
            """
            SELECT 
                COUNT(DISTINCT poll_id) as polls_answered,
                COUNT(*) as total_votes
            FROM votes 
            WHERE user_id = %s
            """,
            (student_id,),
            fetch="one"
        )
        
        if not result or result["polls_answered"] == 0:
            return {
                "polls_answered": 0,
                "total_votes": 0,
                "participation_rate": 0.0,
            }
        
        # Calculate participation rate
        total_polls = execute_query(
            "SELECT COUNT(*) as count FROM polls",
            fetch="one"
        )
        
        total = total_polls["count"] if total_polls else 1
        rate = round((result["polls_answered"] / total) * 100, 1)
        
        return {
            "polls_answered": result["polls_answered"],
            "total_votes": result["total_votes"],
            "participation_rate": rate,
        }
