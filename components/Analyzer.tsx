
import React, { useState, useRef } from 'react';
import { refineManifestWithEnsemble, auditRecall, checkOnlineStatus } from '../services/geminiService';
import { run_perception_pipeline, run_targeted_rescan } from '../perception/pipeline';
import { Ingredient, AnalysisStep } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, ShieldCheck, Cpu, Search, Sparkles, Database, Layers, AlertTriangle, ZapOff, Upload, CheckCircle2 } from 'lucide-react';
import { registry } from '../services/modelRegistry';

interface AnalyzerProps {
  onComplete: (ingredients: Ingredient[]) => void;
}

const INITIAL_STEPS: AnalysisStep[] = [
  { id: 'detect', label: 'Optical Initialization', status: 'pending' },
  { id: 'segment', label: 'Boundary Refinement', status: 'pending' },
  { id: 'audit', label: 'Semantic Recall Audit', status: 'pending' },
  { id: 'rescan', label: 'Targeted Re-scan', status: 'pending' },
  { id: 'fuse', label: 'Manifest Fusion', status: 'pending' }
];

const Analyzer: React.FC<AnalyzerProps> = ({ onComplete }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Initializing System...");
  const [steps, setSteps] = useState<AnalysisStep[]>(INITIAL_STEPS);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isOnline = checkOnlineStatus();

  const updateStep = (id: string, status: AnalysisStep['status']) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = (event.target?.result as string).split(',')[1];
      setIsAnalyzing(true);
      setError(null);
      setSteps(INITIAL_STEPS);
      
      try {
        updateStep('detect', 'active');
        setProgress(15);
        const primaryManifest = await run_perception_pipeline(base64, (msg) => setStatusText(msg));
        updateStep('detect', 'complete');
        updateStep('segment', 'complete');

        await new Promise(r => setTimeout(r, 600));

        updateStep('audit', 'active');
        setStatusText(isOnline ? "Identifying hidden items..." : "Local Edge prediction active...");
        setProgress(55);
        const hypotheses = await auditRecall(primaryManifest);
        updateStep('audit', 'complete');

        updateStep('rescan', 'active');
        setStatusText("Validating inferred materials...");
        setProgress(75);
        const recoveredItems = await run_targeted_rescan(base64, hypotheses);
        const aggregatedManifest = [...primaryManifest, ...recoveredItems];
        updateStep('rescan', 'complete');

        updateStep('fuse', 'active');
        setStatusText("Consolidating inventory...");
        setProgress(90);
        const ensembleIngredients = await refineManifestWithEnsemble(aggregatedManifest);
        updateStep('fuse', 'complete');

        setProgress(100);
        setStatusText("Inference Complete.");
        setTimeout(() => onComplete(ensembleIngredients), 800);
      } catch (err: any) {
        setIsAnalyzing(false);
        setError("Critical analysis failure. Check configuration.");
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-8 md:px-16 flex flex-col items-center justify-center bg-gradient-to-br from-neutral-0 via-neutral-25 to-neutral-50">
      <AnimatePresence mode="wait">
        {!isAnalyzing ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="max-w-4xl w-full flex flex-col items-center">
            <div className="text-center mb-12">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="flex items-center justify-center gap-3 mb-8"
              >
                <div className="px-4 py-2 bg-white/70 backdrop-blur-xl rounded-full border border-neutral-200/50 shadow-sm">
                  <div className="flex items-center gap-2">
                    {isOnline ? <ShieldCheck size={11} className="text-primary-600" strokeWidth={2.5} /> : <ZapOff size={11} className="text-neutral-600" strokeWidth={2.5} />}
                    <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-neutral-700">
                      {isOnline ? 'Neural Network Online' : 'Offline Edge Processing'}
                    </span>
                  </div>
                </div>
              </motion.div>
              <motion.h2 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-5xl md:text-6xl lg:text-7xl font-black tracking-[-0.03em] mb-6 text-neutral-950 leading-[0.92] antialiased"
              >
                Visual <span className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 bg-clip-text text-transparent font-serif italic font-normal">Analysis</span>
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.5 }}
                className="text-neutral-600 text-base md:text-lg font-light max-w-2xl mx-auto leading-[1.6] tracking-[-0.01em]"
              >
                {isOnline 
                  ? 'Multi-stage cloud-accelerated perception pipeline for maximum precision.'
                  : `Powered by ${registry.getStats().totalModels} local edge models for offline intelligence.`}
              </motion.p>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.96 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ duration: 0.4 }}
                className="mb-12 p-6 md:p-7 bg-gradient-to-br from-red-50 to-rose-50 border border-red-200/60 rounded-[2.5rem] flex items-center gap-5 text-red-800 shadow-lg"
              >
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle size={18} className="text-red-600" strokeWidth={2.5} />
                </div>
                <div className="text-xs font-semibold uppercase tracking-[0.08em]">{error}</div>
              </motion.div>
            )}

            <motion.div 
              onClick={() => fileInputRef.current?.click()} 
              whileHover={{ y: -3 }} 
              whileTap={{ scale: 0.995 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative aspect-video w-full max-w-3xl rounded-[3rem] bg-white/80 backdrop-blur-2xl flex flex-col items-center justify-center shadow-[0_24px_80px_-12px_rgba(0,0,0,0.12)] border border-neutral-200/60 cursor-pointer group overflow-hidden"
            >
              {/* Subtle hover effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/[0.02] via-transparent to-primary-600/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <motion.div 
                className="w-20 h-20 rounded-3xl bg-gradient-to-br from-neutral-900 to-neutral-950 flex items-center justify-center mb-5 shadow-xl relative z-10"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <Camera color="#D4AF37" size={28} strokeWidth={2} />
              </motion.div>
              
              <div className="relative z-10 space-y-2">
                <span className="text-xs uppercase tracking-[0.15em] font-bold text-neutral-800 block">Upload Image</span>
                <span className="text-[10px] uppercase tracking-[0.12em] font-medium text-neutral-400 block">Click to begin analysis</span>
              </div>
              
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </motion.div>
          </motion.div>
        ) : (
          <motion.div key="analyzing" className="fixed inset-0 z-[200] flex items-center justify-center bg-gradient-to-br from-neutral-0 via-neutral-25 to-neutral-50 backdrop-blur-3xl px-8">
            <motion.div 
              initial={{ scale: 0.96, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-3xl bg-white/70 backdrop-blur-3xl rounded-[4rem] shadow-[0_32px_96px_-12px_rgba(0,0,0,0.18)] border border-neutral-200/40 overflow-hidden"
            >
              <div className="p-12 md:p-16">
                <div className="flex justify-between items-end mb-12">
                   <div>
                      <h4 className="text-3xl md:text-4xl font-black tracking-[-0.02em] mb-2 text-neutral-950">
                        {isOnline ? 'Processing' : 'Edge Computing'}
                      </h4>
                      <p className="text-xs uppercase tracking-[0.12em] font-semibold text-neutral-500">{statusText}</p>
                   </div>
                   <div className="px-5 py-2.5 bg-neutral-950 rounded-full">
                     <span className="mono text-sm font-bold text-primary-400">{progress}%</span>
                   </div>
                </div>

                {/* Premium Progress Bar */}
                <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden mb-16 shadow-inner">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 relative overflow-hidden"
                    initial={{ width: 0 }} 
                    animate={{ width: `${progress}%` }} 
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  </motion.div>
                </div>

                {/* Premium Steps Grid */}
                <div className="grid grid-cols-5 gap-4">
                   {steps.map((step) => (
                     <motion.div 
                       key={step.id} 
                       className="relative flex flex-col items-center text-center"
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: 0.1 * steps.indexOf(step) }}
                     >
                        <motion.div 
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500 ${
                            step.status === 'complete' ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/20' : 
                            step.status === 'active' ? 'bg-gradient-to-br from-neutral-900 to-neutral-950 text-white shadow-xl ring-2 ring-primary-500/30' : 'bg-neutral-100 text-neutral-300'
                          }`}
                        >
                           {step.id === 'detect' && <Cpu size={18} strokeWidth={2.5} />}
                           {step.id === 'segment' && <Layers size={18} strokeWidth={2.5} />}
                           {step.id === 'audit' && <Search size={18} strokeWidth={2.5} />}
                           {step.id === 'rescan' && <Sparkles size={18} strokeWidth={2.5} />}
                           {step.id === 'fuse' && <Database size={18} strokeWidth={2.5} />}
                        </motion.div>
                        <span className={`text-[9px] uppercase tracking-[0.12em] font-bold leading-tight transition-all duration-700 ${
                          step.status === 'active' ? 'opacity-100 text-neutral-900' : 
                          step.status === 'complete' ? 'opacity-60 text-neutral-600' : 'opacity-25 text-neutral-400'
                        }`}>
                           {step.label}
                        </span>
                     </motion.div>
                   ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Analyzer;
