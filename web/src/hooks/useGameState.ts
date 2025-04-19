import { useCallback, useEffect, useReducer } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useConnection } from '@solana/wallet-adapter-react';
import { useMatchmaker } from './useMatchmaker';

export type GameState = {
  status: 'idle' | 'waiting' | 'playing' | 'finished';
  currentPlayer: 'white' | 'black' | null;
  timeRemaining: {
    white: number;
    black: number;
  };
  position: string;
  moveHistory: string[];
  result: 'checkmate' | 'timeout' | 'resignation' | null;
  winner: PublicKey | null;
};

type GameAction =
  | { type: 'START_GAME'; matchPda: PublicKey }
  | { type: 'MAKE_MOVE'; move: string }
  | { type: 'UPDATE_TIME'; white: number; black: number }
  | { type: 'END_GAME'; result: 'checkmate' | 'timeout' | 'resignation'; winner: PublicKey };

const initialState: GameState = {
  status: 'idle',
  currentPlayer: null,
  timeRemaining: {
    white: 180, // 3 minutes in seconds
    black: 180,
  },
  position: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  moveHistory: [],
  result: null,
  winner: null,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...state,
        status: 'playing',
        currentPlayer: 'white',
      };
    case 'MAKE_MOVE':
      return {
        ...state,
        moveHistory: [...state.moveHistory, action.move],
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
    default:
      return state;
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const { connection } = useConnection();
  const { matchPda } = useMatchmaker(0);

  // Subscribe to match account changes
  useEffect(() => {
    if (!matchPda) return;

    const subscriptionId = connection.onAccountChange(
      matchPda,
      (accountInfo) => {
        // TODO: Parse account data and dispatch appropriate actions
        // This will require implementing the account data parsing logic
      },
      'confirmed'
    );

    return () => {
      connection.removeAccountChangeListener(subscriptionId);
    };
  }, [connection, matchPda]);

  const makeMove = useCallback(async (move: string) => {
    if (!matchPda) return;
    // TODO: Implement move submission to program
    dispatch({ type: 'MAKE_MOVE', move });
  }, [matchPda]);

  const startGame = useCallback((matchPda: PublicKey) => {
    dispatch({ type: 'START_GAME', matchPda });
  }, []);

  const endGame = useCallback((result: 'checkmate' | 'timeout' | 'resignation', winner: PublicKey) => {
    dispatch({ type: 'END_GAME', result, winner });
  }, []);

  return {
    state,
    makeMove,
    startGame,
    endGame,
  };
} 