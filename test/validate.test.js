import test from "node:test";
import assert from "node:assert/strict";
import { handle } from "../lib/server.js";

test("top_holders with string limit returns tool error before network", async () => {
  const r = await handle({
    jsonrpc: "2.0",
    id: 101,
    method: "tools/call",
    params: { name: "top_holders", arguments: { mint: "So11111111111111111111111111111111111111112", limit: "ten" } }
  });
  assert.equal(r.result.isError, true);
  assert.match(r.result.content[0].text, /limit/);
  assert.match(r.result.content[0].text, /must be an integer/);
});

test("whale_trades with string minUsd returns tool error", async () => {
  const r = await handle({
    jsonrpc: "2.0",
    id: 102,
    method: "tools/call",
    params: { name: "whale_trades", arguments: { mint: "So11111111111111111111111111111111111111112", minUsd: "1k" } }
  });
  assert.equal(r.result.isError, true);
  assert.match(r.result.content[0].text, /minUsd/);
  assert.match(r.result.content[0].text, /must be a number/);
});

test("whale_trades with limit: 0 violates minimum: 1", async () => {
  const r = await handle({
    jsonrpc: "2.0",
    id: 103,
    method: "tools/call",
    params: { name: "whale_trades", arguments: { mint: "So11111111111111111111111111111111111111112", limit: 0 } }
  });
  assert.equal(r.result.isError, true);
  assert.match(r.result.content[0].text, /limit/);
  assert.match(r.result.content[0].text, /at least 1/);
});

test("screen_tokens with maxAgeMinutes: null returns tool error", async () => {
  const r = await handle({
    jsonrpc: "2.0",
    id: 104,
    method: "tools/call",
    params: { name: "screen_tokens", arguments: { maxAgeMinutes: null } }
  });
  assert.equal(r.result.isError, true);
  assert.match(r.result.content[0].text, /maxAgeMinutes/);
});

test("screen_tokens with invalid sort enum value returns tool error", async () => {
  const r = await handle({
    jsonrpc: "2.0",
    id: 105,
    method: "tools/call",
    params: { name: "screen_tokens", arguments: { sort: "invalid_sort_key" } }
  });
  assert.equal(r.result.isError, true);
  assert.match(r.result.content[0].text, /sort/);
  assert.match(r.result.content[0].text, /must be one of/);
});
