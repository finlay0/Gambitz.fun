const heliusApiKey = process.env.HELIUS_API_KEY!;

type NFT = {
  content?: {
    metadata?: {
      name?: string;
    };
  };
  id: string;
};

export async function fetchOwnedOpeningNFTs(walletAddress: string) {
  const url = `https://api.helius.xyz/v0/addresses/${walletAddress}/assets?api-key=${heliusApiKey}&compression=compressed`;
  const res = await fetch(url);
  const json = await res.json();
  return json.items
    .filter((nft: NFT) => nft.content?.metadata?.name?.includes("Opening"))
    .map((nft: NFT) => ({
      name: nft.content?.metadata?.name ?? '',
      mint: nft.id,
    }));
} 