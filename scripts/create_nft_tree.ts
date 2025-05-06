import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { generateSigner, signerIdentity, createSignerFromKeypair } from '@metaplex-foundation/umi';
import { createTree } from '@metaplex-foundation/mpl-bubblegum';
import { Keypair, Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { fromWeb3JsKeypair } from '@metaplex-foundation/umi-web3js-adapters';
import { join } from 'path';
import { getPayer } from './utils/getPayer';
import { saveEnv } from './utils/env';

async function main() {
  // Connect to Devnet
  const connection = new Connection(clusterApiUrl('devnet'));

  // Load payer keypair
  const payer = getPayer();
  console.log('Using payer public key:', payer.publicKey.toBase58());

  // Set up Umi instance
  const umi = createUmi(connection);
  const payerSigner = createSignerFromKeypair(umi, fromWeb3JsKeypair(payer));
  umi.use(signerIdentity(payerSigner));

  // Generate a new keypair for the tree
  const treeSigner = generateSigner(umi);

  // Create the Merkle tree
  const builder = await createTree(umi, {
    merkleTree: treeSigner,
    maxDepth: 14, // 2^14 = 16,384 leaves (Bubblegum devnet standard)
    maxBufferSize: 64, // supported buffer size
    canopyDepth: 3,
    public: true,
  });
  const result = await builder.sendAndConfirm(umi);

  const treeAddress = treeSigner.publicKey;
  const treeAddressBase58 = new PublicKey(treeAddress).toBase58();
  console.log('Merkle tree public key:', treeAddressBase58);

  // Save TREE_ADDRESS in .env.local
  saveEnv('TREE_ADDRESS', treeAddressBase58);
  console.log('✅ New TREE_ADDRESS saved');

  process.exit(0);
}

main(); 