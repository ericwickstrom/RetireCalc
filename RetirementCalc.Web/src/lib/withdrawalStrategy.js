import { calculateIncomeTax, calculateCapitalGainsTax } from './taxCalculations';

export const getSSBenefitMultiplier = (claimAge) => {
  if (claimAge <= 62) return 0.70;
  if (claimAge >= 70) return 1.24;
  if (claimAge < 67) return 0.70 + (claimAge - 62) * 0.06;
  return 1.00 + (claimAge - 67) * 0.08;
};

// Calculate RMD (Required Minimum Distribution) for age 73+
export const calculateRMD = (balance, age) => {
  if (age < 73) return 0;
  // IRS Uniform Lifetime Table (simplified)
  const divisors = {73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7, 77: 22.9, 78: 22.0, 79: 21.1, 80: 20.2,
                    81: 19.4, 82: 18.5, 83: 17.7, 84: 16.8, 85: 16.0, 86: 15.2, 87: 14.4, 88: 13.7,
                    89: 12.9, 90: 12.2};
  const divisor = divisors[Math.min(age, 90)] || 11.5;
  return balance / divisor;
};

// Tax-aware withdrawal strategy with automatic tax calculation
export const withdrawFunds = (needed, accounts, age, healthcare, otherIncome) => {
  const result = {
    gross: 0,
    afterTax: 0,
    taxes: 0,
    accounts: {...accounts},
    breakdown: {hsa: 0, roth: 0, traditional: 0, brokerage: 0},
    ordinaryIncome: 0,
    capitalGains: 0
  };

  let remaining = needed;

  // Step 1: HSA for healthcare (tax-free)
  if (healthcare > 0 && remaining > 0) {
    const hsaUsed = Math.min(remaining, healthcare, accounts.hsa);
    result.accounts.hsa -= hsaUsed;
    result.breakdown.hsa = hsaUsed;
    result.gross += hsaUsed;
    result.afterTax += hsaUsed;
    remaining -= hsaUsed;
  }

  // Step 2: Check RMDs from Traditional (must take if age 73+)
  const rmd = calculateRMD(accounts.traditional, age);
  if (rmd > 0) {
    const rmdAmount = Math.min(rmd, accounts.traditional);
    result.accounts.traditional -= rmdAmount;
    result.breakdown.traditional = rmdAmount;
    result.gross += rmdAmount;
    result.ordinaryIncome += rmdAmount;
  }

  // Step 3: Roth IRA (tax-free)
  if (remaining > 0 && accounts.roth > 0) {
    const rothUsed = Math.min(remaining, accounts.roth);
    result.accounts.roth -= rothUsed;
    result.breakdown.roth = rothUsed;
    result.gross += rothUsed;
    result.afterTax += rothUsed;
    remaining -= rothUsed;
  }

  // Step 4: Brokerage (capital gains tax) - try to stay in low brackets
  if (remaining > 0 && accounts.brokerage > 0) {
    // Iteratively find the right amount to withdraw
    let brokerageWithdrawal = remaining * 1.2; // Initial estimate
    for (let i = 0; i < 5; i++) {
      const testGains = Math.min(brokerageWithdrawal, accounts.brokerage);
      const testTax = calculateCapitalGainsTax(testGains, otherIncome + result.ordinaryIncome);
      const testAfterTax = testGains - testTax;

      if (Math.abs(testAfterTax - remaining) < 100) break; // Close enough
      brokerageWithdrawal = remaining * (testGains / testAfterTax); // Adjust
    }

    const brokerageUsed = Math.min(brokerageWithdrawal, accounts.brokerage);
    result.accounts.brokerage -= brokerageUsed;
    result.breakdown.brokerage = brokerageUsed;
    result.gross += brokerageUsed;
    result.capitalGains += brokerageUsed;

    const cgTax = calculateCapitalGainsTax(result.capitalGains, otherIncome + result.ordinaryIncome);
    result.taxes += cgTax;
    result.afterTax += (brokerageUsed - cgTax);
    remaining -= (brokerageUsed - cgTax);
  }

  // Step 5: Traditional 401k/IRA (ordinary income tax) - last resort
  if (remaining > 0 && accounts.traditional > 0) {
    // Iteratively find the right amount
    let tradWithdrawal = remaining * 1.3; // Initial estimate
    for (let i = 0; i < 5; i++) {
      const testTrad = Math.min(tradWithdrawal, accounts.traditional);
      const testTotalOrdinary = otherIncome + result.ordinaryIncome + testTrad;
      const testTax = calculateIncomeTax(testTotalOrdinary) - calculateIncomeTax(otherIncome + result.ordinaryIncome);
      const testAfterTax = testTrad - testTax;

      if (Math.abs(testAfterTax - remaining) < 100) break;
      tradWithdrawal = remaining * (testTrad / testAfterTax);
    }

    const tradUsed = Math.min(tradWithdrawal, accounts.traditional);
    result.accounts.traditional -= tradUsed;
    result.breakdown.traditional += tradUsed;
    result.gross += tradUsed;
    result.ordinaryIncome += tradUsed;

    const incomeTax = calculateIncomeTax(otherIncome + result.ordinaryIncome) - calculateIncomeTax(otherIncome);
    result.taxes += incomeTax;
    result.afterTax += (tradUsed - incomeTax);
    remaining -= (tradUsed - incomeTax);
  }

  // EMERGENCY: If still need money, drain ALL remaining accounts (bankruptcy scenario)
  if (remaining > 1000) {
    // Take whatever's left in any account
    if (accounts.cash > 0) {
      const cashUsed = Math.min(remaining, accounts.cash);
      result.accounts.cash -= cashUsed;
      result.gross += cashUsed;
      result.afterTax += cashUsed;
      remaining -= cashUsed;
    }
    if (remaining > 0 && result.accounts.hsa > 0) {
      const hsaUsed = result.accounts.hsa;
      result.accounts.hsa = 0;
      result.gross += hsaUsed;
      // Penalty + tax on non-healthcare HSA withdrawal
      const penalty = hsaUsed * 0.2;
      const tax = calculateIncomeTax(otherIncome + result.ordinaryIncome + hsaUsed) - calculateIncomeTax(otherIncome + result.ordinaryIncome);
      result.taxes += (penalty + tax);
      result.afterTax += (hsaUsed - penalty - tax);
      remaining -= (hsaUsed - penalty - tax);
    }
    // Drain any remaining accounts
    ['roth', 'traditional', 'brokerage'].forEach(acct => {
      if (remaining > 0 && result.accounts[acct] > 0) {
        const amt = result.accounts[acct];
        result.accounts[acct] = 0;
        result.gross += amt;
        result.afterTax += amt * 0.7; // Assume 30% total tax/penalty
        remaining -= amt * 0.7;
      }
    });
  }

  // Final tax calculation
  const totalIncomeTax = calculateIncomeTax(otherIncome + result.ordinaryIncome);
  const baseIncomeTax = calculateIncomeTax(otherIncome);
  result.taxes = (totalIncomeTax - baseIncomeTax) + calculateCapitalGainsTax(result.capitalGains, otherIncome + result.ordinaryIncome);

  return result;
};
