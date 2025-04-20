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
            toast.info('Game ended in stalemate');
          } else if (game.isThreefoldRepetition()) {
            toast.info('Game ended in threefold repetition');
          } else if (game.isInsufficientMaterial()) {
            toast.info('Game ended due to insufficient material');
          } else if (game.isDraw()) {
            toast.info('Game ended in a draw');
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow p-4">
              <Chessboard
                position={position}
                onPieceDrop={onPieceDrop}
                boardWidth={600}
                arePiecesDraggable={!isGameOver}
              />
            </div>
          </div>

          <div className="space-y-4">
            <MoveHistory
              moves={moves}
              currentMove={currentMove}
              onMoveClick={handleMoveClick}
            />
            <div className="bg-white rounded-lg shadow p-4">
              <div className="space-y-2">
                <button
                  onClick={returnToCurrentPosition}
                  disabled={isGameOver}
                  className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:bg-gray-300"
                >
                  Return to Current Position
                </button>
                <button
                  onClick={handleResign}
                  disabled={isGameOver}
                  className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 disabled:bg-gray-300"
                >
                  Resign
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog
        open={isResignDialogOpen}
        onClose={() => setIsResignDialogOpen(false)}
        className="fixed inset-0 z-10 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          <div className="bg-white rounded-lg p-6 max-w-sm mx-auto z-10">
            <Dialog.Title className="text-lg font-medium mb-4">
              Confirm Resignation
            </Dialog.Title>
            <p className="text-gray-600 mb-4">
              Are you sure you want to resign? This will end the game and your opponent will win.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsResignDialogOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleResultSubmission('resign')}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-300"
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
