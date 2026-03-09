// Poll types

export interface Poll {
  id: string;
  event_id: string;
  question: string;
  created_by?: string;
  status: 'draft' | 'active' | 'closed';
  created_at: string;
  options?: PollOption[];
}

export interface PollOption {
  id: string;
  poll_id: string;
  option_text: string;
}

export interface CreatePollInput {
  event_id: string;
  question: string;
  options: string[];
}

export interface PollResults {
  poll_id: string;
  question: string;
  results: {
    option: string;
    votes: number;
  }[];
}

export interface CastVoteInput {
  option_id: string;
}
