import { useCallback, useEffect, useRef, useState } from 'react';
import { useConnection, useWallet, type AnchorWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor';
import { ResultVariant, PROGRAM_IDL } from '@/types/wager';
import { usePlayerStats } from './usePlayerStats';
import { PublicKey } from '@solana/web3.js';
import { toast } from 'react-hot-toast';

const WS_URL = 'wss://api.chessbets.fun/ws';
const MAX_RECONNECT_ATTEMPTS = 5;
const INITIAL_RECONNECT_DELAY = 1000; // 1 second
const MAX_RECONNECT_DELAY = 30000; // 30 seconds

// Define Time Control Type Identifiers for consistency with server and contract
export const TIME_CONTROL_BLITZ_3_2 = "BLITZ_3_2";
export const TIME_CONTROL_BULLET_1_1 = "BULLET_1_1";

export interface MatchDetails {
  pda: PublicKey | null;
  playerOneKey: PublicKey | null;
  playerTwoKey: PublicKey | null;
  stakeLamports: number | null;
  timeControlTypeString: string | null;
}

export interface OpponentMoveDetails {
  moveSan: string;
  isPlayerOneTurnAfterMove: boolean;
}

export function useMatchmaker(initialStakeLamports: number, initialTimeControlTypeClient: string) {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey, signTransaction, signAllTransactions } = wallet;
  const [matchmakerState, setMatchmakerState] = useState<'idle' | 'connecting' | 'searching' | 'matched' | 'error'>('idle');
  const [matchmakerError, setMatchmakerError] = useState<string | null>(null);
  
  const [matchDetails, setMatchDetails] = useState<MatchDetails>({ 
    pda: null, playerOneKey: null, playerTwoKey: null, stakeLamports: null, timeControlTypeString: null 
  });

  const [lastOpponentMoveDetails, setLastOpponentMoveDetails] = useState<{ san: string, isPlayerOneTurnAfterMove: boolean } | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { playerStats } = usePlayerStats();

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN && wsRef.current.url.includes(initialTimeControlTypeClient)) {
      return;
    }
    if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close();
    }

    setMatchmakerState('connecting');
    setMatchmakerError(null);
    setMatchDetails({ pda: null, playerOneKey: null, playerTwoKey: null, stakeLamports: null, timeControlTypeString: null });

    const wsURLWithParams = `${WS_URL}?timeControl=${initialTimeControlTypeClient}`;
    const ws = new WebSocket(wsURLWithParams);
    wsRef.current = ws;

    ws.onopen = () => {
      setMatchmakerState('searching');
      reconnectAttemptsRef.current = 0;
      if (publicKey) {
        ws.send(JSON.stringify({
          type: 'search',
          publicKey: publicKey.toString(),
          timeControlType: initialTimeControlTypeClient,
          stakeLamports: initialStakeLamports,
          rating: playerStats?.rating || 1200,
          isProvisional: playerStats?.isProvisional || true
        }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string);
        switch (data.type) {
          case 'match_found':
            if (data.matchPda && data.playerOne && data.playerTwo && data.stake && data.timeControl) {
              setMatchDetails({
                pda: new web3.PublicKey(data.matchPda),
                playerOneKey: new web3.PublicKey(data.playerOne),
                playerTwoKey: new web3.PublicKey(data.playerTwo),
                stakeLamports: data.stake,
                timeControlTypeString: data.timeControl
              });
              setMatchmakerState('matched');
              setLastOpponentMoveDetails(null); 
              toast.success('Match found! Details received.');
            } else {
              console.error("match_found message missing critical data:", data);
              setMatchmakerError("Received incomplete match data.");
              setMatchmakerState('error');
            }
            break;
          case 'error':
            setMatchmakerError(data.message || "Unknown matchmaking error");
            setMatchmakerState('error');
            break;
          case 'match_status':
            if (data.status === 'searching') {
              console.log(`Searching for opponent: ${data.message}`);
            }
            break;
          case 'opponent_moved': 
            if (data.moveSan && typeof data.isPlayerOneTurnAfterMove === 'boolean') {
              setLastOpponentMoveDetails({
                san: data.moveSan,
                isPlayerOneTurnAfterMove: data.isPlayerOneTurnAfterMove,
              });
            } else {
              console.error("opponent_moved message missing data:", data);
              toast.error("Received invalid move data.");
            }
            break;
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
        setMatchmakerError('Invalid message from server');
        setMatchmakerState('error');
      }
    };

    ws.onclose = () => {
      if (matchmakerState !== 'idle' && matchmakerState !== 'error' && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
        const delay = Math.min(INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttemptsRef.current), MAX_RECONNECT_DELAY);
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++;
          console.log(`WebSocket closed. Reconnect ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS}...`);
          connect();
        }, delay);
      } else if (matchmakerState !== 'idle' && matchmakerState !== 'error') {
        setMatchmakerError('Connection lost to server.');
        setMatchmakerState('error');
      }
    };

    ws.onerror = (errEvent) => {
      console.error('WebSocket error:', errEvent);
      setMatchmakerError('Server connection error.');
      setMatchmakerState('error');
    };
  }, [publicKey, initialStakeLamports, playerStats, initialTimeControlTypeClient, matchmakerState]);

  useEffect(() => {
    if (publicKey && playerStats && initialTimeControlTypeClient) { 
      connect();
    }
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect, publicKey, playerStats, initialTimeControlTypeClient]);

  const sendPlayerMove = useCallback((moveSan: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && matchDetails.pda && publicKey) {
      const message = {
        type: 'player_move',
        matchPda: matchDetails.pda.toString(),
        moveSan,
        playerPublicKey: publicKey.toBase58(),
      };
      wsRef.current.send(JSON.stringify(message));
      console.log('Sent player_move:', message);
    } else {
      console.error("Cannot send move: WS not open, match details incomplete, or no public key.");
      toast.error("Connection error. Cannot send move.");
    }
  }, [wsRef, matchDetails.pda, publicKey]);

  const sendGameOverForAnalysis = useCallback((
    pda: string, 
    winnerKey: string | null, 
    reason: string // e.g., "checkmate", "resign", "timeout", "stalemate"
  ) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && pda) {
      const message = {
        type: 'game_over_for_analysis',
        matchPda: pda,
        result: {
          winnerPublicKey: winnerKey,
          reason,
        },
      };
      wsRef.current.send(JSON.stringify(message));
      console.log('Sent game_over_for_analysis:', message);
    } else {
      console.warn('Cannot send game_over_for_analysis: WS not open or no Pda');
    }
  }, [wsRef]);

  const createMatchOnChain = useCallback(async () => {
    if (!wallet?.publicKey || !signTransaction || !signAllTransactions) {
      setMatchmakerError("Wallet not connected."); return;
    }
    if (!matchDetails.pda || !matchDetails.playerOneKey || !matchDetails.playerTwoKey || matchDetails.stakeLamports === null || !matchDetails.timeControlTypeString) {
      setMatchmakerError("Insufficient match details for chain creation."); return;
    }
    if (!matchDetails.playerOneKey.equals(wallet.publicKey)) {
      setMatchmakerError("User is not Player 1."); return;
    }

    let onChainTimeControlU8: number;
    if (matchDetails.timeControlTypeString === TIME_CONTROL_BLITZ_3_2) onChainTimeControlU8 = 0;
    else if (matchDetails.timeControlTypeString === TIME_CONTROL_BULLET_1_1) onChainTimeControlU8 = 1;
    else { setMatchmakerError(`Invalid time control: ${matchDetails.timeControlTypeString}`); return; }

    try {
      const provider = new AnchorProvider(connection, wallet as AnchorWallet, AnchorProvider.defaultOptions());
      const program = new Program(PROGRAM_IDL, new web3.PublicKey('GZJ54HYGi1Qx9GKeC9Ncbu2upkCwxGdrXxaQE9b2JVCM'), provider);
      
      const [p1StatsPda] = await PublicKey.findProgramAddress([Buffer.from('player-stats'), matchDetails.playerOneKey.toBuffer()], program.programId);
      const [p2StatsPda] = await PublicKey.findProgramAddress([Buffer.from('player-stats'), matchDetails.playerTwoKey.toBuffer()], program.programId);

      toast(`Creating match (${matchDetails.timeControlTypeString})...`, { duration: 3000 });
      
      await program.methods
        .createMatch(new BN(matchDetails.stakeLamports), onChainTimeControlU8)
        .accounts({
          playerOne: matchDetails.playerOneKey,
          playerTwo: matchDetails.playerTwoKey,
          matchAccount: matchDetails.pda,
          playerOneStats: p1StatsPda,
          playerTwoStats: p2StatsPda,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();
      toast.success("Match created! Waiting for opponent...");
    } catch (err) {
      console.error('Create match failed:', err);
      setMatchmakerError('Create match failed: ' + (err instanceof Error ? err.message : String(err)));
    }
  }, [connection, wallet, signTransaction, signAllTransactions, matchDetails]);

  const confirmMatchOnChain = useCallback(async () => {
    if (!wallet?.publicKey || !signTransaction || !signAllTransactions) {
      setMatchmakerError("Wallet not connected."); return;
    }
    if (!matchDetails.pda || !matchDetails.playerOneKey || !matchDetails.playerTwoKey) {
      setMatchmakerError("Insufficient match details for confirmation."); return;
    }
    if (!matchDetails.playerTwoKey.equals(wallet.publicKey)) {
      setMatchmakerError("User is not Player 2."); return;
    }

    try {
      const provider = new AnchorProvider(connection, wallet as AnchorWallet, AnchorProvider.defaultOptions());
      const program = new Program(PROGRAM_IDL, new web3.PublicKey('GZJ54HYGi1Qx9GKeC9Ncbu2upkCwxGdrXxaQE9b2JVCM'), provider);

      toast(`Confirming match...`, { duration: 3000 });
      
      await program.methods
        .confirmMatch()
        .accounts({
          playerOne: matchDetails.playerOneKey,
          playerTwo: matchDetails.playerTwoKey,
          matchAccount: matchDetails.pda,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();
      toast.success("Match confirmed! Game can start.");
    } catch (err) {
      console.error('Confirm match failed:', err);
      setMatchmakerError('Confirm match failed: ' + (err instanceof Error ? err.message : String(err)));
    }
  }, [connection, wallet, signTransaction, signAllTransactions, matchDetails]);

  const submitResult = useCallback(async (result: ResultVariant) => {
    if (!wallet?.publicKey || !signTransaction || !signAllTransactions || !matchDetails.pda) {
        setMatchmakerError("Cannot submit result: Wallet/PDA missing."); return;
    }
    // Ensure PDA is not null for the transaction
    const matchAccountPda = matchDetails.pda;
    if (!matchAccountPda) {
        setMatchmakerError("Cannot submit result: Match PDA is null."); return;
    }

    try {
        const provider = new AnchorProvider(connection, wallet as AnchorWallet, AnchorProvider.defaultOptions());
        const program = new Program(PROGRAM_IDL, new web3.PublicKey('GZJ54HYGi1Qx9GKeC9Ncbu2upkCwxGdrXxaQE9b2JVCM'), provider);
        
        await program.methods.submitResult(result).accounts({ 
            player: wallet.publicKey, 
            matchAccount: matchAccountPda 
        }).rpc();
        toast.success("Result submitted!");
    } catch (errCaught: unknown) {
        console.error('Submit result failed:', errCaught);
        const errMessage = errCaught instanceof Error ? errCaught.message : String(errCaught);
        setMatchmakerError("Submit result failed: " + errMessage);

        const specificError = errCaught as { error?: { errorCode?: { code: string }, errorMessage?: string } };
        if (specificError?.error?.errorCode?.code) {
            toast.error(`Submit error: ${specificError.error.errorCode.code} - ${specificError.error.errorMessage}`);
        } 
    }
  }, [connection, wallet, signTransaction, signAllTransactions, matchDetails.pda]);

  const settleMatch = useCallback(async (moveHistoryForOpening: string[], winnerKey: PublicKey) => {
    if (!wallet?.publicKey || !signTransaction || !signAllTransactions || 
        !matchDetails.pda || !matchDetails.playerOneKey || !matchDetails.playerTwoKey) {
        setMatchmakerError("Cannot settle: Missing wallet or match details."); return;
    }

    const platformKey = new PublicKey("AwszNDgf4oTphGiEoA4Eua91dhsfxAW2VrzmgStLfziX");
    const openingOwnerForTx: PublicKey = platformKey; // Default to platform

    // TODO: Implement robust opening NFT owner lookup here.
    // This logic was previously tied to useFinalOpenings hook which caused issues with direct call.
    // It should be refactored, possibly by passing a pre-fetched owner or a lookup function.
    // For now, we are defaulting to the platform key for royalty if this logic isn't filled in.
    console.log("Opening NFT owner lookup needs to be implemented/refactored here. Defaulting to platform for now. Moves for opening:", moveHistoryForOpening);
    // Example of what it might look like if you had a getOpeningOwner function available:
    // if (typeof getOpeningNftOwnerFunction === 'function') { 
    //   const owner = await getOpeningNftOwnerFunction(moveHistoryForOpening);
    //   if (owner) openingOwnerForTx = owner;
    // }

    try {
      const provider = new AnchorProvider(connection, wallet as AnchorWallet, AnchorProvider.defaultOptions());
      const program = new Program(PROGRAM_IDL, new web3.PublicKey('GZJ54HYGi1Qx9GKeC9Ncbu2upkCwxGdrXxaQE9b2JVCM'), provider);

      toast.loading("Settling match...", { duration: 4000 });

      await program.methods.settleMatch(winnerKey)
        .accounts({
          signer: wallet.publicKey,
          matchAccount: matchDetails.pda,
          winner: winnerKey, 
          playerOneAccount: matchDetails.playerOneKey,
          playerTwoAccount: matchDetails.playerTwoKey,
          platform: platformKey, 
          openingOwner: openingOwnerForTx,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();
      toast.success("Match settled!");

    } catch (errCaught: unknown) {
      console.error('Settle match failed:', errCaught);
      const errMessage = errCaught instanceof Error ? errCaught.message : String(errCaught);
      toast.error('Settle match failed: ' + errMessage);
      
      const specificError = errCaught as { error?: { errorCode?: { code: string }, errorMessage?: string } };
      if (specificError?.error?.errorCode?.code) {
           toast.error(`On-chain error: ${specificError.error.errorCode.code} - ${specificError.error.errorMessage}`);
      }
    }
  // Ensure all dependencies for settleMatch are correctly listed.
  // If you introduce a getOpeningNftOwnerFunction, add it to dependencies.
  }, [connection, wallet, signTransaction, signAllTransactions, matchDetails]); 

  return {
    matchmakerState,
    matchmakerError,
    matchDetails,
    lastOpponentMoveDetails,
    setLastOpponentMoveDetails, 
    connect,
    createMatchOnChain,
    confirmMatchOnChain,
    submitResult,
    settleMatch,
    sendPlayerMove,
    sendGameOverForAnalysis,
  };
}
