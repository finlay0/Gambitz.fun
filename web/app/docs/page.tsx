'use client';

import { useState } from 'react';

// Documentation navigation items
const navItems = [
  { id: 'getting-started', label: 'Getting Started' },
  { id: 'stakes', label: 'Stakes & Payouts' },
  { id: 'nft-royalties', label: 'NFT Royalties' },
  { id: 'game-rules', label: 'Game Rules' },
  { id: 'faq', label: 'Frequently Asked Questions' },
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('getting-started');
  
  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">Documentation</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navigation sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="sticky top-8">
            <nav className="flex flex-col space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  className={`px-4 py-2 rounded-md text-left ${
                    activeSection === item.id
                      ? 'bg-primary text-white'
                      : 'bg-neutral text-gray-300 hover:bg-neutral/70'
                  }`}
                  onClick={() => setActiveSection(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
        
        {/* Documentation content */}
        <div className="flex-1 bg-neutral/30 rounded-lg p-6">
          {activeSection === 'getting-started' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
              
              <div className="prose prose-invert max-w-none">
                <h3 className="text-xl font-semibold mt-6 mb-3">What is Gambitz?</h3>
                <p className="mb-4">
                  Gambitz is a chess platform on Solana where players can stake SOL on their games and earn rewards.
                  The platform features an innovative NFT royalty system for chess openings, allowing NFT owners to earn
                  when their opening is played in a game.
                </p>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">How to Start Playing</h3>
                <ol className="list-decimal pl-6 space-y-2 mb-4">
                  <li>Connect your Solana wallet using the &quot;Connect Wallet&quot; button in the top right</li>
                  <li>Navigate to the &quot;Play&quot; page</li>
                  <li>Choose your stake amount</li>
                  <li>Click &quot;Find Match&quot; to be paired with an opponent of similar skill</li>
                  <li>Play your chess game</li>
                  <li>Win and collect both stakes, minus platform fees and NFT royalties</li>
                </ol>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">Supported Wallets</h3>
                <p className="mb-4">
                  Gambitz supports all major Solana wallets, including:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Phantom</li>
                  <li>Solflare</li>
                  <li>Backpack</li>
                  <li>Sollet</li>
                  <li>Slope</li>
                </ul>
                
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 my-6">
                  <h4 className="text-lg font-semibold mb-2">Security Note</h4>
                  <p>
                    Always make sure you&apos;re on the official Gambitz.fun domain before connecting your wallet.
                    We will never ask for your seed phrase or private keys.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'stakes' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Stakes & Payouts</h2>
              
              <div className="prose prose-invert max-w-none">
                <h3 className="text-xl font-semibold mt-6 mb-3">How Staking Works</h3>
                <p className="mb-4">
                  When you start a game on Gambitz, you choose an amount of SOL to stake. This stake is held in escrow until the game ends.
                  The winner receives both stakes minus fees and royalties.
                </p>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">Stake Tiers</h3>
                <div className="overflow-x-auto mb-6">
                  <table className="min-w-full bg-neutral/50 rounded-lg overflow-hidden">
                    <thead className="bg-neutral">
                      <tr>
                        <th className="py-3 px-4 text-left">Tier</th>
                        <th className="py-3 px-4 text-left">Stake Amount</th>
                        <th className="py-3 px-4 text-left">Platform Fee</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      <tr>
                        <td className="py-3 px-4">Casual</td>
                        <td className="py-3 px-4">0.01 SOL</td>
                        <td className="py-3 px-4">5%</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">Regular</td>
                        <td className="py-3 px-4">0.05 SOL</td>
                        <td className="py-3 px-4">4%</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">Serious</td>
                        <td className="py-3 px-4">0.1 SOL</td>
                        <td className="py-3 px-4">3%</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">Expert</td>
                        <td className="py-3 px-4">0.5 SOL</td>
                        <td className="py-3 px-4">2%</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">Master</td>
                        <td className="py-3 px-4">1 SOL</td>
                        <td className="py-3 px-4">1.5%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">Fee Distribution</h3>
                <p className="mb-4">
                  When a game ends, the total pot (both players&apos; stakes) is distributed as follows:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Winner receives 90-95% (depending on stake tier)</li>
                  <li>Platform fee: 1.5-5% (depending on stake tier)</li>
                  <li>White&apos;s opening NFT owner: 1.5%</li>
                  <li>Black&apos;s opening NFT owner: 1.5%</li>
                </ul>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">Draws and Special Cases</h3>
                <p className="mb-4">
                  In case of a draw, the winner&apos;s pot is split 50/50 between both players.
                  If a player disconnects or times out, their opponent is awarded the win.
                </p>
              </div>
            </div>
          )}
          
          {activeSection === 'nft-royalties' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">NFT Royalties</h2>
              
              <div className="prose prose-invert max-w-none">
                <h3 className="text-xl font-semibold mt-6 mb-3">Opening NFTs</h3>
                <p className="mb-4">
                  Gambitz features a unique NFT system where chess openings are represented as NFTs.
                  Owners of these NFTs earn royalties every time their opening is played in a game.
                </p>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">How Royalties Work</h3>
                <p className="mb-4">
                  When a game is played, the system identifies the openings used by both white and black players.
                  The owners of these opening NFTs each receive 1.5% of the total pot as royalties.
                </p>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">Acquiring Opening NFTs</h3>
                <p className="mb-4">
                  You can purchase opening NFTs in the Marketplace section. Each opening has a different price
                  based on its popularity and potential earning power.
                </p>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">Opening Recognition</h3>
                <p className="mb-4">
                  Openings are recognized using the ECO (Encyclopedia of Chess Openings) classification system.
                  The system tracks the sequence of moves made by each player and matches them to the corresponding
                  opening in the database.
                </p>
                
                <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4 my-6">
                  <h4 className="text-lg font-semibold mb-2">Did You Know?</h4>
                  <p>
                    Some of the most popular openings like the Sicilian Defense can appear in over 25% of high-level games,
                    making their NFTs particularly valuable.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {activeSection === 'game-rules' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Game Rules</h2>
              
              <div className="prose prose-invert max-w-none">
                <h3 className="text-xl font-semibold mt-6 mb-3">Chess Rules</h3>
                <p className="mb-4">
                  Gambitz follows standard international chess rules as defined by FIDE (International Chess Federation).
                </p>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">Time Controls</h3>
                <p className="mb-4">
                  Games are played with the following time controls:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Standard: 10 minutes per player with a 5-second increment</li>
                  <li>Blitz: 3 minutes per player with a 2-second increment</li>
                  <li>Bullet: 1 minute per player with a 1-second increment</li>
                </ul>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">Game Outcomes</h3>
                <p className="mb-4">
                  A game can end in the following ways:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Checkmate: When a player&apos;s king is in check and there is no legal move to escape</li>
                  <li>Resignation: When a player voluntarily concedes the game</li>
                  <li>Timeout: When a player&apos;s clock reaches zero</li>
                  <li>Draw: By agreement, stalemate, threefold repetition, fifty-move rule, or insufficient material</li>
                  <li>Disconnect: When a player disconnects and doesn&apos;t reconnect within 30 seconds</li>
                </ul>
                
                <h3 className="text-xl font-semibold mt-6 mb-3">Anti-Cheat Measures</h3>
                <p className="mb-4">
                  Gambitz employs sophisticated anti-cheat measures to ensure fair play:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>AI-powered move analysis to detect engine assistance</li>
                  <li>Behavioral pattern recognition</li>
                  <li>Real-time monitoring of suspicious play</li>
                  <li>Strict penalties for cheating, including account bans and stake forfeiture</li>
                </ul>
              </div>
            </div>
          )}
          
          {activeSection === 'faq' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
              
              <div className="space-y-6">
                <div className="bg-neutral/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2">Is Gambitz available worldwide?</h3>
                  <p>
                    Yes, Gambitz is available to players around the world. However, it&apos;s your responsibility to ensure
                    that playing chess for stakes is legal in your jurisdiction.
                  </p>
                </div>
                
                <div className="bg-neutral/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2">What happens if I disconnect during a game?</h3>
                  <p>
                    If you disconnect during a game, you have 30 seconds to reconnect. After that, the game will be
                    considered forfeited, and your opponent will be awarded the win.
                  </p>
                </div>
                
                <div className="bg-neutral/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2">Can I play without staking SOL?</h3>
                  <p>
                    Currently, all games on Gambitz require a stake. We may introduce free play options in the future.
                  </p>
                </div>
                
                <div className="bg-neutral/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2">How are disputes handled?</h3>
                  <p>
                    Game results are determined automatically based on the rules of chess and the state of the game.
                    In case of technical issues, please contact our support team through Discord.
                  </p>
                </div>
                
                <div className="bg-neutral/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2">How do I withdraw my winnings?</h3>
                  <p>
                    Winnings are automatically transferred to your connected wallet at the end of each game.
                    There&apos;s no need to manually withdraw funds.
                  </p>
                </div>
                
                <div className="bg-neutral/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2">What fees does Gambitz charge?</h3>
                  <p>
                    Gambitz charges a platform fee between 1.5% and 5% depending on the stake tier. Additionally,
                    3% of the total pot goes to opening NFT owners (1.5% each for white and black).
                  </p>
                </div>
                
                <div className="bg-neutral/50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2">How does matchmaking work?</h3>
                  <p>
                    Players are matched based on their stake amount and, when possible, their skill level.
                    The matchmaking system aims to find balanced opponents for fair competition.
                  </p>
                </div>
              </div>
              
              <div className="mt-8 bg-primary/10 border border-primary/20 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-2">Still have questions?</h3>
                <p className="mb-4">
                  Join our Discord community to get help from our team and other players.
                </p>
                <a 
                  href="https://discord.gg/gambitz" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-primary hover:bg-primary/80 rounded text-white"
                >
                  Join Discord
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 