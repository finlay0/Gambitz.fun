import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import { Readable } from 'stream';

// Basic configuration - can be externalized later
const STOCKFISH_PATH = 'stockfish'; // Assumes stockfish is in PATH
const MOVETIME_MS = 300; // Milliseconds Stockfish should think per move
const SUSPICION_THRESHOLD = 0.7; // Example: 70% match rate is suspicious

interface StockfishAnalysisResult {
    bestMove: string | null;
    playerMove: string;
    matched: boolean;
}

export interface AntiCheatReport {
    isSuspicious: boolean;
    stockfishMatchPercentage: number;
    analyzedMoveCount: number;
    matchedMoveCount: number;
    details: StockfishAnalysisResult[];
    error?: string;
}

export class AntiCheatService {
    private stockfishProcess: ChildProcessWithoutNullStreams | null = null;

    private async sendCommand(command: string): Promise<string[]> {
        return new Promise((resolve, reject) => {
            if (!this.stockfishProcess || this.stockfishProcess.killed) {
                return reject(new Error('Stockfish process is not running or has been killed.'));
            }

            const process = this.stockfishProcess;
            const output: string[] = [];
            let resolved = false;

            const onData = (data: Buffer) => {
                const messages = data.toString().trim().split('\n');
                output.push(...messages);
                // console.log(`Stockfish RAW: ${messages.join(' | ')}`); // For debugging

                // Define command-specific terminators
                if (command.startsWith('go') && messages.some(m => m.startsWith('bestmove'))) {
                    cleanupAndResolve();
                } else if (command === 'uci' && messages.some(m => m.trim() === 'uciok')) {
                    cleanupAndResolve();
                } else if (command === 'isready' && messages.some(m => m.trim() === 'readyok')) {
                    cleanupAndResolve();
                } else if (command === 'quit') { // Quit doesn't have a specific response, relies on close
                    cleanupAndResolve();
                }
            };

            const onError = (err: Error) => {
                console.error('Error communicating with Stockfish:', err);
                cleanupAndReject(err);
            };
            
            const onClose = (code: number | null) => {
                 // If quit was the command, this is expected. Otherwise, it's an unexpected close.
                if (command !== 'quit' && !resolved) {
                    cleanupAndReject(new Error(`Stockfish process closed unexpectedly with code ${code}. Output: ${output.join('\n')}`));
                } else if (!resolved) { // For quit command, resolve if not already
                    cleanupAndResolve();
                }
            }

            const cleanup = () => {
                process.stdout.removeListener('data', onData);
                process.stderr.removeListener('data', onData); // Assuming errors also come on stdout for UCI, or handle stderr separately
                process.removeListener('error', onError);
                process.removeListener('close', onClose);
            };
            
            const cleanupAndResolve = () => {
                if (resolved) return;
                resolved = true;
                cleanup();
                resolve(output);
            };

            const cleanupAndReject = (err: Error) => {
                if (resolved) return;
                resolved = true;
                cleanup();
                reject(err);
            };
            
            process.stdout.on('data', onData);
            process.stderr.on('data', (data) // Separate handler for stderr for logging, but UCI output is mainly stdout
                => console.error(`Stockfish STDERR: ${data.toString().trim()}`)
            );
            process.on('error', onError);
            process.on('close', onClose);
            
            // console.log(`Sending to Stockfish: ${command}`); // For debugging
            process.stdin.write(command + '\n');
        });
    }

    private async initializeStockfish(): Promise<void> {
        try {
            this.stockfishProcess = spawn(STOCKFISH_PATH);

            this.stockfishProcess.on('error', (err) => {
                console.error('Failed to start Stockfish process for analysis.', err);
                this.stockfishProcess = null; // Ensure it's marked as not running
                // This error will be caught by the promise in analyzeGame if init fails
                throw new Error(`Failed to spawn Stockfish: ${err.message}`);
            });
            
            // Check if process was spawned
            if (!this.stockfishProcess || !this.stockfishProcess.stdin) {
                 throw new Error('Stockfish process could not be spawned.');
            }

            await this.sendCommand('uci');
            await this.sendCommand('isready');
            // console.log('Stockfish initialized and ready.');
        } catch (error) {
            console.error('Error initializing Stockfish:', error);
            if (this.stockfishProcess && !this.stockfishProcess.killed) {
                this.stockfishProcess.kill();
            }
            this.stockfishProcess = null;
            throw error; // Re-throw to be caught by the calling method
        }
    }

    private parseBestMove(output: string[]): string | null {
        for (const line of output) {
            if (line.startsWith('bestmove')) {
                const parts = line.split(' ');
                return parts[1] || null;
            }
        }
        return null;
    }

    public async analyzeGame(moves: string[]): Promise<AntiCheatReport> {
        const analysisDetails: StockfishAnalysisResult[] = [];
        let matchedMoveCount = 0;
        // We skip the first few moves (e.g., 3 half-moves, or 1.5 full moves) as they are often opening theory
        // This can be made more sophisticated with a proper opening book later.
        const movesToAnalyze = moves.slice(3);


        if (movesToAnalyze.length === 0) {
            return {
                isSuspicious: false,
                stockfishMatchPercentage: 0,
                analyzedMoveCount: 0,
                matchedMoveCount: 0,
                details: [],
                error: "No moves provided for analysis after skipping opening."
            };
        }
        
        try {
            await this.initializeStockfish();
            if (!this.stockfishProcess) { // Should be caught by initializeStockfish, but as a safeguard
                throw new Error("Stockfish process not available after initialization attempt.");
            }

            for (let i = 0; i < movesToAnalyze.length; i++) {
                const playerMove = movesToAnalyze[i];
                // The full list of moves up to the current point (including those not analyzed for suspicion)
                const currentPositionMoves = moves.slice(0, moves.indexOf(playerMove)).join(' ');
                
                const positionCommand = `position startpos moves ${currentPositionMoves}`;
                await this.sendCommand(positionCommand);
                
                const goCommand = `go movetime ${MOVETIME_MS}`;
                const output = await this.sendCommand(goCommand);
                const bestMove = this.parseBestMove(output);

                const matched = bestMove === playerMove;
                if (matched) {
                    matchedMoveCount++;
                }
                analysisDetails.push({ bestMove, playerMove, matched });
            }

            const analyzedMoveCount = movesToAnalyze.length;
            const stockfishMatchPercentage = analyzedMoveCount > 0 ? matchedMoveCount / analyzedMoveCount : 0;
            
            return {
                isSuspicious: stockfishMatchPercentage >= SUSPICION_THRESHOLD && analyzedMoveCount > 5, // Only flag if enough moves analyzed
                stockfishMatchPercentage,
                analyzedMoveCount,
                matchedMoveCount,
                details: analysisDetails,
            };
        } catch (error: any) {
            console.error('Error during game analysis:', error);
            return {
                isSuspicious: false, // Or true, depending on policy for errors
                stockfishMatchPercentage: 0,
                analyzedMoveCount: 0,
                matchedMoveCount:0,
                details: analysisDetails, // Include partial details if any
                error: error.message || 'Unknown error during analysis',
            };
        } finally {
            if (this.stockfishProcess && !this.stockfishProcess.killed) {
                try {
                    // console.log("Sending quit to Stockfish...");
                    await this.sendCommand('quit');
                    // Wait a brief moment for Stockfish to process quit before checking killed status or attempting to kill
                    await new Promise(resolve => setTimeout(resolve, 50));

                    if (!this.stockfishProcess.killed) {
                         // console.log("Stockfish process not killed after quit, attempting to kill.");
                         this.stockfishProcess.kill();
                    }
                } catch (quitError) {
                    // console.error("Error sending quit to Stockfish or killing process:", quitError);
                    if (this.stockfishProcess && !this.stockfishProcess.killed) {
                        this.stockfishProcess.kill(); // Ensure it's killed if quit command failed
                    }
                }
            }
            this.stockfishProcess = null;
            // console.log("Stockfish process cleaned up.");
        }
    }
}

// Example Usage (for testing - remove or comment out in production)
/*
async function testAntiCheatService() {
    const service = new AntiCheatService();
    
    // Example game: Queen's Gambit
    const gameMoves = ["d2d4", "d7d5", "c2c4", "e7e6", "b1c3", "g8f6", "c1g5", "b8d7"];
    // Example game: Highly accurate short game (Scholar's Mate attempt)
    // const gameMoves = ["e2e4", "e7e5", "f1c4", "b8c6", "d1h5", "g8f6", "h5f7"];


    console.log(`Analyzing ${gameMoves.length} moves...`);
    const report = await service.analyzeGame(gameMoves);

    console.log("\n--- Anti-Cheat Report ---");
    console.log(`Suspicious: ${report.isSuspicious}`);
    console.log(`Stockfish Match: ${(report.stockfishMatchPercentage * 100).toFixed(2)}%`);
    console.log(`Analyzed Moves: ${report.analyzedMoveCount}`);
    console.log(`Matched Moves: ${report.matchedMoveCount}`);
    if (report.error) {
        console.error(`Error: ${report.error}`);
    }
    console.log("Details:");
    report.details.forEach((d, i) => {
        console.log(`  Move ${i + 1 + (gameMoves.length - report.analyzedMoveCount)} (${d.playerMove}): Stockfish said ${d.bestMove || 'N/A'}. Match: ${d.matched}`);
    });
}

testAntiCheatService().catch(console.error);
*/ 