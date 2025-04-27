#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import { ParquetReader, ParquetWriter, ParquetSchema } from 'parquetjs-lite';

// Constants
const DEFAULT_MAX_ROWS = 200000;
const DEFAULT_OUTPUT_FILE = path.resolve(__dirname, '../../data/fen_eval.parquet');
const INPUT_FILE = path.resolve(__dirname, '../../data/fen_moves.parquet');
const LOG_INTERVAL = 10000;
const MAX_PARALLEL_EVALS = 1; // Keep single-threaded for simplicity

// Schema for output Parquet file
const schema = new ParquetSchema({
  game_id: { type: 'UTF8' },
  move_no: { type: 'INT32' },
  fen: { type: 'UTF8' },
  ply_ms: { type: 'INT32' },
  cp: { type: 'INT32' }
});

// Track progress
let totalEvals = 0;
let totalTimeMs = 0;
let lastLoggedEvals = 0;

// Function to convert Stockfish score to centipawns
function scoreToCp(score: string): number {
  if (score.startsWith('mate')) {
    const mateIn = parseInt(score.split(' ')[1]);
    return mateIn > 0 ? 10000 : -10000;
  }
  return parseInt(score);
}

// Function to evaluate a FEN position with Stockfish
async function evaluatePosition(fen: string, stockfish: any): Promise<number> {
  return new Promise((resolve, reject) => {
    let score = 0;
    let foundScore = false;
    
    // Set up error handler
    const errorHandler = (err: Error) => {
      stockfish.removeAllListeners();
      reject(err);
    };
    
    // Set up data handler
    const dataHandler = (data: Buffer) => {
      const lines = data.toString().split('\n');
      
      for (const line of lines) {
        if (line.startsWith('info score cp')) {
          const match = line.match(/score cp (-?\d+)/);
          if (match) {
            score = parseInt(match[1]);
            foundScore = true;
          }
        } else if (line.startsWith('info score mate')) {
          const match = line.match(/score mate (-?\d+)/);
          if (match) {
            score = scoreToCp(`mate ${match[1]}`);
            foundScore = true;
          }
        } else if (line.startsWith('bestmove')) {
          stockfish.removeAllListeners();
          if (foundScore) {
            resolve(score);
          } else {
            reject(new Error('No score found in Stockfish output'));
          }
          return;
        }
      }
    };
    
    // Set up event listeners
    stockfish.on('error', errorHandler);
    stockfish.stdout.on('data', dataHandler);
    
    // Send commands to Stockfish
    stockfish.stdin.write(`position fen ${fen}\n`);
    stockfish.stdin.write('go depth 12\n');
  });
}

async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const maxRowsArg = args.find(arg => arg.startsWith('--maxRows='));
  const outputArg = args.find(arg => arg.startsWith('--out='));
  
  const maxRows = maxRowsArg ? parseInt(maxRowsArg.split('=')[1]) : DEFAULT_MAX_ROWS;
  const outputFile = outputArg ? path.resolve(outputArg.split('=')[1]) : DEFAULT_OUTPUT_FILE;
  
  console.log('Starting FEN evaluation...');
  console.log(`Input: ${INPUT_FILE}`);
  console.log(`Output: ${outputFile}`);
  console.log(`Max rows: ${maxRows}`);
  
  // Ensure output directory exists
  const outputDir = path.dirname(outputFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  let reader: ParquetReader | null = null;
  let writer: ParquetWriter | null = null;
  let stockfish: any = null;
  
  try {
    // Open input Parquet file
    reader = await ParquetReader.openFile(INPUT_FILE);
    const cursor = reader.getCursor();
    
    // Create output Parquet file
    writer = await ParquetWriter.openFile(schema, outputFile);
    
    // Start Stockfish process
    stockfish = spawn('stockfish', [], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    // Initialize Stockfish
    stockfish.stdin.write('uci\n');
    stockfish.stdin.write('setoption name Threads value 1\n');
    stockfish.stdin.write('isready\n');
    
    // Wait for Stockfish to be ready
    await new Promise<void>((resolve) => {
      const readyHandler = (data: Buffer) => {
        if (data.toString().includes('readyok')) {
          stockfish.stdout.removeListener('data', readyHandler);
          resolve();
        }
      };
      stockfish.stdout.on('data', readyHandler);
    });
    
    console.log('Stockfish initialized, starting evaluation...');
    
    // Process rows
    let row;
    while ((row = await cursor.next()) && totalEvals < maxRows) {
      const startTime = Date.now();
      
      try {
        // Evaluate position
        const cp = await evaluatePosition(row.fen, stockfish);
        
        // Write to output
        await writer.appendRow({
          game_id: row.game_id,
          move_no: row.move_no,
          fen: row.fen,
          ply_ms: row.ply_ms,
          cp: cp
        });
        
        // Update stats
        totalEvals++;
        totalTimeMs += Date.now() - startTime;
        
        // Log progress
        if (totalEvals - lastLoggedEvals >= LOG_INTERVAL) {
          const avgTime = (totalTimeMs / totalEvals).toFixed(1);
          console.log(`Evaluated ${totalEvals} positions (avg ${avgTime} ms/pos)...`);
          lastLoggedEvals = totalEvals;
        }
      } catch (error) {
        console.error(`Error evaluating position ${row.fen}:`, error);
        // Continue with next position
      }
    }
    
    // Close Stockfish
    stockfish.stdin.write('quit\n');
    stockfish.kill();
    
    // Close files
    await reader.close();
    await writer.close();
    
    // Print final summary
    const fileSize = fs.statSync(outputFile).size;
    const avgTime = (totalTimeMs / totalEvals).toFixed(1);
    console.log(`\n✅ Evaluated ${totalEvals} positions`);
    console.log(`   → ${outputFile} (size ≈ ${(fileSize / (1024 * 1024)).toFixed(1)} MB)`);
    console.log(`   Average time: ${avgTime} ms/position`);
    
  } catch (error) {
    console.error('Error during evaluation:', error);
    process.exit(1);
  } finally {
    // Cleanup
    if (stockfish) {
      stockfish.kill();
    }
    if (reader) {
      await reader.close();
    }
    if (writer) {
      await writer.close();
    }
  }
}

// Run the evaluation
main().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
}); 