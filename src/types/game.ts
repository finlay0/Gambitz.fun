export type Player = 'white' | 'black';

export interface Move {
  from: string;
  to: string;
  promotion?: string;
  captured?: string;
  san: string;
}

export interface GameState {
  id: string;
  white: string; // player address
  black: string; // player address
  currentTurn: Player;
  moves: Move[];
  isComplete: boolean;
  winner?: Player;
  startTime: number;
  lastMoveTime: number;
  stake: number;
  escrowAddress?: string;
  metadata?: {
    timeControl?: string;
    tournamentId?: string;
    rating?: {
      white: number;
      black: number;
    };
  };
}

export interface GameError {
  code: string;
  message: string;
  details?: unknown;
} 