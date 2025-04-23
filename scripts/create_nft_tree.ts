import { Connection, clusterApiUrl, PublicKey, Transaction, Keypair } from '@solana/web3.js';
import { 
  createTree,
  MPL_BUBBLEGUM_PROGRAM_ID,
  TreeConfig,
} from '@metaplex-foundation/mpl-bubblegum';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { fromWeb3JsKeypair, fromWeb3JsPublicKey } from '@metaplex-foundation/umi-web3js-adapters';
import { appendFileSync, existsSync, writeFileSync } from 'fs';
import { payer, connection } from './_shared';
import { generateSigner, none, publicKey, createSignerFromKeypair, signerIdentity } from '@metaplex-foundation/umi';

async function main() {
  try {
    console.log('Creating Merkle tree...');

    // Initialize Umi with our payer
    const umi = createUmi(connection);
    const payerSigner = createSignerFromKeypair(umi, fromWeb3JsKeypair(payer));
    umi.use(signerIdentity(payerSigner));

    // Generate a new keypair for the tree and convert to Umi signer
    const treeSigner = generateSigner(umi);

    // Create the tree with specified parameters
    const builder = await createTree(
      umi,
      {
        merkleTree: treeSigner,
        maxDepth: 14,
        maxBufferSize: 256,
        public: true,
      }
    );

    // Send the transaction
    const result = await builder.sendAndConfirm(umi);

    console.log(`Tree created successfully!`);
    console.log(`Tree address: ${treeSigner.publicKey}`);
    console.log(`Transaction: ${result.signature.toString()}`);

    // Ensure .env.local exists
    if (!existsSync('.env.local')) {
      writeFileSync('.env.local', '');
      console.log('Created .env.local file');
    }

    // Append tree address to .env.local with append flag
    appendFileSync('.env.local', `\nTREE_ADDRESS=${treeSigner.publicKey}`, { flag: 'a' });
    console.log('Tree address appended to .env.local');

  } catch (error) {
    console.error('Error creating tree:', error);
    process.exit(1);
  }
}

main(); 