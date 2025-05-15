import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Wager } from '../target/types/wager';
import { PublicKey, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { expect } from 'chai';

describe('game_flow', () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Wager as Program<Wager>;
  
  // Test accounts
  let playerOne: Keypair;
  let playerTwo: Keypair;
  let platform: Keypair;
  let openingNftOwner: Keypair;
  
  const stakeAmount = 0.1 * LAMPORTS_PER_SOL;
  const totalPot = stakeAmount * 2;

  beforeEach(async () => {
    // Generate fresh accounts for each test
    playerOne = Keypair.generate();
    playerTwo = Keypair.generate();
    platform = Keypair.generate();
    openingNftOwner = Keypair.generate();

    // Airdrop SOL to test accounts
    const airdropPlayerOne = provider.connection.requestAirdrop(playerOne.publicKey, 2 * LAMPORTS_PER_SOL);
    const airdropPlayerTwo = provider.connection.requestAirdrop(playerTwo.publicKey, 2 * LAMPORTS_PER_SOL);
    const airdropPlatform = provider.connection.requestAirdrop(platform.publicKey, 2 * LAMPORTS_PER_SOL);
    const airdropOpeningOwner = provider.connection.requestAirdrop(openingNftOwner.publicKey, 2 * LAMPORTS_PER_SOL);
    
    await Promise.all([airdropPlayerOne, airdropPlayerTwo, airdropPlatform, airdropOpeningOwner]);
    await new Promise(resolve => setTimeout(resolve, 500));
  });

  it('creates and confirms match', async () => {
    // Create match
    const [matchPda] = await PublicKey.findProgramAddress(
      [Buffer.from('chessbets'), playerOne.publicKey.toBuffer(), playerTwo.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .createMatch(new anchor.BN(stakeAmount))
      .accounts({
        playerOne: playerOne.publicKey,
        playerTwo: playerTwo.publicKey,
        matchAccount: matchPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([playerOne])
      .rpc();

    // Confirm match
    await program.methods
      .confirmMatch()
      .accounts({
        playerTwo: playerTwo.publicKey,
        matchAccount: matchPda,
      })
      .signers([playerTwo])
      .rpc();

    // Verify match state
    const matchAccount = await program.account.match.fetch(matchPda);
    expect(matchAccount.isConfirmed).to.be.true;
    expect(matchAccount.stakeLamports.toNumber()).to.equal(stakeAmount);
  });

  it('handles confirmation window expiry', async () => {
    // Create match
    const [matchPda] = await PublicKey.findProgramAddress(
      [Buffer.from('chessbets'), playerOne.publicKey.toBuffer(), playerTwo.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .createMatch(new anchor.BN(stakeAmount))
      .accounts({
        playerOne: playerOne.publicKey,
        playerTwo: playerTwo.publicKey,
        matchAccount: matchPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([playerOne])
      .rpc();

    // Wait for confirmation window to expire
    await new Promise(resolve => setTimeout(resolve, 11000));

    // Try to confirm - should fail
    try {
      await program.methods
        .confirmMatch()
        .accounts({
          playerTwo: playerTwo.publicKey,
          matchAccount: matchPda,
        })
        .signers([playerTwo])
        .rpc();
      expect.fail('Should have thrown error');
    } catch (e) {
      expect(e.toString()).to.include('ConfirmationWindowExpired');
    }
  });

  it('handles game settlement with opening royalties', async () => {
    // Create and confirm match
    const [matchPda] = await PublicKey.findProgramAddress(
      [Buffer.from('chessbets'), playerOne.publicKey.toBuffer(), playerTwo.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .createMatch(new anchor.BN(stakeAmount))
      .accounts({
        playerOne: playerOne.publicKey,
        playerTwo: playerTwo.publicKey,
        matchAccount: matchPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([playerOne])
      .rpc();

    await program.methods
      .confirmMatch()
      .accounts({
        playerTwo: playerTwo.publicKey,
        matchAccount: matchPda,
      })
      .signers([playerTwo])
      .rpc();

    // Submit result
    await program.methods
      .submitResult(0) // Mate, playerOne wins
      .accounts({
        signer: playerOne.publicKey,
        matchAccount: matchPda,
      })
      .signers([playerOne])
      .rpc();

    // Get initial balances before settlement for accurate delta checking
    const initialWinnerBalance = await provider.connection.getBalance(playerOne.publicKey);
    const initialPlayerTwoBalance = await provider.connection.getBalance(playerTwo.publicKey); // For completeness, though P2 is not winner here
    const initialPlatformBalance = await provider.connection.getBalance(platform.publicKey);
    const initialOpeningNftOwnerBalance = await provider.connection.getBalance(openingNftOwner.publicKey);

    // Settle match
    await program.methods
      .settleMatch()
      .accounts({
        matchAccount: matchPda,
        winner: playerOne.publicKey, // playerOne is the winner
        platform: platform.publicKey,
        openingOwner: openingNftOwner.publicKey, // Single opening owner
        playerOneAccount: playerOne.publicKey, // Required by struct
        playerTwoAccount: playerTwo.publicKey, // Required by struct
        systemProgram: anchor.web3.SystemProgram.programId,
        signer: provider.wallet.publicKey, // Anyone can call settle
      })
      .rpc();

    // Verify balances after settlement
    const finalWinnerBalance = await provider.connection.getBalance(playerOne.publicKey);
    const finalPlatformBalance = await provider.connection.getBalance(platform.publicKey);
    const finalOpeningNftOwnerBalance = await provider.connection.getBalance(openingNftOwner.publicKey);
    const finalPlayerTwoBalance = await provider.connection.getBalance(playerTwo.publicKey);

    // Winner gets 93% of total pot
    expect(finalWinnerBalance).to.equal(initialWinnerBalance + totalPot * 0.93);
    // Platform gets 4% of total pot
    expect(finalPlatformBalance).to.equal(initialPlatformBalance + totalPot * 0.04);
    // Opening NFT owner gets 3% of total pot
    expect(finalOpeningNftOwnerBalance).to.equal(initialOpeningNftOwnerBalance + totalPot * 0.03);
    // Player two (loser) balance should be unchanged by settlement payouts
    expect(finalPlayerTwoBalance).to.equal(initialPlayerTwoBalance);
  });

  it('handles game settlement with opening royalties (DRAW)', async () => {
    // Create and confirm match
    const [matchPda] = await PublicKey.findProgramAddress(
      [Buffer.from('chessbets'), playerOne.publicKey.toBuffer(), playerTwo.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .createMatch(new anchor.BN(stakeAmount))
      .accounts({
        playerOne: playerOne.publicKey,
        playerTwo: playerTwo.publicKey,
        matchAccount: matchPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([playerOne])
      .rpc();

    await program.methods
      .confirmMatch()
      .accounts({
        playerTwo: playerTwo.publicKey, // playerTwo confirms
        matchAccount: matchPda,
      })
      .signers([playerTwo])
      .rpc();

    // Submit result as a DRAW (e.g., playerOne submits it, could be either)
    // ResultType::Draw is 4
    await program.methods
      .submitResult(4) 
      .accounts({
        signer: playerOne.publicKey, 
        matchAccount: matchPda,
      })
      .signers([playerOne])
      .rpc();

    // Get initial balances before settlement
    const initialPlayerOneBalance = await provider.connection.getBalance(playerOne.publicKey);
    const initialPlayerTwoBalance = await provider.connection.getBalance(playerTwo.publicKey);
    const initialPlatformBalance = await provider.connection.getBalance(platform.publicKey);
    const initialOpeningNftOwnerBalance = await provider.connection.getBalance(openingNftOwner.publicKey);

    // Settle match for a DRAW
    await program.methods
      .settleMatch()
      .accounts({
        matchAccount: matchPda,
        winner: anchor.web3.SystemProgram.programId, // Winner is SystemProgram for draws
        platform: platform.publicKey,
        openingOwner: openingNftOwner.publicKey,
        playerOneAccount: playerOne.publicKey, // Payout to player one
        playerTwoAccount: playerTwo.publicKey, // Payout to player two
        systemProgram: anchor.web3.SystemProgram.programId,
        signer: provider.wallet.publicKey, // Anyone can call settle
      })
      .rpc();

    // Verify balances after settlement for a DRAW
    const finalPlayerOneBalance = await provider.connection.getBalance(playerOne.publicKey);
    const finalPlayerTwoBalance = await provider.connection.getBalance(playerTwo.publicKey);
    const finalPlatformBalance = await provider.connection.getBalance(platform.publicKey);
    const finalOpeningNftOwnerBalance = await provider.connection.getBalance(openingNftOwner.publicKey);

    const expectedPlayerShare = totalPot * 0.93 / 2; // Each player gets 46.5% of total pot
    const expectedPlatformShare = totalPot * 0.04;
    const expectedRoyaltyShare = totalPot * 0.03;

    expect(finalPlayerOneBalance).to.equal(initialPlayerOneBalance + expectedPlayerShare);
    expect(finalPlayerTwoBalance).to.equal(initialPlayerTwoBalance + expectedPlayerShare);
    expect(finalPlatformBalance).to.equal(initialPlatformBalance + expectedPlatformShare);
    expect(finalOpeningNftOwnerBalance).to.equal(initialOpeningNftOwnerBalance + expectedRoyaltyShare);
  });

  it('handles settlement failure', async () => {
    // Create and confirm match
    const [matchPda] = await PublicKey.findProgramAddress(
      [Buffer.from('chessbets'), playerOne.publicKey.toBuffer(), playerTwo.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .createMatch(new anchor.BN(stakeAmount))
      .accounts({
        playerOne: playerOne.publicKey,
        playerTwo: playerTwo.publicKey,
        matchAccount: matchPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([playerOne])
      .rpc();

    await program.methods
      .confirmMatch()
      .accounts({
        playerTwo: playerTwo.publicKey,
        matchAccount: matchPda,
      })
      .signers([playerTwo])
      .rpc();

    // Submit result
    await program.methods
      .submitResult(0) // Mate
      .accounts({
        signer: playerOne.publicKey,
        matchAccount: matchPda,
      })
      .signers([playerOne])
      .rpc();

    // Try to settle with invalid platform account
    try {
      await program.methods
        .settleMatch()
        .accounts({
          matchAccount: matchPda,
          winner: playerOne.publicKey,
          platform: Keypair.generate().publicKey, // Invalid platform
          openingOwner: openingNftOwner.publicKey,
          playerOneAccount: playerOne.publicKey,
          playerTwoAccount: playerTwo.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
          signer: provider.wallet.publicKey,
        })
        .rpc();
      expect.fail('Should have thrown error');
    } catch (e) {
      expect(e.toString()).to.include('InvalidPlatform');
    }

    // Verify funds still in escrow
    const matchBalance = await provider.connection.getBalance(matchPda);
    expect(matchBalance).to.equal(stakeAmount * 2);
  });
}); 