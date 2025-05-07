export type Player = 'white' | 'black';

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  from: Position;
  to: Position;
  piece: string;
  captured?: string;
}

export interface GameState {
  id: string;
  board: string[][];
  currentPlayer: Player;
  isComplete: boolean;
  winner?: Player;
  lastMove?: Move;
  createdAt: number;
  updatedAt: number;
  whitePlayer?: string;
  blackPlayer?: string;
}

export interface GameHistory {
  moves: Array<{
    move: Move;
    player: Player;
    timestamp: number;
  }>;
  gameId: string;
}

export interface GameError {
  code: string;
  message: string;
  details?: unknown;
}

export type GameStatus = 'waiting' | 'active' | 'complete' | 'abandoned';

export interface GameSummary {
  id: string;
  status: GameStatus;
  currentPlayer: Player;
  lastMove?: Move;
  createdAt: number;
  updatedAt: number;
  whitePlayer?: string;
  blackPlayer?: string;
} 