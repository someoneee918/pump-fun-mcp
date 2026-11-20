#!/usr/bin/env node
// MCP server over stdio: one JSON-RPC message per line. Logs go to stderr only,
// because stdout belongs to the protocol.
import { readFileSync } from "node:fs";
import { createInterface } from "node:readline";
import { handle } from "../lib/server.js";

if (process.argv.includes("--version") || process.argv.includes("-v")) {
  const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  process.stdout.write(`${pkg.version}\n`);
  process.exit(0);
}

if (process.argv.includes("--help")) {
  process.stderr.write(`pump-fun-mcp: Solana memecoin and pump.fun tools for AI assistants (MCP, stdio)

Options:
  --help        Show this help text
  --version, -v Show server version

Add it to your MCP client, for example Claude Code:
  claude mcp add pump-fun -- node ${new URL("./pump-fun-mcp.js", import.meta.url).pathname}

Tools: token_info, rug_check, top_holders, screen_tokens, whale_trades, wallet_trades
Environment: SOLANA_RPC_URL (optional, faster wallet_trades)
`);
  process.exit(0);
}

const send = (obj) => process.stdout.write(JSON.stringify(obj) + "\n");
const rl = createInterface({ input: process.stdin, crlfDelay: Infinity });
let pending = 0;
let closing = false;
// Exit only after stdout has flushed. On macOS pipe writes are async, so exiting straight
// after the last write could cut off a long reply. The write callback runs once every
// earlier write has been handed to the OS.
const finish = () => process.stdout.write("", () => process.exit(0));

rl.on("line", async (line) => {
  if (!line.trim()) return;
  let msg;
  try { msg = JSON.parse(line); }
  catch { send({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } }); return; }
  pending++;
  try {
    const messages = Array.isArray(msg) ? msg : [msg];
    const replies = (await Promise.all(messages.map(handle))).filter(Boolean);
    if (Array.isArray(msg)) { if (replies.length) send(replies); } else if (replies[0]) send(replies[0]);
  } catch (err) {
    process.stderr.write(`[pump-fun-mcp] ${err.stack || err}\n`);
    if (msg?.id !== undefined) send({ jsonrpc: "2.0", id: msg.id, error: { code: -32603, message: "Internal error" } });
  } finally {
    pending--;
    if (closing && !pending) finish();
  }
});
rl.on("close", () => { closing = true; if (!pending) finish(); });
