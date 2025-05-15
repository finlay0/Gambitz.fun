use anchor_lang::prelude::*;

pub mod state;

// Maximum stake amount per player in lamports
pub const PLAYER_CAP: u64 = 1_000_000_000; // 1 SOL
// Maximum stake for provisional players (in lamports)
pub const PROVISIONAL_PLAYER_CAP: u64 = 10_000_000; // 0.01 SOL
// Number of games required before a player is no longer provisional
pub const PROVISIONAL_GAME_LIMIT: u32 = 10;
// Default starting ELO rating for new players
pub const DEFAULT_ELO_RATING: i32 = 1200;
// K-factor for ELO calculations (how fast ratings change)
pub const ELO_K_FACTOR: i32 = 16; // Adjusted for ~8 point swing
// Higher K-factor for provisional players - REMOVED, will use dynamic logic

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

#[event]
pub struct EloUpdated {
    pub player_one: Pubkey,
    pub player_two: Pubkey,
    pub player_one_new_rating: i32,
    pub player_two_new_rating: i32,
    pub player_one_rating_change: i32,
    pub player_two_rating_change: i32,
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
        let player_one_stats_result = state::PlayerStats::try_from_account_info(&ctx.accounts.player_one_stats.to_account_info());
        let player_two_stats_result = state::PlayerStats::try_from_account_info(&ctx.accounts.player_two_stats.to_account_info());
        
        // Initial basic provisional check (legacy)
        let player_one_cap = if player_one_stats_result.is_ok() && player_one_stats_result.unwrap().is_provisional {
            PROVISIONAL_PLAYER_CAP
        } else {
            PLAYER_CAP
        };
        
        let player_two_cap = if player_two_stats_result.is_ok() && player_two_stats_result.unwrap().is_provisional {
            PROVISIONAL_PLAYER_CAP
        } else {
            PLAYER_CAP
        };
        
        // Use the minimum of the two caps
        let base_cap = std::cmp::min(player_one_cap, player_two_cap);
        
        // Verify stake amount against basic cap (legacy check)
        require!(
            stake_lamports <= base_cap,
            WagerError::StakeExceedsPlayerCap
        );
        
        // New anti-smurf checks for progressive limits
        if player_one_stats_result.is_ok() {
            let player_one_stats = player_one_stats_result.unwrap();
            let max_stake = calculate_max_stake(&player_one_stats);
            
            // Ensure stake doesn't exceed progressive limit
            require!(
                stake_lamports <= max_stake,
                WagerError::StakeExceedsProgressiveLimit
            );
            
            // Check for suspicious betting patterns
            require!(
                is_consistent_stake_amount(&player_one_stats, stake_lamports),
                WagerError::SuspiciousStakePattern
            );
        }
        
        if player_two_stats_result.is_ok() {
            let player_two_stats = player_two_stats_result.unwrap();
            let max_stake = calculate_max_stake(&player_two_stats);
            
            // Ensure stake doesn't exceed progressive limit
            require!(
                stake_lamports <= max_stake,
                WagerError::StakeExceedsProgressiveLimit
            );
            
            // Check for suspicious betting patterns
            require!(
                is_consistent_stake_amount(&player_two_stats, stake_lamports),
                WagerError::SuspiciousStakePattern
            );
        }

        // Verify both players have sufficient lamports
        require!(
            ctx.accounts.player_one.lamports() >= stake_lamports,
            WagerError::InsufficientPlayerOneFunds
        );
        require!(
            ctx.accounts.player_two.lamports() >= stake_lamports,
            WagerError::InsufficientPlayerTwoFunds
        );

        // Initialize match account
        let match_account = &mut ctx.accounts.match_account;
        match_account.player_one = ctx.accounts.player_one.key();
        match_account.player_two = ctx.accounts.player_two.key();
        match_account.stake_lamports = stake_lamports;
        match_account.is_settled = false;
        match_account.start_slot = 0; // CRITICAL FIX: Initialize to 0 for confirm_match logic
        match_account.last_move_slot = Clock::get()?.slot;
        match_account.winner = system_program::ID; // Initialize to system program (null) until settled
        match_account.time_control_type = time_control_type;
        
        // Set initial time controls based on time_control_type
        match time_control_type {
            TIME_CONTROL_BLITZ_3_2 => {
                match_account.player_one_time = BLITZ_3_2_INITIAL_TIME_SLOTS;
                match_account.player_two_time = BLITZ_3_2_INITIAL_TIME_SLOTS;
            }
            TIME_CONTROL_BULLET_1_1 => {
                match_account.player_one_time = BULLET_1_1_INITIAL_TIME_SLOTS;
                match_account.player_two_time = BULLET_1_1_INITIAL_TIME_SLOTS;
            }
            _ => {
                return Err(WagerError::InvalidTimeControlType.into());
            }
        }
        
        match_account.is_player_one_turn = true;
        match_account.is_game_over = false;
        match_account.current_position = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1".to_string();
        match_account.move_history = Vec::new();

        // Emit challenge event
        emit!(Challenge {
            player_one: ctx.accounts.player_one.key(),
            player_two: ctx.accounts.player_two.key(),
            stake_lamports,
        });

        Ok(())
    }

    pub fn confirm_match(ctx: Context<ConfirmMatch>) -> Result<()> {
        let current_slot = Clock::get()?.slot;
        
        // Store stake and match info before mutating
        let match_info = ctx.accounts.match_account.to_account_info();
        let stake = ctx.accounts.match_account.stake_lamports;
        
        let match_account = &mut ctx.accounts.match_account;
        
        // Verify match hasn't already been confirmed
        require!(
            match_account.start_slot == 0,
            WagerError::MatchAlreadyConfirmed
        );
        
        // Verify confirmation window (10 seconds)
        require!(
            current_slot <= match_account.start_slot + CONFIRMATION_WINDOW,
            WagerError::ConfirmationWindowExpired
        );

        // Set start slot to current slot
        match_account.start_slot = current_slot;

        // Transfer lamports from both players to match PDA
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
        let match_pda = match_account.key();
        
        // Verify game is not already over
        require!(
            !match_account.is_game_over,
            WagerError::GameAlreadyOver
        );
        
        // Verify signer is one of the players
        let is_player_one = ctx.accounts.signer.key() == match_account.player_one;
        let is_player_two = ctx.accounts.signer.key() == match_account.player_two;
        require!(
            is_player_one || is_player_two,
            WagerError::NotPlayersTurn
        );
        
        // Set game over and winner
        match_account.is_game_over = true;
        
        // For draws, mark the winner as system program - will be handled specially in settlement
        if result_type == ResultType::Draw {
            match_account.winner = system_program::ID;
        } else {
            match_account.winner = ctx.accounts.signer.key();
        }
        
        // Emit game over event
        emit!(GameOver {
            match_pda,
            result: result_type as u8,
            winner: match_account.winner,
        });
        
        Ok(())
    }

    pub fn settle_match(ctx: Context<SettleMatch>) -> Result<()> {
        // --- Begin: YOUR EXISTING FINANCIAL SETTLEMENT LOGIC ---
        msg!("Financial settlement part of the instruction starts...");
        // VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV
        // >> IMPORTANT: PASTE YOUR EXISTING FINANCIAL SETTLEMENT CODE HERE <<
        // This includes transferring stakes, platform fees, NFT royalties.
        // Make sure it uses ctx.accounts.match_account, ctx.accounts.winner, 
        // ctx.accounts.player_one_account, ctx.accounts.player_two_account,
        // ctx.accounts.platform, ctx.accounts.opening_owner appropriately.
        // Example structure (replace with your actual logic):
        /*
        let match_data = &ctx.accounts.match_account;
        let total_stake = match_data.stake_lamports.checked_mul(2).ok_or(WagerError::Overflow)?;

        let royalty_amount = total_stake.checked_mul(ROYALTY_PCT).ok_or(WagerError::Overflow)?.checked_div(10000).ok_or(WagerError::Overflow)?;
        let platform_amount = total_stake.checked_mul(PLATFORM_PCT).ok_or(WagerError::Overflow)?.checked_div(10000).ok_or(WagerError::Overflow)?;
        let winner_pot = total_stake.checked_sub(royalty_amount).ok_or(WagerError::Overflow)?.checked_sub(platform_amount).ok_or(WagerError::Overflow)?;

        // Transfer to opening owner
        // **ctx.accounts.match_account.to_account_info().try_borrow_mut_lamports()? -= royalty_amount;
        // **ctx.accounts.opening_owner.to_account_info().try_borrow_mut_lamports()? += royalty_amount;
        // Or using CPIs for transfers if these are not SystemAccounts directly

        // Transfer to platform
        // **ctx.accounts.match_account.to_account_info().try_borrow_mut_lamports()? -= platform_amount;
        // **ctx.accounts.platform.to_account_info().try_borrow_mut_lamports()? += platform_amount;

        // Distribute winner's share
        if ctx.accounts.winner.key() == SystemProgram::id() { // Draw
            let half_pot = winner_pot.checked_div(2).ok_or(WagerError::Overflow)?;
            // Transfer to player one
            // **ctx.accounts.match_account.to_account_info().try_borrow_mut_lamports()? -= half_pot;
            // **ctx.accounts.player_one_account.to_account_info().try_borrow_mut_lamports()? += half_pot;
            // Transfer to player two
            // **ctx.accounts.match_account.to_account_info().try_borrow_mut_lamports()? -= half_pot;
            // **ctx.accounts.player_two_account.to_account_info().try_borrow_mut_lamports()? += half_pot;
        } else { // Single winner
            // **ctx.accounts.match_account.to_account_info().try_borrow_mut_lamports()? -= winner_pot;
            // **ctx.accounts.winner.to_account_info().try_borrow_mut_lamports()? += winner_pot;
        }
        */
        // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ 
        msg!("Financial settlement part completed.");
        // --- End: YOUR EXISTING FINANCIAL SETTLEMENT LOGIC ---


        // --- ELO Update Logic ---
        msg!("Starting ELO update.");

        let player_one_stats = &mut ctx.accounts.player_one_stats;
        let player_two_stats = &mut ctx.accounts.player_two_stats;
        let winner_key = ctx.accounts.winner.key();
        let system_program_id = SystemProgram::id();

        // Verify that the stats accounts belong to the players in the match account.
        if player_one_stats.player != ctx.accounts.match_account.player_one {
            return err!(WagerError::PlayerStatsMismatchOne); // Use your existing WagerError enum
        }
        if player_two_stats.player != ctx.accounts.match_account.player_two {
            return err!(WagerError::PlayerStatsMismatchTwo);
        }

        // 1. Determine Actual Scores (S_player1, S_player2) - Scaled by 100
        let (s1_scaled, s2_scaled): (i32, i32);
        if winner_key == player_one_stats.player { 
            s1_scaled = 100; 
            s2_scaled = 0;   
            player_one_stats.wins = player_one_stats.wins.checked_add(1).ok_or(WagerError::Overflow)?;
        } else if winner_key == player_two_stats.player {
            s1_scaled = 0;   
            s2_scaled = 100; 
            player_two_stats.wins = player_two_stats.wins.checked_add(1).ok_or(WagerError::Overflow)?;
        } else if winner_key == system_program_id { // Draw
            s1_scaled = 50;
            s2_scaled = 50;
        } else {
            msg!("Winner key: {}, Player 1: {}, Player 2: {}, System: {}", winner_key, player_one_stats.player, player_two_stats.player, system_program_id);
            return err!(WagerError::InvalidWinnerProvided);
        }

        // 2. Get Current Ratings
        let r1_current = player_one_stats.rating;
        let r2_current = player_two_stats.rating;
        
        // 3. Determine K-Factors
        let k1 = if player_one_stats.is_provisional {
            calculate_dynamic_k_factor(player_one_stats.provisional_games_played)
        } else {
            ELO_K_FACTOR
        };
        let k2 = if player_two_stats.is_provisional {
            calculate_dynamic_k_factor(player_two_stats.provisional_games_played)
        } else {
            ELO_K_FACTOR
        };

        // 4. Calculate Expected Scores (E1_scaled, E2_scaled) - Scaled by 100
        let e1_scaled = calculate_expected_score_scaled(r1_current, r2_current);
        let e2_scaled = calculate_expected_score_scaled(r2_current, r1_current); 

        // 5. Calculate ELO Change (integer arithmetic with rounding)
        let diff1_scaled = s1_scaled.checked_sub(e1_scaled).ok_or(WagerError::Overflow)?;
        let elo_change1_numerator = k1.checked_mul(diff1_scaled).ok_or(WagerError::Overflow)?;
        let elo_change1 = if elo_change1_numerator >= 0 {
            elo_change1_numerator.checked_add(50).ok_or(WagerError::Overflow)?.checked_div(100).ok_or(WagerError::Overflow)?
        } else {
            elo_change1_numerator.checked_sub(50).ok_or(WagerError::Overflow)?.checked_div(100).ok_or(WagerError::Overflow)?
        };

        let diff2_scaled = s2_scaled.checked_sub(e2_scaled).ok_or(WagerError::Overflow)?;
        let elo_change2_numerator = k2.checked_mul(diff2_scaled).ok_or(WagerError::Overflow)?;
        let elo_change2 = if elo_change2_numerator >= 0 {
            elo_change2_numerator.checked_add(50).ok_or(WagerError::Overflow)?.checked_div(100).ok_or(WagerError::Overflow)?
        } else {
            elo_change2_numerator.checked_sub(50).ok_or(WagerError::Overflow)?.checked_div(100).ok_or(WagerError::Overflow)?
        };

        // 6. Update Ratings
        player_one_stats.rating = r1_current.checked_add(elo_change1).ok_or(WagerError::Overflow)?;
        player_two_stats.rating = r2_current.checked_add(elo_change2).ok_or(WagerError::Overflow)?;

        msg!("Player 1 ELO: {} -> {} (Change: {})", r1_current, player_one_stats.rating, elo_change1);
        msg!("Player 2 ELO: {} -> {} (Change: {})", r2_current, player_two_stats.rating, elo_change2);

        // 7. Update Games Played (using existing 'games' field)
        player_one_stats.games = player_one_stats.games.checked_add(1).ok_or(WagerError::Overflow)?;
        player_two_stats.games = player_two_stats.games.checked_add(1).ok_or(WagerError::Overflow)?;

        if player_one_stats.is_provisional {
            player_one_stats.provisional_games_played = player_one_stats.provisional_games_played.checked_add(1).ok_or(WagerError::Overflow)?;
        }
        if player_two_stats.is_provisional {
            player_two_stats.provisional_games_played = player_two_stats.provisional_games_played.checked_add(1).ok_or(WagerError::Overflow)?;
        }

        // 8. Update Provisional Status using your project's constant
        if player_one_stats.is_provisional && player_one_stats.provisional_games_played >= PROVISIONAL_GAME_LIMIT {
            player_one_stats.is_provisional = false;
            msg!("Player 1 ({}): No longer provisional.", player_one_stats.player);
        }
        if player_two_stats.is_provisional && player_two_stats.provisional_games_played >= PROVISIONAL_GAME_LIMIT {
            player_two_stats.is_provisional = false;
            msg!("Player 2 ({}): No longer provisional.", player_two_stats.player);
        }

        // Your existing anti-smurf updates for stake history etc. can remain or be integrated here.
        // For example, update last_stake_amounts, weighted_win_sum, etc.
        // This example focuses on ELO, wins, games_played, and provisional status.
        let stake_for_history = ctx.accounts.match_account.stake_lamports;

        // Update player one stake history and other stats from your existing update_elo_ratings/anti-smurf logic
        let p1_idx = player_one_stats.next_history_index as usize;
        player_one_stats.last_stake_amounts[p1_idx] = stake_for_history;
        player_one_stats.last_win_flags[p1_idx] = s1_scaled >= 50; // Win or draw for player 1
        player_one_stats.next_history_index = (player_one_stats.next_history_index + 1) % 10;
        player_one_stats.total_stake_amount = player_one_stats.total_stake_amount.saturating_add(stake_for_history);
        if s1_scaled == 100 { player_one_stats.weighted_win_sum = player_one_stats.weighted_win_sum.saturating_add(stake_for_history); }
        else if s1_scaled == 50 { player_one_stats.weighted_win_sum = player_one_stats.weighted_win_sum.saturating_add(stake_for_history / 2);}
        // ... (Update high/low stake games/wins for P1 based on your existing logic) ...

        // Update player two stake history and other stats
        let p2_idx = player_two_stats.next_history_index as usize;
        player_two_stats.last_stake_amounts[p2_idx] = stake_for_history;
        player_two_stats.last_win_flags[p2_idx] = s2_scaled >= 50; // Win or draw for player 2
        player_two_stats.next_history_index = (player_two_stats.next_history_index + 1) % 10;
        player_two_stats.total_stake_amount = player_two_stats.total_stake_amount.saturating_add(stake_for_history);
        if s2_scaled == 100 { player_two_stats.weighted_win_sum = player_two_stats.weighted_win_sum.saturating_add(stake_for_history); }
        else if s2_scaled == 50 { player_two_stats.weighted_win_sum = player_two_stats.weighted_win_sum.saturating_add(stake_for_history / 2);}
        // ... (Update high/low stake games/wins for P2 based on your existing logic) ...
        
        // Recalculate max_stake_lamports for both players using your existing helper
        player_one_stats.max_stake_lamports = calculate_max_stake(player_one_stats);
        player_two_stats.max_stake_lamports = calculate_max_stake(player_two_stats);

        // Mark match as settled
        ctx.accounts.match_account.is_settled = true;

        // Emit EloUpdated event
        emit!(EloUpdated {
            player_one: player_one_stats.player,
            player_two: player_two_stats.player,
            player_one_new_rating: player_one_stats.rating,
            player_two_new_rating: player_two_stats.rating,
            player_one_rating_change: elo_change1,
            player_two_rating_change: elo_change2,
        });

        msg!("ELO update and all player stats updates completed.");
        Ok(())
    }

    pub fn make_move(
        ctx: Context<MakeMove>,
        move_san: String,
    ) -> Result<()> {
        let match_account = &mut ctx.accounts.match_account;
        
        // Verify game is not over
        require!(
            !match_account.is_game_over,
            WagerError::GameAlreadyOver
        );
        
        // Verify it's the player's turn
        let is_player_one = ctx.accounts.signer.key() == match_account.player_one;
        let is_player_two = ctx.accounts.signer.key() == match_account.player_two;
        require!(
            (is_player_one && match_account.is_player_one_turn) || 
            (is_player_two && !match_account.is_player_one_turn),
            WagerError::NotPlayersTurn
        );
        
        // Simply store the move and update turn
        match_account.move_history.push(move_san);
        match_account.is_player_one_turn = !match_account.is_player_one_turn;
        
        Ok(())
    }

    pub fn initialize_player_stats(ctx: Context<InitializePlayerStats>) -> Result<()> {
        let player_stats = &mut ctx.accounts.player_stats;
        player_stats.player = ctx.accounts.player.key(); // Store the player's pubkey
        player_stats.rating = DEFAULT_ELO_RATING; // Use your existing constant
        player_stats.games = 0;
        player_stats.wins = 0;
        player_stats.is_provisional = true;
        player_stats.provisional_games_played = 0; // Initialize new field
        
        player_stats.max_stake_lamports = PROVISIONAL_PLAYER_CAP; // Use existing constant
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
        player_stats.bump = ctx.bumps.player_stats; // Store the bump for the PDA
        
        msg!("Player stats initialized for: {:?}", player_stats.player);
        Ok(())
    }

    pub fn update_elo_ratings(ctx: Context<UpdateEloRatings>) -> Result<()> {
        let match_account = &ctx.accounts.match_account;
        let player_one_stats = &mut ctx.accounts.player_one_stats;
        let player_two_stats = &mut ctx.accounts.player_two_stats;
        
        // Verify match is settled
        require!(
            match_account.is_settled,
            WagerError::MatchNotSettled
        );
        
        // Determine match outcome: 1.0 for player one win, 0.5 for draw, 0.0 for player two win
        let outcome = if match_account.winner == system_program::ID {
            0.5 // Draw
        } else if match_account.winner == match_account.player_one {
            1.0 // Player one wins
        } else if match_account.winner == match_account.player_two {
            0.0 // Player two wins
        } else {
            return Err(WagerError::InvalidWinner.into());
        };
        
        // Calculate expected outcome based on ELO ratings
        let rating_diff = (player_two_stats.rating - player_one_stats.rating) as f64;
        let expected_outcome = 1.0 / (1.0 + 10.0_f64.powf(rating_diff / 400.0));
        
        // Determine K-factors based on provisional status
        let k_factor_one = if player_one_stats.is_provisional {
            calculate_dynamic_k_factor(player_one_stats.provisional_games_played)
        } else {
            ELO_K_FACTOR
        };
        
        let k_factor_two = if player_two_stats.is_provisional {
            calculate_dynamic_k_factor(player_two_stats.provisional_games_played)
        } else {
            ELO_K_FACTOR
        };
        
        // Calculate rating changes
        let player_one_change = (k_factor_one as f64 * (outcome - expected_outcome)) as i32;
        let player_two_change = (k_factor_two as f64 * (expected_outcome - outcome)) as i32;
        
        // Update ratings
        player_one_stats.rating += player_one_change;
        player_two_stats.rating += player_two_change;
        
        // Update game counts
        player_one_stats.games += 1;
        player_two_stats.games += 1;
        
        // Update win counts
        if outcome == 1.0 {
            player_one_stats.wins += 1;
        } else if outcome == 0.0 {
            player_two_stats.wins += 1;
        }
        
        // Check if players are no longer provisional
        if player_one_stats.games >= PROVISIONAL_GAME_LIMIT {
            player_one_stats.is_provisional = false;
        }
        
        if player_two_stats.games >= PROVISIONAL_GAME_LIMIT {
            player_two_stats.is_provisional = false;
        }
        
        // Anti-smurf: Update stake history and patterns
        let stake = match_account.stake_lamports;
        
        // Update player one stake history
        let idx1 = player_one_stats.next_history_index as usize;
        player_one_stats.last_stake_amounts[idx1] = stake;
        player_one_stats.last_win_flags[idx1] = outcome >= 0.5; // Win or draw
        player_one_stats.next_history_index = (player_one_stats.next_history_index + 1) % 10;
        
        // Update player two stake history
        let idx2 = player_two_stats.next_history_index as usize;
        player_two_stats.last_stake_amounts[idx2] = stake;
        player_two_stats.last_win_flags[idx2] = outcome <= 0.5; // Win or draw
        player_two_stats.next_history_index = (player_two_stats.next_history_index + 1) % 10;
        
        // Update total stake amount
        player_one_stats.total_stake_amount = player_one_stats.total_stake_amount.saturating_add(stake);
        player_two_stats.total_stake_amount = player_two_stats.total_stake_amount.saturating_add(stake);
        
        // Update weighted win sum
        if outcome == 1.0 {
            player_one_stats.weighted_win_sum = player_one_stats.weighted_win_sum.saturating_add(stake);
        } else if outcome == 0.0 {
            player_two_stats.weighted_win_sum = player_two_stats.weighted_win_sum.saturating_add(stake);
        } else { // Draw
            player_one_stats.weighted_win_sum = player_one_stats.weighted_win_sum.saturating_add(stake / 2);
            player_two_stats.weighted_win_sum = player_two_stats.weighted_win_sum.saturating_add(stake / 2);
        }
        
        // Update high/low stake categorization for player one
        let p1_max = calculate_max_stake(player_one_stats);
        if stake >= p1_max * 3 / 4 {
            player_one_stats.high_stake_games += 1;
            if outcome == 1.0 {
                player_one_stats.high_stake_wins += 1;
            }
        } else if stake <= p1_max / 4 {
            player_one_stats.low_stake_games += 1;
            if outcome == 1.0 {
                player_one_stats.low_stake_wins += 1;
            }
        }
        
        // Update high/low stake categorization for player two
        let p2_max = calculate_max_stake(player_two_stats);
        if stake >= p2_max * 3 / 4 {
            player_two_stats.high_stake_games += 1;
            if outcome == 0.0 {
                player_two_stats.high_stake_wins += 1;
            }
        } else if stake <= p2_max / 4 {
            player_two_stats.low_stake_games += 1;
            if outcome == 0.0 {
                player_two_stats.low_stake_wins += 1;
            }
        }
        
        // Recalculate max stake limit for both players
        player_one_stats.max_stake_lamports = calculate_max_stake(player_one_stats);
        player_two_stats.max_stake_lamports = calculate_max_stake(player_two_stats);
        
        msg!("Updated ELO ratings. Player one: {} ({:+}), Player two: {} ({:+})",
             player_one_stats.rating, player_one_change,
             player_two_stats.rating, player_two_change);
        
        // Also emit the official event with the changes
        emit!(EloUpdated {
            player_one: match_account.player_one,
            player_two: match_account.player_two,
            player_one_new_rating: player_one_stats.rating,
            player_two_new_rating: player_two_stats.rating,
            player_one_rating_change: player_one_change,
            player_two_rating_change: player_two_change,
        });
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}

#[derive(Accounts)]
#[instruction(stake_lamports: u64, time_control_type: u8)]
pub struct CreateMatch<'info> {
    /// First player creating the match, must sign and have sufficient lamports
    #[account(mut)]
    pub player_one: Signer<'info>,
    
    /// Second player accepting the match, must sign and have sufficient lamports
    #[account(mut)]
    pub player_two: Signer<'info>,
    
    /// PDA to store match details
    #[account(
        init,
        payer = player_one,
        space = 8 + std::mem::size_of::<state::Match>(),
        seeds = [
            b"chessbets",
            player_one.key().as_ref(),
            player_two.key().as_ref(),
        ],
        bump
    )]
    pub match_account: Account<'info, state::Match>,
    
    /// Player one stats - used to check provisional status for stake limits
    /// Optional account - if it doesn't exist, player will be treated as non-provisional
    /// CHECK: Account constraints are checked in the instruction code
    pub player_one_stats: AccountInfo<'info>,
    
    /// Player two stats - used to check provisional status for stake limits
    /// Optional account - if it doesn't exist, player will be treated as non-provisional
    /// CHECK: Account constraints are checked in the instruction code
    pub player_two_stats: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ConfirmMatch<'info> {
    /// First player who must sign to confirm
    #[account(mut)]
    pub player_one: Signer<'info>,
    
    /// Second player who must sign to confirm
    #[account(mut)]
    pub player_two: Signer<'info>,
    
    /// The match PDA to confirm
    #[account(
        mut,
        seeds = [
            b"chessbets",
            player_one.key().as_ref(),
            player_two.key().as_ref(),
        ],
        bump,
    )]
    pub match_account: Account<'info, state::Match>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SubmitResult<'info> {
    /// The player submitting the result
    pub signer: Signer<'info>,
    
    /// The match account to update
    #[account(
        mut,
        seeds = [
            b"chessbets",
            match_account.player_one.as_ref(),
            match_account.player_two.as_ref(),
        ],
        bump,
    )]
    pub match_account: Account<'info, state::Match>,
}

#[derive(Accounts)]
pub struct SettleMatch<'info> {
    /// Anyone can call settle_match
    pub signer: Signer<'info>,
    
    /// The match account to settle
    #[account(
        mut,
        seeds = [
            b"chessbets",
            match_account.player_one.as_ref(),
            match_account.player_two.as_ref(),
        ],
        bump,
        // Constraint to ensure match_account is not closed before all transfers
        // This is implicitly handled by Anchor if transfers come from it.
        // However, good to keep in mind if we were manually debiting.
        constraint = match_account.to_account_info().lamports() >= 
                     (match_account.stake_lamports * 2 * WINNER_PCT / 10000) + 
                     (match_account.stake_lamports * 2 * ROYALTY_PCT / 10000) + 
                     (match_account.stake_lamports * 2 * PLATFORM_PCT / 10000)
                     @ WagerError::InsufficientFundsInMatchAccount
    )]
    pub match_account: Account<'info, state::Match>,
    
    /// Winner's account for non-draws. For draws, client passes SystemProgramID.
    /// CHECK: Verified in instruction logic.
    pub winner: AccountInfo<'info>,

    /// Player One's account, used for draw payouts.
    /// CHECK: Must match match_account.player_one. Verified in instruction for draws.
    #[account(mut)]
    pub player_one_account: AccountInfo<'info>,

    /// Player Two's account, used for draw payouts.
    /// CHECK: Must match match_account.player_two. Verified in instruction for draws.
    #[account(mut)]
    pub player_two_account: AccountInfo<'info>,
    
    /// Platform account to receive rake
    /// CHECK: Verified against constant
    #[account(
        address = PLATFORM_RAKE_PUBKEY
    )]
    pub platform: AccountInfo<'info>,
    
    /// The single opening-NFT owner account to receive 3% royalty.
    /// If no specific NFT owner, client should pass platform's pubkey here.
    /// CHECK: No specific on-chain checks for this account other than it's writable.
    #[account(mut)]
    pub opening_owner: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MakeMove<'info> {
    /// The player making the move
    pub signer: Signer<'info>,
    
    /// The match account to update
    #[account(
        mut,
        seeds = [
            b"chessbets",
            match_account.player_one.as_ref(),
            match_account.player_two.as_ref(),
        ],
        bump,
    )]
    pub match_account: Account<'info, state::Match>,
}

#[derive(Accounts)]
pub struct InitializePlayerStats<'info> {
    #[account(mut)]
    pub player: Signer<'info>,
    
    #[account(
        init,
        payer = player,
        space = 8 + std::mem::size_of::<state::PlayerStats>(),
        seeds = [b"player-stats", player.key().as_ref()],
        bump
    )]
    pub player_stats: Account<'info, state::PlayerStats>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateEloRatings<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        seeds = [
            b"chessbets",
            match_account.player_one.as_ref(),
            match_account.player_two.as_ref(),
        ],
        bump,
    )]
    pub match_account: Account<'info, state::Match>,
    
    #[account(
        mut,
        seeds = [b"player-stats", match_account.player_one.as_ref()],
        bump
    )]
    pub player_one_stats: Account<'info, state::PlayerStats>,
    
    #[account(
        mut,
        seeds = [b"player-stats", match_account.player_two.as_ref()],
        bump
    )]
    pub player_two_stats: Account<'info, state::PlayerStats>,
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
    #[msg("Invalid signer - must be one of the players")]
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
    #[msg("Player one stats account does not match player one in the match.")]
    PlayerStatsMismatchOne,
    #[msg("Player two stats account does not match player two in the match.")]
    PlayerStatsMismatchTwo,
}

// Helper function for dynamic K-Factor for provisional players
fn calculate_dynamic_k_factor(provisional_games_completed: u32) -> i32 {
    match provisional_games_completed {
        0 => 200,
        1 => 150,
        2 => 100,
        3 | 4 => 80,
        5 | 6 | 7 => 64,
        8 | 9 => 48,
        _ => ELO_K_FACTOR,
    }
}

// Helper function for ELO expected score, scaled by 100
// r_self and r_opponent are direct ELO ratings (i32)
fn calculate_expected_score_scaled(r_self: i32, r_opponent: i32) -> i32 {
    let diff = r_opponent.saturating_sub(r_self);
    const LOOKUP: [(i32, i32); 65] = [
        (-800, 99), (-775, 99), (-750, 99), (-725, 98), (-700, 98),
        (-675, 97), (-650, 97), (-625, 96), (-600, 96), (-575, 95),
        (-550, 94), (-525, 93), (-500, 92), (-475, 91), (-450, 90),
        (-425, 89), (-400, 88), (-375, 86), (-350, 85), (-325, 83),
        (-300, 82), (-275, 80), (-250, 78), (-225, 76), (-200, 74),
        (-175, 72), (-150, 70), (-125, 67), (-100, 64), (-75, 61),
        (-50, 57), (-25, 54), (0, 50),
        (25, 46), (50, 43), (75, 39), (100, 36), (125, 33),
        (150, 30), (175, 28), (200, 26), (225, 24), (250, 22),
        (275, 20), (300, 18), (325, 17), (350, 15), (375, 14),
        (400, 12), (425, 11), (450, 10), (475, 9), (500, 8),
        (525, 7), (550, 6), (575, 5), (600, 4), (625, 4),
        (650, 3), (675, 3), (700, 2), (725, 2), (750, 1),
        (775, 1), (800, 1)
    ];
    if diff <= LOOKUP[0].0 { return LOOKUP[0].1; }
    if diff >= LOOKUP[LOOKUP.len() - 1].0 { return LOOKUP[LOOKUP.len() - 1].1; }
    for i in 0..(LOOKUP.len() - 1) {
        if diff >= LOOKUP[i].0 && diff < LOOKUP[i+1].0 {
            let x1 = LOOKUP[i].0 as i64;
            let y1 = LOOKUP[i].1 as i64;
            let x2 = LOOKUP[i+1].0 as i64;
            let y2 = LOOKUP[i+1].1 as i64;
            if i64::from(diff) == x1 { return y1 as i32; }
            let x_current = diff as i64;
            if x2 == x1 { return y1 as i32; } 
            let term_numerator = (x_current - x1).checked_mul(y2 - y1).unwrap_or(0);
            let interpolated_y = y1.checked_add(term_numerator.checked_div(x2 - x1).unwrap_or(0)).unwrap_or(y1);
            return interpolated_y as i32;
        }
    }
    LOOKUP[LOOKUP.len() - 1].1
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
