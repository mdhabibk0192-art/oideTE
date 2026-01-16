
import React from 'react';
import { LoginMethod } from '../types';

interface LoginPopupProps {
  onLogin: (method: LoginMethod) => void;
}

const LoginPopup: React.FC<LoginPopupProps> = ({ onLogin }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-8 shadow-2xl transform transition-all animate-in slide-in-from-bottom-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
          <p className="text-gray-500 text-sm mt-1">Select a method to log in</p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={() => onLogin(LoginMethod.GMAIL)}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 py-3 rounded-xl hover:bg-gray-50 transition-all font-medium text-gray-700 shadow-sm"
          >
            <img src="https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png" alt="Google" className="w-5 h-5" />
            Continue with Gmail
          </button>
          
          <button 
            onClick={() => onLogin(LoginMethod.EMAIL)}
            className="w-full flex items-center justify-center gap-3 bg-indigo-600 py-3 rounded-xl hover:bg-indigo-700 transition-all font-semibold text-white shadow-lg shadow-indigo-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Continue with Email
          </button>

          <button 
            onClick={() => onLogin(LoginMethod.PHONE)}
            className="w-full flex items-center justify-center gap-3 bg-emerald-600 py-3 rounded-xl hover:bg-emerald-700 transition-all font-semibold text-white shadow-lg shadow-emerald-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Phone Number
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPopup;
