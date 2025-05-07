import { renderHook } from '@testing-library/react';
import { useOpeningRecognition } from '../useOpeningRecognition';
import { getOpeningFromMoves, getOpeningMint, default as openingBook } from '../../../lib/opening_data';

describe('Opening Recognition Pipeline', () => {
  // Use the actual A08 opening from the generated opening book to ensure test consistency
  const testOpening = (() => {
    const A08 = openingBook['A08'];
    return {
      name: A08.name,
      eco: A08.eco,
      // Normalize variant whitespace to match hook output
      variant: A08.variant ? A08.variant.replace(/\s+/g, ' ').trim() : null,
      moves: A08.moves,
    };
  })();

  describe('useOpeningRecognition Hook', () => {
    it('should recognize a complete opening sequence', () => {
      const { result } = renderHook(() => useOpeningRecognition(testOpening.moves));
      
      expect(result.current).toEqual({
        name: testOpening.name,
        eco: testOpening.eco,
        variant: testOpening.variant,
        lastBookMove: testOpening.moves.length
      });
    });

    it('should recognize a partial opening sequence', () => {
      const partialMoves = testOpening.moves.slice(0, 8);
      const { result } = renderHook(() => useOpeningRecognition(partialMoves));
      
      expect(result.current).toEqual({
        name: null,
        eco: null,
        variant: null,
        lastBookMove: -1
      });
    });

    it('should return null for non-matching moves', () => {
      const nonMatchingMoves = ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'b4'];
      const { result } = renderHook(() => useOpeningRecognition(nonMatchingMoves));
      
      expect(result.current).toEqual({
        name: null,
        eco: null,
        variant: null,
        lastBookMove: -1
      });
    });

    it('should handle empty move list', () => {
      const { result } = renderHook(() => useOpeningRecognition([]));
      
      expect(result.current).toEqual({
        name: null,
        eco: null,
        variant: null,
        lastBookMove: -1
      });
    });

    it('should handle invalid move formats', () => {
      const invalidMoves = ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'b4', 'Bxb4', 'c3', 'Ba5', 'd4', 'exd4', 'O-O'];
      const { result } = renderHook(() => useOpeningRecognition(invalidMoves));
      
      expect(result.current).toEqual({
        name: null,
        eco: null,
        variant: null,
        lastBookMove: -1
      });
    });

    it('should handle move order variations', () => {
      const transposedMoves = [...testOpening.moves];
      // Swap first two moves to test transposition
      [transposedMoves[0], transposedMoves[1]] = [transposedMoves[1], transposedMoves[0]];
      const { result } = renderHook(() => useOpeningRecognition(transposedMoves));
      
      expect(result.current).toEqual({
        name: null,
        eco: null,
        variant: null,
        lastBookMove: -1
      });
    });
  });

  describe('Opening Data Functions', () => {
    it('should get opening from moves', () => {
      const opening = getOpeningFromMoves(testOpening.moves);
      expect(opening).toEqual({
        name: testOpening.name,
        eco: testOpening.eco,
        variant: testOpening.variant,
        moves: expect.any(Array)
      });
    });

    it('should get opening mint address', () => {
      const mint = getOpeningMint(testOpening.eco);
      expect(mint).toBeDefined();
      expect(typeof mint).toBe('string');
    });
  });

  describe('Error Handling', () => {
    it('should handle undefined moves', () => {
      const { result } = renderHook(() => useOpeningRecognition(undefined));
      expect(result.current).toEqual({
        name: null,
        eco: null,
        variant: null,
        lastBookMove: -1
      });
    });

    it('should handle null moves', () => {
      const { result } = renderHook(() => useOpeningRecognition(null));
      expect(result.current).toEqual({
        name: null,
        eco: null,
        variant: null,
        lastBookMove: -1
      });
    });
  });
}); 