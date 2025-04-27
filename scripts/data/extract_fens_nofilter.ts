#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { createReadStream } from 'fs';
import { Writable, Transform, TransformCallback, pipeline } from 'stream';
import { ParquetSchema, ParquetWriter } from 'parquetjs-lite';
import { SHA256 } from 'crypto-js';
import { Chess } from 'chess.js';

const schema = new ParquetSchema({
  game_id: { type: 'UTF8' },
  move_no: { type: 'INT32' },
  fen: { type: 'UTF8' },
  ply_ms: { type: 'INT32' }
});

const OUTPUT_FILE = path.resolve(__dirname, '../../data/fen_moves.parquet');
const DEFAULT_INPUT_FILE = path.resolve(__dirname, '../../data/raw/filtered_180+2.pgn');
const DEFAULT_MAX_MOVES = 200000;
const LOG_INTERVAL = 5000;

let totalMoves = 0;
let totalGames = 0;

class PgnAccumulator extends Transform {
  private buffer: string = '';
  constructor(options = {}) {
    super({ ...options, objectMode: true });
  }
  _transform(chunk: Buffer, encoding: BufferEncoding, callback: TransformCallback): void {
    this.buffer += chunk.toString();
    let lastIndex = 0;
    let startIndex = this.buffer.indexOf('[Event "', lastIndex);
    while (startIndex !== -1) {
      let endIndex = this.buffer.indexOf('[Event "', startIndex + 1);
      if (endIndex === -1) {
        const results = ['1-0', '0-1', '1/2-1/2', '*'];
        for (const result of results) {
          const resultIndex = this.buffer.lastIndexOf(result, this.buffer.length);
          if (resultIndex !== -1 && resultIndex > startIndex) {
            const lineBreakIndex = this.buffer.indexOf('\n', resultIndex);
            if (lineBreakIndex !== -1) {
              endIndex = lineBreakIndex + 1;
              break;
            }
          }
        }
      }
      if (endIndex !== -1) {
        const gameStr = this.buffer.substring(startIndex, endIndex);
        this.push(gameStr);
        lastIndex = endIndex;
        startIndex = this.buffer.indexOf('[Event "', lastIndex);
      } else {
        break;
      }
    }
    if (lastIndex > 0) {
      this.buffer = this.buffer.substring(lastIndex);
    }
    callback();
  }
  _flush(callback: TransformCallback): void {
    if (this.buffer.trim() !== '') {
      const startIndex = this.buffer.indexOf('[Event "');
      if (startIndex !== -1) {
        this.push(this.buffer.substring(startIndex));
      }
    }
    callback();
  }
}

class PgnProcessor extends Writable {
  private writer: ParquetWriter;
  private lastLoggedMoves: number = 0;
  private writeQueue: Promise<void> = Promise.resolve();
  private isEnded: boolean = false;
  private maxMoves: number;
  private rowsWritten: number = 0;
  constructor(writer: ParquetWriter, maxMoves: number, options = {}) {
    super({ ...options, objectMode: true });
    this.writer = writer;
    this.maxMoves = maxMoves;
  }
  async _write(pgnString: string, encoding: BufferEncoding, callback: (error?: Error | null) => void): Promise<void> {
    try {
      if (!pgnString || !pgnString.trim() || this.isEnded) {
        callback();
        return;
      }
      if (totalMoves >= this.maxMoves) {
        this.isEnded = true;
        callback();
        return;
      }
      // Remove engine evals and other comments that might break chess.js
      const cleanPgn = pgnString.replace(/\{\s*\[%eval[^\}]*\}/g, '');
      const chess = new Chess();
      chess.loadPgn(cleanPgn, { sloppy: true } as any);
      // Extract game_id from Site tag if present
      let gameId = '';
      const siteMatch = /\[Site "https:\/\/lichess\.org\/([a-zA-Z0-9]{8})"\]/.exec(cleanPgn);
      if (siteMatch) {
        gameId = siteMatch[1];
      } else {
        gameId = SHA256(cleanPgn).toString().substring(0, 16);
      }
      // Extract clock info for each move
      // We'll use a regex to get all [%clk ...] comments in order
      const clkRegex = /\[%clk ([^\]]+)\]/g;
      const clkMatches = [...cleanPgn.matchAll(clkRegex)].map(m => m[1]);
      // Step through the moves
      const history = chess.history({ verbose: true });
      let moveCount = 0;
      let previousClocks: number[] = [180000, 180000]; // ms, white/black
      for (let i = 0; i < history.length; i++) {
        if (totalMoves >= this.maxMoves) {
          this.isEnded = true;
          break;
        }
        const move = history[i];
        // Rewind board to just before this move
        chess.reset();
        for (let j = 0; j < i; j++) {
          chess.move(history[j].san, { sloppy: true } as any);
        }
        // Now apply this move
        chess.move(move.san, { sloppy: true } as any);
        const fen = chess.fen();
        // Calculate ply_ms from clock comments if available
        let plyMs = null;
        const playerIdx = i % 2;
        if (clkMatches.length > i) {
          // Parse clock string (e.g. 0:03:00)
          const clockParts = clkMatches[i].split(':');
          let clockMs = 0;
          if (clockParts.length === 3) {
            clockMs = parseInt(clockParts[0] || '0') * 3600000 + parseInt(clockParts[1] || '0') * 60000 + Math.round(parseFloat(clockParts[2] || '0') * 1000);
          } else if (clockParts.length === 2) {
            clockMs = parseInt(clockParts[0] || '0') * 60000 + Math.round(parseFloat(clockParts[1] || '0') * 1000);
          } else if (clockParts.length === 1) {
            clockMs = Math.round(parseFloat(clockParts[0] || '0') * 1000);
          }
          if (previousClocks[playerIdx] !== undefined) {
            plyMs = previousClocks[playerIdx] - clockMs;
            // Validate plyMs
            if (plyMs <= 0 || plyMs > 60000) {
              plyMs = null;
            }
          }
          previousClocks[playerIdx] = clockMs;
        }
        if (plyMs === null) {
          plyMs = 1000; // fallback default
        }
        const moveNo = i + 1;
        this.writeQueue = this.writeQueue.then(async () => {
          const row = {
            game_id: String(gameId),
            move_no: Number(moveNo),
            fen: String(fen),
            ply_ms: Number(plyMs)
          };
          if (this.rowsWritten < 5) {
            console.log('Writing row:', JSON.stringify(row));
          }
          await this.writer.appendRow(row);
          this.rowsWritten++;
          totalMoves++;
          moveCount++;
          if (totalMoves - this.lastLoggedMoves >= LOG_INTERVAL) {
            console.log(`Extracted ${totalMoves} moves from ${totalGames} games so far...`);
            this.lastLoggedMoves = totalMoves;
          }
        }).catch((err) => {
          console.error('Error writing row:', err);
        });
      }
      await this.writeQueue;
      totalGames++;
      console.log('✓ processed', moveCount, 'ply from', gameId);
      callback();
    } catch (error) {
      console.error('Error in _write:', error);
      callback(error instanceof Error ? error : new Error(String(error)));
    }
  }
  async _final(callback: (error?: Error | null) => void): Promise<void> {
    await this.writeQueue;
    if (this.writer) {
      await this.writer.close();
      console.log('Parquet writer closed successfully');
      if (fs.existsSync(OUTPUT_FILE)) {
        const stats = fs.statSync(OUTPUT_FILE);
        if (stats.size === 0) {
          console.error('WARNING: Output Parquet file is empty!');
        } else {
          console.log(`Final Parquet file size: ${(stats.size / (1024 * 1024)).toFixed(1)} MB`);
        }
      } else {
        console.error('ERROR: Output Parquet file was not created!');
      }
    }
    callback(null);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const inputArg = args.find(arg => arg.startsWith('--input='));
  const maxMovesArg = args.find(arg => arg.startsWith('--maxMoves='));
  const maxMoves = maxMovesArg ? parseInt(maxMovesArg.split('=')[1]) : DEFAULT_MAX_MOVES;
  const inputPath = inputArg ? inputArg.split('=')[1] : DEFAULT_INPUT_FILE;
  if (!fs.existsSync(inputPath)) {
    console.error(`Input file not found: ${inputPath}`);
    process.exit(1);
  }
  if (fs.existsSync(OUTPUT_FILE)) {
    fs.unlinkSync(OUTPUT_FILE);
  }
  const writer = await ParquetWriter.openFile(
    schema,
    OUTPUT_FILE
  );
  const fileStream = createReadStream(inputPath, { encoding: 'utf8' });
  const accumulator = new PgnAccumulator();
  const processor = new PgnProcessor(writer, maxMoves);
  pipeline(fileStream, accumulator, processor, (err) => {
    if (err) {
      console.error('Processing pipeline failed:', err);
    } else {
      console.log('Extraction complete.');
      console.log(`Games processed: ${totalGames}`);
      console.log(`Total moves: ${totalMoves}`);
    }
  });
}

main().catch(console.error); 