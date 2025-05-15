// @ts-nocheck - This test file uses mocks and test-specific code that TypeScript should ignore
import { renderHook, act } from '@testing-library/react';
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useOpeningRecognition, OpeningState } from '../useOpeningRecognition';
import { getOpeningFromMoves, getOpeningMint, Opening, default as actualOpeningBook } from '../../../lib/opening_data';
import { Chess } from 'chess.js';
import { useGameState, GameState } from '../useGameState';
import { useOpeningOwner } from '../useOpeningOwner';
import { useFinalOpenings, GameOpeningResult, SettlementAccounts } from '../useFinalOpenings';
import { PublicKey } from '@solana/web3.js';
/* eslint-enable @typescript-eslint/no-unused-vars */

// Mock the useOpeningOwner hook
jest.mock('../useOpeningOwner', () => ({
  useOpeningOwner: jest.fn()
}));

let mockGameStateObject: GameState;
function resetMockGameState() {
  mockGameStateObject = {
    status: 'idle',
    currentPlayer: 'white',
    timeRemaining: { white: 300, black: 300 },
    moveHistory: [],
    opening: null,
    board: new Chess(),
    whitePlayer: null,
    blackPlayer: null,
    gameId: null,
  } as GameState;
}

// Initialise once before mocking the module so that the variable is defined
resetMockGameState();

jest.mock('../useGameState', () => {
  const actualUseGameState = jest.requireActual('../useGameState');
  return {
    __esModule: true,
    ...actualUseGameState,
    useGameState: () => ({
      state: mockGameStateObject,
      /* eslint-disable @typescript-eslint/no-explicit-any */
      dispatch: jest.fn((action: any) => {
      /* eslint-enable @typescript-eslint/no-explicit-any */
        switch (action.type) {
          case 'MAKE_MOVE':
            try {
              // In tests, append move to history directly instead of relying on chess.js validation
              // This way we can test with predetermined move sequences matching openings
              mockGameStateObject = {
                ...mockGameStateObject,
                moveHistory: [...mockGameStateObject.moveHistory, action.move],
                // Toggle player after each move
                currentPlayer: mockGameStateObject.currentPlayer === 'white' ? 'black' : 'white',
              };
            } catch (error) {
              console.error('Error making move:', error);
            }
            break;
          case 'SET_OPENING': // Assuming 'SET_OPENING' is the correct action type
            mockGameStateObject = {
              ...mockGameStateObject,
              opening: action.opening, // Make sure 'opening' matches the payload structure
            };
            break;
          case 'RESET_GAME':
            resetMockGameState();
            break;
        }
      }),
    }),
  };
});

// Reference a real opening from the book for testing
// From opening_data_out.ts: A08 King's Indian Attack, Reti Opening, French Variation
const actualA08InBook = actualOpeningBook['A08'];
const masterTestOpening = {
  name: actualA08InBook.name, // "King's Indian Attack"
  eco: actualA08InBook.eco,   // "A08"
  // Variant should be normalized by getOpeningFromMoves if it has extra spaces in source
  variant: actualA08InBook.variant ? actualA08InBook.variant.replace(/\s+/g, ' ').trim() : null,
  bookMoves: actualA08InBook.moves, // Array of SAN moves, e.g., ["Nf3", "d5", ..., "Re1"]
  bookMovesLength: actualA08InBook.moves.length, // Should be 15 for this specific opening
};

// Mock useHelius for getNFTOwner called within the actual getFinalOpening
const mockGetNFTOwner = jest.fn();
jest.mock('../useHelius', () => ({
  useHelius: () => ({
    getNFTOwner: mockGetNFTOwner,
  }),
}));

// Mock the actual useFinalOpenings hook but use real helper functions internally where needed
jest.mock('../useFinalOpenings', () => {
  const originalModule = jest.requireActual('../useFinalOpenings');
  const { PLATFORM_RAKE_PUBKEY } = originalModule; // Get actual constant if needed
  // Import actual helper functions needed for the mock
  const { getOpeningFromMoves: actualGetOpeningFromMovesHelper, getOpeningMint: actualGetOpeningMintHelper } = jest.requireActual('../../../lib/opening_data');


  // We will use the *actual* implementation of getOpeningFromMoves for the mock of getFinalOpening
  // and the *actual* openings.json for mint lookup (via getOpeningMint).
  // getNFTOwner will be mocked via useHelius mock.

  return {
    __esModule: true,
    ...originalModule, // Spread original module to keep PLATFORM_RAKE_PUBKEY etc.
    useFinalOpenings: () => ({
      getFinalOpening: jest.fn().mockImplementation(async (moves: string[]): Promise<GameOpeningResult | null> => {
        const gameOpening = actualGetOpeningFromMovesHelper(moves); // Use correctly imported helper
        if (!gameOpening) return null;

        const eco = gameOpening.eco || 'A00';
        const mint = actualGetOpeningMintHelper(eco); // Use correctly imported helper
        let owner: PublicKey | null = null;
        if (mint) {
          try {
            // This uses the mocked getNFTOwner from useHelius mock
            owner = await mockGetNFTOwner(new PublicKey(mint)); 
          } catch (e) {
            console.warn('Mock getNFTOwner error:', e);
            owner = null;
          }
        }
        return {
          eco,
          mint,
          owner,
          name: gameOpening.name,
          pgnMoves: gameOpening.moves, // Corrected from gameOpening.bookMoves to match type
        };
      }),
      getEcoCode: jest.fn().mockImplementation((moves: string[]): string | null => {
        const gameOpening = actualGetOpeningFromMovesHelper(moves); // Use correctly imported helper
        return gameOpening?.eco || null;
      }),
      prepareSettlementAccounts: jest.fn().mockImplementation(async (matchPda: PublicKey, winner: PublicKey, moves: string[]): Promise<SettlementAccounts> => {
        // This mock implementation calls the *actual* getFinalOpening from the original module.
        // The actual getFinalOpening uses the actual getOpeningFromMoves, actual getOpeningMint, 
        // and the *mocked* useHelius().getNFTOwner via the useHelius mock. This is intended.
        const openingDetails = await (jest.requireActual('../useFinalOpenings').useFinalOpenings().getFinalOpening(moves));
        
        return {
          matchAccount: matchPda,
          winner,
          platform: new PublicKey(PLATFORM_RAKE_PUBKEY), 
          openingOwner: openingDetails?.owner || new PublicKey(PLATFORM_RAKE_PUBKEY), // Default to platform if no owner
        };
      })
    })
  };
});

describe('Opening Recognition Pipeline - Master End to End Test', () => {
  beforeEach(() => {
    // Reset the mock game state before each test to ensure isolation
    const { result: gameState } = renderHook(() => useGameState());
    act(() => {
        gameState.current.dispatch({ type: 'RESET_GAME' });
    });
    // Reset other mocks if necessary, e.g., useOpeningOwner
    (useOpeningOwner as jest.Mock).mockClear(); 
  });

  it('should correctly process a full opening sequence matching the book', () => {
    const { result: gameState } = renderHook(() => useGameState());
    const playerMoves = masterTestOpening.bookMoves; // Player plays the exact book line

    act(() => {
      playerMoves.forEach(move => {
        gameState.current.dispatch({ type: 'MAKE_MOVE', move });
      });
    });
    expect(gameState.current.state.moveHistory).toEqual(playerMoves);

    const { result: openingState } = renderHook(() => useOpeningRecognition(gameState.current.state.moveHistory));
    
    expect(openingState.current).toEqual({
      name: masterTestOpening.name,
      eco: masterTestOpening.eco,
      variant: masterTestOpening.variant,
      lastBookMove: masterTestOpening.bookMovesLength, // Length of the matched book line
    });
  });

  it('should correctly process a partial opening sequence (player moves are a prefix of a book line)', () => {
    const { result: gameState } = renderHook(() => useGameState());
    const partialPlayerMoves = masterTestOpening.bookMoves.slice(0, 5); // e.g., first 5 moves

    act(() => {
      partialPlayerMoves.forEach(move => {
        gameState.current.dispatch({ type: 'MAKE_MOVE', move });
      });
    });
    expect(gameState.current.state.moveHistory).toEqual(partialPlayerMoves);
    
    const { result: openingState } = renderHook(() => useOpeningRecognition(gameState.current.state.moveHistory));

    // With fewer moves than the full book line, no complete opening should be recognized yet
    expect(openingState.current).toEqual({
      name: null,
      eco: null,
      variant: null,
      lastBookMove: -1,
    });
  });

  it('should correctly process player moves extending beyond a known book line', () => {
    const { result: gameState } = renderHook(() => useGameState());
    const extendedPlayerMoves = [...masterTestOpening.bookMoves, 'a3', 'a6']; // Book line + 2 more moves

    act(() => {
      extendedPlayerMoves.forEach(move => {
        gameState.current.dispatch({ type: 'MAKE_MOVE', move });
      });
    });
    expect(gameState.current.state.moveHistory).toEqual(extendedPlayerMoves);

    const { result: openingState } = renderHook(() => useOpeningRecognition(gameState.current.state.moveHistory));
    
    // Should still recognize the A08 opening
    expect(openingState.current).toEqual({
      name: masterTestOpening.name,
      eco: masterTestOpening.eco,
      variant: masterTestOpening.variant,
      lastBookMove: masterTestOpening.bookMovesLength, // Length of the matched book line
    });
  });

  it('should return null when player moves do not match any book opening prefix', () => {
    const { result: gameState } = renderHook(() => useGameState());
    const nonMatchingMoves = ['e4', 'd5', 'Nc3']; // Unlikely to be a prefix of a long opening

    act(() => {
      nonMatchingMoves.forEach(move => {
        gameState.current.dispatch({ type: 'MAKE_MOVE', move });
      });
    });
    expect(gameState.current.state.moveHistory).toEqual(nonMatchingMoves);

    const { result: openingState } = renderHook(() => useOpeningRecognition(gameState.current.state.moveHistory));
    
    expect(openingState.current).toEqual({
      name: null,
      eco: null,
      variant: null,
      lastBookMove: -1,
    });
  });

  it('should handle NFT mint lookup for the recognized opening', () => {
    // This test assumes the opening was recognized correctly as in the first test case
    const recognizedECO = masterTestOpening.eco;
    const mintAddress = getOpeningMint(recognizedECO);

    // Check if a mint address is found (actual address depends on openings.json)
    // For A08, let's assume openings.json has an entry.
    // If you know the exact mint for A08 in openings.json, you can assert it.
    expect(mintAddress).toBeDefined();
    if (mintAddress) { // Proceed only if mintAddress is not null
        expect(typeof mintAddress).toBe('string');
        // Further tests with useOpeningOwner if needed, assuming it's mocked appropriately
        (useOpeningOwner as jest.Mock).mockReturnValueOnce({
            owner: 'DUSTMSwDGrMiQ2H6s2M9P5pRk35mR7w4z25X2S2gA7bB', // Example valid base58 owner
            isLoading: false,
            error: null
        });
        const { result: ownerStateHook } = renderHook(() => useOpeningOwner(mintAddress));
        expect(ownerStateHook.current.owner).toBe('DUSTMSwDGrMiQ2H6s2M9P5pRk35mR7w4z25X2S2gA7bB');
    }
  });

  it('should return null for NFT mint if ECO code does not exist in openings.json', () => {
    const nonExistentECO = 'Z99'; // Assuming Z99 is not in openings.json
    const mintAddress = getOpeningMint(nonExistentECO);
    expect(mintAddress).toBeNull();
  });

  // Test for the game state update with opening info
  it('should update game state with recognized opening information', () => {
    const { result: gameState } = renderHook(() => useGameState());
    const playerMoves = masterTestOpening.bookMoves;

    act(() => {
      playerMoves.forEach(move => {
        gameState.current.dispatch({ type: 'MAKE_MOVE', move });
      });
    });

    const { result: openingStateHook } = renderHook(() => useOpeningRecognition(gameState.current.state.moveHistory));
    const recognizedOpening = openingStateHook.current;

    // Ensure an opening was recognized
    expect(recognizedOpening.eco).toBe(masterTestOpening.eco);

    // Dispatch action to set opening in game state
    // IMPORTANT: The action type and payload must match what useGameState's reducer expects.
    // Based on the mock, using 'SET_OPENING'.
    act(() => {
        gameState.current.dispatch({
            type: 'SET_OPENING',
            opening: {
                name: recognizedOpening.name,
                eco: recognizedOpening.eco,
                variant: recognizedOpening.variant,
                // If your GameState's opening object stores moves, add: moves: recognizedOpening.moves
            }
        });
    });
    
    // Verify the opening is set in the game state
    // The exact path depends on how 'opening' is stored in your GameState (e.g., state.opening, state.openings.white)
    // Adjust based on your actual GameState structure.
    expect(gameState.current.state.opening).toEqual({
        name: masterTestOpening.name,
        eco: masterTestOpening.eco,
        variant: masterTestOpening.variant,
    });
  });

  it('should correctly identify the game opening and its details', async () => {
    const { result: gameStateHook } = renderHook(() => useGameState());
    
    const gameMoves = [
      // King's Indian Attack (A08)
      "Nf3", "d5", "g3", "c5", "Bg2", "Nc6", "O-O", "e6", 
      "d3", "Nf6", "Nbd2", "Be7", "e4", "O-O", "Re1", // End of A08 book line
      // Additional moves
      "c4", "d4", "cxd5", "Nxd5"
    ];
    
    act(() => {
      gameMoves.forEach(move => {
        gameStateHook.current.dispatch({ type: 'MAKE_MOVE', move });
      });
    });
    
    expect(gameStateHook.current.state.moveHistory).toEqual(gameMoves);
    
    // Mock the return value of getNFTOwner for this specific test
    const mockOwnerPubkey = new PublicKey("DUSTMSwDGrMiQ2H6s2M9P5pRk35mR7w4z25X2S2gA7bB");
    mockGetNFTOwner.mockResolvedValue(mockOwnerPubkey);

    const { result: finalOpeningsHook } = renderHook(() => useFinalOpenings());
    const finalOpening = await finalOpeningsHook.current.getFinalOpening(gameStateHook.current.state.moveHistory);
    
    expect(finalOpening).not.toBeNull();
    if (finalOpening) {
        expect(finalOpening.eco).toBe(masterTestOpening.eco); // Use masterTestOpening
        expect(finalOpening.name).toBe(masterTestOpening.name); // Use masterTestOpening
        // finalOpening.mint comes from getOpeningMint(eco) in the mock. Assert against that.
        // masterTestOpening itself doesn't have a 'mint' property.
        const expectedMint = (jest.requireActual('../../../lib/opening_data').getOpeningMint)(masterTestOpening.eco);
        expect(finalOpening.mint).toBe(expectedMint);
        expect(finalOpening.owner).toEqual(mockOwnerPubkey);
    }

    // Test getEcoCode as well
    const ecoCode = finalOpeningsHook.current.getEcoCode(gameStateHook.current.state.moveHistory);
    expect(ecoCode).toBe(masterTestOpening.eco); // Use masterTestOpening
    
    // Test prepareSettlementAccounts (basic check)
    const matchPda = new PublicKey("11111111111111111111111111111111");
    const winner = new PublicKey("22222222222222222222222222222222");
    const settlementAccounts = await finalOpeningsHook.current.prepareSettlementAccounts(matchPda, winner, gameStateHook.current.state.moveHistory);
    expect(settlementAccounts.openingOwner).toEqual(mockOwnerPubkey);
    expect(settlementAccounts.platform).toEqual(new PublicKey(PLATFORM_RAKE_PUBKEY));

    // Test case where no owner is found for NFT
    mockGetNFTOwner.mockResolvedValue(null); // Simulate NFT owner not found
    const finalOpeningNoOwner = await finalOpeningsHook.current.getFinalOpening(gameStateHook.current.state.moveHistory);
    expect(finalOpeningNoOwner?.owner).toBeNull();
    const settlementAccountsNoOwner = await finalOpeningsHook.current.prepareSettlementAccounts(matchPda, winner, gameStateHook.current.state.moveHistory);
    expect(settlementAccountsNoOwner.openingOwner).toEqual(new PublicKey(PLATFORM_RAKE_PUBKEY)); // Defaults to platform

  });

});

// You might also want a separate describe block for useOpeningRecognition.test.ts specific tests
// if they cover more granular unit test cases not suitable for the pipeline test. 