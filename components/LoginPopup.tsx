import React, { useState } from 'react';

const LoginPopup: React.FC = () => {
  const [method, setMethod] = useState<'CHOICE' | 'EMAIL'>('CHOICE');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogle = () => {
    // Safety check for bridge
    const bridge = window.Android;
    if (bridge && typeof bridge.loginWithGoogle === 'function') {
      setIsLoading(true);
      bridge.loginWithGoogle();
      setTimeout(() => setIsLoading(false), 15000);
    } else {
      alert("Native bridge initialization pending. Please wait or restart the app.");
    }
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const bridge = window.Android;
    if (bridge && typeof bridge.loginWithEmail === 'function') {
      if (!email || !password) return alert("ইমেইল এবং পাসওয়ার্ড দিন");
      setIsLoading(true);
      bridge.loginWithEmail(email, password);
      setTimeout(() => setIsLoading(false), 15000);
    } else {
      alert("Native bridge initialization pending.");
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-white dark:bg-[#0f172a] flex flex-col p-8 safe-area-top overflow-y-auto">
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full py-10">
        <div className="mb-12 text-center">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl shadow-indigo-600/30">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">Ledger Pro</h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px]">Secure Financial Ledger</p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center py-10">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-600 dark:text-slate-300 font-bold">Authenticating...</p>
          </div>
        ) : method === 'CHOICE' ? (
          <div className="space-y-4">
            <button 
              onClick={handleGoogle}
              className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-200 py-4 rounded-2xl font-black flex items-center justify-center gap-4 active:scale-95 transition-all shadow-sm"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
              Google-এ লগইন করুন
            </button>
            
            <button 
              onClick={() => setMethod('EMAIL')}
              className="w-full bg-slate-900 dark:bg-indigo-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-4 active:scale-95 transition-all shadow-xl shadow-indigo-500/20"
            >
              Email দিয়ে লগইন করুন
            </button>

            <p className="text-center text-[10px] text-slate-400 mt-8 font-bold uppercase tracking-widest px-8 leading-relaxed">
              Native Firebase Protection Enabled
            </p>
          </div>
        ) : (
          <form onSubmit={handleEmailLogin} className="space-y-4 animate-in slide-in-from-right duration-300">
            <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Email</label>
                <input 
                  type="email" 
                  placeholder="name@example.com" 
                  className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl py-5 px-6 font-bold dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
            </div>
            <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl py-5 px-6 font-bold dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
            </div>
            
            <button 
              type="submit"
              className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black shadow-xl active:scale-95 transition-all mt-4"
            >
              লগইন / সাইনআপ
            </button>
            <button 
              type="button"
              onClick={() => setMethod('CHOICE')}
              className="w-full text-slate-400 font-bold text-sm py-2"
            >
              পিছনে ফিরে যান
            </button>
          </form>
        )}
      </div>
      
      <div className="mt-auto text-center pb-8 safe-area-bottom">
        <p className="text-[10px] text-slate-300 dark:text-slate-700 font-black tracking-[0.3em] uppercase">Powered by Firebase Native Bridge</p>
      </div>
    </div>
  );
};

export default LoginPopup;