import { useCallback, useEffect, useRef, useState } from 'react';
import { createLogger } from '../utils/logger';

const logger = createLogger('ChessTimer');

interface TimerState {
  white: number;
  black: number;
  active: 'white' | 'black';
  lastServerSync: number;
  moveStartTime: number;
}

const INITIAL_TIME = 180; // 3 minutes in seconds
const INCREMENT = 2; // 2 seconds added per move
const SYNC_INTERVAL = 5000; // Sync with server every 5 seconds
const MAX_TIME_DISCREPANCY = 2; // Maximum allowed time difference in seconds

export function useChessTimer(gameId: string, onTimeUpdate: (white: number, black: number) => Promise<void>) {
  const [timers, setTimers] = useState<TimerState>({
    white: INITIAL_TIME,
    black: INITIAL_TIME,
    active: 'white',
    lastServerSync: Date.now(),
    moveStartTime: Date.now(),
  });
  const intervalRef = useRef<NodeJS.Timeout>();
  const syncIntervalRef = useRef<NodeJS.Timeout>();

  const syncWithServer = useCallback(async () => {
    try {
      const now = Date.now();
      const timeSinceLastSync = (now - timers.lastServerSync) / 1000;
      
      // Calculate expected time based on server sync
      const expectedTime = {
        white: timers.white - (timers.active === 'white' ? timeSinceLastSync : 0),
        black: timers.black - (timers.active === 'black' ? timeSinceLastSync : 0),
      };

      // Update server with current times
      await onTimeUpdate(expectedTime.white, expectedTime.black);

      // Update local state with server-verified times
      setTimers(prev => ({
        ...prev,
        white: expectedTime.white,
        black: expectedTime.black,
        lastServerSync: now,
      }));

      logger.info('Timer synced with server', { 
        gameId, 
        white: expectedTime.white, 
        black: expectedTime.black 
      });
    } catch (error) {
      logger.error('Failed to sync timer with server', { gameId, error });
    }
  }, [timers, onTimeUpdate, gameId]);

  const startTimers = useCallback(() => {
    if (intervalRef.current) return;

    const now = Date.now();
    setTimers(prev => ({
      ...prev,
      moveStartTime: now,
      lastServerSync: now,
    }));

    // Start local timer
    intervalRef.current = setInterval(() => {
      setTimers(prev => {
        const now = Date.now();
        const elapsed = (now - prev.moveStartTime) / 1000;
        
        // Calculate new times
        const newTimes = {
          white: prev.white - (prev.active === 'white' ? elapsed : 0),
          black: prev.black - (prev.active === 'black' ? elapsed : 0),
        };

        // Check for time manipulation
        const timeDiscrepancy = Math.abs(
          (now - prev.lastServerSync) / 1000 - 
          (prev[prev.active] - newTimes[prev.active])
        );

        if (timeDiscrepancy > MAX_TIME_DISCREPANCY) {
          logger.warn('Time discrepancy detected', { 
            gameId, 
            discrepancy: timeDiscrepancy,
            expected: (now - prev.lastServerSync) / 1000,
            actual: prev[prev.active] - newTimes[prev.active]
          });
          // Force sync with server
          syncWithServer();
          return prev;
        }

        return {
          ...prev,
          ...newTimes,
          moveStartTime: now,
        };
      });
    }, 100);

    // Start server sync interval
    syncIntervalRef.current = setInterval(syncWithServer, SYNC_INTERVAL);
  }, [syncWithServer, gameId]);

  const stopTimers = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  }, []);

  const switchActiveTimer = useCallback(() => {
    setTimers(prev => {
      // Add increment to the player who just moved (current active player)
      const currentTime = prev[prev.active];
      return {
        ...prev,
        [prev.active]: currentTime + INCREMENT,
        active: prev.active === 'white' ? 'black' : 'white',
      };
    });
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    timers,
    startTimers,
    stopTimers,
    switchActiveTimer,
  };
} 