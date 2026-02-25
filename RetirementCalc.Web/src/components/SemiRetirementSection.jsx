import { fmt } from '../lib/formatters';
import NumberInput from './NumberInput';

const SemiRetirementSection = ({
  semiRetireAge, setSemiRetireAge, semiRetireIncome, setSemiRetireIncome,
  semiRetireSavingsRate, setSemiRetireSavingsRate,
  showSemiRetire, setShowSemiRetire,
  currentAge, retirementAge,
}) => {
  return (
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
              <NumberInput value={semiRetireIncome} onChange={setSemiRetireIncome} disabled={semiRetireAge === 0} className="w-full px-2 py-1.5 border rounded" />
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
  );
};

export default SemiRetirementSection;
