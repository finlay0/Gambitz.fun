const fs = require('fs');
const bs58_lib = require('bs58');
const bs58 = bs58_lib.default || bs58_lib; // Attempt to handle different export styles

const filePath = process.argv[2];

if (!filePath) {
    console.error("Please provide the path to your Solana keypair JSON file as an argument.");
    console.error("Usage: node get_bs58_private_key.js /path/to/your/solana_keypair.json");
    process.exit(1);
}

try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const secretKeyArray = JSON.parse(fileContent);

    if (!Array.isArray(secretKeyArray) || secretKeyArray.length === 0 || secretKeyArray.some(num => typeof num !== 'number')) {
        console.error("Invalid keypair file format. Expected a JSON array of numbers.");
        process.exit(1);
    }

    const secretKeyUint8Array = new Uint8Array(secretKeyArray);
    const privateKeyBs58 = bs58.encode(secretKeyUint8Array);

    console.log("\n\n🔑 Base58 Encoded Private Key (Secret Seed):\n");
    console.log(privateKeyBs58);
    console.log("\n\nIMPORTANT: Handle this output securely!");
    console.log("1. Use this value for STATS_AUTHORITY_SECRET_KEY_BS58 in your off-chain service script or environment variable.");
    console.log("2. The PUBLIC key corresponding to this private key must be in your smart contract's STATS_UPDATE_AUTHORITY_PUBKEY constant.");
    console.log("   If you used 'solana-keygen new', the public key was printed to the console at that time.");
    console.log("   You can also get the pubkey from the file using 'solana-keygen pubkey /path/to/your/solana_keypair.json'\n");

} catch (error) {
    if (error.code === 'ENOENT') {
        console.error(`Error: Keypair file not found at path: ${filePath}`);
    } else {
        console.error("Error processing keypair file:", error.message);
    }
    process.exit(1);
} 