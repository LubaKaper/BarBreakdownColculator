# Project Updates

## 2026-07 — PRISM redesign + cleanup

Full visual redesign to a dark neon glassmorphism theme ("PRISM CALC") and a
simplification of the code.

**Design**
- New layout: hero with daily drinks target + status pill, weekly stat chips,
  bento input panels (Fixed Costs / Unit Metrics), neighborhood sidebar
- Montserrat typography, glass panels, ambient glows, animated light leak
- Respects `prefers-reduced-motion`

**New features**
- Live recalculation on every keystroke (Recalculate button kept for parity)
- Price sensitivity chart: drinks/day needed at ±$3 around the current price
- Weekly drinks and weekly revenue targets, margin %
- Neighborhood card shows averages plus a relative cost-level meter

**Code changes**
- Neighborhood data embedded as a JS module (`js/data/brooklyn-bar-data.js`)
  instead of fetched JSON — no more fetch/CORS failures, works from file://
- One entry point (`js/app.js`) replaces `calculator.js` + `neighborhoods.js`
  and the duplicated inline script in `index.html`
- `calculator-core.js` stays pure (validate/compute/status/sensitivity)
- Removed 9 debug/test HTML files and stale CSS scratch files

## Earlier — restructure

Separated the original single-file app into `index.html`, `css/styles.css`,
and `js/`, added the Other Monthly Expenses field, reset button, status
indicators, and mobile improvements.
