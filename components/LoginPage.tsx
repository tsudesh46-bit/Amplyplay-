
import React, { useState } from 'react';
import { Page } from '../types';
import { UserIcon, LogoIcon } from './ui/Icons';

interface LoginPageProps {
  setCurrentPage: (page: Page) => void;
  startDemoSession?: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ setCurrentPage, startDemoSession }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage('home');
  };

  const handleDemoStart = () => {
    if (startDemoSession) {
      startDemoSession();
    }
    setCurrentPage('home');
  };

  return (
    <div className="min-h-screen bg-[#eef2f8] flex flex-col font-sans">
      {/* Top Navbar */}
      <nav className="w-full h-20 bg-[#0a1128] flex items-center justify-between px-6 sm:px-10 shrink-0 border-b border-white/5">
        <div className="flex items-center gap-6">
          <div className="text-white font-black text-xl tracking-tighter uppercase flex items-center gap-3">
            <div className="bg-cyan-500 text-[#0a1128] w-8 h-8 flex items-center justify-center rounded-lg text-lg">A</div>
            <span>AMBLYOPLAY</span>
          </div>
          <div className="h-8 w-px bg-white/20 hidden sm:block"></div>
          <div className="text-white/80 font-black text-xl tracking-tighter uppercase flex items-center gap-3 hidden sm:flex">
            <div className="bg-indigo-500 text-[#0a1128] w-8 h-8 flex items-center justify-center rounded-lg text-lg font-bold">S</div>
            <span>STRABPLAY</span>
          </div>
        </div>
        <div className="flex items-center gap-6 text-slate-300 text-sm font-medium">
          <button className="hover:text-white transition-colors">Support</button>
          <div className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors">
            English
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
          </div>
        </div>
      </nav>

      <div className="flex-grow flex flex-col items-center justify-center p-4 py-12">
        <h2 className="text-[#0a1128] text-xl sm:text-3xl font-black uppercase tracking-[0.2em] mb-12 text-center drop-shadow-sm">
          From Brain Science to Full Vision
        </h2>

        <div className="w-full max-w-lg space-y-8">
          {/* Login Card */}
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 sm:p-12 border-2 border-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
            
            <div className="flex flex-col items-center mb-10 relative z-10">
              <div className="w-16 h-16 bg-cyan-100/50 rounded-2xl flex items-center justify-center text-cyan-600 mb-4 shadow-inner border border-cyan-100">
                <UserIcon className="w-9 h-9" />
              </div>
              <h1 className="text-3xl font-black text-[#0a1128] tracking-tight">User Login</h1>
            </div>

            <form onSubmit={handleLogin} className="space-y-5 relative z-10">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-5 bg-[#f3f7fb] rounded-2xl text-[#0a1128] border-2 border-transparent focus:border-cyan-400 outline-none transition-all placeholder:text-slate-400 font-medium"
                />
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-5 bg-[#f3f7fb] rounded-2xl text-[#0a1128] border-2 border-transparent focus:border-cyan-400 outline-none transition-all placeholder:text-slate-400 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-500 p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.882 9.882L5.146 5.147m13.71 13.71l-3.08-3.08M19.07 4.93a10 10 0 011.388 4.416c0 4.057-3.79 7-8.268 7a9.957 9.957 0 01-2.138-.228" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    )}
                  </svg>
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-500 to-cyan-700 hover:from-cyan-400 hover:to-cyan-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-cyan-500/30 active:scale-[0.98] transition-all mt-6 text-xl tracking-wide uppercase"
              >
                Enter Portal
              </button>

              <div className="text-center mt-6">
                <button type="button" className="text-slate-400 hover:text-cyan-600 text-sm font-bold transition-colors uppercase tracking-widest">
                  Reset Password
                </button>
              </div>
            </form>
          </div>

          {/* Enhanced Free Demo Card */}
          <div className="bg-gradient-to-br from-indigo-50 to-white rounded-[2.5rem] shadow-2xl p-8 sm:p-12 border-4 border-indigo-200 text-center relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl"></div>
            
            <div className="flex flex-col items-center mb-8 relative z-10">
              <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-3xl flex items-center justify-center text-white mb-5 shadow-2xl shadow-indigo-500/40 transform rotate-3">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-black text-[#0a1128] tracking-tight">Experience Demo</h2>
              <div className="mt-2 h-1.5 w-16 bg-indigo-400 rounded-full mx-auto"></div>
            </div>

            {/* Vibrant Colorful Pattern replacing Black Box */}
            <div className="flex justify-center mb-10 relative z-10">
              <div className="grid grid-cols-3 gap-3 p-4 bg-white/40 backdrop-blur-md rounded-[2rem] border-2 border-indigo-100 shadow-lg">
                {[...Array(9)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-4 h-4 rounded-full shadow-sm animate-pulse`} 
                    style={{ 
                      backgroundColor: `hsl(${(i * 40) + 180}, 85%, 60%)`,
                      animationDelay: `${i * 100}ms`
                    }}
                  ></div>
                ))}
              </div>
            </div>

            <button
              onClick={handleDemoStart}
              className="w-full bg-[#0a1128] text-white hover:bg-indigo-900 font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-4 active:scale-[0.98] shadow-2xl shadow-indigo-500/20 text-xl border-b-4 border-indigo-700"
            >
              <svg className="w-7 h-7 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
              </svg>
              <span>FREE 30 MIN DEMO</span>
            </button>
            <p className="mt-4 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Session ends automatically after 30m</p>
          </div>
        </div>
      </div>

      {/* Floating Support Button */}
      <div className="fixed bottom-8 right-8 flex flex-col items-end gap-3 group">
        <div className="bg-white px-5 py-3 rounded-2xl shadow-2xl border-2 border-slate-50 opacity-0 group-hover:opacity-100 transition-all mb-2 translate-y-2 group-hover:translate-y-0">
           <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Octo • Online</div>
           <div className="text-sm font-bold text-slate-800">Welcome to Vision Therapy. Ask us anything!</div>
        </div>
        <button className="bg-white px-7 py-4 rounded-full shadow-2xl flex items-center gap-4 border-2 border-white hover:scale-105 active:scale-95 transition-all group/btn">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-indigo-100 group-hover/btn:border-indigo-400 transition-colors">
             <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Support" />
          </div>
          <span className="font-black text-[#0a1128] text-lg">Need help?</span>
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
