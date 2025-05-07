import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">
              About Gambitz
            </h3>
            <p className="mt-4 text-sm text-gray-400">
              Play chess for stakes on Solana. Win SOL and earn royalties by owning opening NFTs.
            </p>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">
              Resources
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/docs" className="text-sm text-gray-400 hover:text-white">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/docs/royalties" className="text-sm text-gray-400 hover:text-white">
                  NFT Royalties
                </Link>
              </li>
              <li>
                <Link href="/docs/stakes" className="text-sm text-gray-400 hover:text-white">
                  Stakes Guide
                </Link>
              </li>
              <li>
                <Link href="/docs/faq" className="text-sm text-gray-400 hover:text-white">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">
              Legal
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/terms" className="text-sm text-gray-400 hover:text-white">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-gray-400 hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-sm text-gray-400 hover:text-white">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">
              Connect
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="https://twitter.com/gambitz" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white">
                  Twitter
                </a>
              </li>
              <li>
                <a href="https://discord.gg/gambitz" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white">
                  Discord
                </a>
              </li>
              <li>
                <a href="https://github.com/gambitz" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white">
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-gray-400 text-center">
            &copy; {new Date().getFullYear()} Gambitz.fun | Built on Solana
          </p>
          <div className="mt-4 flex justify-center space-x-6">
            <a 
              href="https://solana.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white"
            >
              <span className="sr-only">Solana</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5.68 6.2h12.45c.29 0 .53.24.53.54 0 .14-.06.28-.15.38l-4.11 4.1a.53.53 0 0 1-.76 0L9.53 7.12a.53.53 0 0 1 0-.75.5.5 0 0 1 .38-.17h5.3M5.67 17.8h12.45c.3 0 .53-.24.53-.53a.53.53 0 0 0-.15-.38l-4.11-4.1a.53.53 0 0 0-.76 0l-4.1 4.1a.53.53 0 0 0 0 .75.5.5 0 0 0 .38.16h5.3M5.67 12h12.45c.3 0 .53-.24.53-.53a.53.53 0 0 0-.15-.38l-4.11-4.1a.53.53 0 0 0-.76 0l-4.1 4.1a.53.53 0 0 0 0 .75.5.5 0 0 0 .38.16h5.3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 