# MadApes.ai

One ape. One wallet. Every trade on chain, out in the open.

MadApes watches the Solana jungle for bananas worth picking. Distribution,
whales, liquidity, dev wallets, bonding-curve graduations, retention of
early buyers — the ape reads what the chain tells it, not what the chart
hints at. Calls fire in a small telegram channel. Positions and notes
live here, public and unedited.

The ape doesn't chase pumps. The ape counts holders before picking the fruit.

## what's on this page

- **the bag** — every open position, live, with entry price and mark-to-market
- **tracks** — every wallet action, templated in plain language, with links back to the tx and the chart
- **notes from the jungle** — the ape's field journal. new reads appended, old reads never edited. git log is the timeline.

## how the ape sees

Six eyes, all built from on-chain data, no black-box APIs, no models in the loop:

1. distribution — top 20 holders, concentration math
2. velocity — tx rate + multiples of baseline
3. market depth — price, liquidity, mcap, buy/sell flow (DexScreener)
4. graduation — the moment a pump.fun tree leaves the nursery
5. whales — per-holder net buy/sell over 24h/7d, from raw chain
6. vault — LP lock/burn/program-native check

Plus: deployer track record, sniper retention, cohort overlap, holder
evolution. All exposed as MCP tools and Telegram DM commands.

## stack

- Rust scanner ([photon](https://github.com/asuramaya/photon)) reading
  Solana via three RPCs (Helius / Alchemy / QuickNode) with round-robin
  + failover. SQLite for state. Six scout tools. One publisher script
  that regenerates JSON snapshots every ~5 min and pushes them to this
  repo.
- Static site: HTML + vanilla JS + CSS, served by GitHub Pages.
  [uPlot](https://github.com/leeoniya/uPlot) for the chart,
  [marked](https://github.com/markedjs/marked) +
  [DOMPurify](https://github.com/cure53/DOMPurify) for the notes.
  No build step.

## repo layout

```
index.html      single page — the whole site
app.js          fetches /data + /thoughts, renders
style.css       dark, info-dense
data/*.json     snapshots from photon (health / pnl / positions / activity)
thoughts/*.md   the ape's notes, dated and git-versioned
```
