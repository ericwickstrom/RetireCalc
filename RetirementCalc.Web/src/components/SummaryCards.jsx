import { fmt } from '../lib/formatters';
import { getSSBenefitMultiplier } from '../lib/withdrawalStrategy';

const SummaryCards = ({
  assets, annualExpenses, healthcareCost, retirementAge, currentAge,
  p1SSMonth, p2SSMonth, p1SSClaimAge, p2SSClaimAge,
  p1PensionMonth, p2PensionMonth,
}) => {
  return (
    <div className="grid grid-cols-4 gap-3 mb-4">
      <div className="bg-white rounded-xl shadow-lg p-3">
        <div className="text-xs text-slate-500">At Retirement</div>
        <div className="text-xl font-bold">{fmt(assets)}</div>
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
  );
};

export default SummaryCards;
