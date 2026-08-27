export type VoteQuestionStatus = 'Scheduled' | 'Open' | 'Closed';

export interface VoteResult {
  yesWeight: number;
  noWeight: number;
  abstainWeight: number;
  votedWeight: number;
  totalIdealParts: number;
  yesPercent: number;
  noPercent: number;
  abstainPercent: number;
  turnoutPercent: number;
  quorumThresholdPercent: number;
  quorumMet: boolean;
  isValid: boolean | null;
}

export interface VoteQuestionSummary {
  id: number;
  meetingId: number;
  question: string;
  startAt: string;
  endAt: string;
  status: VoteQuestionStatus;
  hasVoted: boolean;
  result: VoteResult;
}

export interface CreateVoteQuestionRequest {
  question: string;
  startAt: string;
  endAt: string;
}

export type VoteValue = 'Yes' | 'No' | 'Abstain';
