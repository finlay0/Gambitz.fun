# chessbets.fun  
Real‑money blitz chess on Solana

Stake SOL, play 3 + 2, and claim trust‑minimised winnings secured by on‑chain escrow, AI cheat detection, and zero‑knowledge proofs.

---

## 1 — Why It Matters
* **150 M+ online chess players** have no direct way to monetise skill.  
* Previous real‑money attempts failed because of engine cheating and payout disputes.  
* Solana’s sub‑second finality and near‑zero fees let us escrow, verify and distribute stakes safely at lightning speed.

---

## 2 — How It Works

| Phase | What happens | Where it runs |
|-------|--------------|--------------|
| **1 · Stake & Match** | Player picks a preset stake (0.01 – 0.5 SOL) → queue pairs equal stakes | Next.js app + match‑maker WebSocket |
| **2 · Confirm Escrow** | 10 s confirmation window; both wallets sign `create_match` which transfers stake into a PDA | Anchor program |
| **3 · Play 3 + 2 Blitz** | Browsers relay moves over WebSocket; server mirrors timers to stop “pull the cable” tricks | Web + WS relay |
| **4 · AI Scan** | After each move we score “engine‑likeness” (Δ cp + move ms) via an on‑device CNN (< 60 ms) | ONNX Runtime Web |
| **5 · Flag ↔ Prove** | If score > 0.90 the escrow pauses. Winner can clear the flag by producing a RISC Zero proof that their average deviation from Stockfish ≥ 20 cp | zkVM prover + `verify_proof` ix |
| **6 · Settle & Split** | 93 % to winner, 4 % platform, **1.5 % to White’s opening NFT owner and 1.5 % to Black’s** | Anchor program |

---

## 3 — Opening‑NFT Royalty Loop

* **Pre‑minted compressed NFTs** – every official ECO opening (A00‑E99) already exists as a Bubblegum leaf; no new mint per game.  
* **Automatic attribution** – after a game the client detects the last in‑book ECO code for each side and passes both asset IDs to `settle_match`.  
* **1.5 % + 1.5 % split** – the contract routes exactly 1.5 % of the total stake to each opening owner, in lamports, every single game.  
* **Why it matters** – streamers and theory creators have perpetual upside when their favourite lines are played, driving free liquidity to the platform.

---

## 4 — Fair‑Play & Security Highlights

| Capability | Detail |
|------------|--------|
| **AI heuristic** | Tiny CNN (< 300 kB) flags engine‑like precision; 99 % of games clear instantly |
| **Selective ZK** | Flagged winners prove innocence with a ~10 kB RISC Zero proof (~35 s on laptop) |
| **Slashing** | No proof within 24 h → full escrow paid to opponent, wallet added to `bannedAccounts` |
| **Provisional cap** | New wallets limited to 0.05 SOL until 10 games (on‑chain guard) |
| **Disconnect grace** | 15 s WebSocket window; after that a timed‑out player auto‑loses |
| **Device / smurf shield** | Fingerprint SBT bind, cross‑wallet pattern alerts, ELO floor & soft decay |

---

## 5 — Key Features at a Glance

* **Lamport‑precise escrow** – no floating‑point rounding; splits are integer‑math safe.  
* **Compressed NFT royalties** – 3 % total fee goes straight to opening owners, locked in contract logic.  
* **Chess.com‑familiar UX** – dark Solana palette, premove, confetti; wallet = identity (no emails).  
* **One‑click replay** – rematch dialog pops for 7 s after each game, reusing the original stake.  
* **Open‑source core** – contracts, web, and deployment scripts under MIT; ML weights and zk circuit remain private until post‑hackathon hardening.

---

## 6 — Repository Layout
/contracts Anchor smart‑contracts (escrow, royalties, fair‑play) /zk RISC Zero proving crate (engine‑diff circuit) /web Next.js App‑Router front‑end (Tailwind, wallet‑adapter) /scripts One‑off helpers (NFT mint, data ingest, deploy) /data PGN → FEN → Δcp pipeline for AI training /docs Specs, PDFs, architecture diagrams .github/workflows CI: lint, typecheck, contract tests, zk build
