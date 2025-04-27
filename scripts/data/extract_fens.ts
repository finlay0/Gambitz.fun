#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { createReadStream, createWriteStream } from 'fs';
import { Writable, Transform, TransformCallback, pipeline, Readable } from 'stream';
import { parse } from '@mliebelt/pgn-parser';
import { ParquetSchema, ParquetWriter } from 'parquetjs-lite';
import { SHA256 } from 'crypto-js';
import { spawnSync, spawn } from 'child_process';
import { promisify } from 'util';
import { Chess } from 'chess.js';

// Define proper types for PGN parser
interface TimeControl {
  kind: string;
  seconds: number;
  increment: number;
  value: string;
}

interface PgnGame {
  tags: {
    TimeControl?: string | TimeControl[];
    GameId?: string;
    WhiteElo?: string;
    BlackElo?: string;
    Result?: string;
    Site?: string;
    [key: string]: string | TimeControl[] | undefined;
  };
  moves: PgnMove[];
}

interface PgnMove {
  fen?: string;
  commentDiag?: {
    clk?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

// Define the output schema for Parquet
const schema = new ParquetSchema({
  game_id: { type: 'UTF8' },
  move_no: { type: 'INT32' },
  fen: { type: 'UTF8' },
  ply_ms: { type: 'INT32' }
});

// Paths
const DEFAULT_INPUT_FILE = path.resolve(__dirname, '../../data/raw/blitz_2024_03.pgn.zst');
const OUTPUT_FILE = path.resolve(__dirname, '../../data/fen_moves.parquet');
const TEMP_DECOMPRESSED_FILE = path.resolve(__dirname, '../../data/temp_decompressed.pgn');

// Constants - configurable thresholds
const DEFAULT_MAX_MOVES = 200000;     // Default stop after this many moves
const MAX_GAMES = 10000;      // Stop after this many games
const LOG_INTERVAL = 5000;    // Log progress every N moves
const MIN_TEMP_FILE_SIZE_MB = 1; // Minimum size (MB) for temp file to be considered valid
const EXTRACT_IDLE_MS = parseInt(process.env.EXTRACT_IDLE_MS ?? '900000'); // Default 15 minutes

// For tracking progress
let totalMoves = 0;
let totalGames = 0;
let skippedGames = 0;
let validGamesFound = false;
let fileSizeBytes = 0;
let gameFilterReasons = {
  notBlitz: 0,
  invalidTimeControl: 0,
  noClockInfo: 0,
  parseError: 0,
  noMoves: 0,
  other: 0
};

// Class to accumulate PGN content from chunks
class PgnAccumulator extends Transform {
  private buffer: string = '';
  private gameCount: number = 0;
  
  constructor(options = {}) {
    super({ ...options, objectMode: true });
  }
  
  _transform(chunk: Buffer, encoding: BufferEncoding, callback: TransformCallback): void {
    try {
      this.buffer += chunk.toString();
      
      // Look for complete PGN games
      // Games typically start with [Event and end with a result (1-0, 0-1, 1/2-1/2, or *)
      // followed by a blank line or end of file
      let lastIndex = 0;
      let startIndex = this.buffer.indexOf('[Event "', lastIndex);
      
      while (startIndex !== -1) {
        // Find the end of this game (next [Event or end of buffer)
        let endIndex = this.buffer.indexOf('[Event "', startIndex + 1);
        
        if (endIndex === -1) {
          // If no next game, look for a proper ending
          const results = ['1-0', '0-1', '1/2-1/2', '*'];
          for (const result of results) {
            const resultIndex = this.buffer.lastIndexOf(result, this.buffer.length);
            if (resultIndex !== -1 && resultIndex > startIndex) {
              // Find the first line break after the result
              const lineBreakIndex = this.buffer.indexOf('\n', resultIndex);
              if (lineBreakIndex !== -1) {
                endIndex = lineBreakIndex + 1;
                break;
              }
            }
          }
        }
        
        // If we found a complete game
        if (endIndex !== -1) {
          const gameStr = this.buffer.substring(startIndex, endIndex);
          this.push(gameStr);
          lastIndex = endIndex;
          this.gameCount++;
          
          // Find the next game start
          startIndex = this.buffer.indexOf('[Event "', lastIndex);
        } else {
          // Incomplete game at the end of buffer, wait for more data
          break;
        }
      }
      
      // Keep the remainder for the next chunk
      if (lastIndex > 0) {
        this.buffer = this.buffer.substring(lastIndex);
      }
      
      callback();
    } catch (error) {
      console.error('Error in PgnAccumulator:', error);
      callback();
    }
  }
  
  _flush(callback: TransformCallback): void {
    try {
      // Process any remaining data
      if (this.buffer.trim() !== '') {
        // Try to find any valid game in the remaining buffer
        const startIndex = this.buffer.indexOf('[Event "');
        if (startIndex !== -1) {
          this.push(this.buffer.substring(startIndex));
        }
      }
      callback();
    } catch (error) {
      console.error('Error in PgnAccumulator flush:', error);
      callback();
    }
  }
}

// Class to process PGN games
class PgnProcessor extends Writable {
  private writer: ParquetWriter;
  private lastLoggedMoves: number = 0;
  private validationErrors: number = 0;
  private writeQueue: Promise<void> = Promise.resolve();
  private isEnded: boolean = false;
  private maxMoves: number;
  private rowsWritten: number = 0;
  
  constructor(writer: ParquetWriter, maxMoves: number, options = {}) {
    super({ ...options, objectMode: true });
    this.writer = writer;
    this.maxMoves = maxMoves;
  }
  
  private validateTimeControl(timeControl: string | TimeControl[] | undefined): boolean {
    if (!timeControl) {
      return false;
    }
    
    if (typeof timeControl === 'string') {
      return timeControl === '180+2';
    }
    
    if (Array.isArray(timeControl)) {
      return timeControl.some(tc => 
        tc.kind === 'increment' && 
        tc.seconds === 180 && 
        tc.increment === 2
      );
    }
    
    return false;
  }
  
  async _write(pgnString: string, encoding: BufferEncoding, callback: (error?: Error | null) => void): Promise<void> {
    try {
      // Skip empty strings or if stream is ended
      if (!pgnString || !pgnString.trim() || this.isEnded) {
        callback();
        return;
      }
      
      // Check if we've reached the move limit before processing
      if (totalMoves >= this.maxMoves) {
        console.log(`Reached maximum of ${this.maxMoves} moves. Stopping extraction.`);
        this.isEnded = true;
        callback();
        return;
      }
      
      // Early check for blitz games (3+2)
      if (!pgnString.includes('[TimeControl "180+2"]') && !pgnString.includes('"value":"180+2"')) {
        // Only log if it's a blitz game with wrong time control
        if (pgnString.includes('[Event "Rated Blitz game"]')) {
          console.log('Reject reason: wrongTimeControl', pgnString.substring(0, 500));
        }
        gameFilterReasons.notBlitz++;
        callback();
        return;
      }
      
      try {
        // Parse the PGN
        const parsedGame = parse(pgnString, { startRule: 'game' }) as unknown;
        // Type guard to ensure we have a proper game structure
        const game = parsedGame as PgnGame;
        
        // Verify time control again after parsing
        if (!this.validateTimeControl(game.tags.TimeControl)) {
          console.log('Reject reason: invalidTimeControl', JSON.stringify(game.tags, null, 2));
          gameFilterReasons.invalidTimeControl++;
          callback();
          return;
        }
        
        // Skip if no moves
        if (!game.moves || game.moves.length === 0) {
          console.log('Reject reason: noMoves', JSON.stringify(game.tags, null, 2));
          gameFilterReasons.noMoves++;
          callback();
          return;
        }
        
        // Generate a game ID from Site tag or hash the PGN
        let gameId: string;
        if (game.tags.Site) {
          const siteMatch = /lichess\.org\/([a-zA-Z0-9]{8})/.exec(game.tags.Site);
          gameId = siteMatch ? siteMatch[1] : SHA256(pgnString).toString().substring(0, 16);
        } else {
          gameId = SHA256(pgnString).toString().substring(0, 16);
        }
        
        // Use chess.js to track the board
        const board = new Chess();
        let currentFen = board.fen(); // Always use board's FEN
        
        // Track clocks for each player (white = 0, black = 1)
        const playerClocks: number[] = [180000, 180000]; // Start with 3 minutes (180 seconds) in ms
        let previousMoveTimes: { [plyNumber: number]: number } = {};
        let moveCount = 0;
        
        // Process moves
        for (let index = 0; index < game.moves.length; index++) {
          // Check move limit before processing each move
          if (totalMoves >= this.maxMoves) {
            console.log(`Reached maximum of ${this.maxMoves} moves. Stopping extraction.`);
            this.isEnded = true;
            break;
          }
          
          const move = game.moves[index] as PgnMove;
          const plyNumber = index + 1; // 1-based ply number
          const playerIdx = (plyNumber - 1) % 2; // 0 for white, 1 for black
          
          // Default ply time is 1000ms (1 second)
          let plyMs = 1000;
          
          // Extract clock time if available
          if (move.commentDiag && move.commentDiag.clk) {
            const clockParts = move.commentDiag.clk.split(':');
            let clockMs = 0;
            
            if (clockParts.length === 3) {
              // HH:MM:SS format
              clockMs = 
                parseInt(clockParts[0] || '0') * 3600000 + 
                parseInt(clockParts[1] || '0') * 60000 + 
                parseFloat(clockParts[2] || '0') * 1000;
            } else if (clockParts.length === 2) {
              // MM:SS format
              clockMs = 
                parseInt(clockParts[0] || '0') * 60000 + 
                parseFloat(clockParts[1] || '0') * 1000;
            }
            
            // Calculate ply time as time difference from previous clock state
            if (previousMoveTimes[playerIdx] !== undefined) {
              plyMs = previousMoveTimes[playerIdx] - clockMs;
              
              // Sanity check - if calculated time is negative or too large, use default
              if (plyMs <= 0 || plyMs > 60000) {
                plyMs = 1000;
              }
            }
            
            // Update clock state for this player
            previousMoveTimes[playerIdx] = clockMs;
            playerClocks[playerIdx] = clockMs;
          } else if (previousMoveTimes[playerIdx] !== undefined) {
            // No clock annotation - estimate based on previous clock
            // Assume 1 second spent + 2 second increment
            plyMs = 1000;
            previousMoveTimes[playerIdx] = Math.max(0, previousMoveTimes[playerIdx] - plyMs + 2000);
          }
          
          // Calculate move number (starting from 1)
          const moveNo = Math.floor(index / 2) + 1;
          
          // Use chess.js to push SAN and get FEN
          try {
            const san = move.move || move.notation?.san || '';
            if (!board.move(san)) {
              throw new Error('Illegal SAN: ' + san);
            }
            currentFen = board.fen();
          } catch(e: any) {
            console.warn('Skip illegal move', e.message);
            continue; // skip this move
          }
          
          // Validate data before writing
          if (!gameId || !moveNo || !currentFen || !plyMs) {
            this.validationErrors++;
            if (this.validationErrors % 1000 === 0) {
              console.error(`Validation errors: ${this.validationErrors} (last error: ${JSON.stringify({ gameId, moveNo, currentFen, plyMs })})`);
            }
            continue;
          }
          
          // Queue the write operation to ensure sequential writes
          this.writeQueue = this.writeQueue.then(async () => {
            try {
              // Create the row data with proper types
              const row = {
                game_id: String(gameId),
                move_no: Number(moveNo),
                fen: String(currentFen),
                ply_ms: Number(plyMs)
              };
              
              // Log the first few rows for debugging
              if (this.rowsWritten < 5) {
                console.log('Writing row:', JSON.stringify(row));
              }
              
              await this.writer.appendRow(row);
              this.rowsWritten++;
              
              totalMoves++;
              moveCount++;
              
              // Log progress at intervals
              if (totalMoves - this.lastLoggedMoves >= LOG_INTERVAL) {
                console.log(`Extracted ${totalMoves} moves from ${totalGames} games so far...`);
                this.lastLoggedMoves = totalMoves;
              }
              
              // Check move limit after each write
              if (totalMoves >= this.maxMoves) {
                console.log(`Reached maximum of ${this.maxMoves} moves. Stopping extraction.`);
                this.isEnded = true;
              }
            } catch (appendError) {
              console.error('Error appending row to Parquet:', appendError);
              throw appendError;
            }
          });
        }
        
        // Wait for all writes to complete before proceeding
        await this.writeQueue;
        
        // Increment game counter and mark we found valid games
        totalGames++;
        validGamesFound = true;
        
        // Check if we've reached the game limit
        if (totalGames >= MAX_GAMES) {
          console.log(`Reached maximum of ${MAX_GAMES} games. Stopping extraction.`);
          this.isEnded = true;
        }
        
        // Log processed ply count for sanity
        console.log("✓ processed", moveCount, "ply from", gameId);
      } catch (parseError) {
        console.log('Reject reason: parseError', pgnString.substring(0, 500));
        gameFilterReasons.parseError++;
        skippedGames++;
        callback();
        return;
      }
      
      callback();
    } catch (error) {
      // Log error but continue processing
      console.log('Reject reason: other', error);
      gameFilterReasons.other++;
      skippedGames++;
      console.error('Error processing game:', error);
      callback();
    }
  }
  
  async _final(callback: (error?: Error | null) => void): Promise<void> {
    try {
      // Wait for any pending writes to complete
      await this.writeQueue;
      
      // Close the writer
      if (this.writer) {
        await this.writer.close();
        console.log('Parquet writer closed successfully');
        
        // Verify the output file exists and has content
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
      
      this.isEnded = true;
      callback();
    } catch (error: unknown) {
      console.error('Error in _final:', error);
      callback(error instanceof Error ? error : new Error(String(error)));
    }
  }
}

// Function to decompress using system zstd command
function decompressWithSystemZstd(inputFile: string, outputFile: string): boolean {
  try {
    console.log(`Decompressing ${inputFile} with system zstd command...`);
    
    // Use zstd CLI with -d (decompress), -f (force overwrite), -q (quiet), --no-check (skip integrity check)
    const result = spawnSync('zstd', ['-d', '-f', '-q', '--no-check', inputFile, '-o', outputFile], {
      stdio: 'pipe',
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer for process output
    });
    
    if (result.status !== 0) {
      console.error(`Decompression failed with exit code ${result.status}`);
      if (result.stderr && result.stderr.length > 0) {
        console.error(`stderr: ${result.stderr.toString().trim()}`);
      }
      return false;
    }
    
    // Check if output file exists and has content
    if (fs.existsSync(outputFile)) {
      const stats = fs.statSync(outputFile);
      fileSizeBytes = stats.size;
      
      // Check if file size is above the minimum threshold
      if (fileSizeBytes >= MIN_TEMP_FILE_SIZE_MB * 1024 * 1024) {
        console.log(`Decompression successful: ${(fileSizeBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`);
        return true;
      } else {
        console.error(`Decompressed file size (${(fileSizeBytes / (1024*1024)).toFixed(2)} MB) is below minimum threshold (${MIN_TEMP_FILE_SIZE_MB} MB)`);
        return false;
      }
    } else {
      console.error('Decompressed file not found');
    }
    
    return false;
  } catch (error) {
    console.error('Shell decompression failed:', error);
    return false;
  }
}

// Function to process PGN data from a stream
async function processPgnStream(stream: Readable, writer: ParquetWriter, maxMoves: number): Promise<boolean> {
  try {
    console.log('Processing PGN data from stream...');
    
    const accumulator = new PgnAccumulator();
    const processor = new PgnProcessor(writer, maxMoves);
    
    // Create a transform stream to process data
    const limitStream = new Transform({
      transform(chunk, encoding, callback) {
        this.push(chunk);
        callback();
      }
    });
    
    // Set up the pipeline with the limit stream
    return new Promise<boolean>((resolve) => {
      pipeline(
        stream,
        limitStream,
        accumulator,
        processor,
        (err: unknown) => {
          if (err) {
            console.error('Processing pipeline failed:', err);
            resolve(false);
          } else {
            console.log(`\nExtraction complete.`);
            console.log(`Games processed: ${totalGames}`);
            console.log(`Games skipped: ${skippedGames}`);
            console.log(`Filtering reasons:`);
            console.log(`  - Not blitz (3+2): ${gameFilterReasons.notBlitz + gameFilterReasons.invalidTimeControl}`);
            console.log(`  - No clock info: ${gameFilterReasons.noClockInfo}`);
            console.log(`  - Parse errors: ${gameFilterReasons.parseError}`);
            console.log(`  - No moves: ${gameFilterReasons.noMoves}`);
            console.log(`  - Other issues: ${gameFilterReasons.other}`);
            
            resolve(validGamesFound);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error in processPgnStream:', error);
    return false;
  }
}

async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const useStdin = args.includes('--stream');
  const inputArg = args.find(arg => arg.startsWith('--input='));
  const maxMovesArg = args.find(arg => arg.startsWith('--maxMoves='));
  const maxMoves = maxMovesArg ? parseInt(maxMovesArg.split('=')[1]) : DEFAULT_MAX_MOVES;
  const inputPath = inputArg ? inputArg.split('=')[1] : DEFAULT_INPUT_FILE;
  const isCompressed = inputPath.toLowerCase().endsWith('.zst');
  
  console.log('\n=== Starting FEN extraction ===');
  console.log(`Input: ${useStdin ? 'stdin' : inputPath}`);
  console.log(`Output: ${OUTPUT_FILE}`);
  console.log(`Max moves: ${maxMoves}`);
  console.log(`Current directory: ${process.cwd()}`);
  console.log(`Output file absolute path: ${path.resolve(OUTPUT_FILE)}`);
  
  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    console.log(`Creating output directory: ${outputDir}`);
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Clean up any existing files
  if (fs.existsSync(OUTPUT_FILE)) {
    console.log(`Removing existing output file: ${OUTPUT_FILE}`);
    fs.unlinkSync(OUTPUT_FILE);
  }
  
  // Create parquet writer with proper configuration
  let writer: ParquetWriter | null = null;
  try {
    console.log('\nCreating Parquet writer...');
    writer = await ParquetWriter.openFile(schema, OUTPUT_FILE, {
      pageSize: 8 * 1024, // 8KB page size
      rowGroupSize: 8 * 1024 * 1024, // 8 MB row group size
      useDataPageV2: true
    });
    console.log('Parquet writer created successfully');
    
    if (useStdin) {
      console.log('\nProcessing from stdin...');
      const stdinStream = process.stdin;
      stdinStream.setEncoding('utf8');
      await processPgnStream(stdinStream, writer, maxMoves);
    } else {
      // Check if input file exists
      if (!fs.existsSync(inputPath)) {
        console.error(`\nInput file not found: ${inputPath}. Cannot proceed.`);
        process.exit(1);
      }
      
      if (isCompressed) {
        console.log('\nInput file is .zst, starting zstd process...');
        const zstdProcess = spawn('zstd', ['-dc', '--no-check', inputPath]);
        
        // Handle zstd process events
        zstdProcess.on('error', (err) => {
          console.error('\nFailed to start zstd process:', err);
          process.exit(1);
        });
        
        zstdProcess.on('exit', (code) => {
          if (code !== 0) {
            console.error(`\nzstd process exited with code ${code}`);
            process.exit(1);
          }
        });
        
        // Handle zstd output
        zstdProcess.stderr.on('data', (data) => {
          console.error('zstd error:', data.toString());
        });
        
        const zstdStream = zstdProcess.stdout;
        zstdStream.setEncoding('utf8');
        
        console.log('Starting PGN stream processing...');
        await processPgnStream(zstdStream, writer, maxMoves);
      } else {
        console.log('\nInput file is not .zst, processing directly...');
        const fileStream = createReadStream(inputPath, {
          encoding: 'utf8'
        });
        await processPgnStream(fileStream, writer, maxMoves);
      }
    }
    
    if (!validGamesFound || totalMoves === 0) {
      console.warn('\nNo valid blitz (3+2) games found or extracted. Parquet file might be empty or incomplete.');
    }
    
    // Report final results
    if (totalMoves > 0) {
      const parquetSize = fs.existsSync(OUTPUT_FILE) ? fs.statSync(OUTPUT_FILE).size : 0;
      console.log(`\n✅ Extracted ${totalMoves} moves from ${totalGames} blitz games`);
      console.log(`   to ${OUTPUT_FILE} (size ≈ ${(parquetSize / (1024 * 1024)).toFixed(1)} MB)`);
    } else {
      console.error('\nFAILED: Could not extract any FEN data.');
      process.exit(1);
    }
  } catch (error) {
    console.error('\nUnhandled error during extraction:', error);
    process.exit(1);
  }
}

// Run the extraction
main().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
}); 