import { fmt } from '../lib/formatters';
import NumberInput from './NumberInput';

const ScenarioSection = ({
  annualExpenses, setAnnualExpenses, healthcareCost, setHealthcareCost,
  currentAge, setCurrentAge, retirementAge, setRetirementAge,
  planningAge, setPlanningAge, inflationRate, setInflationRate,
  numSimulations, setNumSimulations,
  stockPctAccumulation, setStockPctAccumulation,
  stockPctRetirement, setStockPctRetirement,
  transitionYears, setTransitionYears,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
      <h2 className="text-lg font-bold mb-3">Scenario</h2>

      <div className="mb-3 pb-3 border-b">
        <h3 className="font-bold mb-1.5 text-sm">Expenses</h3>
        <div className="text-xs text-slate-500 mb-1.5">{'💡'} Base = yearly living costs. Healthcare = ages {retirementAge}-64 until Medicare{retirementAge >= 65 ? ' (N/A - Medicare starts at 65)' : '. ACA subsidies possible with Roth/HSA strategy'}.</div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold mb-1">Base Annual</label>
            <NumberInput value={annualExpenses} onChange={setAnnualExpenses} className="w-full px-2 py-1.5 border rounded text-base font-semibold" />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">Healthcare (ages {retirementAge}-64){retirementAge >= 65 ? ' - N/A' : ''}</label>
            <NumberInput value={healthcareCost} onChange={setHealthcareCost} className="w-full px-2 py-1.5 border rounded text-base font-semibold" disabled={retirementAge >= 65} />
            <div className="text-xs text-slate-500 mt-0.5">Total: {fmt(annualExpenses + (retirementAge >= 65 ? 0 : healthcareCost))}/yr</div>
          </div>
        </div>
      </div>

      <div className="mb-3 pb-3 border-b">
        <h3 className="font-bold mb-1.5 text-sm">Timeline</h3>
        <div className="text-xs text-slate-500 mb-1.5">{'💡'} All projections in today's dollars (inflation-adjusted).</div>
        <div className="grid grid-cols-5 gap-2">
          <div>
            <label className="block text-xs font-bold mb-1">Current Age</label>
            <NumberInput value={currentAge} onChange={setCurrentAge} className="w-full px-2 py-1 border rounded text-base font-bold" />
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
        <div className="text-xs text-slate-500 mb-1.5">{'💡'} Stocks (~10% return, higher risk). Bonds (~4% return, lower risk). Gradually shift to bonds near retirement.</div>
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
            <strong>Expected Returns:</strong> Working years ~{(stockPctAccumulation * 0.10 + (100 - stockPctAccumulation) * 0.04).toFixed(1)}% •{' '}
            Retirement ~{(stockPctRetirement * 0.10 + (100 - stockPctRetirement) * 0.04).toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScenarioSection;
