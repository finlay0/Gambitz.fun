import { useCallback } from 'react';
import { useHelius } from './useHelius';
import { PublicKey } from '@solana/web3.js';
import openings from '../../lib/openings.json';
import { getOpeningFromMoves, Opening } from '../../lib/opening_data';

// Platform's wallet address from the contract
const PLATFORM_RAKE_PUBKEY = new PublicKey("AwszNDgf4oTphGiEoA4Eua91dhsfxAW2VrzmgStLfziX");

export interface GameOpeningInfo {
  eco: string;
  mint: string | null; // Mint can be null if ECO has no associated mint
  owner: PublicKey | null; // Owner can be null if mint has no owner or no mint
  name?: string; // From getOpeningFromMoves
  pgnMoves?: string[]; // From getOpeningFromMoves
}

export type GameOpeningResult = GameOpeningInfo | null;

// These interfaces match what the contract expects for settlement (will be updated)
export interface SettlementAccounts {
  matchAccount: PublicKey;
  winner: PublicKey;
  platform: PublicKey;
  openingOwner: PublicKey; // Changed from whiteOwner and blackOwner
}

// Type for the openings.json file
type OpeningsMap = {
  [key: string]: string;
};

export const useFinalOpenings = () => {
  const { getNFTOwner } = useHelius();

  const getFinalOpening = useCallback(async (moves: string[]): Promise<GameOpeningResult> => {
    if (!moves || moves.length === 0) {
      return null;
    }

    const gameOpening: Opening | null = getOpeningFromMoves(moves);

    if (!gameOpening) {
      return null;
    }

    const eco = gameOpening.eco || 'A00'; // Default to A00 if no ECO
    const mint = (openings as OpeningsMap)[eco] || null;
    let owner: PublicKey | null = null;

    if (mint) {
      try {
        owner = await getNFTOwner(new PublicKey(mint));
    } catch (e) {
        console.warn(`Error fetching NFT owner for mint ${mint}:`, e);
        owner = null; // Ensure owner is null on error
      }
    }

    return {
      eco,
      mint,
      owner,
      name: gameOpening.name,
      pgnMoves: gameOpening.moves,
    };
  }, [getNFTOwner]);

  // Prepares settlement accounts for the Solana transaction
  const prepareSettlementAccounts = useCallback(async (
    matchPda: PublicKey,
    winner: PublicKey, // Winner can be SystemProgram.programId for draws
    moves: string[]
  ): Promise<SettlementAccounts> => {
    const gameOpeningDetails = await getFinalOpening(moves);

    let openingOwnerPubkey: PublicKey;

    if (gameOpeningDetails && gameOpeningDetails.owner) {
    try {
        // Validate owner is a valid PublicKey
        openingOwnerPubkey = new PublicKey(gameOpeningDetails.owner);
        openingOwnerPubkey.toBase58(); // Check if it's a valid base58 string
    } catch (e) {
        console.warn('Invalid game opening owner, defaulting to platform address', e);
        openingOwnerPubkey = PLATFORM_RAKE_PUBKEY;
      }
    } else {
      // If no opening, no mint, or no owner, royalty goes to the platform
      openingOwnerPubkey = PLATFORM_RAKE_PUBKEY;
    }
    
    return {
      matchAccount: matchPda,
      winner,
      platform: PLATFORM_RAKE_PUBKEY, // Platform always gets its cut
      openingOwner: openingOwnerPubkey,
    };
  }, [getFinalOpening]);

  // Helper to get only the ECO code for immediate access
  const getEcoCode = useCallback((moves: string[]): string | null => {
    if (!moves || moves.length === 0) {
      return null;
    }
    const gameOpening = getOpeningFromMoves(moves);
    return gameOpening?.eco || null; // Return null if no opening, or the ECO code
  }, []);

  return {
    getFinalOpening, // Renamed
    prepareSettlementAccounts,
    getEcoCode, // Renamed
  };
}; 