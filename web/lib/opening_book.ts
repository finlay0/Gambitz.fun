import openingBook from './opening_data';

export interface OpeningBookEntry {
  eco: string;
  name: string;
  variant?: string;
  moves: string[];
}

// Convert opening book entries to the expected format
const openingBookEntries: OpeningBookEntry[] = Object.values(openingBook).map(opening => ({
  eco: opening.eco,
  name: opening.name,
  variant: opening.variant,
  moves: opening.moves
}));

export function findOpening(moves: string[]): OpeningBookEntry | null {
  if (!moves.length) return null;
  
  let bestMatch: OpeningBookEntry | null = null;
  let bestMatchLength = 0;

  // Find the longest matching opening
  openingBookEntries.forEach(opening => {
    const openingMoves = opening.moves;
    let matchLength = 0;

    // Count how many moves match
    for (let i = 0; i < Math.min(moves.length, openingMoves.length); i++) {
      if (moves[i] === openingMoves[i]) {
        matchLength++;
      } else {
        break;
      }
    }

    // Update best match if this one is longer
    if (matchLength > bestMatchLength) {
      bestMatchLength = matchLength;
      bestMatch = opening;
    }
  });

  return bestMatch;
} 