'use client';

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

// Animated chess piece component
const AnimatedChessPiece = ({ piece, delay }: { piece: string, delay: number }) => {
  return (
    <div 
      className="animate-float" 
      style={{ 
        animationDelay: `${delay}s`,
        opacity: 0.7 + (Math.random() * 0.3)
      }}
    >
      <div className="text-4xl md:text-6xl">{piece}</div>
    </div>
  );
};

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const chessPieces = ["♔", "♕", "♖", "♗", "♘", "♙", "♚", "♛", "♜", "♝", "♞", "♟"];

  return (
    <div className="min-h-screen bg-background text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background animated pieces */}
        <div className="absolute inset-0 opacity-10 flex items-center justify-center">
          <div className="grid grid-cols-6 gap-16">
            {chessPieces.map((piece, index) => (
              <AnimatedChessPiece 
                key={index} 
                piece={piece} 
                delay={index * 0.2} 
              />
            ))}
          </div>
        </div>
        
        <div className="relative max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          <h1 className="text-4xl md:text-6xl font-bold text-center mb-6">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-teal-400">
              Chess For Stakes on Solana
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-center text-gray-300 max-w-3xl mb-10">
            Play chess, stake SOL, win big. Earn royalties by owning opening NFTs.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Link 
              href="/board" 
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-teal-500 rounded-lg font-bold text-lg hover:opacity-90 transition-opacity"
            >
              Play Now
            </Link>
            {isClient && (
              <div className="wallet-button-wrapper">
                <WalletMultiButton />
              </div>
            )}
          </div>
          
          <div className="relative w-full max-w-2xl h-[400px] bg-neutral rounded-xl shadow-2xl overflow-hidden">
            <Image
              src="/chessboard-preview.png"
              alt="Gambitz Chess Game"
              fill
              style={{ objectFit: "cover" }}
              priority
            />
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="bg-background py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Game-Changing Chess Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-neutral rounded-xl p-6 shadow-lg">
              <div className="h-12 w-12 rounded-md bg-purple-700 flex items-center justify-center mb-4">
                <span className="text-2xl">♟</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Stake & Play</h3>
              <p className="text-gray-300">
                Stake SOL on your chess skills and win your opponent&apos;s stake. True skin in the game.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-neutral rounded-xl p-6 shadow-lg">
              <div className="h-12 w-12 rounded-md bg-teal-700 flex items-center justify-center mb-4">
                <span className="text-2xl">♕</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Opening NFTs</h3>
              <p className="text-gray-300">
                Own chess opening NFTs and earn royalties when players use your opening in games.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-neutral rounded-xl p-6 shadow-lg">
              <div className="h-12 w-12 rounded-md bg-purple-700 flex items-center justify-center mb-4">
                <span className="text-2xl">♚</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Anti-Cheat System</h3>
              <p className="text-gray-300">
                Advanced AI-powered cheat detection ensures fair play in all matches.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* How It Works */}
      <div className="bg-neutral/50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-purple-600 flex items-center justify-center mb-4">
                <span className="font-bold">1</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Connect Wallet</h3>
              <p className="text-gray-300">
                Connect your Solana wallet to start playing for stakes.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-purple-600 flex items-center justify-center mb-4">
                <span className="font-bold">2</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Choose Stake</h3>
              <p className="text-gray-300">
                Select how much SOL you want to stake on your game.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-purple-600 flex items-center justify-center mb-4">
                <span className="font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Play Chess</h3>
              <p className="text-gray-300">
                Match with an opponent and play a game of chess.
              </p>
            </div>
            
            {/* Step 4 */}
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-purple-600 flex items-center justify-center mb-4">
                <span className="font-bold">4</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Win & Collect</h3>
              <p className="text-gray-300">
                Winners collect both stakes, minus platform and NFT royalties.
              </p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Link 
              href="/docs"
              className="text-white text-lg underline decoration-purple-500 underline-offset-4"
            >
              Learn more about how Gambitz works
            </Link>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-background py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Play Chess for Stakes?</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Join the Gambitz community today and experience chess with real skin in the game.
          </p>
          
          <Link 
            href="/board" 
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-teal-500 rounded-lg font-bold text-lg hover:opacity-90 transition-opacity"
          >
            Play Now
          </Link>
        </div>
      </div>
    </div>
  );
}
