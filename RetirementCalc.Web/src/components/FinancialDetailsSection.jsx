import { DollarSign } from 'lucide-react';
import { fmt } from '../lib/formatters';
import { getSSBenefitMultiplier } from '../lib/withdrawalStrategy';

const FinancialDetailsSection = ({
  showEdit, setShowEdit,
  p1RothIRA, setP1RothIRA, p1HSA, setP1HSA, p1_401k, setP1_401k, p1Brokerage, setP1Brokerage,
  p2RothIRA, setP2RothIRA, p2HSA, setP2HSA, p2_401k, setP2_401k, p2Brokerage, setP2Brokerage,
  jointCash, setJointCash, totalAssets,
  p1Income, setP1Income, p2Income, setP2Income,
  p1_401kContribPct, setP1_401kContribPct, p1EmployerMatchPct, setP1EmployerMatchPct,
  p1IRAContrib, setP1IRAContrib, p1HSAContrib, setP1HSAContrib,
  p2_401kContribPct, setP2_401kContribPct, p2EmployerMatchPct, setP2EmployerMatchPct,
  p2IRAContrib, setP2IRAContrib, p2HSAContrib, setP2HSAContrib,
  p1_401kEmployee, p1_401kEmployer, p2_401kEmployee, p2_401kEmployer,
  income, annualContrib,
  p1SSMonth, setP1SSMonth, p2SSMonth, setP2SSMonth,
  p1SSClaimAge, setP1SSClaimAge, p2SSClaimAge, setP2SSClaimAge,
  p1PensionMonth, setP1PensionMonth, p2PensionMonth, setP2PensionMonth,
}) => {
  return (
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
  );
};

export default FinancialDetailsSection;
