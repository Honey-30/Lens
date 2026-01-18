
import React, { useState } from 'react';
import { UserPreferences } from '../types';
import { validateApiKey } from '../services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ShieldAlert, X, Loader2, Save, Trash2, Globe2, AlertCircle, Key, Eye, EyeOff } from 'lucide-react';

interface SettingsProps {
  preferences: UserPreferences;
  onUpdate: (prefs: UserPreferences) => void;
  onBack: () => void;
}

const DIETARY_OPTIONS = ['None', 'Vegan', 'Vegetarian', 'Keto', 'Paleo'] as const;

const Settings: React.FC<SettingsProps> = ({ preferences, onUpdate, onBack }) => {
  const [localPrefs, setLocalPrefs] = useState<UserPreferences>(preferences);
  const [newAllergy, setNewAllergy] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage('');
    
    // Validate connection health using environment key
    const isValid = await validateApiKey();
    if (!isValid) {
      setErrorMessage('Neural link handshake failed. Verify system configuration.');
      setIsSaving(false);
      return;
    }

    // Simulate settings propagation
    await new Promise(r => setTimeout(r, 800));
    onUpdate(localPrefs);
    setIsSaving(false);
  };

  const addAllergy = () => {
    if (newAllergy && !localPrefs.allergies.includes(newAllergy)) {
      setLocalPrefs({ ...localPrefs, allergies: [...localPrefs.allergies, newAllergy] });
      setNewAllergy('');
    }
  };

  const removeAllergy = (a: string) => {
    setLocalPrefs({ ...localPrefs, allergies: localPrefs.allergies.filter(x => x !== a) });
  };

  return (
    <div className="min-h-screen pt-40 pb-20 px-6 md:px-12 lg:px-24 bg-white selection:bg-[#D4AF37]/30">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-20 gap-8">
          <div>
            <h2 className="text-6xl md:text-7xl font-bold tracking-tighter mb-4 text-[#1A1A1D]">System <span className="serif italic text-[#D4AF37]">Architecture</span></h2>
            <p className="text-black/60 text-xl font-light">Global configurations for the CulinaryLens Intelligence Engine.</p>
          </div>
          <button onClick={onBack} className="text-[11px] uppercase tracking-[0.4em] font-bold text-black/50 hover:text-[#1A1A1D] transition-colors border-b border-black/10 pb-1">Return to Hub</button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-8 space-y-12">
            {/* User Preferences Section */}
            <section className="bg-white p-10 md:p-14 rounded-[3.5rem] border border-black/[0.06] shadow-sm space-y-12">
              <div className="flex items-center gap-5">
                <User size={20} className="text-[#D4AF37]" />
                <h3 className="text-[11px] uppercase tracking-[0.4em] font-bold text-black/50">Biological Constraints</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-6">
                    <label className="text-[11px] uppercase tracking-widest font-bold text-black/50 block mb-2">Dietary Anchor</label>
                    <div className="flex flex-wrap gap-4">
                      {DIETARY_OPTIONS.map(d => (
                        <button 
                          key={d} 
                          onClick={() => setLocalPrefs({ ...localPrefs, dietary: d as any })}
                          className={`px-7 py-3.5 rounded-full border text-[11px] font-bold uppercase tracking-widest transition-all ${
                            localPrefs.dietary === d ? 'bg-[#D4AF37] text-white border-[#D4AF37] shadow-md' : 'border-black/10 text-black/50 hover:text-black hover:border-black/30'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                 </div>
                 <div className="space-y-6">
                    <label className="text-[11px] uppercase tracking-widest font-bold text-black/50 block mb-2">Geographic Anchor</label>
                    <div className="relative">
                      <Globe2 size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-black/40" />
                      <input 
                        type="text" 
                        value={localPrefs.cuisinePreference}
                        onChange={(e) => setLocalPrefs({ ...localPrefs, cuisinePreference: e.target.value })}
                        placeholder="e.g. Kyoto Minimalist"
                        className="w-full bg-black/[0.03] border-none rounded-[1.5rem] pl-16 pr-6 py-4.5 text-base font-bold placeholder:opacity-30 focus:ring-1 ring-[#D4AF37] transition-all"
                      />
                    </div>
                 </div>
              </div>

              <AnimatePresence>
                {errorMessage && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-4 px-8 py-5 bg-rose-50 text-rose-700 rounded-2xl border border-rose-100 text-[12px] font-bold mt-8 shadow-sm"
                  >
                    <AlertCircle size={16} />
                    {errorMessage}
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          </div>

          <div className="lg:col-span-4 space-y-10">
             {/* API Key Configuration */}
             <div className="bg-gradient-to-br from-[#D4AF37]/5 to-[#C5A028]/10 p-10 md:p-12 rounded-[3.5rem] border-2 border-[#D4AF37]/20 shadow-lg">
                <div className="flex items-center gap-5 mb-6">
                  <Key size={20} className="text-[#D4AF37]" />
                  <h3 className="text-[11px] uppercase tracking-[0.4em] font-bold text-black/50">API Configuration</h3>
                </div>
                <p className="text-xs text-black/60 mb-8 leading-relaxed">
                  Enter your Google Gemini API key for full functionality. Get your key at{' '}
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-[#D4AF37] font-bold hover:underline">
                    Google AI Studio
                  </a>
                </p>
                <div className="relative mb-4">
                  <Key size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-[#D4AF37]" />
                  <input 
                    type={showApiKey ? "text" : "password"}
                    value={localPrefs.apiKey || ''}
                    onChange={(e) => setLocalPrefs({ ...localPrefs, apiKey: e.target.value })}
                    placeholder="AIza••••••••••••••••••••••••••••"
                    className="w-full bg-white border-2 border-[#D4AF37]/30 rounded-[1.5rem] pl-16 pr-16 py-4.5 text-sm font-mono placeholder:opacity-30 focus:ring-2 ring-[#D4AF37] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-black/40 hover:text-[#D4AF37] transition-colors"
                  >
                    {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="flex items-start gap-3 px-4 py-3 bg-amber-50/50 border border-amber-200/50 rounded-2xl">
                  <AlertCircle size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-[10px] text-amber-700 leading-relaxed">
                    Your API key is stored locally in your browser and never sent to any server except Google's API.
                  </p>
                </div>
             </div>

             <div className="bg-white p-10 md:p-12 rounded-[3.5rem] border border-black/[0.06] shadow-sm">
                <div className="flex items-center gap-5 mb-10">
                  <ShieldAlert size={20} className="text-[#D4AF37]" />
                  <h3 className="text-[11px] uppercase tracking-[0.4em] font-bold text-black/50">Molecular Exclusions</h3>
                </div>
                <div className="flex gap-3 mb-8">
                  <input 
                    type="text" 
                    placeholder="Add Allergy..." 
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addAllergy()}
                    className="flex-1 bg-black/[0.03] rounded-2xl px-6 py-3.5 text-sm outline-none border border-black/[0.05] focus:border-[#D4AF37] transition-all"
                  />
                  <button onClick={addAllergy} className="w-12 h-12 bg-[#0A0A0B] text-white rounded-2xl flex items-center justify-center transition-transform active:scale-95 shadow-md font-bold">+</button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {localPrefs.allergies.map(a => (
                    <span key={a} className="px-5 py-2.5 bg-rose-50/90 text-rose-700 rounded-xl text-[10px] font-bold flex items-center gap-3 border border-rose-100 uppercase tracking-widest shadow-sm">
                      {a} <X size={12} className="cursor-pointer hover:scale-125 transition-all text-rose-400 hover:text-rose-700" onClick={() => removeAllergy(a)} />
                    </span>
                  ))}
                  {localPrefs.allergies.length === 0 && (
                    <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 italic">No exclusions registered.</p>
                  )}
                </div>
             </div>

             <button 
               onClick={handleSave}
               disabled={isSaving}
               className="w-full py-8 bg-[#0A0A0B] text-white rounded-[2.5rem] font-bold text-xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)] flex items-center justify-center gap-5 group transition-all hover:-translate-y-1"
             >
                {isSaving ? <Loader2 size={26} className="animate-spin" /> : (
                  <>
                    <Save size={22} className="text-[#D4AF37]" />
                    <span>Update Protocol</span>
                  </>
                )}
             </button>

             <button 
               onClick={() => setLocalPrefs({ dietary: 'None', allergies: [], cuisinePreference: '', instamartSync: true, highFidelityVisuals: true, apiKey: '' })}
               className="w-full py-5 text-[11px] uppercase tracking-[0.4em] font-bold text-black/40 hover:text-rose-600 transition-colors flex items-center justify-center gap-4 hover:bg-rose-50 rounded-full"
             >
                <Trash2 size={14} /> Reset Defaults
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
