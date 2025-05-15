import { PublicKey } from '@solana/web3.js';
import { createLogger } from './logger';

const logger = createLogger('PDA');

/**
 * Finds a program derived address (PDA) using the provided seeds and program ID.
 * 
 * @param seeds - Array of Buffer objects used as seeds for the PDA derivation
 * @param programId - The program ID to derive the PDA for
 * @returns A Promise resolving to [publicKey, bumpSeed] where publicKey is the derived PDA
 */
export async function findProgramAddress(
  seeds: Buffer[],
  programId: PublicKey
): Promise<[PublicKey, number]> {
  try {
    return await PublicKey.findProgramAddress(seeds, programId);
  } catch (error) {
    logger.error('Error finding program address', { error, seeds, programId: programId.toString() });
    throw error;
  }
}

/**
 * Synchronously finds a program derived address (PDA) using the provided seeds and program ID.
 * Uses the findProgramAddressSync method.
 * 
 * @param seeds - Array of Buffer objects used as seeds for the PDA derivation
 * @param programId - The program ID to derive the PDA for
 * @returns A tuple of [publicKey, bumpSeed] where publicKey is the derived PDA
 */
export function findProgramAddressSync(
  seeds: Buffer[],
  programId: PublicKey
): [PublicKey, number] {
  try {
    return PublicKey.findProgramAddressSync(seeds, programId);
  } catch (error) {
    logger.error('Error finding program address synchronously', { error, seeds, programId: programId.toString() });
    throw error;
  }
} 