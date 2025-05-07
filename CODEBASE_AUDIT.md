# Codebase Audit

A comprehensive audit of all source and configuration files in the repository, detailing each file's purpose and connections.

## 🗂 Root Directory

- **.gitignore**: Defines files and directories to ignore in VCS.
- **.gitattributes**: Git attributes for line endings and diff settings.
- **pnpm-workspace.yaml**: Monorepo workspace configuration.
- **pnpm-lock.yaml**: Locked dependency tree for pnpm.
- **package.json**: Root-level scripts, devDependencies, and workspace settings.
- **tree_assets.json**: JSON mapping of NFT asset hierarchy for on-chain royalty lookups.
- **.husky/pre-commit**: Git hook to run linting before commits.
- **.github/workflows/ci.yml**: CI pipeline for build, lint, and tests.
- **CODEBASE_AUDIT.md**: This audit document.

## 📜 docs/

- **design.md**: Design system specifications (colors, typography, layout, components).
- **data-pipeline.md**: Documentation of data extraction, evaluation, and ML preprocessing steps.
- **info**: Placeholder or meta-information file.

## 📦 src/

### types/
- **game.ts**: Shared TypeScript types for game interactions and API payloads.

### utils/
- **gameState.ts**: Server-side utilities for game-state management and validation.
- **logger.ts**: Centralized logging helper.

## 🔧 scripts/

- **gen_openings_json.ts**: Generates `openings.json` metadata from CSV and scripts data.
- **opening_data.ts**: Builds and exports opening metadata constants for scripts.
- **opening_data_out.ts**: Raw output file of opening data (generated).
- **list_tree_assets.ts**: Scans NFT tree structure for asset IDs and hierarchy.
- **mint_openings.ts**: Script to mint opening NFTs via Anchor.
- **peek_fens.ts**: Utility to inspect the first N FENs in raw PGN dataset.

### scripts/data/
- **Cargo.toml**: Rust project manifest for data pipelines.
- **Cargo.lock**: Locked dependencies for Rust pipeline.
- **collect_pgn.ts**: Converts PGN archives into line-delimited JSON.
- **eval_fens.ts**: Runs Stockfish evaluations on FEN positions and writes Parquet.
- **extract_fens.ts**: Extracts FEN moves and timestamps from PGN JSON.
- **extract_fens_nofilter.ts**: Extracts FENs without move filtering.
- **extract_positions.ts**: Extracts board positions for ML training.
- **node-zstandard.d.ts**, **parquetjs-lite.d.ts**: TypeScript type declarations for dependencies.
- **probe_blitz_header.sh**: Bash script to probe blitz PGN file headers.
- **target/**: (Build artifacts; excluded from audit.)
- **scripts/**: (Utility scripts; excluded from audit.)

### scripts/utils/
- **env.ts**: Loads environment variables and configs.
- **getPayer.ts**: Helper to load Solana payer keypair from disk.

## 📊 data/

- **training.parquet**: Parquet file with labeled data for ML.
- **fen_moves.parquet**: Parquet of FEN evaluations across the dataset.

### data/raw/
- **filtered_180+2.pgn**: PGN archive filtered for 3+2 blitz games.
- **blitz_2025_01.pgn.zst**: Compressed PGN archive of blitz games.

### data/processed/
- _(empty directory; prepared for processed outputs.)_

## 🤖 ml/

- **01_label.ipynb**: Jupyter notebook for labeling and exploring ML datasets.

## 🔗 contracts/

- **Anchor.toml**: Anchor configuration for Solana program.
- **Cargo.toml**: Rust dependencies manifest for on-chain program.
- **Cargo.lock**: Locked Rust dependencies.

### programs/wager/
- **Xargo.toml**: Custom Xargo build configuration.
- **Cargo.toml**: On-chain program manifest.

#### programs/wager/src/
- **lib.rs**: Core Anchor program (match creation, confirmation, settlement).
- **state.rs**: Definitions of on-chain account structs (Match, Stats).

### migrations/
- **deploy.ts**: Script to deploy or upgrade the Anchor program.

### tests/
- **royalty_split.ts**: Tests for opening-NFT royalty logic.
- **settle_flow.ts**: End-to-end settlement flow tests.
- **wager.ts**: Basic program instruction tests.

### target/
- _(Build artifacts and IDL JSON; excluded from audit.)_

## 🚀 web/

### app/
- **layout.tsx**: Application shell with Header, Sidebar, and main container.
- **page.tsx**: Home dashboard with navigation cards.

#### board/
- **page.tsx**: Server component that loads the client-side `BoardClient`.
- **BoardClient.tsx**: Full client-side chessboard UI, timers, move history, and result submission.

#### play/
- **page.tsx**: Play page with shadcn/ui Dialog to start or search matches.

#### api/game/abandon/route.ts
- Server handler for voluntary game abandonment notifications.

#### api/game/verify/route.ts
- Handler to verify client-local game state against server records.

#### api/match-state/[matchId]/route.ts
- Endpoint to fetch the current match state for a given match.

#### api/time/route.ts
- Simple endpoint to fetch timestamp for client clock sync.

### components/
- **Layout.tsx**: Page layout wrapper used in `app/layout.tsx`.
- **Sidebar.tsx**: Sidebar navigation links (Play, Puzzles, Learn, Social).

#### components/lib/utils.ts
- Reusable UI utility functions.

#### components/ui/
- **button.tsx**: Shadcn `Button` wrapper with Solana green styling.
- **card.tsx**: Card container component pattern.
- **table.tsx**: Table component for data display.
- **dialog.tsx**: Dialog/modal implementation.
- **avatar.tsx**: Avatar component for user profile.
- **navigation-menu.tsx**: Navigation menu component pattern.

### public/
- **logo.png**: Main application logo.
- **globe.svg**, **next.svg**, **window.svg**, **file.svg**, **vercel.svg**: Static icon assets.

### src/

#### hooks/
- **useChessTimer.ts**: Chess clock management hook.
- **useGameState.ts**: Client game state persistence and server sync hook.
- **useOpeningRecognition.ts**: Opening detection based on FEN history.
- **useMatchmaker.ts**: Matchmaking hook interfacing with WebSocket and on-chain RPC.
- **useConnectionStatus.ts**: Hook for online/offline detection.
- **useOpeningOwner.ts**: Hook to track opening-NFT ownership.
- **useStakeSelector.ts**: Hook for stake amount selection presets.

#### lib/
- **opening_data.ts**: TS module exporting opening metadata.
- **idl.json**: Anchor program IDL used by `useMatchmaker`.
- **anchor.ts**: Anchor provider helper for client RPC.
- **openings.json**: Raw JSON of opening metadata for royalty mapping.

### config files
- **tailwind.config.js**: Tailwind CSS theme and plugin configuration.
- **postcss.config.mjs**: PostCSS plugin setup.
- **next.config.js** / **next.config.ts**: Next.js build and runtime settings.
- **tsconfig.json**: TypeScript compiler options.
- **tsconfig.tsbuildinfo**: TS incremental build info (auto-generated).
- **eslint.config.mjs**: ESLint rules and settings.
- **next-env.d.ts**: Next.js environment type definitions.
- **components.json**: Shadcn component registration manifest.
- **package.json**: Frontend package manifest and scripts.

## 🧪 tests/

- _(Empty directory reserved for integration or E2E tests.)_

---

*End of exhaustive audit.* 