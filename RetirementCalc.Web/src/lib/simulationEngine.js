import { getBlendedReturn, getVolatility } from './returnCalculations';
import { withdrawFunds, getSSBenefitMultiplier } from './withdrawalStrategy';
import { fmt } from './formatters';

export const runSimulation = (inputs) => {
  const {
    currentAge, retirementAge, planningAge, inflationRate,
    annualExpenses, healthcareCost, numSimulations,
    stockPctAccumulation, stockPctRetirement, transitionYears,
    semiRetireAge, semiRetireIncome, semiRetireSavingsRate,
    accounts: initialAccounts, contributions, retirementIncome
  } = inputs;

  const {
    p1_401kEmployee, p1_401kEmployer, p2_401kEmployee, p2_401kEmployer,
    p1IRAContrib, p2IRAContrib, p1HSAContrib, p2HSAContrib
  } = contributions;

  const {
    p1SSMonth, p2SSMonth, p1SSClaimAge, p2SSClaimAge,
    p1PensionMonth, p2PensionMonth
  } = retirementIncome;

  const allocationParams = { retirementAge, transitionYears, stockPctAccumulation, stockPctRetirement };

  const semiRetireEnabled = semiRetireAge > 0;
  const semiRetireContribution = semiRetireIncome * (semiRetireSavingsRate / 100);
  const semiRetireStartAge = semiRetireAge;

  const ytr = retirementAge - currentAge;

  if (ytr < 0 || planningAge <= retirementAge) {
    return {assets: 0, score: 0, detail: 'Invalid ages', breakdown: null, yearly: [], ret: [], mcStats: null};
  }

  // --- Accumulation phase (deterministic base case) ---
  let accAccounts = { ...initialAccounts };

  const yearly = [];

  for (let y = 0; y <= ytr; y++) {
    const age = currentAge + y;
    const isPT = semiRetireEnabled && age >= semiRetireStartAge && age < retirementAge;

    if (y > 0) {
      const nominalReturn = getBlendedReturn(age, allocationParams);
      const realReturn = (1 + nominalReturn) / (1 + inflationRate / 100) - 1;

      accAccounts.roth *= (1 + realReturn);
      accAccounts.hsa *= (1 + realReturn);
      accAccounts.traditional *= (1 + realReturn);
      accAccounts.brokerage *= (1 + realReturn);
      accAccounts.cash *= (1 + realReturn);

      if (isPT) {
        const healthcare = age < 65 ? healthcareCost : 0;
        const totalExpenses = annualExpenses + healthcare;
        const netIncome = semiRetireIncome - totalExpenses;

        if (netIncome > 0) {
          accAccounts.traditional += semiRetireContribution;
        } else {
          const needed = Math.abs(netIncome);
          const withdrawal = withdrawFunds(needed, accAccounts, age, healthcare, semiRetireIncome);
          accAccounts = withdrawal.accounts;
        }
      } else {
        accAccounts.traditional += p1_401kEmployee + p1_401kEmployer + p2_401kEmployee + p2_401kEmployer;
        accAccounts.roth += p1IRAContrib + p2IRAContrib;
        accAccounts.hsa += p1HSAContrib + p2HSAContrib;
      }
    }

    const totalAssets = accAccounts.roth + accAccounts.hsa + accAccounts.traditional + accAccounts.brokerage + accAccounts.cash;
    yearly.push({year: 2025 + y, age, assets: Math.round(totalAssets)});
  }

  // --- Retirement phase (deterministic base case) ---
  const ret = [];
  let retAccounts = {...accAccounts};
  const yearsInRetirement = planningAge - retirementAge;

  for (let y = 0; y <= yearsInRetirement; y++) {
    const age = retirementAge + y;
    let inc = 0;

    const stillSemiRetired = semiRetireEnabled && age >= semiRetireStartAge && age < retirementAge;
    if (stillSemiRetired) {
      inc += semiRetireIncome;
    }

    const p1SSAdj = p1SSMonth * getSSBenefitMultiplier(p1SSClaimAge);
    const p2SSAdj = p2SSMonth * getSSBenefitMultiplier(p2SSClaimAge);
    if (age >= p1SSClaimAge) inc += p1SSAdj * 12;
    if (age >= p2SSClaimAge) inc += p2SSAdj * 12;
    if (age >= 65) inc += (p1PensionMonth + p2PensionMonth) * 12;

    const baseExpenses = annualExpenses;
    const healthcare = age < 65 ? healthcareCost : 0;
    const totalExpenses = baseExpenses + healthcare;

    const neededAfterTax = Math.max(0, totalExpenses - inc);

    const withdrawal = withdrawFunds(neededAfterTax, retAccounts, age, healthcare, inc);
    retAccounts = withdrawal.accounts;

    const nominalReturn = getBlendedReturn(age, allocationParams);
    const realReturn = (1 + nominalReturn) / (1 + inflationRate / 100) - 1;
    retAccounts.roth *= (1 + realReturn);
    retAccounts.hsa *= (1 + realReturn);
    retAccounts.traditional *= (1 + realReturn);
    retAccounts.brokerage *= (1 + realReturn);
    retAccounts.cash *= (1 + realReturn);

    const totalAssets = retAccounts.roth + retAccounts.hsa + retAccounts.traditional + retAccounts.brokerage + retAccounts.cash;

    ret.push({
      year: 2025 + ytr + y,
      age,
      assets: Math.round(totalAssets),
      wd: Math.round(withdrawal.gross),
      wdAfterTax: Math.round(withdrawal.afterTax),
      taxes: Math.round(withdrawal.taxes),
      inc: Math.round(inc),
      healthcare: Math.round(healthcare)
    });

    if (totalAssets <= 0) break;
  }

  // --- Monte Carlo simulation ---
  const simResults = [];
  const yearlyBalances = [];

  const isExtremeScenario = annualExpenses > 500000;

  for (let sim = 0; sim < numSimulations; sim++) {
    let simAccounts = { ...initialAccounts };

    const simPath = [];
    const isFirstSim = sim === 0;

    if (isExtremeScenario && isFirstSim) {
      console.log('=== EXTREME SCENARIO DEBUG (Sim 0) ===');
      console.log(`Annual expenses: $${annualExpenses}, Healthcare: $${healthcareCost}`);
    }

    for (let y = 0; y < ytr; y++) {
      const age = currentAge + y + 1;
      const isPT = semiRetireEnabled && age >= semiRetireStartAge && age < retirementAge;

      const nominalReturn = getBlendedReturn(age, allocationParams);
      const volatility = getVolatility(age, allocationParams);
      const u1 = Math.random();
      const u2 = Math.random();
      const normalRandom = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      const randomReturn = nominalReturn + normalRandom * volatility;
      const realReturn = randomReturn - (inflationRate / 100);

      simAccounts.roth *= (1 + realReturn);
      simAccounts.hsa *= (1 + realReturn);
      simAccounts.traditional *= (1 + realReturn);
      simAccounts.brokerage *= (1 + realReturn);
      simAccounts.cash *= (1 + realReturn);

      if (isPT) {
        const healthcare = age < 65 ? healthcareCost : 0;
        const totalExpenses = annualExpenses + healthcare;
        const netIncome = semiRetireIncome - totalExpenses;

        if (netIncome > 0) {
          simAccounts.traditional += semiRetireContribution;
        } else {
          const needed = Math.abs(netIncome);
          const withdrawal = withdrawFunds(needed, simAccounts, age, healthcare, semiRetireIncome);
          simAccounts = withdrawal.accounts;
        }
      } else {
        simAccounts.traditional += p1_401kEmployee + p1_401kEmployer + p2_401kEmployee + p2_401kEmployer;
        simAccounts.roth += p1IRAContrib + p2IRAContrib;
        simAccounts.hsa += p1HSAContrib + p2HSAContrib;
      }
    }

    const startRetirementBal = simAccounts.roth + simAccounts.hsa + simAccounts.traditional + simAccounts.brokerage + simAccounts.cash;

    if (isExtremeScenario && isFirstSim) {
      console.log(`At retirement (age ${retirementAge}): $${Math.round(startRetirementBal)}`);
    }

    for (let y = 0; y <= yearsInRetirement; y++) {
      const age = retirementAge + y;
      let inc = 0;

      const stillSemiRetired = semiRetireEnabled && age >= semiRetireStartAge && age < retirementAge;
      if (stillSemiRetired) {
        inc += semiRetireIncome;
      }

      const p1SSAdj = p1SSMonth * getSSBenefitMultiplier(p1SSClaimAge);
      const p2SSAdj = p2SSMonth * getSSBenefitMultiplier(p2SSClaimAge);
      if (age >= p1SSClaimAge) inc += p1SSAdj * 12;
      if (age >= p2SSClaimAge) inc += p2SSAdj * 12;
      if (age >= 65) inc += (p1PensionMonth + p2PensionMonth) * 12;

      const nominalReturn = getBlendedReturn(age, allocationParams);
      const volatility = getVolatility(age, allocationParams);
      const u1 = Math.random();
      const u2 = Math.random();
      const normalRandom = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      const randomReturn = nominalReturn + normalRandom * volatility;
      const realReturn = randomReturn - (inflationRate / 100);

      const baseExpenses = annualExpenses;
      const healthcare = age < 65 ? healthcareCost : 0;
      const totalExpenses = baseExpenses + healthcare;
      const neededAfterTax = Math.max(0, totalExpenses - inc);

      const withdrawal = withdrawFunds(neededAfterTax, simAccounts, age, healthcare, inc);
      simAccounts = withdrawal.accounts;

      if (isExtremeScenario && isFirstSim && y < 3) {
        console.log(`Age ${age}: Needed=$${Math.round(neededAfterTax)}, Withdrew=$${Math.round(withdrawal.gross)}, AfterTax=$${Math.round(withdrawal.afterTax)}`);
      }

      simAccounts.roth *= (1 + realReturn);
      simAccounts.hsa *= (1 + realReturn);
      simAccounts.traditional *= (1 + realReturn);
      simAccounts.brokerage *= (1 + realReturn);
      simAccounts.cash *= (1 + realReturn);

      const balance = simAccounts.roth + simAccounts.hsa + simAccounts.traditional + simAccounts.brokerage + simAccounts.cash;
      simPath.push(balance);

      if (isExtremeScenario && isFirstSim && y < 3) {
        console.log(`Age ${age}: Balance after growth=$${Math.round(balance)}`);
      }

      if (balance <= 10000) {
        if (isExtremeScenario && isFirstSim) {
          console.log(`FAILED at age ${age} with balance=$${Math.round(balance)}`);
        }
        for (let i = y + 1; i <= yearsInRetirement; i++) {
          simPath.push(0);
        }
        break;
      }
    }

    simPath.forEach((bal, idx) => {
      if (!yearlyBalances[idx]) yearlyBalances[idx] = [];
      yearlyBalances[idx].push(bal);
    });

    const finalBalance = simPath[simPath.length - 1] || 0;
    simResults.push({finalBalance: finalBalance, success: finalBalance > 10000});
  }

  const successCount = simResults.filter(r => r.success).length;
  const successRate = (successCount / numSimulations) * 100;

  if (annualExpenses > 50000) {
    console.log(`Monte Carlo: ${successCount}/${numSimulations} succeeded = ${successRate.toFixed(1)}%`);
    console.log(`Sample failures:`, simResults.filter(r => !r.success).slice(0, 5).map(r => r.finalBalance));
  }

  const finalBalances = simResults.map(r => r.finalBalance).sort((a, b) => a - b);
  const p10 = finalBalances[Math.floor(numSimulations * 0.1)];
  const p50 = finalBalances[Math.floor(numSimulations * 0.5)];
  const p90 = finalBalances[Math.floor(numSimulations * 0.9)];

  const mcStats = {
    successRate: successRate.toFixed(1),
    p10: Math.round(p10),
    p50: Math.round(p50),
    p90: Math.round(p90)
  };

  // Calculate percentiles for each year and add to ret array
  yearlyBalances.forEach((yearBalances, idx) => {
    if (ret[idx]) {
      const sorted = [...yearBalances].sort((a, b) => a - b);
      ret[idx].p10 = Math.max(0, Math.round(sorted[Math.floor(numSimulations * 0.1)]));
      ret[idx].p90 = Math.max(0, Math.round(sorted[Math.floor(numSimulations * 0.9)]));
    }
  });

  // --- Scoring ---
  const final = ret[ret.length - 1]?.assets || 0;
  const madeItToEnd = ret.length > 0 && ret[ret.length - 1].age >= planningAge && final > 0;
  let score = 0;
  let detail = '';

  if (!madeItToEnd || final <= 0) {
    const empty = ret.findIndex(r => r.assets <= 0);
    score = Math.max(0, Math.round(successRate * 0.7));
    detail = empty >= 0 ? `Portfolio depleted at age ${retirementAge + empty}` : 'Portfolio depleted';
  } else {
    let mcScore = successRate >= 95 ? 60 : successRate >= 90 ? 55 : successRate >= 85 ? 50 : successRate >= 80 ? 45 : successRate >= 70 ? 40 : successRate >= 60 ? 35 : Math.round(successRate * 0.5);

    let total = 0;
    for (let y = 0; y < yearsInRetirement; y++) {
      const age = retirementAge + y;
      let inc = 0;
      const p1SSAdj = p1SSMonth * getSSBenefitMultiplier(p1SSClaimAge);
      const p2SSAdj = p2SSMonth * getSSBenefitMultiplier(p2SSClaimAge);
      if (age >= p1SSClaimAge) inc += p1SSAdj * 12;
      if (age >= p2SSClaimAge) inc += p2SSAdj * 12;
      if (age >= 65) inc += (p1PensionMonth + p2PensionMonth) * 12;
      const baseExpenses = annualExpenses;
      const healthcare = age < 65 ? healthcareCost : 0;
      total += Math.max(0, baseExpenses + healthcare - inc);
    }

    const avg = total / yearsInRetirement;
    const rec = avg * 25;
    const retirementStartBalance = accAccounts.roth + accAccounts.hsa + accAccounts.traditional + accAccounts.brokerage + accAccounts.cash;
    const cov = rec > 0 ? retirementStartBalance / rec : 10;

    let x25Score = cov >= 1.5 ? 40 : cov >= 1.25 ? 35 : cov >= 1.0 ? 30 : cov >= 0.85 ? 25 : cov >= 0.7 ? 20 : Math.round(cov * 25);

    const rawScore = Math.round(mcScore + x25Score);
    score = Math.max(70, Math.min(100, rawScore));

    const pctOfStart = ((final / retirementStartBalance) * 100).toFixed(0);
    detail = `Portfolio lasts to age ${planningAge}. Ending: ${fmt(final)} (${pctOfStart}%)`;
  }

  const retirementStartBalance = accAccounts.roth + accAccounts.hsa + accAccounts.traditional + accAccounts.brokerage + accAccounts.cash;
  return {assets: Math.round(retirementStartBalance), score, detail, yearly, ret, mcStats};
};
