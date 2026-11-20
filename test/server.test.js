import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { handle } from "../lib/server.js";

test("initialize negotiates the protocol version", async () => {
  const r = await handle({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-03-26", capabilities: {}, clientInfo: { name: "t", version: "1" } } });
  assert.equal(r.result.protocolVersion, "2025-03-26");
  assert.equal(r.result.serverInfo.name, "pump-fun-mcp");
  assert.ok(r.result.capabilities.tools);
  const future = await handle({ jsonrpc: "2.0", id: 2, method: "initialize", params: { protocolVersion: "2099-01-01" } });
  assert.equal(future.result.protocolVersion, "2025-06-18");
});

test("tools/list returns six tools with object schemas", async () => {
  const r = await handle({ jsonrpc: "2.0", id: 3, method: "tools/list" });
  assert.equal(r.result.tools.length, 6);
  for (const t of r.result.tools) {
    assert.equal(t.inputSchema.type, "object");
    assert.ok(t.description.length > 20);
  }
});

test("bad input becomes a tool error the model can read, not a crash", async () => {
  const r = await handle({ jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "rug_check", arguments: { mint: "not-an-address" } } });
  assert.equal(r.result.isError, true);
  assert.match(r.result.content[0].text, /must be a Solana address/);
});

test("unknown tools and methods are protocol errors; notifications get no reply", async () => {
  assert.equal((await handle({ jsonrpc: "2.0", id: 5, method: "tools/call", params: { name: "nope" } })).error.code, -32602);
  assert.equal((await handle({ jsonrpc: "2.0", id: 6, method: "resources/list" })).error.code, -32601);
  assert.equal(await handle({ jsonrpc: "2.0", method: "notifications/initialized" }), null);
  assert.equal((await handle({ jsonrpc: "2.0", id: 7, method: "ping" })).result && true, true);
  assert.equal((await handle({ id: 8 })).error.code, -32600);
});

test("the stdio server answers line by line and exits when input closes", async () => {
  const child = spawn(process.execPath, [fileURLToPath(new URL("../bin/pump-fun-mcp.js", import.meta.url))]);
  let out = "";
  child.stdout.on("data", (d) => (out += d));
  child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18" } }) + "\n");
  child.stdin.write(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + "\n");
  child.stdin.write("{not json\n");
  child.stdin.end(JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list" }) + "\n");
  const code = await new Promise((r) => child.on("close", r));
  const lines = out.trim().split("\n").map((l) => JSON.parse(l));
  assert.equal(code, 0);
  assert.equal(lines.length, 3);
  assert.equal(lines.find((l) => l.id === 1).result.serverInfo.name, "pump-fun-mcp");
  assert.equal(lines.find((l) => l.error)?.error.code, -32700);
  assert.equal(lines.find((l) => l.id === 2).result.tools.length, 6);
});

test("null params are treated as empty for methods that ignore them", async () => {
  const r = await handle({ jsonrpc: "2.0", id: 10, method: "initialize", params: null });
  assert.equal(r.result.protocolVersion, "2025-06-18");
  assert.equal(r.result.serverInfo.name, "pump-fun-mcp");
  assert.equal((await handle({ jsonrpc: "2.0", id: 11, method: "ping", params: null })).result && true, true);
  assert.equal((await handle({ jsonrpc: "2.0", id: 12, method: "tools/list", params: null })).result.tools.length, 6);
});

test("null params and non-object arguments on tools/call are invalid params, not crashes", async () => {
  const missing = await handle({ jsonrpc: "2.0", id: 13, method: "tools/call", params: null });
  assert.equal(missing.error.code, -32602);
  assert.doesNotMatch(missing.error.message, /undefined/);

  const badArgs = await handle({ jsonrpc: "2.0", id: 14, method: "tools/call", params: { name: "token_info", arguments: "x" } });
  assert.equal(badArgs.error.code, -32602);

  const badName = await handle({ jsonrpc: "2.0", id: 15, method: "tools/call", params: { name: 42 } });
  assert.equal(badName.error.code, -32602);
});

test("serverInfo.version equals package.json version", async () => {
  const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  const r = await handle({ jsonrpc: "2.0", id: 20, method: "initialize", params: {} });
  assert.equal(r.result.serverInfo.version, pkg.version);
});

test("bin with --version exits 0 and prints version", async () => {
  const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  const child = spawn(process.execPath, [fileURLToPath(new URL("../bin/pump-fun-mcp.js", import.meta.url)), "--version"]);
  let out = "";
  child.stdout.on("data", (d) => (out += d));
  const code = await new Promise((r) => child.on("close", r));
  assert.equal(code, 0);
  assert.equal(out.trim(), pkg.version);
});

test("bin with -v exits 0 and prints version", async () => {
  const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  const child = spawn(process.execPath, [fileURLToPath(new URL("../bin/pump-fun-mcp.js", import.meta.url)), "-v"]);
  let out = "";
  child.stdout.on("data", (d) => (out += d));
  const code = await new Promise((r) => child.on("close", r));
  assert.equal(code, 0);
  assert.equal(out.trim(), pkg.version);
});
