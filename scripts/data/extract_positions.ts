#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as path from 'path';
import { createReadStream } from 'fs';
import { pipeline } from 'stream/promises';
import { ZstdCodec } from 'zstd-codec';
import * as readline from 'readline';
import * as chess from 'chess.js';
import { ParquetWriter, ParquetSchema } from '@dsnp/parquetjs';
import * as commander from 'commander';

// Define the command line options
const program = new commander.Command();
program
  .name('extract-positions')
  .description('Extract FEN positions from compressed PGN files')
  .option('-i, --input <path>', 'Input compressed PGN file path', path.resolve(__dirname, '../../data/raw/blitz_2024_03.pgn.zst'))
  .option('-o, --output <path>', 'Output parquet file path', path.resolve(__dirname, '../../data/processed/positions.parquet'))
  .option('-r, --rating <number>', 'Minimum player rating', '2000')
  .option('-t, --time-control <string>', 'Time control pattern to match (e.g. "blitz")', 'blitz')
  .option('-l, --limit <number>', 'Maximum number of positions to extract', '1000000')
  .option('-v, --verbose', 'Enable verbose logging')
  .parse(process.argv);

const options = program.opts();

// Input/output files
const INPUT_FILE = options.input;
const OUTPUT_FILE = options.output;
// Ensure output directory exists
fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });

// Filtering options
const MIN_RATING = parseInt(options.rating, 10);
const TIME_CONTROL_PATTERN = options.timeControl;
const MAX_POSITIONS = parseInt(options.limit, 10);
const VERBOSE = options.verbose;

// Define the schema for our Parquet file (This seems unused, keeping for now)
const schema = {
  fen: { type: 'UTF8' },
  move: { type: 'UTF8' },
  eval: { type: 'FLOAT' },
  turn: { type: 'UTF8' },
  result: { type: 'UTF8' },
  white_rating: { type: 'INT32' },
  black_rating: { type: 'INT32' },
  time_control: { type: 'UTF8' },
  game_id: { type: 'UTF8' },
  ply: { type: 'INT32' }
};

// Define Parquet schema format
const parquetSchemaDefinition = {
  fen: { type: 'UTF8' },
  move: { type: 'UTF8' },
  eval: { type: 'FLOAT' },
  turn: { type: 'UTF8' },
  result: { type: 'UTF8' },
  white_rating: { type: 'INT32' },
  black_rating: { type: 'INT32' },
  time_control: { type: 'UTF8' },
  game_id: { type: 'UTF8' },
  ply: { type: 'INT32' }
};
const parquetSchemaInstance = new ParquetSchema(parquetSchemaDefinition);

// Message frequency controls
const PROGRESS_UPDATE_INTERVAL = 10000; // positions
const LOG_INTERVAL = 1000; // positions

/**
 * Extract chess positions from compressed PGN file
 */
async function extractPositions(): Promise<void> {
  console.log(`Starting position extraction from: ${INPUT_FILE}`);
  console.log(`Output will be saved to: ${OUTPUT_FILE}`);
  console.log(`Minimum player rating: ${MIN_RATING}`);
  console.log(`Time control pattern: ${TIME_CONTROL_PATTERN}`);
  console.log(`Maximum positions: ${MAX_POSITIONS}`);
  
  // Create Parquet writer
  const writer = await ParquetWriter.openFile(parquetSchemaInstance, OUTPUT_FILE, { compression: 'SNAPPY' });
  
  let currentGame: {
    headers: Record<string, string>;
    moves: string[];
    gameId?: string;
    whiteRating?: number;
    blackRating?: number;
    timeControl?: string;
    result?: string;
    moveEvals?: Array<number | null>;
  } | null = null;
  
  let inHeader = false;
  let inMoves = false;
  
  let gamesProcessed = 0;
  let gamesMatchingCriteria = 0;
  let positionsExtracted = 0;
  let lastProgressUpdate = 0;
  
  try {
    // Read the entire compressed file into memory
    const compressedData = fs.readFileSync(INPUT_FILE);
    
    // Initialize and use the ZSTD codec
    const codec = new ZstdCodec();
    await new Promise(resolve => codec.init(resolve));
    const decompressor = new codec.Decompress();
    const decompressedData = decompressor.decompress(compressedData);
    
    // Convert decompressed data to string
    const text = new TextDecoder().decode(decompressedData);
    const lines = text.split(/\r?\n/);
    
    // Process each line
    for (let i = 0; i < lines.length; i++) {
      const trimmedLine = lines[i].trim();
      
      // Skip empty lines
      if (!trimmedLine) continue;
      
      // Header line
      if (trimmedLine.startsWith('[')) {
        // If we were in the moves section, finalize previous game
        if (inMoves && currentGame) {
          await processGame(currentGame, writer);
          gamesProcessed++;
          
          if (positionsExtracted >= MAX_POSITIONS) {
            console.log(`\nReached position limit of ${MAX_POSITIONS}. Stopping extraction.`);
            break;
          }
          
          // Log progress
          if (gamesProcessed % PROGRESS_UPDATE_INTERVAL === 0) {
            console.log(`\nProcessed ${gamesProcessed} games, extracted ${positionsExtracted} positions`);
            console.log(`Games matching criteria: ${gamesMatchingCriteria} (${(gamesMatchingCriteria / gamesProcessed * 100).toFixed(2)}%)`);
          }
        }
        
        // Start new game if encountering the first header
        if (!inHeader) {
          currentGame = { headers: {}, moves: [], moveEvals: [] };
          inHeader = true;
          inMoves = false;
        }
        
        // Parse header line
        const match = /\[([^\s"]+)\s+"([^"]+)"\]/.exec(trimmedLine);
        if (match && currentGame) {
          const [, key, value] = match;
          currentGame.headers[key] = value;
          
          // Extract specific header values we need for filtering
          if (key === 'WhiteElo') {
            currentGame.whiteRating = parseInt(value, 10);
          } else if (key === 'BlackElo') {
            currentGame.blackRating = parseInt(value, 10);
          } else if (key === 'TimeControl') {
            currentGame.timeControl = value;
          } else if (key === 'Result') {
            currentGame.result = value;
          } else if (key === 'Site') {
            // Extract game ID from lichess URL
            const siteMatch = /lichess\.org\/([a-zA-Z0-9]{8})/.exec(value);
            currentGame.gameId = siteMatch?.[1] || value;
          }
        }
      }
      // Move section
      else {
        if (inHeader) {
          inHeader = false;
          inMoves = true;
        }
        
        if (inMoves && currentGame) {
          // Parse moves and evaluation comments if present
          const moveRegex = /([a-hO0-8+#=!?]{2,8})(?:\s*\{([^}]*)\})?/g;
          let match;
          
          while ((match = moveRegex.exec(trimmedLine)) !== null) {
            const [, move, evalComment] = match;
            currentGame.moves.push(move);
            
            // Try to extract evaluation from comment
            if (evalComment) {
              const evalMatch = /(?:eval\s+)?([+-]?\d+\.?\d*)/.exec(evalComment);
              currentGame.moveEvals?.push(evalMatch ? parseFloat(evalMatch[1]) : null);
            } else {
              currentGame.moveEvals?.push(null);
            }
          }
        }
      }
    }
    
    // Process last game if needed
    if (currentGame && inMoves) {
      await processGame(currentGame, writer);
      gamesProcessed++;
    }
    
    // Final stats
    console.log(`\n✅ Extraction complete!`);
    console.log(`Total games processed: ${gamesProcessed}`);
    console.log(`Games matching criteria: ${gamesMatchingCriteria} (${(gamesMatchingCriteria / gamesProcessed * 100).toFixed(2)}%)`);
    console.log(`Positions extracted: ${positionsExtracted}`);
    console.log(`Output saved to: ${OUTPUT_FILE}`);
  } catch (error) {
    console.error(`Error during position extraction: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  } finally {
    // Close the Parquet writer
    await writer.close();
  }
  
  /**
   * Process a single chess game and extract positions
   */
  async function processGame(
    game: {
      headers: Record<string, string>;
      moves: string[];
      gameId?: string;
      whiteRating?: number;
      blackRating?: number;
      timeControl?: string;
      result?: string;
      moveEvals?: Array<number | null>;
    },
    writer: any
  ): Promise<void> {
    // Apply filtering criteria
    if (!meetsCriteria(game)) {
      return;
    }
    
    gamesMatchingCriteria++;
    
    try {
      // Initialize chess instance
      const Chess = new chess.Chess();
      const positions = [];
      
      // Play through the game
      for (let i = 0; i < game.moves.length; i++) {
        // Get the current position before the move
        const fen = Chess.fen();
        const turn = Chess.turn();
        
        // Make the move
        try {
          const moveResult = Chess.move(game.moves[i]);
          if (!moveResult) continue;
          
          // Extract position data
          const position = {
            fen,
            move: moveResult.san,
            eval: game.moveEvals?.[i] || null,
            turn: turn === 'w' ? 'white' : 'black',
            result: game.result || '*',
            white_rating: game.whiteRating || 0,
            black_rating: game.blackRating || 0,
            time_control: game.timeControl || '',
            game_id: game.gameId || '',
            ply: i
          };
          
          positions.push(position);
          
          // Write position to Parquet file
          await writer.appendRow({
            fen: position.fen,
            move: position.move,
            eval: position.eval || 0.0,
            turn: position.turn,
            result: position.result,
            white_rating: position.white_rating,
            black_rating: position.black_rating,
            time_control: position.time_control,
            game_id: position.game_id,
            ply: position.ply
          });
          
          positionsExtracted++;
          
          // Log progress
          if (VERBOSE && positionsExtracted % LOG_INTERVAL === 0 && positionsExtracted !== lastProgressUpdate) {
            process.stdout.write(`Extracted ${positionsExtracted} positions...\r`);
            lastProgressUpdate = positionsExtracted;
          }
          
          // Check if we've reached the position limit
          if (positionsExtracted >= MAX_POSITIONS) {
            return;
          }
        } catch (moveErr) {
          if (VERBOSE) {
            console.warn(`Invalid move: ${game.moves[i]} in game ${game.gameId || '(unknown)'}`);
          }
          continue;
        }
      }
    } catch (gameErr) {
      if (VERBOSE) {
        console.warn(`Error processing game ${game.gameId || '(unknown)'}: ${gameErr instanceof Error ? gameErr.message : String(gameErr)}`);
      }
    }
  }
  
  /**
   * Check if a game meets our filtering criteria
   */
  function meetsCriteria(game: {
    whiteRating?: number;
    blackRating?: number;
    timeControl?: string;
  }): boolean {
    // Check rating criteria
    if (game.whiteRating === undefined || game.blackRating === undefined) {
      return false;
    }
    
    if (game.whiteRating < MIN_RATING || game.blackRating < MIN_RATING) {
      return false;
    }
    
    // Check time control
    if (game.timeControl === undefined) {
      return false;
    }
    
    if (TIME_CONTROL_PATTERN && !isMatchingTimeControl(game.timeControl, TIME_CONTROL_PATTERN)) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Check if time control matches the specified pattern
   */
  function isMatchingTimeControl(timeControl: string, pattern: string): boolean {
    // For direct patterns like "blitz", "bullet", "rapid"
    if (pattern === 'blitz') {
      // Standard blitz is typically 3+2, 5+0, etc.
      const [baseStr, incrementStr] = timeControl.split('+');
      const base = parseInt(baseStr, 10);
      const increment = parseInt(incrementStr || '0', 10);
      
      // Blitz is typically defined as games with expected duration 3-10 minutes
      // Formula: base + increment * 40 (assuming 40 moves per game)
      const estimatedDuration = base + increment * 40;
      return estimatedDuration >= 180 && estimatedDuration < 600;
    } else if (pattern === 'bullet') {
      // Bullet is < 3 minutes total expected time
      const [baseStr, incrementStr] = timeControl.split('+');
      const base = parseInt(baseStr, 10);
      const increment = parseInt(incrementStr || '0', 10);
      
      const estimatedDuration = base + increment * 40;
      return estimatedDuration < 180;
    } else if (pattern === 'rapid') {
      // Rapid is 10-30 minutes total expected time
      const [baseStr, incrementStr] = timeControl.split('+');
      const base = parseInt(baseStr, 10);
      const increment = parseInt(incrementStr || '0', 10);
      
      const estimatedDuration = base + increment * 40;
      return estimatedDuration >= 600 && estimatedDuration < 1800;
    } else if (pattern === 'classical') {
      // Classical is > 30 minutes total expected time
      const [baseStr, incrementStr] = timeControl.split('+');
      const base = parseInt(baseStr, 10);
      const increment = parseInt(incrementStr || '0', 10);
      
      const estimatedDuration = base + increment * 40;
      return estimatedDuration >= 1800;
    }
    
    // For exact matches or regex
    try {
      const regex = new RegExp(pattern);
      return regex.test(timeControl);
    } catch (e) {
      // If not a valid regex, try as an exact match
      return timeControl === pattern;
    }
  }
}

// Run the main function
extractPositions()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(`Fatal error: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }); 