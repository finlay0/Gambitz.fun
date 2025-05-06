import { Keypair } from "@solana/web3.js";
import fs from "fs";
import child_process from "child_process";
import os from "os";

const DEFAULT_PATH = `${os.homedir()}/.config/solana/devnet-real.json`;

export function getPayer(): Keypair {
  // 1) Use SOLANA_KEYPAIR env or fallback to DEFAULT_PATH
  const keypairPath = process.env.SOLANA_KEYPAIR ?? DEFAULT_PATH;
  return Keypair.fromSecretKey(
    Uint8Array.from(JSON.parse(fs.readFileSync(keypairPath, "utf8")))
  );
} 