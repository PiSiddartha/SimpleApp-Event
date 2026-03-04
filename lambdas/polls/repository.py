"""
Polls repository layer.
Data access for poll operations.
"""

import logging
from typing import Optional, List

from shared.db import execute_query
from shared.models import (
    Poll, PollOption, PollStatus,
    PollRepository as IPollRepository,
    PollOptionRepository as IPollOptionRepository,
    Vote, VoteRepository as IVoteRepository
)

logger = logging.getLogger(__name__)


class PollRepository(IPollRepository):
    """Repository for poll data operations."""
    
    def get_by_id(self, poll_id: str) -> Optional[Poll]:
        """Get poll by ID."""
        return self.get_poll(poll_id)
    
    def get_poll(self, poll_id: str) -> Optional[Poll]:
        """Get poll by ID."""
        result = execute_query(
            "SELECT * FROM polls WHERE id = %s",
            (poll_id,),
            fetch="one"
        )
        
        return self._row_to_poll(result) if result else None
    
    def create_poll(self, poll: Poll) -> Poll:
        """Create a new poll."""
        execute_query(
            """
            INSERT INTO polls (
                id, event_id, question, created_by, status, created_at
            ) VALUES (
                %s, %s, %s, %s, %s, %s
            )
            """,
            (
                poll.id,
                poll.event_id,
                poll.question,
                poll.created_by,
                poll.status.value,
                poll.created_at,
            ),
            fetch="none"
        )
        
        logger.info(f"Created poll: {poll.id}")
        return poll
    
    def update_poll(self, poll: Poll) -> Poll:
        """Update a poll."""
        execute_query(
            """
            UPDATE polls SET
                status = %s
            WHERE id = %s
            """,
            (
                poll.status.value,
                poll.id,
            ),
            fetch="none"
        )
        
        logger.info(f"Updated poll: {poll.id}")
        return poll
    
    def delete_poll(self, poll_id: str) -> bool:
        """Delete a poll and its options/votes."""
        execute_query("DELETE FROM votes WHERE poll_id = %s", (poll_id,), fetch="none")
        execute_query("DELETE FROM poll_options WHERE poll_id = %s", (poll_id,), fetch="none")
        execute_query("DELETE FROM polls WHERE id = %s", (poll_id,), fetch="none")
        
        logger.info(f"Deleted poll: {poll_id}")
        return True
    
    def list_polls(self, event_id: str) -> List[Poll]:
        """List polls for an event."""
        results = execute_query(
            "SELECT * FROM polls WHERE event_id = %s ORDER BY created_at DESC",
            (event_id,),
            fetch="all"
        )
        
        return [self._row_to_poll(row) for row in results]
    
    def get_active_poll(self, event_id: str) -> Optional[Poll]:
        """Get active poll for an event."""
        result = execute_query(
            """
            SELECT * FROM polls 
            WHERE event_id = %s AND status = %s
            ORDER BY created_at DESC
            LIMIT 1
            """,
            (event_id, PollStatus.ACTIVE.value),
            fetch="one"
        )
        
        return self._row_to_poll(result) if result else None
    
    def _row_to_poll(self, row: dict) -> Poll:
        """Convert database row to Poll model."""
        return Poll(
            id=row["id"],
            event_id=row["event_id"],
            question=row["question"],
            created_by=row.get("created_by"),
            status=PollStatus(row.get("status", "draft")),
            created_at=row.get("created_at"),
        )


class PollOptionRepository(IPollOptionRepository):
    """Repository for poll option data operations."""
    
    def get_by_id(self, option_id: str) -> Optional[PollOption]:
        """Get poll option by ID."""
        result = execute_query(
            "SELECT * FROM poll_options WHERE id = %s",
            (option_id,),
            fetch="one"
        )
        
        return self._row_to_option(result) if result else None
    
    def create(self, option: PollOption) -> PollOption:
        """Create a poll option."""
        execute_query(
            """
            INSERT INTO poll_options (id, poll_id, option_text)
            VALUES (%s, %s, %s)
            """,
            (option.id, option.poll_id, option.option_text),
            fetch="none"
        )
        
        logger.info(f"Created poll option: {option.id}")
        return option
    
    def get_options(self, poll_id: str) -> List[PollOption]:
        """Get options for a poll."""
        results = execute_query(
            "SELECT * FROM poll_options WHERE poll_id = %s",
            (poll_id,),
            fetch="all"
        )
        
        return [self._row_to_option(row) for row in results]
    
    def delete_by_poll(self, poll_id: str) -> None:
        """Delete all options for a poll."""
        execute_query(
            "DELETE FROM poll_options WHERE poll_id = %s",
            (poll_id,),
            fetch="none"
        )
    
    def _row_to_option(self, row: dict) -> PollOption:
        """Convert database row to PollOption model."""
        return PollOption(
            id=row["id"],
            poll_id=row["poll_id"],
            option_text=row["option_text"],
        )


class VoteRepository(IVoteRepository):
    """Repository for vote data operations."""
    
    def has_voted(self, poll_id: str, user_id: str) -> bool:
        """Check if user has voted on a poll."""
        result = execute_query(
            "SELECT 1 FROM votes WHERE poll_id = %s AND user_id = %s",
            (poll_id, user_id),
            fetch="one"
        )
        
        return result is not None
    
    def create_vote(self, vote: Vote) -> Vote:
        """Create a new vote."""
        execute_query(
            """
            INSERT INTO votes (id, poll_id, option_id, user_id, created_at)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (vote.id, vote.poll_id, vote.option_id, vote.user_id, vote.created_at),
            fetch="none"
        )
        
        logger.info(f"Created vote: {vote.id}")
        return vote
    
    def count_by_option(self, option_id: str) -> int:
        """Count votes for an option."""
        result = execute_query(
            "SELECT COUNT(*) as count FROM votes WHERE option_id = %s",
            (option_id,),
            fetch="one"
        )
        
        return result["count"] if result else 0
    
    def list_by_poll(self, poll_id: str) -> List[Vote]:
        """List all votes for a poll."""
        results = execute_query(
            "SELECT * FROM votes WHERE poll_id = %s",
            (poll_id,),
            fetch="all"
        )
        
        return [self._row_to_vote(row) for row in results]
    
    def _row_to_vote(self, row: dict) -> Vote:
        """Convert database row to Vote model."""
        return Vote(
            id=row["id"],
            poll_id=row["poll_id"],
            option_id=row["option_id"],
            user_id=row["user_id"],
            created_at=row.get("created_at"),
        )
