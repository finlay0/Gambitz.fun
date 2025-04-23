import { createWriteStream, mkdirSync } from 'fs';
import { pipeline } from 'stream/promises';
import { dirname } from 'path';
import https from 'https';

const URL = 'https://database.lichess.org/lichess_db_standard_rated_2024-04.pgn.zst';
const OUT = 'data/raw/blitz_2024.pgn.zst';
const CHUNK_MB = 10;

async function main() {
  mkdirSync(dirname(OUT), { recursive: true });
  let downloaded = 0, nextLog = CHUNK_MB * 1024 * 1024;
  await new Promise<void>((resolve, reject) => {
    https.get(URL, res => {
      if (res.statusCode !== 200) return reject(new Error('Failed to download: ' + res.statusCode));
      const file = createWriteStream(OUT);
      res.on('data', chunk => {
        downloaded += chunk.length;
        if (downloaded >= nextLog) {
          console.log(`${Math.floor(downloaded / 1024 / 1024)} MB downloaded`);
          nextLog += CHUNK_MB * 1024 * 1024;
        }
      });
      res.pipe(file);
      file.on('finish', () => {
        console.log('✅ PGNs downloaded to ' + OUT);
        resolve();
      });
      res.on('error', reject);
      file.on('error', reject);
    }).on('error', reject);
  });
}

main(); 