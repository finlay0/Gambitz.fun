import { Chess } from 'chess.js';
// Attempt to import, but handle if they are missing/malformed later
let openingMintsData: any = null;
try {
  openingMintsData = require('./openings.json');
} catch (e) {
  console.error("CRITICAL: Failed to load './openings.json'. Opening NFT mint lookups will fail.", e);
  // openingMintsData remains null
}

let openingsRawData: any[] = [];
try {
  const importedOpenings = require('../../scripts/opening_data_out');
  // Check if the default export is the array or if it's nested (e.g. { default: [...] })
  if (Array.isArray(importedOpenings)) {
    openingsRawData = importedOpenings;
  } else if (importedOpenings && Array.isArray(importedOpenings.default)) {
    openingsRawData = importedOpenings.default;
  } else {
    console.error("CRITICAL: '../../scripts/opening_data_out.js' did not provide a usable array of openings. Opening book will be empty.");
  }
} catch (e) {
  console.error("CRITICAL: Failed to load '../../scripts/opening_data_out.js'. Opening book will be empty.", e);
  // openingsRawData remains an empty array
}

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
try {
  if (openingsRawData.length === 0) {
    console.warn("Opening data (from opening_data_out) is empty. Opening book will not be populated.");
  }
  openingsRawData.forEach(opening => {
    if (!opening || typeof opening.pgn !== 'string' || typeof opening.eco !== 'string' || typeof opening.name !== 'string') {
      console.warn('Skipping malformed opening object:', opening);
      return;
    }
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
} catch (e) {
  console.error("CRITICAL: Failed to load opening data into the book.", e);
}

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
  if (!openingMintsData) {
    console.error("Cannot get opening mint: openingMints data (openings.json) was not loaded.");
    return null;
  }
  if (typeof eco !== 'string') {
    console.warn('Invalid ECO code provided to getOpeningMint:', eco);
    return null;
  }
  return (openingMintsData as OpeningMints)[eco] || null;
}

export default openingBook; 