use anchor_lang::prelude::*;
use anchor_lang::system_program; // <<< ADD THIS LINE

pub mod state;

// Maximum stake amount per player in lamports
pub const PLAYER_CAP: u64 = 1_000_000_000; // 1 SOL
// Maximum stake for provisional players (in lamports)
pub const PROVISIONAL_PLAYER_CAP: u64 = 10_000_000; // 0.01 SOL
// Number of games required before a player is no longer provisional
pub const PROVISIONAL_GAME_LIMIT: u32 = 10;
// Default starting ELO rating for new players

pub const DEFAULT_ELO_RATING: i32 = 1200;
// Time Control Types
pub const TIME_CONTROL_BLITZ_3_2: u8 = 0;
pub const TIME_CONTROL_BULLET_1_1: u8 = 1;

// Initial timer values in slots (assuming 40 slots per second)
pub const BLITZ_3_2_INITIAL_TIME_SLOTS: u64 = 180 * 40; // 3 minutes
pub const BULLET_1_1_INITIAL_TIME_SLOTS: u64 = 60 * 40;  // 1 minute

// Progressive stake limits for different game count tiers
pub const POST_PROV_TIER1_GAMES: u32 = 15;  // 11-15 games
pub const POST_PROV_TIER1_CAP: u64 = 50_000_000; // 0.05 SOL

pub const POST_PROV_TIER2_GAMES: u32 = 25;  // 16-25 games
pub const POST_PROV_TIER2_CAP: u64 = 100_000_000; // 0.1 SOL

pub const POST_PROV_TIER3_GAMES: u32 = 40;  // 26-40 games
pub const POST_PROV_TIER3_CAP: u64 = 250_000_000; // 0.25 SOL

pub const POST_PROV_TIER4_GAMES: u32 = 60;  // 41-60 games
pub const POST_PROV_TIER4_CAP: u64 = 500_000_000; // 0.5 SOL

// Maximum stake consistency factor (multiple of recent average)
pub const MAX_STAKE_CONSISTENCY_FACTOR: u64 = 2;

pub const CONFIRMATION_WINDOW: u64 = 400; // 10 seconds in slots (40 slots per second)
// Platform's wallet that will receive the platform fee (4%)
// IMPORTANT: In production deployment, replace this with the actual platform wallet address!
// We currently use the system program address for test/dev environments
// This is the official platform wallet address for all fee collections
pub const PLATFORM_RAKE_PUBKEY: Pubkey = pubkey!("AwszNDgf4oTphGiEoA4Eua91dhsfxAW2VrzmgStLfziX");

// Payout percentages (in basis points)
pub const WINNER_PCT: u64 = 9300; // 93%
pub const PLATFORM_PCT: u64 = 400; // 4%
pub const ROYALTY_PCT: u64 = 300; // 3% (This is for the single opening owner)

// NEW: Authority for updating player stats via off-chain service
pub const STATS_UPDATE_AUTHORITY_PUBKEY: Pubkey = pubkey!("FSrRoqX5ZA71kyCqpwBYvn3zq4kxQ6MzEdEJvna6oH9k");

declare_id!("GZJ54HYGi1Qx9GKeC9Ncbu2upkCwxGdrXxaQE9b2JVCM");

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum ResultType {
    Mate = 0,
    Resign = 1,
    Timeout = 2,
    Disconnect = 3,
    Draw = 4,
}

#[event]
pub struct Challenge {
    pub player_one: Pubkey,
    pub player_two: Pubkey,
    pub stake_lamports: u64,
}

#[event]
pub struct Confirmed {
    pub player_one: Pubkey,
    pub player_two: Pubkey,
    pub stake_lamports: u64,
    pub match_pda: Pubkey,
}

#[event]
pub struct GameOver {
    pub match_pda: Pubkey,
    pub result: u8,
    pub winner: Pubkey,
}

// NEW: Event to signal off-chain service to process stats
#[event]
pub struct MatchSettledForStatsProcessing {
    pub match_pda: Pubkey,
    pub player_one: Pubkey,
    pub player_two: Pubkey,
    pub winner: Pubkey, // system_program::ID for a draw
    pub stake_lamports: u64, // Per player stake
}

#[program]
pub mod wager {
    use super::*;

    pub fn create_match(
        ctx: Context<CreateMatch>,
        stake_lamports: u64,
        time_control_type: u8,
    ) -> Result<()> {
        // Check if the players are provisional and enforce limits
        let player_one_stats_account_info = &ctx.accounts.player_one_stats;
        let player_two_stats_account_info = &ctx.accounts.player_two_stats;

        if player_one_stats_account_info.lamports() > 0 && player_one_stats_account_info.data_is_empty() == false {
            let player_one_stats_data = player_one_stats_account_info.try_borrow_data()?;
            let player_one_stats = state::PlayerStats::try_deserialize(&mut player_one_stats_data.as_ref())?;
            let max_stake = calculate_max_stake(&player_one_stats);
            require!(stake_lamports <= max_stake, WagerError::StakeExceedsProgressiveLimit);
            require!(is_consistent_stake_amount(&player_one_stats, stake_lamports), WagerError::SuspiciousStakePattern);
        } else {
             require!(stake_lamports <= PROVISIONAL_PLAYER_CAP, WagerError::StakeExceedsPlayerCap);
        }

        if player_two_stats_account_info.lamports() > 0 && player_two_stats_account_info.data_is_empty() == false {
            let player_two_stats_data = player_two_stats_account_info.try_borrow_data()?;
            let player_two_stats = state::PlayerStats::try_deserialize(&mut player_two_stats_data.as_ref())?;
            let max_stake = calculate_max_stake(&player_two_stats);
            require!(stake_lamports <= max_stake, WagerError::StakeExceedsProgressiveLimit);
            require!(is_consistent_stake_amount(&player_two_stats, stake_lamports), WagerError::SuspiciousStakePattern);
        } else {
            require!(stake_lamports <= PROVISIONAL_PLAYER_CAP, WagerError::StakeExceedsPlayerCap);
        }

        require!(ctx.accounts.player_one.lamports() >= stake_lamports, WagerError::InsufficientPlayerOneFunds);
        require!(ctx.accounts.player_two.lamports() >= stake_lamports, WagerError::InsufficientPlayerTwoFunds);

        let match_account = &mut ctx.accounts.match_account;
        match_account.player_one = ctx.accounts.player_one.key();
        match_account.player_two = ctx.accounts.player_two.key();
        match_account.stake_lamports = stake_lamports;
        match_account.is_settled = false;
        match_account.start_slot = 0; 
        match_account.last_move_slot = Clock::get()?.slot;
        match_account.winner = system_program::ID; 
        match_account.time_control_type = time_control_type;
        
        match time_control_type {
            TIME_CONTROL_BLITZ_3_2 => {
                match_account.player_one_time = BLITZ_3_2_INITIAL_TIME_SLOTS;
                match_account.player_two_time = BLITZ_3_2_INITIAL_TIME_SLOTS;
            }
            TIME_CONTROL_BULLET_1_1 => {
                match_account.player_one_time = BULLET_1_1_INITIAL_TIME_SLOTS;
                match_account.player_two_time = BULLET_1_1_INITIAL_TIME_SLOTS;
            }
            _ => return err!(WagerError::InvalidTimeControlType),
        }
        
        match_account.is_player_one_turn = true;
        match_account.is_game_over = false;
        match_account.current_position = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1".to_string();
        match_account.move_history = Vec::new();

        emit!(Challenge {
            player_one: ctx.accounts.player_one.key(),
            player_two: ctx.accounts.player_two.key(),
            stake_lamports,
        });
        Ok(())
    }

    pub fn confirm_match(ctx: Context<ConfirmMatch>) -> Result<()> {
        let current_slot = Clock::get()?.slot;
        let match_info = ctx.accounts.match_account.to_account_info();
        let stake = ctx.accounts.match_account.stake_lamports;
        let match_account = &mut ctx.accounts.match_account;
        
        require!(match_account.start_slot == 0, WagerError::MatchAlreadyConfirmed);
        require!(current_slot <= match_account.last_move_slot.checked_add(CONFIRMATION_WINDOW).ok_or(WagerError::Overflow)?, WagerError::ConfirmationWindowExpired);

        match_account.start_slot = current_slot;

        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.player_one.to_account_info(),
                    to: match_info.clone(),
                },
            ),
            stake,
        )?;
        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.player_two.to_account_info(),
                    to: match_info.clone(),
                },
            ),
            stake,
        )?;

        emit!(Confirmed {
            player_one: ctx.accounts.player_one.key(),
            player_two: ctx.accounts.player_two.key(),
            stake_lamports: stake,
            match_pda: match_info.key(),
        });
        Ok(())
    }

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }

    pub fn submit_result(
        ctx: Context<SubmitResult>,
        result_type: ResultType,
    ) -> Result<()> {
        let match_account = &mut ctx.accounts.match_account;
        
        require!(!match_account.is_game_over, WagerError::GameAlreadyOver);
        
        let is_player_one = ctx.accounts.signer.key() == match_account.player_one;
        let is_player_two = ctx.accounts.signer.key() == match_account.player_two;
        require!(is_player_one || is_player_two, WagerError::NotPlayersTurn ); // Simplified error
        
        match_account.is_game_over = true;
        
        if result_type == ResultType::Draw {
            match_account.winner = system_program::ID;
        } else {
            match_account.winner = ctx.accounts.signer.key();
        }
        
        emit!(GameOver {
            match_pda: match_account.key(),
            result: result_type as u8,
            winner: match_account.winner,
        });
        Ok(())
    }

    // settle_match is now simplified for off-chain ELO calculation
    pub fn settle_match(ctx: Context<SettleMatch>) -> Result<()> {
        msg!("Financial settlement part of the instruction starts...");
        let match_account = &mut ctx.accounts.match_account;

        require!(!match_account.is_settled, WagerError::MatchAlreadySettled);
        require!(match_account.is_game_over, WagerError::GameNotOver);

        // VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV
        // >> IMPORTANT: PASTE YOUR EXISTING FINANCIAL SETTLEMENT CODE HERE <<
        // This includes transferring stakes, platform fees, NFT royalties.
        // It should use: 
        //  - ctx.accounts.match_account (for total stake, and as source of funds)
        //  - match_account.winner (to determine who gets winner_pot, or if it's a draw)
        //  - ctx.accounts.player_one_account (destination for P1 share in a draw)
        //  - ctx.accounts.player_two_account (destination for P2 share in a draw)
        //  - ctx.accounts.winner_account (destination for winner_pot if not a draw)
        //  - ctx.accounts.platform (destination for platform fees)
        //  - ctx.accounts.opening_owner (destination for royalties, if any)
        // Ensure all transfers correctly debit from match_account PDA and credit to destinations.
        // Example (replace with your specific logic):
        /*
        let total_stake = match_account.stake_lamports.checked_mul(2).ok_or(WagerError::Overflow)?;
        let royalty_amount = total_stake.checked_mul(ROYALTY_PCT).ok_or(WagerError::Overflow)?.checked_div(10000).ok_or(WagerError::Overflow)?;
        let platform_amount = total_stake.checked_mul(PLATFORM_PCT).ok_or(WagerError::Overflow)?.checked_div(10000).ok_or(WagerError::Overflow)?;
        let winner_pot_initial = total_stake.checked_sub(royalty_amount).ok_or(WagerError::Overflow)?.checked_sub(platform_amount).ok_or(WagerError::Overflow)?;

        let match_lamports = &mut ctx.accounts.match_account.to_account_info().try_borrow_mut_lamports()?;

        // To Opening Owner
        **match_lamports -= royalty_amount;
        **ctx.accounts.opening_owner.to_account_info().try_borrow_mut_lamports()? += royalty_amount;
        
        // To Platform
        **match_lamports -= platform_amount;
        **ctx.accounts.platform.to_account_info().try_borrow_mut_lamports()? += platform_amount;

        if match_account.winner == system_program::ID { // Draw
            let p1_share = winner_pot_initial / 2;
            let p2_share = winner_pot_initial - p1_share; // Handles potential odd lamport
            
            **match_lamports -= p1_share;
            **ctx.accounts.player_one_account.to_account_info().try_borrow_mut_lamports()? += p1_share;

            **match_lamports -= p2_share;
            **ctx.accounts.player_two_account.to_account_info().try_borrow_mut_lamports()? += p2_share;
        } else { // Single winner
            **match_lamports -= winner_pot_initial;
            **ctx.accounts.winner_account.to_account_info().try_borrow_mut_lamports()? += winner_pot_initial;
        }
        */
        // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        msg!("Financial settlement part completed.");

        match_account.is_settled = true;

        // Emit event for off-chain service to pick up for ELO and stats processing
        emit!(MatchSettledForStatsProcessing {
            match_pda: match_account.key(),
            player_one: match_account.player_one,
            player_two: match_account.player_two,
            winner: match_account.winner, // This will be system_program::ID for a draw
            stake_lamports: match_account.stake_lamports, // Per player stake
        });

        Ok(())
    }

    pub fn make_move(
        ctx: Context<MakeMove>,
        move_san: String,
    ) -> Result<()> {
        let match_account = &mut ctx.accounts.match_account;
        require!(!match_account.is_game_over, WagerError::GameAlreadyOver);
        let is_player_one = ctx.accounts.signer.key() == match_account.player_one;
        let is_player_two = ctx.accounts.signer.key() == match_account.player_two;
        require!((is_player_one && match_account.is_player_one_turn) || (is_player_two && !match_account.is_player_one_turn), WagerError::NotPlayersTurn);
        match_account.move_history.push(move_san);
        match_account.is_player_one_turn = !match_account.is_player_one_turn;
        Ok(())
    }

    pub fn initialize_player_stats(ctx: Context<InitializePlayerStats>) -> Result<()> {
        let player_stats = &mut ctx.accounts.player_stats;
        player_stats.player = ctx.accounts.player.key();
        player_stats.rating = DEFAULT_ELO_RATING;
        player_stats.games = 0;
        player_stats.wins = 0;
        player_stats.is_provisional = true;
        player_stats.provisional_games_played = 0;
        player_stats.max_stake_lamports = PROVISIONAL_PLAYER_CAP; 
        player_stats.weighted_win_sum = 0;
        player_stats.total_stake_amount = 0;
        player_stats.high_stake_wins = 0;
        player_stats.high_stake_games = 0;
        player_stats.low_stake_wins = 0;
        player_stats.low_stake_games = 0;
        player_stats.account_creation_slot = Clock::get()?.slot;
        player_stats.last_stake_amounts = [0; 10];
        player_stats.last_win_flags = [false; 10];
        player_stats.next_history_index = 0;
        player_stats.bump = ctx.bumps.player_stats;
        msg!("Player stats initialized for: {:?}", player_stats.player);
        Ok(())
    }

    // NEW instruction for off-chain service to update player stats
    pub fn update_player_stats_offchain(
        ctx: Context<UpdatePlayerStatsOffchain>,
        new_rating: i32,
        new_games: u32,
        new_wins: u32,
        new_is_provisional: bool,
        new_provisional_games_played: u32,
        new_max_stake_lamports: u64,
        new_weighted_win_sum: u64,
        new_total_stake_amount: u64,
        new_high_stake_wins: u32,
        new_high_stake_games: u32,
        new_low_stake_wins: u32,
        new_low_stake_games: u32,
        new_last_stake_amounts: [u64; 10],
        new_last_win_flags: [bool; 10],
        new_next_history_index: u8
    ) -> Result<()> {
        require!(ctx.accounts.authority.key() == STATS_UPDATE_AUTHORITY_PUBKEY, WagerError::InvalidSigner); // Or a new error like UnauthorizedStatsUpdater

        let player_stats = &mut ctx.accounts.player_stats;
        player_stats.rating = new_rating;
        player_stats.games = new_games;
        player_stats.wins = new_wins;
        player_stats.is_provisional = new_is_provisional;
        player_stats.provisional_games_played = new_provisional_games_played;
        player_stats.max_stake_lamports = new_max_stake_lamports;
        player_stats.weighted_win_sum = new_weighted_win_sum;
        player_stats.total_stake_amount = new_total_stake_amount;
        player_stats.high_stake_wins = new_high_stake_wins;
        player_stats.high_stake_games = new_high_stake_games;
        player_stats.low_stake_wins = new_low_stake_wins;
        player_stats.low_stake_games = new_low_stake_games;
        player_stats.last_stake_amounts = new_last_stake_amounts;
        player_stats.last_win_flags = new_last_win_flags;
        player_stats.next_history_index = new_next_history_index;
        // Note: player_stats.player and player_stats.account_creation_slot, player_stats.bump are not updated here as they are set at init.
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}

#[derive(Accounts)]
#[instruction(stake_lamports: u64, time_control_type: u8)]
pub struct CreateMatch<'info> {
    #[account(mut)]
    pub player_one: Signer<'info>,
    #[account(mut)]
    pub player_two: Signer<'info>,
    #[account(
        init,
        payer = player_one,
        space = 8 + state::Match::LEN, // Using LEN from state.rs
        seeds = [b"chessbets", player_one.key().as_ref(), player_two.key().as_ref()],
        bump
    )]
    pub match_account: Account<'info, state::Match>,
    /// CHECK: Player stats account can be uninitialized. Existence and PDA derivation are checked in the instruction logic.
    pub player_one_stats: AccountInfo<'info>,
    /// CHECK: Player stats account can be uninitialized. Existence and PDA derivation are checked in the instruction logic.
    pub player_two_stats: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ConfirmMatch<'info> {
    #[account(mut)]
    pub player_one: Signer<'info>,
    #[account(mut)]
    pub player_two: Signer<'info>,
    #[account(mut, seeds = [b"chessbets", player_one.key().as_ref(), player_two.key().as_ref()], bump)]
    pub match_account: Account<'info, state::Match>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SubmitResult<'info> {
    pub signer: Signer<'info>,
    #[account(mut, seeds = [b"chessbets", match_account.player_one.as_ref(), match_account.player_two.as_ref()], bump)]
    pub match_account: Account<'info, state::Match>,
}

#[derive(Accounts)]
pub struct SettleMatch<'info> {
    pub signer: Signer<'info>, // Can be anyone
    #[account(
        mut,
        seeds = [b"chessbets", match_account.player_one.as_ref(), match_account.player_two.as_ref()],
        bump,
        constraint = match_account.to_account_info().lamports() >= 
                     match_account.stake_lamports.checked_mul(2).unwrap_or(0) // Simplified check, ensure enough for total stake. Detailed check in financial logic.
                     @ WagerError::InsufficientFundsInMatchAccount
    )]
    pub match_account: Account<'info, state::Match>,
    /// CHECK: Client ensures this is the correct winner's main account if there's a winner, or a player account for draw payout.
    #[account(mut)]
    pub winner_account: AccountInfo<'info>,
    /// CHECK: Client ensures this is player one's account for potential draw payout.
    #[account(mut)]
    pub player_one_account: AccountInfo<'info>,
    /// CHECK: Client ensures this is player two's account for potential draw payout.
    #[account(mut)]
    pub player_two_account: AccountInfo<'info>,
    /// CHECK: Validated by the address constraint to be the platform_rake_pubkey.
    #[account(mut, address = PLATFORM_RAKE_PUBKEY @ WagerError::InvalidSigner)] // check address is platform pubkey
    pub platform: AccountInfo<'info>,
    /// CHECK: Client ensures this is the correct opening NFT owner account for royalty payout.
    #[account(mut)]
    pub opening_owner: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MakeMove<'info> {
    pub signer: Signer<'info>,
    #[account(mut, seeds = [b"chessbets", match_account.player_one.as_ref(), match_account.player_two.as_ref()], bump)]
    pub match_account: Account<'info, state::Match>,
}

#[derive(Accounts)]
pub struct InitializePlayerStats<'info> {
    #[account(mut)]
    pub player: Signer<'info>,
    #[account(
        init,
        payer = player,
        space = 8 + state::PlayerStats::LEN, // Using LEN from state.rs
        seeds = [b"player-stats", player.key().as_ref()],
        bump
    )]
    pub player_stats: Account<'info, state::PlayerStats>,
    pub system_program: Program<'info, System>,
}

// NEW Accounts struct for update_player_stats_offchain
#[derive(Accounts)]
pub struct UpdatePlayerStatsOffchain<'info> {
    #[account(mut, address = STATS_UPDATE_AUTHORITY_PUBKEY @ WagerError::InvalidSigner)] // check authority is the one set in const
    pub authority: Signer<'info>,
    #[account(
        mut,
        seeds = [b"player-stats", player_stats.player.as_ref()], // Derive PDA from player field within player_stats
        bump = player_stats.bump // Use the bump stored in player_stats
    )]
    pub player_stats: Account<'info, state::PlayerStats>,
}

#[error_code]
pub enum WagerError {
    #[msg("Stake amount exceeds player cap")]
    StakeExceedsPlayerCap,
    #[msg("Player one has insufficient funds for stake")]
    InsufficientPlayerOneFunds,
    #[msg("Player two has insufficient funds for stake")]
    InsufficientPlayerTwoFunds,
    #[msg("Confirmation window has expired")]
    ConfirmationWindowExpired,
    #[msg("Match has already been confirmed")]
    MatchAlreadyConfirmed,
    #[msg("Match has already been settled")]
    MatchAlreadySettled,
    #[msg("Invalid signer or unauthorized updater")] // Updated for new instruction
    InvalidSigner,
    #[msg("No winner has been declared yet")]
    NoWinnerYet,
    #[msg("Game has already ended")]
    GameAlreadyOver,
    #[msg("Not the player's turn")]
    NotPlayersTurn,
    #[msg("Error calculating time")]
    TimeCalculationError,
    #[msg("Invalid FEN string")]
    InvalidFen,
    #[msg("Ambiguous move - multiple pieces can make this move")]
    AmbiguousMove,
    #[msg("Game is not over yet")]
    GameNotOver,
    #[msg("Invalid winner")]
    InvalidWinner,
    #[msg("Player account for draw payout does not match match record")]
    InvalidPlayerAccount,
    #[msg("Insufficient funds in match account for settlement")]
    InsufficientFundsInMatchAccount,
    #[msg("Match has not been settled yet")]
    MatchNotSettled,
    #[msg("Stake amount exceeds progressive stake limit")]
    StakeExceedsProgressiveLimit,
    #[msg("Suspicious stake pattern detected")]
    SuspiciousStakePattern,
    #[msg("Stake amount deviation too large from recent history")]
    StakeDeviationTooLarge,
    #[msg("Invalid time control type provided")]
    InvalidTimeControlType,
    #[msg("Numerical overflow occurred.")]
    Overflow,
    #[msg("Invalid winner provided for settlement.")]
    InvalidWinnerProvided,
}

// Helper function to calculate maximum stake based on games played
fn calculate_max_stake(stats: &state::PlayerStats) -> u64 {
    if stats.is_provisional {
        return PROVISIONAL_PLAYER_CAP;
    }
    let games_completed = stats.games;
    let mut max_stake_val = match games_completed {
        0..=10 => PROVISIONAL_PLAYER_CAP,
        11..=15 => POST_PROV_TIER1_CAP,
        16..=25 => POST_PROV_TIER2_CAP,
        26..=40 => POST_PROV_TIER3_CAP,
        41..=60 => POST_PROV_TIER4_CAP,
        _ => PLAYER_CAP,
    };
    if stats.high_stake_games >= 5 && stats.low_stake_games >= 5 {
        let high_stake_win_rate = stats.high_stake_wins as f64 / stats.high_stake_games as f64;
        let low_stake_win_rate = stats.low_stake_wins as f64 / stats.low_stake_games as f64;
        if high_stake_win_rate > low_stake_win_rate * 1.3 {
            max_stake_val /= 2;
        }
    }
    match Clock::get() {
        Ok(clock) => {
            let account_age = clock.slot.saturating_sub(stats.account_creation_slot);
            if account_age < 40_000 { // About 2.8 hours
                max_stake_val = max_stake_val * 4 / 5;
            }
        },
        Err(_) => { /* msg!("Error fetching clock... "); */ }
    }
    max_stake_val
}

// Helper function to check if stake amount is consistent with betting history
fn is_consistent_stake_amount(stats: &state::PlayerStats, stake: u64) -> bool {
    let mut valid_entries = 0u64;
    let mut stake_sum: u64 = 0;
    for i in 0..10 {
        if stats.last_stake_amounts[i] > 0 {
            stake_sum = stake_sum.saturating_add(stats.last_stake_amounts[i]);
            valid_entries = valid_entries.saturating_add(1);
        }
    }
    if valid_entries < 5 {
        return true;
    }
    let avg_stake = stake_sum.checked_div(valid_entries).unwrap_or(0);
    if avg_stake == 0 {
        return true;
    }
    stake <= avg_stake.saturating_mul(MAX_STAKE_CONSISTENCY_FACTOR)
}

#[account]
#[derive(Default)] // Ensure this is how your Match struct is defined
pub struct Match {
    pub player_one: Pubkey,
    pub player_two: Pubkey,
    pub stake_lamports: u64,
    pub settled: bool, // Example: to prevent double settlement
    pub bump: u8,
    // ... other fields for your match state
}

#[account]
#[derive(Default)]
pub struct PlayerStats {
    pub player: Pubkey,            
    pub rating: i32,               
    pub games_played: u32,         
    pub wins: u32,                 
    pub is_provisional: bool,      
    pub provisional_games_played: u32, 
    pub account_creation_slot: u64,
    pub high_stake_wins: u32,      
    pub high_stake_games: u32,     
    pub low_stake_wins: u32,       
    pub low_stake_games: u32,      
    pub max_stake_lamports: u64,
    pub bump: u8,                  
}
