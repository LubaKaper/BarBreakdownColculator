// Brooklyn neighborhood bar averages.
// Embedded as a JS module (instead of fetched JSON) so the app works
// from file:// and never hits fetch/CORS failures.
export const NEIGHBORHOODS = {
  williamsburg: {
    avgCommercialRent: 8500,
    avgDrinkPrice: 14,
    avgLaborCost: 4200,
    displayName: "Williamsburg"
  },
  dumbo: {
    avgCommercialRent: 11000,
    avgDrinkPrice: 16,
    avgLaborCost: 4500,
    displayName: "DUMBO"
  },
  parkSlope: {
    avgCommercialRent: 7200,
    avgDrinkPrice: 12,
    avgLaborCost: 3800,
    displayName: "Park Slope"
  },
  greenpoint: {
    avgCommercialRent: 7800,
    avgDrinkPrice: 13,
    avgLaborCost: 4000,
    displayName: "Greenpoint"
  },
  bushwick: {
    avgCommercialRent: 6500,
    avgDrinkPrice: 11,
    avgLaborCost: 3500,
    displayName: "Bushwick"
  },
  brooklynHeights: {
    avgCommercialRent: 10500,
    avgDrinkPrice: 15,
    avgLaborCost: 4300,
    displayName: "Brooklyn Heights"
  },
  fortGreene: {
    avgCommercialRent: 8200,
    avgDrinkPrice: 13,
    avgLaborCost: 4100,
    displayName: "Fort Greene"
  },
  cobbleHill: {
    avgCommercialRent: 9000,
    avgDrinkPrice: 14,
    avgLaborCost: 4200,
    displayName: "Cobble Hill"
  },
  crownHeights: {
    avgCommercialRent: 6800,
    avgDrinkPrice: 11,
    avgLaborCost: 3600,
    displayName: "Crown Heights"
  },
  prospectHeights: {
    avgCommercialRent: 7500,
    avgDrinkPrice: 13,
    avgLaborCost: 3900,
    displayName: "Prospect Heights"
  },
  carrollGardens: {
    avgCommercialRent: 8800,
    avgDrinkPrice: 14,
    avgLaborCost: 4100,
    displayName: "Carroll Gardens"
  },
  bedStuy: {
    avgCommercialRent: 6200,
    avgDrinkPrice: 11,
    avgLaborCost: 3400,
    displayName: "Bed-Stuy"
  },
  gowanus: {
    avgCommercialRent: 7000,
    avgDrinkPrice: 12,
    avgLaborCost: 3800,
    displayName: "Gowanus"
  },
  boerum: {
    avgCommercialRent: 9200,
    avgDrinkPrice: 14,
    avgLaborCost: 4200,
    displayName: "Boerum Hill"
  },
  redhook: {
    avgCommercialRent: 6800,
    avgDrinkPrice: 12,
    avgLaborCost: 3700,
    displayName: "Red Hook"
  }
};

// Max rent across all neighborhoods, used to scale the "cost level" bars.
export const MAX_RENT = Math.max(
  ...Object.values(NEIGHBORHOODS).map((n) => n.avgCommercialRent)
);

// Alphabetized [key, data] pairs for the dropdown.
export const sortedNeighborhoods = () =>
  Object.entries(NEIGHBORHOODS).sort((a, b) =>
    a[1].displayName.localeCompare(b[1].displayName)
  );
