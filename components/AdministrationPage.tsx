
import React, { useState, useEffect, useCallback } from 'react';
import { Page, UserProfile, LevelStats, CompletedLevels } from '../types';
import { HomeIcon, UserIcon, CloseIcon, SettingsIcon } from './ui/Icons';
import PerformancePage from './PerformancePage';
import TimeAssessmentPage from './TimeAssessmentPage';

interface AdministrationPageProps {
  setCurrentPage: (page: Page) => void;
  users: UserProfile[];
  setUsers: React.Dispatch<React.SetStateAction<UserProfile[]>>;
  currentUserId?: string;
  allProgress: Record<string, { levels: CompletedLevels, history: LevelStats[] }>;
}

const VA_SNELLEN = ["1/60", "2/60", "3/60", "6/60", "6/36", "6/24", "6/18", "6/12", "6/9", "6/6"];
const VA_LOGMAR = ["1.8", "1.5", "1.3", "1.0", "0.8", "0.6", "0.5", "0.3", "0.2", "0.0"];

const AdministrationPage: React.FC<AdministrationPageProps> = ({ setCurrentPage, users, setUsers, currentUserId, allProgress }) => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Monitoring View State
  const [viewingPatientStats, setViewingPatientStats] = useState<{ id: string, type: 'performance' | 'time' } | null>(null);

  // Management State
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [tempUser, setTempUser] = useState<Partial<UserProfile>>({
    name: '', nickname: '', username: '', password: '', age: '', condition: 'Amblyopia', role: 'patient',
    customerId: '', oaTestedDate: '', phoneNumber: '', dateOfBirth: '', address: '', specialCondition: '',
    medical_history: '', va_method: 'Snellen', va_correction: 'SC', va_od: '6/6', va_os: '6/6',
    binocular_near: '4 lights', binocular_far: '4 lights', stereo_near: '', stereo_far: '',
    convergence_cm: '', prism_near_bi: '', prism_near_bo: '', prism_far_bi: '', prism_far_bo: '',
    acc_amp_near_bi: '', acc_amp_near_bo: '', acc_amp_far_bi: '', acc_amp_far_bo: '',
    dev_near_type: 'BI', dev_near_value: '', dev_far_type: 'BI', dev_far_value: '',
    fixation_od: 'Central', fixation_os: 'Central', diagnosis: '', rx_plans: '',
    amblyoLocked: false, strabLocked: true
  });

  // Simulated Online Sync Logic
  const handleManualSync = useCallback((patientId?: string) => {
    setIsSyncing(true);
    // Simulate network delay
    setTimeout(() => {
        setIsSyncing(false);
        console.log(`Synced data for ${patientId || 'all patients'}`);
    }, 2000);
  }, []);

  // Auto-sync at 10:00 AM logic
  useEffect(() => {
    const checkAutoSync = () => {
        const now = new Date();
        if (now.getHours() === 10 && now.getMinutes() === 0 && !isSyncing) {
            handleManualSync();
        }
    };
    const interval = setInterval(checkAutoSync, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [handleManualSync, isSyncing]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const admin = users.find(u => u.role === 'admin' && u.username === adminUsername && u.password === adminPassword);
    if (admin) { setIsAdminLoggedIn(true); setError(null); } else { setError('Invalid Administration Credentials'); }
  };

  const deleteUser = (id: string) => {
    if (id === 'admin-default') { alert("Cannot delete master admin."); return; }
    if (confirm('Delete this account?')) {
      const updated = users.filter(u => u.id !== id);
      setUsers(updated);
      localStorage.setItem('strabplay_users_v2', JSON.stringify(updated));
    }
  };

  const handleSaveUser = () => {
    if (!tempUser.username || !tempUser.password || !tempUser.name) { alert("Required: Name, Username, Password"); return; }
    let updatedUsers;
    if (editingUserId) {
        updatedUsers = users.map(u => u.id === editingUserId ? { ...u, ...tempUser } as UserProfile : u);
    } else {
        const newUser: UserProfile = { ...tempUser, id: `user-${Date.now()}`, joinedDate: new Date().toLocaleDateString() } as UserProfile;
        updatedUsers = [...users, newUser];
    }
    setUsers(updatedUsers);
    localStorage.setItem('strabplay_users_v2', JSON.stringify(updatedUsers));
    setIsAddingNew(false); setEditingUserId(null);
  };

  const startEdit = (u: UserProfile) => {
    setEditingUserId(u.id);
    setTempUser({...u});
    setIsAddingNew(true);
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.nickname && u.nickname.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (u.customerId && u.customerId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const inputStyle = "w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-cyan-500 outline-none font-bold text-slate-800 text-sm";
  const labelStyle = "text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1";

  // Render sub-dashboards if admin is viewing them
  if (viewingPatientStats) {
      const patientId = viewingPatientStats.id;
      const patient = users.find(u => u.id === patientId);
      const patientProg = allProgress[patientId] || { levels: {}, history: [] };

      return (
          <div className="fixed inset-0 bg-slate-50 z-[60] overflow-y-auto">
              <nav className="h-16 bg-[#0a1128] text-white flex items-center justify-between px-6 sticky top-0 z-10 shadow-lg">
                  <div className="flex items-center gap-4">
                      <span className="text-[10px] font-black uppercase bg-cyan-500 text-slate-900 px-2 py-0.5 rounded">Monitoring</span>
                      <span className="font-bold text-sm">Viewing: {patient?.name} ({patient?.customerId})</span>
                  </div>
                  <button onClick={() => setViewingPatientStats(null)} className="flex items-center gap-2 text-xs font-black uppercase hover:text-cyan-400 transition-colors">
                      <CloseIcon className="w-5 h-5" /> Back to Administration
                  </button>
              </nav>
              {viewingPatientStats.type === 'performance' ? (
                  <PerformancePage setCurrentPage={() => {}} completedLevels={patientProg.levels} gameHistory={patientProg.history} language="en" />
              ) : (
                  <TimeAssessmentPage setCurrentPage={() => {}} gameHistory={patientProg.history} />
              )}
          </div>
      );
  }

  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center">
            <div className="bg-yellow-100 text-yellow-600 w-16 h-16 flex items-center justify-center rounded-2xl mx-auto mb-6">
                <SettingsIcon className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-2">Admin Access</h1>
            <form onSubmit={handleAdminLogin} className="space-y-4">
                <input type="text" placeholder="Username" className={inputStyle} value={adminUsername} onChange={e => setAdminUsername(e.target.value)}/>
                <input type="password" placeholder="Password" className={inputStyle} value={adminPassword} onChange={e => setAdminPassword(e.target.value)}/>
                {error && <p className="text-rose-500 text-[10px] font-black uppercase">{error}</p>}
                <button type="submit" className="w-full bg-slate-900 text-white font-black py-4 rounded-xl hover:bg-slate-800 transition-all shadow-xl">LOGIN</button>
            </form>
            <button onClick={() => setCurrentPage('home')} className="mt-6 text-slate-400 font-bold text-xs uppercase hover:text-slate-600">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
        <div className="max-w-6xl mx-auto">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Administration</h1>
                        <p className="text-slate-400 font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                            User & Medical Records
                            {isSyncing && <svg className="w-4 h-4 animate-spin text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>}
                        </p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => handleManualSync()} className="bg-slate-800 text-white font-black px-6 py-3 rounded-xl shadow-lg hover:bg-slate-700 text-xs uppercase tracking-widest flex items-center gap-2">
                        <svg className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                        Update from Cloud
                    </button>
                    <button onClick={() => { setIsAddingNew(true); setEditingUserId(null); setTempUser({ role: 'patient', va_method: 'Snellen', amblyoLocked: false, strabLocked: true }); }} className="bg-cyan-600 text-white font-black px-6 py-3 rounded-xl shadow-lg hover:bg-cyan-700 text-xs uppercase tracking-widest">Add Patient</button>
                    <button onClick={() => setCurrentPage('home')} className="bg-white border border-slate-200 text-slate-600 font-black px-6 py-3 rounded-xl shadow-sm hover:bg-slate-50 transition-all"><HomeIcon className="w-6 h-6" /></button>
                </div>
            </header>

            <div className="mb-8 relative max-w-md">
                <input type="text" placeholder="Search by name, nickname or Customer ID..." className="w-full p-4 pl-12 bg-white border-2 border-slate-100 rounded-2xl shadow-sm focus:border-cyan-500 outline-none font-bold text-slate-800" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient</th>
                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Last Active</th>
                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer ID</th>
                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                            <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredUsers.map(u => (
                            <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black">{(u.nickname || u.name).charAt(0)}</div>
                                        <div onClick={() => startEdit(u)} className="cursor-pointer group">
                                            <div className="text-sm font-black text-slate-800 group-hover:text-cyan-600 group-hover:underline">{u.nickname || u.name} {u.nickname ? <span className="text-[10px] text-slate-400 font-normal italic">({u.name})</span> : ''}</div>
                                            <div className="text-[10px] font-bold text-slate-400">DOB: {u.dateOfBirth || 'N/A'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <div className={`w-2.5 h-2.5 rounded-full ${u.isOnline ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-slate-300'}`}></div>
                                        <span className={`text-[9px] font-black uppercase tracking-widest ${u.isOnline ? 'text-emerald-600' : 'text-slate-400'}`}>
                                            {u.isOnline ? 'Online' : 'Offline'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-center text-[10px] font-bold text-slate-500">
                                    {u.lastActive || 'Never'}
                                </td>
                                <td className="px-8 py-6 text-sm font-bold text-slate-600">{u.customerId || '---'}</td>
                                <td className="px-8 py-6"><span className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest ${u.role === 'admin' ? 'bg-yellow-100 text-yellow-700' : 'bg-cyan-100 text-cyan-700'}`}>{u.role}</span></td>
                                <td className="px-8 py-6 text-right flex justify-end gap-2">
                                    <button onClick={() => startEdit(u)} className="p-2 text-slate-400 hover:text-cyan-600 rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5M16.123 4.123a2.121 2.121 0 013 3L11.75 18H8v-3.75l8.123-8.123z"/></svg></button>
                                    <button onClick={() => deleteUser(u.id)} className="p-2 text-slate-400 hover:text-rose-600 rounded-lg"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Extensive Admin Edit Modal */}
        {isAddingNew && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 max-w-4xl w-full shadow-2xl border border-white animate-fade-in-up my-8 h-fit max-h-[90vh] overflow-y-auto custom-scrollbar">
                    <div className="flex justify-between items-center mb-8 sticky top-0 bg-white z-10 py-2 border-b">
                        <div>
                            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">{editingUserId ? 'Edit Patient' : 'New Patient'}</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Therapist Clinical Dashboard</p>
                        </div>
                        <button onClick={() => setIsAddingNew(false)} className="text-slate-400 hover:text-rose-500 transition-colors"><CloseIcon className="w-8 h-8" /></button>
                    </div>

                    <div className="space-y-12 pb-10">
                        {/* Clinical Monitoring Category */}
                        {editingUserId && (
                            <div className="space-y-6 bg-cyan-50/30 p-6 rounded-3xl border border-cyan-100">
                                <h3 className="text-sm font-black text-cyan-800 uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-1 h-4 bg-cyan-500 rounded-full"></span> Clinical Monitoring
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <button 
                                        onClick={() => setViewingPatientStats({ id: editingUserId, type: 'performance' })}
                                        className="bg-white p-4 rounded-2xl border border-cyan-100 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center gap-3 active:scale-95"
                                    >
                                        <div className="w-10 h-10 bg-cyan-500 text-white rounded-xl flex items-center justify-center">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-slate-800 uppercase tracking-tight">Performance</span>
                                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Dashboard</span>
                                        </div>
                                    </button>
                                    <button 
                                        onClick={() => setViewingPatientStats({ id: editingUserId, type: 'time' })}
                                        className="bg-white p-4 rounded-2xl border border-cyan-100 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center gap-3 active:scale-95"
                                    >
                                        <div className="w-10 h-10 bg-teal-500 text-white rounded-xl flex items-center justify-center">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-slate-800 uppercase tracking-tight">Time Logs</span>
                                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Assessment</span>
                                        </div>
                                    </button>
                                    <button 
                                        onClick={() => handleManualSync(editingUserId)}
                                        className={`bg-white p-4 rounded-2xl border border-cyan-100 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center gap-3 active:scale-95 ${isSyncing ? 'opacity-50' : ''}`}
                                        disabled={isSyncing}
                                    >
                                        <div className="w-10 h-10 bg-indigo-500 text-white rounded-xl flex items-center justify-center">
                                            <svg className={`w-6 h-6 ${isSyncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs font-black text-slate-800 uppercase tracking-tight">Sync Now</span>
                                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Live Cloud Data</span>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Section 0: Access Control */}
                        <div className="space-y-6 bg-rose-50/30 p-6 rounded-3xl border border-rose-100">
                             <h3 className="text-sm font-black text-rose-800 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1 h-4 bg-rose-500 rounded-full"></span> Service Access Control
                             </h3>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                  <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-rose-100 shadow-sm">
                                       <div className="flex flex-col">
                                            <span className="text-sm font-black text-slate-800 uppercase">Amblyoplay Access</span>
                                            <span className="text-[10px] text-slate-400 font-bold">Lock/Unlock Amblyo Module</span>
                                       </div>
                                       <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={!tempUser.amblyoLocked} onChange={e => setTempUser({...tempUser, amblyoLocked: !e.target.checked})} />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                       </label>
                                  </div>
                                  <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-rose-100 shadow-sm">
                                       <div className="flex flex-col">
                                            <span className="text-sm font-black text-slate-800 uppercase">Strabplay Access</span>
                                            <span className="text-[10px] text-slate-400 font-bold">Lock/Unlock Strabismus Module</span>
                                       </div>
                                       <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={!tempUser.strabLocked} onChange={e => setTempUser({...tempUser, strabLocked: !e.target.checked})} />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                       </label>
                                  </div>
                             </div>
                        </div>

                        {/* Section 1: General Information */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2"><span className="w-1 h-4 bg-cyan-500 rounded-full"></span> General Information</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1"><label className={labelStyle}>Full Name</label><input type="text" value={tempUser.name} onChange={e => setTempUser({...tempUser, name: e.target.value})} className={inputStyle}/></div>
                                <div className="space-y-1"><label className={labelStyle}>Nickname</label><input type="text" value={tempUser.nickname} onChange={e => setTempUser({...tempUser, nickname: e.target.value})} className={inputStyle}/></div>
                                <div className="space-y-1"><label className={labelStyle}>Customer ID</label><input type="text" value={tempUser.customerId} onChange={e => setTempUser({...tempUser, customerId: e.target.value})} className={inputStyle}/></div>
                                <div className="space-y-1"><label className={labelStyle}>OA Tested Date</label><input type="date" value={tempUser.oaTestedDate} onChange={e => setTempUser({...tempUser, oaTestedDate: e.target.value})} className={inputStyle}/></div>
                                <div className="space-y-1"><label className={labelStyle}>Phone Number</label><input type="tel" value={tempUser.phoneNumber} onChange={e => setTempUser({...tempUser, phoneNumber: e.target.value})} className={inputStyle}/></div>
                                <div className="space-y-1"><label className={labelStyle}>Date of Birth</label><input type="date" value={tempUser.dateOfBirth} onChange={e => setTempUser({...tempUser, dateOfBirth: e.target.value})} className={inputStyle}/></div>
                                <div className="space-y-1"><label className={labelStyle}>Age</label><input type="number" value={tempUser.age} onChange={e => setTempUser({...tempUser, age: e.target.value})} className={inputStyle}/></div>
                            </div>
                            <div className="space-y-1"><label className={labelStyle}>Address</label><textarea value={tempUser.address} onChange={e => setTempUser({...tempUser, address: e.target.value})} className={`${inputStyle} min-h-[60px]`}/></div>
                            <div className="space-y-1"><label className={labelStyle}>Special Condition</label><input type="text" value={tempUser.specialCondition} onChange={e => setTempUser({...tempUser, specialCondition: e.target.value})} className={inputStyle}/></div>
                        </div>

                        {/* Section 2: Account Login */}
                        <div className="space-y-6 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2"><span className="w-1 h-4 bg-slate-400 rounded-full"></span> Login Credentials</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1"><label className={labelStyle}>Username</label><input type="text" value={tempUser.username} onChange={e => setTempUser({...tempUser, username: e.target.value})} className={inputStyle}/></div>
                                <div className="space-y-1"><label className={labelStyle}>Password</label><input type="text" value={tempUser.password} onChange={e => setTempUser({...tempUser, password: e.target.value})} className={inputStyle}/></div>
                                <div className="space-y-1"><label className={labelStyle}>Role</label><select value={tempUser.role} onChange={e => setTempUser({...tempUser, role: e.target.value as any})} className={inputStyle}><option value="patient">Patient</option><option value="admin">Administrator</option></select></div>
                            </div>
                        </div>

                        {/* Section 3: Medical History & VA */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-black text-indigo-800 uppercase tracking-widest flex items-center gap-2"><span className="w-1 h-4 bg-indigo-500 rounded-full"></span> Visual Acuity & History</h3>
                            <div className="space-y-1"><label className={labelStyle}>Medical History</label><textarea value={tempUser.medical_history} onChange={e => setTempUser({...tempUser, medical_history: e.target.value})} className={`${inputStyle} min-h-[100px] bg-white border-indigo-100`}/></div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className={labelStyle}>VA Method</label>
                                    <select value={tempUser.va_method} onChange={e => setTempUser({...tempUser, va_method: e.target.value as any})} className={inputStyle}><option value="Snellen">Snellen's Acuity</option><option value="LogMAR">LogMAR Chart</option></select>
                                </div>
                                <div className="space-y-1">
                                    <label className={labelStyle}>Correction</label>
                                    <select value={tempUser.va_correction} onChange={e => setTempUser({...tempUser, va_correction: e.target.value as any})} className={inputStyle}><option value="SC">SC (Without Glasses)</option><option value="CC">CC (With Glasses)</option></select>
                                </div>
                                <div className="space-y-1">
                                    <label className={labelStyle}>OD (Right Eye)</label>
                                    {tempUser.va_method === 'Snellen' ? (
                                        <select value={tempUser.va_od} onChange={e => setTempUser({...tempUser, va_od: e.target.value})} className={inputStyle}>{VA_SNELLEN.map(v => <option key={v} value={v}>{v}</option>)}</select>
                                    ) : (
                                        <select value={tempUser.va_od} onChange={e => setTempUser({...tempUser, va_od: e.target.value})} className={inputStyle}>{VA_LOGMAR.map(v => <option key={v} value={v}>{v}</option>)}</select>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <label className={labelStyle}>OS (Left Eye)</label>
                                    {tempUser.va_method === 'Snellen' ? (
                                        <select value={tempUser.va_os} onChange={e => setTempUser({...tempUser, va_os: e.target.value})} className={inputStyle}>{VA_SNELLEN.map(v => <option key={v} value={v}>{v}</option>)}</select>
                                    ) : (
                                        <select value={tempUser.va_os} onChange={e => setTempUser({...tempUser, va_os: e.target.value})} className={inputStyle}>{VA_LOGMAR.map(v => <option key={v} value={v}>{v}</option>)}</select>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Binocular & Stereo */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-black text-indigo-800 uppercase tracking-widest flex items-center gap-2"><span className="w-1 h-4 bg-indigo-500 rounded-full"></span> Binocular Status (Worth 4 Dot)</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1"><label className={labelStyle}>Near (40cm)</label><select value={tempUser.binocular_near} onChange={e => setTempUser({...tempUser, binocular_near: e.target.value as any})} className={inputStyle}><option value="">Select Result</option><option value="L suppression">L suppression</option><option value="R suppression">R suppression</option><option value="4 lights">4 lights</option><option value="5 lights">5 lights</option></select></div>
                                <div className="space-y-1"><label className={labelStyle}>Far (6m)</label><select value={tempUser.binocular_far} onChange={e => setTempUser({...tempUser, binocular_far: e.target.value as any})} className={inputStyle}><option value="">Select Result</option><option value="L suppression">L suppression</option><option value="R suppression">R suppression</option><option value="4 lights">4 lights</option><option value="5 lights">5 lights</option></select></div>
                            </div>
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pt-4">Stereo Acuity (Frisby - Seconds of Arc)</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1"><label className={labelStyle}>Stereo Near</label><input type="text" placeholder="e.g. 40" value={tempUser.stereo_near} onChange={e => setTempUser({...tempUser, stereo_near: e.target.value})} className={inputStyle}/></div>
                                <div className="space-y-1"><label className={labelStyle}>Stereo Far</label><input type="text" placeholder="e.g. 20" value={tempUser.stereo_far} onChange={e => setTempUser({...tempUser, stereo_far: e.target.value})} className={inputStyle}/></div>
                            </div>
                        </div>

                        {/* Section 5: Convergence & Prism */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-black text-indigo-800 uppercase tracking-widest flex items-center gap-2"><span className="w-1 h-4 bg-indigo-500 rounded-full"></span> Convergence & Prism Fusion</h3>
                            <div className="space-y-1"><label className={labelStyle}>Convergence (CM)</label><input type="text" value={tempUser.convergence_cm} onChange={e => setTempUser({...tempUser, convergence_cm: e.target.value})} className={inputStyle}/></div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h4 className={labelStyle}>Near Fusion Range</h4>
                                    <div className="flex gap-2">
                                        <div className="flex-1"><label className={labelStyle}>BI</label><input type="text" value={tempUser.prism_near_bi} onChange={e => setTempUser({...tempUser, prism_near_bi: e.target.value})} className={inputStyle}/></div>
                                        <div className="flex-1"><label className={labelStyle}>BO</label><input type="text" value={tempUser.prism_near_bo} onChange={e => setTempUser({...tempUser, prism_near_bo: e.target.value})} className={inputStyle}/></div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className={labelStyle}>Far Fusion Range</h4>
                                    <div className="flex gap-2">
                                        <div className="flex-1"><label className={labelStyle}>BI</label><input type="text" value={tempUser.prism_far_bi} onChange={e => setTempUser({...tempUser, prism_far_bi: e.target.value})} className={inputStyle}/></div>
                                        <div className="flex-1"><label className={labelStyle}>BO</label><input type="text" value={tempUser.prism_far_bo} onChange={e => setTempUser({...tempUser, prism_far_bo: e.target.value})} className={inputStyle}/></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 6: Deviation & Fixation */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-black text-indigo-800 uppercase tracking-widest flex items-center gap-2"><span className="w-1 h-4 bg-indigo-500 rounded-full"></span> Deviation & Fixation</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h4 className={labelStyle}>Deviation Near</h4>
                                    <div className="flex gap-2">
                                        <select value={tempUser.dev_near_type} onChange={e => setTempUser({...tempUser, dev_near_type: e.target.value as any})} className="w-20 p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold"><option value="BI">BI</option><option value="BO">BO</option></select>
                                        <input type="text" placeholder="Value" value={tempUser.dev_near_value} onChange={e => setTempUser({...tempUser, dev_near_value: e.target.value})} className={inputStyle}/>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className={labelStyle}>Deviation Far</h4>
                                    <div className="flex gap-2">
                                        <select value={tempUser.dev_far_type} onChange={e => setTempUser({...tempUser, dev_far_type: e.target.value as any})} className="w-20 p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold"><option value="BI">BI</option><option value="BO">BO</option></select>
                                        <input type="text" placeholder="Value" value={tempUser.dev_far_value} onChange={e => setTempUser({...tempUser, dev_far_value: e.target.value})} className={inputStyle}/>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1"><label className={labelStyle}>Fixation OD (Right)</label><input type="text" value={tempUser.fixation_od} onChange={e => setTempUser({...tempUser, fixation_od: e.target.value})} className={inputStyle}/></div>
                                <div className="space-y-1"><label className={labelStyle}>Fixation OS (Left)</label><input type="text" value={tempUser.fixation_os} onChange={e => setTempUser({...tempUser, fixation_os: e.target.value})} className={inputStyle}/></div>
                            </div>
                        </div>

                        {/* Section 7: Final Assessment */}
                        <div className="space-y-6 bg-indigo-50/20 p-6 rounded-3xl border border-indigo-50">
                            <h3 className="text-sm font-black text-indigo-800 uppercase tracking-widest flex items-center gap-2"><span className="w-1 h-4 bg-indigo-600 rounded-full"></span> Diagnosis & Rx Plans</h3>
                            <div className="space-y-1"><label className={labelStyle}>Final Diagnosis</label><textarea value={tempUser.diagnosis} onChange={e => setTempUser({...tempUser, diagnosis: e.target.value})} className={`${inputStyle} min-h-[80px] bg-white`}/></div>
                            <div className="space-y-1"><label className={labelStyle}>Rx Plans & Therapist Instructions</label><textarea value={tempUser.rx_plans} onChange={e => setTempUser({...tempUser, rx_plans: e.target.value})} className={`${inputStyle} min-h-[150px] bg-white border-cyan-100`}/></div>
                        </div>

                        <div className="pt-6 flex gap-4 sticky bottom-0 bg-white py-4 border-t">
                            <button onClick={handleSaveUser} className="flex-1 bg-slate-900 text-white font-black py-5 rounded-2xl hover:bg-slate-800 shadow-xl uppercase tracking-widest text-sm">Save Complete Patient Record</button>
                            <button onClick={() => setIsAddingNew(false)} className="px-8 bg-slate-100 text-slate-500 font-black py-5 rounded-2xl hover:bg-slate-200 uppercase tracking-widest text-sm">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        <style>{`
            .custom-scrollbar::-webkit-scrollbar { width: 6px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
        `}</style>
    </div>
  );
};

export default AdministrationPage;
