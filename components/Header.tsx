
import React, { useState, useEffect } from 'react';
import { ViewState } from '../types';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Zap, Activity, BookMarked, Sparkles } from 'lucide-react';
import { checkOnlineStatus } from '../services/geminiService';

interface HeaderProps {
  viewState: ViewState;
  onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ viewState, onOpenSettings }) => {
  const [isOnline, setIsOnline] = useState(checkOnlineStatus());

  useEffect(() => {
    const handleStatus = () => setIsOnline(checkOnlineStatus());
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    const interval = setInterval(handleStatus, 5000);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
      clearInterval(interval);
    };
  }, []);

  const steps = [
    { label: 'Inventory', state: ViewState.DASHBOARD },
    { label: 'Synthesis', state: [ViewState.CUISINE_SELECTOR, ViewState.SYNTHESIS] },
    { label: 'Execution', state: ViewState.EXECUTION },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-[100] px-8 md:px-10 py-6 md:py-7 flex justify-between items-center pointer-events-none">
      {/* Logo */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-3.5 pointer-events-auto"
      >
        <div className="w-9 h-9 bg-gradient-to-br from-neutral-900 to-neutral-950 rounded-[14px] flex items-center justify-center border border-primary-500/20 shadow-lg relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 to-primary-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <Sparkles size={16} className="text-primary-400 relative z-10" strokeWidth={2.5} />
        </div>
        <span className="font-black tracking-[-0.02em] text-xl text-neutral-950 select-none">CulinaryLens</span>
        <div className="px-2.5 py-1 bg-primary-500/10 rounded-lg ml-1">
          <span className="text-[9px] font-black uppercase tracking-[0.1em] text-primary-700">Pro</span>
        </div>
      </motion.div>
      
      {/* Navigation */}
      <motion.nav 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex items-center gap-10 px-8 py-3.5 bg-white/70 backdrop-blur-3xl rounded-full pointer-events-auto shadow-[0_8px_32px_-8px_rgba(0,0,0,0.12)] border border-neutral-200/40"
      >
        {steps.map((step, i) => {
          const isActive = Array.isArray(step.state) 
            ? step.state.includes(viewState)
            : step.state === viewState;
          
          return (
            <div key={i} className="relative group cursor-default">
              <span className={`text-[11px] uppercase tracking-[0.12em] font-bold transition-colors duration-500 ${
                isActive ? 'text-neutral-950' : 'text-neutral-400 group-hover:text-neutral-600'
              }`}>
                {step.label}
              </span>
              {isActive && (
                <motion.div 
                  layoutId="header-active-marker"
                  className="absolute -bottom-2 left-0 w-full h-[2px] bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
                  transition={{ type: "spring", stiffness: 380, damping: 38 }}
                />
              )}
            </div>
          );
        })}
      </motion.nav>

      {/* Actions */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex items-center gap-3 pointer-events-auto"
      >
         {/* Online/Offline Status */}
         <div className={`px-5 py-2.5 backdrop-blur-2xl border rounded-full flex items-center gap-3 shadow-md transition-all duration-700 ${
           isOnline 
             ? 'bg-white/80 border-neutral-200/50' 
             : 'bg-neutral-900 border-neutral-700'
         }`}>
            {isOnline ? (
              <>
                <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse shadow-sm shadow-primary-500/50"></div>
                <span className="mono text-[10px] uppercase tracking-[0.12em] font-bold text-neutral-700 flex items-center gap-2">
                  <Zap size={10} strokeWidth={3} /> Cloud
                </span>
              </>
            ) : (
              <>
                <Activity size={10} className="text-primary-400 animate-pulse" strokeWidth={3} />
                <span className="mono text-[10px] uppercase tracking-[0.12em] font-bold text-white flex items-center gap-2">
                   Offline
                </span>
              </>
            )}
         </div>

         {/* Settings Button */}
         <motion.button 
           whileHover={{ scale: 1.05 }}
           whileTap={{ scale: 0.95 }}
           onClick={onOpenSettings}
           className={`w-11 h-11 rounded-full border transition-all duration-500 shadow-md ${
             viewState === ViewState.SETTINGS 
               ? 'bg-gradient-to-br from-neutral-900 to-neutral-950 text-white border-neutral-800 shadow-lg' 
               : 'bg-white/80 text-neutral-600 border-neutral-200/60 hover:bg-neutral-50 hover:text-neutral-900 hover:border-neutral-300'
           }`}
         >
            <SettingsIcon size={16} className="mx-auto" strokeWidth={2.5} />
         </motion.button>
      </motion.div>
    </header>
  );
};

export default Header;
