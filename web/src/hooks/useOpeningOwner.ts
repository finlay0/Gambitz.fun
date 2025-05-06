import useSWR from 'swr';
import openings from '@/lib/openings.json';

const HELIUS_KEY = process.env.NEXT_PUBLIC_HELIUS;

function fetcher(url: string) {
  return fetch(url).then(res => res.json());
}

/**
 * Returns the owner pubkey (string) or null for an ECO code.
 * @param eco ECO code (e.g. 'A00')
 */
export function useOpeningOwner(eco: string | undefined | null): string | null {
  const assetId = eco ? openings[eco] : undefined;
  const shouldFetch = !!assetId && !!HELIUS_KEY;
  const { data } = useSWR(
    shouldFetch ? `/helius/${assetId}` : null,
    () =>
      fetcher(
        `https://api.helius.xyz/v0/assets/${assetId}?api-key=${HELIUS_KEY}`
      ),
    { refreshInterval: 60000, dedupingInterval: 60000 }
  );
  return data?.ownership?.owner ?? null;
} 