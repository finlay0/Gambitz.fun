#!/bin/bash

set -e  # Exit on error

echo "Generating fresh Anchor IDL using anchor build..."
cd contracts
anchor build
echo "New IDL should be generated at contracts/target/idl/wager.json"
echo "You can use this IDL in the ELO service by updating the import path." 