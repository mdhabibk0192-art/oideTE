
import React, { useState } from 'react';

interface IncomePromptProps {
  onConfirm: (amount: number) => void;
  isUpdate?: boolean;
}

const IncomePrompt: React.FC<IncomePromptProps> = ({ onConfirm, isUpdate }) => {
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!isNaN(val) && val >= 0) {
      onConfirm(val);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-indigo-600 flex items-center justify-center p-6">
      <div className="w-full max-w-sm text-white animate-in zoom-in-95 duration-300">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome!</h1>
          <p className="text-indigo-100 opacity-80">
            {isUpdate ? "Update your income for today" : "What is your income today?"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl font-bold opacity-50">৳</span>
            <input 
              type="number" 
              autoFocus
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-white/10 border-2 border-white/20 rounded-2xl py-6 pl-12 pr-4 text-4xl font-bold focus:outline-none focus:border-white transition-all text-white placeholder-white/30"
            />
          </div>

          <button 
            type="submit"
            disabled={!amount}
            className="w-full bg-white text-indigo-600 py-4 rounded-2xl font-bold text-lg shadow-xl hover:bg-gray-100 transition-all active:scale-95 disabled:opacity-50"
          >
            {isUpdate ? 'Update Income' : 'Start Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default IncomePrompt;
