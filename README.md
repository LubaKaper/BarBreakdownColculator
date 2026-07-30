# PRISM CALC — Bar Break-Even Calculator

A mobile-friendly web app that tells bar owners how many drinks they need to sell per day to cover their costs, with Brooklyn neighborhood averages for quick benchmarking. Dark neon glassmorphism UI, zero dependencies.

## Features

- **Installable app (PWA)** — add to a phone home screen, opens fullscreen, works offline
- **Shareable links** — inputs live in the URL; the Share button copies a link that opens pre-filled
- **Profit goal mode** — optional monthly profit target; the headline shows drinks/day to hit it, with break-even noted alongside
- **Live break-even analysis** — results update as you type; no need to press Calculate
- **Daily drinks target** with sustainability status (Sustainable ≤ 100/day, Tight ≤ 200/day, Unsustainable above)
- **Weekly targets** — drinks per week and weekly revenue needed
- **Price sensitivity chart** — drinks/day needed at price points ±$3 around yours
- **Brooklyn neighborhood presets** — pick one of 15 neighborhoods to load average rent, labor cost, and drink price
- **Detailed metrics** — profit per drink, margin %, monthly drinks needed, monthly costs
- **Persistence** — inputs and selected neighborhood survive a page reload (localStorage)
- Validation with clear error messages, accessible form controls, responsive layout

## Formulas

- Profit per drink = selling price − cost to make
- Total monthly costs = rent + labor + other expenses
- Drinks per day = (monthly costs ÷ profit per drink) ÷ days open
- Weekly revenue target = drinks per day × 7 × selling price

## Usage

Open the app and enter your numbers, or pick a neighborhood to prefill averages:

- Monthly Rent, Labor & Staffing, Other Monthly Expenses ($)
- Avg. Drink Price and Cost to Make One Drink ($)
- Days Open Per Month (default 30)

Results appear as soon as price and cost are filled in.

### Live Demo

https://lubakaper.github.io/BarBreakdownColculator/

### Running locally

The app has no build step and no runtime dependencies (fonts come from Google Fonts). Neighborhood data is embedded as a JS module, so no server is strictly required — but ES modules load most reliably over HTTP:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000

## Project Structure

```
BarBreakdownColculator/
├── index.html                     # Page structure
├── manifest.webmanifest           # PWA manifest
├── sw.js                          # Service worker (offline cache; bump CACHE_NAME on deploy)
├── icons/                         # App icons (512/192/apple-touch)
├── css/
│   └── styles.css                 # PRISM theme (dark neon glassmorphism)
└── js/
    ├── app.js                     # Entry point: form, chart, neighborhoods, persistence
    ├── calculator-core.js         # Pure math: validate, compute, price sensitivity
    ├── data/
    │   └── brooklyn-bar-data.js   # Embedded neighborhood averages
    └── utils/
        ├── format.js              # Currency/number formatting
        ├── state.js               # localStorage save/restore
        └── ui.js                  # Count-up animation helpers
```

### Updating neighborhood data

Edit `js/data/brooklyn-bar-data.js`. Each entry needs `avgCommercialRent`, `avgDrinkPrice`, `avgLaborCost`, and `displayName`.

## License

MIT License — feel free to use and modify.
