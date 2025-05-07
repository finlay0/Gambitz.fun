'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  WalletMultiButton 
} from '@solana/wallet-adapter-react-ui';

const Navigation = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const isActive = (path: string) => pathname === path;
  
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <div className="h-8 w-auto sm:h-10 text-2xl font-bold bg-gradient-to-r from-purple-500 to-teal-400 bg-clip-text text-transparent">
                  Gambitz
                </div>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link 
                href="/board"
                className={`${isActive('/board') 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-gray-300 hover:text-white'} 
                  inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Play
              </Link>
              <Link 
                href="/leaderboard"
                className={`${isActive('/leaderboard') 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-gray-300 hover:text-white'} 
                  inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Leaderboard
              </Link>
              <Link 
                href="/openings"
                className={`${isActive('/openings') 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-gray-300 hover:text-white'} 
                  inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Openings
              </Link>
              <Link 
                href="/docs"
                className={`${isActive('/docs') 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-gray-300 hover:text-white'} 
                  inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Docs
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <Link
              href="/board"
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Play Now
            </Link>
            <div className="ml-3">
              <WalletMultiButton />
            </div>
            <div className="ml-3 relative">
              <Link
                href="/profile"
                className="bg-neutral p-1 rounded-full text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <span className="sr-only">View profile</span>
                <div className="h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center">
                  <span className="text-xs font-bold">ME</span>
                </div>
              </Link>
            </div>
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-neutral focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isMobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/board"
              className={`${
                isActive('/board')
                  ? 'bg-neutral text-white'
                  : 'text-gray-300 hover:bg-neutral/50 hover:text-white'
              } block px-3 py-2 rounded-md text-base font-medium`}
            >
              Play
            </Link>
            <Link
              href="/leaderboard"
              className={`${
                isActive('/leaderboard')
                  ? 'bg-neutral text-white'
                  : 'text-gray-300 hover:bg-neutral/50 hover:text-white'
              } block px-3 py-2 rounded-md text-base font-medium`}
            >
              Leaderboard
            </Link>
            <Link
              href="/openings"
              className={`${
                isActive('/openings')
                  ? 'bg-neutral text-white'
                  : 'text-gray-300 hover:bg-neutral/50 hover:text-white'
              } block px-3 py-2 rounded-md text-base font-medium`}
            >
              Openings
            </Link>
            <Link
              href="/docs"
              className={`${
                isActive('/docs')
                  ? 'bg-neutral text-white'
                  : 'text-gray-300 hover:bg-neutral/50 hover:text-white'
              } block px-3 py-2 rounded-md text-base font-medium`}
            >
              Docs
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-border">
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center">
                    <span className="text-sm font-bold">ME</span>
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-white">User</div>
                  <div className="text-sm font-medium text-gray-400">
                    Connected
                  </div>
                </div>
              </div>
              <div>
                <WalletMultiButton />
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Link
                href="/profile"
                className="block px-4 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-neutral/50"
              >
                Your Profile
              </Link>
              <Link
                href="/settings"
                className="block px-4 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-neutral/50"
              >
                Settings
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation; 