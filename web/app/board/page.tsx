'use client';

import { useEffect, useState } from 'react';
import { WalletProviders } from '@/components/WalletProviders';
import { useMatchmaker } from '@/hooks/useMatchmaker';
import { useStakeSelector } from '@/hooks/useStakeSelector';
import { Chessboard } from 'react-chessboard';
import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, web3, BN, Idl } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { Wager, createResultVariant, PROGRAM_IDL } from '@/types/wager';
import { Chess } from 'chess.js';
import { useChessTimer } from '@/hooks/useChessTimer';
import { toast } from 'react-hot-toast';
import { Dialog } from '@headlessui/react';

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

interface MoveHistoryProps {
  moves: string[];
  currentMove: number;
  onMoveClick: (moveIndex: number) => void;
}

const MoveHistory = ({ moves, currentMove, onMoveClick }: MoveHistoryProps) => {
  const pairs = [];
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push({
      white: moves[i],
      black: moves[i + 1] || null,
      whiteIndex: i,
      blackIndex: i + 1
    });
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 h-[600px] overflow-y-auto">
      <div className="font-bold mb-2">Move History</div>
      <div className="space-y-1">
        {pairs.map((pair, index) => (
          <div key={index} className="flex items-center space-x-2">
            <span className="text-gray-500 w-8">{index + 1}.</span>
            <button
              onClick={() => onMoveClick(pair.whiteIndex)}
              className={`w-20 text-left hover:bg-gray-100 p-1 rounded ${
                currentMove === pair.whiteIndex ? 'bg-blue-100' : ''
              }`}
            >
              {pair.white}
            </button>
            {pair.black && (
              <button
                onClick={() => onMoveClick(pair.blackIndex)}
                className={`w-20 text-left hover:bg-gray-100 p-1 rounded ${
                  currentMove === pair.blackIndex ? 'bg-blue-100' : ''
                }`}
              >
                {pair.black}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const BoardPage = () => {
  const [stakeLamports] = useStakeSelector();
  const { state, matchPda } = useMatchmaker(stakeLamports);
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const [game] = useState(() => new Chess());
  const [position, setPosition] = useState(game.fen());
  const [moves, setMoves] = useState<string[]>([]);
  const [currentMove, setCurrentMove] = useState(-1);
  const { timers, startTimers, stopTimers, switchActiveTimer } = useChessTimer(game);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResignDialogOpen, setIsResignDialogOpen] = useState(false);

  // Initialize provider and program
  const provider = new AnchorProvider(
    connection,
    wallet as any,
    { commitment: 'confirmed' }
  );

  const program = new Program<Wager>(
    PROGRAM_IDL,
    new PublicKey('GZJ54HYGi1Qx9GKeC9Ncbu2upkCwxGdrXxaQE9b2JVCM'),
    provider
  );

  // Start timers when game starts
  useEffect(() => {
    if (state === 'matched') {
      startTimers();
    }
  }, [state, startTimers]);

  const getErrorMessage = (error: any, variant: string): string => {
    if (error.message?.includes('insufficient funds')) {
      return 'Insufficient funds to submit result';
    } else if (error.message?.includes('not authorized')) {
      return 'You are not authorized to submit this result';
    } else if (error.message?.includes('already submitted')) {
      return 'Result has already been submitted';
    } else if (error.message?.includes('invalid state')) {
      return 'Game is not in a valid state to submit result';
    } else if (error.message?.includes('timeout')) {
      return 'Transaction timed out. Please try again';
    } else {
      return `Failed to submit ${variant} result. Please try again.`;
    }
  };

  const handleResultSubmission = async (variant: 'mate' | 'resign' | 'timeout' | 'disconnect') => {
    if (!matchPda || !wallet) {
      toast.error('Wallet not connected or match not found');
      return;
    }

    setIsSubmitting(true);
    try {
      await program.methods
        .submitResult(createResultVariant(variant))
        .accounts({
          signer: wallet.publicKey,
          matchAccount: matchPda,
        })
        .rpc();
      
      stopTimers();
      toast.success(`Game ended: ${variant}`);
    } catch (error) {
      console.error('Failed to submit result:', error);
      const errorMessage = getErrorMessage(error, variant);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
      setIsResignDialogOpen(false);
    }
  };

  const handleResign = () => setIsResignDialogOpen(true);
  const handleCheckmate = () => handleResultSubmission('mate');
  const handleTimeout = () => handleResultSubmission('timeout');
  const handleDisconnect = () => handleResultSubmission('disconnect');

  // Add timeout check in the timer effect
  useEffect(() => {
    if (state === 'matched') {
      const checkTimeout = () => {
        if (timers.white <= 0) {
          handleTimeout();
        } else if (timers.black <= 0) {
          handleTimeout();
        }
      };

      const interval = setInterval(checkTimeout, 1000);
      return () => clearInterval(interval);
    }
  }, [state, timers.white, timers.black]);

  // Add disconnect handling
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (state === 'matched' && !isSubmitting) {
        handleDisconnect();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state, isSubmitting]);

  const onPieceDrop = (sourceSquare: string, targetSquare: string) => {
    const move = game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q' // Always promote to queen for simplicity
    });

    if (move) {
      setPosition(game.fen());
      setMoves(prev => [...prev, move.san]);
      setCurrentMove(moves.length);
      switchActiveTimer();

      // Check for checkmate after the move
      if (game.isCheckmate()) {
        handleCheckmate();
      }

      return true;
    }
    return false;
  };

  const handleMoveClick = (moveIndex: number) => {
    // Create a new game instance and replay moves up to the clicked move
    const tempGame = new Chess();
    for (let i = 0; i <= moveIndex; i++) {
      tempGame.move(moves[i]);
    }
    setPosition(tempGame.fen());
    setCurrentMove(moveIndex);
  };

  const returnToCurrentPosition = () => {
    // Replay all moves to get to the current position
    const tempGame = new Chess();
    for (const move of moves) {
      tempGame.move(move);
    }
    setPosition(tempGame.fen());
    setCurrentMove(moves.length - 1);
  };

  if (state === 'searching') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Searching for opponent...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="text-2xl font-bold">Chess Game</div>
          <div className="flex space-x-4">
            <div className={`bg-white p-2 rounded shadow ${timers.active === 'white' ? 'ring-2 ring-blue-500' : ''}`}>
              <div className="text-sm text-gray-500">White</div>
              <div className="text-xl font-mono">{formatTime(timers.white)}</div>
            </div>
            <div className={`bg-white p-2 rounded shadow ${timers.active === 'black' ? 'ring-2 ring-blue-500' : ''}`}>
              <div className="text-sm text-gray-500">Black</div>
              <div className="text-xl font-mono">{formatTime(timers.black)}</div>
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <div className="bg-white rounded-lg shadow-lg p-4">
            <Chessboard
              position={position}
              onPieceDrop={onPieceDrop}
            />
          </div>
          <MoveHistory 
            moves={moves} 
            currentMove={currentMove}
            onMoveClick={handleMoveClick}
          />
          <div className="mt-4">
            <button
              onClick={returnToCurrentPosition}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
              Return to Current Position
            </button>
          </div>
        </div>

        <div className="mt-4 flex justify-end space-x-4">
          <button
            onClick={handleResign}
            disabled={isSubmitting}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Resign'}
          </button>
        </div>

        {/* Resign Confirmation Dialog */}
        <Dialog
          open={isResignDialogOpen}
          onClose={() => setIsResignDialogOpen(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="mx-auto max-w-sm rounded bg-white p-6">
              <Dialog.Title className="text-lg font-medium text-gray-900">
                Confirm Resignation
              </Dialog.Title>
              <Dialog.Description className="mt-2 text-sm text-gray-500">
                Are you sure you want to resign? This action cannot be undone.
              </Dialog.Description>

              <div className="mt-4 flex justify-end space-x-3">
                <button
                  onClick={() => setIsResignDialogOpen(false)}
                  className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleResultSubmission('resign')}
                  disabled={isSubmitting}
                  className="rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Confirm Resign'}
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      </div>
    </div>
  );
};

export default function Page() {
  return (
    <WalletProviders>
      <BoardPage />
    </WalletProviders>
  );
}
