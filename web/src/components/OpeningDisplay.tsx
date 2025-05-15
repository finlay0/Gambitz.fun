import { Opening } from '../hooks/useGameState';

interface OpeningDisplayProps {
  opening: Opening | null;
}

export function OpeningDisplay({ opening }: OpeningDisplayProps) {
  if (!opening) return null;

  return (
    <div className={`opening-display`}>
      <div className="opening-name">
        {opening.name}
        {opening.variant && <span className="opening-variant"> ({opening.variant})</span>}
        {opening.nftOwner && (
          <span className="nft-badge" title={`NFT owned by ${opening.nftOwner.toBase58()}`}>
            🎨
          </span>
        )}
      </div>
      <div className="opening-eco">{opening.eco}</div>
    </div>
  );
} 