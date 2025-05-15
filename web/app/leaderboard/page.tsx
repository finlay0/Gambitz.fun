'use client';

import { useState, useEffect } from 'react';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Program, AnchorProvider, web3 } from '@coral-xyz/anchor';
import { PROGRAM_IDL } from '@/types/wager';
import { PublicKey } from '@solana/web3.js';
import { PlayerStats } from '@/hooks/usePlayerStats';
import Link from 'next/link';

// Mock leaderboard data for initial UI development
const mockLeaderboardData = [
  { username: 'ChessMaster3000', rating: 2450, wins: 152, games: 205, isProvisional: false },
  { username: 'SolanaKnight', rating: 2325, wins: 98, games: 145, isProvisional: false },
  { username: 'CryptoRook', rating: 2280, wins: 87, games: 132, isProvisional: false },
  { username: 'TokenKing', rating: 2150, wins: 45, games: 75, isProvisional: false },
  { username: 'BlockchainBishop', rating: 2100, wins: 63, games: 110, isProvisional: false },
  { username: 'SolPawn', rating: 1950, wins: 32, games: 60, isProvisional: false },
  { username: 'NFTQueen', rating: 1900, wins: 27, games: 55, isProvisional: false },
  { username: 'WalletWizard', rating: 1850, wins: 22, games: 45, isProvisional: false },
  { username: 'HashKnight', rating: 1800, wins: 18, games: 40, isProvisional: false },
  { username: 'LedgerLord', rating: 1750, wins: 15, games: 35, isProvisional: false },
  { username: 'NewPlayer1', rating: 1320, wins: 3, games: 7, isProvisional: true },
];

type LeaderboardPlayer = {
  username: string;
  rating: number;
  wins: number;
  games: number;
  isProvisional: boolean;
  publicKey?: string;
};

export default function LeaderboardPage() {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardPlayer[]>(mockLeaderboardData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'all' | 'week' | 'month'>('all');
  
  // In a real implementation, this would fetch actual player data from the program
  const fetchLeaderboardData = async () => {
    if (!connection) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // In a production version, this would use a proper indexer or backend API
      // to fetch all player stats accounts and order them
      
      // For now, use mock data with a slight delay to simulate loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // You would replace this with real data in production
      setLeaderboardData(mockLeaderboardData);
    } catch (err) {
      console.error('Error fetching leaderboard data:', err);
      setError('Failed to load leaderboard data');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchLeaderboardData();
  }, [connection, timeframe]);
  
  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
          <p className="text-gray-300">
            Top chess players ranked by ELO rating
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => setTimeframe('all')}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                timeframe === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-neutral text-gray-300 hover:bg-neutral/70'
              }`}
            >
              All Time
            </button>
            <button
              type="button"
              onClick={() => setTimeframe('month')}
              className={`px-4 py-2 text-sm font-medium ${
                timeframe === 'month'
                  ? 'bg-primary text-white'
                  : 'bg-neutral text-gray-300 hover:bg-neutral/70'
              }`}
            >
              This Month
            </button>
          <button
              type="button"
              onClick={() => setTimeframe('week')}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                timeframe === 'week'
                ? 'bg-primary text-white'
                : 'bg-neutral text-gray-300 hover:bg-neutral/70'
            }`}
          >
              This Week
          </button>
          </div>
          
          {!wallet && (
            <div className="hidden md:block">
              <WalletMultiButton />
            </div>
          )}
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading leaderboard...</p>
        </div>
      ) : error ? (
        <div className="bg-red-900/30 p-6 rounded-lg text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => fetchLeaderboardData()}
            className="px-4 py-2 bg-primary rounded-lg"
          >
            Retry
          </button>
        </div>
      ) : (
      <div className="bg-neutral rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-neutral/70">
            <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Rank
              </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Player
              </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Rating
              </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  W-L
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Win %
              </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Games
              </th>
            </tr>
          </thead>
            <tbody className="divide-y divide-gray-700">
              {leaderboardData.map((player, index) => {
                const winRate = player.games > 0 ? Math.round((player.wins / player.games) * 100) : 0;
                
                return (
                  <tr key={index} className="hover:bg-neutral/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        <span className="font-medium">{index + 1}</span>
                      </div>
                    </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-600 to-teal-400 flex items-center justify-center text-white font-bold">
                          {player.username.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <div className="font-medium">{player.username}</div>
                          {player.isProvisional && (
                            <span className="text-xs text-yellow-400">Provisional</span>
                          )}
                    </div>
                  </div>
                </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="font-bold">{player.rating}</div>
                </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="text-green-400">{player.wins}</span> - <span className="text-red-400">{player.games - player.wins}</span>
                </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {winRate}%
                </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {player.games}
                </td>
              </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      )}
      
      <div className="mt-6 bg-gray-800/30 rounded-lg p-4 text-sm text-gray-400">
        <p>
          <span className="font-bold">How ELO works:</span> Players start with a provisional 1200 rating. Win against higher-rated players to gain more points; lose to lower-rated players to lose more points. After 10 games, your rating becomes established.
        </p>
      </div>
    </div>
  );
} 