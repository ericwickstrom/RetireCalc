import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fmt } from '../lib/formatters';

const AccumulationChart = ({ yearly }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
      <h3 className="text-lg font-bold mb-3">Growth to Retirement</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={yearly}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" />
          <YAxis tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
          <Tooltip formatter={(v) => fmt(v)} />
          <Line type="monotone" dataKey="assets" stroke="#3b82f6" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AccumulationChart;
