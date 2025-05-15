#!/bin/bash

# Default values for environment variables
DEFAULT_RPC_URL="https://api.devnet.solana.com"
DEFAULT_KEYPAIR_PATH="$HOME/stats_authority_keypair.json"

# Set Solana RPC URL
if [ -z "$ANCHOR_PROVIDER_URL" ]; then
  export ANCHOR_PROVIDER_URL="$DEFAULT_RPC_URL"
  echo "Using default ANCHOR_PROVIDER_URL: $ANCHOR_PROVIDER_URL"
else
  echo "Using ANCHOR_PROVIDER_URL from environment: $ANCHOR_PROVIDER_URL"
fi

# Set Anchor wallet (need a keypair file path)
if [ -z "$ANCHOR_WALLET" ]; then
  if [ -f "$DEFAULT_KEYPAIR_PATH" ]; then
    export ANCHOR_WALLET="$DEFAULT_KEYPAIR_PATH"
    echo "Using default ANCHOR_WALLET: $ANCHOR_WALLET"
  else
    echo "WARNING: No default keypair found at $DEFAULT_KEYPAIR_PATH."
    echo "This service requires an ANCHOR_WALLET to be set."
    echo "The keypair doesn't need to match the stats authority; it's just used as a default payer for read operations."
    echo "Please create a keypair using 'solana-keygen new --outfile $DEFAULT_KEYPAIR_PATH' and run this script again."
    exit 1
  fi
else
  echo "Using ANCHOR_WALLET from environment: $ANCHOR_WALLET"
fi

# Run the full ELO service with tsx
echo "Starting Full Off-chain ELO Service..."
npx tsx scripts/offchain_elo_service.ts 