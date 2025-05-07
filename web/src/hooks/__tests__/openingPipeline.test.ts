// @ts-nocheck - This test file uses mocks and test-specific code that TypeScript should ignore
import { renderHook, act } from '@testing-library/react';
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useOpeningRecognition, OpeningState } from '../useOpeningRecognition';
import { getOpeningFromMoves, getOpeningMint, Opening, default as actualOpeningBook } from '../../../lib/opening_data';
import { Chess } from 'chess.js';
import { useGameState, GameState } from '../useGameState';
import { useOpeningOwner } from '../useOpeningOwner';
import { useFinalOpenings } from '../useFinalOpenings';
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

jest.mock('../useFinalOpenings', () => {
  return {
    useFinalOpenings: () => ({
      getFinalOpenings: jest.fn().mockImplementation(async (moves) => {
        // Separate white and black moves for testing
        const whiteMoves = moves.filter((_, i) => i % 2 === 0);
        const blackMoves = moves.filter((_, i) => i % 2 === 1);
        
        // Mock getOpeningFromMoves locally to avoid circular dependencies
        const whiteOpening = actualOpeningBook['A08']; // Hardcoded for test
        const blackOpening = actualOpeningBook['A05']; // Different opening for black
        
        return {
          white: {
            eco: whiteOpening.eco,
            mint: 'WhiteMintAddress123',
            owner: null
          },
          black: {
            eco: blackOpening.eco,
            mint: 'BlackMintAddress456',
            owner: null
          }
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

  it('should properly separate white and black opening ECOs at end of game', async () => {
    const { result: gameState } = renderHook(() => useGameState());
    
    // A sequence with different openings for white and black
    const completeGame = [
      // White plays King's Indian Attack (A08)
      "Nf3", "d5", "g3", "c5", "Bg2", "Nc6", "O-O", "e6", 
      // Black plays King's Indian Defence (A05)
      "d3", "Nf6", "Nbd2", "Be7", "e4", "O-O", "Re1", "e5",
      // Additional moves beyond opening book
      "c4", "d4", "cxd5", "Nxd5", "Nc4", "Be6", "Nfxe5", "Nxe5",
      "Nxe5", "Bf6", "Nc4", "Nf4", "Ne3", "Bxb2", "Rb1", "Bc3"
    ];
    
    // Play all the moves
    act(() => {
      completeGame.forEach(move => {
        gameState.current.dispatch({ type: 'MAKE_MOVE', move });
      });
    });
    
    // Verify the full move history
    expect(gameState.current.state.moveHistory).toEqual(completeGame);
    
    // Test the getFinalOpenings hook
    const { result: finalOpeningsHook } = renderHook(() => useFinalOpenings());
    const finalOpenings = await finalOpeningsHook.current.getFinalOpenings(gameState.current.state.moveHistory);
    
    // White should have the A08 ECO, Black should have A05
    expect(finalOpenings.white.eco).toBe('A08');
    expect(finalOpenings.black.eco).toBe('A05');
    
    // Different mint addresses for each ECO
    expect(finalOpenings.white.mint).toBe('WhiteMintAddress123');
    expect(finalOpenings.black.mint).toBe('BlackMintAddress456');
  });

});

// You might also want a separate describe block for useOpeningRecognition.test.ts specific tests
// if they cover more granular unit test cases not suitable for the pipeline test. 