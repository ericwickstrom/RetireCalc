const STOCK_RETURN = 0.10;  // 10% nominal historical average
const BOND_RETURN = 0.04;   // 4% nominal historical average
const STOCK_VOLATILITY = 0.18;  // 18% std dev for stocks
const BOND_VOLATILITY = 0.05;   // 5% std dev for bonds

const getStockPct = (age, params) => {
  const { retirementAge, transitionYears, stockPctAccumulation, stockPctRetirement } = params;
  const transitionStart = retirementAge - transitionYears;

  if (age < transitionStart) {
    return stockPctAccumulation / 100;
  } else if (age < retirementAge) {
    const progress = (age - transitionStart) / transitionYears;
    return (stockPctAccumulation + (stockPctRetirement - stockPctAccumulation) * progress) / 100;
  } else {
    return stockPctRetirement / 100;
  }
};

// Calculate blended return based on stock/bond allocation
export const getBlendedReturn = (age, params) => {
  const stockPct = getStockPct(age, params);
  return stockPct * STOCK_RETURN + (1 - stockPct) * BOND_RETURN;
};

// Get volatility (standard deviation) based on allocation
export const getVolatility = (age, params) => {
  const stockPct = getStockPct(age, params);
  // Portfolio volatility (simplified - assumes uncorrelated)
  return Math.sqrt(stockPct * stockPct * STOCK_VOLATILITY * STOCK_VOLATILITY +
                   (1 - stockPct) * (1 - stockPct) * BOND_VOLATILITY * BOND_VOLATILITY);
};
