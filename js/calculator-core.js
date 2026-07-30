// Pure break-even math. No DOM access — keep it testable.

export const validate = ({ rent, labor, other, cost, price, days }) => {
  const errors = [];

  if (rent < 0) errors.push("Rent must be non-negative");
  if (labor < 0) errors.push("Labor costs must be non-negative");
  if (other < 0) errors.push("Other expenses must be non-negative");
  if (cost < 0) errors.push("Cost per drink must be non-negative");
  if (price <= 0) errors.push("Selling price must be greater than zero");
  if (price <= cost) errors.push("Selling price must be higher than cost");
  if (!Number.isInteger(days) || days < 1 || days > 31)
    errors.push("Days must be between 1 and 31");

  return errors;
};

export const compute = ({ rent, labor, other, cost, price, days }) => {
  const profitPerDrink = price - cost;
  const monthlyCosts = rent + labor + other;
  const monthlyDrinksNeeded = monthlyCosts / profitPerDrink;
  const dailyDrinksTarget = monthlyDrinksNeeded / days;
  const weeklyDrinksTarget = dailyDrinksTarget * 7;
  const weeklyRevenueTarget = weeklyDrinksTarget * price;
  const marginPct = (profitPerDrink / price) * 100;

  return {
    profitPerDrink,
    monthlyCosts,
    monthlyDrinksNeeded,
    dailyDrinksTarget,
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
