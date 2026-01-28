
import React, { useMemo, useState } from 'react';
import { Transaction } from '../types';
import { getFinancialAdvice } from './geminiService';

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
        if (t.type === 'INCOME') groups[key] += t.amount;
        else if (t.type === 'EXPENSE' || t.type === 'BILL') groups[key] -= t.amount;
      }
    });

    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [transactions]);

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 max-w-md mx-auto flex flex-col animate-in slide-in-from-right duration-300">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 p-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-600 dark:text-gray-300">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1 className="text-xl font-black text-gray-800 dark:text-white tracking-tight">Report Insights</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-5 space-y-8">
        <section className="bg-indigo-600 rounded-[2.5rem] p-7 relative overflow-hidden shadow-xl shadow-indigo-500/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
          <div className="relative z-10">
            <h3 className="text-white font-black text-xl mb-1">AI Financial Coach</h3>
            <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest opacity-80 mb-6">Powered by Gemini</p>
            
            {advice ? (
              <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl text-white text-sm font-medium leading-relaxed mb-4 border border-white/10">
                {advice}
              </div>
            ) : null}

            <button 
              onClick={handleFetchAdvice}
              disabled={loadingAdvice}
              className="w-full bg-white text-indigo-600 py-4 rounded-2xl text-sm font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all disabled:opacity-50"
            >
              {loadingAdvice ? 'Analyzing Data...' : 'Get New Insight'}
            </button>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] px-2">Annual Summary</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Income', val: yearlySummary.income, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
              { label: 'Expenses', val: yearlySummary.expense, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' },
              { label: 'Bills', val: yearlySummary.bill, color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-900/20' },
              { label: 'Debt', val: yearlySummary.debt, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
            ].map((item, idx) => (
              <div key={idx} className={`${item.bg} p-6 rounded-[2rem] border border-black/5 dark:border-white/5`}>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2">{item.label}</p>
                <p className={`text-xl font-black ${item.color}`}>৳{item.val.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4 pb-10">
          <h2 className="text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] px-2">Daily Trend (10 Days)</h2>
          <div className="space-y-3">
            {last10Days.map(([date, net]) => (
              <div key={date} className="flex justify-between items-center p-5 bg-white dark:bg-gray-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700/50">
                <div>
                  <p className="font-black text-gray-800 dark:text-gray-200">
                    {new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric', weekday: 'short' })}
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">Net Cash Flow</p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-black ${net >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {net >= 0 ? '+' : '-'}৳{Math.abs(net).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="p-6 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 safe-area-bottom">
        <button 
          onClick={onBack}
          className="w-full bg-gray-900 dark:bg-indigo-600 text-white font-black py-5 rounded-2xl active:scale-95 transition-all shadow-xl shadow-indigo-500/10"
        >
          BACK TO DASHBOARD
        </button>
      </footer>
    </div>
  );
};

export default DetailsView;
