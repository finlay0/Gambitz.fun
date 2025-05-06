import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { createSignerFromKeypair, signerIdentity, publicKey as umiPublicKey, PublicKey as UmiPublicKey } from '@metaplex-foundation/umi';
import { fromWeb3JsKeypair } from '@metaplex-foundation/umi-web3js-adapters';
import { mintV1, findLeafAssetIdPda } from '@metaplex-foundation/mpl-bubblegum';
import { Keypair, Connection, clusterApiUrl, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { readFileSync, writeFileSync, appendFileSync, existsSync, createWriteStream } from 'fs';
import { join } from 'path';
import openings from './opening_data_out';
import { getPayer } from './utils/getPayer';
import { getEnv } from './utils/env';
import bs58 from "bs58";

const BATCH_SIZE = 100;
const CSV_PATH = 'openings.csv';
const MAX = 32;

function safeName(name: string, variant?: string) {
  let fullName = variant && variant.trim() ? `${name}: ${variant}` : name;
  let nameStr = fullName.split(' (')[0];
  while (Buffer.byteLength(nameStr, 'utf8') > MAX) {
    nameStr = nameStr.slice(0, -1);
  }
  return nameStr;
}

async function main() {
  // 1. Import openings
  // (already imported above)

  // 2. Load TREE_ADDRESS
  const TREE_ADDRESS = getEnv('TREE_ADDRESS');
  if (!TREE_ADDRESS) throw new Error('TREE_ADDRESS not set in .env.local');
  const treeAddress: UmiPublicKey = umiPublicKey(TREE_ADDRESS);

  // 3. Load payer
  const payer = getPayer();
  console.log('Using payer:', payer.publicKey.toBase58());

  // 4. Set up Umi
  const connection = new Connection(clusterApiUrl('devnet'));
  const umi = createUmi(connection);
  const payerSigner = createSignerFromKeypair(umi, fromWeb3JsKeypair(payer));
  umi.use(signerIdentity(payerSigner));

  // 5. Prepare CSV stream
  if (!existsSync(CSV_PATH)) {
    writeFileSync(CSV_PATH, 'eco,name,assetId\n');
  }
  const csvStream = createWriteStream(CSV_PATH, { flags: 'a' });

  // 6. Mint in batches
  let totalLamports = 0;
  let minted = 0;
  let leafIndex = 0; // Track leaf index for assetId derivation
  for (let i = 0; i < openings.length; i += BATCH_SIZE) {
    const batch = openings.slice(i, i + BATCH_SIZE);
    console.log(`Minting batch ${i / BATCH_SIZE + 1} (${i + 1}–${i + batch.length})...`);
    for (const opening of batch) {
      try {
        const { eco, name, variant } = opening;
        const metaName = safeName(name, variant);
        if (metaName !== (variant && variant.trim() ? `${name}: ${variant}` : name)) {
          console.log(`Trimmed name to '${metaName}'`);
        }
        const symbol = 'OPEN';
        const uri = `https://placehold.co/600x600.png?text=${eco}`;
        await mintV1(umi, {
          leafOwner: umiPublicKey(payer.publicKey.toBase58()),
          merkleTree: treeAddress,
          payer: payerSigner,
          treeCreatorOrDelegate: payerSigner,
          metadata: {
            name: metaName,
            symbol,
            uri,
            sellerFeeBasisPoints: 0,
            creators: [],
            collection: null,
            uses: null,
            primarySaleHappened: false,
            isMutable: true,
            editionNonce: null,
            tokenStandard: 0, // NonFungible
            tokenProgramVersion: 0, // Original
          },
        }).sendAndConfirm(umi);
        // Derive assetId (mint address) for this leaf
        const assetPda = findLeafAssetIdPda(
          umi,
          { merkleTree: treeAddress, leafIndex: BigInt(leafIndex) }
        );
        // Extract only the mint address (before any comma)
        const assetMint = assetPda.toString().split(',')[0];
        const csvName = variant && variant.trim() ? `${name}: ${variant}` : name;
        // Only write the mint (no index) in the CSV
        csvStream.write(`${eco},"${csvName}","${assetMint}"\n`);
        minted++;
        leafIndex++;
        const balance = await connection.getBalance(payer.publicKey, 'confirmed');
        totalLamports = LAMPORTS_PER_SOL - balance;
        console.log(`✅ Minted ${metaName} → ${assetMint}`);
      } catch (err) {
        console.error(`Failed to mint ${opening.eco} – ${opening.name}:`, err);
        continue;
      }
    }
  }

  console.log(`Total lamports: ${totalLamports}`);
  console.log(`Total minted: ${minted}`);
}

main();