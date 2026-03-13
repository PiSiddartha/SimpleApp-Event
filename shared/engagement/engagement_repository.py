"""
Engagement repository layer.
Data access for engagement events.
"""

import logging
from typing import Dict, Any, List, Optional

from psycopg2.extras import Json

from shared.db import execute_query
from shared.engagement.models import EngagementEvent, EngagementActionType

logger = logging.getLogger(__name__)


class EngagementRepository:
    """Repository for engagement event data operations."""
    
    def log_event(
        self,
        user_id: str,
        event_id: str,
        action_type: str,
        metadata: Dict[str, Any] = None
    ) -> EngagementEvent:
        """Log an engagement event."""
        from datetime import datetime
        
        # Generate ID
        result = execute_query(
            "SELECT uuid_generate_v4() as id",
            fetch="one"
        )
        event_id_new = result["id"]
        
        # Insert event
        execute_query(
            """
            INSERT INTO engagement_events (
                id, user_id, event_id, action_type, metadata, created_at
            ) VALUES (
                %s, %s, %s, %s, %s, %s
            )
            """,
            (
                event_id_new,
                user_id,
                event_id,
                action_type,
                Json(metadata if metadata else {}),
                datetime.utcnow(),
            ),
            fetch="none"
        )
        
        logger.info(f"Logged engagement event: {action_type} for user {user_id}")
        
        return EngagementEvent(
            id=event_id_new,
            user_id=user_id,
            event_id=event_id,
            action_type=EngagementActionType(action_type),
            metadata=metadata or {},
        )
    
    def get_user_engagement(
        self,
        user_id: str,
        event_id: Optional[str] = None
    ) -> List[EngagementEvent]:
        """Get engagement events for a user, optionally filtered by event."""
        if event_id:
            results = execute_query(
                """
                SELECT * FROM engagement_events 
                WHERE user_id = %s AND event_id = %s
                ORDER BY created_at DESC
                """,
                (user_id, event_id),
                fetch="all"
            )
        else:
            results = execute_query(
                """
                SELECT * FROM engagement_events 
                WHERE user_id = %s
                ORDER BY created_at DESC
                """,
                (user_id,),
                fetch="all"
            )
        
        return [self._row_to_event(row) for row in results]
    
    def get_event_engagement(self, event_id: str) -> List[EngagementEvent]:
        """Get all engagement events for an event."""
        results = execute_query(
            """
            SELECT * FROM engagement_events 
            WHERE event_id = %s
            ORDER BY created_at DESC
            """,
            (event_id,),
            fetch="all"
        )
        
        return [self._row_to_event(row) for row in results]
    
    def count_by_action(
        self,
        event_id: str,
        action_type: Optional[str] = None
    ) -> int:
        """Count engagement events by action type."""
        if action_type:
            result = execute_query(
                """
                SELECT COUNT(*) as count FROM engagement_events 
                WHERE event_id = %s AND action_type = %s
                """,
                (event_id, action_type),
                fetch="one"
            )
        else:
            result = execute_query(
                """
                SELECT COUNT(*) as count FROM engagement_events 
                WHERE event_id = %s
                """,
                (event_id,),
                fetch="one"
            )
        
        return result["count"] if result else 0
    
    def get_user_scores(
        self,
        event_id: str,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Get engagement scores for users in an event, with display name from users table."""
        results = execute_query(
            """
            SELECT 
                ee.user_id,
                COALESCE(u.name, u.email, '') AS display_name,
                COUNT(*) AS total_actions,
                SUM(CASE WHEN ee.action_type = 'JOIN_EVENT' THEN 1 ELSE 0 END) AS join_count,
                SUM(CASE WHEN ee.action_type = 'VOTE_POLL' AND (ee.metadata->>'is_correct') = 'true' THEN 1 ELSE 0 END) AS correct_vote_count,
                SUM(CASE WHEN ee.action_type = 'VOTE_POLL' AND ((ee.metadata->>'is_correct') IS NULL OR (ee.metadata->>'is_correct') != 'true') THEN 1 ELSE 0 END) AS wrong_vote_count,
                SUM(CASE WHEN ee.action_type = 'DOWNLOAD_MATERIAL' THEN 1 ELSE 0 END) AS download_count,
                SUM(CASE WHEN ee.action_type = 'VIEW_MATERIAL' THEN 1 ELSE 0 END) AS view_count
            FROM engagement_events ee
            LEFT JOIN users u ON u.id = ee.user_id
            WHERE ee.event_id = %s
            GROUP BY ee.user_id, u.name, u.email
            ORDER BY total_actions DESC
            LIMIT %s
            """,
            (event_id, max(limit * 3, 50)),  # fetch extra so we can re-rank by score
            fetch="all"
        )
        
        scores = []
        for row in results:
            score = self._calculate_score(
                join_count=row.get("join_count", 0),
                correct_vote_count=row.get("correct_vote_count", 0),
                wrong_vote_count=row.get("wrong_vote_count", 0),
                download_count=row.get("download_count", 0),
                view_count=row.get("view_count", 0),
            )
            display_name = (row.get("display_name") or "").strip()
            scores.append({
                "user_id": str(row["user_id"]),
                "display_name": display_name if display_name else None,
                "score": score,
                "total_actions": row["total_actions"],
            })
        
        # Order by score descending (SQL ordered by total_actions; re-rank by score)
        scores.sort(key=lambda x: x["score"], reverse=True)
        return scores[:limit]
    
    def _calculate_score(
        self,
        join_count: int,
        correct_vote_count: int,
        wrong_vote_count: int,
        download_count: int,
        view_count: int
    ) -> int:
        """
        Calculate engagement score.
        
        Formula:
        - JOIN_EVENT: 20 points
        - VOTE_POLL correct: 60 points
        - VOTE_POLL wrong: 20 points
        - DOWNLOAD_MATERIAL: 20 points
        - VIEW_MATERIAL: 20 points
        """
        return (join_count * 20) + (correct_vote_count * 60) + (wrong_vote_count * 20) + (download_count * 20) + (view_count * 20)
    
    def get_average_score(self, event_id: str) -> float:
        """Get average engagement score for an event."""
        results = execute_query(
            """
            SELECT 
                user_id,
                COUNT(*) as total_actions,
                SUM(CASE WHEN action_type = 'JOIN_EVENT' THEN 1 ELSE 0 END) as join_count,
                SUM(CASE WHEN action_type = 'VOTE_POLL' AND (metadata->>'is_correct') = 'true' THEN 1 ELSE 0 END) as correct_vote_count,
                SUM(CASE WHEN action_type = 'VOTE_POLL' AND ((metadata->>'is_correct') IS NULL OR (metadata->>'is_correct') != 'true') THEN 1 ELSE 0 END) as wrong_vote_count,
                SUM(CASE WHEN action_type = 'DOWNLOAD_MATERIAL' THEN 1 ELSE 0 END) as download_count,
                SUM(CASE WHEN action_type = 'VIEW_MATERIAL' THEN 1 ELSE 0 END) as view_count
            FROM engagement_events
            WHERE event_id = %s
            GROUP BY user_id
            """,
            (event_id,),
            fetch="all"
        )
        
        if not results:
            return 0.0
        
        total_score = 0
        for row in results:
            score = self._calculate_score(
                join_count=row.get("join_count", 0),
                correct_vote_count=row.get("correct_vote_count", 0),
                wrong_vote_count=row.get("wrong_vote_count", 0),
                download_count=row.get("download_count", 0),
                view_count=row.get("view_count", 0),
            )
            total_score += score
        
        return round(total_score / len(results), 1)
    
    def _row_to_event(self, row: dict) -> EngagementEvent:
        """Convert database row to EngagementEvent model."""
        return EngagementEvent(
            id=row["id"],
            user_id=str(row["user_id"]),
            event_id=str(row["event_id"]),
            action_type=EngagementActionType(row["action_type"]),
            metadata=row.get("metadata", {}),
            created_at=row.get("created_at"),
        )
