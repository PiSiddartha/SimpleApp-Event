"""
Analytics service layer.
Business logic for analytics operations.
"""

import logging
from typing import Dict, Any, Optional

from analytics.repository import AnalyticsRepository

logger = logging.getLogger(__name__)


class AnalyticsService:
    """Service for analytics-related business logic."""
    
    def __init__(self):
        self.repository = AnalyticsRepository()
        self._engagement_service = None
    
    @property
    def engagement_service(self):
        """Lazy load engagement service."""
        if self._engagement_service is None:
            from shared.engagement import get_engagement_service
            self._engagement_service = get_engagement_service()
        return self._engagement_service
    
    def get_event_analytics(self, event_id: str) -> Optional[Dict[str, Any]]:
        """
        Get analytics for a specific event.
        
        Returns:
            Dict with event analytics or None if event not found
        """
        # Get attendance count
        attendance_count = self.repository.get_attendance_count(event_id)
        
        # Get poll stats
        poll_stats = self.repository.get_poll_stats(event_id)
        
        # Get material count
        material_count = self.repository.get_material_count(event_id)
        
        # Calculate participation rate
        participation_rate = 0.0
        if attendance_count > 0 and poll_stats.get("total_votes", 0) > 0:
            participation_rate = round(
                (poll_stats["total_votes"] / attendance_count) * 100, 1
            )
        
        # Get engagement scores from engagement system
        try:
            top_students = self.engagement_service.get_top_students(event_id, limit=10)
            average_engagement_score = self.engagement_service.get_average_score(event_id)
        except Exception as e:
            logger.warning(f"Failed to get engagement data: {e}")
            top_students = []
            average_engagement_score = 0.0
        
        return {
            "event_id": event_id,
            "attendance_count": attendance_count,
            "poll_participation": poll_stats.get("total_votes", 0),
            "polls": {
                "total_polls": poll_stats.get("total_polls", 0),
                "total_votes": poll_stats.get("total_votes", 0),
                "participation_rate": participation_rate,
            },
            "materials": {
                "total_materials": material_count,
            },
            "average_engagement_score": average_engagement_score,
            "top_students": top_students,
        }
    
    def get_overview(
        self,
        user_id: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Get platform-wide analytics overview.
        
        Returns:
            Dict with overview analytics
        """
        # Get event stats
        event_stats = self.repository.get_event_stats(user_id, start_date, end_date)
        
        # Get attendance stats
        attendance_stats = self.repository.get_overall_attendance(user_id, start_date, end_date)
        
        # Get poll stats
        poll_stats = self.repository.get_overall_poll_stats(user_id, start_date, end_date)
        
        return {
            "events": event_stats,
            "attendance": attendance_stats,
            "polls": poll_stats,
        }
    
    def get_student_analytics(self, student_id: str) -> Optional[Dict[str, Any]]:
        """
        Get analytics for a specific student.
        
        Returns:
            Dict with student analytics or None if student not found
        """
        # Get attendance history
        attendance = self.repository.get_student_attendance(student_id)
        
        if not attendance:
            return None
        
        # Get poll participation
        polls = self.repository.get_student_poll_stats(student_id)
        
        # Calculate engagement score
        engagement_score = self._calculate_engagement_score(attendance, polls)
        
        return {
            "student_id": student_id,
            "attendance": attendance,
            "polls": polls,
            "engagement_score": engagement_score,
        }
    
    def _calculate_engagement_score(
        self,
        attendance: Dict[str, Any],
        polls: Dict[str, Any],
    ) -> float:
        """
        Calculate student engagement score (0-100).
        
        Formula:
        - Attendance rate contributes 40%
        - Poll participation contributes 35%
        - Material engagement contributes 25% (placeholder)
        """
        score = 0.0
        
        # Attendance contributes 40%
        attendance_rate = attendance.get("attendance_rate", 0)
        if attendance_rate > 0:
            score += (attendance_rate / 100) * 40
        
        # Poll participation contributes 35%
        participation_rate = polls.get("participation_rate", 0)
        if participation_rate > 0:
            score += (participation_rate / 100) * 35
        
        # Material engagement contributes 25% (placeholder - always 0 for now)
        # In future: track actual downloads
        material_score = 0.0
        score += material_score * 0.25
        
        return round(score, 1)
