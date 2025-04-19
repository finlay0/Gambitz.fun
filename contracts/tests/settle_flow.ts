import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Wager, ResultType } from "../target/types/wager";
import { assert } from "chai";

describe("settle_flow", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Wager as Program<Wager>;

  // Constants
  const STAKE_AMOUNT = new anchor.BN(0.1 * anchor.web3.LAMPORTS_PER_SOL);
  const EXPECTED_WINNER_PAYOUT = new anchor.BN(0.18 * anchor.web3.LAMPORTS_PER_SOL);
  const EXPECTED_PLATFORM_PAYOUT = new anchor.BN(0.008 * anchor.web3.LAMPORTS_PER_SOL);
  const PLATFORM_KEY = new anchor.web3.PublicKey("11111111111111111111111111111111");

  // Accounts
  let playerOne: anchor.web3.Keypair;
  let playerTwo: anchor.web3.Keypair;
  let matchPda: anchor.web3.PublicKey;
  let matchBump: number;

  before(async () => {
    // Generate keypairs for players
    playerOne = anchor.web3.Keypair.generate();
    playerTwo = anchor.web3.Keypair.generate();

    // Airdrop SOL to players
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(
        playerOne.publicKey,
        1 * anchor.web3.LAMPORTS_PER_SOL
      )
    );
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(
        playerTwo.publicKey,
        1 * anchor.web3.LAMPORTS_PER_SOL
      )
    );

    // Find PDA for match account
    [matchPda, matchBump] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("chessbets"),
        playerOne.publicKey.toBuffer(),
        playerTwo.publicKey.toBuffer(),
      ],
      program.programId
    );
  });

  it("Runs through complete match flow", async () => {
    // 1. Create match
    await program.methods
      .createMatch(STAKE_AMOUNT)
      .accounts({
        playerOne: playerOne.publicKey,
        playerTwo: playerTwo.publicKey,
        matchAccount: matchPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([playerOne, playerTwo])
      .rpc();

    // 2. Confirm match
    await program.methods
      .confirmMatch()
      .accounts({
        playerOne: playerOne.publicKey,
        playerTwo: playerTwo.publicKey,
        matchAccount: matchPda,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([playerOne, playerTwo])
      .rpc();

    // 3. Submit result (player one wins by mate)
    await program.methods
      .submitResult(ResultType.Mate)
      .accounts({
        signer: playerOne.publicKey,
        matchAccount: matchPda,
      })
      .signers([playerOne])
      .rpc();

    // Get initial balances
    const initialWinnerBalance = await provider.connection.getBalance(playerOne.publicKey);
    const initialPlatformBalance = await provider.connection.getBalance(PLATFORM_KEY);

    // 4. Settle match
    await program.methods
      .settleMatch()
      .accounts({
        signer: provider.wallet.publicKey,
        matchAccount: matchPda,
        winner: playerOne.publicKey,
        platform: PLATFORM_KEY,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    // Get final balances
    const finalWinnerBalance = await provider.connection.getBalance(playerOne.publicKey);
    const finalPlatformBalance = await provider.connection.getBalance(PLATFORM_KEY);

    // Calculate balance differences using BN
    const winnerBalanceDiff = new anchor.BN(finalWinnerBalance - initialWinnerBalance);
    const platformBalanceDiff = new anchor.BN(finalPlatformBalance - initialPlatformBalance);

    // Assert payouts using BN comparison
    assert.ok(
      winnerBalanceDiff.eq(EXPECTED_WINNER_PAYOUT),
      `Winner did not receive correct payout. Expected ${EXPECTED_WINNER_PAYOUT.toString()}, got ${winnerBalanceDiff.toString()}`
    );
    assert.ok(
      platformBalanceDiff.eq(EXPECTED_PLATFORM_PAYOUT),
      `Platform did not receive correct rake. Expected ${EXPECTED_PLATFORM_PAYOUT.toString()}, got ${platformBalanceDiff.toString()}`
    );

    // Try to settle again - should fail
    try {
      await program.methods
        .settleMatch()
        .accounts({
          signer: provider.wallet.publicKey,
          matchAccount: matchPda,
          winner: playerOne.publicKey,
          platform: PLATFORM_KEY,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
      assert.fail("Expected settle_match to fail when match already settled");
    } catch (err) {
      assert.include(
        err.message,
        "MatchAlreadySettled",
        "Expected MatchAlreadySettled error"
      );
    }
  });
}); 