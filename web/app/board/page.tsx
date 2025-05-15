'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useMatchmaker } from '@/hooks/useMatchmaker';
import { useStakeSelector } from '@/hooks/useStakeSelector';
import { Chessboard } from 'react-chessboard';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { createResultVariant, PROGRAM_IDL, Match as OnChainMatchState } from '@/types/wager';
import { Chess } from 'chess.js';
import { useChessTimer } from '@/hooks/useChessTimer';
import { toast } from 'react-hot-toast';
import { Dialog } from '@headlessui/react';
import { OpeningDisplay } from '../../src/components/OpeningDisplay';
import { useGameState, Opening as GameStateOpening } from '@/hooks/useGameState';
import { useOpeningRecognition } from '@/hooks/useOpeningRecognition';
import { useFinalOpenings } from '@/hooks/useFinalOpenings';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import confetti from 'canvas-confetti';
import { Program, AnchorProvider, web3 } from '@coral-xyz/anchor';
import type { AnchorWallet } from '@solana/wallet-adapter-react';
import { useSearchParams } from 'next/navigation';

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
  const searchParams = useSearchParams();
  const matchIdFromUrlString = searchParams.get('matchId');
  const timeControlFromUrl = searchParams.get('timeControl');

  const { stakeLamports: initialStakeForHook } = useStakeSelector(); 
  
  const {
    matchmakerState,
    matchmakerError,
    matchDetails,
    lastOpponentMoveDetails,
    setLastOpponentMoveDetails,
    createMatchOnChain,
    confirmMatchOnChain,
    submitResult,
    settleMatch,
    sendPlayerMove,
    sendGameOverForAnalysis,
  } = useMatchmaker(initialStakeForHook, timeControlFromUrl || "BLITZ_3_2");

  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const [game, setGame] = useState<Chess | null>(null);
  const [position, setPosition] = useState<string>('');
  const [moves, setMoves] = useState<string[]>([]);
  const [currentMove, setCurrentMove] = useState(-1);
  const { timers, startTimers, stopTimers, switchActiveTimer } = useChessTimer(
    matchDetails.pda?.toString() || '',
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
  const [rematchCountdown, setRematchCountdown] = useState(7);
  const rematchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [playerColor, setPlayerColor] = useState<'white' | 'black' | null>(null);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [hasAttemptedOnChainAction, setHasAttemptedOnChainAction] = useState(false);
  const gameRef = useRef<Chess | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const {
    updateOpening,
    gameState,
    setBoardInstance,
    startGame: startGameInState,
    makeMove: makeMoveInState,
    endGame: endGameInState,
    resetGame: resetGameState,
  } = useGameState();
  const openingStateFromRecognition = useOpeningRecognition(game?.history() || []);
  const { getFinalOpening, getEcoCode: getEcoCodeForSettle } = useFinalOpenings();

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
    if (!matchDetails.pda || !wallet || !game) {
      toast.error('Wallet not connected or match not found');
      return;
    }

    // Determine winner for analysis message BEFORE submitting anything
    let winnerKeyForAnalysis: string | null = null;
    if (variant === 'draw' || variant === 'disconnect') { // Assuming disconnect might be a draw or needs server to decide winner based on who disconnected
      winnerKeyForAnalysis = null; 
    } else if (variant === 'mate') {
      // The 'mate' variant in handleResultSubmission is called when the *local* player detects they have been mated,
      // or they have mated the opponent. The current `wallet.publicKey` is the one submitting.
      // If game.turn() is 'w' and player is black, white (opponent) won. If game.turn() is 'b' and player is white, black (opponent) won.
      // However, the existing logic for settleMatch derives the winner correctly based on who *didn't* make the last move if it's a mate.
      // For simplicity here, if it's a 'mate', the winner is the one whose turn it *isn't* according to chess.js
      const turn = game.turn(); // 'w' or 'b'
      if (playerColor === 'white') {
        winnerKeyForAnalysis = turn === 'w' ? matchDetails.playerTwoKey?.toBase58() || null : wallet.publicKey.toBase58();
      } else if (playerColor === 'black') {
        winnerKeyForAnalysis = turn === 'b' ? matchDetails.playerOneKey?.toBase58() || null : wallet.publicKey.toBase58();
      }
      // Fallback if playerColor or opponent key is somehow null, though unlikely at this stage
      if (!winnerKeyForAnalysis && wallet.publicKey) winnerKeyForAnalysis = wallet.publicKey.toBase58(); 

    } else if (variant === 'resign' || variant === 'timeout') {
      // If current player resigns or times out, opponent wins.
      if (wallet.publicKey.equals(matchDetails.playerOneKey)) {
        winnerKeyForAnalysis = matchDetails.playerTwoKey?.toBase58() || null;
      } else if (wallet.publicKey.equals(matchDetails.playerTwoKey)) {
        winnerKeyForAnalysis = matchDetails.playerOneKey?.toBase58() || null;
      }
    }

    // Send game over message for analysis BEFORE on-chain submissions
    if (matchDetails.pda) {
      sendGameOverForAnalysis(matchDetails.pda.toString(), winnerKeyForAnalysis, variant);
    }

    setIsSubmitting(true);
    try {
      await submitResult(createResultVariant(variant));
      stopTimers();
      setIsGameOver(true);
      toast.success(`Game ended: ${variant}`);

      let winnerKeyForSettle: PublicKey;

      if (variant === 'draw') {
        winnerKeyForSettle = SystemProgram.programId;
      } else if (variant === 'mate') {
        if (!wallet?.publicKey) throw new Error("Wallet not connected");
        winnerKeyForSettle = wallet.publicKey;
      } else {
        if (!wallet?.publicKey || !matchDetails.pda) throw new Error("Wallet or Match PDA not available");
        const provider = new AnchorProvider(connection, wallet as AnchorWallet, AnchorProvider.defaultOptions());
        const program = new Program(PROGRAM_IDL, new PublicKey('GZJ54HYGi1Qx9GKeC9Ncbu2upkCwxGdrXxaQE9b2JVCM'), provider);
        
        try {
          const matchData: OnChainMatchState = await program.account.match.fetch(matchDetails.pda);
          if (wallet.publicKey.equals(matchData.playerOne)) {
            winnerKeyForSettle = matchData.playerTwo;
          } else if (wallet.publicKey.equals(matchData.playerTwo)) {
            winnerKeyForSettle = matchData.playerOne;
          } else {
            console.error("Current wallet is not part of the match?");
            toast.error("Error determining winner for settlement.");
            setIsSubmitting(false);
            return;
          }
        } catch (fetchError) {
          console.error("Failed to fetch match data to determine winner:", fetchError);
          toast.error("Failed to get match details for settlement.");
          setIsSubmitting(false);
          return;
        }
      }

      if (variant === 'mate' && wallet?.publicKey && winnerKeyForSettle.equals(wallet.publicKey)) {
        triggerWinConfetti();
      }

      try {
        if (game.history().length > 0) {
          const ecoCode = getEcoCodeForSettle(game.history());
          console.log('Found opening for settlement:', ecoCode);
          
          await settleMatch(game.history(), winnerKeyForSettle);
          toast.success('Match settled successfully!');

          setIsRematchDialogOpen(true);
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
  }, [matchDetails.pda, wallet, connection, submitResult, stopTimers, game, playerColor, settleMatch, getEcoCodeForSettle, triggerWinConfetti, sendGameOverForAnalysis]);

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

  // Logic to initiate on-chain match creation or confirmation
  useEffect(() => {
    if (matchmakerState === 'matched' && matchDetails.pda && matchDetails.playerOneKey && matchDetails.playerTwoKey && wallet?.publicKey && !hasAttemptedOnChainAction) {
      // Ensure this logic only runs once per matchDetails update
      setHasAttemptedOnChainAction(true);

      const isPlayerOne = wallet.publicKey.equals(matchDetails.playerOneKey);
      const isPlayerTwo = wallet.publicKey.equals(matchDetails.playerTwoKey);

      // It's crucial to also check if the match account already exists on-chain 
      // before attempting to create it, and its state before confirming.
      // This requires an async fetch of the account data.
      
      const checkAndPerformOnChainAction = async () => {
        try {
          const provider = new AnchorProvider(connection, wallet as AnchorWallet, AnchorProvider.defaultOptions());
          const program = new Program(PROGRAM_IDL, new PublicKey('GZJ54HYGi1Qx9GKeC9Ncbu2upkCwxGdrXxaQE9b2JVCM'), provider);
          let onChainMatchData: OnChainMatchState | null = null;
          try {
            onChainMatchData = await program.account.match.fetch(matchDetails.pda!);
          } catch (e) {
            // Likely means account not found, which is fine if P1 is about to create it
            console.log("Match account not found on-chain, P1 might need to create it.");
          }

          if (isPlayerOne) {
            if (!onChainMatchData) {
              toast.info("You are Player 1. Creating the match on-chain...");
              await createMatchOnChain(); // Uses details from matchDetails state
            } else {
              toast.info("Match already exists on-chain (P1).");
              // Potentially check if P2 needs to confirm if that info is available
            }
          } else if (isPlayerTwo) {
            if (onChainMatchData && onChainMatchData.startSlot === 0) { // Assuming startSlot === 0 means unconfirmed
              toast.info("You are Player 2. Confirming the match on-chain...");
              await confirmMatchOnChain();
            } else if (onChainMatchData) {
              toast.info("Match already confirmed or in an unexpected state (P2).");
            } else {
              toast.warn("You are Player 2, but match account not yet created by Player 1.");
            }
          }
        } catch (error) {
          console.error("Error during on-chain action check:", error);
          toast.error("Error interacting with on-chain match.");
        }
      };

      checkAndPerformOnChainAction();
    }
  }, [matchmakerState, matchDetails, wallet, connection, createMatchOnChain, confirmMatchOnChain, hasAttemptedOnChainAction]);

  // Determine player color based on matchDetails and wallet pubkey
  useEffect(() => {
    if (matchDetails.playerOneKey && matchDetails.playerTwoKey && wallet?.publicKey) {
      setPlayerColor(wallet.publicKey.equals(matchDetails.playerOneKey) ? 'white' : 'black');
      setIsMyTurn(wallet.publicKey.equals(matchDetails.playerOneKey));
    } else {
      setPlayerColor(null);
      setIsMyTurn(false);
    }
  }, [matchDetails.playerOneKey, matchDetails.playerTwoKey, wallet?.publicKey]);
  
  // Initialize game and timers when match is fully confirmed and ready
  useEffect(() => {
    if (matchmakerState === 'matched' && matchDetails.pda && playerColor && game) { // Ensure playerColor is set
      // Potentially fetch on-chain match state to confirm it's ready (e.g., startSlot != 0)
      // For now, assume 'matched' from server means it is ready to start timers after P1/P2 actions.
      console.log("Match is considered ready, starting timers if not already game over.");
      if (!isGameOver) {
          startTimers();
      }
    }
  }, [matchmakerState, matchDetails.pda, playerColor, game, startTimers, isGameOver]);

  // Cleanup game state on unmount
  useEffect(() => {
    return () => {
      if (matchmakerState === 'matched' && !isGameOver) {
        handleResultSubmission('disconnect');
      }
    };
  }, [matchmakerState, isGameOver, handleResultSubmission]);

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
    if (matchmakerState === 'matched' && !isGameOver && game) {
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
  }, [matchmakerState, timers.white, timers.black, timers.active, handleTimeout, isGameOver, game]);

  // Add disconnect handling
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (matchmakerState === 'matched' && !isSubmitting && !isGameOver) {
        handleDisconnect();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [matchmakerState, isSubmitting, handleDisconnect, isGameOver]);

  // Effect to handle opponent's move
  useEffect(() => {
    if (lastOpponentMoveDetails && gameRef.current && matchDetails.playerOneKey) {
      const { moveSan, isPlayerOneTurnAfterMove } = lastOpponentMoveDetails;
      
      const localGame = gameRef.current;
      const moveResult = localGame.move(moveSan);

      if (moveResult) {
        setPosition(localGame.fen());
        setMoves(localGame.history());
        toast(`Opponent played: ${moveSan}`);
        
        // Update whose turn it is based on server's message
        if (wallet?.publicKey) {
            const amIPlayerOne = wallet.publicKey.equals(matchDetails.playerOneKey);
            setIsMyTurn(amIPlayerOne ? isPlayerOneTurnAfterMove : !isPlayerOneTurnAfterMove);
        }

        // Switch timers
        if (matchDetails.pda) { // Ensure match PDA is available to switch timers
            switchActiveTimer(); 
        }

        // Check for game over condition from local chess.js instance after opponent's move
        if (localGame.isGameOver()) {
            setIsGameOver(true);
            stopTimers();
            // Determine result type based on localGame state
            let resultType: 'mate' | 'draw' = 'draw'; // Default to draw
            if (localGame.isCheckmate()) resultType = 'mate';
            // TODO: Handle other draw types like stalemate, threefold repetition, etc.
            // For now, only checkmate from opponent triggers automatic result submission.
            if (resultType === 'mate') {
                // If opponent checkmated us, call handleResultSubmission
                // The winner will be the opponent, which handleResultSubmission should deduce.
                toast.error('Checkmate!');
                handleResultSubmission('mate');
            }
        }

      } else {
        console.error("Failed to apply opponent's move locally:", moveSan);
        toast.error("Error applying opponent's move.");
        // Request game state resync from server? (future enhancement)
      }
      // Reset the last opponent move so this effect doesn't run again for the same move
      setLastOpponentMoveDetails(null);
    }
  }, [lastOpponentMoveDetails, setLastOpponentMoveDetails, wallet, matchDetails, switchActiveTimer, stopTimers, handleResultSubmission]);

  const onPieceDrop = (sourceSquare: string, targetSquare: string) => {
    if (isGameOver || !game || !isMyTurn || currentMove !== moves.length - 1) return false;

    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q', // Always promote to queen for simplicity
      });

      if (move) {
        setPosition(game.fen());
        const newMoveHistory = [...moves, move.san];
        setMoves(newMoveHistory);
        makeMoveInState(move.san, game.fen()); // Update useGameState
        setCurrentMove(newMoveHistory.length - 1);
        
        // Send move to opponent via WebSocket
        if (matchDetails.pda) {
          sendPlayerMove(matchDetails.pda.toString(), move.san, game.fen());
        }
        
        setLastOpponentMoveDetails(null); // Clear last opponent move details after our move
        switchActiveTimer();
        setIsMyTurn(false);

        if (game.isGameOver()) {
          let resultVariant: 'mate' | 'draw' = 'mate';
          if (game.isCheckmate()) {
            resultVariant = 'mate';
          } else if (game.isDraw() || game.isStalemate() || game.isThreefoldRepetition() || game.isInsufficientMaterial()) {
            resultVariant = 'draw';
          }
          handleResultSubmission(resultVariant);
        }
        return true;
      } else {
        toast.error('Invalid move');
        return false;
      }
    } catch (error) {
      console.error('Error making move:', error);
      // Attempt to revert to the last known good state if chess.js throws
      if (moves.length > 0) {
        const lastFen = game.history({ verbose: true }).slice(-2, -1)[0]?.after || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
        game.load(lastFen); // Ensure game object is consistent
        setPosition(lastFen);
      } else {
        game.reset();
        setPosition(game.fen());
      }
      toast.error('Illegal move attempt.');
      return false;
    }
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

  const activeMatchPdaForGame = matchDetails.pda || (matchIdFromUrlString ? new PublicKey(matchIdFromUrlString) : null);

  // Effect to initialize and update the Chess instance in useGameState
  useEffect(() => {
    const newGameInstance = new Chess();
    setGame(newGameInstance);
    setBoardInstance(newGameInstance); // Initialize in useGameState
    setPosition(newGameInstance.fen());
    // When game instance changes (e.g. on new match), reset relevant local state
    setMoves([]);
    setCurrentMove(-1);
    setIsGameOver(false);
    // Make sure to call resetGameState or specific setters if more state needs reset
    // resetGameState(); // Potentially too broad, consider targeted resets
  }, [matchDetails.pda, setBoardInstance]); // React to match PDA changing for new games

  // Effect to update gameOpening in useGameState when opening is recognized
  useEffect(() => {
    if (game && game.history().length > 0) {
      const currentMoveHistory = game.history();
      getFinalOpening(currentMoveHistory).then(finalOpeningResult => {
        if (finalOpeningResult) {
          const gameOpeningForState: GameStateOpening = {
            eco: finalOpeningResult.eco,
            name: finalOpeningResult.name,
            variant: openingStateFromRecognition.variant, // Get variant from useOpeningRecognition
            nftOwner: finalOpeningResult.owner,
          };
          updateOpening(gameOpeningForState);
        } else {
          updateOpening(null); // No opening found or an error occurred
        }
      }).catch(error => {
        console.error("Error getting final opening:", error);
        updateOpening(null);
      });
    }
  }, [game, openingStateFromRecognition, getFinalOpening, updateOpening]); // Dependencies: game history (via openingState) and recognition state

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

  if (matchmakerState === 'searching') {
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
      {gameState.gameOpening && (
        <div className="mt-4 w-full max-w-md mx-auto p-2 bg-neutral-focus rounded-lg shadow">
          <OpeningDisplay
            opening={gameState.gameOpening} // Use the single gameOpening from useGameState
            // color prop is removed as it might not be relevant for a single display
            // isCurrentPlayer prop is removed, can be re-added if OpeningDisplay needs it
          />
        </div>
      )}
      {matchmakerState === 'error' && matchmakerError && (
        <div className="absolute top-4 right-4 bg-red-600 text-white p-3 rounded-md shadow-lg">
          <p className="font-semibold">Matchmaking Error!</p>
          <p className="text-sm">{matchmakerError}</p>
        </div>
      )}
    </div>
  );
};

export default BoardPage;
