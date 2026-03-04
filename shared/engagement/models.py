"""
Engagement events data models.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, Dict, Any
from enum import Enum


class EngagementActionType(str, Enum):
    """Types of engagement actions."""
    JOIN_EVENT = "JOIN_EVENT"
    VOTE_POLL = "VOTE_POLL"
    DOWNLOAD_MATERIAL = "DOWNLOAD_MATERIAL"
    VIEW_MATERIAL = "VIEW_MATERIAL"
    OPEN_EVENT = "OPEN_EVENT"


@dataclass
class EngagementEvent:
    """Engagement event model."""
    id: str
    user_id: str
    event_id: str
    action_type: EngagementActionType
    metadata: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.utcnow)
    
    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "event_id": self.event_id,
            "action_type": self.action_type.value,
            "metadata": self.metadata,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
