import { PublicKey } from '@solana/web3.js';

const HELIUS_API_KEY = process.env.NEXT_PUBLIC_HELIUS_API_KEY;

// Base URL without the resource path so we can append it cleanly in each request
const HELIUS_BASE_URL = 'https://api.helius.xyz/v0';

function buildHeliusUrl(path: string): string {
  if (!HELIUS_API_KEY) {
    // In tests we often don't provide an API key; use a placeholder to keep the URL predictable
    return `${HELIUS_BASE_URL}${path}`;
  }
  // The API expects the api-key as a query param
  const delimiter = path.includes('?') ? '&' : '?';
  return `${HELIUS_BASE_URL}${path}${delimiter}api-key=${HELIUS_API_KEY}`;
}

export const useHelius = () => {
  const getNFTOwner = async (mint: PublicKey): Promise<PublicKey> => {
    try {
      const response = await fetch(
        buildHeliusUrl(`/nfts/${mint.toBase58()}`),
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded');
        }
        throw new Error('Failed to fetch NFT owner');
      }

      const data = await response.json();
      
      if (!data.owner) {
        throw new Error('No owner found');
      }

      return new PublicKey(data.owner);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unknown error occurred');
    }
  };

  return {
    getNFTOwner
  };
}; 