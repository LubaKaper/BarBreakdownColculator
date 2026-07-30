# ROADMAP — from calculator to product

**One sentence:** "Know your number" — a bar owner opens the app, types 5
numbers, and knows exactly how many drinks a night keeps the lights on.

The core calculator is built. What separates it from a real product is
trust, portability, and one killer addition — not feature count.

## Phase 1 — Make it feel like an app

- [ ] **PWA**: manifest, icons, service worker. Installable on a phone home
      screen, opens fullscreen, works offline.
- [ ] **Shareable links**: encode inputs in the URL query string so an owner
      can text their scenario to a partner. No backend.
- [ ] **Profit target mode**: optional "monthly profit goal" field. Turns
      "37 drinks/day to survive" into "52 drinks/day to pay yourself $5k."
- [ ] **Honest data labeling**: mark Brooklyn averages as estimates with a
      "last updated" date.

## Phase 2 — The killer feature: reality check

- [ ] **Day-of-week breakdown**: weekly volume mix presets
      (Quiet / Typical / Weekend-heavy) → "that's ~65 drinks Saturday night,
      ~12 on a Tuesday." Turns the abstract weekly number into something an
      owner can sanity-check against their room.
- [ ] **Named scenarios**: save "Current bar", "If I raise prices $1",
      "The Greenpoint space" to localStorage; compare side by side.

## Phase 3 — Findable and validated

- [ ] Custom domain + OG/meta tags (links unfurl nicely when shared)
- [ ] Short landing blurb above the fold for SEO
- [ ] Privacy-friendly analytics (Plausible or GoatCounter) + a
      "Was this useful?" feedback link

## Deliberately out of scope

No accounts, no backend, no database, no POS integration, no food-cost
module, no multi-city data (until someone asks), no framework rewrite.
Everything stays client-side on the no-build vanilla stack — free GitHub
Pages hosting, nothing to maintain.

**Order:** Phase 1 → 2 → 3. Minimum viable "real product" = PWA + profit
target.
