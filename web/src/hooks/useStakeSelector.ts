import { useState, useEffect } from 'react';
import { usePlayerStats } from './usePlayerStats';

// 1 SOL = 1e9 lamports
const LAMPORTS_PER_SOL = 1_000_000_000;

// Convert SOL to lamports
const solToLamports = (sol: number): number => sol * LAMPORTS_PER_SOL;

// Convert lamports to SOL
const lamportsToSol = (lamports: number): number => lamports / LAMPORTS_PER_SOL;

// Progressive stake tiers for display
const STAKE_TIERS = [
  { games: 0, maxStake: 0.01, label: 'Provisional (0-10 games)' },
  { games: 11, maxStake: 0.05, label: '11-15 games' },
  { games: 16, maxStake: 0.1, label: '16-25 games' },
  { games: 26, maxStake: 0.25, label: '26-40 games' },
  { games: 41, maxStake: 0.5, label: '41-60 games' },
  { games: 61, maxStake: 1.0, label: '61+ games' }
];

export const useStakeSelector = () => {
  // Default stake is 0.01 SOL in lamports (lowest amount)
  const [stakeLamports, setStakeLamports] = useState<number>(solToLamports(0.01));
  const { playerStats, getMaxStakeAmount } = usePlayerStats();
  
  // Maximum stake amount from player stats
  const maxStakeAmount = getMaxStakeAmount();
  
  // Generate preset options based on player's status
  const getPresets = () => {
    // Standard increments, but filter by max allowed
    const standardPresets = [0.01, 0.05, 0.1, 0.25, 0.5, 1.0];
    const filteredPresets = standardPresets.filter(sol => sol <= maxStakeAmount);
    
    // If empty, at least include the lowest amount
    if (filteredPresets.length === 0) {
      return [0.01].map(solToLamports);
    }
    
    return filteredPresets.map(solToLamports);
  };
  
  // Get presets that respect the max stake limit
  const presets = getPresets();

  // Ensure current stake doesn't exceed max allowed
  useEffect(() => {
    const maxLamports = solToLamports(maxStakeAmount);
    if (stakeLamports > maxLamports) {
      setStakeLamports(maxLamports);
    }
  }, [maxStakeAmount, stakeLamports]);

  // Get the next stake tier the player will unlock
  const getNextTier = (): { games: number, maxStake: number, gamesLeft: number } | null => {
    if (!playerStats) return null;
    
    for (const tier of STAKE_TIERS) {
      if (playerStats.games < tier.games) {
        return {
          games: tier.games,
          maxStake: tier.maxStake,
          gamesLeft: tier.games - playerStats.games
        };
      }
    }
    
    return null; // Already at max tier
  };

  // Format the stake limit message for display
  const getStakeLimitMessage = (): string => {
    if (!playerStats) return '';
    
    // Show their current max stake
    let message = `Your max stake: ${maxStakeAmount} SOL`;
    
    // Add information about the next tier
    const nextTier = getNextTier();
    if (nextTier) {
      message += ` • Play ${nextTier.gamesLeft} more games to unlock ${nextTier.maxStake} SOL stakes`;
    }
    
    // Add warning if stakes are being limited due to suspicious patterns
    if (playerStats.max_stake_lamports && 
        !playerStats.is_provisional && 
        lamportsToSol(playerStats.max_stake_lamports) < getGameCountBasedMaxStake()) {
      message += ` • Stake limit reduced due to betting patterns`;
    }
    
    return message;
  };
  
  // Get the max stake based solely on game count (without pattern adjustments)
  const getGameCountBasedMaxStake = (): number => {
    if (!playerStats) return 0.01;
    
    if (playerStats.is_provisional) return 0.01;
    
    const games = playerStats.games;
    
    if (games < 11) return 0.01;
    if (games < 16) return 0.05;
    if (games < 26) return 0.1;
    if (games < 41) return 0.25;
    if (games < 61) return 0.5;
    return 1.0;
  };

  // Get the full progression table for UI display
  const getProgressionTable = () => {
    return STAKE_TIERS.map(tier => ({
      ...tier,
      current: playerStats && playerStats.games >= tier.games && 
               (playerStats.games < (STAKE_TIERS.find(t => t.games > tier.games)?.games || Infinity))
    }));
  };

  return {
    stakeLamports,
    setStakeLamports,
    presets,
    maxStakeSol: maxStakeAmount,
    isProvisional: playerStats?.isProvisional || false,
    limitMessage: getStakeLimitMessage(),
    progressionTable: getProgressionTable(),
    nextTier: getNextTier(),
    gameCount: playerStats?.games || 0
  };
};

// Type for the hook return value
export type UseStakeSelectorReturn = ReturnType<typeof useStakeSelector>;
