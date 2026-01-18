
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { NeuralProtocol, ChatMessage } from '../types';
import { synthesizeVoiceInstruction, verifyTechnique, askSousChef } from '../services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Volume2, Camera, X, Trophy, Activity, 
  CheckCircle2, Zap, Timer, ArrowRight, ThumbsUp, ThumbsDown, 
  Minus, MessageSquare, Send, Loader2, Sparkles, AlertCircle, 
  Play, Pause, RotateCcw, Target, ChefHat, Clock, Flame, Award
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ExecutionModeProps {
  protocol: NeuralProtocol;
  onComplete: () => void;
}

const ExecutionMode: React.FC<ExecutionModeProps> = ({ protocol, onComplete }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{ success: boolean; feedback: string } | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  
  // Timer States
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  
  const currentStep = protocol.instructions[currentStepIndex];

  useEffect(() => {
    if (currentStep.timer_seconds) {
      setTimeLeft(currentStep.timer_seconds);
      setIsTimerRunning(false);
    } else {
      setTimeLeft(0);
      setIsTimerRunning(false);
    }
    setVerificationResult(null);
  }, [currentStepIndex, currentStep.timer_seconds]);

  useEffect(() => {
    let interval: number;
    if (isTimerRunning && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      handleTimerComplete();
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const handleTimerComplete = () => {
    playVoice("Precision cycle complete. Advance to the next phase.");
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.type = 'sine'; osc.frequency.setValueAtTime(1000, audioCtx.currentTime);
    gain.gain.setValueAtTime(0, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.05);
    gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.6);
    osc.start(); osc.stop(audioCtx.currentTime + 0.6);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const stopAudio = useCallback(() => {
    if (audioSourceRef.current) {
      try { audioSourceRef.current.stop(); } catch (e) { }
      audioSourceRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const playVoice = useCallback(async (text: string) => {
    stopAudio();
    setIsPlaying(true);
    try {
      const buffer = await synthesizeVoiceInstruction(text);
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = ctx;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.onended = () => { setIsPlaying(false); audioSourceRef.current = null; };
      audioSourceRef.current = source;
      source.start();
    } catch (err) { setIsPlaying(false); }
  }, [stopAudio]);

  const handlePrev = () => {
    stopAudio();
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      setVerificationResult(null);
    }
  };

  const handleNext = () => {
    stopAudio();
    if (currentStepIndex < protocol.instructions.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setVerificationResult(null);
    } else {
      setIsFinished(true);
    }
  };

  const initiateVerification = async () => {
    setVerificationError(null);
    setIsVerifying(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
      
      setTimeout(async () => {
        if (videoRef.current && canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            ctx.drawImage(videoRef.current, 0, 0);
            const base64 = canvasRef.current.toDataURL('image/jpeg').split(',')[1];
            const res = await verifyTechnique(base64, currentStep.instruction);
            setVerificationResult(res);
          }
          setIsVerifying(false);
          stream.getTracks().forEach(track => track.stop());
        }
      }, 2500);
    } catch (err) {
      setIsVerifying(false);
      setVerificationError("Optical gateway offline. Please verify hardware permissions.");
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || isAssistantTyping) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg, timestamp: Date.now() }]);
    setIsAssistantTyping(true);
    try {
      const response = await askSousChef(userMsg, protocol, currentStepIndex);
      setChatHistory(prev => [...prev, { role: 'assistant', content: response, timestamp: Date.now() }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'assistant', content: "Neural handshake timed out.", timestamp: Date.now() }]);
    } finally {
      setIsAssistantTyping(false);
    }
  };

  // Adaptive Typography Logic - Premium, readable sizing
  const instructionLength = currentStep.instruction.length;
  let instructionFontSize = "text-2xl md:text-3xl lg:text-4xl";
  if (instructionLength > 150) {
    instructionFontSize = "text-lg md:text-xl lg:text-2xl";
  } else if (instructionLength > 100) {
    instructionFontSize = "text-xl md:text-2xl lg:text-3xl";
  }

  const containerPadding = instructionLength > 150 ? "pt-12 pb-8" : "pt-20 pb-12";

  if (isFinished) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-neutral-50 via-white to-primary-50/30 z-[300] overflow-y-auto pt-32 pb-24 px-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-6xl mx-auto text-center space-y-16"
        >
           {/* Completion Header */}
           <div className="flex flex-col items-center gap-8">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="relative"
              >
                <div className="w-32 h-32 bg-gradient-to-br from-primary-500 to-primary-600 rounded-[3rem] flex items-center justify-center shadow-2xl">
                  <Trophy size={56} className="text-white" strokeWidth={2.5} />
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="absolute -top-3 -right-3 w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-xl"
                >
                  <CheckCircle2 size={32} className="text-white" strokeWidth={3} />
                </motion.div>
              </motion.div>
              
              <div className="space-y-4">
                <motion.h2 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-8xl font-black tracking-tight text-neutral-900"
                >
                  Culinary Masterpiece <span className="text-primary-600">Complete</span>
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-lg font-bold uppercase tracking-wider text-neutral-500"
                >
                  {protocol.name} · {protocol.cuisineStyle}
                </motion.p>
              </div>
           </div>
           
           {/* Achievement Stats */}
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.5 }}
             className="grid grid-cols-1 md:grid-cols-4 gap-6"
           >
             <div className="p-8 bg-white/80 backdrop-blur-xl rounded-3xl border border-neutral-200/60 shadow-xl">
               <div className="flex items-center justify-center mb-4">
                 <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                   <CheckCircle2 size={28} className="text-white" strokeWidth={2.5} />
                 </div>
               </div>
               <div className="text-5xl font-black text-neutral-900 mb-2">{protocol.instructions.length}</div>
               <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Steps Completed</div>
             </div>

             <div className="p-8 bg-white/80 backdrop-blur-xl rounded-3xl border border-neutral-200/60 shadow-xl">
               <div className="flex items-center justify-center mb-4">
                 <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center">
                   <ChefHat size={28} className="text-white" strokeWidth={2.5} />
                 </div>
               </div>
               <div className="text-5xl font-black text-neutral-900 mb-2 capitalize">{protocol.difficulty}</div>
               <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Difficulty Level</div>
             </div>

             <div className="p-8 bg-white/80 backdrop-blur-xl rounded-3xl border border-neutral-200/60 shadow-xl">
               <div className="flex items-center justify-center mb-4">
                 <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                   <Clock size={28} className="text-white" strokeWidth={2.5} />
                 </div>
               </div>
               <div className="text-5xl font-black text-neutral-900 mb-2">
                 {Math.round(protocol.instructions.reduce((acc, s) => acc + (s.timer_seconds || 0), 0) / 60)}
               </div>
               <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Minutes Invested</div>
             </div>

             <div className="p-8 bg-white/80 backdrop-blur-xl rounded-3xl border border-neutral-200/60 shadow-xl">
               <div className="flex items-center justify-center mb-4">
                 <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center">
                   <Flame size={28} className="text-white" strokeWidth={2.5} />
                 </div>
               </div>
               <div className="text-5xl font-black text-neutral-900 mb-2">
                 {protocol.nutritionalProfile?.calories || 'N/A'}
               </div>
               <div className="text-xs font-bold uppercase tracking-wider text-neutral-500">Calories Created</div>
             </div>
           </motion.div>
           
           {/* Action Buttons */}
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.6 }}
             className="flex justify-center gap-6"
           >
              <button 
                onClick={onComplete} 
                className="px-20 py-6 bg-gradient-to-r from-neutral-900 to-neutral-800 text-white rounded-full font-black text-sm uppercase tracking-wider shadow-2xl hover:from-primary-600 hover:to-primary-500 transition-all duration-300 flex items-center gap-4"
              >
                <Award size={20} strokeWidth={2.5} />
                Complete & Save
              </button>
           </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-neutral-50 via-white to-primary-50/20 z-[200] flex flex-col items-center justify-center overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.1)_0%,transparent_70%)]" />
      </div>

      <AnimatePresence>
        {isChatOpen && (
          <motion.div 
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 40, stiffness: 300 }}
            className="absolute top-0 right-0 h-full w-full md:w-[450px] glass-premium z-[250] border-l border-black/[0.04] flex flex-col shadow-[-20px_0_80px_-10px_rgba(0,0,0,0.05)]"
          >
            <div className="p-12 border-b border-black/[0.02] flex justify-between items-center">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-[#0A0A0B] rounded-2xl flex items-center justify-center text-[#C5A028] shadow-md">
                   <Sparkles size={20} />
                </div>
                <div>
                   <h3 className="text-lg font-bold tracking-tight">Technical Assist</h3>
                   <p className="text-[10px] uppercase tracking-[0.3em] text-black/30 font-bold">Neural Engine v11.4</p>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="p-3 hover:bg-black/[0.04] rounded-full transition-colors"><X size={20} className="text-black/30" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-12 space-y-8">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] px-7 py-5 rounded-[2.5rem] text-[13px] leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-[#0A0A0B] text-white' : 'bg-black/[0.03] text-black/70'}`}>{msg.content}</div>
                </div>
              ))}
              {isAssistantTyping && <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-black/20 animate-pulse">Assistant is thinking...</div>}
              <div ref={chatEndRef} />
            </div>
            <div className="p-10 border-t border-black/[0.02]">
              <div className="relative">
                <input 
                  value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                  placeholder="Ask for technique refinement..."
                  className="w-full bg-black/[0.02] border-none rounded-3xl pl-8 pr-16 py-5 text-sm font-medium placeholder:opacity-30 focus:ring-1 ring-[#C5A028]/30 transition-all"
                />
                <button onClick={handleSendChat} disabled={!chatInput.trim() || isAssistantTyping} className="absolute right-5 top-1/2 -translate-y-1/2 p-2.5 text-[#C5A028] disabled:opacity-20"><Send size={20} /></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`relative z-10 w-full max-w-6xl px-12 flex flex-col items-center gap-16 text-center transition-all duration-500 ${containerPadding}`}>
         {/* Progress Dots - Premium Enhanced */}
         <div className="flex items-center gap-3">
            {protocol.instructions.map((_, i) => (
              <motion.div 
                key={i} 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: i === currentStepIndex ? 1.2 : 1,
                  opacity: 1
                }}
                className={`h-2.5 rounded-full transition-all duration-700 ${
                  i === currentStepIndex 
                    ? 'w-20 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 shadow-[0_4px_16px_-2px_rgba(212,175,55,0.6)]' 
                    : i < currentStepIndex
                    ? 'w-8 bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-sm'
                    : 'w-8 bg-neutral-200'
                }`} 
              />
            ))}
         </div>

         <AnimatePresence mode="wait">
           <motion.div 
             key={currentStepIndex} 
             initial={{ opacity: 0, y: 20 }} 
             animate={{ opacity: 1, y: 0 }} 
             exit={{ opacity: 0, y: -20 }} 
             transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} 
             className="w-full min-h-[400px] flex flex-col items-center justify-center gap-10"
           >
              <div className="space-y-8">
                 {/* Step Header - Premium Design */}
                 <div className="flex items-center justify-center gap-4 mb-8">
                    <div className="relative w-16 h-16 rounded-3xl bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center shadow-[0_8px_32px_-8px_rgba(212,175,55,0.5)]">
                      <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-white/10 to-transparent" />
                      <Target size={28} className="text-white drop-shadow-lg relative z-10" strokeWidth={2.5} />
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-black uppercase tracking-[0.15em] text-primary-600 mb-1 block">
                        Step {currentStepIndex + 1} of {protocol.instructions.length}
                      </span>
                      <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-[0.12em]">
                        {currentStep.technique}
                      </div>
                    </div>
                 </div>
                 
                 {/* Main Instruction - Premium Typography */}
                 <h2 className={`${instructionFontSize} font-black tracking-tight leading-[1.3] text-neutral-900 transition-all duration-500 max-w-3xl mx-auto px-6 drop-shadow-sm`}>
                    {currentStep.instruction}
                 </h2>
                 
                 {/* Verification Result */}
                 {verificationResult && (
                   <motion.div 
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     className={`mt-8 inline-flex items-center gap-4 px-8 py-5 rounded-3xl text-sm font-bold uppercase tracking-wider shadow-lg ${
                       verificationResult.success 
                         ? 'bg-emerald-50 border-2 border-emerald-200 text-emerald-700' 
                         : 'bg-amber-50 border-2 border-amber-200 text-amber-700'
                     }`}
                   >
                      {verificationResult.success ? <CheckCircle2 size={20} strokeWidth={2.5} /> : <AlertCircle size={20} strokeWidth={2.5} />}
                      {verificationResult.feedback}
                   </motion.div>
                 )}
              </div>

              {/* Premium Timer */}
              {currentStep.timer_seconds && timeLeft > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center gap-8 pt-8"
                >
                   <div className="relative w-48 h-48">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-50 to-primary-100/50 blur-2xl" />
                      <svg className="w-full h-full -rotate-90 relative z-10">
                         <circle cx="96" cy="96" r="88" stroke="rgba(212,175,55,0.08)" strokeWidth="10" fill="transparent" />
                         <motion.circle 
                            cx="96" cy="96" r="88" 
                            stroke="url(#gradient)" 
                            strokeWidth="10" 
                            fill="transparent"
                            strokeDasharray="553" 
                            strokeLinecap="round"
                            animate={{ strokeDashoffset: 553 - (553 * (timeLeft / currentStep.timer_seconds)) }}
                            transition={{ duration: 0.5 }}
                            style={{ filter: 'drop-shadow(0 4px 12px rgba(212, 175, 55, 0.3))' }}
                         />
                         <defs>
                           <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                             <stop offset="0%" stopColor="#d4af37" />
                             <stop offset="50%" stopColor="#e5c158" />
                             <stop offset="100%" stopColor="#c19a2f" />
                           </linearGradient>
                         </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mb-3 shadow-lg">
                          <Timer size={20} className="text-white" strokeWidth={2.5} />
                        </div>
                        <div className="font-mono text-4xl font-black text-neutral-900 tracking-tight">{formatTime(timeLeft)}</div>
                      </div>
                   </div>
                   <div className="flex gap-4">
                      <motion.button 
                        onClick={() => setIsTimerRunning(!isTimerRunning)}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="px-8 py-4 rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white shadow-[0_8px_32px_-8px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_40px_-8px_rgba(212,175,55,0.4)] hover:from-primary-600 hover:to-primary-500 transition-all duration-300 flex items-center gap-3 font-bold text-sm uppercase tracking-wider"
                      >
                        {isTimerRunning ? <><Pause size={20} strokeWidth={2.5} /> Pause</> : <><Play size={20} strokeWidth={2.5} /> Start</>}
                      </motion.button>
                      <motion.button 
                        onClick={() => { setTimeLeft(currentStep.timer_seconds || 0); setIsTimerRunning(false); }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="px-8 py-4 rounded-3xl bg-white/90 backdrop-blur-xl border-2 border-neutral-200/80 text-neutral-700 hover:border-primary-300 hover:bg-white hover:shadow-lg transition-all shadow-md flex items-center gap-3 font-bold text-sm uppercase tracking-wider"
                      >
                        <RotateCcw size={20} strokeWidth={2.5} /> Reset
                      </motion.button>
                   </div>
                </motion.div>
              )}
           </motion.div>
         </AnimatePresence>
         
         {/* Premium Control Panel */}
         <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3 }}
           className="flex items-center justify-center gap-8 md:gap-12 pt-12"
         >
            {/* Assistant Button - Premium */}
            <motion.button 
              onClick={() => setIsChatOpen(!isChatOpen)} 
              whileHover={{ scale: 1.08, rotate: 2 }}
              whileTap={{ scale: 0.92 }}
              className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all ${
                isChatOpen 
                  ? 'bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white shadow-[0_12px_40px_-8px_rgba(212,175,55,0.6)]' 
                  : 'bg-white/90 backdrop-blur-xl border-2 border-neutral-200/80 text-neutral-700 hover:border-primary-400 shadow-lg hover:shadow-xl'
              }`}
            >
              <MessageSquare size={28} strokeWidth={2.5} className={isChatOpen ? 'drop-shadow-lg' : ''} />
            </motion.button>
            
            {/* Previous Button - Premium */}
            <motion.button 
              disabled={currentStepIndex === 0} 
              onClick={handlePrev} 
              whileHover={{ scale: currentStepIndex === 0 ? 1 : 1.08, x: currentStepIndex === 0 ? 0 : -2 }}
              whileTap={{ scale: currentStepIndex === 0 ? 1 : 0.92 }}
              className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all ${
                currentStepIndex === 0 
                  ? 'opacity-20 bg-neutral-100 text-neutral-300 cursor-not-allowed' 
                  : 'bg-white/90 backdrop-blur-xl border-2 border-neutral-200/80 text-neutral-900 hover:border-neutral-400 hover:shadow-xl shadow-lg'
              }`}
            >
              <ChevronLeft size={32} strokeWidth={2.5} />
            </motion.button>
            
            {/* Voice Play Button - Hero Premium */}
            <motion.button 
              onClick={() => playVoice(currentStep.instruction)} 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={isPlaying ? { scale: [1, 1.02, 1] } : {}}
              transition={isPlaying ? { duration: 1.5, repeat: Infinity } : {}}
              className={`relative w-48 h-48 md:w-56 md:h-56 rounded-[4rem] bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center shadow-[0_24px_64px_-12px_rgba(0,0,0,0.4)] transition-all ${
                isPlaying ? 'ring-8 ring-primary-500/40 shadow-[0_32px_80px_-12px_rgba(212,175,55,0.5)]' : 'hover:shadow-[0_32px_80px_-12px_rgba(0,0,0,0.5)]'
              }`}
            >
              <div className="absolute inset-0 rounded-[4rem] bg-gradient-to-t from-white/5 to-transparent" />
              <Volume2 
                color={isPlaying ? "#d4af37" : "white"} 
                size={72} 
                strokeWidth={2} 
                className={isPlaying ? 'drop-shadow-[0_8px_16px_rgba(212,175,55,0.5)]' : 'drop-shadow-2xl'}
              />
            </motion.button>
            
            {/* Next/Complete Button - Premium */}
            <motion.button 
              onClick={handleNext} 
              whileHover={{ scale: 1.08, x: 2 }}
              whileTap={{ scale: 0.92 }}
              className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white flex items-center justify-center shadow-[0_12px_40px_-8px_rgba(212,175,55,0.5)] hover:shadow-[0_16px_48px_-8px_rgba(212,175,55,0.7)] transition-all"
            >
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-white/10 to-transparent" />
              {currentStepIndex === protocol.instructions.length - 1 ? (
                <Trophy size={32} strokeWidth={2.5} className="drop-shadow-lg relative z-10" />
              ) : (
                <ArrowRight size={32} strokeWidth={2.5} className="drop-shadow-lg relative z-10" />
              )}
            </motion.button>
            
            {/* Verification Button - Premium */}
            <motion.button 
              onClick={initiateVerification} 
              disabled={isVerifying} 
              whileHover={{ scale: isVerifying ? 1 : 1.08 }}
              whileTap={{ scale: isVerifying ? 1 : 0.92 }}
              className={`relative w-20 h-20 rounded-3xl flex items-center justify-center transition-all shadow-lg ${
                isVerifying 
                  ? 'animate-pulse bg-primary-100 border-2 border-primary-300 shadow-[0_8px_32px_-8px_rgba(212,175,55,0.3)]' 
                  : 'bg-white/90 backdrop-blur-xl border-2 border-neutral-200/80 text-neutral-700 hover:border-primary-400 hover:shadow-xl'
              }`}
            >
              {isVerifying ? (
                <Loader2 size={28} className="animate-spin text-primary-600 drop-shadow" strokeWidth={2.5} />
              ) : (
                <Camera size={28} strokeWidth={2.5} />
              )}
            </motion.button>
         </motion.div>
      </div>

      <canvas ref={canvasRef} className="hidden" width="1280" height="720"></canvas>
      <video ref={videoRef} autoPlay playsInline className="hidden"></video>
    </div>
  );
};

export default ExecutionMode;
