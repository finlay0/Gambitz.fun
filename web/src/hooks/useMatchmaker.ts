import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, web3, BN, Idl } from '@coral-xyz/anchor';
import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { Wager, ResultVariant, PROGRAM_IDL } from '@/types/wager';
import { PublicKey } from '@solana/web3.js';

const PROGRAM_ID = new PublicKey('GZJ54HYGi1Qx9GKeC9Ncbu2upkCwxGdrXxaQE9b2JVCM');
const MATCHMAKER_WS_URL = process.env.NEXT_PUBLIC_MATCHMAKER_WS_URL || 'ws://localhost:3001';
const MAX_RECONNECT_ATTEMPTS = 3;
const INITIAL_RECONNECT_DELAY = 1000; // 1 second

type MatchmakerStatus = 'idle' | 'connecting' | 'searching' | 'matched' | 'error';
type MatchmakerResult = {
  status: MatchmakerStatus;
  matchPda: web3.PublicKey | null;
  error: string | null;
};

/**
 * Hook for managing matchmaking and game state.
 * Uses Anchor's enum format for result submission:
 * @example
 * ```typescript
 * // Submit a timeout result
 * program.methods.submitResult({ timeout: {} })
 * ```
 */
export function useMatchmaker(stakeLamports: number) {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey, signTransaction, signAllTransactions } = wallet;
  const [status, setStatus] = useState<MatchmakerStatus>('idle');
  const [matchPda, setMatchPda] = useState<web3.PublicKey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const lastJoinMessageRef = useRef<{ type: string; stake: number; player: string } | null>(null);

  const provider = useMemo(() => {
    if (!publicKey || !signTransaction || !signAllTransactions) return null;
    return new AnchorProvider(
      connection,
      {
        publicKey,
        signTransaction,
        signAllTransactions,
      },
      { commitment: 'confirmed' }
    );
  }, [connection, wallet, publicKey, signTransaction, signAllTransactions]);

  const program = useMemo(() => {
    if (!provider) return null;
    return new Program<Wager>(PROGRAM_IDL, PROGRAM_ID, provider);
  }, [provider]);

  const confirmMatch = useCallback(async (matchPda: web3.PublicKey) => {
    if (!program || !publicKey) throw new Error('Wallet not connected');

    const tx = await program.methods
      .confirmMatch(new BN(stakeLamports))
      .accounts({
        match: matchPda,
        player: publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

    return tx;
  }, [program, publicKey, stakeLamports]);

  const connectWebSocket = useCallback(() => {
    if (!publicKey || !program) return;

    // Clear any existing timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    const socket = new WebSocket(MATCHMAKER_WS_URL);
    setWs(socket);
    setStatus('connecting');

    socket.onopen = () => {
      setStatus('searching');
      const joinMessage = {
        type: 'join',
        stake: stakeLamports,
        player: publicKey.toString()
      };
      lastJoinMessageRef.current = joinMessage;
      socket.send(JSON.stringify(joinMessage));
      reconnectAttemptsRef.current = 0;
    };

    socket.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'match_found') {
        try {
          const matchPda = new web3.PublicKey(data.matchPda);
          await confirmMatch(matchPda);
          setMatchPda(matchPda);
          setStatus('matched');
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to confirm match');
          setStatus('error');
        }
      }
    };

    socket.onerror = (event) => {
      setError('WebSocket error');
      setStatus('error');
    };

    socket.onclose = () => {
      if (status === 'matched' || status === 'error') return;

      // Calculate exponential backoff delay
      const delay = Math.min(
        INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttemptsRef.current),
        30000 // Max 30 seconds
      );

      reconnectAttemptsRef.current += 1;
      
      if (reconnectAttemptsRef.current > MAX_RECONNECT_ATTEMPTS) {
        setError('Maximum reconnection attempts reached');
        setStatus('error');
        return;
      }

      setStatus('connecting');
      
      reconnectTimeoutRef.current = setTimeout(() => {
        connectWebSocket();
      }, delay);
    };

    return socket;
  }, [publicKey, program, confirmMatch, status, stakeLamports]);

  useEffect(() => {
    const socket = connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      socket?.close();
    };
  }, [connectWebSocket]);

  const createMatch = async (amount: number) => {
    if (!program || !publicKey) throw new Error('Wallet not connected');

    const [matchAccount] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from('chessbets'), publicKey.toBuffer()],
      program.programId
    );

    const tx = await program.methods
      .createMatch(new BN(amount))
      .accounts({
        playerOne: publicKey,
        playerTwo: publicKey,
        matchAccount,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

    return tx;
  };

  const joinMatch = async (matchAddress: string) => {
    if (!program || !publicKey) throw new Error('Wallet not connected');

    const matchPubkey = new web3.PublicKey(matchAddress);
    const tx = await program.methods
      .confirmMatch()
      .accounts({
        playerOne: publicKey,
        playerTwo: publicKey,
        matchAccount: matchPubkey,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

    return tx;
  };

  const submitResult = async (matchAddress: string, result: ResultVariant) => {
    if (!program || !publicKey) throw new Error('Wallet not connected');

    const matchPubkey = new web3.PublicKey(matchAddress);
    const tx = await program.methods
      .submitResult(result)
      .accounts({
        signer: publicKey,
        matchAccount: matchPubkey,
      })
      .rpc();

    return tx;
  };

  const settleMatch = async (matchAddress: string) => {
    if (!program || !publicKey) throw new Error('Wallet not connected');

    const matchPubkey = new web3.PublicKey(matchAddress);
    const tx = await program.methods
      .settleMatch()
      .accounts({
        signer: publicKey,
        matchAccount: matchPubkey,
        winner: publicKey,
        platform: web3.SystemProgram.programId,
        systemProgram: web3.SystemProgram.programId,
      })
      .rpc();

    return tx;
  };

  return {
    status,
    matchPda,
    error,
    program,
    createMatch,
    joinMatch,
    submitResult,
    settleMatch,
  };
}
