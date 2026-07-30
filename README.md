<p align="center">
  <img src="readme-assets/banner.svg" alt="PRISM CALC — Bar Break-Even Calculator" width="100%">
</p>

<p align="center">
  <em>Pour the numbers in. Know your number. Keep the lights on.</em>
</p>

<p align="center">
  <a href="https://lubakaper.github.io/BarBreakdownColculator/"><strong>Open the app →</strong></a>
</p>

<img src="readme-assets/divider.svg" alt="" width="100%">

## The pitch

Every bar owner does this math on a napkin at 1am: *rent, payroll, pour cost, drink price — how many pours a night actually keeps this place open?*

PRISM CALC does the napkin math for you, live, with a little neon flair. Type five numbers, get your number. No spreadsheet, no login, no nonsense.

<img src="readme-assets/divider.svg" alt="" width="100%">

## What's behind the bar

<table>
<tr>
<td width="56" valign="top"><img src="readme-assets/icon-chart.svg" width="40"></td>
<td>

**Live break-even math**
Results update as you type — rent, labor, other costs, pour cost, price, days open. Drop a number in, watch the target move.

</td>
</tr>
<tr>
<td width="56" valign="top"><img src="readme-assets/icon-bolt.svg" width="40"></td>
<td>

**A status you can feel**
Sustainable, Tight, or Unsustainable — color-coded so you know at a glance whether tonight's number is realistic or a fantasy.

</td>
</tr>
<tr>
<td width="56" valign="top"><img src="readme-assets/icon-bank.svg" width="40"></td>
<td>

**Profit goal, not just survival**
Nobody opens a bar to break even. Set a monthly profit target and the headline shows what it actually takes to pay yourself.

</td>
</tr>
<tr>
<td width="56" valign="top"><img src="readme-assets/icon-pin.svg" width="40"></td>
<td>

**Brooklyn neighborhood presets**
Fifteen neighborhoods, one dropdown. Pick DUMBO or Bed-Stuy and the averages for rent, labor, and drink price pour right into the form.

</td>
</tr>
<tr>
<td width="56" valign="top"><img src="readme-assets/icon-chart.svg" width="40"></td>
<td>

**Price sensitivity, at a glance**
A little bar chart shows how the daily target shifts if you bump the menu price up or down a few dollars — before you touch the menu.

</td>
</tr>
<tr>
<td width="56" valign="top"><img src="readme-assets/icon-chart.svg" width="40"></td>
<td>

**Weekly rhythm**
Splits the weekly target across Mon–Sun — Even, Typical, or Weekend-heavy — so "258 drinks a week" becomes "~55 on Saturday, ~26 on a Monday." Pick Custom to set your own per-day weights if the presets don't match your room.

</td>
</tr>
<tr>
<td width="56" valign="top"><img src="readme-assets/icon-share.svg" width="40"></td>
<td>

**Text it to your business partner**
Every scenario lives in the link. Hit Share, send it, they open it and see your exact numbers — no account, no export, no email attachment.

</td>
</tr>
</table>

**Also on the bar:** installable as a phone app that works with no signal, your numbers saved on your own device (nowhere else), and full keyboard/screen-reader support.

<img src="readme-assets/divider.svg" alt="" width="100%">

## The math on the napkin

```
profit per drink   = selling price − cost to make
monthly costs       = rent + labor + other expenses (+ profit goal, if set)
drinks per day       = (monthly costs ÷ profit per drink) ÷ days open
weekly revenue target = drinks per day × 7 × selling price
```

No hidden fees, no black box — that's the whole recipe.

<img src="readme-assets/divider.svg" alt="" width="100%">

## Order at the bar

1. Open the app (or install it — see below)
2. Pour in your rent, labor, other expenses, pour cost, and drink price
3. Optional: set a monthly profit goal if break-even isn't the point
4. Watch your daily drinks target land, live
5. Hit **Share** to send the scenario to a partner, or **Reset** to start a fresh tab

Prefer a running start? Pick a Brooklyn neighborhood in the sidebar and the form fills itself.

### Install it like a real app

On your phone: open the [live link](https://lubakaper.github.io/BarBreakdownColculator/), then **Add to Home Screen**. It opens fullscreen, no browser chrome, and keeps working even if the wifi at the bar is garbage.

<img src="readme-assets/divider.svg" alt="" width="100%">

## Running the bar locally

No build step, no dependencies to install. Fonts come from Google Fonts; everything else is vanilla JS.

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`. (A plain server keeps the JS modules and service worker happy — opening `index.html` straight from disk works too, minus offline caching.)

### Running the tests

The break-even math is the one thing in this app that has to be right, so it's covered by an automated suite — no framework, just Node's built-in test runner:

```bash
npm test
```

Covers `calculator-core.js` (validation, break-even/profit-goal math, price sensitivity, weekly rhythm distribution) and the money/integer formatters, including boundary and edge cases: zero and negative inputs, price equal to or below cost, tied peak days, an all-zero custom weekly rhythm, and the always-round-up behavior of the drinks target.

<img src="readme-assets/divider.svg" alt="" width="100%">

## What's under the bar top

```
BarBreakdownColculator/
├── index.html                     # Page structure
├── manifest.webmanifest           # PWA manifest
├── sw.js                          # Service worker (offline cache; bump CACHE_NAME on deploy)
├── package.json                   # Just "npm test" — no runtime dependencies
├── icons/                         # App icons (512 / 192 / apple-touch)
├── readme-assets/                 # Banner + icons for this README
├── tests/                         # node --test suite for the math
│   ├── calculator-core.test.js
│   └── format.test.js
├── css/
│   └── styles.css                 # PRISM theme (dark neon glassmorphism)
└── js/
    ├── app.js                     # Entry point: form, charts, neighborhoods, persistence, share
    ├── calculator-core.js         # Pure math: validate, compute, price sensitivity, weekly rhythm
    ├── data/
    │   └── brooklyn-bar-data.js   # Embedded neighborhood averages
    └── utils/
        ├── format.js              # Currency/number formatting
        ├── state.js               # localStorage save/restore
        └── ui.js                  # Count-up animation helpers
```

### Restocking the neighborhood data

Edit `js/data/brooklyn-bar-data.js`. Each entry needs `avgCommercialRent`, `avgDrinkPrice`, `avgLaborCost`, and `displayName`. These are illustrative estimates, not a market survey — always check against your own lease and payroll.

<img src="readme-assets/divider.svg" alt="" width="100%">

## What's next

There's a short roadmap in [`ROADMAP.md`](ROADMAP.md) — day-of-week volume breakdowns, saved scenarios, that kind of thing. No accounts, no backend, no bloat. Last call is early on this one.

## License

MIT — pour, remix, and serve however you like.
