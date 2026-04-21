# MadApes.ai

Live Solana PnL tracker. Public by default. Honest about wins, honest about losses.

One wallet. One brain. Real on-chain activity, parsed into readable actions.
Thoughts about the market written down as they happen — with git history, not
revisionism.

Fed by [photon](https://github.com/asuramaya/photon) — a Rust signal pipeline
that scans on-chain distribution, velocity, and whale flow. Calls fire in the
Telegram channel. Positions and track record live here.

## Structure

```
index.html      the whole site — single scroll
app.js          fetches /data + /thoughts, renders
style.css       minimal, dark, info-dense
data/           JSON snapshots pushed by the publisher, ~every 5 min
thoughts/       dated markdown — git log is the timeline
```

## Thought posts

Dated `YYYY-MM-DD_slug.md`. New thoughts append to `thoughts/` and their
filenames land in `thoughts/index.json`. Old thoughts don't get edited — when
a read turns out wrong, that goes in a new post.

## Voice

Same operator voice as the Telegram side. Trader-pattern-matcher, not
influencer. Numbers up front. Stakes declared. Edits when the story ends.
