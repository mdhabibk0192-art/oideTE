import React, { useState, useEffect } from 'react';
import { AppState, Transaction, TransactionType } from './types';
import Dashboard from './components/Dashboard';
import IncomePrompt from './components/IncomePrompt';
import DetailsView from './components/DetailsView';
import Sidebar from './components/Sidebar';
import SettingsModal from './components/SettingsModal';
import LoginPopup from './components/LoginPopup';

const LOCAL_STORAGE_KEY = 'ledger_local_v3';

declare global {
  interface Window {
    Android?: {
      loginWithGoogle: () => void;
      loginWithEmail: (email: string, pass: string) => void;
      saveTransaction: (json: string) => void;
      logout: () => void;
      checkAuth: () => void;
    };
    onAuthSuccess?: (user: string) => void;
    onAuthError?: (error: string) => void;
    onLogout?: () => void;
  }
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'home' | 'report'>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    const today = new Date().toISOString().split('T')[0];
    
    if (saved) {
      try {
        const parsed: AppState = JSON.parse(saved);
        if (parsed.lastActiveDate !== today) {
          return { ...parsed, hasSetDailyIncome: false, currentDailyIncome: 0, lastActiveDate: today };
        }
        return parsed;
      } catch (e) { console.error("Storage Error"); }
    }
    return { isLoggedIn: false, hasSetDailyIncome: false, currentDailyIncome: 0, transactions: [], lastActiveDate: today };
  });

  useEffect(() => {
    // 1. Setup global callbacks for Native to Web communication
    window.onAuthSuccess = (user) => {
      setState(prev => ({ ...prev, isLoggedIn: true }));
      setIsAuthChecking(false);
    };

    window.onAuthError = (err) => {
      alert("Auth Error: " + err);
      setIsAuthChecking(false);
    };

    window.onLogout = () => {
      setState(prev => ({ ...prev, isLoggedIn: false }));
      setIsAuthChecking(false);
    };

    // 2. Poll for Android Bridge
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (window.Android) {
        clearInterval(interval);
        window.Android.checkAuth();
      } else if (attempts > 10) {
        // After 5 seconds, fallback to web if not found
        clearInterval(interval);
        console.warn("Android Bridge not found. Running in web mode.");
        setIsAuthChecking(false);
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const addTransaction = (type: TransactionType, amount: number, note?: string, personName?: string) => {
    const newTransaction: Transaction = { 
      id: crypto.randomUUID(), 
      date: new Date().toISOString(), 
      type, 
      amount, 
      note, 
      personName 
    };
    
    if (window.Android) {
      window.Android.saveTransaction(JSON.stringify(newTransaction));
    }

    setState(prev => ({ ...prev, transactions: [...prev.transactions, newTransaction] }));
  };

  const handleLogout = () => {
    if (window.Android) window.Android.logout();
    setIsSidebarOpen(false);
  };

  if (isAuthChecking) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0f172a]">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-black animate-pulse uppercase tracking-widest text-[10px]">Securely Loading...</p>
      </div>
    );
  }

  if (!state.isLoggedIn) return <LoginPopup />;

  if (!state.hasSetDailyIncome) return (
    <IncomePrompt 
      onConfirm={(amt) => setState(prev => ({ 
        ...prev, 
        hasSetDailyIncome: true, 
        currentDailyIncome: amt, 
        transactions: [...prev.transactions, { 
          id: crypto.randomUUID(), 
          date: new Date().toISOString(), 
          type: 'INCOME', 
          amount: amt, 
          note: 'দিনের শুরু' 
        }] 
      }))} 
      isUpdate={state.currentDailyIncome > 0} 
    />
  );

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-[#0f172a] transition-colors duration-500 overflow-hidden select-none">
      <header className="safe-area-top glass-bar border-b border-slate-200/60 dark:border-slate-800/60 z-50">
        <div className="px-5 h-16 flex justify-between items-center">
          <button onClick={() => setIsSidebarOpen(true)} className="w-10 h-10 flex items-center justify-center active:bg-slate-200 dark:active:bg-slate-800 rounded-full transition-all">
            <svg className="w-6 h-6 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </button>
          
          <div className="flex flex-col items-center">
            <h1 className="text-[11px] font-black tracking-[0.25em] text-indigo-600 dark:text-indigo-400 uppercase">Ledger Pro</h1>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Connected</p>
            </div>
          </div>

          <button onClick={() => setIsSettingsOpen(true)} className="w-10 h-10 flex items-center justify-center active:bg-slate-200 dark:active:bg-slate-800 rounded-full transition-all">
            <svg className="w-6 h-6 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-32 scroll-smooth">
        <div className={`transition-all duration-300 ${activeTab === 'home' ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-95 -translate-x-full absolute pointer-events-none'}`}>
          <div className="px-4 pt-5">
            <Dashboard 
              transactions={state.transactions} 
              currentIncome={state.currentDailyIncome} 
              onUpdateIncome={() => setState(prev => ({ ...prev, hasSetDailyIncome: false }))} 
              onAddTransaction={addTransaction} 
            />
          </div>
        </div>
        <div className={`transition-all duration-300 ${activeTab === 'report' ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-95 translate-x-full absolute pointer-events-none'}`}>
          <DetailsView transactions={state.transactions} onBack={() => setActiveTab('home')} />
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 glass-bar border-t border-slate-200/60 dark:border-slate-800/60 safe-area-bottom z-[60] shadow-[0_-1px_15px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-20 px-2">
          <button onClick={() => setActiveTab('home')} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-center group">
            <div className={`px-7 py-1.5 rounded-full transition-all duration-300 ${activeTab === 'home' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400'}`}>
              <svg className="w-6 h-6" fill={activeTab === 'home' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest ${activeTab === 'home' ? 'text-indigo-600' : 'text-slate-400'}`}>Home</span>
          </button>
          
          <button onClick={() => setActiveTab('report')} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-center group">
            <div className={`px-7 py-1.5 rounded-full transition-all duration-300 ${activeTab === 'report' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400'}`}>
              <svg className="w-6 h-6" fill={activeTab === 'report' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest ${activeTab === 'report' ? 'text-indigo-600' : 'text-slate-400'}`}>Insights</span>
          </button>
        </div>
      </nav>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onViewDetails={() => setActiveTab('report')} onLogout={handleLogout} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} isDarkMode={isDarkMode} onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} />
    </div>
  );
};

export default App;