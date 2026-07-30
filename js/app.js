// App entry: wires the form, neighborhood picker, hero stats and chart.
import {
  validate,
  compute,
  getStatus,
  STATUS_LABELS,
  priceSensitivity,
  WEEKDAYS,
  RHYTHM_PRESETS,
  distributeWeekly,
  LEVELS,
  DEFAULT_CUSTOM_LEVELS,
  levelsToWeights
} from "./calculator-core.js";
import { NEIGHBORHOODS, MAX_RENT, sortedNeighborhoods } from "./data/brooklyn-bar-data.js";
import { saveState, restoreState } from "./utils/state.js";
import { fmtMoney, fmtInt } from "./utils/format.js";
import { countUp } from "./utils/ui.js";

// Light/dark toggle: persisted choice wins; otherwise system preference.
// The actual initial theme is set synchronously in index.html to avoid a flash.
const THEME_COLORS = { dark: "#0b1326", light: "#f5f4fb" };

const initThemeToggle = () => {
  const toggle = document.getElementById("themeToggle");
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (!toggle) return;

  toggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
    const next = current === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    if (metaTheme) metaTheme.setAttribute("content", THEME_COLORS[next]);
    try {
      localStorage.setItem("prism-theme", next);
    } catch (e) {}
  });
};

document.addEventListener("DOMContentLoaded", () => {
  initThemeToggle();

  const $ = (id) => document.getElementById(id);

  const fields = {
    rent: $("rent"),
    labor: $("labor"),
    other: $("other"),
    cost: $("cost"),
    price: $("price"),
    days: $("days"),
    goal: $("goal")
  };

  const hero = {
    value: $("heroValue"),
    unit: $("heroUnit"),
    status: $("statusPill"),
    note: $("heroNote"),
    weeklyDrinks: $("weeklyDrinks"),
    weeklyRevenue: $("weeklyRevenue")
  };

  const metrics = {
    profitPerDrink: $("profitPerDrink"),
    monthlyDrinks: $("monthlyDrinks"),
    monthlyCosts: $("monthlyCosts"),
    margin: $("marginPct")
  };

  const errEl = $("error");
  const chartEl = $("chart");
  const chartEmptyEl = $("chartEmpty");
  const hoodSelect = $("neighborhoodSelect");
  const hoodCard = $("neighborhoodCard");

  const rhythmSelect = $("rhythmSelect");
  const rhythmCustomEl = $("rhythmCustom");
  const rhythmChartEl = $("rhythmChart");
  const rhythmChartEmptyEl = $("rhythmChartEmpty");
  const dayLevelGrid = $("dayLevelGrid");

  // ---- helpers -------------------------------------------------------------

  const readInputs = () => ({
    rent: parseFloat(fields.rent.value) || 0,
    labor: parseFloat(fields.labor.value) || 0,
    other: parseFloat(fields.other.value) || 0,
    cost: parseFloat(fields.cost.value) || 0,
    price: parseFloat(fields.price.value) || 0,
    days: parseInt(fields.days.value, 10) || 0,
    goal: parseFloat(fields.goal.value) || 0
  });

  // Don't validate/render until the pricing fields are filled in —
  // avoids showing errors on a fresh, untouched form.
  const formReady = () => fields.price.value !== "" && fields.cost.value !== "";

  // ---- weekly rhythm ---------------------------------------------------------
  // Custom rhythm is a tap-able 4-level meter per day (Quiet/Normal/Busy/
  // Packed) rather than raw numbers — faster to use, especially on a phone.

  let customLevels = null; // array of 7 ints (1-4), Mon..Sun; null = not seeded yet

  const ensureCustomSeeded = () => {
    if (!customLevels) customLevels = [...DEFAULT_CUSTOM_LEVELS];
  };

  const getCustomLevels = () => {
    ensureCustomSeeded();
    return customLevels;
  };

  const renderDayLevel = (i) => {
    ensureCustomSeeded();
    const level = customLevels[i];
    const col = dayLevelGrid.children[i];
    if (!col) return;
    col.querySelectorAll(".day-level-seg").forEach((seg) => {
      seg.classList.toggle("filled", Number(seg.dataset.level) <= level);
    });
    col.querySelector(".day-level-track").dataset.level = level;
    col.querySelector(".day-level-name").textContent = LEVELS[level].label;
  };

  const renderAllDayLevels = () => WEEKDAYS.forEach((_, i) => renderDayLevel(i));

  const seedCustomLevels = (levels) => {
    customLevels = [...levels];
    renderAllDayLevels();
  };

  // Builds the 7 day columns once; each column's fill state is updated
  // separately by renderDayLevel() as taps happen, not rebuilt from scratch.
  const buildDayLevelGrid = () => {
    dayLevelGrid.innerHTML = "";
    WEEKDAYS.forEach((day, i) => {
      const col = document.createElement("div");
      col.className = "day-level";

      const dayLabel = document.createElement("span");
      dayLabel.className = "day-level-day";
      dayLabel.textContent = day;

      const track = document.createElement("div");
      track.className = "day-level-track";
      track.setAttribute("role", "group");
      track.setAttribute("aria-label", `${day} volume level`);

      for (let lvl = 1; lvl <= 4; lvl++) {
        const seg = document.createElement("button");
        seg.type = "button";
        seg.className = "day-level-seg";
        seg.dataset.level = lvl;
        seg.setAttribute("aria-label", `${day}: ${LEVELS[lvl].label}`);
        seg.addEventListener("click", () => {
          ensureCustomSeeded();
          customLevels[i] = lvl;
          renderDayLevel(i);
          persist();
          render();
        });
        track.appendChild(seg);
      }

      const nameEl = document.createElement("span");
      nameEl.className = "day-level-name";

      col.appendChild(dayLabel);
      col.appendChild(track);
      col.appendChild(nameEl);
      dayLevelGrid.appendChild(col);
    });
  };

  const getRhythmWeights = () => {
    if (rhythmSelect.value === "custom") return levelsToWeights(getCustomLevels());
    return (RHYTHM_PRESETS[rhythmSelect.value] || RHYTHM_PRESETS.typical).weights;
  };

  const updateRhythmVisibility = () => {
    rhythmCustomEl.hidden = rhythmSelect.value !== "custom";
  };

  // ---- shareable URLs ------------------------------------------------------

  const URL_KEYS = ["rent", "labor", "other", "cost", "price", "days", "goal"];

  // Mirror the form into the query string so the current scenario is a link.
  const updateURL = () => {
    const params = new URLSearchParams();
    URL_KEYS.forEach((k) => {
      if (fields[k].value !== "") params.set(k, fields[k].value);
    });
    if (hoodSelect.value) params.set("hood", hoodSelect.value);
    if (rhythmSelect.value !== "typical") params.set("rhythm", rhythmSelect.value);
    if (rhythmSelect.value === "custom") params.set("w", getCustomLevels().join(","));
    const qs = params.toString();
    history.replaceState(null, "", qs ? `?${qs}` : location.pathname);
  };

  // Returns true if the URL carried a scenario (takes precedence over storage).
  const applyURLParams = () => {
    const params = new URLSearchParams(location.search);
    const hasAny = URL_KEYS.some((k) => params.has(k)) || params.has("hood") || params.has("rhythm");
    if (!hasAny) return false;
    URL_KEYS.forEach((k) => {
      if (params.has(k)) fields[k].value = params.get(k);
    });
    const hood = params.get("hood");
    if (hood && NEIGHBORHOODS[hood]) hoodSelect.value = hood;
    const rhythm = params.get("rhythm");
    if (rhythm && (RHYTHM_PRESETS[rhythm] || rhythm === "custom")) rhythmSelect.value = rhythm;
    const w = params.get("w");
    if (rhythm === "custom" && w) {
      const parsed = w.split(",").map((n) => parseInt(n, 10));
      if (parsed.length === WEEKDAYS.length && parsed.every((n) => n >= 1 && n <= 4)) {
        seedCustomLevels(parsed);
      }
    }
    return true;
  };

  const persist = () => {
    saveState({
      rent: fields.rent.value,
      labor: fields.labor.value,
      other: fields.other.value,
      cost: fields.cost.value,
      price: fields.price.value,
      days: fields.days.value,
      goal: fields.goal.value,
      neighborhood: hoodSelect.value || "",
      rhythm: rhythmSelect.value,
      rhythmLevels: rhythmSelect.value === "custom" ? getCustomLevels() : null
    });
    updateURL();
  };

  const showError = (messages) => {
    errEl.innerHTML = messages.map((m) => `<div>${m}</div>`).join("");
    errEl.hidden = false;
  };

  const clearError = () => {
    errEl.textContent = "";
    errEl.hidden = true;
  };

  // ---- rendering -----------------------------------------------------------

  const clearResults = () => {
    hero.value.textContent = "—";
    hero.status.hidden = true;
    hero.note.hidden = true;
    hero.weeklyDrinks.textContent = "—";
    hero.weeklyRevenue.textContent = "—";
    Object.values(metrics).forEach((el) => (el.textContent = "—"));
    chartEl.innerHTML = "";
    chartEmptyEl.hidden = false;
    rhythmChartEl.innerHTML = "";
    rhythmChartEmptyEl.hidden = false;
  };

  const renderChart = (inputs) => {
    const points = priceSensitivity(inputs);
    chartEl.innerHTML = "";
    chartEmptyEl.hidden = points.length > 0;
    if (!points.length) return;

    const max = Math.max(...points.map((p) => p.drinksPerDay));
    points.forEach((p) => {
      const bar = document.createElement("div");
      bar.className = "chart-bar" + (p.isCurrent ? " current" : "");
      const fill = document.createElement("div");
      fill.className = "chart-fill";
      fill.style.height = `${Math.max(6, (p.drinksPerDay / max) * 100)}%`;
      fill.title = `${p.drinksPerDay} drinks/day at $${p.price}`;
      const count = document.createElement("span");
      count.className = "chart-count";
      count.textContent = p.drinksPerDay;
      const label = document.createElement("span");
      label.className = "chart-label";
      label.textContent = `$${p.price}`;
      fill.appendChild(count);
      bar.appendChild(fill);
      bar.appendChild(label);
      chartEl.appendChild(bar);
    });
  };

  const renderRhythmChart = (weeklyDrinks) => {
    const weights = getRhythmWeights();
    const days = distributeWeekly(weeklyDrinks, weights);
    rhythmChartEl.innerHTML = "";
    const max = Math.max(...days.map((d) => d.drinks));
    rhythmChartEmptyEl.hidden = max > 0;
    if (max <= 0) return;

    days.forEach((d) => {
      const bar = document.createElement("div");
      bar.className = "chart-bar" + (d.isPeak ? " current" : "");
      const fill = document.createElement("div");
      fill.className = "chart-fill";
      fill.style.height = `${Math.max(6, (d.drinks / max) * 100)}%`;
      fill.title = `${d.day}: ${d.drinks} drinks`;
      const count = document.createElement("span");
      count.className = "chart-count";
      count.textContent = d.drinks;
      const label = document.createElement("span");
      label.className = "chart-label";
      label.textContent = d.day;
      fill.appendChild(count);
      bar.appendChild(fill);
      bar.appendChild(label);
      rhythmChartEl.appendChild(bar);
    });
  };

  const render = ({ animate = false } = {}) => {
    clearError();

    if (!formReady()) {
      clearResults();
      return;
    }

    const inputs = readInputs();
    const errors = validate(inputs);
    if (errors.length) {
      showError(errors);
      clearResults();
      return;
    }

    const r = compute(inputs);
    const daily = Math.ceil(r.dailyDrinksTarget);
    const status = getStatus(daily);

    hero.status.hidden = false;
    hero.status.className = `status-pill ${status}`;
    hero.status.textContent = STATUS_LABELS[status];
    hero.value.className = `hero-value ${status}`;

    if (inputs.goal > 0) {
      hero.note.hidden = false;
      hero.note.textContent = `Includes your ${fmtMoney(inputs.goal)}/mo profit goal — break-even alone is ${fmtInt(Math.ceil(r.breakEvenDaily))} drinks/day`;
    } else {
      hero.note.hidden = true;
    }

    const weekly = Math.ceil(r.weeklyDrinksTarget);
    if (animate) {
      countUp(hero.value, daily, (n) => fmtInt(n));
      countUp(hero.weeklyDrinks, weekly, (n) => fmtInt(n));
      countUp(hero.weeklyRevenue, r.weeklyRevenueTarget, fmtMoney);
      countUp(metrics.profitPerDrink, r.profitPerDrink, fmtMoney);
      countUp(metrics.monthlyDrinks, Math.ceil(r.monthlyDrinksNeeded), fmtInt);
      countUp(metrics.monthlyCosts, r.monthlyCosts, fmtMoney);
    } else {
      hero.value.textContent = fmtInt(daily);
      hero.weeklyDrinks.textContent = fmtInt(weekly);
      hero.weeklyRevenue.textContent = fmtMoney(r.weeklyRevenueTarget);
      metrics.profitPerDrink.textContent = fmtMoney(r.profitPerDrink);
      metrics.monthlyDrinks.textContent = fmtInt(Math.ceil(r.monthlyDrinksNeeded));
      metrics.monthlyCosts.textContent = fmtMoney(r.monthlyCosts);
    }
    metrics.margin.textContent = `${r.marginPct.toFixed(0)}%`;

    renderChart(inputs);
    renderRhythmChart(r.weeklyDrinksTarget);
  };

  // ---- neighborhoods -------------------------------------------------------

  const renderNeighborhoodCard = (key) => {
    const hood = NEIGHBORHOODS[key];
    if (!hood) {
      hoodCard.innerHTML =
        '<p class="hood-hint">Pick a neighborhood to load average rent, labor and drink price into the calculator.</p>';
      return;
    }
    const rentLevel = Math.round((hood.avgCommercialRent / MAX_RENT) * 100);
    hoodCard.innerHTML = `
      <div class="hood-name">${hood.displayName}</div>
      <div class="hood-rows">
        <div class="hood-row"><span>Monthly rent</span><strong>${fmtMoney(hood.avgCommercialRent)}</strong></div>
        <div class="hood-row"><span>Monthly labor</span><strong>${fmtMoney(hood.avgLaborCost)}</strong></div>
        <div class="hood-row"><span>Avg drink price</span><strong>${fmtMoney(hood.avgDrinkPrice)}</strong></div>
      </div>
      <div class="hood-meter"><div class="hood-meter-fill" style="width:${rentLevel}%"></div></div>
      <div class="hood-meter-labels"><span>Cost level</span><span>${rentLevel}% of DUMBO rent</span></div>
      <p class="hood-hint">Averages applied to the form — adjust anything to fit your bar.</p>
    `;
  };

  const applyNeighborhood = (key) => {
    const hood = NEIGHBORHOODS[key];
    if (!hood) return;
    fields.rent.value = hood.avgCommercialRent;
    fields.labor.value = hood.avgLaborCost;
    fields.price.value = hood.avgDrinkPrice;
    renderNeighborhoodCard(key);
    persist();
    render({ animate: true });
  };

  // Populate dropdown alphabetically.
  sortedNeighborhoods().forEach(([key, hood]) => {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = hood.displayName;
    hoodSelect.appendChild(opt);
  });

  hoodSelect.addEventListener("change", () => {
    if (hoodSelect.value) applyNeighborhood(hoodSelect.value);
    else {
      renderNeighborhoodCard(null);
      persist();
    }
  });

  // ---- events --------------------------------------------------------------

  Object.values(fields).forEach((el) => {
    el.addEventListener("input", () => {
      persist();
      render();
    });
  });

  rhythmSelect.addEventListener("change", () => {
    updateRhythmVisibility();
    if (rhythmSelect.value === "custom") {
      ensureCustomSeeded();
      renderAllDayLevels();
    }
    persist();
    render();
  });

  $("calcForm").addEventListener("submit", (e) => {
    e.preventDefault();
    render({ animate: true });
  });

  $("share").addEventListener("click", async () => {
    updateURL();
    const url = location.href;
    const label = $("shareLabel");
    if (navigator.share) {
      try {
        await navigator.share({ title: "PRISM CALC — my bar numbers", url });
        return;
      } catch (e) {
        if (e.name === "AbortError") return; // user closed the share sheet
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      label.textContent = "Link copied";
      setTimeout(() => (label.textContent = "Share"), 2000);
    } catch (e) {
      label.textContent = "Copy failed";
      setTimeout(() => (label.textContent = "Share"), 2000);
    }
  });

  $("reset").addEventListener("click", () => {
    localStorage.removeItem("barCalculator");
    hoodSelect.value = "";
    renderNeighborhoodCard(null);
    rhythmSelect.value = "typical";
    customLevels = null;
    updateRhythmVisibility();
    history.replaceState(null, "", location.pathname);
    // Let the native reset clear inputs first, then redraw.
    requestAnimationFrame(() => {
      fields.days.value = 30;
      clearError();
      clearResults();
    });
  });

  // ---- init ----------------------------------------------------------------

  buildDayLevelGrid();

  // A scenario in the URL (shared link) wins over saved state.
  if (applyURLParams()) {
    renderNeighborhoodCard(hoodSelect.value || null);
    persist();
  } else {
    const saved = restoreState();
    if (saved) {
      Object.keys(fields).forEach((k) => {
        if (saved[k] !== undefined && saved[k] !== null && saved[k] !== "") {
          fields[k].value = saved[k];
        }
      });
      if (saved.neighborhood && NEIGHBORHOODS[saved.neighborhood]) {
        hoodSelect.value = saved.neighborhood;
        renderNeighborhoodCard(saved.neighborhood);
      } else {
        renderNeighborhoodCard(null);
      }
      if (saved.rhythm && (RHYTHM_PRESETS[saved.rhythm] || saved.rhythm === "custom")) {
        rhythmSelect.value = saved.rhythm;
      }
      if (
        saved.rhythm === "custom" &&
        Array.isArray(saved.rhythmLevels) &&
        saved.rhythmLevels.length === WEEKDAYS.length &&
        saved.rhythmLevels.every((n) => n >= 1 && n <= 4)
      ) {
        seedCustomLevels(saved.rhythmLevels);
      }
    } else {
      renderNeighborhoodCard(null);
    }
  }

  updateRhythmVisibility();
  render();

  // Offline support / installability. When a deploy ships new HTML but the
  // page is still controlled by an older service worker, that old worker
  // keeps serving its stale cached CSS/JS for the rest of this page load —
  // there's no way to swap them mid-load. Once the new worker finishes
  // activating and takes control, reload once so the next load is fully
  // consistent instead of leaving visitors on a stale/new mix.
  if ("serviceWorker" in navigator) {
    // Only reload on a controller change if a worker was ALREADY controlling
    // this page — that means an update just took over. On a brand-new visit
    // (no prior controller), the first controllerchange is just the initial
    // activation and there's nothing stale to fix, so skip it.
    const hadController = Boolean(navigator.serviceWorker.controller);
    navigator.serviceWorker.register("./sw.js").catch(() => {});

    let reloadedForUpdate = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!hadController || reloadedForUpdate) return;
      reloadedForUpdate = true;
      location.reload();
    });
  }
});
