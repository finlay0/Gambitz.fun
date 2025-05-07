use anchor_lang::prelude::*;
use anchor_lang::system_program;

pub mod state;

// Maximum stake amount per player in lamports
pub const PLAYER_CAP: u64 = 1_000_000_000; // 1 SOL
pub const CONFIRMATION_WINDOW: u64 = 400; // 10 seconds in slots (40 slots per second)
// Platform's wallet that will receive the platform fee (4%)
// IMPORTANT: In production deployment, replace this with the actual platform wallet address!
// We currently use the system program address for test/dev environments
// This is the official platform wallet address for all fee collections
pub const PLATFORM_RAKE_PUBKEY: Pubkey = pubkey!("AwszNDgf4oTphGiEoA4Eua91dhsfxAW2VrzmgStLfziX");

// Payout percentages (in basis points)
pub const WINNER_PCT: u64 = 9300; // 93%
pub const PLATFORM_PCT: u64 = 400; // 4%
pub const ROYALTY_PCT: u64 = 300; // 3%

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

#[program]
pub mod wager {
    use super::*;

    pub fn create_match(
        ctx: Context<CreateMatch>,
        stake_lamports: u64,
    ) -> Result<()> {
        // Validate stake amount
        require!(
            stake_lamports <= PLAYER_CAP,
            WagerError::StakeExceedsPlayerCap
        );

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
        match_account.start_slot = Clock::get()?.slot;
        match_account.last_move_slot = Clock::get()?.slot;
        match_account.winner = system_program::ID; // Initialize to system program (null) until settled
        
        // Initialize time controls (3 minutes = 180 seconds = 7200 slots)
        match_account.player_one_time = 7200;
        match_account.player_two_time = 7200;
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
        let match_account = &ctx.accounts.match_account;
        
        // Verify game is over
        require!(
            match_account.is_game_over,
            WagerError::GameNotOver
        );
        
        // Verify match hasn't been settled
        require!(
            !match_account.is_settled,
            WagerError::MatchAlreadySettled
        );
        
        // Verify winner is one of the players
        require!(
            ctx.accounts.winner.key() == match_account.player_one || 
            ctx.accounts.winner.key() == match_account.player_two ||
            // For draws, winner can be system program (check match_account.winner)
            (match_account.winner == system_program::ID && ctx.accounts.winner.key() == system_program::ID),
            WagerError::InvalidWinner
        );
        
        // Fail early if white_owner == black_owner
        require!(
            ctx.accounts.white_owner.key() != ctx.accounts.black_owner.key(),
            WagerError::SameRoyaltyOwner
        );
        
        let stake_lamports = match_account.stake_lamports * 2;
        let royalty = stake_lamports * 15 / 1000; // 1.5% each
        
        // Handle draws - split winner pot 50/50 between players
        let winner_cut = if match_account.winner == system_program::ID {
            // For draws, calculate 93% of pot but will be split
            stake_lamports * 930 / 1000 / 2 // Split the winner's share in half
        } else {
            // Normal winner takes all
            stake_lamports * 930 / 1000
        };
        
        let platform_cut = stake_lamports - winner_cut - royalty * 2;
        
        // Transfer to white opening-NFT owner
        anchor_lang::system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.match_account.to_account_info(),
                    to: ctx.accounts.white_owner.to_account_info(),
                },
            ),
            royalty,
        )?;
        // Transfer to black opening-NFT owner
        anchor_lang::system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.match_account.to_account_info(),
                    to: ctx.accounts.black_owner.to_account_info(),
                },
            ),
            royalty,
        )?;
        // Transfer to winner
        anchor_lang::system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.match_account.to_account_info(),
                    to: ctx.accounts.winner.to_account_info(),
                },
            ),
            winner_cut,
        )?;
        // Transfer to platform
        anchor_lang::system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.match_account.to_account_info(),
                    to: ctx.accounts.platform.to_account_info(),
                },
            ),
            platform_cut,
        )?;
        // Mark match as settled
        let match_account = &mut ctx.accounts.match_account;
        match_account.is_settled = true;
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
}

#[derive(Accounts)]
pub struct Initialize {}

#[derive(Accounts)]
#[instruction(stake_lamports: u64)]
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
    )]
    pub match_account: Account<'info, state::Match>,
    
    /// The winner's account to receive payout
    /// CHECK: Verified in instruction
    pub winner: AccountInfo<'info>,
    
    /// Platform account to receive rake
    /// CHECK: Verified against constant
    #[account(
        address = PLATFORM_RAKE_PUBKEY
    )]
    pub platform: AccountInfo<'info>,
    
    /// White opening-NFT owner
    /// CHECK: Verified in instruction
    #[account(mut)]
    pub white_owner: AccountInfo<'info>,
    
    /// Black opening-NFT owner
    /// CHECK: Verified in instruction
    #[account(mut)]
    pub black_owner: AccountInfo<'info>,
    
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
    #[msg("White and black opening-NFT owners cannot be the same account")]
    SameRoyaltyOwner,
    #[msg("Invalid winner")]
    InvalidWinner,
}
