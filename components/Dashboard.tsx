
import React, { useState } from 'react';
import { Ingredient, NeuralProtocol } from '../types';
import { BarChart, Bar, ResponsiveContainer, Tooltip, Cell, XAxis, PieChart, Pie } from 'recharts';
import { motion } from 'framer-motion';
import { AlertTriangle, Plus, ShieldCheck, Sun, Eye, PieChart as PieChartIcon, Brain, Sparkles } from 'lucide-react';
import OfflineIntelligence from './OfflineIntelligence';

interface DashboardProps {
  inventory: Ingredient[];
  protocol: NeuralProtocol | null;
  onSynthesize: () => void;
  onAddMore: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ inventory, protocol, onSynthesize, onAddMore }) => {
  const [showIntelligence, setShowIntelligence] = useState(false);
  
  const wasteData = [
    { name: 'M', rescued: 12 }, { name: 'T', rescued: 8 }, { name: 'W', rescued: 25 },
    { name: 'T', rescued: 15 }, { name: 'F', rescued: 42 }, { name: 'S', rescued: 30 }, { name: 'S', rescued: 18 },
  ];

  const macroData = protocol ? [
    { name: 'Protein', value: protocol.nutrition.protein, color: '#C5A028' },
    { name: 'Carbs', value: protocol.nutrition.carbs, color: '#E2E4EB' },
    { name: 'Fat', value: protocol.nutrition.fat, color: '#0A0A0B' },
  ] : [];

  const getHumilityPrefix = (confidence: number) => {
    if (confidence >= 0.7) return "";
    if (confidence >= 0.4) return "Likely ";
    return "Potential ";
  };

  const scanQuality = inventory.length > 0 
    ? inventory.every(i => i.confidence > 0.6) ? 'OPTIMAL' : 'LIMITED'
    : 'IDLE';

  // Dynamic Layout Logic
  const isHighDensity = inventory.length > 8;
  const gridCols = isHighDensity ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1 md:grid-cols-2";
  const cardPadding = isHighDensity ? "p-6" : "p-8";
  const titleSize = isHighDensity ? "text-xl" : "text-2xl";

  return (
    <div className="min-h-screen pt-32 pb-24 px-8 md:px-16 max-w-[1900px] mx-auto bg-gradient-to-br from-neutral-0 via-neutral-25 to-neutral-50 transition-all duration-700">
      <motion.div 
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14"
      >
        
        {/* Left Column: Metrics */}
        <div className="lg:col-span-4 space-y-10">
          <section className="bg-white/70 backdrop-blur-2xl p-10 md:p-12 rounded-[3rem] border border-neutral-200/40 shadow-lg">
            <div className="flex justify-between items-start mb-10">
               <h3 className="text-xs uppercase tracking-[0.15em] text-neutral-500 font-bold">Intelligence Context</h3>
               <ShieldCheck className="text-primary-600/70" size={16} strokeWidth={2.5} />
            </div>
            <div className="space-y-7">
              <div className="flex items-center gap-5">
                 <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center shadow-inner">
                    <Sun size={16} className={scanQuality === 'OPTIMAL' ? 'text-emerald-600' : 'text-amber-600'} strokeWidth={2.5} />
                 </div>
                 <div>
                    <p className="text-xs font-bold uppercase tracking-[0.08em] text-neutral-800 mb-1">
                      {scanQuality === 'OPTIMAL' ? 'Optimal Fidelity' : 'Compensated Detection'}
                    </p>
                    <p className="text-[11px] text-neutral-500 font-medium">
                      {scanQuality === 'OPTIMAL' ? 'Perfect lighting conditions' : 'Shadow compensation active'}
                    </p>
                 </div>
              </div>
              <div className="flex items-center gap-5">
                 <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center shadow-inner">
                    <Eye size={16} className="text-neutral-600" strokeWidth={2.5} />
                 </div>
                 <div>
                    <p className="text-xs font-bold uppercase tracking-[0.08em] text-neutral-800 mb-1">Visual Boundaries</p>
                    <p className="text-[11px] text-neutral-500 font-medium">
                      All visible elements registered
                    </p>
                 </div>
              </div>
            </div>
          </section>

          {protocol && (
            <motion.section 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white/70 backdrop-blur-2xl p-10 md:p-12 rounded-[3rem] border border-neutral-200/40 shadow-lg overflow-hidden"
            >
              <div className="flex justify-between items-start mb-8">
                 <div>
                    <h3 className="text-xs uppercase tracking-[0.15em] text-neutral-500 font-bold mb-2">Nutritional Analysis</h3>
                    <p className="text-3xl font-black tracking-tight leading-none text-neutral-950">Macro Balance</p>
                 </div>
                 <PieChartIcon size={16} className="text-primary-600/70" strokeWidth={2.5} />
              </div>
              <div className="h-48 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={macroData} 
                      innerRadius={55} 
                      outerRadius={75} 
                      paddingAngle={10} 
                      dataKey="value"
                      stroke="none"
                      animationDuration={1500}
                    >
                      {macroData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', fontSize: '11px', fontWeight: 'bold'}}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between items-center pt-6 border-t border-black/[0.03] px-1">
                 <div>
                    <p className="text-4xl font-bold tracking-tighter text-[#0A0A0B]">{protocol.nutrition.calories}</p>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-black/40 font-bold">Net kcal</p>
                 </div>
                 <div className="px-4 py-1.5 bg-black/[0.02] rounded-full text-[9px] font-bold uppercase tracking-[0.15em] text-[#C5A028]">Bio-Mapped</div>
              </div>
            </motion.section>
          )}

          <section className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-black/[0.03] shadow-sm">
            <h3 className="text-[10px] uppercase tracking-[0.4em] text-black/50 mb-8 font-bold">Waste Minimization</h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={wasteData}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#0A0A0B', opacity: 0.5, fontWeight: 700}} dy={10} />
                  <Bar dataKey="rescued" radius={[4, 4, 4, 4]} barSize={10}>
                    {wasteData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.rescued > 30 ? '#C5A028' : '#F5F5F7'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <motion.button 
            whileHover={{ y: -6, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSynthesize}
            className="w-full py-8 bg-gradient-to-br from-neutral-900 to-neutral-950 text-white rounded-[2.5rem] font-bold shadow-2xl flex items-center justify-center gap-4 transition-all group overflow-hidden relative"
          >
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-primary-500/0 via-primary-500/20 to-primary-500/0"
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
            />
            <span className="relative z-10 tracking-[0.12em] uppercase text-xs font-black">Generate Protocol</span>
            <Plus size={20} className="relative z-10 text-primary-400 group-hover:rotate-180 transition-transform duration-700" strokeWidth={2.5} />
          </motion.button>
        </div>

        {/* Right Column: Inventory */}
        <div className="lg:col-span-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-14 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></div>
                <span className="text-xs uppercase tracking-[0.15em] font-bold text-primary-600">Active Inventory</span>
              </div>
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-[-0.03em] text-neutral-950 leading-none">
                Material <span className="bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent font-serif italic font-normal">Manifest</span>
              </h2>
            </div>
            <motion.button 
              onClick={onAddMore}
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 bg-white/80 backdrop-blur-xl border border-neutral-200/60 rounded-2xl text-xs uppercase tracking-[0.12em] font-bold hover:bg-neutral-950 hover:text-white hover:border-neutral-950 transition-all shadow-md"
            >
              Add Materials
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {inventory.length > 0 ? inventory.map((item, i) => (
              <motion.div 
                key={item.id} 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="bg-white/70 backdrop-blur-2xl p-7 md:p-8 rounded-[2.5rem] border border-neutral-200/40 shadow-lg hover:shadow-2xl transition-all duration-500 group relative overflow-hidden"
              >
                {/* Hover gradient effect */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                />
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-2xl font-black tracking-tight mb-1.5 text-neutral-950 line-clamp-1">
                        <span className="text-neutral-400 font-semibold text-base">{getHumilityPrefix(item.confidence)}</span>{item.name}
                      </h4>
                      <span className="mono text-[10px] text-neutral-500 uppercase tracking-[0.1em] font-semibold italic">{item.scientificName}</span>
                    </div>
                    {item.expires_in_days <= 2 && (
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-100 to-rose-50 flex items-center justify-center shadow-sm ml-3">
                         <AlertTriangle size={14} className="text-rose-600" strokeWidth={2.5} />
                      </div>
                    )}
                  </div>

                  <div className="space-y-5">
                    <div className="h-2.5 bg-neutral-100 rounded-full overflow-hidden shadow-inner">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${item.vitality_score}%` }}
                        transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
                        className={`h-full rounded-full transition-all duration-1000 ${
                          item.vitality_score < 40 ? 'bg-gradient-to-r from-rose-500 to-rose-600' : 'bg-gradient-to-r from-primary-500 to-primary-600'
                        }`}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-[0.12em] text-neutral-600">
                      <span>Vitality Index</span>
                      <span className="text-neutral-900">{item.vitality_score}%</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="col-span-full py-32 flex flex-col items-center justify-center bg-white rounded-[3rem] border border-dashed border-black/[0.08]">
                <p className="text-2xl font-light text-black/30 italic serif mb-8">Manifest currently void.</p>
                <motion.button 
                  whileHover={{ y: -2 }}
                  onClick={onAddMore}
                  className="px-12 py-5 bg-[#0A0A0B] text-white rounded-full text-[11px] uppercase tracking-[0.4em] font-bold shadow-md"
                >
                  Initiate Optical Scan
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Offline Intelligence Modal */}
      {showIntelligence && (
        <OfflineIntelligence
          isOpen={showIntelligence}
          onClose={() => setShowIntelligence(false)}
          currentInventory={inventory}
        />
      )}

      {/* Floating Intelligence Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowIntelligence(true)}
        className="fixed bottom-12 right-12 w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 shadow-2xl flex items-center justify-center z-50 hover:shadow-3xl transition-all group"
      >
        <Brain size={32} className="text-white group-hover:scale-110 transition-transform" strokeWidth={2.5} />
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center">
          <Sparkles size={16} className="text-white" strokeWidth={3} />
        </div>
      </motion.button>
    </div>
  );
};

export default Dashboard;
