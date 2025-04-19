import { useEffect, useState } from 'react';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { Program } from '@project-serum/anchor';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { Wager } from '../types/wager';
import { IDL } from '../types/wager';

type MatchStatus = 'searching' | 'matched';

interface MatchmakerState {
  status: MatchStatus;
  matchPda?: PublicKey;
  error?: string;
}

// Program ID from the contract
const PROGRAM_ID = new PublicKey('GZJ54HYGi1Qx9GKeC9Ncbu2upkCwxGdrXxaQE9b2JVCM');

export const useMatchmaker = (stakeLamports: number) => {
  const [state, setState] = useState<MatchmakerState>({ status: 'searching' });
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (!wallet) return;

    // Initialize program
    const program = new Program<Wager>(
      IDL as any,
      PROGRAM_ID,
      { wallet, connection }
    );

    // Connect to WebSocket
    const websocket = new WebSocket('ws://localhost:4000');
    setWs(websocket);

    // Send join message on connection
    websocket.onopen = () => {
      websocket.send(JSON.stringify({
        type: 'join',
        stake: stakeLamports,
        player: wallet.publicKey.toString()
      }));
    };

    // Handle WebSocket errors
    websocket.onerror = (error) => {
      setState(prev => ({
        ...prev,
        error: 'Failed to connect to matchmaker service'
      }));
    };

    // Handle incoming messages
    websocket.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'match_found') {
          const { playerOne, playerTwo, matchPda } = data;
          
          // Call confirm_match via Anchor client
          try {
            await program.methods
              .confirmMatch()
              .accounts({
                playerOne: new PublicKey(playerOne),
                playerTwo: new PublicKey(playerTwo),
                matchAccount: new PublicKey(matchPda),
                systemProgram: SystemProgram.programId,
              })
              .signers([wallet])
              .rpc();

            setState({
              status: 'matched',
              matchPda: new PublicKey(matchPda)
            });
          } catch (error) {
            console.error('Failed to confirm match:', error);
            setState(prev => ({
              ...prev,
              error: 'Failed to confirm match'
            }));
          }
        }
      } catch (error) {
        console.error('Failed to process matchmaker message:', error);
        setState(prev => ({
          ...prev,
          error: 'Failed to process matchmaker message'
        }));
      }
    };

    // Cleanup on unmount
    return () => {
      if (websocket) {
        websocket.close();
      }
    };
  }, [stakeLamports, wallet, connection]);

  return state;
};
