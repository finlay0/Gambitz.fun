use anchor_lang::prelude::*;

/// Represents a chess match between two players with associated stake and outcome information
#[account]
#[derive(Default)]
pub struct Match {
    /// The public key of the first player who created the match
    pub player_one: Pubkey,
    
    /// The public key of the second player who accepted the match
    pub player_two: Pubkey,
    
    /// The amount of lamports staked in this match
    pub stake_lamports: u64,
    
    /// The public key of the winning player
    pub winner: Pubkey,
    
    /// Whether the match has been settled and rewards distributed
    pub is_settled: bool,
    
    /// The slot number when the match started
    pub start_slot: u64,
    
    /// The slot number of the last move
    pub last_move_slot: u64,
    
    /// Time remaining for player one in slots (40 slots per second)
    pub player_one_time: u64,
    
    /// Time remaining for player two in slots (40 slots per second)
    pub player_two_time: u64,
    
    /// Current player's turn (true for player one, false for player two)
    pub is_player_one_turn: bool,
    
    /// Whether the game has ended
    pub is_game_over: bool,
    
    /// Identifier for the time control (e.g., 0 for Blitz 3+2, 1 for Bullet 1+1)
    pub time_control_type: u8,
    
    /// The FEN string representing the current board position
    pub current_position: String,
    
    /// The move history in SAN notation
    pub move_history: Vec<String>,
    pub bump: u8, // Added bump for Match PDA consistency
}

/// Tracks a player's chess statistics and rating
#[account]
#[derive(Default)]
pub struct PlayerStats {
    pub player: Pubkey, // ADDED: Pubkey of the player these stats belong to
    /// The player's ELO rating
    pub rating: i32,
    
    /// Total number of games played (using existing 'games' field)
    pub games: u32,
    
    /// Total number of games won
    pub wins: u32,
    
    /// Whether the player's rating is still provisional (typically true for new players)
    pub is_provisional: bool,
    pub provisional_games_played: u32, // ADDED: Games played while provisional
    
    /// Current maximum stake limit for this player (based on game count and patterns)
    pub max_stake_lamports: u64,
    
    /// Sum of (stake × win/loss outcome) - used to calculate weighted win rate
    pub weighted_win_sum: u64,
    
    /// Sum of all stakes the player has played
    pub total_stake_amount: u64,
    
    /// Wins in games with stakes in the top 25% of player's allowable range
    pub high_stake_wins: u32,
    
    /// Games played with stakes in the top 25% of player's allowable range
    pub high_stake_games: u32,
    
    /// Wins in games with stakes in the bottom 25% of player's allowable range
    pub low_stake_wins: u32,
    
    /// Games played with stakes in the bottom 25% of player's allowable range
    pub low_stake_games: u32,
    
    /// Slot when the player stats account was created - used for account age checks
    pub account_creation_slot: u64,
    
    /// Circular buffer of last 10 stake amounts
    pub last_stake_amounts: [u64; 10],
    
    /// Circular buffer of last 10 game outcomes (true = win, false = loss/draw)
    pub last_win_flags: [bool; 10],
    
    /// Index for circular buffer insertion
    pub next_history_index: u8,
    pub bump: u8, // ADDED/ENSURED: Bump for the PlayerStats PDA
}

impl PlayerStats {
    // Re-calculate LEN based on current fields including new ones
    pub const LEN: usize = 8 // Discriminator
        + 32 // player (Pubkey)
        + 4  // rating (i32)
        + 4  // games (u32)
        + 4  // wins (u32)
        + 1  // is_provisional (bool)
        + 4  // provisional_games_played (u32)
        + 8  // max_stake_lamports (u64)
        + 8  // weighted_win_sum (u64)
        + 8  // total_stake_amount (u64)
        + 4  // high_stake_wins (u32)
        + 4  // high_stake_games (u32)
        + 4  // low_stake_wins (u32)
        + 4  // low_stake_games (u32)
        + 8  // account_creation_slot (u64)
        + (10 * 8) // last_stake_amounts ([u64; 10])
        + (10 * 1) // last_win_flags ([bool; 10])
        + 1  // next_history_index (u8)
        + 1; // bump (u8)
}

// Adding LEN for Match struct for consistency if not already present elsewhere
impl Match {
    // Adjust String and Vec sizes based on your constraints
    // This is a ROUGH estimate, especially for String/Vec. Calculate precisely.
    const MAX_FEN_LEN: usize = 90; // Example max FEN length
    const MAX_MOVES: usize = 200; // Example max moves in history
    const SAN_MOVE_AVG_LEN: usize = 6; // Example average SAN move length

    pub const LEN: usize = 8 // Discriminator
        + 32 // player_one
        + 32 // player_two
        + 8  // stake_lamports
        + 32 // winner
        + 1  // is_settled
        + 8  // start_slot
        + 8  // last_move_slot
        + 8  // player_one_time
        + 8  // player_two_time
        + 1  // is_player_one_turn
        + 1  // is_game_over
        + 1  // time_control_type
        + (4 + Match::MAX_FEN_LEN) // current_position (String = 4 bytes length + capacity)
        + (4 + Match::MAX_MOVES * (4 + Match::SAN_MOVE_AVG_LEN)) // move_history (Vec<String>) - very rough
        + 1; // bump
}