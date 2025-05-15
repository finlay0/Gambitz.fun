import * as ws from 'ws';
import { createLogger } from '../utils/logger';
import { PublicKey, Connection as SolanaConnection, SystemProgram } from '@solana/web3.js';
import { Program, AnchorProvider, web3, BN, Wallet } from '@coral-xyz/anchor';
import { findProgramAddress } from '../utils/pda';
import fetch from 'node-fetch'; // Added node-fetch import
// Import IDL for PlayerStats, assuming it's the same as used by client or a shared type
// If PROGRAM_IDL from @/types/wager is suitable and accessible, use that.
// For now, using require as in the original getPlayerStats.
// import { PROGRAM_IDL as WAGER_IDL } from '../../web/src/types/wager'; 
const WAGER_IDL = require('../../../contracts/target/idl/wager.json');
import { analyzeGameForACPL, GameAnalysisResult } from '../../scripts/anticheat/stockfish_analyzer'; // Added import
import fs from 'fs';
import { getOpeningFromMoves, getOpeningMint } from '../../web/lib/opening_data'; // Added for NFT logic

const logger = createLogger('MatchmakingService'); // Changed logger name slightly for clarity

// Constants for ELO matching
const DEFAULT_ELO = 1200;
const PROVISIONAL_MATCH_RANGE = 400; // Wider range for provisional players
const STANDARD_MATCH_RANGE = 200; // Standard players matched within ±200 ELO
const MATCH_RANGE_INCREMENT = 25; // Increase range every N seconds
const MATCH_RANGE_INTERVAL = 5; // Seconds between range increases
const MAX_MATCH_RANGE = 600; // Maximum match range after waiting

// New trust score thresholds
const MIN_TRUST_SCORE = 0;
const MAX_TRUST_SCORE = 100;
const HIGH_TRUST_THRESHOLD = 80;
const LOW_TRUST_THRESHOLD = 40;

// Time Control Type Identifiers (must match client-side and be distinct)
const TIME_CONTROL_TYPE_BLITZ_3_2 = "BLITZ_3_2";
const TIME_CONTROL_TYPE_BULLET_1_1 = "BULLET_1_1";

// From contracts/programs/wager/src/lib.rs
// const PLATFORM_RAKE_PUBKEY_STR = "AwszNDgf4oTphGiEoA4Eua91dhsfxAW2VrzmgStLfziX"; // Moved to env

// Cached openings data - REMOVING as we will use the proper NFT owner lookup service
// let openingsData: Record<string, string> | null = null; 

// Player information for matchmaking
interface QueuedPlayer {
  ws: ws.WebSocket;
  publicKey: string;
  timeControlType: string; // New field for specific time control, e.g., "BLITZ_3_2" or "BULLET_1_1"
  stakeLamports: number;
  rating: number;
  isProvisional: boolean;
  joinTime: number;
  searchRange: number;
  // Anti-smurf metrics
  accountAge: number;
  gamesPlayed: number;
  highStakeWinRate: number;
  lowStakeWinRate: number;
  trustScore: number;
  maxStake: number;
}

// Define interface for player stats account
interface PlayerStatsAccount {
  rating: number;
  isProvisional: boolean;
  games: number;
  wins: number; // Added wins as it's often part of stats
  highStakeWins: number;
  highStakeGames: number;
  lowStakeWins: number;
  lowStakeGames: number;
  accountCreationSlot: BN; // Use BN from Anchor for u64
  maxStakeLamports: BN;    // Use BN from Anchor for u64
  // Add other fields if they exist in your on-chain PlayerStats struct
  // weightedWinSum: BN;
  // totalStakeAmount: BN;
  // lastStakeAmounts: BN[]; 
  // lastWinFlags: boolean[];
  // nextHistoryIndex: number;
}

// New interfaces for active game management
interface ActiveMatchPlayer {
    ws: ws.WebSocket;
    publicKey: string;
}

interface ActiveMatch {
    matchPda: string;
    playerOne: ActiveMatchPlayer;
    playerTwo: ActiveMatchPlayer;
    isPlayerOneTurn: boolean;
    timeControlType: string; 
    stakeLamports: number;
    moveHistory: string[]; // Added move history
}

export class MatchmakingService {
  private wss: ws.Server;
  private players: QueuedPlayer[] = [];
  private connection: SolanaConnection;
  private programId: PublicKey;
  private rangeExpansionInterval: NodeJS.Timeout;
  private recentMatches: Map<string, string[]> = new Map(); // Track recent matches between players

  // New maps for active games and client connections
  private activeMatches: Map<string, ActiveMatch> = new Map(); // matchPda -> ActiveMatch
  private clientConnections: Map<ws.WebSocket, { matchPda: string, playerKey: string }> = new Map();

  constructor(server: ws.Server, rpcUrl: string, programId: string) {
    this.wss = server;
    this.connection = new SolanaConnection(rpcUrl);
    this.programId = new PublicKey(programId);
    this.setupWebSocketServer();
    
    // Periodically increase match ranges for waiting players
    this.rangeExpansionInterval = setInterval(() => {
      this.expandMatchRanges();
    }, MATCH_RANGE_INTERVAL * 1000);
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws) => {
      logger.info('Client connected');

      ws.on('message', async (message) => {
        try {
          const data = JSON.parse(message.toString());
          logger.debug('Received message:', { type: data.type, from: (this.clientConnections.get(ws) || {}).playerKey || 'unknown' });
          
          if (data.type === 'search') {
            await this.handleSearch(ws, data);
          } else if (data.type === 'cancel_search') { // Changed from 'cancel' for clarity
            this.handleCancelSearch(ws);
          } else if (data.type === 'player_move') { 
            await this.handlePlayerMove(ws, data);
          } else if (data.type === 'game_over_for_analysis') {
            await this.handleGameOverForAnalysis(ws, data);
          }
          // Add other message type handlers here if needed
        } catch (error: any) {
          logger.error('Error handling message', { error: error.message, stack: error.stack, rawMessage: message.toString() });
          this.sendError(ws, 'Invalid message format or internal server error');
        }
      });

      ws.on('close', () => {
        const clientInfo = this.clientConnections.get(ws);
        logger.info('Client disconnected', { playerKey: clientInfo?.playerKey, matchPda: clientInfo?.matchPda });
        this.handleDisconnect(ws); 
      });

      ws.on('error', (error) => {
        const clientInfo = this.clientConnections.get(ws);
        logger.error('WebSocket error', { error, playerKey: clientInfo?.playerKey, matchPda: clientInfo?.matchPda });
        this.handleDisconnect(ws); 
      });
    });
  }

  private async handlePlayerMove(ws: ws.WebSocket, data: any) {
    const { matchPda, moveSan, playerPublicKey } = data;

    if (!matchPda || typeof moveSan !== 'string' || !playerPublicKey) {
        return this.sendError(ws, 'Invalid player_move: missing fields.');
    }

    const clientInfo = this.clientConnections.get(ws);
    if (!clientInfo || clientInfo.playerKey !== playerPublicKey || clientInfo.matchPda !== matchPda) {
        logger.warn('Player move from unauthorized client or mismatched PDA', { playerPublicKey, clientMatchPda: clientInfo?.matchPda, messageMatchPda: matchPda });
        return this.sendError(ws, 'Unauthorized move or mismatched game.');
    }

    const game = this.activeMatches.get(matchPda);
    if (!game) {
        logger.warn('Player move for non-existent/inactive game', { matchPda });
        return this.sendError(ws, 'Game not found or already ended.');
    }

    const isSenderPlayerOne = playerPublicKey === game.playerOne.publicKey;
    
    if ((isSenderPlayerOne && !game.isPlayerOneTurn) || (!isSenderPlayerOne && game.isPlayerOneTurn)) {
        logger.warn('Move received out of turn', { matchPda, playerPublicKey, isPlayerOneTurn: game.isPlayerOneTurn });
        return this.sendError(ws, 'Not your turn.');
    }

    game.moveHistory.push(moveSan); // Store the move
    game.isPlayerOneTurn = !game.isPlayerOneTurn; // Toggle turn

    const opponent = isSenderPlayerOne ? game.playerTwo : game.playerOne;

    if (opponent.ws && opponent.ws.readyState === ws.OPEN) {
        this.sendMessage(opponent.ws, {
            type: 'opponent_moved',
            matchPda: matchPda,
            moveSan: moveSan,
            isPlayerOneTurnAfterMove: game.isPlayerOneTurn
        });
        logger.info('Move relayed', { matchPda, moveSan, from: playerPublicKey, to: opponent.publicKey });
    } else {
        logger.warn('Opponent not connected to relay move', { matchPda, opponentKey: opponent.publicKey });
        // TODO: Handle opponent disconnected scenario during active game move relay
        // This could involve auto-ending the game, or marking it for later review.
        // For now, inform the sender their move wasn't relayed due to opponent disconnect.
        this.sendError(ws, "Opponent disconnected. Move not relayed. Game may be forfeit.");
        // Potentially clean up this game as if the opponent disconnected fully.
        this.activeMatches.delete(matchPda);
        this.clientConnections.delete(ws); // remove sender
        if(opponent.ws) this.clientConnections.delete(opponent.ws); // remove opponent if their ws is somehow still mapped
        logger.info('Game ended due to opponent disconnect during move relay', {matchPda});
    }
  }

  private async handleSearch(ws: ws.WebSocket, data: any) {
    const { publicKey, timeControlType, stakeLamports } = data; 
    
    if (!publicKey || !timeControlType || typeof stakeLamports !== 'number') {
      return this.sendError(ws, 'Search: Missing publicKey, timeControlType, or stakeLamports.');
    }
    if (timeControlType !== TIME_CONTROL_TYPE_BLITZ_3_2 && timeControlType !== TIME_CONTROL_TYPE_BULLET_1_1) {
        return this.sendError(ws, 'Search: Invalid timeControlType.');
    }
    if (this.clientConnections.has(ws) || this.players.some(p => p.ws === ws)) {
        logger.warn('Search from client already in game/queue', { publicKey });
        this.handleDisconnect(ws); 
    }

    const playerStats = await this.getPlayerStats(publicKey);
    const trustScore = this.calculateTrustScore(playerStats);
    
    const playerInfo: QueuedPlayer = {
      ws,
      publicKey,
      timeControlType, 
      stakeLamports,
      rating: playerStats.rating,
      isProvisional: playerStats.isProvisional,
      joinTime: Date.now(),
      searchRange: playerStats.isProvisional ? PROVISIONAL_MATCH_RANGE : STANDARD_MATCH_RANGE,
      accountAge: playerStats.accountAge,
      gamesPlayed: playerStats.gamesPlayed,
      highStakeWinRate: playerStats.highStakeWinRate,
      lowStakeWinRate: playerStats.lowStakeWinRate,
      trustScore,
      maxStake: playerStats.maxStakeLamports.toNumber(),
    };
    
    this.players.push(playerInfo);
    logger.info('Player added to queue', { publicKey, timeControlType, stake: stakeLamports, rating: playerInfo.rating });
    this.sendStatusUpdate(ws, { status: 'searching', message: 'Added to queue. Finding opponent...' });
    this.tryMatch(playerInfo);
  }

  private handleCancelSearch(ws: ws.WebSocket) { 
    const playerIndex = this.players.findIndex(p => p.ws === ws);
    if (playerIndex !== -1) {
        const removedPlayer = this.players.splice(playerIndex, 1)[0];
        logger.info('Player removed from matchmaking queue', {publicKey: removedPlayer.publicKey});
        this.sendMessage(ws, { type: 'search_cancelled', message: 'Your matchmaking search has been cancelled.' });
    } else {
        logger.warn('Cancel_search request from client not in matchmaking queue.');
    }
  }

  private handleDisconnect(ws: ws.WebSocket) {
    const playerIndex = this.players.findIndex(p => p.ws === ws);
    if (playerIndex !== -1) {
      const removedPlayer = this.players.splice(playerIndex, 1)[0];
      logger.info('Player removed from queue due to disconnect', {publicKey: removedPlayer.publicKey});
    }

    const clientInfo = this.clientConnections.get(ws);
    if (clientInfo) {
        const { matchPda, playerKey } = clientInfo;
        const game = this.activeMatches.get(matchPda);

        if (game) {
            logger.info('Player disconnected from active match', { matchPda, playerKey });
            const opponent = playerKey === game.playerOne.publicKey ? game.playerTwo : game.playerOne;
            
            if (opponent.ws && opponent.ws.readyState === ws.OPEN) {
                this.sendMessage(opponent.ws, {
                    type: 'opponent_disconnected',
                    matchPda: matchPda,
                    disconnectedPlayerKey: playerKey,
                    message: "Your opponent has disconnected. The match may be claimable."
                });
                logger.info('Notified opponent of disconnection', { matchPda, opponentKey: opponent.publicKey });
            }
            this.activeMatches.delete(matchPda); 
            if (this.clientConnections.get(opponent.ws)?.matchPda === matchPda) {
                 this.clientConnections.delete(opponent.ws);
            }
        }
        this.clientConnections.delete(ws); 
        logger.info('Cleaned up client connection and active match if any', {playerKey, matchPda});
    }
  }

  private calculateTrustScore(playerStats: { accountAge: number, gamesPlayed: number, highStakeWinRate: number, lowStakeWinRate: number }): number {
    let score = 50;
    if (playerStats.accountAge < 20000) score -= 20;
    else if (playerStats.accountAge < 100000) score -= 10;
    if (playerStats.gamesPlayed >= 50) score += 30;
    else if (playerStats.gamesPlayed >= 25) score += 20;
    else if (playerStats.gamesPlayed >= 10) score += 10;
    if (playerStats.highStakeWinRate > 0 && playerStats.lowStakeWinRate > 0) {
      const winRateDifference = playerStats.highStakeWinRate - playerStats.lowStakeWinRate;
      if (winRateDifference > 0.3) score -= 30;
      else if (winRateDifference > 0.2) score -= 20;
      else if (winRateDifference > 0.1) score -= 10;
    }
    return Math.max(MIN_TRUST_SCORE, Math.min(MAX_TRUST_SCORE, score));
  }

  private async getPlayerStats(publicKeyString: string): Promise<{ 
      rating: number, isProvisional: boolean, gamesPlayed: number, wins: number,
      accountAge: number, highStakeWinRate: number, lowStakeWinRate: number, 
      maxStakeLamports: BN 
    }> {
    try {
      const playerPubkey = new PublicKey(publicKeyString);
      const [playerStatsPda] = await findProgramAddress(
        [Buffer.from('player-stats'), playerPubkey.toBuffer()],
        this.programId
      );
      
      const provider = new AnchorProvider(this.connection, { 
          publicKey: web3.Keypair.generate().publicKey, 
          signTransaction: async (tx) => tx, 
          signAllTransactions: async (txs) => txs 
        }, AnchorProvider.defaultOptions());
      
      const program = new Program(WAGER_IDL, this.programId, provider);
      
      const statsAccount = await program.account.playerStats.fetch(playerStatsPda) as PlayerStatsAccount;
      
      const highStakeWinRate = statsAccount.highStakeGames > 0 
        ? statsAccount.highStakeWins / statsAccount.highStakeGames : 0;
      const lowStakeWinRate = statsAccount.lowStakeGames > 0 
        ? statsAccount.lowStakeWins / statsAccount.lowStakeGames : 0;
      
      const currentSlot = await this.connection.getSlot();
      const accountAge = currentSlot - statsAccount.accountCreationSlot.toNumber();
      
      return {
        rating: statsAccount.rating,
        isProvisional: statsAccount.isProvisional,
        gamesPlayed: statsAccount.games,
        wins: statsAccount.wins,
        accountAge,
        highStakeWinRate,
        lowStakeWinRate,
        maxStakeLamports: statsAccount.maxStakeLamports
      };
    } catch (error: any) {
      logger.warn('Failed to fetch player stats or account not found, using defaults', { publicKey: publicKeyString, error: error.message });
      return { 
          rating: DEFAULT_ELO, isProvisional: true, gamesPlayed: 0, wins: 0,
          accountAge: 0, highStakeWinRate: 0, lowStakeWinRate: 0, 
          maxStakeLamports: new BN(10_000_000) // Default to 0.01 SOL for provisional max_stake
        };
    }
  }

  private expandMatchRanges() {
    const now = Date.now();
    this.players.forEach(player => {
      if ((now - player.joinTime) / 1000 > MATCH_RANGE_INTERVAL) {
        player.searchRange = Math.min(player.searchRange + MATCH_RANGE_INCREMENT, MAX_MATCH_RANGE);
        player.joinTime = now; 
      }
    });
  }

  private async tryMatch(player: QueuedPlayer) {
    const potentialOpponents = this.players.filter(opponent =>
      opponent.publicKey !== player.publicKey &&
      opponent.timeControlType === player.timeControlType && 
      opponent.stakeLamports === player.stakeLamports &&
      Math.abs(opponent.rating - player.rating) <= Math.max(player.searchRange, opponent.searchRange) &&
      opponent.trustScore >= LOW_TRUST_THRESHOLD && player.trustScore >= LOW_TRUST_THRESHOLD &&
      !(this.recentMatches.get(player.publicKey)?.includes(opponent.publicKey) || 
        this.recentMatches.get(opponent.publicKey)?.includes(player.publicKey))
    );

    if (potentialOpponents.length > 0) {
      // Basic sort: prioritize closer rating, then by earlier join time (FIFO for ties)
      potentialOpponents.sort((a, b) => {
        const ratingDiffA = Math.abs(a.rating - player.rating);
        const ratingDiffB = Math.abs(b.rating - player.rating);
        if (ratingDiffA !== ratingDiffB) return ratingDiffA - ratingDiffB;
        return a.joinTime - b.joinTime;
      });
      const opponent = potentialOpponents[0];

      this.players = this.players.filter(p => p.publicKey !== player.publicKey && p.publicKey !== opponent.publicKey);

      const p1Key = new PublicKey(player.publicKey);
      const p2Key = new PublicKey(opponent.publicKey);
      const seeds = [ Buffer.from("chessbets"), p1Key.toBuffer(), p2Key.toBuffer() ];
      const [matchPdaBytes, _bump] = await PublicKey.findProgramAddress(seeds, this.programId);
      const matchPdaString = matchPdaBytes.toBase58();

      logger.info('Match found!', { 
          playerOne: player.publicKey, playerTwo: opponent.publicKey, matchPda: matchPdaString, 
          stake: player.stakeLamports, timeControl: player.timeControlType 
      });
      this.updateRecentMatches(player.publicKey, opponent.publicKey);

      const activeGame: ActiveMatch = {
          matchPda: matchPdaString,
          playerOne: { ws: player.ws, publicKey: player.publicKey },
          playerTwo: { ws: opponent.ws, publicKey: opponent.publicKey },
          isPlayerOneTurn: true, 
          timeControlType: player.timeControlType,
          stakeLamports: player.stakeLamports,
          moveHistory: [] // Initialize move history
      };
      this.activeMatches.set(matchPdaString, activeGame);
      this.clientConnections.set(player.ws, { matchPda: matchPdaString, playerKey: player.publicKey });
      this.clientConnections.set(opponent.ws, { matchPda: matchPdaString, playerKey: opponent.publicKey });

      this.sendMatchFound(player.ws, matchPdaString, player.publicKey, opponent.publicKey, player.stakeLamports, player.timeControlType);
      this.sendMatchFound(opponent.ws, matchPdaString, player.publicKey, opponent.publicKey, player.stakeLamports, player.timeControlType);
    } else {
        this.sendStatusUpdate(player.ws, { status: 'searching', message: 'Still searching for an opponent...' });
    }
  }

  private updateRecentMatches(player1: string, player2: string) {
    const updateList = (key: string, value: string) => {
      const list = this.recentMatches.get(key) || [];
      list.push(value);
      if (list.length > 5) list.shift(); 
      this.recentMatches.set(key, list);
    };
    updateList(player1, player2);
    updateList(player2, player1);
  }

  private sendMatchFound(ws: ws.WebSocket, matchPda: string, playerOneKey: string, playerTwoKey: string, stake: number, timeControl: string) {
    this.sendMessage(ws, {
      type: 'match_found',
      matchPda,
      playerOne: playerOneKey,
      playerTwo: playerTwoKey,
      stake,
      timeControl
    });
  }

  private sendError(ws: ws.WebSocket, message: string) {
    if (ws.readyState === ws.OPEN) {
        this.sendMessage(ws, { type: 'error', message });
    }
  }

  private sendStatusUpdate(ws: ws.WebSocket, data: any) {
    if (ws.readyState === ws.OPEN) {
        this.sendMessage(ws, { type: 'match_status', ...data });
    }
  }

  private sendMessage(ws: ws.WebSocket, message: object) {
    if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify(message));
    }
  }

  public shutdown() {
    logger.info('Shutting down matchmaking service');
    clearInterval(this.rangeExpansionInterval);
    this.wss.clients.forEach(client => {
        if (client.readyState === ws.OPEN) {
            this.sendError(client, "Server is shutting down. Please try reconnecting later.");
            client.close();
        }
    });
    this.players = [];
    this.activeMatches.clear();
    this.clientConnections.clear();
    this.recentMatches.clear();
    this.wss.close((err) => {
        if (err) {
            logger.error('Error closing WebSocket server', err);
        } else {
            logger.info('WebSocket server closed gracefully.');
        }
    });
  }

  private async handleGameOverForAnalysis(ws: ws.WebSocket, data: any) {
    const { matchPda, result } = data;
    const clientInfo = this.clientConnections.get(ws);

    if (!matchPda || !result || typeof result.reason !== 'string') {
      logger.warn('Invalid game_over_for_analysis message: missing fields', { data });
      return this.sendError(ws, 'Invalid game_over_for_analysis: missing fields.');
    }

    // Optional: Validate that the sender is part of the match they are reporting on
    if (!clientInfo || clientInfo.matchPda !== matchPda) {
      logger.warn('game_over_for_analysis from client not in this match or unknown client', {
        clientMatchPda: clientInfo?.matchPda,
        clientPlayerKey: clientInfo?.playerKey,
        messageMatchPda: matchPda,
      });
      // Decide if this should be an error back to client or just a server-side ignore
      // return this.sendError(ws, 'Unauthorized game_over_for_analysis message.');
    }

    const game = this.activeMatches.get(matchPda);
    if (!game) {
      logger.warn('game_over_for_analysis for non-existent/inactive game', { matchPda });
      // It's possible the game was already cleaned up, or this is a late/duplicate message.
      // Depending on desired strictness, could send an error or just log.
      return this.sendError(ws, 'Game not found or already processed for analysis.');
    }

    const { winnerPublicKey, reason } = result;

    logger.info('Received game_over_for_analysis', {
      matchPda,
      playerOne: game.playerOne.publicKey,
      playerTwo: game.playerTwo.publicKey,
      reportedWinner: winnerPublicKey, // This can be null for draws
      reason,
      moveHistoryCount: game.moveHistory.length,
      // moveHistory: game.moveHistory, // Log the actual moves for now - potentially large
      reportingClient: clientInfo?.playerKey, 
    });

    try {
      logger.info(`Starting ACPL analysis for match ${matchPda}...`);
      const analysisResult: GameAnalysisResult = await analyzeGameForACPL(game.moveHistory);
      logger.info(`ACPL analysis complete for match ${matchPda}`, { 
        isSuspicious: analysisResult.isSuspicious, 
        suspicionReason: analysisResult.suspicionReason,
        avgCplWhite: analysisResult.averageCplWhite,
        avgCplBlack: analysisResult.averageCplBlack,
        extremelyLowCplWhite: analysisResult.extremelyLowCplMovesWhite,
        extremelyLowCplBlack: analysisResult.extremelyLowCplMovesBlack,
      });

      if (analysisResult.isSuspicious) {
        logger.warn(`Game ${matchPda} flagged as suspicious. Reason: ${analysisResult.suspicionReason}. Manual review required. Settlement will NOT proceed automatically.`);
        // Notify players
        const suspiciousMessage = { 
          type: 'analysis_complete', 
          matchPda, 
          status: 'under_review', 
          message: 'Game analysis complete. Irregular patterns detected, this game will be manually reviewed. Payouts are temporarily withheld.' 
        };
        if (game.playerOne.ws && game.playerOne.ws.readyState === ws.OPEN) {
          this.sendMessage(game.playerOne.ws, suspiciousMessage);
        }
        if (game.playerTwo.ws && game.playerTwo.ws.readyState === ws.OPEN) {
          this.sendMessage(game.playerTwo.ws, suspiciousMessage);
        }
        // TODO: Implement actual queueing for manual review or alternative handling for suspicious games.
        // For now, we just log and don't proceed to settlement.

      } else {
        logger.info(`Game ${matchPda} cleared by ACPL analysis. Proceeding with settlement logic.`);
        // Notify players that analysis is clear and settlement will proceed
        const clearMessage = { 
          type: 'analysis_complete', 
          matchPda, 
          status: 'cleared', 
          message: 'Game analysis complete. No irregularities detected. Settlement will proceed.' 
        };
        if (game.playerOne.ws && game.playerOne.ws.readyState === ws.OPEN) {
            this.sendMessage(game.playerOne.ws, clearMessage);
        }
        if (game.playerTwo.ws && game.playerTwo.ws.readyState === ws.OPEN) {
            this.sendMessage(game.playerTwo.ws, clearMessage);
        }
        // TODO: Implement the actual settlement call here
        // For example: await this.initiateSettlement(matchPda, game, reportedWinnerPkString);
        await this.initiateSettlement(matchPda, game, winnerPublicKey); // Call the new method
      }

    } catch (error) {
      logger.error(`Error during ACPL analysis for match ${matchPda}:`, { error });
      // Decide how to proceed if analysis itself fails.
      // Option 1: Assume suspicious and queue for manual review.
      // Option 2: Allow settlement but log the analysis failure.
      // Option 3: Retry analysis? (complex)
      // For now, let's send an error to players and log, but not proceed with auto-settlement if analysis fails.
      const analysisErrorMessage = { 
        type: 'analysis_error', 
        matchPda, 
        message: 'An error occurred during game analysis. The game will be reviewed manually. Payouts are temporarily withheld.' 
      };
      if (game.playerOne.ws && game.playerOne.ws.readyState === ws.OPEN) {
        this.sendMessage(game.playerOne.ws, analysisErrorMessage);
      }
      if (game.playerTwo.ws && game.playerTwo.ws.readyState === ws.OPEN) {
        this.sendMessage(game.playerTwo.ws, analysisErrorMessage);
      }
    }

    // TODO: Step 4: Based on analysis, decide if/how to signal clients (e.g. proceed with settlement) - Partially done above
    
    // Step 5: Clean up the active match from activeMatches and clientConnections
    // This should happen regardless of analysis outcome, after all notifications are sent.
    if (this.activeMatches.has(matchPda)) {
        this.activeMatches.delete(matchPda);
        // Clean up client connections associated with this match
        // Note: game.playerOne.ws and game.playerTwo.ws are the WebSockets involved in the game.
        // We should remove them from clientConnections if they are still present.
        if (game.playerOne.ws && this.clientConnections.has(game.playerOne.ws)) {
            this.clientConnections.delete(game.playerOne.ws);
        }
        if (game.playerTwo.ws && this.clientConnections.has(game.playerTwo.ws)) {
            this.clientConnections.delete(game.playerTwo.ws);
        }
        logger.info(`Match ${matchPda} and associated client connections cleaned up after analysis.`);
    } else {
        // This case might occur if cleanup happened elsewhere or if this is a duplicate/late call
        logger.warn(`Attempted to clean up match ${matchPda}, but it was not found in activeMatches. It might have been cleaned up already.`);
    }

    // The original analysis_pending message is now handled by more specific messages within the try/catch block
    // this.sendMessage(ws, { type: 'analysis_pending', matchPda, message: 'Game over received, analysis pending.'}); 
  }

  private async getNftOwner(mintAddress: string): Promise<PublicKey | null> {
    const heliusApiKey = process.env.HELIUS_API_KEY;
    if (!heliusApiKey) {
      logger.error('HELIUS_API_KEY environment variable is not set. Cannot fetch NFT owner.');
      return null;
    }

    // Base URL without the resource path so we can append it cleanly in each request
    const HELIUS_BASE_URL = 'https://api.helius.xyz/v0';
    const path = `/nfts/${mintAddress}`;
    const delimiter = path.includes('?') ? '&' : '?';
    const url = `${HELIUS_BASE_URL}${path}${delimiter}api-key=${heliusApiKey}`;

    try {
      // We need a fetch implementation in Node.js environment
      // For simplicity, assuming 'node-fetch' or a similar polyfill is available or will be added.
      // If not, this would need to be 'const fetch = require('node-fetch');' or similar.
      // For now, this will cause a runtime error if 'fetch' is not globally available in this Node env.
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`Failed to fetch NFT owner from Helius for mint ${mintAddress}. Status: ${response.status}`, { errorText });
        if (response.status === 429) {
          logger.warn(`Helius rate limit exceeded while fetching owner for mint ${mintAddress}.`);
        }
        return null;
      }

      const data = await response.json();
      if (data && data.owner) {
        return new PublicKey(data.owner);
      } else {
        logger.warn(`No owner data found in Helius response for mint ${mintAddress}.`, { responseData: data });
        return null;
      }
    } catch (error) {
      logger.error(`Error fetching NFT owner from Helius for mint ${mintAddress}:`, { 
        errorMessage: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      return null;
    }
  }

  private async initiateSettlement(
    matchPdaString: string,
    game: ActiveMatch, 
    reportedWinnerPkString: string | null // Can be null for a draw
  ): Promise<void> {
    logger.info(`Initiating settlement for match: ${matchPdaString}`);

    let serverSigner: web3.Keypair;
    try {
      const payerFileContents = fs.readFileSync('payer.json', 'utf-8');
      const payerSecretKey = Uint8Array.from(JSON.parse(payerFileContents));
      serverSigner = web3.Keypair.fromSecretKey(payerSecretKey);
      logger.info(`Loaded server signer from payer.json: ${serverSigner.publicKey.toBase58()}`);
    } catch (err: any) {
      logger.error('CRITICAL: Failed to load server signer from payer.json. Using a temporary keypair. THIS IS NOT SUITABLE FOR PRODUCTION.', { error: err.message });
      serverSigner = web3.Keypair.generate(); 
      logger.warn(`Using temporary server signer: ${serverSigner.publicKey.toBase58()}. Ensure payer.json is correctly configured for persistent signing.`);
    }
    // TODO: For production, ensure the serverSigner account is funded with SOL to pay for transaction fees.

    const provider = new AnchorProvider(
        this.connection, 
        new Wallet(serverSigner), 
        AnchorProvider.defaultOptions()
    );
    const program = new Program(WAGER_IDL, this.programId, provider);

    try {
      const matchPda = new PublicKey(matchPdaString);
      const playerOnePk = new PublicKey(game.playerOne.publicKey);
      const playerTwoPk = new PublicKey(game.playerTwo.publicKey);
      const platformRakePubkeyStr = process.env.PLATFORM_RAKE_PUBKEY;
      if (!platformRakePubkeyStr) {
        logger.error("CRITICAL: PLATFORM_RAKE_PUBKEY environment variable is not set. Settlement will likely fail or use an incorrect address if there's a fallback to a hardcoded one elsewhere by mistake.");
        throw new Error("PLATFORM_RAKE_PUBKEY environment variable is not set.");
      }
      const platformPk = new PublicKey(platformRakePubkeyStr);

      let winnerPkForTx: PublicKey;
      if (reportedWinnerPkString) {
        winnerPkForTx = new PublicKey(reportedWinnerPkString);
      } else {
        winnerPkForTx = SystemProgram.programId;
      }

      // --- Real Opening NFT Owner Lookup Logic ---
      let finalOpeningOwnerPk = platformPk; 
      const opening = getOpeningFromMoves(game.moveHistory);
      if (opening && opening.eco) {
        logger.info(`Match ${matchPdaString}: Identified opening ECO ${opening.eco} (${opening.name}). Attempting to find NFT owner.`);
        const mintAddress = getOpeningMint(opening.eco);
        if (mintAddress) {
          logger.info(`Match ${matchPdaString}: Found mint ${mintAddress} for ECO ${opening.eco}. Looking up owner.`);
          const owner = await this.getNftOwner(mintAddress);
          if (owner) {
            finalOpeningOwnerPk = owner;
            logger.info(`Match ${matchPdaString}: Found NFT owner ${owner.toBase58()} for mint ${mintAddress} (ECO ${opening.eco}).`);
          } else {
            logger.warn(`Match ${matchPdaString}: Could not find NFT owner for mint ${mintAddress} (ECO ${opening.eco}). Defaulting to platform.`);
          }
        } else {
          logger.info(`Match ${matchPdaString}: No specific NFT mint found for ECO ${opening.eco}. Defaulting to platform for royalties.`);
        }
      } else {
        logger.info(`Match ${matchPdaString}: No specific opening identified from PGN. Defaulting to platform for opening royalties.`);
      }
      // --- End Real Opening NFT Owner Lookup Logic ---

      // Derive PlayerStats PDAs to pass to the instruction
      const [playerOneStatsPda] = await findProgramAddress(
        [Buffer.from('player-stats'), playerOnePk.toBuffer()],
        this.programId
      );
      const [playerTwoStatsPda] = await findProgramAddress(
        [Buffer.from('player-stats'), playerTwoPk.toBuffer()],
        this.programId
      );

      const txSignature = await program.methods
        .settleMatch()
        .accounts({
          signer: serverSigner.publicKey,
          matchAccount: matchPda,
          winner: winnerPkForTx,
          playerOneAccount: playerOnePk, // Main account for funds
          playerTwoAccount: playerTwoPk, // Main account for funds
          platform: platformPk,
          openingOwner: finalOpeningOwnerPk,
          playerOneStats: playerOneStatsPda, // Player One's Stats PDA
          playerTwoStats: playerTwoStatsPda, // Player Two's Stats PDA
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      logger.info(`Settlement transaction submitted for match ${matchPdaString}. Signature: ${txSignature}`);
      const settlementSuccessMessage = {
        type: 'settlement_initiated',
        matchPda: matchPdaString,
        txSignature,
        message: `Settlement for match ${matchPdaString} has been successfully submitted to the network.`
      };
      if (game.playerOne.ws && game.playerOne.ws.readyState === ws.OPEN) {
        this.sendMessage(game.playerOne.ws, settlementSuccessMessage);
      }
      if (game.playerTwo.ws && game.playerTwo.ws.readyState === ws.OPEN) {
        this.sendMessage(game.playerTwo.ws, settlementSuccessMessage);
      }

    } catch (error) {
      logger.error(`Error initiating settlement for match ${matchPdaString}:`, { 
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
       });
      // Notify players about settlement failure if possible
      const settlementFailureMessage = {
        type: 'settlement_error',
        matchPda: matchPdaString,
        message: `An error occurred while trying to settle match ${matchPdaString}. Please contact support.`
      };
      if (game.playerOne.ws && game.playerOne.ws.readyState === ws.OPEN) {
        this.sendMessage(game.playerOne.ws, settlementFailureMessage);
      }
      if (game.playerTwo.ws && game.playerTwo.ws.readyState === ws.OPEN) {
        this.sendMessage(game.playerTwo.ws, settlementFailureMessage);
      }
      // Rethrow or handle as appropriate for your server logic
      // throw error; 
    }
  }
} 