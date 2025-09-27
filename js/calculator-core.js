export const validate = ({rent, labor, other, cost, price, days}) => {
    const errors = [];
    
    if (rent < 0) errors.push('Rent must be non-negative');
    if (labor < 0) errors.push('Labor costs must be non-negative');
    if (other < 0) errors.push('Other expenses must be non-negative');
    if (cost < 0) errors.push('Cost per drink must be non-negative');
    if (price <= 0) errors.push('Selling price must be greater than zero');
    if (price <= cost) errors.push('Selling price must be higher than cost');
    if (!Number.isInteger(days) || days < 1 || days > 31) errors.push('Days must be between 1 and 31');
    
    return errors;
};

export const compute = ({rent, labor, other, cost, price, days}) => {
    const profitPerDrink = price - cost;
    const monthlyCosts = rent + labor + other;
    const monthlyDrinksNeeded = monthlyCosts / profitPerDrink;
    const dailyDrinksTarget = monthlyDrinksNeeded / days;
    
    return {
        profitPerDrink,
        monthlyCosts,
        monthlyDrinksNeeded,
        dailyDrinksTarget
    };
};