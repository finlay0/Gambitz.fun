#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Paths
const inputPath = path.join(__dirname, '../contracts/target/idl/wager.json');
const outputPath = path.join(__dirname, '../contracts/target/idl/wager_converted.json');

console.log(`Converting IDL from ${inputPath} to ${outputPath}`);

// Read the input IDL
const idlRaw = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

// Convert to the format expected by @coral-xyz/anchor@0.29.0
const convertedIdl = {
  version: idlRaw.metadata.version,
  name: idlRaw.metadata.name,
  instructions: idlRaw.instructions || [],
  accounts: idlRaw.accounts || [],
  types: idlRaw.types || [],
  events: idlRaw.events || [],
  errors: idlRaw.errors || [],
};

// Write the converted IDL
fs.writeFileSync(outputPath, JSON.stringify(convertedIdl, null, 2));

console.log(`Conversion complete. New IDL saved to ${outputPath}`);
console.log('You can use this IDL in the ELO service by updating the import path.'); 