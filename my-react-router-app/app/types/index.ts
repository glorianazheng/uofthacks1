// User and Group types
export interface User {
  id: string;
  name: string;
  emoji: string;
  createdAt: Date;
}

export interface Group {
  id: string;
  name: string;
  createdBy: string;
  members: string[]; // user IDs
  createdAt: Date;
  inviteCode: string;
}

// Bet types
export type EventType = "sports" | "entertainment" | "weather" | "custom";
export type StakeType = "dishes" | "trash" | "vacuum" | "lunch" | "boba" | "drive" | "cook" | "custom";

export interface BetOutcome {
  id: string;
  label: string;
  weight?: number; // for weighted odds (1-10)
}

export interface Bet {
  id: string;
  groupId: string;
  hostId: string;
  title: string;
  eventType: EventType;
  description: string;
  outcomes: BetOutcome[];
  stake: {
    type: StakeType;
    description: string;
    weighted?: boolean;
    weights?: Record<string, number>; // outcomeId -> weight
  };
  deadline: Date;
  createdAt: Date;
  status: "open" | "locked" | "resolved" | "completed";
  resolution?: {
    winningOutcomeId: string;
    resolvedAt: Date;
    resolvedBy: string;
    confirmations: string[]; // user IDs who confirmed
  };
  losingOutcomeId?: string; // for resolved bets
}

export interface BetPick {
  id: string;
  betId: string;
  userId: string;
  outcomeId: string;
  confidence?: number; // 1-100, for weighted consequences
  createdAt: Date;
  completedAt?: Date;
  proofUrl?: string;
}

// Scoreboard types
export interface UserStats {
  userId: string;
  groupId: string;
  wins: number;
  losses: number;
  streak: number; // positive for wins, negative for losses
  totalBets: number;
  completedBets: number;
  badges: string[];
}

export interface Consequence {
  id: string;
  betId: string;
  userId: string;
  stakeDescription: string;
  dueDate: Date;
  status: "pending" | "completed" | "escalated";
  escalationLevel: number;
  createdAt: Date;
  completedAt?: Date;
  proofUrl?: string;
}
