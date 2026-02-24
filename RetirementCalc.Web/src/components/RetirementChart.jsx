import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { fmt } from '../lib/formatters';

const RetirementChart = ({ ret, numSimulations, successRate }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4">
      <h3 className="text-lg font-bold mb-3">Retirement Projection (Monte Carlo Range)</h3>
      <div className="text-xs text-slate-500 mb-2">{'💡'} Shows best/worst case scenarios from {numSimulations.toLocaleString()} simulations</div>
      <ResponsiveContainer width="100%" height={450}>
        <LineChart data={ret} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
        <strong>Reading the chart:</strong> Red dashed = worst 10% of scenarios. Light blue dashed = best 10%. Dark blue = average. If red line hits $0, you run out in bad scenarios. Success rate: {successRate}%
      </div>
    </div>
  );
};

export default RetirementChart;
