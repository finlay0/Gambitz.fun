import { Chess } from 'chess.js';
import openingMints from './openings.json';
import openings from '../../scripts/opening_data_out';

export interface Opening {
  name: string;
  eco: string;
  variant?: string;
  moves: string[];
}

export type OpeningsMap = Record<string, Opening>;

// Type for the openings.json file (NFT mint addresses)
type OpeningMints = Record<string, string>;

// Convert PGN string to array of moves
function pgnToMoves(pgn: string): string[] {
  try {
    const chess = new Chess();
    // Ensure PGN is properly terminated
    const cleanPgn = pgn.trim().replace(/\s+$/, '');
    chess.loadPgn(cleanPgn);
    
    // Validate moves
    const moves = chess.history();
    if (!moves.length) {
      console.warn(`No valid moves found in PGN: ${pgn}`);
      return [];
    }
    
    return moves;
  } catch (error) {
    console.warn(`Failed to parse PGN: ${pgn}`, error);
    return [];
  }
}

// Initialize opening book
const openingBook: OpeningsMap = {};

// Load openings into the book
openings.forEach(opening => {
  const moves = pgnToMoves(opening.pgn);
  if (moves.length > 0) {
    openingBook[opening.eco] = {
      name: opening.name,
      eco: opening.eco,
      variant: opening.variant,
      moves
    };
  } else {
    console.warn(`Skipping opening ${opening.eco} due to invalid PGN`);
  }
});

// Get opening info from a sequence of moves
export function getOpeningFromMoves(moves: string[]): Opening | null {
  if (!moves || moves.length === 0) return null;

  let bestMatch: Opening | null = null;

  for (const eco in openingBook) {
    const openingEntry = openingBook[eco];
    const bookMoves = openingEntry.moves;
    const playerMoves = moves;

    // Check if bookMoves is a prefix of playerMoves
    if (playerMoves.length >= bookMoves.length) {
      let isPrefix = true;
      for (let i = 0; i < bookMoves.length; i++) {
        if (playerMoves[i] !== bookMoves[i]) {
          isPrefix = false;
          break;
        }
      }

      if (isPrefix) {
        // If it's a prefix, and this opening is more specific (longer book line)
        // than the current bestMatch, or if there's no bestMatch yet.
        if (!bestMatch || bookMoves.length > bestMatch.moves.length) {
          bestMatch = openingEntry;
        }
      }
    }
  }

  if (bestMatch) {
    // Normalize variant whitespace before returning
    const bm = { ...bestMatch }; // Create a copy to avoid mutating the openingBook
    if (bm.variant) {
      bm.variant = bm.variant.replace(/\s+/g, ' ').trim();
    }
    return bm;
  }

  return null;
}

// Get opening info from FEN (placeholder for future implementation)
export function getOpeningFromFen(): Opening | null {
  // TODO: Implement FEN-based opening detection
  return null;
}

// Get NFT mint address for an opening
export function getOpeningMint(eco: string): string | null {
  return (openingMints as OpeningMints)[eco] || null;
}

export default openingBook; 