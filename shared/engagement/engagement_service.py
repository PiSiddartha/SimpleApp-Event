"""
Engagement service layer.
Business logic for engagement tracking.
"""

import logging
from typing import Dict, Any, Optional, List

from shared.engagement.engagement_repository import EngagementRepository

logger = logging.getLogger(__name__)


class EngagementService:
    """Service for engagement tracking."""
    
    def __init__(self):
        self.repository = EngagementRepository()
    
    def track_event(
        self,
        user_id: str,
        event_id: str,
        action_type: str,
        metadata: Dict[str, Any] = None
    ) -> None:
        """
        Track an engagement event.
        
        This is a lightweight operation that logs the event without
        blocking the main application flow.
        """
        try:
            self.repository.log_event(
                user_id=user_id,
                event_id=event_id,
                action_type=action_type,
                metadata=metadata
            )
            logger.info(f"Tracked engagement: {action_type} for user {user_id}")
        except Exception as e:
            # Don't break main flow if engagement tracking fails
            logger.warning(f"Failed to track engagement event: {e}")
    
    def track_join_event(self, user_id: str, event_id: str) -> None:
        """Track event join."""
        self.track_event(
            user_id=user_id,
            event_id=event_id,
            action_type="JOIN_EVENT",
            metadata={}
        )
    
    def track_vote(
        self,
        user_id: str,
        event_id: str,
        poll_id: str,
        option_id: str
    ) -> None:
        """Track poll vote."""
        self.track_event(
            user_id=user_id,
            event_id=event_id,
            action_type="VOTE_POLL",
            metadata={
                "poll_id": poll_id,
                "option_id": option_id
            }
        )
    
    def track_download(
        self,
        user_id: str,
        event_id: str,
        material_id: str
    ) -> None:
        """Track material download."""
        self.track_event(
            user_id=user_id,
            event_id=event_id,
            action_type="DOWNLOAD_MATERIAL",
            metadata={
                "material_id": material_id
            }
        )
    
    def track_view_material(
        self,
        user_id: str,
        event_id: str,
        material_id: str
    ) -> None:
        """Track material view."""
        self.track_event(
            user_id=user_id,
            event_id=event_id,
            action_type="VIEW_MATERIAL",
            metadata={
                "material_id": material_id
            }
        )
    
    def track_open_event(self, user_id: str, event_id: str) -> None:
        """Track event page open."""
        self.track_event(
            user_id=user_id,
            event_id=event_id,
            action_type="OPEN_EVENT",
            metadata={}
        )
    
    def get_user_engagement(
        self,
        user_id: str,
        event_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Get engagement history for a user."""
        events = self.repository.get_user_engagement(user_id, event_id)
        return [e.to_dict() for e in events]
    
    def get_event_engagement(self, event_id: str) -> List[Dict[str, Any]]:
        """Get all engagement for an event."""
        events = self.repository.get_event_engagement(event_id)
        return [e.to_dict() for e in events]
    
    def get_top_students(
        self,
        event_id: str,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Get top engaged students for an event."""
        return self.repository.get_user_scores(event_id, limit)
    
    def get_average_score(self, event_id: str) -> float:
        """Get average engagement score for an event."""
        return self.repository.get_average_score(event_id)


# Singleton instance for easy importing
_engagement_service: Optional[EngagementService] = None


def get_engagement_service() -> EngagementService:
    """Get or create engagement service instance."""
    global _engagement_service
    if _engagement_service is None:
        _engagement_service = EngagementService()
    return _engagement_service
