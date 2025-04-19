use anchor_lang::prelude::*;
use anchor_lang::system_program;

pub mod state;

// Maximum stake amount per player in lamports
pub const PLAYER_CAP: u64 = 1_000_000_000; // 1 SOL
pub const CONFIRMATION_WINDOW: u64 = 30; // 10 seconds in slots
pub const PLATFORM_RAKE_PUBKEY: Pubkey = pubkey!("11111111111111111111111111111111"); // TODO: Replace with actual platform pubkey

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
        match_account.winner = system_program::ID; // Initialize to system program (null) until settled

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
        
        // Verify confirmation window
        require!(
            current_slot <= match_account.start_slot + CONFIRMATION_WINDOW,
            WagerError::ConfirmationWindowExpired
        );

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
                    to: match_info,
                },
            ),
            stake,
        )?;

        // Update match start slot to current slot
        match_account.start_slot = current_slot;

        // Emit confirmed event
        emit!(Confirmed {
            player_one: match_account.player_one,
            player_two: match_account.player_two,
            stake_lamports: stake,
            match_pda: ctx.accounts.match_account.key(),
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
        
        // Verify match hasn't been settled yet
        require!(
            match_account.winner == system_program::ID,
            WagerError::MatchAlreadySettled
        );
        
        // Verify signer is one of the players
        require!(
            ctx.accounts.signer.key() == match_account.player_one || 
            ctx.accounts.signer.key() == match_account.player_two,
            WagerError::InvalidSigner
        );

        // Set winner to signer
        match_account.winner = ctx.accounts.signer.key();

        // Emit game over event
        emit!(GameOver {
            match_pda: ctx.accounts.match_account.key(),
            result: result_type as u8,
            winner: ctx.accounts.signer.key(),
        });

        Ok(())
    }

    pub fn settle_match(ctx: Context<SettleMatch>) -> Result<()> {
        let match_account = &ctx.accounts.match_account;
        
        // Verify match hasn't been settled yet
        require!(
            !match_account.is_settled,
            WagerError::MatchAlreadySettled
        );
        
        // Verify match has a winner
        require!(
            match_account.winner != system_program::ID,
            WagerError::NoWinnerYet
        );

        // Calculate payouts
        let total_stake = match_account.stake_lamports.checked_mul(2).unwrap(); // 2x because both players staked
        let winner_payout = total_stake.checked_mul(WINNER_PCT).unwrap().checked_div(10000).unwrap();
        let platform_payout = total_stake.checked_mul(PLATFORM_PCT).unwrap().checked_div(10000).unwrap();
        // Royalty amount stays in PDA

        // Transfer to winner
        anchor_lang::system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.match_account.to_account_info(),
                    to: ctx.accounts.winner.to_account_info(),
                },
            ),
            winner_payout,
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
            platform_payout,
        )?;

        // Mark match as settled
        let match_account = &mut ctx.accounts.match_account;
        match_account.is_settled = true;

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
    
    pub system_program: Program<'info, System>,
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
}
