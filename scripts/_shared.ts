import { Keypair, Connection, clusterApiUrl } from '@solana/web3.js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Initialize devnet connection for reuse across scripts
export const connection = new Connection(clusterApiUrl('devnet'));

// Load payer keypair from local file
// Expects a keypair file at ~/.config/solana/devnet.json
const loadPayerKeypair = (): Keypair => {
  try {
    const keypairPath = join(
      process.env.HOME || '',
      '.config',
      'solana',
      'devnet.json'
    );
    const keypairFile = readFileSync(keypairPath, 'utf-8');
    return Keypair.fromSecretKey(
      Uint8Array.from(JSON.parse(keypairFile))
    );
  } catch (error) {
    console.error('Error loading payer keypair:', error);
    process.exit(1);
  }
};

export const payer = loadPayerKeypair(); 