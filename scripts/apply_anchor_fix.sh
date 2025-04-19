set -e

rustup toolchain install nightly-2025-04-16
rustup override set nightly-2025-04-16
grep -q "anchor-syn" Cargo.toml || cat >> Cargo.toml <<'PATCH'
[patch.crates-io]
anchor-syn = { git = "https://github.com/solana-foundation/anchor.git", branch = "master", package = "anchor-syn" }
PATCH
rm -f Cargo.lock
echo "✅ Anchor nightly+patch applied"
