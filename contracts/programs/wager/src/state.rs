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