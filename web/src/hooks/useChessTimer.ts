import { useEffect, useState, useCallback } from 'react';
import { Chess } from 'chess.js';

interface TimerState {
  white: number;
  black: number;
  active: 'white' | 'black';
}

interface TimerControls {
  timers: TimerState;
  startTimers: () => void;
  stopTimers: () => void;
  switchActiveTimer: () => void;
}

const INITIAL_TIME = 3 * 60; // 3 minutes in seconds
const INCREMENT = 2; // 2 seconds added per move

export const useChessTimer = (game: Chess): TimerControls => {
  const [timers, setTimers] = useState<TimerState>({
    white: INITIAL_TIME,
    black: INITIAL_TIME,
    active: 'white'
  });
  const [isRunning, setIsRunning] = useState(false);

  // Update active timer every second
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimers(prev => {
        if (prev[prev.active] <= 0) {
          setIsRunning(false);
          return prev;
        }
        return {
          ...prev,
          [prev.active]: prev[prev.active] - 1
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const startTimers = useCallback(() => {
    setIsRunning(true);
  }, []);

  const stopTimers = useCallback(() => {
    setIsRunning(false);
  }, []);

  const switchActiveTimer = useCallback(() => {
    setTimers(prev => {
      // Add increment to the player who just moved (current active player)
      const currentTime = prev[prev.active];
      return {
        ...prev,
        [prev.active]: currentTime + INCREMENT,
        active: prev.active === 'white' ? 'black' : 'white'
      };
    });
  }, []);

  return {
    timers,
    startTimers,
    stopTimers,
    switchActiveTimer
  };
}; 