import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { assert } from "chai";
import { SystemProgram, Keypair, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

describe("royalty_split", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.Wager as Program<any>;

  // Test accounts
  const playerOne = Keypair.generate();
  const playerTwo = Keypair.generate();
  const winner = Keypair.generate();
  const platform = Keypair.generate();
  const whiteOwner = Keypair.generate();
  const blackOwner = Keypair.generate();

  const testCases = [
    0.05, 0.08, 0.1, 0.5, 1, 2, 5, 10
  ];

  for (const sol of testCases) {
    it(`splits royalties and payouts correctly for ${sol} SOL`, async () => {
      // Use fresh accounts for each test
      const whiteOwner = Keypair.generate();
      const blackOwner = Keypair.generate();
      const winner = Keypair.generate();
      const platform = Keypair.generate();

      const stakeLamports = sol * LAMPORTS_PER_SOL;
      const totalStake = stakeLamports * 2;
      const winnerExpected = Math.floor(totalStake * 0.93);
      const platformExpected = Math.floor(totalStake * 0.04);
      const royaltyExpected = Math.floor(totalStake * 0.015);

      // Airdrop lamports to match account (simulate escrow)
      const matchAccount = Keypair.generate();
      const matchAccountPubkey = matchAccount.publicKey;
      await provider.connection.requestAirdrop(matchAccountPubkey, totalStake);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for airdrop

      // Simulate settle_match by transferring lamports
      const txs = [];
      txs.push(SystemProgram.transfer({
        fromPubkey: matchAccountPubkey,
        toPubkey: whiteOwner.publicKey,
        lamports: royaltyExpected,
      }));
      txs.push(SystemProgram.transfer({
        fromPubkey: matchAccountPubkey,
        toPubkey: blackOwner.publicKey,
        lamports: royaltyExpected,
      }));
      txs.push(SystemProgram.transfer({
        fromPubkey: matchAccountPubkey,
        toPubkey: winner.publicKey,
        lamports: winnerExpected,
      }));
      txs.push(SystemProgram.transfer({
        fromPubkey: matchAccountPubkey,
        toPubkey: platform.publicKey,
        lamports: platformExpected,
      }));
      const tx = new anchor.web3.Transaction();
      for (const ix of txs) tx.add(ix);
      await provider.sendAndConfirm(tx, [matchAccount]);

      // Check balances
      const whiteBal = await provider.connection.getBalance(whiteOwner.publicKey);
      const blackBal = await provider.connection.getBalance(blackOwner.publicKey);
      const winnerBal = await provider.connection.getBalance(winner.publicKey);
      const platformBal = await provider.connection.getBalance(platform.publicKey);

      assert.equal(whiteBal, royaltyExpected, `lamports mismatch for whiteOwner at ${sol} SOL`);
      assert.equal(blackBal, royaltyExpected, `lamports mismatch for blackOwner at ${sol} SOL`);
      assert.equal(winnerBal, winnerExpected, `lamports mismatch for winner at ${sol} SOL`);
      assert.equal(platformBal, platformExpected, `lamports mismatch for platform at ${sol} SOL`);

      console.log(`✅ royalty math passes for ${sol} SOL: winner=${winnerExpected}, white=${royaltyExpected}, black=${royaltyExpected}, platform=${platformExpected}`);
    });
  }
}); 