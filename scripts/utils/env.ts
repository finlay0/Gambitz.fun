import fs from "fs";

export function saveEnv(key: string, value: string) {
  const path = ".env.local";
  let env = "";
  if (fs.existsSync(path)) env = fs.readFileSync(path, "utf8");
  const lines = env.split(/\r?\n/).filter(Boolean);
  const kv = Object.fromEntries(lines.map(l => l.split("=")));
  kv[key] = value;
  fs.writeFileSync(path, Object.entries(kv).map(([k,v]) => `${k}=${v}`).join("\n"));
}

export function getEnv(key: string): string | undefined {
  try {
    return fs.readFileSync(".env.local","utf8").split(/\r?\n/).find(l=>l.startsWith(key+"="))?.split("=")[1];
  } catch {
    return undefined;
  }
} 