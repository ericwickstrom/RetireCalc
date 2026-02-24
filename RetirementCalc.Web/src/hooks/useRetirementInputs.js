import { useState } from 'react';

export const useRetirementInputs = () => {
  // Ages & Scenario
  const [currentAge, setCurrentAge] = useState(35);
  const [retirementAge, setRetirementAge] = useState(65);
  const [planningAge, setPlanningAge] = useState(90);
  const [annualExpenses, setAnnualExpenses] = useState(60000);
  const [healthcareCost, setHealthcareCost] = useState(12000);
  const [inflationRate, setInflationRate] = useState(3);
  const [stockPctAccumulation, setStockPctAccumulation] = useState(90);
  const [stockPctRetirement, setStockPctRetirement] = useState(60);
  const [transitionYears, setTransitionYears] = useState(10);
  const [numSimulations, setNumSimulations] = useState(10000);

  // Semi-Retirement
  const [semiRetireAge, setSemiRetireAge] = useState(0);
  const [semiRetireIncome, setSemiRetireIncome] = useState(40000);
  const [semiRetireSavingsRate, setSemiRetireSavingsRate] = useState(10);

  // UI Toggles
  const [showEdit, setShowEdit] = useState(false);
  const [showSemiRetire, setShowSemiRetire] = useState(false);

  // Person 1 Assets
  const [p1RothIRA, setP1RothIRA] = useState(50000);
  const [p1HSA, setP1HSA] = useState(10000);
  const [p1_401k, setP1_401k] = useState(75000);
  const [p1Brokerage, setP1Brokerage] = useState(0);

  // Person 2 Assets
  const [p2RothIRA, setP2RothIRA] = useState(0);
  const [p2HSA, setP2HSA] = useState(0);
  const [p2_401k, setP2_401k] = useState(50000);
  const [p2Brokerage, setP2Brokerage] = useState(0);

  // Joint
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

  // Derived Values
  const totalAssets = p1RothIRA + p1HSA + p1_401k + p1Brokerage + p2RothIRA + p2HSA + p2_401k + p2Brokerage + jointCash;
  const income = p1Income + p2Income;

  const p1_401kEmployee = Math.min(p1Income * (p1_401kContribPct / 100), 23000);
  const p1_401kEmployer = Math.min(p1Income * (p1EmployerMatchPct / 100), 23000);
  const p2_401kEmployee = Math.min(p2Income * (p2_401kContribPct / 100), 23000);
  const p2_401kEmployer = Math.min(p2Income * (p2EmployerMatchPct / 100), 23000);

  const annualContrib = p1_401kEmployee + p1_401kEmployer + p2_401kEmployee + p2_401kEmployer +
                        p1IRAContrib + p2IRAContrib + p1HSAContrib + p2HSAContrib;

  return {
    currentAge, setCurrentAge, retirementAge, setRetirementAge,
    planningAge, setPlanningAge, annualExpenses, setAnnualExpenses,
    healthcareCost, setHealthcareCost, inflationRate, setInflationRate,
    stockPctAccumulation, setStockPctAccumulation,
    stockPctRetirement, setStockPctRetirement,
    transitionYears, setTransitionYears,
    numSimulations, setNumSimulations,

    semiRetireAge, setSemiRetireAge, semiRetireIncome, setSemiRetireIncome,
    semiRetireSavingsRate, setSemiRetireSavingsRate,

    showEdit, setShowEdit, showSemiRetire, setShowSemiRetire,

    p1RothIRA, setP1RothIRA, p1HSA, setP1HSA, p1_401k, setP1_401k, p1Brokerage, setP1Brokerage,
    p2RothIRA, setP2RothIRA, p2HSA, setP2HSA, p2_401k, setP2_401k, p2Brokerage, setP2Brokerage,
    jointCash, setJointCash,

    p1Income, setP1Income, p2Income, setP2Income,

    p1_401kContribPct, setP1_401kContribPct, p1EmployerMatchPct, setP1EmployerMatchPct,
    p1IRAContrib, setP1IRAContrib, p1HSAContrib, setP1HSAContrib,

    p2_401kContribPct, setP2_401kContribPct, p2EmployerMatchPct, setP2EmployerMatchPct,
    p2IRAContrib, setP2IRAContrib, p2HSAContrib, setP2HSAContrib,

    p1SSMonth, setP1SSMonth, p2SSMonth, setP2SSMonth,
    p1SSClaimAge, setP1SSClaimAge, p2SSClaimAge, setP2SSClaimAge,
    p1PensionMonth, setP1PensionMonth, p2PensionMonth, setP2PensionMonth,

    totalAssets, income,
    p1_401kEmployee, p1_401kEmployer, p2_401kEmployee, p2_401kEmployer,
    annualContrib,
  };
};
