"""
Polls service layer.
Business logic for poll operations.
"""

import uuid
import logging
from typing import Dict, Any, Optional, List

from polls.repository import PollRepository, PollOptionRepository, VoteRepository
from shared.db import execute_query

logger = logging.getLogger(__name__)


class PollService:
    """Service for poll-related business logic."""
    
    def __init__(self):
        self.poll_repo = PollRepository()
        self.option_repo = PollOptionRepository()
        self.vote_repo = VoteRepository()
        self._engagement_service = None
    
    @property
    def engagement_service(self):
        """Lazy load engagement service to avoid circular imports."""
        if self._engagement_service is None:
            from shared.engagement import get_engagement_service
            self._engagement_service = get_engagement_service()
        return self._engagement_service
    
    def create_poll(
        self,
        event_id: str,
        question: str,
        options: List[str],
        created_by: Optional[str] = None,
    ) -> Optional[Dict[str, Any]]:
        """
        Create a new poll with options.
        
        Returns:
            Dict with poll_id if successful, None if failed
        """
        from shared.models import Poll, PollOption, PollStatus
        
        if not question or not options or len(options) < 2:
            logger.warning("Poll must have a question and at least 2 options")
            return None
        if not event_id or not execute_query("SELECT id FROM events WHERE id = %s", (event_id,), fetch="one"):
            logger.warning("Cannot create poll for missing event: %s", event_id)
            return None
        
        # Create poll
        poll = Poll(
            id=str(uuid.uuid4()),
            event_id=event_id,
            question=question,
            created_by=created_by,
            status=PollStatus.ACTIVE,  # Auto-activate for now
        )
        
        poll = self.poll_repo.create_poll(poll)
        
        # Create options
        for option_text in options:
            option = PollOption(
                id=str(uuid.uuid4()),
                poll_id=poll.id,
                option_text=option_text,
            )
            self.option_repo.create(option)
        
        logger.info(f"Created poll: {poll.id} for event: {event_id}")
        
        return {
            "poll_id": poll.id,
            "event_id": event_id,
            "question": question,
            "options": options,
        }
    
    def update_poll(
        self,
        poll_id: str,
        user_id: str,
        **kwargs
    ) -> Optional[Dict[str, Any]]:
        """Update a poll (close, reopen, etc.)."""
        poll = self.poll_repo.get_poll(poll_id)
        
        if not poll:
            return None
        
        # Handle status changes
        if "status" in kwargs:
            from shared.models import PollStatus
            try:
                poll.status = PollStatus(kwargs["status"])
            except (TypeError, ValueError):
                logger.warning("Ignoring invalid poll status update: %s", kwargs["status"])

        return self.poll_repo.update_poll(poll).to_dict()
    
    def delete_poll(self, poll_id: str, user_id: str) -> bool:
        """Delete a poll."""
        poll = self.poll_repo.get_poll(poll_id)
        
        if not poll:
            return False
        
        return self.poll_repo.delete_poll(poll_id)
    
    def get_poll(self, poll_id: str) -> Optional[Dict[str, Any]]:
        """Get poll by ID with options."""
        poll = self.poll_repo.get_poll(poll_id)
        
        if not poll:
            return None
        
        options = self.option_repo.get_options(poll_id)
        
        result = poll.to_dict()
        result["options"] = [o.to_dict() for o in options]
        return result
    
    def get_results(self, poll_id: str) -> Optional[Dict[str, Any]]:
        """Get poll results with vote counts."""
        poll = self.poll_repo.get_poll(poll_id)
        
        if not poll:
            return None
        
        options = self.option_repo.get_options(poll_id)
        
        results = []
        for option in options:
            vote_count = self.vote_repo.count_by_option(option.id)
            results.append({
                "option": option.option_text,
                "votes": vote_count,
            })
        
        return {
            "poll_id": poll_id,
            "question": poll.question,
            "results": results,
        }
    
    def list_polls(self, event_id: str) -> List[Dict[str, Any]]:
        """List polls for an event."""
        polls = self.poll_repo.list_polls(event_id)
        
        result = []
        for poll in polls:
            poll_dict = poll.to_dict()
            options = self.option_repo.get_options(poll.id)
            poll_dict["options"] = [o.to_dict() for o in options]
            result.append(poll_dict)
        
        return result
    
    def cast_vote(
        self,
        poll_id: str,
        user_id: str,
        option_id: str,
    ) -> Optional[str]:
        """
        Cast a vote on a poll.
        
        Returns:
            - None if successful
            - "not_found" if poll not found
            - "not_active" if poll is not active
            - "invalid_option" if option is invalid
            - "duplicate" if user already voted
        """
        poll = self.poll_repo.get_poll(poll_id)
        
        if not poll:
            logger.warning(f"Poll not found: {poll_id}")
            return "not_found"
        
        if poll.status.value != "active":
            logger.warning(f"Poll is not active: {poll_id}")
            return "not_active"
        
        # Check if user already voted
        if self.vote_repo.has_voted(poll_id, user_id):
            logger.warning(f"User {user_id} already voted on poll {poll_id}")
            return "duplicate"
        
        # Validate option
        valid_options = {o.id for o in self.option_repo.get_options(poll_id)}
        if option_id not in valid_options:
            logger.warning(f"Invalid option: {option_id}")
            return "invalid_option"
        
        # Create vote
        from shared.models import Vote
        vote = Vote(
            id=str(uuid.uuid4()),
            poll_id=poll_id,
            option_id=option_id,
            user_id=user_id,
        )
        self.vote_repo.create_vote(vote)
        
        # Track engagement event
        try:
            self.engagement_service.track_vote(
                user_id=user_id,
                event_id=poll.event_id,
                poll_id=poll_id,
                option_id=option_id
            )
        except Exception as e:
            logger.warning(f"Failed to track engagement: {e}")
        
        logger.info(f"User {user_id} voted on poll {poll_id}")
        
        return None  # Success
