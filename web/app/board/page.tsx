'use client';

import { useEffect, useState, useCallback } from 'react';
import { WalletProviders } from '@/components/WalletProviders';
import { useMatchmaker } from '@/hooks/useMatchmaker';
import { useStakeSelector } from '@/hooks/useStakeSelector';
import { Chessboard } from 'react-chessboard';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { createResultVariant } from '@/types/wager';
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
    <div className="bg-border rounded-lg p-4 h-[400px] overflow-y-auto text-white w-full max-w-xs mx-auto">
      <div className="font-bold mb-2 text-accent">Move History</div>
      <div className="space-y-1">
        {pairs.map((pair, index) => (
          <div key={index} className="flex items-center space-x-2">
            <span className="text-gray-400 w-8">{index + 1}.</span>
            <button
              onClick={() => onMoveClick(pair.whiteIndex)}
              className={`w-20 text-left hover:bg-neutral p-1 rounded transition-colors duration-100 ${
                currentMove === pair.whiteIndex ? 'bg-primary/30' : ''
              }`}
            >
              {pair.white}
            </button>
            {pair.black && (
              <button
                onClick={() => onMoveClick(pair.blackIndex)}
                className={`w-20 text-left hover:bg-neutral p-1 rounded transition-colors duration-100 ${
                  currentMove === pair.blackIndex ? 'bg-primary/30' : ''
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
  const { state, matchPda, submitResult } = useMatchmaker(stakeLamports);
  const wallet = useAnchorWallet();
  const [game] = useState(() => new Chess());
  const [position, setPosition] = useState(game.fen());
  const [moves, setMoves] = useState<string[]>([]);
  const [currentMove, setCurrentMove] = useState(-1);
  const { timers, startTimers, stopTimers, switchActiveTimer } = useChessTimer();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResignDialogOpen, setIsResignDialogOpen] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  // Start timers when game starts
  useEffect(() => {
    if (state === 'matched' && !isGameOver) {
      startTimers();
    }
  }, [state, startTimers, isGameOver]);

  const getErrorMessage = (error: Error, variant: string): string => {
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

  const handleResultSubmission = useCallback(async (variant: 'mate' | 'resign' | 'timeout' | 'disconnect') => {
    if (!matchPda || !wallet) {
      toast.error('Wallet not connected or match not found');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitResult(createResultVariant(variant));
      stopTimers();
      setIsGameOver(true);
      toast.success(`Game ended: ${variant}`);
    } catch (error) {
      console.error('Failed to submit result:', error);
      const errorMessage = getErrorMessage(error as Error, variant);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
      setIsResignDialogOpen(false);
    }
  }, [matchPda, wallet, submitResult, stopTimers]);

  const handleResign = useCallback(() => setIsResignDialogOpen(true), []);
  const handleCheckmate = useCallback(() => handleResultSubmission('mate'), [handleResultSubmission]);
  const handleTimeout = useCallback(() => handleResultSubmission('timeout'), [handleResultSubmission]);
  const handleDisconnect = useCallback(() => handleResultSubmission('disconnect'), [handleResultSubmission]);

  // Add timeout check in the timer effect
  useEffect(() => {
    if (state === 'matched' && !isGameOver) {
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
  }, [state, timers.white, timers.black, handleTimeout, isGameOver]);

  // Add disconnect handling
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (state === 'matched' && !isSubmitting && !isGameOver) {
        handleDisconnect();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state, isSubmitting, handleDisconnect, isGameOver]);

  const onPieceDrop = (sourceSquare: string, targetSquare: string) => {
    if (isGameOver) return false;

    try {
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

        // Check for game end conditions
        if (game.isCheckmate()) {
          handleCheckmate();
        } else if (game.isDraw()) {
          // Handle draw conditions
          if (game.isStalemate()) {
            toast('Game ended in stalemate', { 
              icon: 'ℹ️',
              style: {
                background: '#3B82F6',
                color: '#fff',
              }
            });
          } else if (game.isThreefoldRepetition()) {
            toast('Game ended in threefold repetition', { 
              icon: 'ℹ️',
              style: {
                background: '#3B82F6',
                color: '#fff',
              }
            });
          } else if (game.isInsufficientMaterial()) {
            toast('Game ended due to insufficient material', { 
              icon: 'ℹ️',
              style: {
                background: '#3B82F6',
                color: '#fff',
              }
            });
          } else if (game.isDraw()) {
            toast('Game ended in a draw', { 
              icon: 'ℹ️',
              style: {
                background: '#3B82F6',
                color: '#fff',
              }
            });
          }
          setIsGameOver(true);
          stopTimers();
        }

        return true;
      }
    } catch (error) {
      console.error('Invalid move:', error);
    }
    return false;
  };

  const handleMoveClick = (moveIndex: number) => {
    if (isGameOver) return;

    // Create a new game instance and replay moves up to the clicked move
    const tempGame = new Chess();
    for (let i = 0; i <= moveIndex; i++) {
      tempGame.move(moves[i]);
    }
    setPosition(tempGame.fen());
    setCurrentMove(moveIndex);
  };

  const returnToCurrentPosition = () => {
    if (isGameOver) return;

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
      <div className="flex items-center justify-center min-h-screen bg-background text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Searching for opponent...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-white py-8 px-2">
      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8 items-center justify-center">
        {/* Board + Timers */}
        <div className="flex flex-col items-center w-full max-w-[500px] mx-auto">
          {/* Timers */}
          <div className="flex justify-between w-full mb-4 gap-4">
            <div className={`flex-1 flex flex-col items-center bg-border rounded-lg px-4 py-2 ${timers.active === 'white' ? 'ring-2 ring-primary' : ''}`}>
              <div className="text-xs text-gray-300">White</div>
              <div className="text-2xl font-mono">{formatTime(timers.white)}</div>
            </div>
            <div className={`flex-1 flex flex-col items-center bg-border rounded-lg px-4 py-2 ${timers.active === 'black' ? 'ring-2 ring-primary' : ''}`}>
              <div className="text-xs text-gray-300">Black</div>
              <div className="text-2xl font-mono">{formatTime(timers.black)}</div>
            </div>
          </div>
          {/* Chessboard */}
          <div className="w-full max-w-[500px] mx-auto bg-neutral rounded-xl shadow-lg p-2">
            <Chessboard
              position={position}
              onPieceDrop={onPieceDrop}
              boardWidth={400}
              arePiecesDraggable={!isGameOver}
            />
          </div>
          {/* Board controls */}
          <div className="flex w-full gap-2 mt-4">
            <button
              onClick={returnToCurrentPosition}
              disabled={isGameOver}
              className="flex-1 bg-primary text-white py-2 rounded hover:bg-primary/80 disabled:bg-gray-700 transition-colors"
            >
              Return to Current Position
            </button>
            <button
              onClick={handleResign}
              disabled={isGameOver}
              className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600 disabled:bg-gray-700 transition-colors"
            >
              Resign
            </button>
          </div>
        </div>
        {/* Move History */}
        <div className="w-full md:w-[300px] flex flex-col items-center">
          <MoveHistory
            moves={moves}
            currentMove={currentMove}
            onMoveClick={handleMoveClick}
          />
        </div>
      </div>
      {/* Resign Dialog */}
      <Dialog
        open={isResignDialogOpen}
        onClose={() => setIsResignDialogOpen(false)}
        className="fixed inset-0 z-10 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="bg-neutral rounded-lg p-6 max-w-sm mx-auto z-10 text-white">
            <Dialog.Title className="text-lg font-medium mb-4">
              Confirm Resignation
            </Dialog.Title>
            <p className="text-gray-300 mb-4">
              Are you sure you want to resign? This will end the game and your opponent will win.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsResignDialogOpen(false)}
                className="px-4 py-2 text-gray-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleResultSubmission('resign')}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-700"
              >
                {isSubmitting ? 'Submitting...' : 'Resign'}
              </button>
            </div>
          </div>
        </div>
      </Dialog>
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
