import { useCallback, useEffect, useState } from 'react';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor';
import { PROGRAM_IDL } from '@/types/wager';
import { PublicKey } from '@solana/web3.js';

// Constants from the contract
const DEFAULT_ELO_RATING = 1200;

export interface PlayerStats {
  pubkey: PublicKey;
  rating: number;
  games: number;
  wins: number;
  isProvisional: boolean;
  initialized: boolean;
  
  // Anti-smurf system fields
  max_stake_lamports?: number;
  weighted_win_sum?: number;
  total_stake_amount?: number;
  high_stake_wins?: number;
  high_stake_games?: number;
  low_stake_wins?: number;
  low_stake_games?: number;
  account_creation_slot?: number;
  last_stake_amounts?: number[];
  last_win_flags?: boolean[];
  next_history_index?: number;
}

export const usePlayerStats = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Convert raw stats account data to PlayerStats interface
  const processStatsAccount = useCallback((pubkey: PublicKey, account: Record<string, unknown>): PlayerStats => {
    return {
      pubkey,
      rating: account.rating as number,
      games: account.games as number,
      wins: account.wins as number,
      isProvisional: account.isProvisional as boolean,
      initialized: true,
      // Anti-smurf fields
      max_stake_lamports: (account.maxStakeLamports as BN)?.toNumber(),
      weighted_win_sum: (account.weightedWinSum as BN)?.toNumber(),
      total_stake_amount: (account.totalStakeAmount as BN)?.toNumber(),
      high_stake_wins: account.highStakeWins as number,
      high_stake_games: account.highStakeGames as number,
      low_stake_wins: account.lowStakeWins as number,
      low_stake_games: account.lowStakeGames as number,
      account_creation_slot: (account.accountCreationSlot as BN)?.toNumber(),
      last_stake_amounts: (account.lastStakeAmounts as BN[])?.map((x: BN) => x.toNumber()),
      last_win_flags: account.lastWinFlags as boolean[],
      next_history_index: account.nextHistoryIndex as number
    };
  }, []);

  // Get the current player's stats
  const getPlayerStats = useCallback(async () => {
    if (!wallet || !connection) return null;

    setLoading(true);
    setError(null);

    try {
      const provider = new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions());
      const program = new Program(PROGRAM_IDL, new PublicKey('GZJ54HYGi1Qx9GKeC9Ncbu2upkCwxGdrXxaQE9b2JVCM'), provider);

      // Find the PDA for player stats
      const [statsPda] = await PublicKey.findProgramAddress(
        [Buffer.from('player-stats'), wallet.publicKey.toBuffer()],
        program.programId
      );

      try {
        // Try to fetch the player stats account
        const statsAccount = await program.account.playerStats.fetch(statsPda);
        setPlayerStats(processStatsAccount(statsPda, statsAccount));
      } catch {
        // If the account doesn't exist, return a default uninitialized stats object
        console.log('Player stats not initialized yet');
        setPlayerStats({
          pubkey: statsPda,
          rating: DEFAULT_ELO_RATING,
          games: 0,
          wins: 0,
          isProvisional: true,
          initialized: false,
          // Initialize with safe defaults for anti-smurf fields
          max_stake_lamports: 10_000_000, // 0.01 SOL
          weighted_win_sum: 0,
          total_stake_amount: 0,
          high_stake_wins: 0,
          high_stake_games: 0,
          low_stake_wins: 0,
          low_stake_games: 0,
          last_stake_amounts: Array(10).fill(0),
          last_win_flags: Array(10).fill(false),
          next_history_index: 0
        });
      }
    } catch (err) {
      console.error('Error fetching player stats:', err);
      setError('Failed to load player statistics');
    } finally {
      setLoading(false);
    }
  }, [wallet, connection, processStatsAccount]);

  // Initialize player stats account if it doesn't exist
  const initializePlayerStats = useCallback(async () => {
    if (!wallet || !connection || !playerStats || playerStats.initialized) return;

    setLoading(true);
    setError(null);

    try {
      const provider = new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions());
      const program = new Program(PROGRAM_IDL, new PublicKey('GZJ54HYGi1Qx9GKeC9Ncbu2upkCwxGdrXxaQE9b2JVCM'), provider);

      const tx = await program.methods
        .initializePlayerStats()
        .accounts({
          player: wallet.publicKey,
          playerStats: playerStats.pubkey,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();

      console.log('Transaction signature:', tx);
      
      // Refresh stats after initialization
      await getPlayerStats();
    } catch (err) {
      console.error('Error initializing player stats:', err);
      setError('Failed to initialize player statistics');
    } finally {
      setLoading(false);
    }
  }, [wallet, connection, playerStats, getPlayerStats]);

  // Get stats for another player by pubkey
  const getOtherPlayerStats = useCallback(async (playerPubkey: PublicKey) => {
    if (!connection) return null;

    try {
      // Create a provider with just connection (no wallet needed for reading)
      const provider = new AnchorProvider(
        connection, 
        // @ts-expect-error - Provider interface requires wallet but we don't need it for readonly
        null,
        AnchorProvider.defaultOptions()
      );
      
      const program = new Program(PROGRAM_IDL, new PublicKey('GZJ54HYGi1Qx9GKeC9Ncbu2upkCwxGdrXxaQE9b2JVCM'), provider);

      // Find the PDA for player stats
      const [statsPda] = await PublicKey.findProgramAddress(
        [Buffer.from('player-stats'), playerPubkey.toBuffer()],
        program.programId
      );

      try {
        // Try to fetch the player stats account
        const statsAccount = await program.account.playerStats.fetch(statsPda);
        return processStatsAccount(statsPda, statsAccount);
      } catch {
        // If account doesn't exist, return null
        return null;
      }
    } catch (err) {
      console.error('Error fetching other player stats:', err);
      return null;
    }
  }, [connection, processStatsAccount]);

  // Get the maximum stake amount a player can wager
  const getMaxStakeAmount = useCallback(() => {
    if (!playerStats) return 0.01; // Default lowest value
    
    // If we have the max_stake_lamports from the on-chain account, use it
    if (playerStats.max_stake_lamports) {
      return playerStats.max_stake_lamports / 1_000_000_000; // Convert to SOL
    }
    
    // Check if player is provisional (played fewer than 10 games)
    if (playerStats.isProvisional) {
      return 0.01; // 0.01 SOL limit for provisional players
    }
    
    // Calculate based on game count
    const games = playerStats.games;
    if (games < 15) return 0.05; // 11-15 games
    if (games < 25) return 0.1;  // 16-25 games
    if (games < 40) return 0.25; // 26-40 games
    if (games < 60) return 0.5;  // 41-60 games
    return 1.0; // 61+ games
  }, [playerStats]);

  // Fetch stats on initial load
  useEffect(() => {
    if (wallet && connection) {
      getPlayerStats();
    }
  }, [wallet, connection, getPlayerStats]);

  return {
    playerStats,
    loading,
    error,
    getPlayerStats,
    initializePlayerStats,
    getOtherPlayerStats,
    getMaxStakeAmount
  };
}; 