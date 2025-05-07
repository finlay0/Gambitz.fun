import { useMemo } from 'react';
import { getOpeningFromMoves } from '../../lib/opening_data';

export interface OpeningState {
  name: string | null;
  eco: string | null;
  variant: string | null;
  lastBookMove: number;
}

export const useOpeningRecognition = (moves: string[] | null | undefined): OpeningState => {
  return useMemo(() => {
    if (!moves || !Array.isArray(moves) || moves.length === 0) {
      return {
        name: null,
        eco: null,
        variant: null,
        lastBookMove: -1
      };
    }

    const opening = getOpeningFromMoves(moves);
    if (!opening) {
      return {
        name: null,
        eco: null,
        variant: null,
        lastBookMove: -1
      };
    }

    return {
      name: opening.name,
      eco: opening.eco,
      variant: (opening.variant ? opening.variant.replace(/\s+/g, ' ').trim() : null),
      lastBookMove: opening.moves.length
    };
  }, [moves]);
}; 