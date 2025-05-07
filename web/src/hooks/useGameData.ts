/* eslint-disable */
import useSWR from 'swr';
import { useState, useCallback } from 'react';
import { GameState, Move, Player } from '../types/game';
import { handleError } from '../utils/errorHelper';

interface GameData {
  state: GameState | null;
  history: Array<{
    move: Move;
    player: Player;
    timestamp: number;
  }>;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  mutate?: (newData: any, options?: any) => Promise<void>;
}

const fetcher = async (url: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    handleError(error, 'GameDataFetcher');
    throw error;
  }
};

// Main hook to fetch game data
export function useGameData(gameId: string): GameData {
  // State data
  const {
    data: state,
    error: stateError,
    isLoading: isStateLoading,
    mutate: stateMutate,
  } = useSWR<GameState>(
    gameId ? `/api/games/${gameId}/state` : null,
    fetcher,
    {
      refreshInterval: 1000, // Refresh every second
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 500, // Dedupe requests within 500ms
    }
  );

  // History data
  const {
    data: history,
    error: historyError,
    isLoading: isHistoryLoading,
    mutate: historyMutate,
  } = useSWR<Array<{ move: Move; player: Player; timestamp: number }>>(
    gameId ? `/api/games/${gameId}/history` : null,
    fetcher,
    {
      refreshInterval: 2000, // Refresh every 2 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 1000, // Dedupe requests within 1s
    }
  );

  const mutate = useCallback(
    async (newData: any, options?: any) => {
      await Promise.all([
        stateMutate(newData.state, options),
        historyMutate(newData.history, options),
      ]);
    },
    [stateMutate, historyMutate]
  );

  return {
    state: state || null,
    history: history || [],
    isLoading: isStateLoading || isHistoryLoading,
    isError: !!stateError || !!historyError,
    error: stateError || historyError || null,
    mutate,
  };
}

// Helper hook for optimistic updates
export function useOptimisticGameData(gameId: string) {
  const gameData = useGameData(gameId);
  
  const optimisticUpdate = async (
    newState: Partial<GameState>,
    newMove?: { move: Move; player: Player; timestamp: number }
  ) => {
    // Optimistically update the local state
    if (gameData.mutate) {
      await gameData.mutate(
        {
          state: gameData.state ? { ...gameData.state, ...newState } : null,
          history: newMove
            ? [...(gameData.history || []), newMove]
            : gameData.history || [],
        },
        {
          revalidate: false, // Don't revalidate immediately
          rollbackOnError: true, // Rollback on error
        }
      );
    }
  };

  return {
    ...gameData,
    optimisticUpdate,
  };
} 