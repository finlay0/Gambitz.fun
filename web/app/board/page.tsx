'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useMatchmaker } from '@/hooks/useMatchmaker';
import { useStakeSelector } from '@/hooks/useStakeSelector';
import { Chessboard } from 'react-chessboard';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { createResultVariant } from '@/types/wager';
import { Chess } from 'chess.js';
import { useChessTimer } from '@/hooks/useChessTimer';
import { toast } from 'react-hot-toast';
import { Dialog } from '@headlessui/react';
import { OpeningDisplay } from '../../src/components/OpeningDisplay';
import { useGameState } from '@/hooks/useGameState';
import { useOpeningRecognition } from '@/hooks/useOpeningRecognition';
import { useFinalOpenings } from '@/hooks/useFinalOpenings';
import { PublicKey } from '@solana/web3.js';
import confetti from 'canvas-confetti';

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
  const { state, matchPda, submitResult, settleMatch } = useMatchmaker(stakeLamports);
  const wallet = useAnchorWallet();
  const [game, setGame] = useState<Chess | null>(null);
  const [position, setPosition] = useState<string>('');
  const [moves, setMoves] = useState<string[]>([]);
  const [currentMove, setCurrentMove] = useState(-1);
  const { timers, startTimers, stopTimers, switchActiveTimer } = useChessTimer(
    matchPda?.toString() || '',
    async (white: number, black: number) => {
      // TODO: Implement server time sync
      // This will be implemented when we add server-side time tracking
      console.log('Time update:', { white, black });
    }
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResignDialogOpen, setIsResignDialogOpen] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isRematchDialogOpen, setIsRematchDialogOpen] = useState(false);
  const [rematchCountdown, setRematchCountdown] = useState(7); // 7 second countdown
  const rematchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [playerColor, setPlayerColor] = useState<'white' | 'black' | null>(null);
  const [isOpponentDisconnected] = useState(false);
  const gameRef = useRef<Chess | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { updateOpening, gameState } = useGameState();
  const openingState = useOpeningRecognition(game?.history() || []);
  const { getEcoCodes } = useFinalOpenings();

  // Function to trigger confetti celebration for win
  const triggerWinConfetti = useCallback(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#14F195', '#9945FF', '#FFFFFF']
    });
  }, []);

  const handleResultSubmission = useCallback(async (variant: 'mate' | 'resign' | 'timeout' | 'disconnect' | 'draw') => {
    if (!matchPda || !wallet || !game) {
      toast.error('Wallet not connected or match not found');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitResult(createResultVariant(variant));
      stopTimers();
      setIsGameOver(true);
      toast.success(`Game ended: ${variant}`);

      // Get the winner's public key
      const winner = variant === 'resign' || variant === 'timeout' || variant === 'disconnect'
        ? (playerColor === 'white' ? wallet.publicKey : new PublicKey(matchPda)) // opponent wins
        : wallet.publicKey; // checkmate - current player wins (whoever called handleResultSubmission)

      // Show confetti if the current player won (only for checkmate)
      if (variant === 'mate' && winner.equals(wallet.publicKey)) {
        triggerWinConfetti();
      }

      // After submitting result, trigger settlement to distribute payouts including NFT royalties
      try {
        // Only proceed with settlement logic if the game record has moves
        if (game.history().length > 0) {
          // Get the opening ECO codes for both players to help with debugging
          const ecoCodes = await getEcoCodes(game.history());
          console.log('Found openings for settlement:', ecoCodes);
          
          // Settle the match with the full move history and winner
          await settleMatch(game.history(), winner);
          toast.success('Match settled successfully!');

          // After successful settlement, show rematch dialog
          setIsRematchDialogOpen(true);
          // Start countdown timer
          setRematchCountdown(7);
          if (rematchTimerRef.current) {
            clearInterval(rematchTimerRef.current);
          }
          rematchTimerRef.current = setInterval(() => {
            setRematchCountdown(prev => {
              if (prev <= 1) {
                if (rematchTimerRef.current) {
                  clearInterval(rematchTimerRef.current);
                  setIsRematchDialogOpen(false);
                }
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }
      } catch (settleError) {
        console.error('Settlement failed:', settleError);
        toast.error('Failed to settle match. Please try again later.');
      }
    } catch (error) {
      console.error('Failed to submit result:', error);
      const errorMessage = getErrorMessage(error as Error, variant);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
      setIsResignDialogOpen(false);
    }
  }, [matchPda, wallet, submitResult, stopTimers, game, playerColor, settleMatch, getEcoCodes, triggerWinConfetti]);

  // Initialize game
  useEffect(() => {
    try {
      const newGame = new Chess();
      setGame(newGame);
      gameRef.current = newGame;
      setPosition(newGame.fen());
    } catch (error) {
      console.error('Failed to initialize game:', error);
      toast.error('Failed to initialize game');
    }
  }, []);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // Handle opponent disconnection
  useEffect(() => {
    if (isOpponentDisconnected && !isGameOver) {
      handleResultSubmission('disconnect');
    }
  }, [isOpponentDisconnected, isGameOver, handleResultSubmission]);

  // Start timers when game starts
  useEffect(() => {
    if (state === 'matched' && !isGameOver && game) {
      startTimers();
      // Set player color based on match state
      setPlayerColor(state === 'matched' ? 'white' : 'black');
    }
  }, [state, startTimers, isGameOver, game]);

  // Detect opening based on moves
  useEffect(() => {
    if (state === 'matched' && game && openingState.eco) {
      const color = playerColor === 'white' ? 'white' : 'black';
      updateOpening(color, {
        eco: openingState.eco,
        name: openingState.name || 'Unknown Opening',
        nftOwner: null // This will be populated by the NFT system
      });
    }
  }, [state, game, openingState, playerColor, updateOpening]);

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
    } else if (error.message?.includes('network error')) {
      return 'Network error. Please check your connection';
    } else {
      return `Failed to submit ${variant} result. Please try again.`;
    }
  };

  const handleResign = useCallback(() => setIsResignDialogOpen(true), []);
  const handleCheckmate = useCallback(() => handleResultSubmission('mate'), [handleResultSubmission]);
  const handleTimeout = useCallback(() => handleResultSubmission('timeout'), [handleResultSubmission]);
  const handleDisconnect = useCallback(() => handleResultSubmission('disconnect'), [handleResultSubmission]);

  // Add timeout check in the timer effect
  useEffect(() => {
    if (state === 'matched' && !isGameOver && game) {
      const checkTimeout = () => {
        if (timers.active === 'white' && timers.white <= 0) {
          handleTimeout();
        } else if (timers.active === 'black' && timers.black <= 0) {
          handleTimeout();
        }
      };

      timerIntervalRef.current = setInterval(checkTimeout, 1000);
      return () => {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
        }
      };
    }
  }, [state, timers.white, timers.black, timers.active, handleTimeout, isGameOver, game]);

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
    if (isGameOver || !game || !playerColor) return false;

    try {
      // Validate move is legal
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q' // Always promote to queen for simplicity
      });

      if (move) {
        setPosition(game.fen());
        setMoves(prev => {
          const newMoves = [...prev, move.san];
          setCurrentMove(newMoves.length - 1);
          return newMoves;
        });
        switchActiveTimer();

        // Check for game end conditions
        if (game.isCheckmate()) {
          handleCheckmate();
        } else if (game.isDraw()) {
          let drawMessage = 'Game ended in a draw';
          if (game.isStalemate()) {
            drawMessage = 'Game ended in stalemate';
          } else if (game.isThreefoldRepetition()) {
            drawMessage = 'Game ended in threefold repetition';
          } else if (game.isInsufficientMaterial()) {
            drawMessage = 'Game ended due to insufficient material';
          }
          toast(drawMessage, { 
            icon: 'ℹ️',
            style: {
              background: '#3B82F6',
              color: '#fff',
            }
          });
          handleResultSubmission('draw');
          setIsGameOver(true);
          stopTimers();
        }

        return true;
      }
    } catch (error) {
      console.error('Invalid move:', error);
      toast.error('Invalid move');
    }
    return false;
  };

  const handleMoveClick = (moveIndex: number) => {
    if (isGameOver || !game) return;

    try {
      // Create a new game instance and replay moves up to the clicked move
      const tempGame = new Chess();
      for (let i = 0; i <= moveIndex; i++) {
        tempGame.move(moves[i]);
      }
      setPosition(tempGame.fen());
      setCurrentMove(moveIndex);
    } catch (error) {
      console.error('Failed to replay moves:', error);
      toast.error('Failed to replay moves');
    }
  };

  const returnToCurrentPosition = () => {
    if (isGameOver || !game) return;

    try {
      // Replay all moves to get to the current position
      const tempGame = new Chess();
      for (const move of moves) {
        tempGame.move(move);
      }
      setPosition(tempGame.fen());
      setCurrentMove(moves.length - 1);
    } catch (error) {
      console.error('Failed to return to current position:', error);
      toast.error('Failed to return to current position');
    }
  };

  // Cleanup game state on unmount
  useEffect(() => {
    return () => {
      if (state === 'matched' && !isGameOver) {
        handleDisconnect();
      }
    };
  }, [state, isGameOver, handleDisconnect]);

  // Function to handle rematch request
  const handleRematch = useCallback(() => {
    if (!wallet) {
      toast.error('Wallet not connected');
      return;
    }

    // Close the rematch dialog
    setIsRematchDialogOpen(false);
    if (rematchTimerRef.current) {
      clearInterval(rematchTimerRef.current);
    }

    // Reset game state
    setIsGameOver(false);
    setMoves([]);
    setCurrentMove(-1);

    // Create a new game with the same stake
    try {
      // Clear board and reset
      const newGame = new Chess();
      setGame(newGame);
      gameRef.current = newGame;
      setPosition(newGame.fen());
      
      // Restart matchmaking with same stake
      toast.success('Starting new game with same stake...');
      
      // Refresh the page to restart matchmaking
      // In a real implementation, we'd create a new match with the same players and stake
      window.location.href = '/play';
    } catch (error) {
      console.error('Failed to start rematch:', error);
      toast.error('Failed to start rematch');
    }
  }, [wallet]);

  // Cleanup rematch timer on unmount
  useEffect(() => {
    return () => {
      if (rematchTimerRef.current) {
        clearInterval(rematchTimerRef.current);
      }
    };
  }, []);

  if (!game) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Initializing game...</p>
        </div>
      </div>
    );
  }

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
              arePiecesDraggable={!isGameOver && playerColor === timers.active}
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
      {/* Rematch Dialog */}
      <Dialog
        open={isRematchDialogOpen}
        onClose={() => {
          setIsRematchDialogOpen(false);
          if (rematchTimerRef.current) {
            clearInterval(rematchTimerRef.current);
          }
        }}
        className="fixed inset-0 z-10 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="bg-neutral rounded-lg p-6 max-w-sm mx-auto z-10 text-white">
            <Dialog.Title className="text-lg font-medium mb-4">
              Rematch?
            </Dialog.Title>
            <p className="text-gray-300 mb-4">
              Would you like to play again with the same stake?
            </p>
            <div className="mt-2 mb-4 text-center">
              <span className="text-primary text-lg font-bold">{rematchCountdown}s</span>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsRematchDialogOpen(false);
                  if (rematchTimerRef.current) {
                    clearInterval(rematchTimerRef.current);
                  }
                }}
                className="px-4 py-2 text-gray-300 hover:text-white"
              >
                Decline
              </button>
              <button
                onClick={handleRematch}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
              >
                Rematch
              </button>
            </div>
          </div>
        </div>
      </Dialog>
      {/* Opening Display */}
      <div className="openings-container">
        <OpeningDisplay
          opening={gameState.openings.white}
          color="white"
          isCurrentPlayer={playerColor === 'white'}
        />
        <OpeningDisplay
          opening={gameState.openings.black}
          color="black"
          isCurrentPlayer={playerColor === 'black'}
        />
      </div>
    </div>
  );
};

export default BoardPage;
