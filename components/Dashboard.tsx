
import React from 'react';
import { Ingredient, NeuralProtocol } from '../types';
import { BarChart, Bar, ResponsiveContainer, Tooltip, Cell, XAxis, PieChart, Pie } from 'recharts';
import { motion } from 'framer-motion';
import { AlertTriangle, Plus, ShieldCheck, Sun, Eye, PieChart as PieChartIcon } from 'lucide-react';

interface DashboardProps {
  inventory: Ingredient[];
  protocol: NeuralProtocol | null;
  onSynthesize: () => void;
  onAddMore: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ inventory, protocol, onSynthesize, onAddMore }) => {
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
    <div className={`min-h-screen pt-28 pb-16 px-6 md:px-12 max-w-[1800px] mx-auto bg-transparent transition-all duration-700`}>
      <motion.div 
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12"
      >
        
        {/* Left Column: Metrics */}
        <div className="lg:col-span-4 space-y-8">
          <section className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-black/[0.03] shadow-sm">
            <div className="flex justify-between items-start mb-8">
               <h3 className="text-[10px] uppercase tracking-[0.4em] text-black/50 font-bold">Intelligence Context</h3>
               <ShieldCheck className="text-[#C5A028]/60" size={14} />
            </div>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-black/[0.02] flex items-center justify-center">
                    <Sun size={14} className={scanQuality === 'OPTIMAL' ? 'text-emerald-700/70' : 'text-amber-700/70'} />
                 </div>
                 <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-black/80">
                      {scanQuality === 'OPTIMAL' ? 'Fidelity Optimal' : 'Environment Adjusted'}
                    </p>
                    <p className="text-[10px] text-black/50 font-medium uppercase tracking-tight">
                      {scanQuality === 'OPTIMAL' ? 'Perfect lighting detected.' : 'Compensating for shadows.'}
                    </p>
                 </div>
              </div>
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-black/[0.02] flex items-center justify-center">
                    <Eye size={14} className="text-black/40" />
                 </div>
                 <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-black/80">Ocular Boundaries</p>
                    <p className="text-[10px] text-black/50 font-medium uppercase tracking-tight">
                      Verified visible nodes registered.
                    </p>
                 </div>
              </div>
            </div>
          </section>

          {protocol && (
            <motion.section 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-black/[0.03] shadow-sm overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6">
                 <div>
                    <h3 className="text-[10px] uppercase tracking-[0.4em] text-black/50 font-bold">Caloric Blueprint</h3>
                    <p className="text-2xl font-bold tracking-tight mt-1 leading-none text-[#0A0A0B]">Nutrition Matrix</p>
                 </div>
                 <PieChartIcon size={14} className="text-[#C5A028]/60" />
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
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.99 }}
            onClick={onSynthesize}
            className="w-full py-7 bg-[#0A0A0B] text-white rounded-[2rem] font-bold shadow-lg flex items-center justify-center gap-4 transition-all group"
          >
            <span className="tracking-[0.2em] uppercase text-[11px] font-bold">Synthesize Protocol</span>
            <Plus size={18} className="text-[#C5A028] group-hover:rotate-90 transition-transform duration-500" />
          </motion.button>
        </div>

        {/* Right Column: Inventory */}
        <div className="lg:col-span-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-6">
            <div>
              <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-[#C5A028] mb-2 block">Molecular Ledger</span>
              <h2 className="text-5xl md:text-6xl font-bold tracking-tighter text-[#0A0A0B]">Inventory <span className="serif italic text-[#C5A028] font-normal">Manifest</span></h2>
            </div>
            <button 
              onClick={onAddMore}
              className="px-8 py-3.5 bg-white/80 backdrop-blur-md border border-black/[0.08] rounded-full text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#0A0A0B] hover:text-white transition-all shadow-sm"
            >
              Inject Material
            </button>
          </div>

          <div className={`grid ${gridCols} gap-6 md:gap-8`}>
            {inventory.length > 0 ? inventory.map((item, i) => (
              <motion.div 
                key={item.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className={`bg-white ${cardPadding} rounded-[2.5rem] border border-black/[0.03] shadow-sm hover:shadow-md transition-all duration-700 group relative overflow-hidden`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className={`${titleSize} font-bold tracking-tighter mb-1 text-[#0A0A0B] line-clamp-1`}>
                      <span className="text-black/30 font-medium">{getHumilityPrefix(item.confidence)}</span>{item.name}
                    </h4>
                    <span className="mono text-[9px] text-black/40 uppercase tracking-[0.15em] font-bold italic">{item.scientificName}</span>
                  </div>
                  {item.expires_in_days <= 2 && (
                    <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center">
                       <AlertTriangle size={12} className="text-rose-600/60" />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="h-[2px] bg-black/[0.03] rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.vitality_score}%` }}
                      transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
                      className={`h-full transition-all duration-1000 ${item.vitality_score < 40 ? 'bg-rose-500/50' : 'bg-[#C5A028]/50'}`}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[9px] uppercase font-bold tracking-[0.3em] text-black/40">
                    <span>Vitality</span>
                    <span>{item.vitality_score}%</span>
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
    </div>
  );
};

export default Dashboard;
