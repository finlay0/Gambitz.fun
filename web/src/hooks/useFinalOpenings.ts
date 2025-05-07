import { useCallback } from 'react';
import { useHelius } from './useHelius';
import { PublicKey } from '@solana/web3.js';
import openings from '../../lib/openings.json';
import { getOpeningFromMoves } from '../../lib/opening_data';

interface OpeningInfo {
  eco: string;
  mint: string;
  owner: PublicKey | null;
}

export type FinalOpenings = {
  white: OpeningInfo;
  black: OpeningInfo;
};

// These interfaces match what the contract expects for settlement
export interface SettlementAccounts {
  matchAccount: PublicKey;
  winner: PublicKey;
  platform: PublicKey;
  whiteOwner: PublicKey;
  blackOwner: PublicKey;
}

// Type for the openings.json file
type OpeningsMap = {
  [key: string]: string;
};

export const useFinalOpenings = () => {
  const { getNFTOwner } = useHelius();

  const getFinalOpenings = useCallback(async (moves: string[]): Promise<FinalOpenings> => {
    // Separate white and black moves (white moves are at even indices, black at odd)
    const whiteMoves = moves.filter((_, i) => i % 2 === 0);
    const blackMoves = moves.filter((_, i) => i % 2 === 1);
    
    // Find the openings for white and black separately
    const whiteOpening = getOpeningFromMoves(whiteMoves);
    const blackOpening = getOpeningFromMoves(blackMoves);
    
    // Default to A00 for unknown openings
    const whiteEco = whiteOpening?.eco || 'A00';
    const blackEco = blackOpening?.eco || 'A00';
    
    // Get corresponding mint addresses
    const whiteMint = (openings as OpeningsMap)[whiteEco];
    const blackMint = (openings as OpeningsMap)[blackEco];
    
    const whiteOpeningInfo = { eco: whiteEco, mint: whiteMint };
    const blackOpeningInfo = { eco: blackEco, mint: blackMint };

    try {
      // Get owners for both openings
      const [whiteOwner, blackOwner] = await Promise.all([
        whiteOpeningInfo.mint ? getNFTOwner(new PublicKey(whiteOpeningInfo.mint)).catch(() => null) : null,
        blackOpeningInfo.mint ? getNFTOwner(new PublicKey(blackOpeningInfo.mint)).catch(() => null) : null
      ]);

      return {
        white: {
          ...whiteOpeningInfo,
          owner: whiteOwner
        },
        black: {
          ...blackOpeningInfo,
          owner: blackOwner
        }
      };
    } catch (e) {
      // If there's an error fetching owners, return null owners
      // This means the platform will get the royalties
      console.warn('Error fetching NFT owners:', e);
      return {
        white: {
          ...whiteOpeningInfo,
          owner: null
        },
        black: {
          ...blackOpeningInfo,
          owner: null
        }
      };
    }
  }, [getNFTOwner]);

  // Prepares settlement accounts for the Solana transaction
  const prepareSettlementAccounts = useCallback(async (
    matchPda: PublicKey,
    winner: PublicKey,
    moves: string[]
  ): Promise<SettlementAccounts> => {
    // Define DEFAULT_PLATFORM_ADDRESS inside callback
    const DEFAULT_PLATFORM_ADDRESS = new PublicKey('11111111111111111111111111111111');
    
    // Get the opening NFT owners
    const openings = await getFinalOpenings(moves);

    // Default to platform address if owners are not found or null/undefined
    let whiteOwner: PublicKey;
    let blackOwner: PublicKey;
    
    try {
      // Validate white owner is a valid PublicKey
      whiteOwner = openings.white.owner || DEFAULT_PLATFORM_ADDRESS;
      // Make sure it's a valid pubkey by trying to convert to string (will throw if invalid)
      whiteOwner.toBase58();
    } catch (e) {
      console.warn('Invalid white opening owner, defaulting to platform address', e);
      whiteOwner = DEFAULT_PLATFORM_ADDRESS;
    }
    
    try {
      // Validate black owner is a valid PublicKey
      blackOwner = openings.black.owner || DEFAULT_PLATFORM_ADDRESS;
      // Make sure it's a valid pubkey
      blackOwner.toBase58();
    } catch (e) {
      console.warn('Invalid black opening owner, defaulting to platform address', e);
      blackOwner = DEFAULT_PLATFORM_ADDRESS;
    }
    
    // Additional safety check - contract can't handle same owner for both
    // If they're the same, use platform address for black
    if (whiteOwner.equals(blackOwner)) {
      console.warn('White and black owners are the same, using platform for black');
      blackOwner = DEFAULT_PLATFORM_ADDRESS;
    }
    
    return {
      matchAccount: matchPda,
      winner,
      platform: DEFAULT_PLATFORM_ADDRESS,
      whiteOwner,
      blackOwner,
    };
  }, [getFinalOpenings]);

  // Helper to get only the ECO codes for immediate access
  const getEcoCodes = useCallback(async (moves: string[]): Promise<{white: string, black: string}> => {
    // Separate white and black moves
    const whiteMoves = moves.filter((_, i) => i % 2 === 0);
    const blackMoves = moves.filter((_, i) => i % 2 === 1);
    
    // Find the openings for white and black separately
    const whiteOpening = getOpeningFromMoves(whiteMoves);
    const blackOpening = getOpeningFromMoves(blackMoves);
    
    // Default to A00 for unknown openings
    const whiteEco = whiteOpening?.eco || 'A00';
    const blackEco = blackOpening?.eco || 'A00';
    
    return {
      white: whiteEco,
      black: blackEco
    };
  }, []);

  return {
    getFinalOpenings,
    prepareSettlementAccounts,
    getEcoCodes
  };
}; 