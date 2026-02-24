import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area } from 'recharts';
import { DollarSign, TrendingUp } from 'lucide-react';

const RetirementCalculator = () => {
  const [currentAge, setCurrentAge] = useState(35);
  const [retirementAge, setRetirementAge] = useState(65);
  const [planningAge, setPlanningAge] = useState(90);
  const [annualExpenses, setAnnualExpenses] = useState(60000);
  const [healthcareCost, setHealthcareCost] = useState(12000);
  const [inflationRate, setInflationRate] = useState(3);
  const [stockPctAccumulation, setStockPctAccumulation] = useState(90);
  const [stockPctRetirement, setStockPctRetirement] = useState(60);
  const [transitionYears, setTransitionYears] = useState(10);
  const [semiRetireAge, setSemiRetireAge] = useState(0);
  const [semiRetireIncome, setSemiRetireIncome] = useState(40000);
  const [semiRetireSavingsRate, setSemiRetireSavingsRate] = useState(10);
  const [showEdit, setShowEdit] = useState(false);
  const [showSemiRetire, setShowSemiRetire] = useState(false);
  const [numSimulations, setNumSimulations] = useState(10000);
  
  // Assets
  const [p1RothIRA, setP1RothIRA] = useState(50000);
  const [p1HSA, setP1HSA] = useState(10000);
  const [p1_401k, setP1_401k] = useState(75000);
  const [p1Brokerage, setP1Brokerage] = useState(0);
  const [p2RothIRA, setP2RothIRA] = useState(0);
  const [p2HSA, setP2HSA] = useState(0);
  const [p2_401k, setP2_401k] = useState(50000);
  const [p2Brokerage, setP2Brokerage] = useState(0);
  const [jointCash, setJointCash] = useState(25000);
  
  // Income
  const [p1Income, setP1Income] = useState(80000);
  const [p2Income, setP2Income] = useState(60000);
  
  // P1 Contributions
  const [p1_401kContribPct, setP1_401kContribPct] = useState(10);
  const [p1EmployerMatchPct, setP1EmployerMatchPct] = useState(5);
  const [p1IRAContrib, setP1IRAContrib] = useState(7000);
  const [p1HSAContrib, setP1HSAContrib] = useState(4150);
  
  // P2 Contributions
  const [p2_401kContribPct, setP2_401kContribPct] = useState(10);
  const [p2EmployerMatchPct, setP2EmployerMatchPct] = useState(5);
  const [p2IRAContrib, setP2IRAContrib] = useState(7000);
  const [p2HSAContrib, setP2HSAContrib] = useState(0);
  
  // Retirement Income
  const [p1SSMonth, setP1SSMonth] = useState(2500);
  const [p2SSMonth, setP2SSMonth] = useState(2000);
  const [p1SSClaimAge, setP1SSClaimAge] = useState(67);
  const [p2SSClaimAge, setP2SSClaimAge] = useState(67);
  const [p1PensionMonth, setP1PensionMonth] = useState(0);
  const [p2PensionMonth, setP2PensionMonth] = useState(0);
  
  const totalAssets = p1RothIRA + p1HSA + p1_401k + p1Brokerage + p2RothIRA + p2HSA + p2_401k + p2Brokerage + jointCash;
  const income = p1Income + p2Income;
  
  // Calculate total annual contributions
  const p1_401kEmployee = Math.min(p1Income * (p1_401kContribPct / 100), 23000);
  const p1_401kEmployer = Math.min(p1Income * (p1EmployerMatchPct / 100), 23000);
  const p2_401kEmployee = Math.min(p2Income * (p2_401kContribPct / 100), 23000);
  const p2_401kEmployer = Math.min(p2Income * (p2EmployerMatchPct / 100), 23000);
  
  const annualContrib = p1_401kEmployee + p1_401kEmployer + p2_401kEmployee + p2_401kEmployer + 
                        p1IRAContrib + p2IRAContrib + p1HSAContrib + p2HSAContrib;

  const fmt = (v) => new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0}).format(v);

  const getSSBenefitMultiplier = (claimAge) => {
    if (claimAge <= 62) return 0.70;
    if (claimAge >= 70) return 1.24;
    if (claimAge < 67) return 0.70 + (claimAge - 62) * 0.06;
    return 1.00 + (claimAge - 67) * 0.08;
  };

  // Calculate federal income tax based on 2026 tax brackets (married filing jointly)
  const calculateIncomeTax = (ordinaryIncome) => {
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
  const calculateCapitalGainsTax = (gains, ordinaryIncome) => {
    // 2026 capital gains brackets (married filing jointly)
    // 0% up to $94,050, 15% up to $583,750, 20% above
    const total = ordinaryIncome + gains;
    
    if (total <= 94050) return 0;
    if (total <= 583750) return gains * 0.15;
    return gains * 0.20;
  };

  // Calculate blended return based on stock/bond allocation
  const getBlendedReturn = (age) => {
    const STOCK_RETURN = 0.10;  // 10% nominal historical average
    const BOND_RETURN = 0.04;   // 4% nominal historical average
    const transitionStart = retirementAge - transitionYears;
    
    let stockPct;
    if (age < transitionStart) {
      stockPct = stockPctAccumulation / 100;
    } else if (age < retirementAge) {
      const progress = (age - transitionStart) / transitionYears;
      stockPct = (stockPctAccumulation + (stockPctRetirement - stockPctAccumulation) * progress) / 100;
    } else {
      stockPct = stockPctRetirement / 100;
    }
    
    return stockPct * STOCK_RETURN + (1 - stockPct) * BOND_RETURN;
  };

  // Get volatility (standard deviation) based on allocation
  const getVolatility = (age) => {
    const STOCK_VOLATILITY = 0.18;  // 18% std dev for stocks
    const BOND_VOLATILITY = 0.05;   // 5% std dev for bonds
    const transitionStart = retirementAge - transitionYears;
    
    let stockPct;
    if (age < transitionStart) {
      stockPct = stockPctAccumulation / 100;
    } else if (age < retirementAge) {
      const progress = (age - transitionStart) / transitionYears;
      stockPct = (stockPctAccumulation + (stockPctRetirement - stockPctAccumulation) * progress) / 100;
    } else {
      stockPct = stockPctRetirement / 100;
    }
    
    // Portfolio volatility (simplified - assumes uncorrelated)
    return Math.sqrt(stockPct * stockPct * STOCK_VOLATILITY * STOCK_VOLATILITY + 
                     (1 - stockPct) * (1 - stockPct) * BOND_VOLATILITY * BOND_VOLATILITY);
  };

  // Calculate RMD (Required Minimum Distribution) for age 73+
  const calculateRMD = (balance, age) => {
    if (age < 73) return 0;
    // IRS Uniform Lifetime Table (simplified)
    const divisors = {73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7, 77: 22.9, 78: 22.0, 79: 21.1, 80: 20.2, 
                      81: 19.4, 82: 18.5, 83: 17.7, 84: 16.8, 85: 16.0, 86: 15.2, 87: 14.4, 88: 13.7, 
                      89: 12.9, 90: 12.2};
    const divisor = divisors[Math.min(age, 90)] || 11.5;
    return balance / divisor;
  };

  // Tax-aware withdrawal strategy with automatic tax calculation
  const withdrawFunds = (needed, accounts, age, healthcare, otherIncome) => {
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

  const calc = useMemo(() => {
    // Capture all semi-retirement values at start to prevent mid-calculation state changes
    const semiRetireEnabled = semiRetireAge > 0;
    const semiRetireContribution = semiRetireIncome * (semiRetireSavingsRate / 100);
    const semiRetireStartAge = semiRetireAge;
    
    const ytr = retirementAge - currentAge;
    
    if (ytr < 0 || planningAge <= retirementAge) {
      return {assets: 0, score: 0, detail: 'Invalid ages', breakdown: null, yearly: [], ret: [], mcStats: null};
    }
    
    // Track accounts separately during accumulation
    let accAccounts = {
      roth: p1RothIRA + p2RothIRA,
      hsa: p1HSA + p2HSA,
      traditional: p1_401k + p2_401k,
      brokerage: p1Brokerage + p2Brokerage,
      cash: jointCash
    };
    
    const yearly = [];

    for (let y = 0; y <= ytr; y++) {
      const age = currentAge + y;
      const isPT = semiRetireEnabled && age >= semiRetireStartAge && age < retirementAge;
      
      if (y > 0) {
        const nominalReturn = getBlendedReturn(age);
        const realReturn = (1 + nominalReturn) / (1 + inflationRate / 100) - 1;
        
        // Grow all accounts
        accAccounts.roth *= (1 + realReturn);
        accAccounts.hsa *= (1 + realReturn);
        accAccounts.traditional *= (1 + realReturn);
        accAccounts.brokerage *= (1 + realReturn);
        accAccounts.cash *= (1 + realReturn);
        
        // Handle contributions and expenses
        if (isPT) {
          // Semi-retirement: earn income, pay expenses, contribute remainder
          const healthcare = age < 65 ? healthcareCost : 0;
          const totalExpenses = annualExpenses + healthcare;
          const netIncome = semiRetireIncome - totalExpenses;
          
          if (netIncome > 0) {
            // Surplus: save it
            accAccounts.traditional += semiRetireContribution;
          } else {
            // Shortfall: withdraw from portfolio
            const needed = Math.abs(netIncome);
            const withdrawal = withdrawFunds(needed, accAccounts, age, healthcare, semiRetireIncome);
            accAccounts = withdrawal.accounts;
          }
        } else {
          // Working full-time: add contributions
          accAccounts.traditional += p1_401kEmployee + p1_401kEmployer + p2_401kEmployee + p2_401kEmployer;
          accAccounts.roth += p1IRAContrib + p2IRAContrib;
          accAccounts.hsa += p1HSAContrib + p2HSAContrib;
        }
      }
      
      const totalAssets = accAccounts.roth + accAccounts.hsa + accAccounts.traditional + accAccounts.brokerage + accAccounts.cash;
      yearly.push({year: 2025 + y, age, assets: Math.round(totalAssets)});
    }

    const ret = [];
    
    // Start retirement with accumulated account balances
    let accounts = {...accAccounts};
    const yearsInRetirement = planningAge - retirementAge;
    
    for (let y = 0; y <= yearsInRetirement; y++) {
      const age = retirementAge + y;
      let inc = 0;
      
      // Check if still earning semi-retirement income
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
      
      // Withdraw with tax-aware strategy (pass SS+Pension as other income for tax calc)
      const withdrawal = withdrawFunds(neededAfterTax, accounts, age, healthcare, inc);
      accounts = withdrawal.accounts;
      
      // Apply growth to all remaining accounts
      const nominalReturn = getBlendedReturn(age);
      const realReturn = (1 + nominalReturn) / (1 + inflationRate / 100) - 1;
      accounts.roth *= (1 + realReturn);
      accounts.hsa *= (1 + realReturn);
      accounts.traditional *= (1 + realReturn);
      accounts.brokerage *= (1 + realReturn);
      accounts.cash *= (1 + realReturn);
      
      const totalAssets = accounts.roth + accounts.hsa + accounts.traditional + accounts.brokerage + accounts.cash;
      
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

    const simResults = [];
    const yearlyBalances = []; // Track balances across all simulations by year
    
    // Debug flag for extreme scenarios
    const isExtremeScenario = annualExpenses > 500000;
    
    for (let sim = 0; sim < numSimulations; sim++) {
      // Track accounts separately during accumulation
      let simAccounts = {
        roth: p1RothIRA + p2RothIRA,
        hsa: p1HSA + p2HSA,
        traditional: p1_401k + p2_401k,
        brokerage: p1Brokerage + p2Brokerage,
        cash: jointCash
      };
      
      const simPath = [];
      const isFirstSim = sim === 0;
      
      if (isExtremeScenario && isFirstSim) {
        console.log('=== EXTREME SCENARIO DEBUG (Sim 0) ===');
        console.log(`Annual expenses: $${annualExpenses}, Healthcare: $${healthcareCost}`);
      }
      
      for (let y = 0; y < ytr; y++) {
        const age = currentAge + y + 1;
        const isPT = semiRetireEnabled && age >= semiRetireStartAge && age < retirementAge;
        
        const nominalReturn = getBlendedReturn(age);
        const volatility = getVolatility(age);
        const u1 = Math.random();
        const u2 = Math.random();
        const normalRandom = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        const randomReturn = nominalReturn + normalRandom * volatility;
        const realReturn = randomReturn - (inflationRate / 100);
        
        // Grow all accounts
        simAccounts.roth *= (1 + realReturn);
        simAccounts.hsa *= (1 + realReturn);
        simAccounts.traditional *= (1 + realReturn);
        simAccounts.brokerage *= (1 + realReturn);
        simAccounts.cash *= (1 + realReturn);
        
        // Handle contributions and expenses
        if (isPT) {
          // Semi-retirement: earn income, pay expenses, contribute remainder
          const healthcare = age < 65 ? healthcareCost : 0;
          const totalExpenses = annualExpenses + healthcare;
          const netIncome = semiRetireIncome - totalExpenses;
          
          if (netIncome > 0) {
            // Surplus: save it
            simAccounts.traditional += semiRetireContribution;
          } else {
            // Shortfall: withdraw from portfolio
            const needed = Math.abs(netIncome);
            const withdrawal = withdrawFunds(needed, simAccounts, age, healthcare, semiRetireIncome);
            simAccounts = withdrawal.accounts;
          }
        } else {
          // Working full-time: add contributions
          simAccounts.traditional += p1_401kEmployee + p1_401kEmployer + p2_401kEmployee + p2_401kEmployer;
          simAccounts.roth += p1IRAContrib + p2IRAContrib;
          simAccounts.hsa += p1HSAContrib + p2HSAContrib;
        }
        
        const totalBal = simAccounts.roth + simAccounts.hsa + simAccounts.traditional + simAccounts.brokerage + simAccounts.cash;
      }
      
      const startRetirementBal = simAccounts.roth + simAccounts.hsa + simAccounts.traditional + simAccounts.brokerage + simAccounts.cash;
      
      if (isExtremeScenario && isFirstSim) {
        console.log(`At retirement (age ${retirementAge}): $${Math.round(startRetirementBal)}`);
      }
      
      for (let y = 0; y <= yearsInRetirement; y++) {
        const age = retirementAge + y;
        let inc = 0;
        
        // Check if still earning semi-retirement income (shouldn't happen if retirementAge > semiRetireAge but check anyway)
        const stillSemiRetired = semiRetireEnabled && age >= semiRetireStartAge && age < retirementAge;
        if (stillSemiRetired) {
          inc += semiRetireIncome;
        }
        
        const p1SSAdj = p1SSMonth * getSSBenefitMultiplier(p1SSClaimAge);
        const p2SSAdj = p2SSMonth * getSSBenefitMultiplier(p2SSClaimAge);
        if (age >= p1SSClaimAge) inc += p1SSAdj * 12;
        if (age >= p2SSClaimAge) inc += p2SSAdj * 12;
        if (age >= 65) inc += (p1PensionMonth + p2PensionMonth) * 12;
        
        const nominalReturn = getBlendedReturn(age);
        const volatility = getVolatility(age);
        const u1 = Math.random();
        const u2 = Math.random();
        const normalRandom = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        const randomReturn = nominalReturn + normalRandom * volatility;
        const realReturn = randomReturn - (inflationRate / 100);
        
        const baseExpenses = annualExpenses;
        const healthcare = age < 65 ? healthcareCost : 0;
        const totalExpenses = baseExpenses + healthcare;
        const neededAfterTax = Math.max(0, totalExpenses - inc);
        
        // Use tax-aware withdrawal strategy
        const withdrawal = withdrawFunds(neededAfterTax, simAccounts, age, healthcare, inc);
        simAccounts = withdrawal.accounts;
        
        if (isExtremeScenario && isFirstSim && y < 3) {
          console.log(`Age ${age}: Needed=$${Math.round(neededAfterTax)}, Withdrew=$${Math.round(withdrawal.gross)}, AfterTax=$${Math.round(withdrawal.afterTax)}`);
        }
        
        // Apply growth to remaining accounts AFTER withdrawal
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
        
        // Consider it a failure if balance drops below $10k (effectively broke)
        if (balance <= 10000) {
          if (isExtremeScenario && isFirstSim) {
            console.log(`FAILED at age ${age} with balance=$${Math.round(balance)}`);
          }
          // Pad with zeros for remaining years
          for (let i = y + 1; i <= yearsInRetirement; i++) {
            simPath.push(0);
          }
          break;
        }
      }
      
      // Store this simulation's path
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
  }, [currentAge, retirementAge, planningAge, inflationRate, totalAssets, annualContrib, p1PensionMonth, p2PensionMonth, numSimulations, semiRetireAge, semiRetireIncome, semiRetireSavingsRate, healthcareCost, annualExpenses, p1SSMonth, p2SSMonth, p1SSClaimAge, p2SSClaimAge, stockPctAccumulation, stockPctRetirement, transitionYears]);

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
        <h1 className="text-2xl font-bold text-slate-800 mb-1 flex items-center gap-2">
          <TrendingUp className="text-blue-600" />
          Retirement Planning Calculator
        </h1>
        <p className="text-xs text-slate-500">Monte Carlo: {numSimulations.toLocaleString()} scenarios • All values in today's dollars</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
        <div className="flex justify-between cursor-pointer" onClick={() => setShowEdit(!showEdit)}>
          <h2 className="text-lg font-bold flex items-center gap-2"><DollarSign />Financial Details</h2>
          <button className="text-xl font-bold">{showEdit ? '−' : '+'}</button>
        </div>
        
        {showEdit && (
          <div className="mt-4 space-y-4">
            <div>
              <h3 className="font-bold mb-2 text-base border-b pb-1">Current Assets</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-lg p-3 bg-blue-50">
                  <h4 className="font-semibold mb-2 text-sm text-blue-700">Person 1</h4>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-bold mb-1">Roth IRA</label>
                      <input type="number" value={p1RothIRA} onChange={(e) => setP1RothIRA(+e.target.value)} className="w-full px-2 py-1 border rounded text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">HSA</label>
                      <input type="number" value={p1HSA} onChange={(e) => setP1HSA(+e.target.value)} className="w-full px-2 py-1 border rounded text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">401k</label>
                      <input type="number" value={p1_401k} onChange={(e) => setP1_401k(+e.target.value)} className="w-full px-2 py-1 border rounded text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">Brokerage</label>
                      <input type="number" value={p1Brokerage} onChange={(e) => setP1Brokerage(+e.target.value)} className="w-full px-2 py-1 border rounded text-sm" />
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-blue-200">
                    <div className="text-xs font-bold text-blue-700">
                      P1 Total: {fmt(p1RothIRA + p1HSA + p1_401k + p1Brokerage)}
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-3 bg-green-50">
                  <h4 className="font-semibold mb-2 text-sm text-green-700">Person 2</h4>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-bold mb-1">Roth IRA</label>
                      <input type="number" value={p2RothIRA} onChange={(e) => setP2RothIRA(+e.target.value)} className="w-full px-2 py-1 border rounded text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">HSA</label>
                      <input type="number" value={p2HSA} onChange={(e) => setP2HSA(+e.target.value)} className="w-full px-2 py-1 border rounded text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">401k</label>
                      <input type="number" value={p2_401k} onChange={(e) => setP2_401k(+e.target.value)} className="w-full px-2 py-1 border rounded text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">Brokerage</label>
                      <input type="number" value={p2Brokerage} onChange={(e) => setP2Brokerage(+e.target.value)} className="w-full px-2 py-1 border rounded text-sm" />
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-green-200">
                    <div className="text-xs font-bold text-green-700">
                      P2 Total: {fmt(p2RothIRA + p2HSA + p2_401k + p2Brokerage)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-3 bg-purple-50 mt-3">
                <h4 className="font-semibold mb-2 text-sm text-purple-700">Joint</h4>
                <div>
                  <label className="block text-xs font-bold mb-1">Cash / Emergency Fund</label>
                  <input type="number" value={jointCash} onChange={(e) => setJointCash(+e.target.value)} className="w-full px-2 py-1 border rounded text-sm" />
                </div>
              </div>

              <div className="bg-slate-100 p-2 rounded-lg mt-3">
                <div className="text-base font-bold">Combined Total: {fmt(totalAssets)}</div>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold mb-2 text-base border-b pb-1">Income & Contributions</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-lg p-3 bg-blue-50">
                  <h4 className="font-semibold mb-2 text-sm text-blue-700">Person 1</h4>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-bold mb-1">Annual Income</label>
                      <input type="number" value={p1Income} onChange={(e) => setP1Income(+e.target.value)} className="w-full px-2 py-1 border rounded text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">401k Contribution %</label>
                      <input type="number" step="0.5" value={p1_401kContribPct} onChange={(e) => setP1_401kContribPct(+e.target.value)} className="w-full px-2 py-1 border rounded text-sm" />
                      <div className="text-xs text-slate-600 mt-0.5">{fmt(p1_401kEmployee)}/year</div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">Employer Match %</label>
                      <input type="number" step="0.5" value={p1EmployerMatchPct} onChange={(e) => setP1EmployerMatchPct(+e.target.value)} className="w-full px-2 py-1 border rounded text-sm" />
                      <div className="text-xs text-slate-600 mt-0.5">{fmt(p1_401kEmployer)}/year</div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">Annual Roth IRA Contribution</label>
                      <input type="number" value={p1IRAContrib} onChange={(e) => setP1IRAContrib(+e.target.value)} className="w-full px-2 py-1 border rounded text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">Annual HSA Contribution</label>
                      <input type="number" value={p1HSAContrib} onChange={(e) => setP1HSAContrib(+e.target.value)} className="w-full px-2 py-1 border rounded text-sm" />
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-blue-200">
                    <div className="text-xs font-bold text-blue-700">
                      P1 Total: {fmt(p1_401kEmployee + p1_401kEmployer + p1IRAContrib + p1HSAContrib)}/year
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-3 bg-green-50">
                  <h4 className="font-semibold mb-2 text-sm text-green-700">Person 2</h4>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-bold mb-1">Annual Income</label>
                      <input type="number" value={p2Income} onChange={(e) => setP2Income(+e.target.value)} className="w-full px-2 py-1 border rounded text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">401k Contribution %</label>
                      <input type="number" step="0.5" value={p2_401kContribPct} onChange={(e) => setP2_401kContribPct(+e.target.value)} className="w-full px-2 py-1 border rounded text-sm" />
                      <div className="text-xs text-slate-600 mt-0.5">{fmt(p2_401kEmployee)}/year</div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">Employer Match %</label>
                      <input type="number" step="0.5" value={p2EmployerMatchPct} onChange={(e) => setP2EmployerMatchPct(+e.target.value)} className="w-full px-2 py-1 border rounded text-sm" />
                      <div className="text-xs text-slate-600 mt-0.5">{fmt(p2_401kEmployer)}/year</div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">Annual Roth IRA Contribution</label>
                      <input type="number" value={p2IRAContrib} onChange={(e) => setP2IRAContrib(+e.target.value)} className="w-full px-2 py-1 border rounded text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">Annual HSA Contribution</label>
                      <input type="number" value={p2HSAContrib} onChange={(e) => setP2HSAContrib(+e.target.value)} className="w-full px-2 py-1 border rounded text-sm" />
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-green-200">
                    <div className="text-xs font-bold text-green-700">
                      P2 Total: {fmt(p2_401kEmployee + p2_401kEmployer + p2IRAContrib + p2HSAContrib)}/year
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-100 p-2 rounded mt-3">
                <div className="text-xs font-bold mb-0.5">Combined Household</div>
                <div className="text-sm">Income: {fmt(income)}/year</div>
                <div className="text-sm">Total Contributions: {fmt(annualContrib)}/year ({((annualContrib / income) * 100).toFixed(1)}%)</div>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold mb-2 text-base border-b pb-1">Retirement Income (Monthly)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-lg p-3 bg-blue-50">
                  <h4 className="font-semibold mb-2 text-sm text-blue-700">Person 1</h4>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-bold mb-1">Social Security (at 67)</label>
                      <input type="number" value={p1SSMonth} onChange={(e) => setP1SSMonth(+e.target.value)} className="w-full px-2 py-1 border rounded text-sm" />
                      <div className="text-xs text-slate-500 mt-0.5">{fmt(p1SSMonth * 12)}/year</div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">Pension (starts age 65)</label>
                      <input type="number" value={p1PensionMonth} onChange={(e) => setP1PensionMonth(+e.target.value)} className="w-full px-2 py-1 border rounded text-sm" />
                      <div className="text-xs text-slate-500 mt-0.5">{fmt(p1PensionMonth * 12)}/year</div>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-3 bg-green-50">
                  <h4 className="font-semibold mb-2 text-sm text-green-700">Person 2</h4>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs font-bold mb-1">Social Security (at 67)</label>
                      <input type="number" value={p2SSMonth} onChange={(e) => setP2SSMonth(+e.target.value)} className="w-full px-2 py-1 border rounded text-sm" />
                      <div className="text-xs text-slate-500 mt-0.5">{fmt(p2SSMonth * 12)}/year</div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1">Pension (starts age 65)</label>
                      <input type="number" value={p2PensionMonth} onChange={(e) => setP2PensionMonth(+e.target.value)} className="w-full px-2 py-1 border rounded text-sm" />
                      <div className="text-xs text-slate-500 mt-0.5">{fmt(p2PensionMonth * 12)}/year</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 p-2 rounded mt-3">
                <h4 className="font-semibold mb-1 text-xs">Social Security Claiming Strategy</h4>
                <div className="text-xs mb-1.5">Claim early = lower benefit permanently. Delay = higher benefit for life.</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold mb-1">P1 Claim Age</label>
                    <input type="range" min="62" max="70" value={p1SSClaimAge} onChange={(e) => setP1SSClaimAge(+e.target.value)} className="w-full mb-1" />
                    <div className="flex justify-between items-center">
                      <div className="text-base font-bold text-blue-600">{p1SSClaimAge}</div>
                      <div className="text-xs font-semibold">{fmt(p1SSMonth * getSSBenefitMultiplier(p1SSClaimAge))}/mo</div>
                    </div>
                    <div className="text-xs text-slate-500">{(getSSBenefitMultiplier(p1SSClaimAge) * 100).toFixed(0)}% of age 67 benefit</div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">P2 Claim Age</label>
                    <input type="range" min="62" max="70" value={p2SSClaimAge} onChange={(e) => setP2SSClaimAge(+e.target.value)} className="w-full mb-1" />
                    <div className="flex justify-between items-center">
                      <div className="text-base font-bold text-blue-600">{p2SSClaimAge}</div>
                      <div className="text-xs font-semibold">{fmt(p2SSMonth * getSSBenefitMultiplier(p2SSClaimAge))}/mo</div>
                    </div>
                    <div className="text-xs text-slate-500">{(getSSBenefitMultiplier(p2SSClaimAge) * 100).toFixed(0)}% of age 67 benefit</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
        <h2 className="text-lg font-bold mb-3">Scenario</h2>
        
        <div className="mb-3 pb-3 border-b">
          <h3 className="font-bold mb-1.5 text-sm">Expenses</h3>
          <div className="text-xs text-slate-500 mb-1.5">💡 Base = yearly living costs. Healthcare = ages {retirementAge}-64 until Medicare{retirementAge >= 65 ? ' (N/A - Medicare starts at 65)' : '. ACA subsidies possible with Roth/HSA strategy'}.</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1">Base Annual</label>
              <input type="number" value={annualExpenses} onChange={(e) => setAnnualExpenses(+e.target.value)} className="w-full px-2 py-1.5 border rounded text-base font-semibold" />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Healthcare (ages {retirementAge}-64){retirementAge >= 65 ? ' - N/A' : ''}</label>
              <input type="number" value={healthcareCost} onChange={(e) => setHealthcareCost(+e.target.value)} className="w-full px-2 py-1.5 border rounded text-base font-semibold" disabled={retirementAge >= 65} />
              <div className="text-xs text-slate-500 mt-0.5">Total: {fmt(annualExpenses + (retirementAge >= 65 ? 0 : healthcareCost))}/yr</div>
            </div>
          </div>
        </div>
        
        <div className="mb-3 pb-3 border-b">
          <h3 className="font-bold mb-1.5 text-sm">Timeline</h3>
          <div className="text-xs text-slate-500 mb-1.5">💡 All projections in today's dollars (inflation-adjusted).</div>
          <div className="grid grid-cols-5 gap-2">
            <div>
              <label className="block text-xs font-bold mb-1">Current Age</label>
              <input type="number" value={currentAge} onChange={(e) => setCurrentAge(+e.target.value)} className="w-full px-2 py-1 border rounded text-base font-bold" />
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Retire Age</label>
              <input type="range" min={currentAge + 1} max="80" value={retirementAge} onChange={(e) => setRetirementAge(+e.target.value)} className="w-full mb-0.5" />
              <div className="text-base font-bold text-blue-600 text-center">{retirementAge}</div>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Plan Until</label>
              <input type="range" min={retirementAge + 10} max="100" value={planningAge} onChange={(e) => setPlanningAge(+e.target.value)} className="w-full mb-0.5" />
              <div className="text-base font-bold text-blue-600 text-center">{planningAge}</div>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Inflation %</label>
              <input type="range" min="1" max="4" step="0.5" value={inflationRate} onChange={(e) => setInflationRate(+e.target.value)} className="w-full mb-0.5" />
              <div className="text-base font-bold text-center">{inflationRate}%</div>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Sims</label>
              <select value={numSimulations} onChange={(e) => setNumSimulations(+e.target.value)} className="w-full px-1 py-1 border rounded text-xs">
                <option value="1000">1K</option>
                <option value="5000">5K</option>
                <option value="10000">10K</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-bold mb-1.5 text-sm">Asset Allocation (Stocks vs Bonds)</h3>
          <div className="text-xs text-slate-500 mb-1.5">💡 Stocks (~10% return, higher risk). Bonds (~4% return, lower risk). Gradually shift to bonds near retirement.</div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold mb-1">Stock % (Working Years)</label>
              <input type="range" min="50" max="100" step="5" value={stockPctAccumulation} onChange={(e) => setStockPctAccumulation(+e.target.value)} className="w-full mb-0.5" />
              <div className="text-base font-bold text-center text-blue-600">{stockPctAccumulation}%</div>
              <div className="text-xs text-slate-500 text-center">{100 - stockPctAccumulation}% bonds</div>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Stock % (Retirement)</label>
              <input type="range" min="30" max="80" step="5" value={stockPctRetirement} onChange={(e) => setStockPctRetirement(+e.target.value)} className="w-full mb-0.5" />
              <div className="text-base font-bold text-center text-green-600">{stockPctRetirement}%</div>
              <div className="text-xs text-slate-500 text-center">{100 - stockPctRetirement}% bonds</div>
            </div>
            <div>
              <label className="block text-xs font-bold mb-1">Transition Period</label>
              <input type="range" min="0" max="15" value={transitionYears} onChange={(e) => setTransitionYears(+e.target.value)} className="w-full mb-0.5" />
              <div className="text-base font-bold text-center text-purple-600">{transitionYears} years</div>
              <div className="text-xs text-slate-500 text-center">Before retirement</div>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 p-2 rounded mt-2">
            <div className="text-xs">
              <strong>Expected Returns:</strong> Working years ~{(stockPctAccumulation * 0.10 + (100 - stockPctAccumulation) * 0.04).toFixed(1)}% • 
              Retirement ~{(stockPctRetirement * 0.10 + (100 - stockPctRetirement) * 0.04).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      <div className="bg-purple-50 rounded-xl shadow-lg p-3 mb-4 border border-purple-200">
        <div className="flex justify-between cursor-pointer" onClick={() => setShowSemiRetire(!showSemiRetire)}>
          <h2 className="text-base font-bold text-purple-900">Semi-Retirement {semiRetireAge > 0 ? `(Age ${semiRetireAge})` : '(Skipped)'}</h2>
          <button className="text-lg font-bold">{showSemiRetire ? '−' : '+'}</button>
        </div>
        
        {showSemiRetire && (
          <div className="mt-3">
            <label className="flex items-center gap-2 mb-2">
              <input type="checkbox" checked={semiRetireAge === 0} onChange={(e) => setSemiRetireAge(e.target.checked ? 0 : Math.min(currentAge + 5, retirementAge - 1))} />
              <span className="text-xs">Skip semi-retirement</span>
            </label>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold mb-1">Age</label>
                <input type="range" min={currentAge + 1} max={retirementAge - 1} value={semiRetireAge || currentAge + 1} onChange={(e) => setSemiRetireAge(+e.target.value)} disabled={semiRetireAge === 0} className="w-full mb-0.5" />
                <div className="text-base font-bold text-purple-600 text-center">{semiRetireAge === 0 ? 'Skip' : semiRetireAge}</div>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Income</label>
                <input type="number" value={semiRetireIncome} onChange={(e) => setSemiRetireIncome(+e.target.value)} disabled={semiRetireAge === 0} className="w-full px-2 py-1.5 border rounded" />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Savings %</label>
                <input type="range" min="0" max="20" value={semiRetireSavingsRate} onChange={(e) => setSemiRetireSavingsRate(+e.target.value)} disabled={semiRetireAge === 0} className="w-full mb-0.5" />
                <div className="text-base font-bold text-purple-600 text-center">{semiRetireSavingsRate}%</div>
              </div>
            </div>

            {semiRetireAge > 0 && (
              <div className="mt-2 p-2 bg-white rounded text-xs">
                Contribution: {fmt(semiRetireIncome * (semiRetireSavingsRate / 100))} • Take-home: {fmt(semiRetireIncome * (1 - semiRetireSavingsRate / 100))}
              </div>
            )}
          </div>
        )}
      </div>

      {calc?.mcStats && (
        <div className="bg-white rounded-xl shadow-lg p-3 mb-4">
          <h3 className="text-base font-bold mb-2">Monte Carlo Results</h3>
          <div className="grid grid-cols-4 gap-2">
            <div className={`p-2 rounded border ${
              parseFloat(calc.mcStats.successRate) >= 85 ? 'bg-green-500/20 border-green-400' : 
              parseFloat(calc.mcStats.successRate) >= 75 ? 'bg-amber-500/20 border-amber-400' : 
              parseFloat(calc.mcStats.successRate) >= 60 ? 'bg-orange-500/20 border-orange-400' : 
              'bg-red-500/20 border-red-400'
            }`}>
              <div className="text-xs text-slate-300">Success Rate</div>
              <div className={`text-lg font-bold ${
                parseFloat(calc.mcStats.successRate) >= 85 ? 'text-green-400' : 
                parseFloat(calc.mcStats.successRate) >= 75 ? 'text-amber-400' : 
                parseFloat(calc.mcStats.successRate) >= 60 ? 'text-orange-400' : 
                'text-red-400'
              }`}>{calc.mcStats.successRate}%</div>
            </div>
            <div className="bg-slate-800 p-2 rounded border border-slate-600">
              <div className="text-xs text-slate-300">10th %</div>
              <div className="text-base font-bold text-slate-100">{fmt(calc.mcStats.p10)}</div>
            </div>
            <div className="bg-slate-800 p-2 rounded border border-slate-600">
              <div className="text-xs text-slate-300">Median</div>
              <div className="text-base font-bold text-slate-100">{fmt(calc.mcStats.p50)}</div>
            </div>
            <div className="bg-slate-800 p-2 rounded border border-slate-600">
              <div className="text-xs text-slate-300">90th %</div>
              <div className="text-base font-bold text-slate-100">{fmt(calc.mcStats.p90)}</div>
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-1.5">
            💡 Success rate: 🟢≥85% strong, 🟡75-84% good, 🟠60-74% moderate, 🔴&lt;60% needs work
          </div>
          <div className="text-xs text-blue-600 mt-2 p-2 bg-blue-50 rounded border border-blue-200">
            <strong>Automatic Tax Strategy:</strong> Calculator uses 2026 federal tax brackets. Withdrawals prioritize: HSA (tax-free healthcare) → Roth (tax-free) → Brokerage (0-20% capital gains) → 401k (10-37% based on income). RMDs automatically calculated at age 73+.
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-3 mb-4">
        <div className="flex justify-between mb-1.5">
          <h3 className="text-base font-bold">Plan Assessment</h3>
          <div className={`text-base font-bold px-2 py-0.5 rounded ${(calc?.score || 0) >= 70 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {(calc?.score || 0) >= 70 ? 'PASS' : 'FAIL'}
          </div>
        </div>
        
        <div className="mb-2">
          <div className="flex justify-between mb-1">
            <span className="text-xs">Score</span>
            <span className="text-xl font-bold text-blue-600">{calc?.score || 0}/100</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2.5">
            <div className="h-2.5 rounded-full" style={{width: `${calc?.score || 0}%`, background: (calc?.score || 0) >= 70 ? '#10b981' : '#ef4444'}} />
          </div>
        </div>
        
        {calc?.detail && <div className="text-xs p-2 bg-slate-50 rounded">{calc.detail}</div>}
      </div>

      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="bg-white rounded-xl shadow-lg p-3">
          <div className="text-xs text-slate-500">At Retirement</div>
          <div className="text-xl font-bold">{fmt(calc?.assets || 0)}</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-3">
          <div className="text-xs text-slate-500">Annual Expenses</div>
          <div className="text-xl font-bold">{fmt(annualExpenses)}</div>
          <div className="text-xs text-slate-500 mt-0.5">{retirementAge >= 65 ? 'Medicare at 65' : `+${fmt(healthcareCost)} healthcare (ages ${retirementAge}-64)`}</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-3">
          <div className="text-xs text-slate-500">SS + Pension</div>
          <div className="text-xl font-bold">{fmt((p1SSMonth * getSSBenefitMultiplier(p1SSClaimAge) + p2SSMonth * getSSBenefitMultiplier(p2SSClaimAge) + p1PensionMonth + p2PensionMonth) * 12)}</div>
          <div className="text-xs text-slate-500 mt-0.5">At ages {Math.min(p1SSClaimAge, p2SSClaimAge)}-{Math.max(p1SSClaimAge, p2SSClaimAge)}</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-3">
          <div className="text-xs text-slate-500">Years to Retire</div>
          <div className="text-xl font-bold">{retirementAge - currentAge}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
        <h3 className="text-lg font-bold mb-3">Growth to Retirement</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={calc?.yearly || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => fmt(v)} />
            <Line type="monotone" dataKey="assets" stroke="#3b82f6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4">
        <h3 className="text-lg font-bold mb-3">Retirement Projection (Monte Carlo Range)</h3>
        <div className="text-xs text-slate-500 mb-2">💡 Shows best/worst case scenarios from {numSimulations.toLocaleString()} simulations</div>
        <ResponsiveContainer width="100%" height={450}>
          <LineChart data={calc?.ret || []} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} domain={[0, 'auto']} />
            <Tooltip formatter={(v) => fmt(v)} />
            <Legend />
            <Line type="monotone" dataKey="p90" stroke="#93c5fd" strokeWidth={2} name="Best 10% (90th %ile)" dot={false} strokeDasharray="5 5" />
            <Line type="monotone" dataKey="p10" stroke="#ef4444" strokeWidth={2.5} name="Worst 10% (10th %ile)" dot={false} strokeDasharray="5 5" />
            <Line type="monotone" dataKey="assets" stroke="#1e40af" strokeWidth={3} name="Base Case (avg returns)" dot={false} />
            <Line type="monotone" dataKey="wd" stroke="#f97316" strokeWidth={2} name="Withdrawal" dot={false} />
            <Line type="monotone" dataKey="inc" stroke="#10b981" strokeWidth={2} name="Income (SS+Pension)" dot={false} />
          </LineChart>
        </ResponsiveContainer>
        <div className="text-xs text-slate-600 mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
          <strong>Reading the chart:</strong> Red dashed = worst 10% of scenarios. Light blue dashed = best 10%. Dark blue = average. If red line hits $0, you run out in bad scenarios. Success rate: {calc?.mcStats?.successRate}%
        </div>
      </div>
    </div>
  );
};

export default RetirementCalculator;
