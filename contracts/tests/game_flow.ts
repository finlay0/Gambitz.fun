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
  let whiteOwner: Keypair;
  let blackOwner: Keypair;
  
  const stakeAmount = 0.1 * LAMPORTS_PER_SOL;

  beforeEach(async () => {
    // Generate fresh accounts for each test
    playerOne = Keypair.generate();
    playerTwo = Keypair.generate();
    platform = Keypair.generate();
    whiteOwner = Keypair.generate();
    blackOwner = Keypair.generate();

    // Airdrop SOL to test accounts
    await provider.connection.requestAirdrop(playerOne.publicKey, 2 * LAMPORTS_PER_SOL);
    await provider.connection.requestAirdrop(playerTwo.publicKey, 2 * LAMPORTS_PER_SOL);
    await provider.connection.requestAirdrop(platform.publicKey, 2 * LAMPORTS_PER_SOL);
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
      .submitResult(0) // Mate
      .accounts({
        playerOne: playerOne.publicKey,
        matchAccount: matchPda,
      })
      .signers([playerOne])
      .rpc();

    // Settle match
    await program.methods
      .settleMatch()
      .accounts({
        matchAccount: matchPda,
        winner: playerOne.publicKey,
        platform: platform.publicKey,
        whiteOwner: whiteOwner.publicKey,
        blackOwner: blackOwner.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    // Verify balances
    const winnerBalance = await provider.connection.getBalance(playerOne.publicKey);
    const platformBalance = await provider.connection.getBalance(platform.publicKey);
    const whiteOwnerBalance = await provider.connection.getBalance(whiteOwner.publicKey);
    const blackOwnerBalance = await provider.connection.getBalance(blackOwner.publicKey);

    expect(winnerBalance).to.equal(stakeAmount * 1.86); // 93%
    expect(platformBalance).to.equal(stakeAmount * 0.08); // 4%
    expect(whiteOwnerBalance).to.equal(stakeAmount * 0.03); // 1.5%
    expect(blackOwnerBalance).to.equal(stakeAmount * 0.03); // 1.5%
  });

  it('handles same opening owner', async () => {
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
        playerOne: playerOne.publicKey,
        matchAccount: matchPda,
      })
      .signers([playerOne])
      .rpc();

    // Settle match with same owner for both openings
    await program.methods
      .settleMatch()
      .accounts({
        matchAccount: matchPda,
        winner: playerOne.publicKey,
        platform: platform.publicKey,
        whiteOwner: whiteOwner.publicKey,
        blackOwner: whiteOwner.publicKey, // Same owner
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    // Verify balances
    const winnerBalance = await provider.connection.getBalance(playerOne.publicKey);
    const platformBalance = await provider.connection.getBalance(platform.publicKey);
    const ownerBalance = await provider.connection.getBalance(whiteOwner.publicKey);

    expect(winnerBalance).to.equal(stakeAmount * 1.86); // 93%
    expect(platformBalance).to.equal(stakeAmount * 0.08); // 4%
    expect(ownerBalance).to.equal(stakeAmount * 0.06); // 3% (both shares)
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
        playerOne: playerOne.publicKey,
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
          whiteOwner: whiteOwner.publicKey,
          blackOwner: blackOwner.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
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