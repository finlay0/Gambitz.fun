'use client';

import { useEffect, useState } from 'react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';
import { usePlayerStats, PlayerStats } from '@/hooks/usePlayerStats';
import { toast } from 'react-hot-toast';

// Mock game history - kept for now since we don't have game history tracking yet
const mockGameHistory = [
  { id: 1, date: '2023-06-15', opponent: 'SolanaKnight', result: 'win', stake: 10.5, opening: 'Sicilian Defense' },
  { id: 2, date: '2023-06-14', opponent: 'CryptoRook', result: 'loss', stake: 5.25, opening: 'Queen\'s Gambit' },
  { id: 3, date: '2023-06-12', opponent: 'TokenKing', result: 'win', stake: 7.8, opening: 'Ruy Lopez' },
  { id: 4, date: '2023-06-10', opponent: 'NFTPawn', result: 'draw', stake: 3.2, opening: 'French Defense' },
  { id: 5, date: '2023-06-08', opponent: 'BlockchainBishop', result: 'win', stake: 12.5, opening: 'Sicilian Defense' },
];

export default function ProfilePage() {
  const wallet = useAnchorWallet();
  const [activeTab, setActiveTab] = useState<'games' | 'openings' | 'nfts'>('games');
  const { playerStats, loading, error, initializePlayerStats } = usePlayerStats();
  const [username, setUsername] = useState<string>('Chess Player');

  // Initialize player stats if needed
  useEffect(() => {
    if (playerStats && !playerStats.initialized) {
      initializePlayerStats();
    }
  }, [playerStats, initializePlayerStats]);

  // Generate a username from the wallet address if no custom username
  useEffect(() => {
    if (wallet) {
      const walletAddress = wallet.publicKey.toString();
      setUsername(`Player ${walletAddress.substring(0, 4)}...${walletAddress.substring(walletAddress.length - 4)}`);
    }
  }, [wallet]);

  if (!wallet) {
    return (
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl font-bold mb-6">Profile</h1>
        <p className="text-xl text-gray-300 mb-8">Please connect your wallet to view your profile</p>
        <div className="inline-block">
          <WalletMultiButton />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-lg">Loading player stats...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-red-900/30 p-4 rounded-lg mb-6">
          <p className="text-red-400">{error}</p>
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

  // Calculate win rate
  const winRate = playerStats && playerStats.games > 0 
    ? Math.round((playerStats.wins / playerStats.games) * 100) 
    : 0;

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-neutral rounded-xl shadow-lg overflow-hidden">
        {/* Profile header */}
        <div className="bg-gradient-to-r from-purple-700 to-teal-600 px-6 py-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="h-24 w-24 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold">
              {username.charAt(0)}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold">{username}</h1>
              <p className="text-white/70">
                {playerStats?.isProvisional ? 'Provisional Player' : 'Established Player'}
              </p>
              <p className="mt-2">
                <span className="text-white/90">Wallet: </span>
                <span className="text-white/70">{`${wallet.publicKey.toString().slice(0, 6)}...${wallet.publicKey.toString().slice(-4)}`}</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-4 justify-center md:justify-end">
              <div className="bg-white/10 rounded-lg px-4 py-2 min-w-[100px] text-center">
                <div className="text-2xl font-bold">{playerStats?.wins || 0}</div>
                <div className="text-xs text-white/70">Wins</div>
              </div>
              <div className="bg-white/10 rounded-lg px-4 py-2 min-w-[100px] text-center">
                <div className="text-2xl font-bold">{(playerStats?.games || 0) - (playerStats?.wins || 0)}</div>
                <div className="text-xs text-white/70">Losses</div>
              </div>
              <div className="bg-white/10 rounded-lg px-4 py-2 min-w-[100px] text-center">
                <div className="text-2xl font-bold">{winRate}%</div>
                <div className="text-xs text-white/70">Win Rate</div>
              </div>
              <div className="bg-white/10 rounded-lg px-4 py-2 min-w-[120px] text-center">
                <div className="text-2xl font-bold">{playerStats?.rating || 1200}</div>
                <div className="text-xs text-white/70">ELO Rating</div>
              </div>
            </div>
          </div>
        </div>

        {/* Provisional status indicator */}
        {playerStats?.isProvisional && (
          <div className="bg-yellow-900/20 p-4 border-l-4 border-yellow-500">
            <p className="text-yellow-400">
              <span className="font-bold">Provisional Status:</span> You've played {playerStats.games} of {10} games needed for a stable rating. 
              Stake limit: 0.01 SOL until your rating is established.
            </p>
          </div>
        )}

        {/* Profile tabs */}
        <div className="border-b border-gray-700">
          <nav className="flex -mb-px">
            <button
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'games'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('games')}
            >
              Game History
            </button>
            <button
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'openings'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('openings')}
            >
              Favorite Openings
            </button>
            <button
              className={`py-4 px-6 text-sm font-medium border-b-2 ${
                activeTab === 'nfts'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('nfts')}
            >
              Owned NFTs
            </button>
          </nav>
        </div>

        {/* Tab content */}
        <div className="p-6">
          {activeTab === 'games' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Recent Games</h2>
                <div className="text-sm text-gray-300">
                  {playerStats?.games || 0} games played
                </div>
              </div>
              
              {playerStats?.games === 0 ? (
                <div className="bg-neutral/50 rounded-lg p-10 text-center">
                  <p className="text-gray-300 mb-6">You haven't played any games yet.</p>
                  <Link
                    href="/play"
                    className="px-6 py-2 bg-primary hover:bg-primary/80 rounded inline-block"
                  >
                    Start Playing
                  </Link>
                </div>
              ) : (
              <div className="bg-neutral/30 rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-neutral/70">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Opponent
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Result
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Stake
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Opening
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {mockGameHistory.map((game) => (
                      <tr key={game.id} className="hover:bg-neutral/50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {new Date(game.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                          {game.opponent}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              game.result === 'win'
                                ? 'bg-green-900 text-green-200'
                                : game.result === 'loss'
                                ? 'bg-red-900 text-red-200'
                                : 'bg-blue-900 text-blue-200'
                            }`}
                          >
                            {game.result.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-400">
                          {game.stake.toFixed(2)} ◎
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {game.opening}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          <Link 
                            href={`/game/${game.id}`}
                            className="text-primary hover:text-primary/80"
                          >
                            View Game
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              )}
            </div>
          )}

          {activeTab === 'openings' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Favorite Openings</h2>
              <div className="bg-neutral/50 rounded-lg p-10 text-center">
                <p className="text-gray-300 mb-6">Opening statistics will be available after you've played more games.</p>
                <Link
                  href="/play"
                  className="px-6 py-2 bg-primary hover:bg-primary/80 rounded inline-block"
                >
                  Play More Games
                </Link>
              </div>
            </div>
          )}

          {activeTab === 'nfts' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Owned Opening NFTs</h2>
                <div className="text-center py-10 bg-neutral/30 rounded-lg">
                  <div className="text-4xl mb-4">♕</div>
                  <h3 className="text-xl font-bold mb-2">No Opening NFTs Yet</h3>
                  <p className="text-gray-400 max-w-md mx-auto mb-6">
                    Own an opening NFT to earn royalties every time someone uses that opening in a game.
                  </p>
                  <Link
                    href="/openings"
                    className="px-6 py-2 bg-primary hover:bg-primary/80 rounded"
                  >
                    Browse Openings Marketplace
                  </Link>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 