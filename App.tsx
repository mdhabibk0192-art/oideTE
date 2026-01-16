
import React, { useState, useEffect } from 'react';
import { AppState, Transaction, TransactionType, LoginMethod } from './types';
import Dashboard from './components/Dashboard';
import LoginPopup from './components/LoginPopup';
import IncomePrompt from './components/IncomePrompt';
import DetailsView from './components/DetailsView';
import Sidebar from './components/Sidebar';
import SettingsModal from './components/SettingsModal';

const LOCAL_STORAGE_KEY = 'daily_expense_app_data';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    const today = new Date().toISOString().split('T')[0];
    
    if (saved) {
      const parsed: AppState = JSON.parse(saved);
      // Midnight Reset Logic: Check if the last active date is different from today
      if (parsed.lastActiveDate !== today) {
        return {
          ...parsed,
          hasSetDailyIncome: false,
          currentDailyIncome: 0, // Reset display income for the new day
          lastActiveDate: today
        };
      }
      return parsed;
    }

    return {
      isLoggedIn: false,
      hasSetDailyIncome: false,
      currentDailyIncome: 0,
      transactions: [],
      lastActiveDate: today
    };
  });

  const [showDetails, setShowDetails] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Periodically check for date change while app is open (e.g., crossing midnight)
  useEffect(() => {
    const interval = setInterval(() => {
      const today = new Date().toISOString().split('T')[0];
      if (state.lastActiveDate !== today) {
        setState(prev => ({
          ...prev,
          hasSetDailyIncome: false,
          currentDailyIncome: 0,
          lastActiveDate: today
        }));
      }
    }, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [state.lastActiveDate]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleLogin = (method: LoginMethod) => {
    setState(prev => ({ ...prev, isLoggedIn: true }));
  };

  const handleSetIncome = (amount: number) => {
    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      type: 'INCOME',
      amount: amount,
      note: 'Daily Income Entry'
    };

    setState(prev => ({
      ...prev,
      hasSetDailyIncome: true,
      currentDailyIncome: amount,
      transactions: [...prev.transactions, newTransaction]
    }));
  };

  const addTransaction = (type: TransactionType, amount: number, note?: string, personName?: string) => {
    const newTransaction: Transaction = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      type,
      amount,
      note,
      personName
    };
    setState(prev => ({
      ...prev,
      transactions: [...prev.transactions, newTransaction]
    }));
  };

  const updateIncomeDynamically = () => {
    setState(prev => ({ ...prev, hasSetDailyIncome: false }));
  };

  if (!state.isLoggedIn) {
    return <LoginPopup onLogin={handleLogin} />;
  }

  if (!state.hasSetDailyIncome) {
    return <IncomePrompt onConfirm={handleSetIncome} isUpdate={state.currentDailyIncome > 0} />;
  }

  if (showDetails) {
    return <DetailsView transactions={state.transactions} onBack={() => setShowDetails(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 max-w-md mx-auto relative overflow-hidden flex flex-col transition-colors duration-300">
      <header className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white p-4 flex justify-between items-center shadow-md z-30">
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-xl font-bold tracking-tight">Expense Report</h1>
        <button onClick={() => setIsSettingsOpen(true)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </header>

      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onViewDetails={() => { setShowDetails(true); setIsSidebarOpen(false); }}
      />

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      <main className="flex-1 overflow-y-auto rgb-gradient relative">
        <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-[2px] pointer-events-none"></div>
        <div className="relative z-10 p-4 space-y-4">
          <Dashboard 
            transactions={state.transactions} 
            currentIncome={state.currentDailyIncome}
            onUpdateIncome={updateIncomeDynamically}
            onAddTransaction={addTransaction}
          />
        </div>
      </main>

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 text-center text-xs text-gray-400 safe-area-bottom z-20 transition-colors">
        Bangladeshi Taka (৳) Dashboard
      </footer>
    </div>
  );
};

export default App;
