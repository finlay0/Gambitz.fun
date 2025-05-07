import { Opening } from '../hooks/useGameState';

interface OpeningDisplayProps {
  opening: Opening | null;
  color: 'white' | 'black';
  isCurrentPlayer: boolean;
}

export function OpeningDisplay({ opening, color, isCurrentPlayer }: OpeningDisplayProps) {
  if (!opening) return null;

  return (
    <div className={`opening-display ${color} ${isCurrentPlayer ? 'current' : ''}`}>
      <div className="opening-name">
        {opening.name}
        {opening.nftOwner && (
          <span className="nft-badge" title={`NFT owned by ${opening.nftOwner}`}>
            🎨
          </span>
        )}
      </div>
      <div className="opening-eco">{opening.eco}</div>
    </div>
  );
} 