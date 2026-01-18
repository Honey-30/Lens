
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { NeuralProtocol, ChatMessage } from '../types';
import { synthesizeVoiceInstruction, verifyTechnique, askSousChef } from '../services/geminiService';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Volume2, Camera, X, Trophy, Activity, 
  CheckCircle2, Zap, Timer, ArrowRight, ThumbsUp, ThumbsDown, 
  Minus, MessageSquare, Send, Loader2, Sparkles, AlertCircle, 
  Play, Pause, RotateCcw, Target
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

  // Adaptive Typography Logic
  const instructionLength = currentStep.instruction.length;
  let instructionFontSize = "text-5xl md:text-6xl lg:text-7xl";
  if (instructionLength > 150) {
    instructionFontSize = "text-3xl md:text-4xl lg:text-5xl";
  } else if (instructionLength > 100) {
    instructionFontSize = "text-4xl md:text-5xl lg:text-6xl";
  }

  const containerPadding = instructionLength > 150 ? "pt-12 pb-8" : "pt-20 pb-12";

  if (isFinished) {
    return (
      <div className="fixed inset-0 bg-white z-[300] overflow-y-auto pt-32 pb-24 px-12">
        <motion.div initial={{ opacity: 0, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }} className="max-w-6xl mx-auto text-center space-y-12">
           <div className="flex flex-col items-center gap-6">
              <div className="w-24 h-24 bg-[#0A0A0B] rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl">
                 <Trophy size={40} className="text-[#C5A028]" />
              </div>
              <h2 className="text-7xl font-bold tracking-tighter text-[#0A0A0B]">Study <span className="serif italic text-[#C5A028] font-normal">Finalized</span></h2>
              <p className="text-[12px] uppercase tracking-[0.5em] font-bold text-black/20">Culinary Intelligence Sequence Complete</p>
           </div>
           
           <div className="flex justify-center gap-8">
              <button onClick={onComplete} className="px-16 py-6 bg-[#0A0A0B] text-white rounded-full font-bold text-[11px] uppercase tracking-[0.4em] shadow-lg hover:bg-[#C5A028] transition-all">Archive Protocol</button>
           </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-[200] flex flex-col items-center justify-center overflow-hidden font-sans">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none grayscale">
        <img src={protocol.visualUrl} className="w-full h-full object-cover" />
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

      <div className={`relative z-10 w-full max-w-6xl px-8 flex flex-col items-center gap-12 text-center transition-all duration-500 ${containerPadding}`}>
         <div className="flex items-center gap-4 opacity-10">
            {protocol.instructions.map((_, i) => (
              <div key={i} className={`h-1 rounded-full transition-all duration-1000 ${i === currentStepIndex ? 'w-12 bg-black' : 'w-4 bg-black'}`} />
            ))}
         </div>

         <AnimatePresence mode="wait">
           <motion.div 
             key={currentStepIndex} 
             initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} 
             transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} 
             className="w-full min-h-[350px] flex flex-col items-center justify-center gap-8"
           >
              <div className="space-y-6">
                 <div className="flex items-center justify-center gap-4">
                    <Target size={14} className="text-[#C5A028] opacity-60" />
                    <span className="text-[11px] uppercase tracking-[0.5em] font-bold text-[#C5A028]">Phase {currentStepIndex + 1} // {currentStep.technique}</span>
                 </div>
                 <h2 className={`${instructionFontSize} font-bold tracking-tighter leading-[1.05] text-[#0A0A0B] serif italic transition-all duration-500 max-w-4xl mx-auto`}>
                    {currentStep.instruction}
                 </h2>
                 {verificationResult && (
                   <div className={`mt-10 inline-flex items-center gap-4 px-8 py-4 rounded-[2rem] border text-[11px] font-bold uppercase tracking-[0.4em] ${verificationResult.success ? 'bg-emerald-50/50 border-emerald-100 text-emerald-700/70' : 'bg-amber-50/50 border-amber-100 text-amber-700/70'}`}>
                      {verificationResult.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                      {verificationResult.feedback}
                   </div>
                 )}
              </div>

              {currentStep.timer_seconds && timeLeft > 0 && (
                <div className="flex flex-col items-center gap-6 pt-6">
                   <div className="relative w-28 h-28">
                      <svg className="w-full h-full -rotate-90">
                         <circle cx="56" cy="56" r="50" stroke="rgba(0,0,0,0.04)" strokeWidth="4" fill="transparent" />
                         <motion.circle 
                            cx="56" cy="56" r="50" stroke="#C5A028" strokeWidth="4" fill="transparent"
                            strokeDasharray="314" animate={{ strokeDashoffset: 314 - (314 * (timeLeft / currentStep.timer_seconds)) }}
                         />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center font-mono text-xl font-bold text-black/80">{formatTime(timeLeft)}</div>
                   </div>
                   <div className="flex gap-4">
                      <button onClick={() => setIsTimerRunning(!isTimerRunning)} className="p-3.5 rounded-full bg-black text-white shadow-md hover:scale-110 transition-transform">{isTimerRunning ? <Pause size={14} /> : <Play size={14} />}</button>
                      <button onClick={() => { setTimeLeft(currentStep.timer_seconds || 0); setIsTimerRunning(false); }} className="p-3.5 rounded-full bg-black/[0.04] text-black/40 hover:bg-black/[0.08] transition-all"><RotateCcw size={14} /></button>
                   </div>
                </div>
              )}
           </motion.div>
         </AnimatePresence>
         
         <div className="flex items-center justify-center gap-10 md:gap-14 pt-8">
            <button onClick={() => setIsChatOpen(!isChatOpen)} className={`w-20 h-20 rounded-[2.5rem] border border-black/[0.05] flex items-center justify-center transition-all ${isChatOpen ? 'bg-[#0A0A0B] text-white shadow-2xl' : 'bg-white hover:border-black/20 shadow-sm'}`}><MessageSquare size={28} /></button>
            <button disabled={currentStepIndex === 0} onClick={handlePrev} className={`w-20 h-20 rounded-[2.5rem] border border-black/[0.05] flex items-center justify-center transition-all ${currentStepIndex === 0 ? 'opacity-5' : 'bg-white hover:border-black/20 shadow-sm'}`}><ChevronLeft size={28} /></button>
            <button onClick={() => playVoice(currentStep.instruction)} className={`w-40 h-40 md:w-48 md:h-48 rounded-[4rem] bg-[#0A0A0B] flex items-center justify-center shadow-3xl transition-all hover:scale-105 active:scale-95 ${isPlaying ? 'ring-[12px] ring-[#C5A028]/15' : ''}`}><Volume2 color={isPlaying ? "#C5A028" : "white"} size={64} strokeWidth={1.2} /></button>
            <button onClick={handleNext} className="w-20 h-20 rounded-[2.5rem] bg-[#C5A028] text-white flex items-center justify-center shadow-2xl hover:bg-[#0A0A0B] transition-all">{currentStepIndex === protocol.instructions.length - 1 ? <Trophy size={28} /> : <ArrowRight size={28} />}</button>
            <button onClick={initiateVerification} disabled={isVerifying} className={`w-20 h-20 rounded-[2.5rem] border border-black/[0.05] flex items-center justify-center transition-all ${isVerifying ? 'animate-pulse bg-[#C5A028]/5' : 'bg-white hover:border-black/20 shadow-sm'}`}>{isVerifying ? <Loader2 size={28} className="animate-spin text-[#C5A028]" /> : <Camera size={28} />}</button>
         </div>
      </div>

      <canvas ref={canvasRef} className="hidden" width="1280" height="720"></canvas>
      <video ref={videoRef} autoPlay playsInline className="hidden"></video>
    </div>
  );
};

export default ExecutionMode;
