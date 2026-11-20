# pump.fun MCP Server

An MCP server that gives Claude, Cursor and other AI assistants six Solana memecoin research tools: token info, rug check, top holders, a screener, whale trades and wallet trades. Read-only, no keys.

![Node 22+](https://img.shields.io/badge/node-%E2%89%A522-5FA04E?logo=node.js&logoColor=white) ![Dependencies: 0](https://img.shields.io/badge/dependencies-0-2ea44f) [![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE) [![Website](https://img.shields.io/badge/website-blixtrade.github.io-8b5cf6)](https://blixtrade.github.io/pump-fun-mcp/)

> Free and open source, part of the [Blix Trade](https://github.com/blixtrade) toolkit. For the live version with AI ratings on every coin, wallet tracking and one-click trading at 0% fees, see **[BLIX, the Solana memecoin terminal](https://blixvip.com/pump-fun-mcp?utm_source=github&utm_medium=readme&utm_campaign=pump-fun-mcp)**.

## What it does

- `token_info`: price, market cap, liquidity, volume, price change and age.
- `rug_check`: the full 0 to 100 risk score from solana-rug-checker, with findings.
- `top_holders`: chain-verified top holders with pool and insider labels.
- `screen_tokens`: the solana-memecoin-screener filters over trending, new or boosted tokens.
- `whale_trades`: large trades, net flow and the biggest buyers and sellers.
- `wallet_trades`: a wallet's recent memecoin buys and sells, read from the chain.

## Quick start

You need [Node.js](https://nodejs.org) 22 or newer. There is nothing else to install: no dependencies, no API keys.

Add it to Claude Code:

```bash
claude mcp add pump-fun -- npx -y github:blixtrade/pump-fun-mcp
```

Or to any client that takes an `mcpServers` config (Claude Desktop, Cursor, Windsurf):

```json
{
  "mcpServers": {
    "pump-fun": {
      "command": "npx",
      "args": [
        "-y",
        "github:blixtrade/pump-fun-mcp"
      ]
    }
  }
}
```

Then ask things like *"Is this token a rug? <mint>"*, *"Who are the biggest whales selling DCTY today?"* or *"Find new pump.fun coins with over $20k liquidity"*.

To run from a clone instead:

```bash
git clone https://github.com/blixtrade/pump-fun-mcp.git
claude mcp add pump-fun -- node $(pwd)/pump-fun-mcp/bin/pump-fun-mcp.js
```

## Example output

Real output from a run on 18 November 2026:

```json
// tools/call rug_check {"mint": "9hjBLBrc7WZW2H8UQvBAvG5WiTZotXUv2Bdcn4f4pump"}  (findings trimmed to 4)
{
  "mint": "9hjBLBrc7WZW2H8UQvBAvG5WiTZotXUv2Bdcn4f4pump",
  "name": "DacityCoin",
  "symbol": "DCTY",
  "score": 5,
  "verdict": "LOW RISK",
  "findings": [
    {
      "level": "warn",
      "points": 5,
      "title": "Insider network of 52 wallets",
      "detail": "RugCheck found wallets connected by transfers around the launch."
    },
    {
      "level": "ok",
      "points": 0,
      "title": "Mint authority revoked",
      "detail": "No new tokens can be created."
    },
    {
      "level": "ok",
      "points": 0,
      "title": "Freeze authority revoked",
      "detail": "Wallets cannot be frozen."
    },
    {
      "level": "ok",
      "points": 0,
      "title": "Top 10 wallets hold 13.0%",
      "detail": "Supply is spread out."
    }
  ],
  "sourcesUnavailable": [],
  "note": "A low score is not a guarantee."
}
```

## Options

```text
pump-fun-mcp: Solana memecoin and pump.fun tools for AI assistants (MCP, stdio)

Options:
  --help        Show this help text
  --version, -v Show server version

Add it to your MCP client, for example Claude Code:
  claude mcp add pump-fun -- node /home/blix/blixtrade-org/pump-fun-mcp/bin/pump-fun-mcp.js

Tools: token_info, rug_check, top_holders, screen_tokens, whale_trades, wallet_trades
Environment: SOLANA_RPC_URL (optional, faster wallet_trades)
```

## How it works

- Speaks MCP over stdio (newline-delimited JSON-RPC 2.0) with no SDK and no dependencies. Supports protocol versions 2024-11-05, 2025-03-26 and 2025-06-18.
- Tool errors come back as readable results (`isError: true`) so the assistant can explain them instead of failing.
- Calls to free APIs are spaced out and rate limits are waited out, so parallel tool calls do not fail.

## Limits

- Read-only: it cannot trade or touch a wallet.
- `wallet_trades` reads about one transaction per second on the public RPC. Set `SOLANA_RPC_URL` in the server's environment for speed.

## Development

```bash
npm test
```

Tests run offline against fixtures, so they never depend on a live API.

## Contributing

Pull requests are welcome, and first-timers are too. Pick an issue labelled [good first issue](https://github.com/blixtrade/pump-fun-mcp/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) or [help wanted](https://github.com/blixtrade/pump-fun-mcp/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22), comment that you are taking it, and read [CONTRIBUTING.md](CONTRIBUTING.md). No API keys needed: the tests run offline.

[![Contributors](https://contrib.rocks/image?repo=blixtrade/pump-fun-mcp)](https://github.com/blixtrade/pump-fun-mcp/graphs/contributors)

## More free Solana tools from Blix Trade

| Tool | What it does |
|---|---|
| [solana-bubble-map](https://github.com/blixtrade/solana-bubble-map) | Holder bubble map for any Solana or pump.fun token. |
| [pump-fun-tracker](https://github.com/blixtrade/pump-fun-tracker) | Every new pump.fun launch on Solana, live in your terminal, the moment it is created. |
| [solana-rug-checker](https://github.com/blixtrade/solana-rug-checker) | Rug pull scanner for Solana and pump.fun tokens. |
| [solana-memecoin-screener](https://github.com/blixtrade/solana-memecoin-screener) | Screen trending, new and boosted Solana memecoins from the terminal. |
| [solana-wallet-tracker](https://github.com/blixtrade/solana-wallet-tracker) | Follow any Solana wallets and see every memecoin buy and sell they make: token, size in SOL and USD, and a Solscan link. |
| [solana-pnl-tracker](https://github.com/blixtrade/solana-pnl-tracker) | Profit and loss for any Solana wallet's memecoin trades, worked out from its on-chain transactions. |
| [solana-whale-tracker](https://github.com/blixtrade/solana-whale-tracker) | Big buys and sells on any Solana token: net whale flow, every large trade with a Solscan link, and leaderboards of the wallets buying and dumping the most. |
| [memecoin-paper-trading](https://github.com/blixtrade/memecoin-paper-trading) | Practise Solana memecoin trading with fake SOL at real prices. |
| [memecoin-alert-bot](https://github.com/blixtrade/memecoin-alert-bot) | pump.fun alerts in Telegram and Discord. |

Want all of this in one place, live, with AI on every coin? **[Open BLIX](https://blixvip.com/?utm_source=github&utm_medium=readme&utm_campaign=pump-fun-mcp)**: the Solana memecoin terminal with 0% trading fees.

## Disclaimer

This is research software, not financial advice. Memecoins are extremely volatile and most go to zero. Never trade more than you can afford to lose. The data comes from free third-party APIs that can be wrong, late or unavailable.

## License

[MIT](LICENSE)
