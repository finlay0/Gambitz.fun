import { useCallback, useEffect, useReducer } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useConnection } from '@solana/wallet-adapter-react';

export type Opening = {
  eco: string;
  name: string;
  variant?: string; // Keep variant optional as in useOpeningRecognition
  nftOwner: PublicKey | null; // Changed from string | null
};

export type GameState = {
  status: 'idle' | 'waiting' | 'playing' | 'finished';
  currentPlayer: 'white' | 'black' | null;
  timeRemaining: {
    white: number;
    black: number;
  };
  position: string;
  moveHistory: string[];
  result: 'checkmate' | 'timeout' | 'resignation' | 'draw' | null; // Added 'draw'
  winner: PublicKey | null; // Can be SystemProgram.programId for draws
  gameOpening: Opening | null; // Changed from openings: { white: Opening | null; black: Opening | null; }
  // For board/page.tsx compatibility, ensure Chess instance is available if needed
  board?: unknown; // chess.js instance, keep as any for now if not strongly typed elsewhere
  gameId?: PublicKey | string | null; // Keep for compatibility if used
  whitePlayer?: PublicKey | null; // Keep for compatibility if used
  blackPlayer?: PublicKey | null; // Keep for compatibility if used
};

type GameAction =
  | { type: 'START_GAME'; matchPda: PublicKey, whitePlayer: PublicKey, blackPlayer: PublicKey } // Added player info
  | { type: 'MAKE_MOVE'; move: string; newPosition: string; } // Added newPosition
  | { type: 'UPDATE_TIME'; white: number; black: number }
  | { type: 'END_GAME'; result: 'checkmate' | 'timeout' | 'resignation' | 'draw'; winner: PublicKey } // Added 'draw'
  | { type: 'UPDATE_OPENING'; opening: Opening | null } // Removed color
  | { type: 'SET_BOARD_INSTANCE'; board: unknown } // Action to set chess.js instance
  | { type: 'RESET_GAME' }; // Action to reset game

const initialState: GameState = {
  status: 'idle',
  currentPlayer: null,
  timeRemaining: {
    white: 180, // 3 minutes in seconds
    black: 180,
  },
  position: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', // Standard FEN
  moveHistory: [],
  result: null,
  winner: null,
  gameOpening: null, // Changed from openings
  board: null, // Initialize board as null
  gameId: null,
  whitePlayer: null,
  blackPlayer: null,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...initialState, // Reset to initial state but keep some fields
        status: 'playing',
        currentPlayer: 'white',
        gameId: action.matchPda,
        whitePlayer: action.whitePlayer,
        blackPlayer: action.blackPlayer,
        // board should be set by SET_BOARD_INSTANCE if a new Chess() is created
      };
    case 'MAKE_MOVE':
      return {
        ...state,
        moveHistory: [...state.moveHistory, action.move],
        position: action.newPosition, // Update position from action
        currentPlayer: state.currentPlayer === 'white' ? 'black' : 'white',
      };
    case 'UPDATE_TIME':
      return {
        ...state,
        timeRemaining: {
          white: action.white,
          black: action.black,
        },
      };
    case 'END_GAME':
      return {
        ...state,
        status: 'finished',
        result: action.result,
        winner: action.winner,
      };
    case 'UPDATE_OPENING':
      return {
        ...state,
        gameOpening: action.opening, // Set gameOpening
      };
    case 'SET_BOARD_INSTANCE':
      return {
        ...state,
        board: action.board,
      };
    case 'RESET_GAME':
      return {
        ...initialState,
        board: state.board ? new (state.board.constructor)() : null, // Reset board if it exists
      };
    default:
      return state;
  }
}

export function useGameState() {
  const [gameState, dispatch] = useReducer(gameReducer, initialState);
  const { connection } = useConnection();
  // matchPda from useMatchmaker might not be what we want to use for onAccountChange subscription here
  // as it's tied to the matchmaking process, not necessarily an active game.
  // The gameId is set via START_GAME.

  // Subscribe to match account changes (Placeholder - requires actual on-chain match state type)
  useEffect(() => {
    if (!gameState.gameId || typeof gameState.gameId === 'string') return; // Ensure gameId is PublicKey

    const subscriptionId = connection.onAccountChange(
      gameState.gameId as PublicKey, // Cast because we checked it's not a string
      (accountInfo) => {
        // TODO: Parse account data (e.g., from a specific MatchState type from the program)
        // and dispatch appropriate actions.
        // e.g., if (accountInfo.data contains new move) dispatch MAKE_MOVE
        // e.g., if (accountInfo.data shows game ended) dispatch END_GAME
        console.log('Match account changed:', accountInfo);
      },
      'confirmed'
    );

    return () => {
      connection.removeAccountChangeListener(subscriptionId);
    };
  }, [connection, gameState.gameId]);

  const makeMove = useCallback((move: string, newPosition: string) => {
    // Client-side move update. On-chain update is separate.
    dispatch({ type: 'MAKE_MOVE', move, newPosition });
  }, []);

  const startGame = useCallback((matchPda: PublicKey, whitePlayer: PublicKey, blackPlayer: PublicKey) => {
    dispatch({ type: 'START_GAME', matchPda, whitePlayer, blackPlayer });
  }, []);

  const endGame = useCallback((result: 'checkmate' | 'timeout' | 'resignation' | 'draw', winner: PublicKey) => {
    dispatch({ type: 'END_GAME', result, winner });
  }, []);

  const updateOpening = useCallback((opening: Opening | null) => { // Removed color
    dispatch({ type: 'UPDATE_OPENING', opening });
  }, []);

  const setBoardInstance = useCallback((board: unknown) => {
    dispatch({ type: 'SET_BOARD_INSTANCE', board });
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, []);


  return {
    // Expose individual state fields for common use
    status: gameState.status,
    currentPlayer: gameState.currentPlayer,
    position: gameState.position,
    moveHistory: gameState.moveHistory,
    timeRemaining: gameState.timeRemaining,
    gameOpening: gameState.gameOpening,
    result: gameState.result,
    winner: gameState.winner,
    gameId: gameState.gameId,
    whitePlayer: gameState.whitePlayer,
    blackPlayer: gameState.blackPlayer,
    board: gameState.board, // Expose chess.js instance

    // Expose dispatchers
    makeMove,
    startGame,
    endGame,
    updateOpening,
    setBoardInstance,
    resetGame,
    
    // Expose the full gameState object if needed, though direct field access is preferred
    rawGameState: gameState, 
    // error field was present in previous return, keeping for compatibility if used elsewhere
    error: null, 
    // playerColor was an alias for currentPlayer, use currentPlayer directly
  };
} 