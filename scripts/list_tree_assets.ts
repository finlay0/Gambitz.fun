import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const API_KEY = '9ab648ad-d154-493e-89b9-fa53f6a7da76';
const TREE_ADDRESS = process.env.TREE_ADDRESS || require('dotenv').config({ path: '.env.local' }) && process.env.TREE_ADDRESS;
const OUT_PATH = path.join(__dirname, '../tree_assets.json');
const HELIUS_URL = `https://devnet.helius-rpc.com/?api-key=${API_KEY}`;

async function delay(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}

async function getAssetsForTree(tree: string, page = 1, limit = 1000) {
  const body = {
    jsonrpc: '2.0',
    id: '1',
    method: 'searchAssets',
    params: {
      ownerAddress: null,
      creatorAddress: null,
      grouping: ["merkleTree", tree],
      page,
      limit,
    },
  };
  const res = await fetch(HELIUS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (!json.result || !json.result.items) throw new Error('No result');
  return json.result.items;
}

async function main() {
  let allAssets: any[] = [];
  let page = 1;
  const limit = 1000;
  while (true) {
    const assets = await getAssetsForTree(TREE_ADDRESS, page, limit);
    if (!assets.length) break;
    allAssets = allAssets.concat(assets);
    if (assets.length < limit) break;
    await delay(350); // avoid rate limit
    page++;
  }
  const assetIds = allAssets.map(a => a.id);
  fs.writeFileSync(OUT_PATH, JSON.stringify(assetIds, null, 2));
  console.log(`Found ${assetIds.length} assets in tree. Output written to tree_assets.json`);
}

main(); 