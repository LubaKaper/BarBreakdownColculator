// Pure break-even math. No DOM access — keep it testable.

export const validate = ({ rent, labor, other, cost, price, days, goal = 0 }) => {
  const errors = [];

  if (rent < 0) errors.push("Rent must be non-negative");
  if (labor < 0) errors.push("Labor costs must be non-negative");
  if (other < 0) errors.push("Other expenses must be non-negative");
  if (goal < 0) errors.push("Profit goal must be non-negative");
  if (cost < 0) errors.push("Cost per drink must be non-negative");
  if (price <= 0) errors.push("Selling price must be greater than zero");
  if (price <= cost) errors.push("Selling price must be higher than cost");
  if (!Number.isInteger(days) || days < 1 || days > 31)
    errors.push("Days must be between 1 and 31");

  return errors;
};

// With a profit goal set, the headline targets cover costs + goal;
// breakEvenDaily is always the costs-only number.
export const compute = ({ rent, labor, other, cost, price, days, goal = 0 }) => {
  const profitPerDrink = price - cost;
  const monthlyCosts = rent + labor + other;
  const monthlyTarget = monthlyCosts + goal;
  const monthlyDrinksNeeded = monthlyTarget / profitPerDrink;
  const dailyDrinksTarget = monthlyDrinksNeeded / days;
  const breakEvenDaily = monthlyCosts / profitPerDrink / days;
  const weeklyDrinksTarget = dailyDrinksTarget * 7;
  const weeklyRevenueTarget = weeklyDrinksTarget * price;
  const marginPct = (profitPerDrink / price) * 100;

  return {
    profitPerDrink,
    monthlyCosts,
    monthlyDrinksNeeded,
    dailyDrinksTarget,
    breakEvenDaily,
    weeklyDrinksTarget,
    weeklyRevenueTarget,
    marginPct
  };
};

// Sustainability tiers by required drinks per day.
export const getStatus = (drinksPerDay) => {
  if (drinksPerDay <= 100) return "sustainable";
  if (drinksPerDay <= 200) return "tight";
  return "unsustainable";
};

export const STATUS_LABELS = {
  sustainable: "Sustainable",
  tight: "Tight margins",
  unsustainable: "Unsustainable"
};

// Drinks/day needed at a range of prices around the current one,
// for the price-sensitivity chart. Prices at or below cost are skipped.
export const priceSensitivity = (inputs, span = 3, step = 1) => {
  const points = [];
  for (let delta = -span; delta <= span; delta += step) {
    const price = inputs.price + delta;
    if (price <= inputs.cost) continue;
    const { dailyDrinksTarget } = compute({ ...inputs, price });
    points.push({
      price,
      isCurrent: delta === 0,
      drinksPerDay: Math.ceil(dailyDrinksTarget)
    });
  }
  return points;
};

// ---- weekly rhythm --------------------------------------------------------
// Splits the weekly drinks target across days of the week. Weights are
// relative, not required to sum to 100 — distributeWeekly() normalizes.

export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const RHYTHM_PRESETS = {
  even: {
    label: "Even",
    weights: [1, 1, 1, 1, 1, 1, 1]
  },
  typical: {
    label: "Typical",
    weights: [0.8, 0.8, 0.9, 1.1, 1.5, 1.7, 1.2]
  },
  weekendHeavy: {
    label: "Weekend-heavy",
    weights: [0.5, 0.5, 0.6, 1.0, 1.8, 2.2, 1.4]
  }
};

// Distributes weeklyDrinks across 7 days by relative weight.
// Returns [{ day, drinks, isPeak }], drinks rounded, peak day flagged.
export const distributeWeekly = (weeklyDrinks, weights) => {
  const total = weights.reduce((sum, w) => sum + w, 0) || 1;
  const drinksByDay = weights.map((w) => Math.round((weeklyDrinks * w) / total));
  const peak = Math.max(...drinksByDay);
  return WEEKDAYS.map((day, i) => ({
    day,
    drinks: drinksByDay[i],
    isPeak: drinksByDay[i] === peak && peak > 0
  }));
};
