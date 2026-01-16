
import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType } from '../types';

interface DashboardProps {
  transactions: Transaction[];
  currentIncome: number;
  onUpdateIncome: () => void;
  onAddTransaction: (type: TransactionType, amount: number, note?: string, personName?: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  transactions, 
  currentIncome, 
  onUpdateIncome, 
  onAddTransaction 
}) => {
  const [modalType, setModalType] = useState<TransactionType | null>(null);
  const [amountInput, setAmountInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [personInput, setPersonInput] = useState('');
  const [isRepayMode, setIsRepayMode] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTransactions = useMemo(() => 
    transactions.filter(t => t.date.startsWith(todayStr)), 
    [transactions, todayStr]
  );

  const totals = useMemo(() => {
    return todayTransactions.reduce((acc, t) => {
      if (t.type === 'INCOME') acc.income += t.amount;
      if (t.type === 'EXPENSE') acc.expense += t.amount;
      if (t.type === 'BILL') acc.bill += t.amount;
      if (t.type === 'DEBT') acc.debt += t.amount;
      return acc;
    }, { income: 0, expense: 0, bill: 0, debt: 0 });
  }, [todayTransactions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amountInput);
    if (!isNaN(val) && modalType) {
      const finalAmount = isRepayMode ? -val : val;
      onAddTransaction(modalType, finalAmount, noteInput, personInput);
      setModalType(null);
      setAmountInput('');
      setNoteInput('');
      setPersonInput('');
      setIsRepayMode(false);
    }
  };

  const Card = ({ title, value, colorClass, onClick, type }: { title: string, value: number, colorClass: string, onClick?: () => void, type?: TransactionType }) => (
    <div 
      onClick={onClick}
      className={`${colorClass} p-5 rounded-[2rem] shadow-xl cursor-pointer transition-all active:scale-95 group relative overflow-hidden border border-white/20`}
    >
      <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full group-hover:scale-125 transition-transform" />
      <h3 className="text-xs font-bold uppercase tracking-wider opacity-90 mb-1">{title}</h3>
      <p className="text-2xl font-extrabold tracking-tight">৳{Math.abs(value).toLocaleString()}</p>
      {type === 'DEBT' && (
        <div className="mt-4 flex gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); setIsRepayMode(false); setModalType('DEBT'); }}
            className="flex-1 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-xl py-2 text-[10px] font-black uppercase tracking-tighter"
          >
            + Add
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsRepayMode(true); setModalType('DEBT'); }}
            className="flex-1 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-xl py-2 text-[10px] font-black uppercase tracking-tighter"
          >
            - Repay
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Card 
          title="Income" 
          value={totals.income} 
          colorClass="bg-gradient-to-br from-emerald-400 to-emerald-600 text-white" 
          onClick={onUpdateIncome} 
          type="INCOME"
        />
        <Card 
          title="Expense" 
          value={totals.expense} 
          colorClass="bg-gradient-to-br from-rose-400 to-rose-600 text-white" 
          onClick={() => setModalType('EXPENSE')} 
          type="EXPENSE"
        />
        <Card 
          title="Bills" 
          value={totals.bill} 
          colorClass="bg-gradient-to-br from-sky-400 to-sky-600 text-white" 
          onClick={() => setModalType('BILL')} 
          type="BILL"
        />
        <Card 
          title="Debt" 
          value={totals.debt} 
          colorClass="bg-gradient-to-br from-amber-400 to-amber-600 text-white" 
          type="DEBT"
        />
      </div>

      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-[2rem] p-6 shadow-2xl border border-white/20 dark:border-gray-700/50">
        <h2 className="text-lg font-black text-gray-900 dark:text-white mb-5 flex items-center gap-2">
          <span className="w-2 h-6 bg-indigo-600 rounded-full"></span>
          Today's Feed
        </h2>
        <div className="space-y-5">
          {todayTransactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-400 dark:text-gray-500 font-medium">No activity recorded yet</p>
            </div>
          ) : (
            todayTransactions.map(t => (
              <div key={t.id} className="flex justify-between items-center group animate-in slide-in-from-bottom-2">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${
                    t.type === 'INCOME' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' :
                    t.type === 'EXPENSE' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600' :
                    t.type === 'BILL' ? 'bg-sky-100 dark:bg-sky-900/30 text-sky-600' :
                    'bg-amber-100 dark:bg-amber-900/30 text-amber-600'
                  }`}>
                    <span className="font-black text-sm">{t.type[0]}</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 dark:text-gray-200">
                      {t.type === 'DEBT' ? (t.amount > 0 ? `Barrowed: ${t.personName}` : `Repaid: ${t.personName}`) : t.note || t.type}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">
                      {new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-black text-lg ${t.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {t.amount >= 0 ? '+' : '-'}৳{Math.abs(t.amount).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {modalType && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-lg flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 border border-white/10">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6">
              {isRepayMode ? 'Repay Debt' : `Add ${modalType.charAt(0) + modalType.slice(1).toLowerCase()}`}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-gray-400">৳</span>
                <input 
                  type="number" 
                  placeholder="0.00"
                  autoFocus
                  required
                  value={amountInput}
                  onChange={e => setAmountInput(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-5 pl-10 pr-5 text-xl font-black focus:ring-4 focus:ring-indigo-500/20 dark:text-white transition-all"
                />
              </div>
              {modalType === 'DEBT' && (
                <input 
                  type="text" 
                  placeholder="Person's Name"
                  required
                  value={personInput}
                  onChange={e => setPersonInput(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-5 px-5 font-bold focus:ring-4 focus:ring-indigo-500/20 dark:text-white transition-all"
                />
              )}
              <input 
                type="text" 
                placeholder="Details / Note"
                value={noteInput}
                onChange={e => setNoteInput(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-5 px-5 font-bold focus:ring-4 focus:ring-indigo-500/20 dark:text-white transition-all"
              />
              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setModalType(null)}
                  className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-black py-5 rounded-2xl transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-500/40 transition-all active:scale-95 hover:bg-indigo-700"
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
