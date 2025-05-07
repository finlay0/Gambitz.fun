import openings from './openings.json';

export type OpeningOwner = {
  mint: string;
  owner: string | null;
};

// Define the proper type for the openings object
type OpeningsData = Record<string, string>;

// Cast the imported JSON to the appropriate type
const openingsData = openings as OpeningsData;

export async function getOpeningOwners(whiteEco: string | null, blackEco: string | null): Promise<{
  white: OpeningOwner | null;
  black: OpeningOwner | null;
}> {
  const whiteMint = whiteEco && whiteEco in openingsData ? openingsData[whiteEco] : null;
  const blackMint = blackEco && blackEco in openingsData ? openingsData[blackEco] : null;

  // If no mint exists, platform gets the royalty
  if (!whiteMint || !blackMint) {
    return {
      white: whiteMint ? { mint: whiteMint, owner: null } : null,
      black: blackMint ? { mint: blackMint, owner: null } : null
    };
  }

  try {
    // Fetch owners from Helius API
    const [whiteOwner, blackOwner] = await Promise.all([
      whiteMint ? fetch(`https://api.helius.xyz/v0/assets/${whiteMint}?api-key=${process.env.HELIUS_API_KEY}`).then(r => r.json()).then(data => data.ownership?.owner) : null,
      blackMint ? fetch(`https://api.helius.xyz/v0/assets/${blackMint}?api-key=${process.env.HELIUS_API_KEY}`).then(r => r.json()).then(data => data.ownership?.owner) : null
    ]);

    return {
      white: whiteMint ? { mint: whiteMint, owner: whiteOwner } : null,
      black: blackMint ? { mint: blackMint, owner: blackOwner } : null
    };
  } catch (error) {
    console.error('Error fetching opening owners:', error);
    // On error, assume platform gets the royalty
    return {
      white: whiteMint ? { mint: whiteMint, owner: null } : null,
      black: blackMint ? { mint: blackMint, owner: null } : null
    };
  }
} 