# Gambitz.win  
Real‑money blitz chess on Solana

Stake SOL, play 3 + 2, and claim trust‑minimised winnings secured by on‑chain escrow and AI cheat detection.

---

## 1 — Why It Matters
* **200 M+ online chess players** have no direct way to monetise skill.  
* Previous real‑money attempts failed because of engine cheating and payout disputes.  
* Solana's sub‑second finality and near‑zero fees let us escrow, verify and distribute stakes safely at lightning speed.

---

## 2 — How It Works

| Phase | What happens | Where it runs |
|-------|--------------|--------------|
| **1 · Stake & Match** | Player picks a preset stake (0.01 – 0.5 SOL) → queue pairs equal stakes | Next.js app + match‑maker WebSocket |
| **2 · Confirm Escrow** | 10 s confirmation window; both wallets sign `create_match` which transfers stake into a PDA | Anchor program |
| **3 · Play 3 + 2 Blitz** | Browsers relay moves over WebSocket; server mirrors timers to stop "pull the cable" tricks | Web + WS relay |
| **4 · AI Scan** | After each move we score "engine‑likeness" (Δ cp + move ms) via an on‑device CNN (< 60 ms) | ONNX Runtime Web |
| **5 · Settle & Split** | 93 % to winner, 4 % platform, **3 % to the game's opening NFT owner** | Anchor program |

---

## 3 — Opening‑NFT Royalty Loop

* **Pre‑minted compressed NFTs** – every official ECO opening (A00‑E99) already exists as a Bubblegum leaf; no new mint per game.  
* **Automatic attribution** – after a game the client detects the recognized opening of the game and passes the corresponding asset ID to `settle_match`.  
* **3 % total royalty** – the contract routes 3% of the total stake to the owner of the game's recognized opening NFT, in lamports, every single game.  
* **Why it matters** – streamers and theory creators have perpetual upside when their favourite lines are played, driving free liquidity to the platform.

---

## 4 — Fair‑Play & Security Highlights

| Capability | Detail |
|------------|--------|
| **AI heuristic** | Tiny CNN (< 300 kB) flags engine‑like precision; 99 % of games clear instantly |
| **ELO Rating System** | Comprehensive on-chain ELO rating system tracks player performance. Ratings dynamically update after each match using established algorithms and K-factors adjusted for provisional and experienced players. Includes detailed on-chain player statistics. |
| **Anti-Smurf System** | Sophisticated on-chain & off-chain anti-smurf measures: <br> • **Provisional Status:** New players start with restricted stake caps (e.g., 0.01 SOL) for their initial 10 games. <br> • **Tiered Stake Limits:** Maximum stakes progressively increase based on the number of games played. <br> • **Behavioral Monitoring (On-Chain):** The contract's `PlayerStats` track account age, win rates at high vs. low stakes, and stake consistency with recent history, directly influencing a player's dynamic maximum stake. <br> • **Off-Chain Trust Score:** Matchmaking service calculates a Trust Score using on-chain stats (account age, game history, stake patterns) to influence pairing. <br> • Penalties for significant win-rate disparities between high/low stakes and for very new accounts are applied directly to stake limits. |
| **Disconnect Handling** | Client attempts WebSocket reconnection for a short grace period; if unsuccessful, the game can be reported as a loss for the disconnected player. |

---

## 5 — Key Features at a Glance

* **Lamport‑precise escrow** – no floating‑point rounding; splits are integer‑math safe.  
* **Compressed NFT royalties** – 3 % total fee goes straight to the opening owner, locked in contract logic.  
* **Chess.com‑familiar UX** – dark Solana palette, premove, confetti; wallet = identity (no emails).  
* **One‑click replay** – rematch dialog pops for 7 s after each game, reusing the original stake.  
* **Open‑source core** – contracts, web, and deployment scripts under MIT; ML weights remain private until post‑hackathon hardening.

---

## 6 — Repository Layout
/contracts Anchor smart‑contracts (escrow, royalties, fair‑play) /web Next.js App‑Router front‑end (Tailwind, wallet‑adapter) /scripts One‑off helpers (NFT mint, data ingest, deploy) /data PGN → FEN → Δcp pipeline for AI training /docs Specs, PDFs, architecture diagrams .github/workflows CI: lint, typecheck, contract tests
