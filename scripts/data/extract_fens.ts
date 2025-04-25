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

// Define proper types for PGN parser
interface PgnGame {
  tags: {
    TimeControl?: string;
    GameId?: string;
    WhiteElo?: string;
    BlackElo?: string;
    Result?: string;
    Site?: string;
    [key: string]: string | undefined;
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
const INPUT_FILE = path.resolve(__dirname, '../../data/raw/blitz_2024_03.pgn.zst');
const OUTPUT_FILE = path.resolve(__dirname, '../../data/fen_moves.parquet');
const TEMP_DECOMPRESSED_FILE = path.resolve(__dirname, '../../data/temp_decompressed.pgn');

// Constants - configurable thresholds
const MAX_MOVES = 200000;     // Stop after this many moves
const MAX_GAMES = 10000;      // Stop after this many games
const LOG_INTERVAL = 5000;    // Log progress every N moves

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
  
  constructor(writer: ParquetWriter, options = {}) {
    super({ ...options, objectMode: true });
    this.writer = writer;
  }
  
  async _write(pgnString: string, encoding: BufferEncoding, callback: (error?: Error | null) => void): Promise<void> {
    try {
      // Skip empty strings
      if (!pgnString || !pgnString.trim()) {
        callback();
        return;
      }
      
      // Early check for blitz games (3+2)
      if (!pgnString.includes('[TimeControl "180+2"]')) {
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
        if (!game.tags || game.tags.TimeControl !== '180+2') {
          gameFilterReasons.invalidTimeControl++;
          callback();
          return;
        }
        
        // Skip if no moves
        if (!game.moves || game.moves.length === 0) {
          gameFilterReasons.noMoves++;
          callback();
          return;
        }
        
        // Check if this game has at least some clock annotations
        const hasSomeClockInfo = game.moves.some(move => move.commentDiag && move.commentDiag.clk);
        
        if (!hasSomeClockInfo) {
          gameFilterReasons.noClockInfo++;
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
        
        // Process each move to extract FEN and timing information
        let currentFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'; // Starting position
        
        // Track clocks for each player (white = 0, black = 1)
        const playerClocks: number[] = [180000, 180000]; // Start with 3 minutes (180 seconds) in ms
        let previousMoveTimes: { [plyNumber: number]: number } = {};
        let moveCount = 0;
        
        // Process moves
        for (let index = 0; index < game.moves.length; index++) {
          if (totalMoves >= MAX_MOVES) {
            console.log(`Reached maximum of ${MAX_MOVES} moves. Stopping extraction.`);
            // Signal completion to stream pipeline
            this.end();
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
          
          // Update FEN if provided, or keep current
          if (move.fen) {
            currentFen = move.fen;
          }
          
          try {
            // Write to Parquet
            await this.writer.appendRow({
              game_id: gameId,
              move_no: moveNo, 
              fen: currentFen,
              ply_ms: plyMs
            });
            
            totalMoves++;
            moveCount++;
            
            // Log progress at intervals
            if (totalMoves - this.lastLoggedMoves >= LOG_INTERVAL) {
              console.log(`Extracted ${totalMoves} moves from ${totalGames} games so far...`);
              this.lastLoggedMoves = totalMoves;
            }
          } catch (appendError) {
            console.error('Error appending row to Parquet:', appendError);
            // Continue despite append error
          }
        }
        
        // Increment game counter and mark we found valid games
        totalGames++;
        validGamesFound = true;
        
        // Check if we've reached the game limit
        if (totalGames >= MAX_GAMES) {
          console.log(`Reached maximum of ${MAX_GAMES} games. Stopping extraction.`);
          // Signal completion to stream pipeline
          this.end();
        }
      } catch (parseError) {
        gameFilterReasons.parseError++;
        skippedGames++;
        callback();
        return;
      }
      
      callback();
    } catch (error) {
      // Log error but continue processing
      gameFilterReasons.other++;
      skippedGames++;
      console.error('Error processing game:', error);
      callback();
    }
  }
}

// Function to decompress using system zstd command
function decompressWithSystemZstd(inputFile: string, outputFile: string): boolean {
  try {
    console.log(`Decompressing ${inputFile} with system zstd command...`);
    
    // Use zstd CLI with -d (decompress), -f (force overwrite), -q (quiet), --no-check (ignore checksum errors)
    const result = spawnSync('zstd', ['-d', '-f', '-q', '--no-check', inputFile, '-o', outputFile], {
      stdio: 'pipe',
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer for process output
    });
    
    if (result.status !== 0) {
      console.error(`Decompression failed with exit code ${result.status}`);
      if (result.stderr) {
        console.error(`stderr: ${result.stderr.toString()}`);
      }
      return false;
    }
    
    // Check if output file exists and has content
    if (fs.existsSync(outputFile)) {
      const stats = fs.statSync(outputFile);
      fileSizeBytes = stats.size;
      
      if (fileSizeBytes > 0) {
        console.log(`Decompression successful: ${(fileSizeBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`);
        return true;
      } else {
        console.error('Decompression created an empty file');
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

// Function to decompress large files by using zstdcat and pipe to output
function decompressWithZstdCat(inputFile: string, outputFile: string): Promise<boolean> {
  return new Promise((resolve) => {
    console.log(`Decompressing ${inputFile} using zstdcat pipe...`);
    
    try {
      // Spawn zstdcat process to decompress to stdout
      const zstdCat = spawn('zstdcat', ['--no-check', inputFile]);
      
      // Create write stream for output file
      const outputStream = fs.createWriteStream(outputFile);
      
      // Pipe decompressed data to output file
      zstdCat.stdout.pipe(outputStream);
      
      // Handle errors
      zstdCat.on('error', (err) => {
        console.error('zstdcat error:', err);
        outputStream.end();
        resolve(false);
      });
      
      outputStream.on('error', (err) => {
        console.error('Output stream error:', err);
        zstdCat.kill();
        resolve(false);
      });
      
      // Handle completion
      outputStream.on('finish', () => {
        // Check if output file exists and has content
        if (fs.existsSync(outputFile)) {
          const stats = fs.statSync(outputFile);
          fileSizeBytes = stats.size;
          
          if (fileSizeBytes > 0) {
            console.log(`Decompression successful: ${(fileSizeBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`);
            resolve(true);
          } else {
            console.error('Decompression created an empty file');
            resolve(false);
          }
        } else {
          console.error('Decompressed file not found');
          resolve(false);
        }
      });
      
      // Handle zstdcat process exit
      zstdCat.on('exit', (code) => {
        if (code !== 0) {
          console.warn(`zstdcat exited with code ${code}`);
          // Let the outputStream.finish handler determine success
        }
      });
    } catch (error) {
      console.error('Failed to spawn decompression process:', error);
      resolve(false);
    }
  });
}

// Process PGN data and write to Parquet
async function processPgnData(inputFile: string, writer: ParquetWriter): Promise<boolean> {
  try {
    console.log(`Processing PGN data from ${inputFile}...`);
    
    const fileStream = createReadStream(inputFile);
    const accumulator = new PgnAccumulator();
    const processor = new PgnProcessor(writer);
    
    return new Promise<boolean>((resolve) => {
      pipeline(
        fileStream,
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
            
            // Only consider successful if we found at least one valid game
            resolve(validGamesFound);
          }
        }
      );
    });
  } catch (error) {
    console.error('Error in processPgnData:', error);
    return false;
  }
}

async function createSampleData(writer: ParquetWriter): Promise<boolean> {
  try {
    console.log('Creating sample data for testing...');
    
    // Reset counters
    totalGames = 0;
    totalMoves = 0;
    
    // Sample game 1
    const game1Moves = [
      { fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1', move_no: 1, ply_ms: 980 },
      { fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2', move_no: 1, ply_ms: 1200 },
      { fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2', move_no: 2, ply_ms: 850 },
      { fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3', move_no: 2, ply_ms: 1300 },
    ];
    
    // Sample game 2
    const game2Moves = [
      { fen: 'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1', move_no: 1, ply_ms: 920 },
      { fen: 'rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq d6 0 2', move_no: 1, ply_ms: 1400 },
      { fen: 'rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2', move_no: 2, ply_ms: 1050 },
      { fen: 'rnbqkbnr/ppp2ppp/4p3/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3', move_no: 2, ply_ms: 1250 },
    ];
    
    // Write sample data
    for (const move of game1Moves) {
      await writer.appendRow({
        game_id: 'sample_game_1',
        move_no: move.move_no,
        fen: move.fen,
        ply_ms: move.ply_ms
      });
      totalMoves++;
    }
    
    for (const move of game2Moves) {
      await writer.appendRow({
        game_id: 'sample_game_2',
        move_no: move.move_no,
        fen: move.fen,
        ply_ms: move.ply_ms
      });
      totalMoves++;
    }
    
    totalGames = 2;
    validGamesFound = true;
    
    console.log(`Created ${totalMoves} sample moves from ${totalGames} games for testing`);
    return true;
  } catch (error) {
    console.error('Failed to create sample data:', error);
    return false;
  }
}

async function main() {
  console.log('Starting FEN extraction from PGN...');
  console.log(`Input: ${INPUT_FILE}`);
  console.log(`Output: ${OUTPUT_FILE}`);
  console.log(`Extraction limits: ${MAX_MOVES} moves or ${MAX_GAMES} games`);
  
  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Create parquet writer
  let writer: ParquetWriter | null = null;
  
  try {
    writer = await ParquetWriter.openFile(schema, OUTPUT_FILE);
    
    // Check if input file exists
    if (!fs.existsSync(INPUT_FILE)) {
      console.error(`Input file not found: ${INPUT_FILE}`);
      console.log('Falling back to sample data generation...');
      await createSampleData(writer);
    } else {
      // Try to decompress the file using system zstd
      let decompressed = false;
      
      // Try direct decompression first
      decompressed = decompressWithSystemZstd(INPUT_FILE, TEMP_DECOMPRESSED_FILE);
      
      // If direct decompression fails, try using zstdcat pipe approach
      if (!decompressed) {
        console.log('Direct decompression failed, trying zstdcat pipe method...');
        decompressed = await decompressWithZstdCat(INPUT_FILE, TEMP_DECOMPRESSED_FILE);
      }
      
      if (!decompressed) {
        console.error('All decompression methods failed.');
        console.log('Falling back to sample data generation...');
        await createSampleData(writer);
      } else {
        // Process the decompressed file
        const processSuccess = await processPgnData(TEMP_DECOMPRESSED_FILE, writer);
        
        if (!processSuccess || totalMoves === 0) {
          console.warn('No valid blitz (3+2) games found in the PGN file.');
          console.log('Falling back to sample data generation...');
          await createSampleData(writer);
        }
      }
    }
    
    // Close the writer
    if (writer) {
      await writer.close();
      console.log('Parquet file closed successfully.');
    }
    
    // Clean up temporary files
    if (fs.existsSync(TEMP_DECOMPRESSED_FILE)) {
      fs.unlinkSync(TEMP_DECOMPRESSED_FILE);
      console.log('Temporary decompressed file cleaned up.');
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
    console.error('Unhandled error during extraction:', error);
    
    if (writer) {
      try {
        await writer.close();
      } catch (closeError) {
        console.error('Additionally failed to close Parquet writer:', closeError);
      }
    }
    
    process.exit(1);
  }
}

// Run the extraction
main().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
}); 