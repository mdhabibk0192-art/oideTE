
import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType } from '../types';

interface DashboardProps {
  transactions: Transaction[];
  currentIncome: number;
  onUpdateIncome: () => void;
  onAddTransaction: (type: TransactionType, amount: number, note?: string, personName?: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, currentIncome, onUpdateIncome, onAddTransaction }) => {
  const [modalType, setModalType] = useState<TransactionType | null>(null);
  const [amountInput, setAmountInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [personInput, setPersonInput] = useState('');
  const [isRepayMode, setIsRepayMode] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTransactions = useMemo(() => transactions.filter(t => t.date.startsWith(todayStr)), [transactions, todayStr]);
  const mainBalance = useMemo(() => transactions.reduce((sum, t) => sum + t.amount, 0), [transactions]);

  const totals = useMemo(() => {
    return todayTransactions.reduce((acc, t) => {
      if (t.type === 'INCOME') acc.income += t.amount;
      else if (t.type === 'EXPENSE') acc.expense += t.amount;
      else if (t.type === 'BILL') acc.bill += t.amount;
      else if (t.type === 'DEBT') acc.debt += t.amount;
      return acc;
    }, { income: 0, expense: 0, bill: 0, debt: 0 });
  }, [todayTransactions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amountInput);
    if (!isNaN(val) && modalType) {
      const finalAmount = (modalType === 'EXPENSE' || modalType === 'BILL' || (modalType === 'DEBT' && isRepayMode)) ? -val : val;
      onAddTransaction(modalType, finalAmount, noteInput, personInput);
      setModalType(null); setAmountInput(''); setNoteInput(''); setPersonInput(''); setIsRepayMode(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Massive Balance Card - Centerpiece of the Home Screen */}
      <section className="bg-white dark:bg-slate-900 rounded-5xl p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all">
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500 mb-2">Available Balance</span>
          <h2 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white mb-8">
            <span className="text-2xl mr-1 text-slate-300">৳</span>
            {mainBalance.toLocaleString()}
          </h2>
          
          <div className="grid grid-cols-2 gap-4 w-full">
             <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-3xl border border-emerald-100/50 dark:border-emerald-800/30">
                <p className="text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400 mb-1">Today's In</p>
                <p className="text-xl font-black text-emerald-700 dark:text-emerald-400">৳{totals.income.toLocaleString()}</p>
             </div>
             <div className="bg-rose-50 dark:bg-rose-950/30 p-4 rounded-3xl border border-rose-100/50 dark:border-rose-800/30">
                <p className="text-[9px] font-black uppercase text-rose-600 dark:text-rose-400 mb-1">Today's Out</p>
                <p className="text-xl font-black text-rose-700 dark:text-rose-400">৳{(Math.abs(totals.expense) + Math.abs(totals.bill)).toLocaleString()}</p>
             </div>
          </div>
        </div>
      </section>

      {/* Large Grid Action Menu - Ergonomic button sizes */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { id: 'INCOME' as TransactionType, label: 'Income', icon: '💰', color: 'bg-emerald-500' },
          { id: 'EXPENSE' as TransactionType, label: 'Expense', icon: '💸', color: 'bg-rose-500' },
          { id: 'BILL' as TransactionType, label: 'Bill Pay', icon: '📑', color: 'bg-sky-500' },
          { id: 'DEBT' as TransactionType, label: 'Debt/Loan', icon: '🤝', color: 'bg-amber-500' }
        ].map(item => (
          <button 
            key={item.id}
            onClick={() => { setModalType(item.id); setIsRepayMode(false); }}
            className="bg-white dark:bg-slate-900 p-7 rounded-4xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center gap-4 active:scale-95 transition-all hover:bg-slate-50 dark:hover:bg-slate-800 h-40 justify-center"
          >
            <div className={`w-16 h-16 ${item.color} rounded-3xl flex items-center justify-center text-3xl shadow-lg shadow-${item.color.split('-')[1]}-500/30 text-white`}>
              {item.icon}
            </div>
            <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Recent Timeline - Clean and wide list items */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Timeline</h3>
          <button onClick={onUpdateIncome} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-2 rounded-full active:scale-95 transition-all">Update Daily</button>
        </div>
        
        <div className="space-y-3">
          {todayTransactions.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-4xl border border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-xs font-bold text-slate-400">No activity logged today</p>
            </div>
          ) : (
            todayTransactions.slice().reverse().map(t => (
              <div key={t.id} className="bg-white dark:bg-slate-900 p-5 rounded-4xl border border-slate-50 dark:border-slate-800 flex justify-between items-center shadow-sm active:bg-slate-50 dark:active:bg-slate-800 transition-all">
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-3xl flex items-center justify-center text-2xl ${
                    t.type === 'INCOME' ? 'bg-emerald-100 text-emerald-600' :
                    t.type === 'EXPENSE' ? 'bg-rose-100 text-rose-600' :
                    t.type === 'BILL' ? 'bg-sky-100 text-sky-600' : 'bg-amber-100 text-amber-600'
                  }`}>
                    {t.type === 'INCOME' ? '↓' : '↑'}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800 dark:text-slate-100 leading-tight">
                      {t.type === 'DEBT' ? `${t.amount > 0 ? 'হাওলাত:' : 'পরিশোধ:'} ${t.personName}` : t.note || t.type}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1">
                      {new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <p className={`text-lg font-black ${t.amount >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {t.amount >= 0 ? '+' : '-'}৳{Math.abs(t.amount).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Transaction Bottom Sheet - Phone Ergonomic Modal */}
      {modalType && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-end justify-center animate-in fade-in duration-300">
          <div className="fixed inset-0" onClick={() => {setModalType(null); setIsRepayMode(false);}} />
          <div className="bg-white dark:bg-slate-950 w-full max-w-lg rounded-t-5xl p-8 pb-12 shadow-2xl z-10 animate-in slide-in-from-bottom-full duration-500 border-t border-white/10">
            <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-10"></div>
            
            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-8">
              {modalType === 'DEBT' ? (isRepayMode ? 'পরিশোধ' : 'হাওলাত') : `Add ${modalType}`}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-slate-300 text-3xl">৳</span>
                <input 
                  type="number" 
                  placeholder="0.00" 
                  autoFocus 
                  required 
                  value={amountInput}
                  onChange={e => setAmountInput(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-3xl py-8 pl-16 pr-8 text-5xl font-black focus:ring-4 focus:ring-indigo-500/10 dark:text-white transition-all tracking-tighter"
                />
              </div>

              {modalType === 'DEBT' && (
                <div className="space-y-4">
                  <input 
                    type="text" 
                    placeholder="ব্যক্তির নাম" 
                    required 
                    value={personInput}
                    onChange={e => setPersonInput(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-2xl py-5 px-6 font-bold dark:text-white text-base focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <div className="flex bg-slate-100 dark:bg-slate-900 p-2 rounded-2xl">
                    <button type="button" onClick={() => setIsRepayMode(false)} className={`flex-1 py-4 text-xs font-black uppercase rounded-xl transition-all ${!isRepayMode ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600' : 'opacity-40 text-slate-500'}`}>হাওলাত</button>
                    <button type="button" onClick={() => setIsRepayMode(true)} className={`flex-1 py-4 text-xs font-black uppercase rounded-xl transition-all ${isRepayMode ? 'bg-white dark:bg-slate-800 shadow-sm text-rose-600' : 'opacity-40 text-slate-500'}`}>পরিশোধ</button>
                  </div>
                </div>
              )}

              <input 
                type="text" 
                placeholder="বিবরণ (ঐচ্ছিক)" 
                value={noteInput}
                onChange={e => setNoteInput(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-2xl py-5 px-6 font-bold dark:text-white text-base focus:ring-2 focus:ring-indigo-500/20"
              />

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setModalType(null)} className="flex-1 bg-slate-100 dark:bg-slate-900 text-slate-500 font-black py-5 rounded-2xl active:scale-95 transition-all text-xs uppercase tracking-widest">বাতিল</button>
                <button type="submit" className="flex-[2] bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-500/30 active:scale-95 transition-all text-xs uppercase tracking-widest">নিশ্চিত করুন</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
