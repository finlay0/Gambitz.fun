import { useCallback, useEffect, useRef, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor';
import { ResultVariant, PROGRAM_IDL } from '@/types/wager';

const WS_URL = 'wss://api.chessbets.fun/ws';
const MAX_RECONNECT_ATTEMPTS = 5;
const INITIAL_RECONNECT_DELAY = 1000; // 1 second
const MAX_RECONNECT_DELAY = 30000; // 30 seconds

export function useMatchmaker(timeControl: number) {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey, signTransaction, signAllTransactions } = wallet;
  const [state, setState] = useState<'idle' | 'connecting' | 'searching' | 'matched' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [matchPda, setMatchPda] = useState<web3.PublicKey | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setState('connecting');
    setError(null);

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setState('searching');
      reconnectAttemptsRef.current = 0;
      if (publicKey) {
        ws.send(JSON.stringify({
          type: 'search',
          publicKey: publicKey.toString(),
          timeControl,
        }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        switch (data.type) {
          case 'match_found':
            setState('matched');
            setMatchPda(new web3.PublicKey(data.matchPda));
            break;
          case 'error':
            setError(data.message);
            setState('error');
            break;
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
        setError('Invalid message format');
        setState('error');
      }
    };

    ws.onclose = () => {
      if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
        const delay = Math.min(
          INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttemptsRef.current),
          MAX_RECONNECT_DELAY
        );
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++;
          connect();
        }, delay);
      } else {
        setError('Failed to connect after multiple attempts');
        setState('error');
      }
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
      setError('Connection error');
      setState('error');
    };
  }, [publicKey, timeControl]);

  useEffect(() => {
    if (publicKey) {
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
  }, [connect, publicKey]);

  const createMatch = useCallback(async (amount: number) => {
    if (!publicKey || !signTransaction || !signAllTransactions) return;

    try {
      const provider = new AnchorProvider(connection, { publicKey, signTransaction, signAllTransactions }, {});
      const program = new Program(PROGRAM_IDL, new web3.PublicKey('GZJ54HYGi1Qx9GKeC9Ncbu2upkCwxGdrXxaQE9b2JVCM'), provider);

      const [matchAccount] = web3.PublicKey.findProgramAddressSync(
        [Buffer.from('match'), publicKey.toBuffer()],
        program.programId
      );

      await program.methods
        .createMatch(new BN(amount))
        .accounts({
          playerOne: publicKey,
          matchAccount,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();

      setMatchPda(matchAccount);
      setState('matched');
    } catch (err) {
      console.error('Failed to create match:', err);
      setError('Failed to create match');
      setState('error');
    }
  }, [connection, publicKey, signTransaction, signAllTransactions]);

  const joinMatch = useCallback(async (matchPda: web3.PublicKey) => {
    if (!publicKey || !signTransaction || !signAllTransactions) return;

    try {
      const provider = new AnchorProvider(connection, { publicKey, signTransaction, signAllTransactions }, {});
      const program = new Program(PROGRAM_IDL, new web3.PublicKey('GZJ54HYGi1Qx9GKeC9Ncbu2upkCwxGdrXxaQE9b2JVCM'), provider);

      await program.methods
        .confirmMatch()
        .accounts({
          playerTwo: publicKey,
          matchAccount: matchPda,
        })
        .rpc();

      setMatchPda(matchPda);
      setState('matched');
    } catch (err) {
      console.error('Failed to join match:', err);
      setError('Failed to join match');
      setState('error');
    }
  }, [connection, publicKey, signTransaction, signAllTransactions]);

  const submitResult = useCallback(async (result: ResultVariant) => {
    if (!publicKey || !signTransaction || !signAllTransactions || !matchPda) return;

    try {
      const provider = new AnchorProvider(connection, { publicKey, signTransaction, signAllTransactions }, {});
      const program = new Program(PROGRAM_IDL, new web3.PublicKey('GZJ54HYGi1Qx9GKeC9Ncbu2upkCwxGdrXxaQE9b2JVCM'), provider);

      await program.methods
        .submitResult(result)
        .accounts({
          player: publicKey,
          matchAccount: matchPda,
        })
        .rpc();
    } catch (err) {
      console.error('Failed to submit result:', err);
      setError('Failed to submit result');
      setState('error');
    }
  }, [connection, publicKey, signTransaction, signAllTransactions, matchPda]);

  const settleMatch = useCallback(async () => {
    if (!publicKey || !signTransaction || !signAllTransactions || !matchPda) return;

    try {
      const provider = new AnchorProvider(connection, { publicKey, signTransaction, signAllTransactions }, {});
      const program = new Program(PROGRAM_IDL, new web3.PublicKey('GZJ54HYGi1Qx9GKeC9Ncbu2upkCwxGdrXxaQE9b2JVCM'), provider);

      await program.methods
        .settleMatch()
        .accounts({
          matchAccount: matchPda,
        })
        .rpc();

      setState('idle');
      setMatchPda(null);
    } catch (err) {
      console.error('Failed to settle match:', err);
      setError('Failed to settle match');
      setState('error');
    }
  }, [connection, publicKey, signTransaction, signAllTransactions, matchPda]);

  return {
    state,
    error,
    matchPda,
    createMatch,
    joinMatch,
    submitResult,
    settleMatch,
  };
}
