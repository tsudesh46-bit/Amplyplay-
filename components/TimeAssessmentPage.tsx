
import React, { useState, useMemo } from 'react';
import { Page, LevelStats } from '../types';
import { HomeIcon } from './ui/Icons';
import ConfirmationModal from './ConfirmationModal';

interface TimeAssessmentPageProps {
  setCurrentPage: (page: Page) => void;
  gameHistory: LevelStats[];
}

const TimeAssessmentPage: React.FC<TimeAssessmentPageProps> = ({ setCurrentPage, gameHistory }) => {
  const [isConfirmingExit, setIsConfirmingExit] = useState(false);
  
  // Default range: Last 7 days
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  const handleHomeClick = () => setIsConfirmingExit(true);
  const handleConfirmExit = () => setCurrentPage('home');

  const dateLimits = useMemo(() => {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return { startTs: start.getTime(), endTs: end.getTime() };
  }, [startDate, endDate]);

  // Logic: Filter and Group history by date within the chosen range
  const groupedData = useMemo(() => {
    const days: Record<string, LevelStats[]> = {};
    
    gameHistory.filter(h => h.timestamp >= dateLimits.startTs && h.timestamp <= dateLimits.endTs).forEach(session => {
        const dateKey = new Date(session.timestamp).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
        if (!days[dateKey]) days[dateKey] = [];
        days[dateKey].push(session);
    });

    // Sort days chronologically descending
    return Object.entries(days).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
  }, [gameHistory, dateLimits]);

  // Logic: Generate daily data points for every single day in the selected range
  const chartData = useMemo(() => {
    const data = [];
    const curr = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    while (curr <= end) {
        const dateStr = curr.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        
        const daySessions = gameHistory.filter(h => {
            const hDate = new Date(h.timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            return hDate === dateStr;
        });

        const totalMinutes = daySessions.reduce((acc, curr) => acc + (curr.duration || 0), 0) / 60;
        data.push({
            label: curr.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
            value: totalMinutes,
            fullDate: dateStr
        });
        
        curr.setDate(curr.getDate() + 1);
    }
    return data;
  }, [gameHistory, startDate, endDate]);

  const maxDuration = Math.max(...chartData.map(d => d.value), 1);

  const formatSeconds = (seconds: number = 0) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const dateInputStyle = "bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-black text-slate-700 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 transition-all";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 sm:p-8 font-sans pb-32">
      <header className="w-full max-w-6xl mx-auto mb-12 animate-fade-in-up">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase flex items-center gap-4">
                   <div className="bg-slate-900 p-2 rounded-xl">
                        <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                   </div>
                   Time Assessment
                </h1>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Cloud Sync Active • Medical Read-Only View
                </p>
            </div>
            
            <div className="flex flex-wrap items-center bg-white p-3 rounded-2xl shadow-sm border border-slate-100 gap-4">
                <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">From Date</span>
                    <input 
                        type="date" 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)} 
                        className={dateInputStyle}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">To Date</span>
                    <input 
                        type="date" 
                        value={endDate} 
                        onChange={(e) => setEndDate(e.target.value)} 
                        className={dateInputStyle}
                    />
                </div>
            </div>
        </div>
      </header>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Visual Analytics */}
        <div className="lg:col-span-1 space-y-8 animate-fade-in-up">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-white flex flex-col h-full relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-cyan-500 to-teal-400"></div>
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-8">Activity Intensity</h3>
                
                <div className="flex-grow flex items-end justify-between gap-1 px-1 min-h-[200px] overflow-x-auto no-scrollbar">
                    {chartData.map((d, i) => (
                        <div key={i} className="flex-1 min-w-[20px] flex flex-col items-center group cursor-help">
                            <div className="w-full relative h-48 flex items-end">
                                <div 
                                    className="w-full bg-slate-100 rounded-t-sm transition-all duration-700 ease-out group-hover:bg-cyan-200"
                                    style={{ height: `${(d.value / maxDuration) * 100}%`, minHeight: d.value > 0 ? '4px' : '0' }}
                                >
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[9px] py-1 px-2 rounded font-bold whitespace-nowrap z-20 shadow-xl pointer-events-none">
                                        <div className="text-cyan-400">{d.fullDate}</div>
                                        <div>{d.value.toFixed(1)} min</div>
                                    </div>
                                </div>
                            </div>
                            <span className="text-[7px] font-black text-slate-400 uppercase mt-4 tracking-tighter text-center leading-none h-4">{d.label}</span>
                        </div>
                    ))}
                </div>
                
                <div className="mt-10 pt-8 border-t border-slate-50 space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Range Average</span>
                        <span className="text-xl font-black text-slate-900">{(chartData.reduce((a,b)=>a+b.value, 0) / chartData.length).toFixed(1)}m</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Days Tracked</span>
                        <span className="text-xl font-black text-slate-900">{chartData.length}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column: Detailed Grouped Logs */}
        <div className="lg:col-span-2 space-y-10 animate-fade-in-up">
            {groupedData.length > 0 ? groupedData.map(([date, sessions]) => {
                const totalDuration = sessions.reduce((acc, curr) => acc + (curr.duration || 0), 0);
                const avgScore = sessions.reduce((acc, curr) => acc + curr.score, 0) / sessions.length;

                return (
                    <div key={date} className="space-y-4">
                        <div className="flex items-center gap-4 px-2">
                             <div className="h-px bg-slate-200 flex-grow"></div>
                             <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{date}</span>
                             <div className="h-px bg-slate-200 flex-grow"></div>
                        </div>

                        <div className="bg-white rounded-[2rem] shadow-lg border border-slate-100 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50 border-b border-slate-100">
                                    <tr>
                                        <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase">Time</th>
                                        <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase">Exercise Module</th>
                                        <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase text-center">Score</th>
                                        <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase text-right">Duration</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {sessions.map((s, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                                            <td className="px-8 py-5 text-xs font-bold text-slate-500">
                                                {new Date(s.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-2 h-2 rounded-full ${s.category === 'amblyo' ? 'bg-cyan-500' : 'bg-indigo-500'}`}></div>
                                                    <span className="text-xs font-black text-slate-800 uppercase tracking-tight">{s.levelId.replace('strab_level', 'STRAB L').replace('level', 'AMBLYO L')}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <span className="text-xs font-black text-slate-700">{s.score}</span>
                                            </td>
                                            <td className="px-8 py-5 text-right font-mono text-xs font-bold text-cyan-600">
                                                {formatSeconds(s.duration)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            
                            <div className="bg-slate-900 p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="flex items-center gap-6">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Day Summary</span>
                                        <span className="text-sm font-black text-white">{sessions.length} Session{sessions.length !== 1 ? 's' : ''}</span>
                                    </div>
                                    <div className="w-px h-6 bg-slate-800"></div>
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Avg. Accuracy</span>
                                        <span className="text-sm font-black text-teal-400">{avgScore.toFixed(0)}%</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10 shadow-inner">
                                    <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <span className="text-lg font-black text-white tracking-tighter">TOTAL: {Math.floor(totalDuration / 60)}m {totalDuration % 60}s</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            }) : (
                <div className="bg-white p-20 rounded-[2.5rem] shadow-xl border border-dashed border-slate-200 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 text-slate-300">
                         <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                    </div>
                    <h4 className="text-xl font-black text-slate-800 uppercase tracking-tight">No Assessment Data</h4>
                    <p className="text-slate-400 font-medium max-w-xs mt-2">No therapy history found for the selected range.</p>
                </div>
            )}
        </div>
      </div>

      {/* Persistent Navigation */}
      <button
        onClick={handleHomeClick}
        className="fixed bottom-8 right-8 group w-16 h-16 rounded-full flex items-center justify-center bg-white shadow-2xl transition-transform hover:scale-110 focus:outline-none z-30"
      >
        <span className="absolute inset-0 rounded-full border-2 border-cyan-200 opacity-70 group-hover:border-cyan-500 group-hover:opacity-100 transition-all duration-300"></span>
        <HomeIcon className="w-10 h-10 text-cyan-600 group-hover:text-cyan-700 transition-colors" />
      </button>

      <ConfirmationModal
        isOpen={isConfirmingExit}
        title="Confirm Exit"
        message="Are you sure you want to return to the main menu?"
        onConfirm={handleConfirmExit}
        onCancel={() => setIsConfirmingExit(false)}
        confirmText="Exit"
      />

      <style>{`
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default TimeAssessmentPage;
