# data/ schema

The publisher regenerates these four JSON files every ~5 minutes from
photon's SQLite database and commits the change. The site reads them
client-side. No other data source.

## health.json

```jsonc
{
  "wallet": "pWjS2MSgaTy7RaZsfKEjWXPJa33WHwrQ2XNwXEeVpPo",
  "sol_balance": 0.003,           // SOL balance, ui amount
  "last_update": 1776796800        // unix seconds — when snapshot was taken
}
```

## pnl.json

Honesty-first: `realized` is money that crossed our wallet as SOL back;
`unrealized` is mark-to-market on current holdings at latest DexScreener
prices. Both can go negative.

```jsonc
{
  "total_value_usd": 1234.56,      // sol_balance * sol_px + sum(positions)
  "realized_pnl_usd": -42.0,       // cumulative, from first trade
  "unrealized_pnl_usd": 18.3,      // mark-to-market on open positions
  "series": [                      // portfolio value over time
    { "ts": 1776796800, "value_usd": 1234.56 },
    { "ts": 1776797100, "value_usd": 1189.20 }
  ]
}
```

## positions.json

```jsonc
{
  "positions": [
    {
      "mint": "2nP9yKQNSGQy851iyawDvBkzkK2R2aqKArQCKc2gpump",
      "symbol": "PsyopAnime",
      "balance_ui": 123456.78,
      "avg_entry_usd": 0.00221,    // VWAP across buys in SOL → USD at tx time
      "current_price_usd": 0.00308,
      "position_usd": 380.31,      // balance_ui * current_price_usd
      "pnl_pct": 39.3              // (current - entry) / entry * 100
    }
  ]
}
```

## activity.json

Curated and human-readable. The publisher pulls wallet trades + swaps from
photon's `trades` table and templates them into one-liners. Every action
carries the `signature` so the site can deep-link back to Solscan and the
`mint` so it can deep-link to DexScreener. No obfuscation.

```jsonc
{
  "activity": [
    {
      "ts": 1776796800,
      "summary": "bought 2 SOL of $PsyopAnime at $1.98M mcap",
      "signature": "3ZKe…",        // → solscan.io/tx/…
      "mint": "2nP9yKQN…"           // → dexscreener.com/solana/…
    },
    {
      "ts": 1776780000,
      "summary": "cut half of $OLDCOIN — trap flipped, took -18%",
      "signature": "5Abc…",
      "mint": "OLDC…pump"
    }
  ]
}
```
