import { useState } from 'react';

// 1 SOL = 1e9 lamports
const LAMPORTS_PER_SOL = 1_000_000_000;

// Convert SOL to lamports
const solToLamports = (sol: number): number => sol * LAMPORTS_PER_SOL;

export const useStakeSelector = () => {
  // Default stake is 0.02 SOL in lamports
  const [stakeLamports, setStakeLamports] = useState<number>(solToLamports(0.02));

  // Presets in SOL converted to lamports
  const presets = [0.01, 0.05, 0.1, 0.25, 0.5].map(solToLamports);

  return [stakeLamports, setStakeLamports, presets] as const;
};

// Type for the hook return value
export type UseStakeSelectorReturn = ReturnType<typeof useStakeSelector>;
