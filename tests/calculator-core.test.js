import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  validate,
  compute,
  getStatus,
  priceSensitivity,
  distributeWeekly,
  RHYTHM_PRESETS,
  WEEKDAYS,
  LEVELS,
  DEFAULT_CUSTOM_LEVELS,
  levelsToWeights
} from "../js/calculator-core.js";

const BASE = { rent: 8500, labor: 4200, other: 0, cost: 2.5, price: 14, days: 30, goal: 0 };

describe("validate", () => {
  test("valid input produces no errors", () => {
    assert.deepEqual(validate(BASE), []);
  });

  test("goal defaults to 0 when omitted", () => {
    const { goal, ...withoutGoal } = BASE;
    assert.deepEqual(validate(withoutGoal), []);
  });

  test("flags negative rent", () => {
    assert.ok(validate({ ...BASE, rent: -1 }).includes("Rent must be non-negative"));
  });

  test("flags negative labor", () => {
    assert.ok(validate({ ...BASE, labor: -1 }).includes("Labor costs must be non-negative"));
  });

  test("flags negative other expenses", () => {
    assert.ok(validate({ ...BASE, other: -1 }).includes("Other expenses must be non-negative"));
  });

  test("flags negative profit goal", () => {
    assert.ok(validate({ ...BASE, goal: -1 }).includes("Profit goal must be non-negative"));
  });

  test("flags negative cost", () => {
    assert.ok(validate({ ...BASE, cost: -1 }).includes("Cost per drink must be non-negative"));
  });

  test("flags zero price", () => {
    const errors = validate({ ...BASE, price: 0 });
    assert.ok(errors.includes("Selling price must be greater than zero"));
  });

  test("flags negative price with both price errors (edge case: price <= 0 AND price <= cost)", () => {
    const errors = validate({ ...BASE, price: -5, cost: 2 });
    assert.ok(errors.includes("Selling price must be greater than zero"));
    assert.ok(errors.includes("Selling price must be higher than cost"));
    assert.equal(errors.length, 2);
  });

  test("flags price equal to cost (zero margin)", () => {
    assert.ok(validate({ ...BASE, price: 5, cost: 5 }).includes("Selling price must be higher than cost"));
  });

  test("flags price below cost", () => {
    assert.ok(validate({ ...BASE, price: 4, cost: 5 }).includes("Selling price must be higher than cost"));
  });

  test("flags non-integer days", () => {
    assert.ok(validate({ ...BASE, days: 15.5 }).includes("Days must be between 1 and 31"));
  });

  test("flags days below 1", () => {
    assert.ok(validate({ ...BASE, days: 0 }).includes("Days must be between 1 and 31"));
  });

  test("flags days above 31", () => {
    assert.ok(validate({ ...BASE, days: 32 }).includes("Days must be between 1 and 31"));
  });

  test("accepts days boundary values 1 and 31", () => {
    assert.deepEqual(validate({ ...BASE, days: 1 }), []);
    assert.deepEqual(validate({ ...BASE, days: 31 }), []);
  });

  test("collects multiple simultaneous errors", () => {
    const errors = validate({ ...BASE, rent: -1, labor: -1, days: 0 });
    assert.equal(errors.length, 3);
  });
});

describe("compute", () => {
  test("matches hand-calculated example (Williamsburg-style inputs)", () => {
    const r = compute(BASE);
    // profit/drink = 14 - 2.5 = 11.5
    assert.ok(Math.abs(r.profitPerDrink - 11.5) < 1e-9);
    // monthly costs = 8500 + 4200 + 0 = 12700
    assert.equal(r.monthlyCosts, 12700);
    // monthly drinks = 12700 / 11.5 = 1104.347826...
    assert.ok(Math.abs(r.monthlyDrinksNeeded - 1104.3478260869565) < 1e-6);
    // daily = monthly / 30 = 36.81159...
    assert.ok(Math.abs(r.dailyDrinksTarget - 36.81159420289855) < 1e-6);
    // no goal set, so break-even equals the daily target
    assert.equal(r.breakEvenDaily, r.dailyDrinksTarget);
    // weekly = daily * 7
    assert.ok(Math.abs(r.weeklyDrinksTarget - 257.6811594202899) < 1e-6);
    // weekly revenue = weekly drinks * price
    assert.ok(Math.abs(r.weeklyRevenueTarget - 3607.5362318840577) < 1e-6);
    // margin = 11.5 / 14 * 100
    assert.ok(Math.abs(r.marginPct - 82.14285714285714) < 1e-9);

    // matches what the UI displays (ceil'd)
    assert.equal(Math.ceil(r.dailyDrinksTarget), 37);
    assert.equal(Math.ceil(r.weeklyDrinksTarget), 258);
  });

  test("profit goal is added on top of costs; breakEvenDaily stays cost-only", () => {
    const inputs = { rent: 7000, labor: 3000, other: 500, cost: 2, price: 12, days: 26, goal: 4000 };
    const r = compute(inputs);

    // monthly costs = 7000+3000+500 = 10500; target = 10500+4000 = 14500
    assert.equal(r.monthlyCosts, 10500);
    // monthly drinks needed (with goal) = 14500/10 = 1450
    assert.equal(r.monthlyDrinksNeeded, 1450);
    // daily (with goal) = 1450/26 = 55.769...
    assert.ok(Math.abs(r.dailyDrinksTarget - 55.76923076923077) < 1e-6);
    // break-even alone (no goal) = 10500/10/26 = 40.3846...
    assert.ok(Math.abs(r.breakEvenDaily - 40.38461538461539) < 1e-6);

    // matches what the UI showed: "56 drinks/day ... break-even alone is 41"
    assert.equal(Math.ceil(r.dailyDrinksTarget), 56);
    assert.equal(Math.ceil(r.breakEvenDaily), 41);
  });

  test("zero fixed costs still computes (only goal drives the target)", () => {
    const r = compute({ rent: 0, labor: 0, other: 0, cost: 2, price: 10, days: 30, goal: 800 });
    assert.equal(r.monthlyCosts, 0);
    assert.equal(r.breakEvenDaily, 0);
    // 800 / 8 profit-per-drink / 30 days
    assert.ok(Math.abs(r.dailyDrinksTarget - 800 / 8 / 30) < 1e-9);
  });

  test("tiny margin does not divide by zero (caller is responsible for validating price > cost)", () => {
    const r = compute({ ...BASE, price: 2.51, cost: 2.5 });
    assert.ok(Math.abs(r.profitPerDrink - 0.01) < 1e-9);
    assert.ok(r.dailyDrinksTarget > 40000); // huge but finite
    assert.ok(Number.isFinite(r.dailyDrinksTarget));
  });
});

describe("getStatus", () => {
  test("boundary at 100: sustainable", () => {
    assert.equal(getStatus(100), "sustainable");
  });
  test("boundary at 101: tight", () => {
    assert.equal(getStatus(101), "tight");
  });
  test("boundary at 200: tight", () => {
    assert.equal(getStatus(200), "tight");
  });
  test("boundary at 201: unsustainable", () => {
    assert.equal(getStatus(201), "unsustainable");
  });
  test("zero is sustainable", () => {
    assert.equal(getStatus(0), "sustainable");
  });
});

describe("priceSensitivity", () => {
  test("default span covers 7 points and flags the current price", () => {
    const points = priceSensitivity(BASE);
    assert.equal(points.length, 7);
    assert.deepEqual(
      points.map((p) => p.price),
      [11, 12, 13, 14, 15, 16, 17]
    );
    const current = points.find((p) => p.isCurrent);
    assert.equal(current.price, 14);
    assert.equal(points.filter((p) => p.isCurrent).length, 1);
  });

  test("skips price points at or below cost (edge case near the cost floor)", () => {
    const points = priceSensitivity({ ...BASE, price: 3, cost: 2.5 }, 3, 1);
    // deltas -3..3 -> prices 0,1,2,3,4,5,6; 0,1,2 are <= cost(2.5) and dropped
    assert.deepEqual(
      points.map((p) => p.price),
      [3, 4, 5, 6]
    );
  });

  test("drinksPerDay decreases monotonically as price rises", () => {
    const points = priceSensitivity(BASE);
    for (let i = 1; i < points.length; i++) {
      assert.ok(points[i].drinksPerDay <= points[i - 1].drinksPerDay);
    }
  });

  test("respects a custom step", () => {
    const points = priceSensitivity(BASE, 4, 2);
    assert.deepEqual(
      points.map((p) => p.price),
      [10, 12, 14, 16, 18]
    );
  });
});

describe("distributeWeekly", () => {
  test("even weights split evenly and tie for peak", () => {
    const days = distributeWeekly(140, RHYTHM_PRESETS.even.weights);
    assert.ok(days.every((d) => d.drinks === 20));
    assert.equal(days.reduce((s, d) => s + d.drinks, 0), 140);
    // every day ties for the max, so every day is flagged peak
    assert.ok(days.every((d) => d.isPeak));
  });

  test("typical preset matches the observed Sat-peak split (258/week)", () => {
    const days = distributeWeekly(258, RHYTHM_PRESETS.typical.weights);
    const byDay = Object.fromEntries(days.map((d) => [d.day, d.drinks]));
    assert.deepEqual(byDay, { Mon: 26, Tue: 26, Wed: 29, Thu: 35, Fri: 48, Sat: 55, Sun: 39 });
    const peakDays = days.filter((d) => d.isPeak);
    assert.equal(peakDays.length, 1);
    assert.equal(peakDays[0].day, "Sat");
    // rounding per day can drift the total by a small amount, never wildly
    const total = days.reduce((s, d) => s + d.drinks, 0);
    assert.ok(Math.abs(total - 258) <= WEEKDAYS.length);
  });

  test("weekendHeavy skews harder toward Fri/Sat than typical", () => {
    const typical = distributeWeekly(258, RHYTHM_PRESETS.typical.weights);
    const heavy = distributeWeekly(258, RHYTHM_PRESETS.weekendHeavy.weights);
    const satTypical = typical.find((d) => d.day === "Sat").drinks;
    const satHeavy = heavy.find((d) => d.day === "Sat").drinks;
    assert.ok(satHeavy > satTypical);
  });

  test("zero weekly total: no crash, no day flagged peak", () => {
    const days = distributeWeekly(0, RHYTHM_PRESETS.typical.weights);
    assert.ok(days.every((d) => d.drinks === 0));
    assert.ok(days.every((d) => !d.isPeak));
  });

  test("all-zero weights (degenerate custom input) does not divide by zero", () => {
    const days = distributeWeekly(258, [0, 0, 0, 0, 0, 0, 0]);
    assert.ok(days.every((d) => Number.isFinite(d.drinks)));
    assert.ok(days.every((d) => d.drinks === 0));
  });

  test("single heavily-weighted day takes (almost) the entire week", () => {
    const days = distributeWeekly(140, [0, 0, 0, 0, 0, 10, 0]);
    const byDay = Object.fromEntries(days.map((d) => [d.day, d.drinks]));
    assert.equal(byDay.Sat, 140);
    WEEKDAYS.filter((d) => d !== "Sat").forEach((day) => assert.equal(byDay[day], 0));
    assert.equal(days.find((d) => d.day === "Sat").isPeak, true);
  });

  test("output always covers exactly the 7 weekdays in Mon..Sun order", () => {
    const days = distributeWeekly(100, RHYTHM_PRESETS.typical.weights);
    assert.deepEqual(
      days.map((d) => d.day),
      ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    );
  });
});

describe("levelsToWeights (tap-to-select Custom rhythm)", () => {
  test("maps each of the 4 levels to its documented weight", () => {
    assert.deepEqual(levelsToWeights([1, 2, 3, 4]), [0.5, 1, 1.5, 2]);
  });

  test("default custom levels are all valid (1-4) and Mon..Sun length", () => {
    assert.equal(DEFAULT_CUSTOM_LEVELS.length, WEEKDAYS.length);
    assert.ok(DEFAULT_CUSTOM_LEVELS.every((lvl) => lvl >= 1 && lvl <= 4));
  });

  test("default custom levels feed distributeWeekly and peak on the busiest day", () => {
    const weights = levelsToWeights(DEFAULT_CUSTOM_LEVELS);
    const days = distributeWeekly(280, weights);
    // DEFAULT_CUSTOM_LEVELS = [2,2,2,3,4,4,3] -> Fri and Sat are both "Packed" (level 4, tied)
    const peakDays = days.filter((d) => d.isPeak).map((d) => d.day);
    assert.deepEqual(peakDays.sort(), ["Fri", "Sat"]);
  });

  test("all-Quiet levels still produce a valid (equal) distribution", () => {
    const weights = levelsToWeights([1, 1, 1, 1, 1, 1, 1]);
    const days = distributeWeekly(70, weights);
    assert.ok(days.every((d) => d.drinks === 10));
  });

  test("LEVELS is indexed 1-4 (index 0 unused) with ascending weights", () => {
    assert.equal(LEVELS[0], null);
    const weights = [1, 2, 3, 4].map((i) => LEVELS[i].weight);
    assert.deepEqual(weights, [...weights].sort((a, b) => a - b));
  });
});
