
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ChefHat } from 'lucide-react';

interface LandingProps {
  onStart: () => void;
}

const Landing: React.FC<LandingProps> = ({ onStart }) => {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center px-8 md:px-16 lg:px-24 text-center overflow-hidden bg-gradient-to-br from-neutral-0 via-neutral-25 to-neutral-50">
      
      {/* Premium Ambient Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ 
            opacity: [0.015, 0.035, 0.015],
            scale: [1, 1.08, 1],
            rotate: [0, 5, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -left-[15%] w-[75%] h-[75%] rounded-full bg-primary-400 blur-[250px]"
        />
        <motion.div 
          animate={{ 
            opacity: [0.012, 0.028, 0.012],
            scale: [1, 1.06, 1],
            rotate: [0, -5, 0]
          }}
          transition={{ duration: 24, repeat: Infinity, delay: 3, ease: "easeInOut" }}
          className="absolute -bottom-[10%] -right-[15%] w-[70%] h-[70%] rounded-full bg-neutral-200 blur-[220px]"
        />
        <motion.div 
          animate={{ 
            opacity: [0.008, 0.018, 0.008],
            scale: [1, 1.04, 1]
          }}
          transition={{ duration: 18, repeat: Infinity, delay: 6, ease: "easeInOut" }}
          className="absolute top-[40%] left-[50%] w-[50%] h-[50%] rounded-full bg-accent-platinum blur-[200px]"
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 max-w-7xl"
      >
        {/* Luxury Badge */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-center gap-4 mb-14"
        >
          <div className="w-[48px] h-[1.5px] bg-gradient-to-r from-transparent via-neutral-300 to-neutral-300"></div>
          <div className="px-5 py-2.5 bg-white/60 backdrop-blur-xl rounded-full border border-neutral-200/60 shadow-sm">
            <div className="flex items-center gap-2.5">
              <ChefHat size={11} className="text-primary-600" strokeWidth={2.5} />
              <span className="text-[10px] uppercase tracking-[0.18em] font-bold text-neutral-700">Michelin Intelligence</span>
              <Sparkles size={11} className="text-primary-500" strokeWidth={2.5} />
            </div>
          </div>
          <div className="w-[48px] h-[1.5px] bg-gradient-to-l from-transparent via-neutral-300 to-neutral-300"></div>
        </motion.div>

        {/* Hero Typography */}
        <motion.h1 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-7xl md:text-8xl lg:text-9xl mb-12 font-black tracking-[-0.04em] text-neutral-950 leading-[0.88] select-none antialiased"
        >
          Culinary<br />
          <span className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 bg-clip-text text-transparent font-serif italic font-normal">Intelligence</span>
        </motion.h1>

        {/* Refined Description */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.3, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-8 mb-20"
        >
          <p className="text-xl md:text-2xl lg:text-3xl text-neutral-600 max-w-3xl mx-auto font-light leading-[1.45] tracking-[-0.01em]">
            Transform raw ingredients into<br className="hidden md:block" />
            <span className="text-neutral-800 font-medium">Michelin-caliber masterpieces</span> with AI-powered<br className="hidden md:block" />
            culinary intelligence
          </p>
          
          {/* Tech Specs - Premium */}
          <div className="flex items-center justify-center gap-6 md:gap-10 opacity-35">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"></div>
              <span className="text-[10px] md:text-xs uppercase tracking-[0.12em] font-semibold text-neutral-700">YOLOv11 Perception</span>
            </div>
            <div className="w-[2px] h-[2px] rounded-full bg-neutral-400"></div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <span className="text-[10px] md:text-xs uppercase tracking-[0.12em] font-semibold text-neutral-700">Gemini Neural Core</span>
            </div>
          </div>
        </motion.div>
        
        {/* Premium CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.button 
            onClick={onStart}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group relative inline-flex items-center gap-12 px-12 md:px-16 py-5 md:py-6 bg-neutral-950 text-white rounded-full overflow-hidden transition-all shadow-[0_24px_64px_-12px_rgba(0,0,0,0.25)] hover:shadow-[0_32px_80px_-12px_rgba(0,0,0,0.35)]"
          >
            {/* Hover Glow Effect */}
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-primary-500/0 via-primary-500/10 to-primary-500/0"
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            />
            
            <span className="relative z-10 font-bold tracking-[0.15em] uppercase text-[11px] md:text-xs">Begin Experience</span>
            
            <motion.div 
              className="w-10 h-10 rounded-full border-2 border-white/15 flex items-center justify-center relative z-10 bg-white/5 backdrop-blur-sm"
              whileHover={{ rotate: 180, scale: 1.1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 13L13 1M13 1H1M13 1V13" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.div>
          </motion.button>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 1.2 }}
          className="mt-16 flex items-center justify-center gap-8 text-neutral-400"
        >
          <div className="text-[10px] uppercase tracking-[0.15em] font-semibold flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            Offline Ready
          </div>
          <div className="w-1 h-1 rounded-full bg-neutral-300"></div>
          <div className="text-[10px] uppercase tracking-[0.15em] font-semibold">Premium Visuals</div>
          <div className="w-1 h-1 rounded-full bg-neutral-300"></div>
          <div className="text-[10px] uppercase tracking-[0.15em] font-semibold">Cloud Powered</div>
        </motion.div>
      </motion.div>
      
      {/* Premium Footer */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 1.5 }}
        className="absolute bottom-10 w-full px-8 md:px-16 flex justify-between items-end opacity-25 pointer-events-none"
      >
        <div className="text-[9px] md:text-[10px] uppercase tracking-[0.18em] font-bold text-neutral-700">
          v2.0 // AAA-Grade
        </div>
        <div className="text-[9px] md:text-[10px] uppercase tracking-[0.18em] font-bold text-neutral-700 text-right">
          Premium Experience
        </div>
      </motion.div>
    </div>
  );
};

export default Landing;
