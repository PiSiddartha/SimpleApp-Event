// Poll types

export interface Poll {
  id: string;
  event_id: string;
  question: string;
  created_by?: string;
  status: 'draft' | 'active' | 'closed';
  material_id?: string | null;
  created_at: string;
  options?: PollOption[];
}

export interface PollOption {
  id: string;
  poll_id: string;
  option_text: string;
  is_correct?: boolean;
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
    option_id?: string;
    option: string;
    votes: number;
    is_correct?: boolean;
  }[];
}

export interface CastVoteInput {
  option_id: string;
}
