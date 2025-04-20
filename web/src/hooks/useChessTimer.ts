import { useCallback, useEffect, useRef, useState } from 'react';

interface TimerState {
  white: number;
  black: number;
  active: 'white' | 'black';
}

const INITIAL_TIME = 180; // 3 minutes in seconds
const INCREMENT = 2; // 2 seconds added per move

export function useChessTimer() {
  const [timers, setTimers] = useState<TimerState>({
    white: INITIAL_TIME,
    black: INITIAL_TIME,
    active: 'white',
  });
  const intervalRef = useRef<NodeJS.Timeout>();

  const startTimers = useCallback(() => {
    if (intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      setTimers(prev => {
        if (prev[prev.active] <= 0) return prev;
        return {
          ...prev,
          [prev.active]: prev[prev.active] - 1,
        };
      });
    }, 1000);
  }, []);

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