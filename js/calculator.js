import { validate, compute } from './calculator-core.js';
import { saveState, restoreState } from './utils/state.js';
import { fmtMoney, fmtInt } from './utils/format.js';
import { countUp, revealValues } from './utils/ui.js';

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('calcForm');
  const rentEl = document.getElementById('rent');
  const laborEl = document.getElementById('labor');
  const otherEl = document.getElementById('other');
  const costEl = document.getElementById('cost');
  const priceEl = document.getElementById('price');
  const daysEl = document.getElementById('days');
  const errEl = document.getElementById('error');
  const resultCard = document.getElementById('resultCard');
  const resultEl = document.getElementById('result');
  const headline = document.getElementById('headline');
  const details = document.getElementById('details');
  const profitPerDrinkEl = document.getElementById('profitPerDrink');
  const monthlyDrinksEl = document.getElementById('monthlyDrinks');
  const monthlyCostsEl = document.getElementById('monthlyCosts');
  const resetBtn = document.getElementById('reset');

  // Restore saved state
  const savedState = restoreState();
  if (savedState) {
    Object.entries(savedState).forEach(([key, value]) => {
      const el = document.getElementById(key);
      if (el) el.value = value;
    });
  }

  // Save state on input
  [rentEl, laborEl, otherEl, costEl, priceEl, daysEl].forEach(el => {
    el.addEventListener('input', () => {
      const state = {
        rent: rentEl.value,
        labor: laborEl.value,
        other: otherEl.value,
        cost: costEl.value,
        price: priceEl.value,
        days: daysEl.value
      };
      saveState(state);
    });
  });

  function showError(message) {
    errEl.textContent = message;
    errEl.style.display = 'block';
    resultCard.style.display = 'none';
  }

  function clearError() {
    errEl.textContent = '';
    errEl.style.display = 'none';
  }

  function getBreakEvenStatus(drinksPerDay) {
    if (drinksPerDay <= 100) return 'sustainable';
    if (drinksPerDay <= 200) return 'tight';
    return 'unsustainable';
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    clearError();

    const rent = parseFloat(rentEl.value) || 0;
    const labor = parseFloat(laborEl.value) || 0;
    const other = parseFloat(otherEl.value) || 0;
    const cost = parseFloat(costEl.value) || 0;
    const price = parseFloat(priceEl.value) || 0;
    const days = parseInt(daysEl.value, 10) || 30;

    // Basic validation
    if (rent < 0 || labor < 0 || other < 0 || cost < 0 || price < 0 || days < 1) {
      showError('Please enter valid non-negative numbers for all fields (days must be at least 1).');
      return;
    }

    if (price <= cost) {
      showError('Selling price must be higher than the cost to make a drink to generate profit.');
      return;
    }

    const profitPerDrink = price - cost;
    const totalMonthly = rent + labor + other;
    const monthlyDrinks = totalMonthly / profitPerDrink;
    const drinksPerDay = monthlyDrinks / days;
    const drinksPerDayRounded = Math.ceil(drinksPerDay);

    // Update status and display
    const status = getBreakEvenStatus(drinksPerDayRounded);
    resultEl.className = `result ${status}`;

    headline.textContent = `You need to sell ${drinksPerDayRounded} drink${drinksPerDayRounded === 1 ? '' : 's'} per day`;

    // Animate values with countUp
    revealValues(['profitPerDrink', 'monthlyCosts', 'monthlyDrinks']);
    countUp(profitPerDrinkEl, profitPerDrink, fmtMoney);
    countUp(monthlyDrinksEl, Math.ceil(monthlyDrinks), fmtInt);
    countUp(monthlyCostsEl, totalMonthly, fmtMoney);

    resultCard.style.display = 'block';
    // Trigger reflow for animation
    resultCard.offsetHeight;
    resultCard.classList.add('visible');
  });

  resetBtn.addEventListener('click', function() {
    clearError();
    resultCard.classList.remove('visible');
    setTimeout(() => resultCard.style.display = 'none', 200);
    localStorage.removeItem('barCalculator');
  });

  // Clear error when user corrects selling/cost fields
  [priceEl, costEl].forEach(el => el.addEventListener('input', clearError));
});