import React from 'react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onViewDetails: () => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onViewDetails, onLogout }) => {
  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div 
        className={`fixed left-0 top-0 h-full w-72 bg-white dark:bg-gray-900 z-[101] shadow-2xl transition-transform duration-300 ease-out transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-8 flex flex-col h-full">
          <div className="mb-10">
            <h2 className="text-2xl font-black text-indigo-600 dark:text-indigo-400">Expense App</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-1">Version 2.2.0 (Native)</p>
          </div>

          <nav className="space-y-4 flex-1">
            <button 
              onClick={onViewDetails}
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold transition-all hover:scale-105 active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Details Report
            </button>

            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-4 p-4 rounded-2xl text-rose-600 font-bold hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </nav>
          
          <div className="text-gray-300 dark:text-gray-700 text-[10px] font-black uppercase tracking-widest text-center mt-auto">
            © 2025 Ledger Pro Native
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;