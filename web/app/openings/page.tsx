'use client';

import { useState } from 'react';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

// Mock opening NFT data
const mockOpenings = [
  { id: 1, name: 'Sicilian Defense', eco: 'B20', price: 2.5, popularity: 85, owned: true, royaltiesEarned: 15.8 },
  { id: 2, name: 'Queen\'s Gambit', eco: 'D02', price: 3.2, popularity: 92, owned: false, royaltiesEarned: 0 },
  { id: 3, name: 'Ruy Lopez', eco: 'C60', price: 1.8, popularity: 78, owned: false, royaltiesEarned: 0 },
  { id: 4, name: 'French Defense', eco: 'C10', price: 1.5, popularity: 70, owned: false, royaltiesEarned: 0 },
  { id: 5, name: 'King\'s Indian', eco: 'E60', price: 2.2, popularity: 82, owned: true, royaltiesEarned: 12.3 },
  { id: 6, name: 'Caro-Kann', eco: 'B10', price: 1.9, popularity: 75, owned: false, royaltiesEarned: 0 },
  { id: 7, name: 'Nimzo-Indian', eco: 'E20', price: 2.8, popularity: 80, owned: false, royaltiesEarned: 0 },
  { id: 8, name: 'English Opening', eco: 'A10', price: 1.7, popularity: 68, owned: false, royaltiesEarned: 0 },
  { id: 9, name: 'Pirc Defense', eco: 'B07', price: 1.6, popularity: 65, owned: false, royaltiesEarned: 0 },
  { id: 10, name: 'Scandinavian Defense', eco: 'B01', price: 1.4, popularity: 60, owned: false, royaltiesEarned: 0 },
  { id: 11, name: 'Vienna Game', eco: 'C27', price: 1.3, popularity: 55, owned: false, royaltiesEarned: 0 },
  { id: 12, name: 'Alekhine\'s Defense', eco: 'B02', price: 1.5, popularity: 62, owned: false, royaltiesEarned: 0 },
];

type FilterState = 'all' | 'owned' | 'forsale';
type SortField = 'price' | 'popularity' | 'name';
type SortDirection = 'asc' | 'desc';

export default function OpeningsPage() {
  const wallet = useAnchorWallet();
  const [filter, setFilter] = useState<FilterState>('all');
  const [sortField, setSortField] = useState<SortField>('popularity');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredOpenings = mockOpenings
    .filter(opening => {
      if (filter === 'owned') return opening.owned;
      if (filter === 'forsale') return !opening.owned;
      return true;
    })
    .filter(opening => 
      opening.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opening.eco.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
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
      <h1 className="text-3xl font-bold mb-2">Openings Marketplace</h1>
      <p className="text-gray-300 mb-8 max-w-3xl">
        Own chess opening NFTs and earn royalties every time a player uses your opening in a game.
        Each time your opening is played, you receive 1.5% of the total match stake.
      </p>
      
      {!wallet && (
        <div className="bg-neutral/30 rounded-lg p-6 mb-8 text-center">
          <p className="text-lg mb-4">Connect your wallet to buy opening NFTs</p>
          <div className="inline-block">
            <WalletMultiButton />
          </div>
        </div>
      )}
      
      {/* Filters and sorting */}
      <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
        <div className="flex space-x-2">
          <button
            className={`px-4 py-2 rounded-md ${
              filter === 'all'
                ? 'bg-primary text-white'
                : 'bg-neutral text-gray-300 hover:bg-neutral/70'
            }`}
            onClick={() => setFilter('all')}
          >
            All Openings
          </button>
          {wallet && (
            <>
              <button
                className={`px-4 py-2 rounded-md ${
                  filter === 'owned'
                    ? 'bg-primary text-white'
                    : 'bg-neutral text-gray-300 hover:bg-neutral/70'
                }`}
                onClick={() => setFilter('owned')}
              >
                My NFTs
              </button>
              <button
                className={`px-4 py-2 rounded-md ${
                  filter === 'forsale'
                    ? 'bg-primary text-white'
                    : 'bg-neutral text-gray-300 hover:bg-neutral/70'
                }`}
                onClick={() => setFilter('forsale')}
              >
                For Sale
              </button>
            </>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search openings..."
            className="px-4 py-2 bg-neutral text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <select
            className="px-4 py-2 bg-neutral text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={`${sortField}-${sortDirection}`}
            onChange={(e) => {
              const [field, direction] = e.target.value.split('-');
              setSortField(field as SortField);
              setSortDirection(direction as SortDirection);
            }}
          >
            <option value="popularity-desc">Most Popular</option>
            <option value="popularity-asc">Least Popular</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
          </select>
        </div>
      </div>
      
      {/* Openings grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredOpenings.map((opening) => (
          <div key={opening.id} className="bg-neutral rounded-lg shadow-lg overflow-hidden flex flex-col">
            <div className="p-4 bg-gradient-to-r from-purple-900/30 to-teal-900/30 flex items-center justify-center h-48">
              <div className="text-6xl">♞</div>
            </div>
            
            <div className="p-4 flex-grow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{opening.name}</h3>
                  <p className="text-sm text-gray-400">ECO: {opening.eco}</p>
                </div>
                <div className="bg-neutral/70 px-2 py-1 rounded-full text-xs">
                  {opening.popularity}% Popular
                </div>
              </div>
              
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-gray-300">Price:</div>
                <div className="text-yellow-400 font-bold">{opening.price.toFixed(2)} ◎</div>
              </div>
              
              {opening.owned && (
                <div className="mt-2 flex justify-between items-center">
                  <div className="text-sm text-gray-300">Royalties Earned:</div>
                  <div className="text-green-400 font-bold">{opening.royaltiesEarned.toFixed(2)} ◎</div>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-neutral/50 border-t border-gray-700">
              {opening.owned ? (
                <div className="flex flex-col space-y-2">
                  <div className="bg-green-900/20 text-green-400 py-1 px-3 rounded-md text-center text-sm">
                    Owned by You
                  </div>
                  <button className="py-2 bg-primary/20 hover:bg-primary/30 rounded text-primary text-sm">
                    List for Sale
                  </button>
                </div>
              ) : (
                <button 
                  className="w-full py-2 bg-primary hover:bg-primary/80 rounded text-white font-medium"
                  disabled={!wallet}
                >
                  Buy NFT for {opening.price.toFixed(2)} ◎
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {filteredOpenings.length === 0 && (
        <div className="text-center py-20 bg-neutral/20 rounded-lg">
          <h3 className="text-xl font-bold mb-2">No Openings Found</h3>
          <p className="text-gray-400">
            Try adjusting your filters or search terms
          </p>
        </div>
      )}
      
      {/* Pagination */}
      <div className="mt-8 flex justify-center">
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