
import React from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, isDarkMode, onToggleDarkMode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in">
      <div className="bg-white dark:bg-gray-900 w-full max-w-xs rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 border border-white/10">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-black text-gray-900 dark:text-white">Settings</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-800 dark:text-gray-200">Appearance</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{isDarkMode ? 'Dark Mode' : 'Light Mode'}</p>
            </div>
            <button 
              onClick={onToggleDarkMode}
              className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 flex items-center ${isDarkMode ? 'bg-indigo-600' : 'bg-gray-200'}`}
            >
              <div className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 ${isDarkMode ? 'translate-x-6' : 'translate-x-0'} flex items-center justify-center`}>
                {isDarkMode ? (
                  <svg className="w-3 h-3 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </button>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <button 
              onClick={onClose}
              className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black py-4 rounded-2xl transition-all active:scale-95"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
