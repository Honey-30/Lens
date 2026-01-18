
import React, { useState } from 'react';
import { Ingredient, NeuralProtocol, UserPreferences } from '../types';
import { synthesizeProtocol } from '../services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Terminal, Shield, Check, Globe, X, Search } from 'lucide-react';

interface CuisineSelectorProps {
  inventory: Ingredient[];
  onProtocolSelected: (protocol: NeuralProtocol) => void;
  onBack: () => void;
}

const CUISINES = [
  { id: 'french', name: 'French', desc: 'Technique-heavy, precision emulsions.' },
  { id: 'japanese', name: 'Japanese', desc: 'Minimalist purity, technical umami.' },
  { id: 'indian', name: 'Indian', desc: 'Complex spice architecture.' },
  { id: 'italian', name: 'Italian', desc: 'Product-focused rusticity.' },
  { id: 'nordic', name: 'Neo-Nordic', desc: 'Foraged, technical fermentation.' },
  { id: 'mexican', name: 'Mexican', desc: 'Acid and heat molecular balance.' },
];

const DIETARY = ['None', 'Vegan', 'Vegetarian', 'Keto', 'Paleo'];

const CuisineSelector: React.FC<CuisineSelectorProps> = ({ inventory, onProtocolSelected, onBack }) => {
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [customCuisine, setCustomCuisine] = useState('');
  const [dietary, setDietary] = useState<any>('None');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [newAllergy, setNewAllergy] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Add missing properties required by UserPreferences interface
    const prefs: UserPreferences = {
      dietary,
      allergies,
      cuisinePreference: customCuisine || selectedCuisine || 'Global Modern',
      instamartSync: true,
      highFidelityVisuals: true
    };
    try {
      const protocol = await synthesizeProtocol(inventory, prefs);
      onProtocolSelected(protocol);
    } catch (err) {
      console.error(err);
      setIsGenerating(false);
    }
  };

  const addAllergy = () => {
    if (newAllergy && !allergies.includes(newAllergy)) {
      setAllergies([...allergies, newAllergy]);
      setNewAllergy('');
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 px-12 flex flex-col items-center">
      <div className="max-w-7xl w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 flex justify-between items-end">
          <div>
            <h2 className="text-6xl font-bold tracking-tighter mb-4 text-[#1A1A1D]">Protocol <span className="serif italic text-[#D4AF37]">Calibration</span></h2>
            <p className="text-[#1A1A1D]/30 text-lg font-light max-w-xl">Configure the neural engine for your geographic and biological requirements.</p>
          </div>
          <button onClick={onBack} className="text-[10px] uppercase tracking-[0.4em] font-bold text-[#D4D6E0] hover:text-[#1A1A1D]">Abort Calibration</button>
        </motion.div>

        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div key="generating" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-40 glass-premium rounded-[3rem]">
              <div className="relative mb-12">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} className="w-40 h-40 border-[1px] border-[#D4D6E0]/20 rounded-full flex items-center justify-center">
                   <div className="w-4 h-4 bg-[#D4AF37] rounded-full blur-[4px] absolute top-0 left-1/2 -translate-x-1/2"></div>
                </motion.div>
                <div className="absolute inset-0 flex items-center justify-center"><Sparkles className="text-[#D4AF37]/40" size={32} /></div>
              </div>
              <h3 className="text-4xl font-bold tracking-tighter mb-4">Processing Neural Path</h3>
              <p className="mono text-[10px] uppercase tracking-[0.4em] font-bold opacity-40">Synthesizing Molecular Affinity...</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
              <div className="lg:col-span-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {CUISINES.map((c) => (
                    <div 
                      key={c.id} 
                      onClick={() => { setSelectedCuisine(c.name); setCustomCuisine(''); }}
                      className={`p-8 rounded-[2.5rem] cursor-pointer border transition-all duration-500 ${selectedCuisine === c.name ? 'bg-[#1A1A1D] text-white border-black shadow-2xl' : 'glass-premium border-black/[0.03] opacity-60 hover:opacity-100'}`}
                    >
                      <h4 className="text-2xl font-bold tracking-tight mb-2">{c.name}</h4>
                      <p className={`text-[11px] leading-relaxed ${selectedCuisine === c.name ? 'opacity-60' : 'opacity-40'}`}>{c.desc}</p>
                    </div>
                  ))}
                </div>
                
                <div className="glass-premium p-10 rounded-[2.5rem] border-black/[0.03]">
                  <div className="flex items-center gap-4 mb-6">
                    <Globe size={18} className="text-[#D4AF37]" />
                    <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold">Custom Region Selection</h3>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Search by country or regional style..."
                    value={customCuisine}
                    onChange={(e) => { setCustomCuisine(e.target.value); setSelectedCuisine(null); }}
                    className="w-full bg-transparent border-b border-black/10 py-4 text-2xl font-bold tracking-tight outline-none placeholder:opacity-10"
                  />
                </div>
              </div>

              <div className="lg:col-span-4 space-y-8">
                <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-black/[0.02]">
                  <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-30 mb-8">Bio-Constraints</h3>
                  <div className="space-y-4">
                    {DIETARY.map(d => (
                      <button 
                        key={d} 
                        onClick={() => setDietary(d)}
                        className={`w-full flex justify-between items-center px-6 py-4 rounded-2xl border transition-all ${dietary === d ? 'border-[#D4AF37] bg-[#D4AF37]/5 font-bold' : 'border-black/5 opacity-40'}`}
                      >
                        <span className="text-[11px] uppercase tracking-widest">{d}</span>
                        {dietary === d && <Check size={14} className="text-[#D4AF37]" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-black/[0.02]">
                  <h3 className="text-[10px] uppercase tracking-[0.4em] font-bold opacity-30 mb-8">Molecular Barriers (Allergies)</h3>
                  <div className="flex gap-2 mb-6">
                    <input 
                      type="text" 
                      placeholder="e.g. Shellfish" 
                      value={newAllergy}
                      onChange={(e) => setNewAllergy(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addAllergy()}
                      className="flex-1 bg-black/5 rounded-full px-6 py-3 text-xs outline-none"
                    />
                    <button onClick={addAllergy} className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center">+</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {allergies.map(a => (
                      <span key={a} className="px-4 py-2 bg-rose-50 text-rose-600 rounded-full text-[9px] font-bold flex items-center gap-2">
                        {a} <X size={10} className="cursor-pointer" onClick={() => setAllergies(allergies.filter(x => x !== a))} />
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>

        {!isGenerating && (
          <div className="flex justify-center">
            <motion.button 
              disabled={!selectedCuisine && !customCuisine}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGenerate}
              className={`px-24 py-8 rounded-full text-xl font-bold transition-all duration-700 uppercase tracking-widest ${
                (selectedCuisine || customCuisine) ? 'bg-[#1A1A1D] text-white shadow-2xl' : 'bg-gray-100 text-gray-300 cursor-not-allowed'
              }`}
            >
              Initialize Synthesis
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CuisineSelector;
