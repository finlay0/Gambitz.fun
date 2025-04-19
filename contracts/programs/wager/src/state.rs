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
    
    /// The FEN string representing the current board position
    pub current_position: String,
    
    /// The move history in SAN notation
    pub move_history: Vec<String>,
}

/// Tracks a player's chess statistics and rating
#[account]
#[derive(Default)]
pub struct PlayerStats {
    /// The player's ELO rating
    pub rating: i32,
    
    /// Total number of games played
    pub games: u32,
    
    /// Total number of games won
    pub wins: u32,
    
    /// Whether the player's rating is still provisional (typically true for new players)
    pub is_provisional: bool,
}