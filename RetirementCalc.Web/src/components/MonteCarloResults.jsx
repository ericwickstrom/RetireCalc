import { fmt } from '../lib/formatters';

const MonteCarloResults = ({ mcStats }) => {
  if (!mcStats) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-3 mb-4">
      <h3 className="text-base font-bold mb-2">Monte Carlo Results</h3>
      <div className="grid grid-cols-4 gap-2">
        <div className={`p-2 rounded border ${
          parseFloat(mcStats.successRate) >= 85 ? 'bg-green-500/20 border-green-400' :
          parseFloat(mcStats.successRate) >= 75 ? 'bg-amber-500/20 border-amber-400' :
          parseFloat(mcStats.successRate) >= 60 ? 'bg-orange-500/20 border-orange-400' :
          'bg-red-500/20 border-red-400'
        }`}>
          <div className="text-xs text-slate-300">Success Rate</div>
          <div className={`text-lg font-bold ${
            parseFloat(mcStats.successRate) >= 85 ? 'text-green-400' :
            parseFloat(mcStats.successRate) >= 75 ? 'text-amber-400' :
            parseFloat(mcStats.successRate) >= 60 ? 'text-orange-400' :
            'text-red-400'
          }`}>{mcStats.successRate}%</div>
        </div>
        <div className="bg-slate-800 p-2 rounded border border-slate-600">
          <div className="text-xs text-slate-300">10th %</div>
          <div className="text-base font-bold text-slate-100">{fmt(mcStats.p10)}</div>
        </div>
        <div className="bg-slate-800 p-2 rounded border border-slate-600">
          <div className="text-xs text-slate-300">Median</div>
          <div className="text-base font-bold text-slate-100">{fmt(mcStats.p50)}</div>
        </div>
        <div className="bg-slate-800 p-2 rounded border border-slate-600">
          <div className="text-xs text-slate-300">90th %</div>
          <div className="text-base font-bold text-slate-100">{fmt(mcStats.p90)}</div>
        </div>
      </div>
      <div className="text-xs text-slate-500 mt-1.5">
        {'💡'} Success rate: {'🟢'}≥85% strong, {'🟡'}75-84% good, {'🟠'}60-74% moderate, {'🔴'}&lt;60% needs work
      </div>
      <div className="text-xs text-blue-600 mt-2 p-2 bg-blue-50 rounded border border-blue-200">
        <strong>Automatic Tax Strategy:</strong> Calculator uses 2026 federal tax brackets. Withdrawals prioritize: HSA (tax-free healthcare) → Roth (tax-free) → Brokerage (0-20% capital gains) → 401k (10-37% based on income). RMDs automatically calculated at age 73+.
      </div>
    </div>
  );
};

export default MonteCarloResults;
