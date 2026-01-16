
import React, { useMemo, useState, useEffect } from 'react';
import { Transaction } from '../types';
import { getFinancialAdvice } from '../services/geminiService';

interface DetailsViewProps {
  transactions: Transaction[];
  onBack: () => void;
}

const DetailsView: React.FC<DetailsViewProps> = ({ transactions, onBack }) => {
  const [advice, setAdvice] = useState<string | null>(null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  // Group by date for the last 10 days
  const last10Days = useMemo(() => {
    const groups: { [key: string]: number } = {};
    const now = new Date();
    
    for (let i = 0; i < 10; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      groups[key] = 0;
    }

    transactions.forEach(t => {
      const key = t.date.split('T')[0];
      if (groups.hasOwnProperty(key)) {
        // Simple net movement per day (Income - Expenses/Bills)
        if (t.type === 'INCOME') groups[key] += t.amount;
        else if (t.type === 'EXPENSE' || t.type === 'BILL') groups[key] -= t.amount;
      }
    });

    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [transactions]);

  // Cumulative summary for 365 days
  const yearlySummary = useMemo(() => {
    const summary = { income: 0, expense: 0, bill: 0, debt: 0 };
    const oneYearAgo = new Date();
    oneYearAgo.setDate(oneYearAgo.getDate() - 365);

    transactions.forEach(t => {
      const tDate = new Date(t.date);
      if (tDate >= oneYearAgo) {
        if (t.type === 'INCOME') summary.income += t.amount;
        if (t.type === 'EXPENSE') summary.expense += t.amount;
        if (t.type === 'BILL') summary.bill += t.amount;
        if (t.type === 'DEBT') summary.debt += t.amount;
      }
    });
    return summary;
  }, [transactions]);

  const handleFetchAdvice = async () => {
    setLoadingAdvice(true);
    const result = await getFinancialAdvice(transactions);
    setAdvice(result);
    setLoadingAdvice(false);
  };

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto flex flex-col animate-in slide-in-from-right duration-300">
      <header className="bg-white border-b border-gray-100 p-4 flex items-center gap-4 sticky top-0 z-10">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-gray-800">Reports & Insights</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-8">
        {/* Gemini Insight Button */}
        <section className="bg-indigo-50 border border-indigo-100 rounded-3xl p-6 relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-indigo-900 font-bold text-lg">AI Financial Insight</h3>
              <p className="text-indigo-600 text-sm">Powered by Gemini AI</p>
            </div>
            <button 
              onClick={handleFetchAdvice}
              disabled={loadingAdvice}
              className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700 disabled:opacity-50 transition-all"
            >
              {loadingAdvice ? 'Analyzing...' : 'Get Insight'}
            </button>
          </div>
          {advice && (
            <div className="bg-white/60 p-4 rounded-2xl text-indigo-900 text-sm font-medium leading-relaxed">
              {advice}
            </div>
          )}
        </section>

        {/* Cumulative Summary */}
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-4 px-2">Last 365 Days Summary</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Total Income', val: yearlySummary.income, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: 'Total Expenses', val: yearlySummary.expense, color: 'text-rose-600', bg: 'bg-rose-50' },
              { label: 'Total Bills', val: yearlySummary.bill, color: 'text-sky-600', bg: 'bg-sky-50' },
              { label: 'Outstanding Debt', val: yearlySummary.debt, color: 'text-amber-600', bg: 'bg-amber-50' },
            ].map((item, idx) => (
              <div key={idx} className={`${item.bg} p-4 rounded-2xl`}>
                <p className="text-xs text-gray-500 font-medium mb-1">{item.label}</p>
                <p className={`text-lg font-bold ${item.color}`}>৳{item.val.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Daily Report */}
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-4 px-2">Last 10 Days Performance</h2>
          <div className="space-y-3">
            {last10Days.map(([date, net]) => (
              <div key={date} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                <div>
                  <p className="font-semibold text-gray-700">
                    {new Date(date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-xs text-gray-400">Net Movement</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${net >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {net >= 0 ? '+' : '-'}৳{Math.abs(net).toLocaleString()}
                  </p>
                  <div className="w-24 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                    <div 
                      className={`h-full ${net >= 0 ? 'bg-emerald-400' : 'bg-rose-400'}`} 
                      style={{ width: `${Math.min(100, (Math.abs(net) / 5000) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="p-4 safe-area-bottom">
        <button 
          onClick={onBack}
          className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl hover:bg-black transition-all"
        >
          Close Reports
        </button>
      </footer>
    </div>
  );
};

export default DetailsView;
