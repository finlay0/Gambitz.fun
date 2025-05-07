'use client';

import { useState } from 'react';

// Mock data for the leaderboard
const mockPlayers = [
  { rank: 1, username: 'GrandMaster1', wins: 42, losses: 5, draws: 3, stake: 1250.75 },
  { rank: 2, username: 'SolanaKnight', wins: 39, losses: 8, draws: 2, stake: 980.5 },
  { rank: 3, username: 'CryptoRook', wins: 35, losses: 10, draws: 5, stake: 750.25 },
  { rank: 4, username: 'BlockchainBishop', wins: 32, losses: 12, draws: 6, stake: 620.8 },
  { rank: 5, username: 'NFTPawn', wins: 30, losses: 15, draws: 4, stake: 590.4 },
  { rank: 6, username: 'DefiQueen', wins: 28, losses: 18, draws: 3, stake: 510.9 },
  { rank: 7, username: 'ChessWhale', wins: 25, losses: 20, draws: 5, stake: 480.3 },
  { rank: 8, username: 'TokenKing', wins: 23, losses: 22, draws: 4, stake: 450.7 },
  { rank: 9, username: 'MetaKnight', wins: 20, losses: 25, draws: 5, stake: 390.2 },
  { rank: 10, username: 'SolStaker', wins: 18, losses: 28, draws: 3, stake: 320.6 },
];

type SortField = 'rank' | 'wins' | 'losses' | 'stake';
type SortDirection = 'asc' | 'desc';
type TimeFilter = 'daily' | 'weekly' | 'monthly' | 'all-time';

export default function LeaderboardPage() {
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all-time');
  
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const sortedPlayers = [...mockPlayers].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
  
  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">Leaderboard</h1>
      
      {/* Time filter tabs */}
      <div className="flex space-x-4 mb-6">
        {(['daily', 'weekly', 'monthly', 'all-time'] as TimeFilter[]).map((filter) => (
          <button
            key={filter}
            className={`px-4 py-2 rounded-md ${
              timeFilter === filter
                ? 'bg-primary text-white'
                : 'bg-neutral text-gray-300 hover:bg-neutral/70'
            }`}
            onClick={() => setTimeFilter(filter)}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>
      
      {/* Leaderboard table */}
      <div className="bg-neutral rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-neutral/70">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('rank')}
              >
                Rank
                {sortField === 'rank' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
              >
                Player
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('wins')}
              >
                Wins
                {sortField === 'wins' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('losses')}
              >
                Losses
                {sortField === 'losses' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Draws
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('stake')}
              >
                Total Stake (SOL)
                {sortField === 'stake' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
            </tr>
          </thead>
          <tbody className="bg-neutral/30 divide-y divide-gray-700">
            {sortedPlayers.map((player) => (
              <tr key={player.rank} className="hover:bg-neutral/50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={`
                      flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center
                      ${player.rank === 1 ? 'bg-yellow-500' : 
                        player.rank === 2 ? 'bg-gray-300' : 
                        player.rank === 3 ? 'bg-amber-700' : 'bg-purple-600'}
                    `}>
                      <span className="text-xs font-bold text-gray-900">{player.rank}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-white">{player.username}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-green-400">{player.wins}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-red-400">{player.losses}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-blue-400">{player.draws}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-yellow-400">{player.stake.toFixed(2)} ◎</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination placeholder */}
      <div className="mt-6 flex justify-center">
        <nav className="flex items-center space-x-2">
          <button className="px-3 py-1 rounded-md bg-neutral text-gray-300 hover:bg-neutral/70">
            Previous
          </button>
          <span className="px-3 py-1 rounded-md bg-primary text-white">1</span>
          <button className="px-3 py-1 rounded-md bg-neutral text-gray-300 hover:bg-neutral/70">
            2
          </button>
          <button className="px-3 py-1 rounded-md bg-neutral text-gray-300 hover:bg-neutral/70">
            3
          </button>
          <span className="text-gray-400">...</span>
          <button className="px-3 py-1 rounded-md bg-neutral text-gray-300 hover:bg-neutral/70">
            10
          </button>
          <button className="px-3 py-1 rounded-md bg-neutral text-gray-300 hover:bg-neutral/70">
            Next
          </button>
        </nav>
      </div>
    </div>
  );
} 