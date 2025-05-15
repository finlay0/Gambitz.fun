#!/usr/bin/env ts-node

import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import { Chess, Move } from 'chess.js';

// Constants for Stockfish analysis
const STOCKFISH_PATH = 'stockfish'; // Assuming stockfish is in PATH
const EVAL_DEPTH = 12; // Depth for Stockfish evaluation, can be adjusted

// Function to convert Stockfish score to centipawns
function scoreToCp(scoreOutput: string, perspectiveIfNoTurnInfo?: 'white' | 'black'): number {
  let cp = 0;
  const parts = scoreOutput.split(' '); // e.g., ["cp", "100"] or ["mate", "3"]

  if (parts.length < 2) {
    // Not a valid score string like "cp 100" or "mate 3"
    // This indicates an issue upstream or an unexpected Stockfish output format.
    console.error(`Invalid scoreOutput for scoreToCp: '${scoreOutput}'. Cannot parse.`);
    return NaN; // Explicitly return NaN for unparseable scores
  }

  const scoreType = parts[0];
  const scoreValue = parseInt(parts[1]);

  if (isNaN(scoreValue)) {
    console.error(`Could not parse scoreValue in scoreToCp from output: '${scoreOutput}'.`);
    return NaN; // Explicitly return NaN if score value is not a number
  }

  if (scoreType === 'mate') {
    // Positive for forced mate FOR the side whose turn it is in the FEN.
    // Negative if the side to move is GETTING mated.
    // A smaller absolute mateIn value is stronger.
    // So, mate 1 is stronger than mate 5.
    // mate -1 (getting mated in 1) is worse than mate -5.
    // Let's use a large number and subtract/add mateIn to reflect this strength.
    // If mateIn is positive (mating): 20000 - mateIn. (e.g., mate 1 = 19999, mate 5 = 19995)
    // If mateIn is negative (getting mated): -20000 - mateIn. (e.g., mate -1 = -19999, mate -5 = -19995)
    // Note: The original had `Math.abs(mateIn)` which might not be correct for negative mates.
    cp = scoreValue > 0 ? (20000 - scoreValue) : (-20000 + scoreValue);
  } else if (scoreType === 'cp') {
    cp = scoreValue;
  }

  // This function is now simpler: it returns the cp value AS REPORTED BY STOCKFISH for the FEN given.
  // The caller (analyzeGameForACPL) will handle normalization based on whose turn it *was*.
  // However, the 'perspectiveIfNoTurnInfo' was an attempt to normalize here. Let's stick to returning raw eval.
  // The normalization should happen based on chess.turn() BEFORE calling this.
  // For example, if it's black's turn, and stockfish says "cp 100", it means +100 for black.
  // The caller needs to know it was black's turn to interpret this as -100 from white's PoV.
  // Let's remove the perspective argument for now and make it clear this returns Stockfish's direct eval.
  return cp; 
}

// Function to get evaluation for a FEN position from Stockfish
async function getStockfishEval(fen: string, stockfish: ChildProcessWithoutNullStreams, depth: number): Promise<string> {
  return new Promise((resolve, reject) => {
    let rawScore = ''; // Will be like "cp 100" or "mate 3"
    let scoreLineFound = false;
    let bestMoveFound = false;
    let timeoutId: NodeJS.Timeout | null = null;

    const cleanupAndReject = (message: string) => {
      if (timeoutId) clearTimeout(timeoutId);
      cleanupListeners();
      reject(new Error(message));
    };

    const cleanupAndResolve = (value: string) => {
      if (timeoutId) clearTimeout(timeoutId);
      cleanupListeners();
      resolve(value);
    };

    const cleanupListeners = () => {
      stockfish.stdout.removeAllListeners('data');
      stockfish.stderr.removeAllListeners('data');
      stockfish.removeAllListeners('error'); // removeAllListeners for specific event
    };

    const errorHandler = (err: Error) => {
      cleanupListeners();
      reject(err);
    };

    const dataHandler = (data: Buffer) => {
      const lines = data.toString().split('\n');
      for (const line of lines) {
        // console.log(`SF: ${line}`); // DEBUG
        if (line.startsWith('info depth') && (line.includes(' score cp ') || line.includes(' score mate '))) {
          const scoreMatch = line.match(/score (cp -?\d+|mate -?\d+)/);
          if (scoreMatch && scoreMatch[1]) {
            rawScore = scoreMatch[1];
            scoreLineFound = true;
          }
        }
        if (line.startsWith('bestmove')) {
          bestMoveFound = true;
          if (scoreLineFound) {
            cleanupAndResolve(rawScore);
          } else {
            // This case means bestmove was received but no score line preceded it.
            cleanupAndReject('Stockfish reported bestmove without a preceding score line.');
          }
          return;
        }
      }
    };

    stockfish.stdout.on('data', dataHandler);
    stockfish.stderr.once('data', (data) => {
        // Stockfish sometimes outputs warnings to stderr that are not fatal.
        // Only reject on truly critical errors if possible, or log stderr for info.
        console.warn(`Stockfish stderr: ${data.toString()}`);
        // Not rejecting here anymore, as some stderr output is normal (e.g. version info on startup)
    });
    stockfish.once('error', errorHandler); // Handles process spawn errors etc.

    stockfish.stdin.write(`position fen ${fen}\n`);
    stockfish.stdin.write(`go depth ${depth}\n`);

    // Timeout for the 'go depth' command itself
    const EVAL_TIMEOUT_MS = 10000; // e.g., 10 seconds for an eval, adjust as needed
    timeoutId = setTimeout(() => {
      cleanupAndReject(`Stockfish evaluation timed out after ${EVAL_TIMEOUT_MS}ms for FEN: ${fen}`);
    }, EVAL_TIMEOUT_MS);
  });
}

export interface MoveAnalysis {
  moveNumber: number;
  player: 'white' | 'black';
  san: string;
  fenBefore: string;
  evalBeforeMove: number; // From White's perspective
  evalAfterMove: number;  // From White's perspective
  cpl: number;
}

export interface GameAnalysisResult {
  movesAnalyzed: MoveAnalysis[];
  averageCplWhite: number | null;
  averageCplBlack: number | null;
  overallAverageCpl: number | null;
  isSuspicious: boolean;
  suspicionReason: string | null;
  extremelyLowCplMovesWhite?: number;
  extremelyLowCplMovesBlack?: number;
  // Add any other summary stats you might want, e.g., blunder count, flags
  // suspicionScore?: number; // Example: A simple score based on ACPL - replaced by isSuspicious
}

// Main analysis function
export async function analyzeGameForACPL(pgnMoves: string[]): Promise<GameAnalysisResult> {
  const chess = new Chess();
  const analysisResults: MoveAnalysis[] = [];
  let stockfish: ChildProcessWithoutNullStreams | null = null;
  let totalCplWhite = 0;
  let movesWhite = 0;
  let totalCplBlack = 0;
  let movesBlack = 0;
  let extremelyLowCplMovesWhite = 0;
  let extremelyLowCplMovesBlack = 0;

  // Define basic thresholds for suspicion (these are examples and should be tuned)
  const SUSPICIOUSLY_LOW_ACPL_THRESHOLD = 15; // ACPL below this is suspicious (typical of GM/engine play)
  const MIN_MOVES_FOR_ACPL_FLAG = 10; // Minimum number of moves for a player to be flagged by ACPL
  const EXTREMELY_LOW_CPL_THRESHOLD = 2; // CPL at or below this is considered an extremely accurate/engine-like move
  const MIN_EXTREMELY_LOW_CPL_MOVES_FLAG = 3; // Minimum number of such moves to be notable

  try {
    stockfish = spawn(STOCKFISH_PATH, [], { stdio: ['pipe', 'pipe', 'pipe'] });
    stockfish.on('error', (err) => {
        console.error('Failed to start Stockfish process.', err);
        throw new Error('Stockfish process failed to start: ' + err.message);
    });

    stockfish.stdin.write('uci\n');
    stockfish.stdin.write('isready\n');
    await new Promise<void>((resolve, reject) => {
      let readyOkReceived = false;
      const readyHandler = (data: Buffer) => {
        const output = data.toString();
        if (output.includes('readyok')) {
          readyOkReceived = true;
          stockfish!.stdout.removeListener('data', readyHandler);
          resolve();
        }
      };
      stockfish!.stdout.on('data', readyHandler);
      const timeoutId = setTimeout(() => {
        if (!readyOkReceived) {
          stockfish!.stdout.removeListener('data', readyHandler);
          reject(new Error('Stockfish ready timeout'));
        }
      }, 7000);
    });
    console.log('Stockfish initialized for game analysis.');
    stockfish.stdin.write(`setoption name Threads value 1\n`);
    stockfish.stdin.write(`setoption name Hash value 16\n`);

    for (let i = 0; i < pgnMoves.length; i++) {
      const sanMove = pgnMoves[i];
      const playerTurnBeforeMove = chess.turn(); // 'w' or 'b'
      const fenBeforeMove = chess.fen();

      const rawEvalBeforeStr = await getStockfishEval(fenBeforeMove, stockfish, EVAL_DEPTH);
      let evalBeforeMoveCp = scoreToCp(rawEvalBeforeStr);
      // scoreToCp now returns eval from current FEN turn perspective.
      // We want it normalized to White's perspective for consistency in MoveAnalysis.
      if (playerTurnBeforeMove === 'b' && !isNaN(evalBeforeMoveCp)) {
        evalBeforeMoveCp = -evalBeforeMoveCp;
      }

      const moveResult = chess.move(sanMove);
      if (!moveResult) {
        console.warn(`Skipping invalid move in PGN: ${sanMove} at index ${i}. FEN: ${fenBeforeMove}`);
        analysisResults.push({
          moveNumber: Math.floor(i / 2) + 1,
          player: playerTurnBeforeMove === 'w' ? 'white' : 'black',
          san: sanMove + " (invalid)",
          fenBefore: fenBeforeMove,
          evalBeforeMove: evalBeforeMoveCp,
          evalAfterMove: evalBeforeMoveCp, // No change if move is invalid
          cpl: 0, // No CPL for invalid move
        });
        continue;
      }
      const fenAfterMove = chess.fen();
      const playerTurnAfterMove = chess.turn(); // Should be the opponent

      const rawEvalAfterStr = await getStockfishEval(fenAfterMove, stockfish, EVAL_DEPTH);
      let evalAfterMoveCp = scoreToCp(rawEvalAfterStr);
      // Normalize to White's perspective
      if (playerTurnAfterMove === 'b' && !isNaN(evalAfterMoveCp)) {
        evalAfterMoveCp = -evalAfterMoveCp;
      }
      
      let cpl = NaN; // Default to NaN
      // CPL is (eval_before_move from player X's perspective) - (eval_after_move from player X's perspective)
      // All our stored evals (evalBeforeMoveCp, evalAfterMoveCp) are NOW from White's perspective.
      
      if (!isNaN(evalBeforeMoveCp) && !isNaN(evalAfterMoveCp)) {
        if (playerTurnBeforeMove === 'w') { // White made the move
          // Eval before (White's PoV) - Eval after (White's PoV)
          cpl = evalBeforeMoveCp - evalAfterMoveCp;
        } else { // Black made the move
          // Eval before (White's PoV, so -X for Black) - Eval after (White's PoV, so -Y for Black)
          // We want: (-evalBeforeMoveCp_from_White_PoV) - (-evalAfterMoveCp_from_White_PoV)
          // This simplifies to: evalAfterMoveCp_from_White_PoV - evalBeforeMoveCp_from_White_PoV
          cpl = evalAfterMoveCp - evalBeforeMoveCp; 
        }
      } else {
        console.warn(`Cannot calculate CPL for move ${sanMove} due to NaN evaluation. EvalBefore: ${evalBeforeMoveCp}, EvalAfter: ${evalAfterMoveCp}`);
      }

      analysisResults.push({
        moveNumber: Math.floor(i / 2) + 1,
        player: playerTurnBeforeMove === 'w' ? 'white' : 'black',
        san: sanMove,
        fenBefore: fenBeforeMove,
        evalBeforeMove: evalBeforeMoveCp,
        evalAfterMove: evalAfterMoveCp,
        cpl: cpl,
      });

      if (!isNaN(cpl)) { // Only include valid CPLs in average calculation
        if (playerTurnBeforeMove === 'w') {
          totalCplWhite += cpl;
          movesWhite++;
          if (cpl <= EXTREMELY_LOW_CPL_THRESHOLD) {
            extremelyLowCplMovesWhite++;
          }
        } else {
          totalCplBlack += cpl;
          movesBlack++;
          if (cpl <= EXTREMELY_LOW_CPL_THRESHOLD) {
            extremelyLowCplMovesBlack++;
          }
        }
      }
      // console.log(`Processed move ${i+1}/${pgnMoves.length}: ${sanMove}, CPL: ${cpl.toFixed(0)}`);
    }

  } catch (error) {
    console.error('Error during game analysis:', error);
    throw error; // Rethrow to be caught by runExample or caller
  } finally {
    if (stockfish) {
      stockfish.stdin.write('quit\n');
      stockfish.kill();
      console.log('Stockfish process terminated.');
    }
  }

  const avgCplWhite = movesWhite > 0 ? totalCplWhite / movesWhite : null;
  const avgCplBlack = movesBlack > 0 ? totalCplBlack / movesBlack : null;
  const totalMoves = movesWhite + movesBlack;
  const overallAvgCpl = totalMoves > 0 ? (totalCplWhite + totalCplBlack) / totalMoves : null;

  let isSuspicious = false;
  let suspicionReason: string | null = null;

  if (avgCplWhite !== null && movesWhite >= MIN_MOVES_FOR_ACPL_FLAG && avgCplWhite < SUSPICIOUSLY_LOW_ACPL_THRESHOLD) {
    isSuspicious = true;
    suspicionReason = `White ACPL too low: ${avgCplWhite.toFixed(0)} over ${movesWhite} moves.`;
  }
  
  if (!isSuspicious && avgCplBlack !== null && movesBlack >= MIN_MOVES_FOR_ACPL_FLAG && avgCplBlack < SUSPICIOUSLY_LOW_ACPL_THRESHOLD) {
    isSuspicious = true;
    suspicionReason = `Black ACPL too low: ${avgCplBlack.toFixed(0)} over ${movesBlack} moves.`;
  }

  // Additional check: if a player has many extremely low CPL moves, even if their average is slightly higher
  if (!isSuspicious && movesWhite >= MIN_MOVES_FOR_ACPL_FLAG && extremelyLowCplMovesWhite >= MIN_EXTREMELY_LOW_CPL_MOVES_FLAG) {
    // Example: if more than X% of moves are extremely low CPL, or a raw count like MIN_EXTREMELY_LOW_CPL_MOVES_FLAG
    // For this example, let's use a simple count and also check if their ACPL is still quite low (e.g. < 25)
    if (avgCplWhite !== null && avgCplWhite < (SUSPICIOUSLY_LOW_ACPL_THRESHOLD + 10) ) { // e.g. < 25
        isSuspicious = true;
        suspicionReason = `White has ${extremelyLowCplMovesWhite} moves with CPL <= ${EXTREMELY_LOW_CPL_THRESHOLD} (ACPL: ${avgCplWhite.toFixed(0)} over ${movesWhite} moves).`;
    }
  }

  if (!isSuspicious && movesBlack >= MIN_MOVES_FOR_ACPL_FLAG && extremelyLowCplMovesBlack >= MIN_EXTREMELY_LOW_CPL_MOVES_FLAG) {
    if (avgCplBlack !== null && avgCplBlack < (SUSPICIOUSLY_LOW_ACPL_THRESHOLD + 10) ) { // e.g. < 25
        isSuspicious = true;
        suspicionReason = `Black has ${extremelyLowCplMovesBlack} moves with CPL <= ${EXTREMELY_LOW_CPL_THRESHOLD} (ACPL: ${avgCplBlack.toFixed(0)} over ${movesBlack} moves).`;
    }
  }
  
  // Could add more checks, e.g., overall ACPL, number of 0 CPL moves, etc.

  return {
    movesAnalyzed: analysisResults,
    averageCplWhite: avgCplWhite,
    averageCplBlack: avgCplBlack,
    overallAverageCpl: overallAvgCpl,
    isSuspicious: isSuspicious,
    suspicionReason: suspicionReason,
    extremelyLowCplMovesWhite: extremelyLowCplMovesWhite,
    extremelyLowCplMovesBlack: extremelyLowCplMovesBlack,
  };
}

// Example Usage (can be removed or commented out when used as a module)
async function runExample() {
  console.log("Starting runExample...");
  // const pgn = ['e4', 'e5', 'Nf3', 'Nc6']; 
  // A longer PGN to test ACPL flagging over more moves
  const pgn = [
    'e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6', // Sicilian Najdorf, 10 moves
    'Be3', 'e5', 'Nb3', 'Be6', 'f3', 'Nbd7', 'Qd2', 'b5', 'O-O-O', 'Be7' // 20 moves total
  ];
  console.log(`Analyzing PGN: ${pgn.join(' ')}`);
  try {
    const analysis = await analyzeGameForACPL(pgn);
    console.log('Analysis Complete:');
    analysis.movesAnalyzed.forEach(m => {
      console.log(
        `Move ${m.moveNumber} (${m.player} ${m.san}): ` +
        `EvalBefore: ${m.evalBeforeMove.toFixed(0)}, EvalAfter: ${m.evalAfterMove.toFixed(0)}, CPL: ${m.cpl.toFixed(0)}`
      );
    });
    console.log(`Average CPL White: ${analysis.averageCplWhite?.toFixed(0)}`);
    console.log(`Average CPL Black: ${analysis.averageCplBlack?.toFixed(0)}`);
    console.log(`Overall Average CPL: ${analysis.overallAverageCpl?.toFixed(0)}`);
    console.log(`Is Suspicious: ${analysis.isSuspicious}`);
    if (analysis.isSuspicious) {
      console.log(`Suspicion Reason: ${analysis.suspicionReason}`);
    }
  } catch (error) {
    console.error('Error in example usage:', error);
  }
}

// To run the example: ts-node scripts/anticheat/stockfish_analyzer.ts
runExample(); 