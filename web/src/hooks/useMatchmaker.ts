import { useCallback, useEffect, useRef, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor';
import { ResultVariant, PROGRAM_IDL } from '@/types/wager';
import { useFinalOpenings } from './useFinalOpenings';
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

export function useMatchmaker(initialStakeLamports: number, initialTimeControlTypeClient: string) {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey, signTransaction, signAllTransactions } = wallet;
  const [matchmakerState, setMatchmakerState] = useState<'idle' | 'connecting' | 'searching' | 'matched' | 'error'>('idle');
  const [matchmakerError, setMatchmakerError] = useState<string | null>(null);
  
  // State for the fully detailed match info from server
  const [matchDetails, setMatchDetails] = useState<{
    pda: PublicKey | null;
    playerOneKey: PublicKey | null;
    playerTwoKey: PublicKey | null;
    stakeLamports: number | null;
    timeControlTypeString: string | null;
  }>({ pda: null, playerOneKey: null, playerTwoKey: null, stakeLamports: null, timeControlTypeString: null });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { playerStats } = usePlayerStats();

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
        if (wsRef.current.url.includes(initialTimeControlTypeClient)) { 
            return;
        }
        wsRef.current.close();
    }

    setMatchmakerState('connecting');
    setMatchmakerError(null);
    setMatchDetails({ pda: null, playerOneKey: null, playerTwoKey: null, stakeLamports: null, timeControlTypeString: null });

    const ws = new WebSocket(WS_URL);
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
        const data = JSON.parse(event.data);
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
              toast.success('Match found! Details received.');
            } else {
              console.error("match_found message missing critical data:", data);
              setMatchmakerError("Received incomplete match data from server.");
              setMatchmakerState('error');
            }
            break;
          case 'error':
            setMatchmakerError(data.message);
            setMatchmakerState('error');
            break;
          case 'match_status':
            if (data.status === 'searching') {
              console.log(`Searching for opponent: ${data.message}`);
            }
            break;
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
        setMatchmakerError('Invalid message format from server');
        setMatchmakerState('error');
      }
    };

    ws.onclose = () => {
      if (matchmakerState !== 'idle' && matchmakerState !== 'error' && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
        const delay = Math.min(
          INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttemptsRef.current),
          MAX_RECONNECT_DELAY
        );
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++;
          console.log(`WebSocket closed. Attempting reconnect ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS}...`);
          connect();
        }, delay);
      } else if (matchmakerState !== 'idle' && matchmakerState !== 'error') {
        setMatchmakerError('Failed to connect to matchmaking server after multiple attempts.');
        setMatchmakerState('error');
      }
    };

    ws.onerror = (errEvent) => {
      console.error('WebSocket error:', errEvent);
      setMatchmakerError('Matchmaking server connection error.');
      setMatchmakerState('error');
    };
  }, [publicKey, initialStakeLamports, playerStats, initialTimeControlTypeClient, matchmakerState]);

  useEffect(() => {
    if (publicKey && playerStats) {
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
  }, [connect, publicKey, playerStats]);

  const createMatchOnChain = useCallback(async () => {
    if (!wallet?.publicKey || !signTransaction || !signAllTransactions) {
      setMatchmakerError("Wallet not connected or signTransaction not available."); return;
    }
    if (!matchDetails.pda || !matchDetails.playerOneKey || !matchDetails.playerTwoKey || matchDetails.stakeLamports === null || !matchDetails.timeControlTypeString) {
      setMatchmakerError("Insufficient match details to create match on chain."); return;
    }
    if (!wallet.publicKey.equals(matchDetails.playerOneKey)) {
      setMatchmakerError("Current user is not Player 1 for this match."); return;
    }

    let onChainTimeControlU8: number;
    if (matchDetails.timeControlTypeString === TIME_CONTROL_BLITZ_3_2) onChainTimeControlU8 = 0;
    else if (matchDetails.timeControlTypeString === TIME_CONTROL_BULLET_1_1) onChainTimeControlU8 = 1;
    else { setMatchmakerError(`Invalid time control type: ${matchDetails.timeControlTypeString}`); return; }

    try {
      const provider = new AnchorProvider(connection, wallet as AnchorWallet, AnchorProvider.defaultOptions());
      const program = new Program(PROGRAM_IDL, new web3.PublicKey('GZJ54HYGi1Qx9GKeC9Ncbu2upkCwxGdrXxaQE9b2JVCM'), provider);
      
      const [p1StatsPda] = await PublicKey.findProgramAddress([Buffer.from('player-stats'), matchDetails.playerOneKey.toBuffer()], program.programId);
      const [p2StatsPda] = await PublicKey.findProgramAddress([Buffer.from('player-stats'), matchDetails.playerTwoKey.toBuffer()], program.programId);

      toast.info(`Creating on-chain match (${matchDetails.timeControlTypeString}). PDA: ${matchDetails.pda.toBase58()}`);
      
      // Call the actual on-chain createMatch instruction with the time control type
      await program.methods
        .createMatch(
          new BN(matchDetails.stakeLamports),
          onChainTimeControlU8
        )
        .accounts({
          playerOne: matchDetails.playerOneKey,
          playerTwo: matchDetails.playerTwoKey,
          matchAccount: matchDetails.pda,
          playerOneStats: p1StatsPda,
          playerTwoStats: p2StatsPda,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();

      toast.success("On-chain match created successfully! Waiting for opponent confirmation...");

    } catch (err) {
      console.error('Failed to create on-chain match:', err);
      setMatchmakerError('Failed to create on-chain match: ' + (err as Error).message);
    }
  }, [connection, wallet, signTransaction, signAllTransactions, matchDetails]);

  const confirmMatchOnChain = useCallback(async () => {
    if (!wallet?.publicKey || !signTransaction || !signAllTransactions) {
      setMatchmakerError("Wallet not connected."); return;
    }
    if (!matchDetails.pda || !matchDetails.playerTwoKey) {
      setMatchmakerError("Insufficient match details to confirm match."); return;
    }
    if (!wallet.publicKey.equals(matchDetails.playerTwoKey)) {
      setMatchmakerError("Current user is not Player 2 for this match."); return;
    }

    try {
      const provider = new AnchorProvider(connection, wallet as AnchorWallet, AnchorProvider.defaultOptions());
      const program = new Program(PROGRAM_IDL, new web3.PublicKey('GZJ54HYGi1Qx9GKeC9Ncbu2upkCwxGdrXxaQE9b2JVCM'), provider);

      toast.info(`Confirming on-chain match. PDA: ${matchDetails.pda.toBase58()}`);
      
      // Call the actual on-chain confirmMatch instruction
      await program.methods
        .confirmMatch()
        .accounts({
          playerOne: matchDetails.playerOneKey,
          playerTwo: matchDetails.playerTwoKey,
          matchAccount: matchDetails.pda,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();

      toast.success("On-chain match confirmed! Game can start.");

    } catch (err) {
      console.error('Failed to confirm on-chain match:', err);
      setMatchmakerError('Failed to confirm on-chain match: ' + (err as Error).message);
    }
  }, [connection, wallet, signTransaction, signAllTransactions, matchDetails]);

  const submitResult = useCallback(async (result: ResultVariant) => {
    if (!wallet?.publicKey || !signTransaction || !signAllTransactions || !matchDetails.pda) {
        setMatchmakerError("Cannot submit result: Wallet or Match PDA not available."); return;
    }
    try {
        const provider = new AnchorProvider(connection, wallet as AnchorWallet, AnchorProvider.defaultOptions());
        const program = new Program(PROGRAM_IDL, new PublicKey('GZJ54HYGi1Qx9GKeC9Ncbu2upkCwxGdrXxaQE9b2JVCM'), provider);
        await program.methods.submitResult(result).accounts({ player: wallet.publicKey, matchAccount: matchDetails.pda }).rpc();
        toast.success("Result submitted!");
    } catch (err) {
        console.error('Failed to submit result:', err);
        setMatchmakerError("Failed to submit result: " + (err as Error).message);
    }
  }, [connection, wallet, signTransaction, signAllTransactions, matchDetails.pda]);

  const settleMatch = useCallback(async (moveHistory: string[], winnerKey: PublicKey) => {
    if (!wallet?.publicKey || !signTransaction || !signAllTransactions || !matchDetails.pda || !matchDetails.playerOneKey || !matchDetails.playerTwoKey) {
        setMatchmakerError("Cannot settle: Wallet or full Match Details not available."); return;
    }
    try {
        const provider = new AnchorProvider(connection, wallet as AnchorWallet, AnchorProvider.defaultOptions());
        const program = new Program(PROGRAM_IDL, new PublicKey('GZJ54HYGi1Qx9GKeC9Ncbu2upkCwxGdrXxaQE9b2JVCM'), provider);
        
        // Use finalOpeningsHook outside the callback
        const { prepareSettlementAccounts } = useFinalOpeningsRef.current;
        const otherSettlementAccounts = await prepareSettlementAccounts(matchDetails.pda, winnerKey, moveHistory);

        const accountsForSettle = {
            matchAccount: matchDetails.pda,
            winner: winnerKey,
            platform: otherSettlementAccounts.platform,
            openingOwner: otherSettlementAccounts.openingOwner,
            playerOneAccount: matchDetails.playerOneKey,
            playerTwoAccount: matchDetails.playerTwoKey,
            systemProgram: web3.SystemProgram.programId,
            signer: wallet.publicKey,
        };
        await program.methods.settleMatch().accounts(accountsForSettle).rpc();
        toast.success("Match settled!");
        setMatchDetails({ pda: null, playerOneKey: null, playerTwoKey: null, stakeLamports: null, timeControlTypeString: null });
        setMatchmakerState('idle');
    } catch (err) {
        console.error('Failed to settle match:', err);
        setMatchmakerError("Failed to settle match: " + (err as Error).message);
        throw err;
    }
  }, [connection, wallet, signTransaction, signAllTransactions, matchDetails, setMatchmakerState]);

  // Create a ref to store the useFinalOpenings hook outside of the callback
  const finalOpeningsHook = useFinalOpenings();
  const useFinalOpeningsRef = useRef(finalOpeningsHook);
  
  // Update the ref when the hook result changes
  useEffect(() => {
    useFinalOpeningsRef.current = finalOpeningsHook;
  }, [finalOpeningsHook]);

  return {
    matchmakerState,
    matchmakerError,
    matchDetails,
    createMatchOnChain,
    confirmMatchOnChain,
    submitResult,
    settleMatch,
    connect,
  };
}
