import {
    Program,
    AnchorProvider,
    web3,
    BN,
    Idl,
} from '@coral-xyz/anchor';
import bs58_raw = require('bs58'); // Import the raw module
const bs58 = (bs58_raw as any).default || bs58_raw; // Check for a .default property
import { Buffer } from 'buffer';

// Import as any to avoid type compatibility issues
const idlJson = require('../contracts/target/idl/wager_converted.json');

// Use the converted IDL directly - no need for transformation
const IDL = idlJson as unknown as Idl;

const PROGRAM_ID = new web3.PublicKey(
    'GZJ54HYGi1Qx9GKeC9Ncbu2upkCwxGdrXxaQE9b2JVCM' // From your lib.rs
);

// SECURELY provide the private key for the STATS_UPDATE_AUTHORITY_PUBKEY
// For example, from an environment variable or a secure key management service.
// DO NOT hardcode private keys in production.
// The public key for this keypair MUST match STATS_UPDATE_AUTHORITY_PUBKEY in your contract.
// const STATS_AUTHORITY_SECRET_KEY_BS58 = process.env.STATS_AUTHORITY_SECRET_KEY;
const STATS_AUTHORITY_SECRET_KEY_BS58 = "2K7oDRNo6fM72Xa4Xv2bvGxk3xChchx7VMkZNev38c3TEk8KcNKVcmujo8ypRjiBu7xdfFm63XjHu4vE96XuwTpW"; // This now holds the actual key

// -----------------------------------------------------------------------------
// Constants from Contract (or to be aligned with contract)
// -----------------------------------------------------------------------------
const PROVISIONAL_PLAYER_CAP_BN = new BN(10_000_000); // 0.01 SOL
const PLAYER_CAP_BN = new BN(1_000_000_000); // 1 SOL
const PROVISIONAL_GAME_LIMIT = 10;

const POST_PROV_TIER1_GAMES = 15;
const POST_PROV_TIER1_CAP_BN = new BN(50_000_000);
const POST_PROV_TIER2_GAMES = 25;
const POST_PROV_TIER2_CAP_BN = new BN(100_000_000);
const POST_PROV_TIER3_GAMES = 40;
const POST_PROV_TIER3_CAP_BN = new BN(250_000_000);
const POST_PROV_TIER4_GAMES = 60;
const POST_PROV_TIER4_CAP_BN = new BN(500_000_000);

const K_FACTOR_NORMAL = 20; // Standard K-factor
const K_FACTOR_PROVISIONAL = 40; // K-factor for provisional players

// Thresholds for differentiating high vs low stake games.
// This is an assumption for the off-chain service; align with your actual definitions.
const HIGH_STAKE_THRESHOLD_BN = new BN(50_000_000); // e.g., 0.05 SOL

// System Program ID, used to identify draws
const SYSTEM_PROGRAM_ID = web3.SystemProgram.programId;

// Type definition for PlayerStats account (mirroring the IDL or state.rs)
// It's better to rely on types generated from IDL if possible
interface PlayerStatsAccount {
    player: web3.PublicKey;
    rating: number; // i32
    games: number; // u32
    wins: number; // u32
    isProvisional: boolean;
    provisionalGamesPlayed: number; // u32
    accountCreationSlot: BN; // u64
    highStakeWins: number; // u32
    highStakeGames: number; // u32
    lowStakeWins: number; // u32
    lowStakeGames: number; // u32
    maxStakeLamports: BN; // u64
    weightedWinSum: BN; // u64 - Placeholder, define its logic
    totalStakeAmount: BN; // u64 - Sum of all stakes by this player
    lastStakeAmounts: BN[]; // u64[10]
    lastWinFlags: boolean[]; // bool[10]
    nextHistoryIndex: number; // u8
    bump: number; // u8
}

// Type definition for the event data
interface MatchSettledEvent {
    matchPda: web3.PublicKey;
    playerOne: web3.PublicKey;
    playerTwo: web3.PublicKey;
    winner: web3.PublicKey;
    stakeLamports: BN; // This is per-player stake
}

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------

/**
 * Derives the PlayerStats PDA for a given player.
 */
async function getPlayerStatsPda(
    playerKey: web3.PublicKey,
    programId: web3.PublicKey
): Promise<web3.PublicKey> {
    const [pda, _bump] = await web3.PublicKey.findProgramAddress(
        [Buffer.from('player-stats'), playerKey.toBuffer()],
        programId
    );
    return pda;
}

/**
 * TypeScript equivalent of the on-chain `calculate_max_stake`.
 * Note: This version doesn't have access to `Clock::get()?.slot` for account_age.
 * You might need to pass current slot or simplify this part if exact replication is hard.
 * For now, omitting the account_age part of the logic.
 */
function calculateNewMaxStakeLamports(
    gamesCompleted: number,
    isProvisional: boolean,
    highStakeWins: number,
    highStakeGames: number,
    lowStakeWins: number,
    lowStakeGames: number,
    // accountCreationSlot: BN, // Current slot would be needed for age calculation
): BN {
    if (isProvisional) {
        return PROVISIONAL_PLAYER_CAP_BN;
    }

    let maxStakeVal: BN;
    if (gamesCompleted <= 10) maxStakeVal = PROVISIONAL_PLAYER_CAP_BN;
    else if (gamesCompleted <= POST_PROV_TIER1_GAMES) maxStakeVal = POST_PROV_TIER1_CAP_BN;
    else if (gamesCompleted <= POST_PROV_TIER2_GAMES) maxStakeVal = POST_PROV_TIER2_CAP_BN;
    else if (gamesCompleted <= POST_PROV_TIER3_GAMES) maxStakeVal = POST_PROV_TIER3_CAP_BN;
    else if (gamesCompleted <= POST_PROV_TIER4_GAMES) maxStakeVal = POST_PROV_TIER4_CAP_BN;
    else maxStakeVal = PLAYER_CAP_BN;

    if (highStakeGames >= 5 && lowStakeGames >= 5) {
        const highStakeWinRate = highStakeGames > 0 ? highStakeWins / highStakeGames : 0;
        const lowStakeWinRate = lowStakeGames > 0 ? lowStakeWins / lowStakeGames : 0;
        if (highStakeWinRate > lowStakeWinRate * 1.3) {
            maxStakeVal = maxStakeVal.div(new BN(2));
        }
    }
    // Account age discount (omitted for now as Clock is not available here directly)
    // if (account_age < 40_000) { max_stake_val = max_stake_val * 4 / 5; }
    return maxStakeVal;
}


// -----------------------------------------------------------------------------
// Main Processing Logic
// -----------------------------------------------------------------------------

async function processEloUpdateForPlayer(
    playerKey: web3.PublicKey,
    opponentRating: number,
    matchResult: 'win' | 'loss' | 'draw',
    stakeThisGame: BN,
    program: Program<Idl>, // <-- Use Idl type from import
    authorityKeypair: web3.Keypair
): Promise<boolean> {
    const playerStatsPda = await getPlayerStatsPda(playerKey, program.programId);
    let playerOldStats: PlayerStatsAccount;

    try {
        // Fetch existing stats
        playerOldStats = (await program.account.playerStats.fetch(playerStatsPda)) as unknown as PlayerStatsAccount;
         console.log(`Fetched old stats for ${playerKey.toBase58()}:`, playerOldStats);
    } catch (e) {
        console.error(
            `Failed to fetch player stats for ${playerKey.toBase58()}. Player may need to initialize stats first.`,
            e
        );
        // TODO: Optionally, you could call initializePlayerStats here if it makes sense for your flow.
        // For now, we assume stats are initialized.
        return false;
    }

    // 1. ELO Calculation
    const kFactor = playerOldStats.isProvisional ? K_FACTOR_PROVISIONAL : K_FACTOR_NORMAL;
    const expectedScore = 1 / (1 + Math.pow(10, (opponentRating - playerOldStats.rating) / 400));
    
    let actualScore: number;
    let wonThisGame = false;
    if (matchResult === 'win') {
        actualScore = 1.0;
        wonThisGame = true;
    } else if (matchResult === 'loss') {
        actualScore = 0.0;
    } else { // Draw
        actualScore = 0.5;
    }
    const newRating = Math.round(playerOldStats.rating + kFactor * (actualScore - expectedScore));

    // 2. Update other stats
    const newGames = playerOldStats.games + 1;
    const newWins = playerOldStats.wins + (wonThisGame ? 1 : 0);
    
    let newProvisionalGamesPlayed = playerOldStats.provisionalGamesPlayed;
    if (playerOldStats.isProvisional) {
        newProvisionalGamesPlayed += 1;
    }
    const newIsProvisional = newProvisionalGamesPlayed < PROVISIONAL_GAME_LIMIT;

    // Update high/low stake game counters
    let newHighStakeGames = playerOldStats.highStakeGames;
    let newHighStakeWins = playerOldStats.highStakeWins;
    let newLowStakeGames = playerOldStats.lowStakeGames;
    let newLowStakeWins = playerOldStats.lowStakeWins;

    if (stakeThisGame.gte(HIGH_STAKE_THRESHOLD_BN)) {
        newHighStakeGames += 1;
        if (wonThisGame) newHighStakeWins += 1;
    } else {
        newLowStakeGames += 1;
        if (wonThisGame) newLowStakeWins += 1;
    }
    
    const newMaxStakeLamports = calculateNewMaxStakeLamports(
        newGames,
        newIsProvisional,
        newHighStakeWins,
        newHighStakeGames,
        newLowStakeWins,
        newLowStakeGames
        // playerOldStats.accountCreationSlot // Pass current slot if implementing age discount
    );

    // Update history arrays
    const newLastStakeAmounts = [...playerOldStats.lastStakeAmounts];
    const newLastWinFlags = [...playerOldStats.lastWinFlags];
    const historyIndex = playerOldStats.nextHistoryIndex;
    
    newLastStakeAmounts[historyIndex] = stakeThisGame;
    newLastWinFlags[historyIndex] = wonThisGame;
    const newNextHistoryIndex = (historyIndex + 1) % 10;

    // Update cumulative stats
    let newWeightedWinSum = playerOldStats.weightedWinSum;
    if (wonThisGame) {
        newWeightedWinSum = playerOldStats.weightedWinSum.add(stakeThisGame);
    }
    const newTotalStakeAmount = playerOldStats.totalStakeAmount.add(stakeThisGame);


    // 3. Call update_player_stats_offchain instruction
    try {
        const txSignature = await program.methods
            .updatePlayerStatsOffchain(
                newRating,
                newGames,
                newWins,
                newIsProvisional,
                newProvisionalGamesPlayed,
                newMaxStakeLamports,
                newWeightedWinSum,
                newTotalStakeAmount,
                newHighStakeWins,
                newHighStakeGames,
                newLowStakeWins,
                newLowStakeGames,
                newLastStakeAmounts,
                newLastWinFlags,
                newNextHistoryIndex
            )
            .accounts({
                authority: authorityKeypair.publicKey,
                playerStats: playerStatsPda,
            })
            .signers([authorityKeypair])
            .rpc();
        console.log(
            `Player stats updated for ${playerKey.toBase58()}. Rating: ${newRating}. Tx: ${txSignature}`
        );
        return true;
    } catch (error) {
        console.error(`Error updating stats for ${playerKey.toBase58()}:`, error);
        return false;
    }
}


async function handleMatchSettledEvent(
    event: MatchSettledEvent,
    program: Program<Idl>, // <-- Use Idl type from import
    authorityKeypair: web3.Keypair
) {
    console.log(`Processing MatchSettledForStatsProcessing event for match ${event.matchPda.toBase58()}`);
    const { playerOne, playerTwo, winner, stakeLamports } = event;

    // Fetch initial ratings to pass as opponentRating to each player's calculation
    // This avoids a race condition where one player's update might affect the other's input rating
    let p1InitialStats, p2InitialStats;
    try {
        const p1StatsPda = await getPlayerStatsPda(playerOne, program.programId);
        const p2StatsPda = await getPlayerStatsPda(playerTwo, program.programId);
        p1InitialStats = (await program.account.playerStats.fetch(p1StatsPda)) as unknown as PlayerStatsAccount;
        p2InitialStats = (await program.account.playerStats.fetch(p2StatsPda)) as unknown as PlayerStatsAccount;
    } catch (e) {
        console.error("Failed to fetch initial stats for ELO calculation base, skipping event:", e);
        return;
    }


    let playerOneResult: 'win' | 'loss' | 'draw';
    let playerTwoResult: 'win' | 'loss' | 'draw';

    if (winner.equals(playerOne)) {
        playerOneResult = 'win';
        playerTwoResult = 'loss';
    } else if (winner.equals(playerTwo)) {
        playerOneResult = 'loss';
        playerTwoResult = 'win';
    } else if (winner.equals(SYSTEM_PROGRAM_ID)) { // Draw
        playerOneResult = 'draw';
        playerTwoResult = 'draw';
    } else {
        console.error(`Invalid winner in event: ${winner.toBase58()}`);
        return;
    }

    // Process Player One
    await processEloUpdateForPlayer(
        playerOne,
        p2InitialStats.rating, // Opponent's initial rating
        playerOneResult,
        stakeLamports, // Assuming stakeLamports from event is per-player
        program,
        authorityKeypair
    );

    // Process Player Two
    await processEloUpdateForPlayer(
        playerTwo,
        p1InitialStats.rating, // Opponent's initial rating
        playerTwoResult,
        stakeLamports, // Assuming stakeLamports from event is per-player
        program,
        authorityKeypair
    );
    console.log(`Finished processing event for match ${event.matchPda.toBase58()}`);
}

// -----------------------------------------------------------------------------
// Main Program Logic
// -----------------------------------------------------------------------------
async function main() {
    console.log('Starting off-chain ELO processing service...');

    let authorityKeypair: web3.Keypair;
    try {
        authorityKeypair = web3.Keypair.fromSecretKey(
             bs58.decode(STATS_AUTHORITY_SECRET_KEY_BS58)
        );
        console.log(`Stats Update Authority Pubkey: ${authorityKeypair.publicKey.toBase58()}`);
    } catch (e) {
        console.error("Failed to load authority keypair from secret key. Ensure it's a valid base58 encoded private key.", e);
        process.exit(1);
    }


    // Setup AnchorProvider and Program
    // Assumes ANCHOR_PROVIDER_URL and ANCHOR_WALLET are set in the environment,
    // or provider is configured manually.
    // The wallet used by provider here is just for read operations or as a default payer if needed,
    // the actual signing for `updatePlayerStatsOffchain` is done by `authorityKeypair`.
    const provider = AnchorProvider.env();
    // If you want to override the wallet used by the provider for read operations or as default payer:
    // const connection = new web3.Connection(web3.clusterApiUrl("devnet")); // Or your RPC_URL
    // const dummyWallet = new Wallet(web3.Keypair.generate()); // Dummy wallet for read-only provider
    // const provider = new AnchorProvider(connection, dummyWallet, AnchorProvider.defaultOptions());


    // TODO: Replace IDL_PLACEHOLDER with your actual compiled IDL object
    const program = new Program(
        IDL, // <-- USE THE IMPORTED IDL
        PROGRAM_ID,
        provider
    );

    console.log(`Connected to Solana cluster. Program ID: ${program.programId.toBase58()}`);
    console.log(`Listening for 'MatchSettledForStatsProcessing' events...`);

    // Event Listener
    const listenerId = program.addEventListener(
        'MatchSettledForStatsProcessing',
        async (event: any, slot, signature) => { // event as any initially
            console.log(`---`);
            console.log(`Received MatchSettledForStatsProcessing event (Slot: ${slot}, Tx: ${signature}):`);
            
            const typedEvent: MatchSettledEvent = {
                matchPda: new web3.PublicKey(event.matchPda),
                playerOne: new web3.PublicKey(event.playerOne),
                playerTwo: new web3.PublicKey(event.playerTwo),
                winner: new web3.PublicKey(event.winner),
                stakeLamports: new BN(event.stakeLamports),
            };
            await handleMatchSettledEvent(typedEvent, program, authorityKeypair);
            console.log(`---`);
        }
    );

    // Keep the process alive (e.g., in a Node.js server environment)
    // For a simple script, this might exit after a while or if connection drops.
    // In a real service, you'd have more robust error handling and restart logic.
    
    // To stop listening (e.g., on shutdown):
    // await program.removeEventListener(listenerId);
    // console.log("Stopped listening for events.");
}

main().catch((err) => {
    console.error('Service encountered a critical error:', err);
    process.exit(1);
});

// To run this:
// 1. Ensure you have Node.js and TypeScript installed.
// 2. Install dependencies: npm install @project-serum/anchor @solana/web3.js bs58 buffer
// 3. Compile to JavaScript: tsc scripts/offchain_elo_service.ts
// 4. Set environment variables:
//    export ANCHOR_PROVIDER_URL="YOUR_SOLANA_RPC_URL" (e.g., https://api.devnet.solana.com)
//    export ANCHOR_WALLET="PATH_TO_YOUR_DEFAULT_WALLET_JSON_FILE" (can be a dummy for this service if authority key is separate)
//    export STATS_AUTHORITY_SECRET_KEY="YOUR_ACTUAL_BS58_ENCODED_PRIVATE_KEY"
// 5. Run the compiled JavaScript: node scripts/offchain_elo_service.js
//
// IMPORTANT:
// - Replace IDL_PLACEHOLDER with your actual program IDL.
// - Securely manage STATS_AUTHORITY_SECRET_KEY.
// - The PlayerStats struct in the IDL and TypeScript interface must match your contract's state.rs.
// - Test thoroughly on devnet/testnet before mainnet. 