
import React from 'react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onViewDetails: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onViewDetails }) => {
  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div 
        className={`fixed left-0 top-0 h-full w-72 bg-white dark:bg-gray-900 z-[101] shadow-2xl transition-transform duration-300 ease-out transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-8">
          <div className="mb-10">
            <h2 className="text-2xl font-black text-indigo-600 dark:text-indigo-400">Expense App</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mt-1">Version 1.2.0</p>
          </div>

          <nav className="space-y-4">
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
              onClick={onClose}
              className="w-full flex items-center gap-4 p-4 rounded-2xl text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </button>
          </nav>
        </div>
        
        <div className="absolute bottom-8 left-8 right-8 text-gray-300 dark:text-gray-700 text-xs font-bold uppercase tracking-widest text-center">
          © 2025 Daily Report
        </div>
      </div>
    </>
  );
};

export default Sidebar;
