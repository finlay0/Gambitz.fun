import { renderHook } from '@testing-library/react';
import { useHelius } from '../useHelius';
import { PublicKey } from '@solana/web3.js';

describe('useHelius', () => {
  const mockMint = new PublicKey('J1toso1uCkDRKNPGFpngVhpTFjYHanqcubmGcnNJY4p');
  const mockOwner = new PublicKey('HrixaAHeX1VHoYg4D4kL4Y3UaL2aH2zKq5jD6Xz7nFwZ');

  beforeEach(() => {
    // Mock fetch
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('fetches NFT owner', async () => {
    const mockResponse = {
      owner: mockOwner.toBase58()
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    const { result } = renderHook(() => useHelius());
    const owner = await result.current.getNFTOwner(mockMint);

    expect(owner).toEqual(mockOwner);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(`/nfts/${mockMint.toBase58()}`),
      expect.any(Object)
    );
  });

  it('handles API errors', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404
    });

    const { result } = renderHook(() => useHelius());
    
    try {
      await result.current.getNFTOwner(mockMint);
      expect.fail('Should have thrown error');
    } catch (e) {
      expect(e.message).toContain('Failed to fetch NFT owner');
    }
  });

  it('handles network errors', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useHelius());
    
    try {
      await result.current.getNFTOwner(mockMint);
      expect.fail('Should have thrown error');
    } catch (e) {
      expect(e.message).toContain('Network error');
    }
  });

  it('handles invalid mint address', async () => {
    const { result } = renderHook(() => useHelius());

    try {
      // Constructing an invalid PublicKey inside the try block so the test can catch the error
      const invalidMint = new PublicKey('invalid'); // This will throw
      await result.current.getNFTOwner(invalidMint);
      // If no error is thrown we explicitly fail the test
      expect.fail('Should have thrown error');
    } catch (e) {
      expect(e.message).toMatch(/Non-base58 character|Invalid (mint )?address/i);
    }
  });

  it('handles missing owner in response', async () => {
    const mockResponse = {};

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    const { result } = renderHook(() => useHelius());
    
    try {
      await result.current.getNFTOwner(mockMint);
      expect.fail('Should have thrown error');
    } catch (e) {
      expect(e.message).toContain('No owner found');
    }
  });

  it('handles rate limiting', async () => {
    const mockResponse = {
      error: 'Rate limit exceeded'
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: () => Promise.resolve(mockResponse)
    });

    const { result } = renderHook(() => useHelius());
    
    try {
      await result.current.getNFTOwner(mockMint);
      expect.fail('Should have thrown error');
    } catch (e) {
      expect(e.message).toContain('Rate limit exceeded');
    }
  });

  it('handles API timeout', async () => {
    jest.useFakeTimers();

    (global.fetch as jest.Mock).mockImplementationOnce(() => 
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 1000)
      )
    );

    const { result } = renderHook(() => useHelius());

    const promise = result.current.getNFTOwner(mockMint);

    // Fast-forward the timer so the promise rejects immediately
    jest.advanceTimersByTime(1000);

    await expect(promise).rejects.toThrow('Timeout');

    jest.useRealTimers();
  });
}); 