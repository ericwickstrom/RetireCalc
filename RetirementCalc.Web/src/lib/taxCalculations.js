// Calculate federal income tax based on 2026 tax brackets (married filing jointly)
export const calculateIncomeTax = (ordinaryIncome) => {
  const brackets = [
    { limit: 23850, rate: 0.10 },
    { limit: 96950, rate: 0.12 },
    { limit: 206700, rate: 0.22 },
    { limit: 394600, rate: 0.24 },
    { limit: 501050, rate: 0.32 },
    { limit: 751600, rate: 0.35 },
    { limit: Infinity, rate: 0.37 }
  ];

  let tax = 0;
  let previousLimit = 0;

  for (const bracket of brackets) {
    if (ordinaryIncome > previousLimit) {
      const taxableInBracket = Math.min(ordinaryIncome, bracket.limit) - previousLimit;
      tax += taxableInBracket * bracket.rate;
      previousLimit = bracket.limit;
    } else {
      break;
    }
  }

  return tax;
};

// Calculate capital gains tax (married filing jointly)
export const calculateCapitalGainsTax = (gains, ordinaryIncome) => {
  // 2026 capital gains brackets (married filing jointly)
  // 0% up to $94,050, 15% up to $583,750, 20% above
  const total = ordinaryIncome + gains;

  if (total <= 94050) return 0;
  if (total <= 583750) return gains * 0.15;
  return gains * 0.20;
};
