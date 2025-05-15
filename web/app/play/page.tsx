'use client';

import { useState, useEffect } from 'react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useRouter } from 'next/navigation';
import { useStakeSelector } from '@/hooks/useStakeSelector';
import { usePlayerStats } from '@/hooks/usePlayerStats';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { useMatchmaker } from '@/hooks/useMatchmaker';

// Stake Progression Info component
const StakeProgressionInfo = ({ progressionTable, gameCount }: { 
  progressionTable: any[], 
  gameCount: number 
}) => {
  return (
    <div className="bg-neutral/50 rounded-lg p-4 mt-6">
      <h3 className="text-lg font-bold mb-2">Stake Progression System</h3>
      <p className="text-sm text-gray-300 mb-3">
        Your stake limits increase as you play more games, making smurfing economically unreasonable.
      </p>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="py-2 px-2 text-left">Games</th>
              <th className="py-2 px-2 text-left">Max Stake</th>
              <th className="py-2 px-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {progressionTable.map((tier, index) => (
              <tr 
                key={index} 
                className={`border-b border-gray-800 ${tier.current ? 'bg-primary/20' : ''}`}
              >
                <td className="py-2 px-2">{tier.label}</td>
                <td className="py-2 px-2">{tier.maxStake} SOL</td>
                <td className="py-2 px-2">
                  {gameCount >= tier.games ? (
                    <span className="text-green-400">✓ Unlocked</span>
                  ) : (
                    <span className="text-gray-500">Locked ({tier.games - gameCount} games left)</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-3 text-xs text-gray-400">
        <p>Note: Suspicious betting patterns may result in temporary stake limit reductions.</p>
      </div>
    </div>
  );
};

export default function PlayPage() {
  const wallet = useAnchorWallet();
  const router = useRouter();
  const {
    stakeLamports,
    setStakeLamports,
    presets,
    limitMessage,
    progressionTable,
    gameCount
  } = useStakeSelector();
  const { playerStats, loading: playerStatsLoading, error: playerStatsError, initializePlayerStats } = usePlayerStats();
  
  // State for selected time control
  const [selectedTimeControl, setSelectedTimeControl] = useState<string>("BLITZ_3_2"); // Default to Blitz
  
  // useMatchmaker hook integration
  const {
    state: matchmakerState,
    error: matchmakerError,
    matchPda,
    connect: startMatchmakingSearch // Renamed for clarity
  } = useMatchmaker(stakeLamports, selectedTimeControl); 
  // Pass selectedTimeControl and stakeLamports

  const [showProgressionInfo, setShowProgressionInfo] = useState(false);

  // Initialize player stats if needed
  useEffect(() => {
    if (playerStats && !playerStats.initialized) {
      initializePlayerStats();
    }
  }, [playerStats, initializePlayerStats]);

  // Handle matchmaker state updates
  useEffect(() => {
    if (matchmakerState === 'matched' && matchPda) {
      toast.success('Opponent found! Joining match...');
      router.push(`/board?matchId=${matchPda.toString()}&timeControl=${selectedTimeControl}`);
    } else if (matchmakerState === 'error' && matchmakerError) {
      toast.error(`Matchmaking Error: ${matchmakerError}`);
    }
  }, [matchmakerState, matchPda, matchmakerError, router, selectedTimeControl]);

  const handleStakeChange = (lamports: number) => {
    setStakeLamports(lamports);
  };

  const handlePlayClick = () => {
    if (!wallet) {
      toast.error('Please connect your wallet to play');
      return;
    }
    if (!playerStats) {
      toast.error('Player stats still loading...');
      return;
    }
    if (matchmakerState === 'searching' || matchmakerState === 'connecting') {
      toast('Already searching for a match...');
      return;
    }

    toast.success(`Searching for ${selectedTimeControl === "BLITZ_3_2" ? "3+2 Blitz" : "1+1 Bullet"} opponent...`);
    startMatchmakingSearch(); // Call connect from useMatchmaker
  };

  const isLoading = playerStatsLoading;
  const displayError = playerStatsError;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 min-h-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-lg">Loading player stats...</p>
      </div>
    );
  }

  if (displayError) {
    return (
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-red-900/30 p-4 rounded-lg mb-6">
          <p className="text-red-400">{displayError}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }
  
  const isSearching = matchmakerState === 'searching' || matchmakerState === 'connecting';

  return (
    <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 min-h-screen flex flex-col justify-center">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Play Chess</h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Stake SOL, play blitz chess, and win big. All games use 3+2 time controls.
        </p>
      </div>
      
      {!wallet ? (
        <div className="text-center py-10 bg-neutral/30 rounded-lg max-w-lg mx-auto">
          <div className="text-4xl mb-4">♚</div>
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-gray-300 mb-6">
            Connect your Solana wallet to start playing and earn SOL.
          </p>
          <div className="flex justify-center">
            <WalletMultiButton />
          </div>
        </div>
      ) : (
        <div className="bg-neutral/30 rounded-lg p-8 max-w-lg mx-auto">
          {playerStats && (
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-300">Rating:</span>
                <span className="text-xl font-bold">{playerStats.rating}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-300">Record:</span>
                <span className="text-xl font-bold">{playerStats.wins}-{(playerStats.games || 0) - (playerStats.wins || 0)}</span>
              </div>
              <Link href="/profile" className="text-primary hover:underline text-sm">
                View Profile
              </Link>
            </div>
          )}
          
          <div className="bg-blue-900/20 p-4 rounded-lg mb-6 border-l-4 border-blue-500">
            <div className="flex justify-between items-center">
              <p className="text-blue-400 text-sm">
                <span className="font-bold">Stake Limit:</span> {limitMessage}
              </p>
              <button 
                onClick={() => setShowProgressionInfo(!showProgressionInfo)}
                className="text-xs text-blue-400 underline"
              >
                {showProgressionInfo ? 'Hide Details' : 'Show Details'}
              </button>
            </div>
          </div>
          
          {showProgressionInfo && (
            <StakeProgressionInfo progressionTable={progressionTable} gameCount={gameCount} />
          )}
          
          <h2 className="text-xl font-bold mb-4">Select Game Mode</h2>
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setSelectedTimeControl("BLITZ_3_2")}
              className={`flex-1 py-3 rounded-lg text-center font-medium ${
                selectedTimeControl === "BLITZ_3_2"
                  ? 'bg-primary text-white'
                  : 'bg-neutral hover:bg-neutral/70 text-gray-300'
              }`}
            >
              Blitz 3+2
            </button>
            <button
              onClick={() => setSelectedTimeControl("BULLET_1_1")}
              className={`flex-1 py-3 rounded-lg text-center font-medium ${
                selectedTimeControl === "BULLET_1_1"
                  ? 'bg-primary text-white'
                  : 'bg-neutral hover:bg-neutral/70 text-gray-300'
              }`}
            >
              Bullet 1+1
            </button>
          </div>
          
          <h2 className="text-xl font-bold mb-4">Select Stake Amount</h2>
          
          <div className="grid grid-cols-3 gap-3 mb-6">
            {presets.map((preset) => (
              <button
                key={preset}
                onClick={() => handleStakeChange(preset)}
                className={`py-3 rounded-lg text-center ${
                  stakeLamports === preset 
                    ? 'bg-primary text-white'
                    : 'bg-neutral hover:bg-neutral/70 text-gray-300'
                }`}
              >
                {(preset / LAMPORTS_PER_SOL).toFixed(2)} SOL
              </button>
            ))}
          </div>
          
          <button
            onClick={handlePlayClick}
            disabled={isSearching || isLoading}
            className={`w-full py-3 rounded-lg font-bold text-lg ${
              isSearching || isLoading
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-teal-500 hover:opacity-90'
            }`}
          >
            {isSearching ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Searching for {selectedTimeControl === "BLITZ_3_2" ? "Blitz" : "Bullet"}...
              </div>
            ) : (
              'Play Now'
            )}
          </button>
          {matchmakerState === 'error' && matchmakerError && (
            <p className="text-red-400 text-sm mt-2 text-center">Error: {matchmakerError}</p>
          )}
          
          <div className="mt-4 text-center text-sm text-gray-400">
            <p>
              You'll stake {(stakeLamports / LAMPORTS_PER_SOL).toFixed(2)} SOL and be matched 
              with a player staking the same amount.
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 