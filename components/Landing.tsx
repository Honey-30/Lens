
import React from 'react';
import { motion } from 'framer-motion';

interface LandingProps {
  onStart: () => void;
}

const Landing: React.FC<LandingProps> = ({ onStart }) => {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center px-12 text-center overflow-hidden bg-white">
      
      {/* Sovereign Ambient Layers */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ 
            opacity: [0.01, 0.03, 0.01],
            scale: [1, 1.05, 1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[15%] -left-[10%] w-[70%] h-[70%] rounded-full bg-[#C5A028] blur-[200px]"
        />
        <motion.div 
          animate={{ 
            opacity: [0.01, 0.02, 0.01],
            scale: [1, 1.03, 1]
          }}
          transition={{ duration: 18, repeat: Infinity, delay: 2, ease: "linear" }}
          className="absolute bottom-[0%] -right-[10%] w-[60%] h-[60%] rounded-full bg-[#E2E4EB] blur-[180px]"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 max-w-6xl"
      >
        <div className="flex items-center justify-center gap-5 mb-12 opacity-40">
          <div className="w-[30px] h-[1px] bg-black"></div>
          <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-[#0A0A0B]">Cognitive Gastronomy</span>
          <div className="w-[30px] h-[1px] bg-black"></div>
        </div>

        <h1 className="text-7xl md:text-[7.5rem] mb-10 font-bold tracking-tighter text-[#0A0A0B] leading-[0.9] select-none">
          Architecture <br />
          <span className="serif italic text-[#C5A028] font-normal">of</span> Flavor
        </h1>

        <div className="space-y-6 mb-16">
          <p className="text-xl md:text-2xl text-black/50 max-w-2xl mx-auto font-light leading-relaxed tracking-tight">
            Bridging raw biological inventory with <br />Michelin-grade execution through high-fidelity perception.
          </p>
          <div className="flex items-center justify-center gap-8 opacity-25">
            <span className="mono text-[9px] uppercase tracking-[0.3em] font-bold">Inference v11.4</span>
            <div className="w-1 h-1 rounded-full bg-black"></div>
            <span className="mono text-[9px] uppercase tracking-[0.3em] font-bold">Neural Core Optimized</span>
          </div>
        </div>
        
        <motion.button 
          onClick={onStart}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.99 }}
          className="group relative inline-flex items-center gap-10 px-16 py-6 bg-[#0A0A0B] text-white rounded-full overflow-hidden transition-all shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)]"
        >
          <span className="relative z-10 font-bold tracking-[0.35em] uppercase text-[10px]">Initialize Matrix</span>
          <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center relative z-10 transition-transform duration-1000 group-hover:rotate-[135deg]">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 11L11 1M11 1H1M11 1V11" stroke="#C5A028" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </motion.button>
      </motion.div>
      
      {/* Sovereign Footer */}
      <div className="absolute bottom-8 w-full px-12 flex justify-between items-end opacity-30 pointer-events-none">
        <div className="text-[9px] uppercase tracking-[0.5em] font-bold text-[#0A0A0B]">
          Build 11.4.2 // Core
        </div>
        <div className="text-[9px] uppercase tracking-[0.5em] font-bold text-[#0A0A0B] text-right">
          Sovereign Minimalism
        </div>
      </div>
    </div>
  );
};

export default Landing;
