
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
  const [isConfirmingExit, setIsConfirmingExit] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Local form state
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleHomeClick = () => {
    setIsConfirmingExit(true);
  };

  const handleConfirmExit = () => {
    setIsConfirmingExit(false);
    setCurrentPage('home');
  };

  const handleSave = () => {
    onUpdateProfile(formData);
    setIsEditing(false);
    setSaveStatus('Profile Saved Successfully!');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const inputClasses = "w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-cyan-400 outline-none transition-all font-bold text-slate-800 disabled:opacity-70 disabled:bg-slate-100";

  return (
    <div className="relative min-h-screen bg-slate-50 flex flex-col items-center p-4 sm:p-6 overflow-y-auto">
      <header className="w-full max-w-4xl mx-auto my-10 text-center animate-fade-in-up">
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 flex items-center justify-center gap-5 tracking-tighter uppercase" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.05)'}}>
            <div className="bg-cyan-500 p-2 rounded-2xl shadow-xl shadow-cyan-500/20">
              <UserIcon className="w-10 h-10 text-white" />
            </div>
            User Profile
        </h1>
      </header>
      
      <div className="w-full max-w-2xl bg-white p-8 sm:p-12 rounded-[2.5rem] shadow-2xl border border-white animate-fade-in-up relative overflow-hidden">
         {/* Background Decoration */}
         <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-50 rounded-full -mr-16 -mt-16 opacity-40"></div>
         
         {saveStatus && (
           <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest shadow-lg animate-bounce z-20">
              {saveStatus}
           </div>
         )}

         <div className="flex flex-col items-center mb-12">
            <div className="w-32 h-32 rounded-[2rem] bg-gradient-to-br from-cyan-500 to-teal-400 flex items-center justify-center text-white font-black text-6xl shadow-2xl mb-6 border-8 border-white">
                {formData.name.charAt(0)}
            </div>
            <div className="text-center">
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">{formData.name}</h2>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">Joined: {formData.joinedDate}</p>
            </div>
         </div>

         <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input 
                        type="text" 
                        value={formData.name} 
                        disabled={!isEditing}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className={inputClasses}
                        placeholder="Enter full name"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Age / Years</label>
                    <input 
                        type="number" 
                        value={formData.age} 
                        disabled={!isEditing}
                        onChange={(e) => setFormData({...formData, age: e.target.value})}
                        className={inputClasses}
                        placeholder="Age"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Medical Condition</label>
                <select 
                    value={formData.condition} 
                    disabled={!isEditing}
                    onChange={(e) => setFormData({...formData, condition: e.target.value})}
                    className={inputClasses}
                >
                    <option value="Amblyopia">Amblyopia (Lazy Eye)</option>
                    <option value="Strabismus">Strabismus (Eye Turn)</option>
                    <option value="Convergence Insufficiency">Convergence Insufficiency</option>
                    <option value="Other">Other</option>
                </select>
            </div>

            <div className="pt-6 border-t border-slate-100 flex gap-4">
                {!isEditing ? (
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="flex-1 bg-slate-900 text-white font-black py-5 rounded-2xl hover:bg-slate-800 transition-all shadow-xl active:scale-95 uppercase tracking-widest text-sm"
                    >
                        Edit Profile
                    </button>
                ) : (
                    <>
                        <button 
                            onClick={handleSave}
                            className="flex-1 bg-emerald-500 text-white font-black py-5 rounded-2xl hover:bg-emerald-400 transition-all shadow-xl active:scale-95 uppercase tracking-widest text-sm"
                        >
                            Save Changes
                        </button>
                        <button 
                            onClick={() => { setFormData(profile); setIsEditing(false); }}
                            className="px-8 bg-slate-100 text-slate-500 font-black py-5 rounded-2xl hover:bg-slate-200 transition-all active:scale-95 uppercase tracking-widest text-sm"
                        >
                            Cancel
                        </button>
                    </>
                )}
            </div>
         </div>
      </div>

      <button
        onClick={handleHomeClick}
        className="fixed bottom-8 right-8 group w-16 h-16 rounded-full flex items-center justify-center bg-white shadow-2xl transition-transform hover:scale-110 focus:outline-none z-30"
        aria-label="Home"
      >
         {/* Inner Ring */}
        <span className="absolute inset-0 rounded-full border-2 border-cyan-200 opacity-70 group-hover:border-cyan-500 group-hover:opacity-100 transition-all duration-300"></span>
        {/* Outer Pulse Ring */}
        <span className="absolute -inset-2 rounded-full border border-cyan-100 opacity-40 group-hover:scale-110 group-hover:opacity-60 transition-all duration-500 ease-out"></span>
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
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;
