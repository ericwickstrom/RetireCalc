const PlanAssessment = ({ score, detail }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-3 mb-4">
      <div className="flex justify-between mb-1.5">
        <h3 className="text-base font-bold">Plan Assessment</h3>
        <div className={`text-base font-bold px-2 py-0.5 rounded ${score >= 70 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {score >= 70 ? 'PASS' : 'FAIL'}
        </div>
      </div>

      <div className="mb-2">
        <div className="flex justify-between mb-1">
          <span className="text-xs">Score</span>
          <span className="text-xl font-bold text-blue-600">{score}/100</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2.5">
          <div className="h-2.5 rounded-full" style={{width: `${score}%`, background: score >= 70 ? '#10b981' : '#ef4444'}} />
        </div>
      </div>

      {detail && <div className="text-xs p-2 bg-slate-50 rounded">{detail}</div>}
    </div>
  );
};

export default PlanAssessment;
