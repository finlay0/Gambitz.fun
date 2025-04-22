# chessbets.fun

A real‑money PvP chess arena on **Solana**.  
Stake SOL, play 3 + 2 blitz, and collect a trust‑minimised payout secured by on‑chain escrow, AI cheat detection, and zero‑knowledge proofs.

---

## 1 — Why It Matters

Online chess has 150 M+ players yet offers almost no way to monetise skill directly.  
chessbets.fun lets anyone turn everyday blitz games into real economic upside while keeping the user experience as friction‑free as Chess.com.

---

## 2 — How It Works

| Phase | What Happens | Where It Runs |
|-------|--------------|---------------|
| **1. Stake & Match** | Players choose a preset (0.01 – 0.5 SOL) and are auto‑paired with the same stake. | Web app + Match‑maker WS |
| **2. Confirm Escrow** | 10 s window; both clicks trigger a single `create_match` instruction transferring stake into a PDA. | Anchor program |
| **3. Play 3 + 2 Blitz** | Browsers exchange moves over WebSocket; timers are mirrored server‑side to block cable‑pull tricks. | Web + WS relay |
| **4. Anti‑Cheat Scan** | After every move we score “engine‑likeness” (Δ cp + move‑time) with an on‑device CNN. | ONNX Runtime Web |
| **5. Flag ↔ Prove (if needed)** | If score > 0.90 we pause escrow. Winner can clear the flag by generating a RISC Zero proof that their moves diverged ≥ 20 cp on average. | zkVM + verify ix |
| **6. Settle & Split** | Winner gets 93 %, platform 4 %, **opening‑NFT owners** 1.5 % each (White & Black openings). | Anchor program |

---

## 3 — Key Features

* **Real SOL wagering** – All stakes, payouts, and fees are lamport‑precise on‑chain.
* **Compressed NFT openings** – Every ECO code (A00 – E99) is pre‑minted; owners earn 3 % of every game that features their opening.
* **Fast, final payout** – Funds unlock immediately after a clean game or verified proof.
* **AI cheat detection** – Client heuristic (< 60 ms) flags engine‑like accuracy; 99 % of games finish without heavy compute.
* **Selective ZK innocence proofs** – Disputed games generate a ~10 kB proof in ≈35 s that the player didn’t follow engine lines too closely.
* **Sandbag & smurf shield** – Provisional stake cap, device‑fingerprint SBT, cross‑wallet pattern alerts, ELO floor & decay.
* **Chess.com‑familiar UI** – Dark Solana palette, premove, confetti on victory; wallet = identity, no email required.

---

## 4 — Repository Overview

```text
/contracts          Anchor smart‑contracts (match escrow, royalties, fair‑play)
/zk                 RISC Zero proving crate  (engine‑diff circuit)
/web                Next.js  App Router front‑end (Tailwind, wallet‑adapter)
/scripts            One‑off helpers (NFT mint, data fetch, deploy)
/data               PGN → FEN → Δcp pipeline for model training
/docs               Specs, PDFs, architecture diagrams
.github/workflows   CI: lint, typecheck, contract test, zk build

