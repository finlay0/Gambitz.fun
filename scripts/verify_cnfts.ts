import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const API_KEY = '9ab648ad-d154-493e-89b9-fa53f6a7da76';
const TREE_ADDRESS = process.env.TREE_ADDRESS || require('dotenv').config({ path: '.env.local' }) && process.env.TREE_ADDRESS;
const CSV_PATH = path.join(__dirname, '../openings.csv');
const HELIUS_URL = `https://devnet.helius-rpc.com/?api-key=${API_KEY}`;

async function delay(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}

async function verifyAsset(assetId: string, retries = 3): Promise<any> {
  const body = {
    jsonrpc: '2.0',
    id: '1',
    method: 'getAsset',
    params: { id: assetId },
  };
  const res = await fetch(HELIUS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (res.status === 429 && retries > 0) {
    await delay(2000); // Wait 2s before retrying
    return verifyAsset(assetId, retries - 1);
  }
  if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
  const json = await res.json();
  if (!json.result) return { ok: false, error: 'No result' };
  const { compressed, tree } = json.result.compression || {};
  return {
    ok: compressed === true && tree === TREE_ADDRESS,
    compressed,
    tree,
    error: compressed !== true ? 'Not compressed' : tree !== TREE_ADDRESS ? 'Wrong tree' : undefined,
  };
}

async function main() {
  const lines = fs.readFileSync(CSV_PATH, 'utf8').split('\n').filter(Boolean);
  let ok = 0, fail = 0;
  for (let i = 0; i < lines.length; ++i) {
    const line = lines[i];
    if (i === 0 && line.startsWith('eco')) continue; // skip header
    const parts = line.split(',');
    const assetId = parts[2]?.replace(/"/g, '');
    if (!assetId) continue;
    const result = await verifyAsset(assetId);
    if (result.ok) {
      console.log(`✅ ${assetId} is a cNFT in the correct tree`);
      ok++;
    } else {
      console.log(`❌ ${assetId} failed: ${result.error}`);
      fail++;
    }
    await delay(350); // Add delay to avoid rate limit
  }
  console.log(`\nSummary: ${ok} valid, ${fail} failed`);
}

main(); 