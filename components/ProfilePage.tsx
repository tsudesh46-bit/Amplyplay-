
import React, { useState } from 'react';
import { Page, UserProfile } from '../types';
import { HomeIcon, UserIcon } from './ui/Icons';
import ConfirmationModal from './ConfirmationModal';

interface ProfilePageProps {
  setCurrentPage: (page: Page) => void;
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ setCurrentPage, profile, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Local form state
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleHomeClick = () => {
    setCurrentPage('home');
  };

  const handleSave = () => {
    onUpdateProfile(formData);
    setIsEditing(false);
    setSaveStatus('Profile Saved Successfully!');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const inputClasses = "w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-cyan-400 outline-none transition-all font-bold text-slate-800 disabled:opacity-70 disabled:bg-slate-100";
  const medicalInputClasses = "w-full p-3 bg-indigo-50/30 border-2 border-indigo-100/50 rounded-xl font-bold text-slate-700 opacity-90 cursor-not-allowed text-sm min-h-[48px] flex items-center";

  return (
    <div className="relative min-h-screen bg-slate-50 flex flex-col items-center p-4 sm:p-6 overflow-y-auto pb-20">
      <header className="w-full max-w-4xl mx-auto my-10 text-center animate-fade-in-up">
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 flex items-center justify-center gap-5 tracking-tighter uppercase">
            <div className="bg-cyan-500 p-2 rounded-2xl shadow-xl shadow-cyan-500/20">
              <UserIcon className="w-10 h-10 text-white" />
            </div>
            Patient Profile
        </h1>
      </header>
      
      <div className="w-full max-w-3xl space-y-8 animate-fade-in-up">
        {/* General & Personal Profile Section */}
        <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] shadow-2xl border border-white relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-50 rounded-full -mr-16 -mt-16 opacity-40"></div>
           
           {saveStatus && (
             <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest shadow-lg animate-bounce z-20">
                {saveStatus}
             </div>
           )}

           <div className="flex flex-col items-center mb-12">
              <div className="w-32 h-32 rounded-[2rem] bg-gradient-to-br from-cyan-500 to-teal-400 flex items-center justify-center text-white font-black text-6xl shadow-2xl mb-6 border-8 border-white">
                  {(formData.nickname || formData.name).charAt(0)}
              </div>
              <div className="text-center">
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">{formData.nickname || formData.name}</h2>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">ID: {formData.customerId || 'N/A'}</p>
              </div>
           </div>

           <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                      <input type="text" value={formData.name} disabled={!isEditing} onChange={(e) => setFormData({...formData, name: e.target.value})} className={inputClasses}/>
                  </div>
                  <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nickname</label>
                      <input type="text" value={formData.nickname || ''} placeholder="e.g. Champ" disabled={!isEditing} onChange={(e) => setFormData({...formData, nickname: e.target.value})} className={inputClasses}/>
                  </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                  <div className="space-y-2">
                      <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest ml-1">Username (Locked)</label>
                      <input type="text" value={formData.username} disabled={true} className={`${inputClasses} bg-slate-100 cursor-not-allowed`}/>
                  </div>
                  <div className="space-y-2 relative">
                      <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest ml-1">Password (Locked)</label>
                      <div className="relative">
                          <input 
                              type={showPassword ? "text" : "password"} 
                              value={formData.password} 
                              disabled={true} 
                              className={`${inputClasses} bg-slate-100 cursor-not-allowed pr-14`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 p-2 transition-colors focus:outline-none"
                            title={showPassword ? "Hide Password" : "Show Password"}
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
                  </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">OA Tested Date</label>
                      <input type="date" value={formData.oaTestedDate || ''} disabled={!isEditing} onChange={(e) => setFormData({...formData, oaTestedDate: e.target.value})} className={inputClasses}/>
                  </div>
                  <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Therapy Start Date</label>
                      <input type="text" value={formData.joinedDate} disabled={true} className={`${inputClasses} bg-slate-100 cursor-not-allowed`}/>
                  </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date of Birth</label>
                      <input type="date" value={formData.dateOfBirth || ''} disabled={!isEditing} onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})} className={inputClasses}/>
                  </div>
                  <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                      <input type="tel" value={formData.phoneNumber || ''} disabled={!isEditing} onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} className={inputClasses}/>
                  </div>
              </div>

              <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Address</label>
                  <textarea value={formData.address || ''} disabled={!isEditing} onChange={(e) => setFormData({...formData, address: e.target.value})} className={`${inputClasses} min-h-[80px]`}/>
              </div>

              <div className="space-y-2">
                  <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-1">Special Condition</label>
                  <input type="text" value={formData.specialCondition || ''} disabled={!isEditing} onChange={(e) => setFormData({...formData, specialCondition: e.target.value})} className={inputClasses}/>
              </div>

              <div className="pt-6 border-t border-slate-100 flex gap-4">
                  {!isEditing ? (
                      <button onClick={() => setIsEditing(true)} className="flex-1 bg-slate-900 text-white font-black py-5 rounded-2xl hover:bg-slate-800 transition-all shadow-xl uppercase tracking-widest text-sm">Edit Personal Info</button>
                  ) : (
                      <>
                          <button onClick={handleSave} className="flex-1 bg-emerald-500 text-white font-black py-5 rounded-2xl hover:bg-emerald-400 transition-all shadow-xl uppercase tracking-widest text-sm">Save Changes</button>
                          <button onClick={() => { setFormData(profile); setIsEditing(false); }} className="px-8 bg-slate-100 text-slate-500 font-black py-5 rounded-2xl hover:bg-slate-200 transition-all uppercase tracking-widest text-sm">Cancel</button>
                      </>
                  )}
              </div>
           </div>
        </div>

        {/* Medical Profile Section (Read Only for Patients) */}
        <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] shadow-2xl border border-indigo-50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
            <div className="flex items-center gap-4 mb-10">
                <div className="bg-indigo-100 p-3 rounded-2xl">
                    <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Medical Profile</h3>
                    <p className="text-indigo-400 font-bold text-[10px] uppercase tracking-widest">Clinic Records • Locked</p>
                </div>
            </div>

            <div className="space-y-10">
                {/* VA & History */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-indigo-500 uppercase tracking-widest ml-1">Patient History</label>
                        <div className={`${medicalInputClasses} min-h-[100px] items-start p-4`}>{formData.medical_history || "No history recorded."}</div>
                    </div>
                    
                    <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100">
                        <h4 className="text-xs font-black text-indigo-800 uppercase tracking-widest mb-4">Visual Acuity</h4>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Method</label>
                                <div className={medicalInputClasses}>{formData.va_method || 'N/A'}</div>
                            </div>
                            <div>
                                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Correction</label>
                                <div className={medicalInputClasses}>{formData.va_correction || 'N/A'}</div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">OD (Right Eye)</label>
                                <div className={medicalInputClasses}>{formData.va_od || 'N/A'}</div>
                            </div>
                            <div>
                                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">OS (Left Eye)</label>
                                <div className={medicalInputClasses}>{formData.va_os || 'N/A'}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Binocular & Stereo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h4 className="text-xs font-black text-indigo-800 uppercase tracking-widest border-b border-indigo-100 pb-2">Binocular Status</h4>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase">Near (40cm)</label>
                            <div className={medicalInputClasses}>{formData.binocular_near || 'N/A'}</div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase">Far (6m)</label>
                            <div className={medicalInputClasses}>{formData.binocular_far || 'N/A'}</div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-xs font-black text-indigo-800 uppercase tracking-widest border-b border-indigo-100 pb-2">Stereo Acuity</h4>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase">Near (Seconds of Arc)</label>
                            <div className={medicalInputClasses}>{formData.stereo_near || 'N/A'}</div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase">Far (Seconds of Arc)</label>
                            <div className={medicalInputClasses}>{formData.stereo_far || 'N/A'}</div>
                        </div>
                    </div>
                </div>

                {/* Convergence & Fusion */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-indigo-800 uppercase tracking-widest">Convergence (CM)</label>
                        <div className={medicalInputClasses}>{formData.convergence_cm || 'N/A'} cm</div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="bg-slate-50 p-4 rounded-2xl">
                            <h5 className="text-[10px] font-black text-slate-500 uppercase mb-3">Prism Fusion (Near)</h5>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="text-[9px] font-bold">BI: {formData.prism_near_bi || '0'}</div>
                                <div className="text-[9px] font-bold">BO: {formData.prism_near_bo || '0'}</div>
                            </div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl">
                            <h5 className="text-[10px] font-black text-slate-500 uppercase mb-3">Prism Fusion (Far)</h5>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="text-[9px] font-bold">BI: {formData.prism_far_bi || '0'}</div>
                                <div className="text-[9px] font-bold">BO: {formData.prism_far_bo || '0'}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Deviation & Fixation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h4 className="text-xs font-black text-indigo-800 uppercase tracking-widest border-b border-indigo-100 pb-2">Deviation Angle</h4>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase">Near</label>
                            <div className={medicalInputClasses}>{formData.dev_near_value ? `${formData.dev_near_type} ${formData.dev_near_value}` : 'N/A'}</div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase">Far</label>
                            <div className={medicalInputClasses}>{formData.dev_far_value ? `${formData.dev_far_type} ${formData.dev_far_value}` : 'N/A'}</div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-xs font-black text-indigo-800 uppercase tracking-widest border-b border-indigo-100 pb-2">Fixation</h4>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase">OD (Right)</label>
                            <div className={medicalInputClasses}>{formData.fixation_od || 'N/A'}</div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase">OS (Left)</label>
                            <div className={medicalInputClasses}>{formData.fixation_os || 'N/A'}</div>
                        </div>
                    </div>
                </div>

                {/* Diagnosis & Rx Plans */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest ml-1">Final Diagnosis</label>
                        <div className={`${medicalInputClasses} min-h-[80px] items-start p-4`}>{formData.diagnosis || "Pending Evaluation"}</div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-cyan-600 uppercase tracking-widest ml-1">Rx Plans & Instructions</label>
                        <div className={`${medicalInputClasses} min-h-[120px] items-start p-4 border-cyan-100 bg-cyan-50/20`}>{formData.rx_plans || "No specific plans assigned yet."}</div>
                    </div>
                </div>

                <div className="bg-indigo-50/50 p-4 rounded-2xl flex items-center gap-4 border border-indigo-100">
                    <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center shrink-0 shadow-lg">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2z" />
                        </svg>
                    </div>
                    <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-tight leading-normal">
                        Note: Medical data is locked for patients. If you believe there is an error in your records, please contact your therapist.
                    </p>
                </div>
            </div>
        </div>
      </div>

      <button
        onClick={handleHomeClick}
        className="fixed bottom-8 right-8 group w-16 h-16 rounded-full flex items-center justify-center bg-white shadow-2xl transition-transform hover:scale-110 focus:outline-none z-30"
      >
        <span className="absolute inset-0 rounded-full border-2 border-cyan-200 opacity-70 group-hover:border-cyan-500 group-hover:opacity-100 transition-all duration-300"></span>
        <HomeIcon className="w-10 h-10 text-cyan-600 group-hover:text-cyan-700 transition-colors" />
      </button>

      <style>{`
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default ProfilePage;
