import React, { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import { useRetirementInputs } from '../hooks/useRetirementInputs';
import { runSimulation } from '../lib/simulationEngine';
import FinancialDetailsSection from './FinancialDetailsSection';
import ScenarioSection from './ScenarioSection';
import SemiRetirementSection from './SemiRetirementSection';
import MonteCarloResults from './MonteCarloResults';
import PlanAssessment from './PlanAssessment';
import SummaryCards from './SummaryCards';
import AccumulationChart from './AccumulationChart';
import RetirementChart from './RetirementChart';

const RetirementCalculator = () => {
  const inputs = useRetirementInputs();

  const calc = useMemo(() => {
    return runSimulation({
      currentAge: inputs.currentAge,
      retirementAge: inputs.retirementAge,
      planningAge: inputs.planningAge,
      inflationRate: inputs.inflationRate,
      annualExpenses: inputs.annualExpenses,
      healthcareCost: inputs.healthcareCost,
      numSimulations: inputs.numSimulations,
      stockPctAccumulation: inputs.stockPctAccumulation,
      stockPctRetirement: inputs.stockPctRetirement,
      transitionYears: inputs.transitionYears,
      semiRetireAge: inputs.semiRetireAge,
      semiRetireIncome: inputs.semiRetireIncome,
      semiRetireSavingsRate: inputs.semiRetireSavingsRate,
      accounts: {
        roth: inputs.p1RothIRA + inputs.p2RothIRA,
        hsa: inputs.p1HSA + inputs.p2HSA,
        traditional: inputs.p1_401k + inputs.p2_401k,
        brokerage: inputs.p1Brokerage + inputs.p2Brokerage,
        cash: inputs.jointCash,
      },
      contributions: {
        p1_401kEmployee: inputs.p1_401kEmployee,
        p1_401kEmployer: inputs.p1_401kEmployer,
        p2_401kEmployee: inputs.p2_401kEmployee,
        p2_401kEmployer: inputs.p2_401kEmployer,
        p1IRAContrib: inputs.p1IRAContrib,
        p2IRAContrib: inputs.p2IRAContrib,
        p1HSAContrib: inputs.p1HSAContrib,
        p2HSAContrib: inputs.p2HSAContrib,
      },
      retirementIncome: {
        p1SSMonth: inputs.p1SSMonth,
        p2SSMonth: inputs.p2SSMonth,
        p1SSClaimAge: inputs.p1SSClaimAge,
        p2SSClaimAge: inputs.p2SSClaimAge,
        p1PensionMonth: inputs.p1PensionMonth,
        p2PensionMonth: inputs.p2PensionMonth,
      },
    });
  }, [inputs.currentAge, inputs.retirementAge, inputs.planningAge, inputs.inflationRate, inputs.totalAssets, inputs.annualContrib, inputs.p1PensionMonth, inputs.p2PensionMonth, inputs.numSimulations, inputs.semiRetireAge, inputs.semiRetireIncome, inputs.semiRetireSavingsRate, inputs.healthcareCost, inputs.annualExpenses, inputs.p1SSMonth, inputs.p2SSMonth, inputs.p1SSClaimAge, inputs.p2SSClaimAge, inputs.stockPctAccumulation, inputs.stockPctRetirement, inputs.transitionYears]);

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
        <h1 className="text-2xl font-bold text-slate-800 mb-1 flex items-center gap-2">
          <TrendingUp className="text-blue-600" />
          Retirement Planning Calculator
        </h1>
        <p className="text-xs text-slate-500">Monte Carlo: {inputs.numSimulations.toLocaleString()} scenarios • All values in today's dollars</p>
      </div>

      <FinancialDetailsSection {...inputs} />
      <ScenarioSection {...inputs} />
      <SemiRetirementSection {...inputs} />
      <MonteCarloResults mcStats={calc?.mcStats} />
      <PlanAssessment score={calc?.score || 0} detail={calc?.detail} />
      <SummaryCards
        assets={calc?.assets || 0}
        annualExpenses={inputs.annualExpenses}
        healthcareCost={inputs.healthcareCost}
        retirementAge={inputs.retirementAge}
        currentAge={inputs.currentAge}
        p1SSMonth={inputs.p1SSMonth}
        p2SSMonth={inputs.p2SSMonth}
        p1SSClaimAge={inputs.p1SSClaimAge}
        p2SSClaimAge={inputs.p2SSClaimAge}
        p1PensionMonth={inputs.p1PensionMonth}
        p2PensionMonth={inputs.p2PensionMonth}
      />
      <AccumulationChart yearly={calc?.yearly || []} />
      <RetirementChart
        ret={calc?.ret || []}
        numSimulations={inputs.numSimulations}
        successRate={calc?.mcStats?.successRate}
      />
    </div>
  );
};

export default RetirementCalculator;
