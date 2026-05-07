import React, { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GoogleGenAI } from "@google/genai";
import { 
  Bot, 
  Brain, 
  Cable, 
  CalendarClock, 
  Database, 
  Globe2, 
  Lock, 
  Mail, 
  MessageCircle, 
  Sparkles, 
  Terminal, 
  Zap,
  Settings,
  Sparkle,
  Loader2,
  X,
  ShieldCheck,
  PackageCheck,
  Fingerprint,
  Layers,
  Code,
  AlertCircle,
  CheckCircle2,
  Bug,
  RefreshCw,
  LayoutGrid,
  Cpu,
  GitBranch,
  HardDrive
} from "lucide-react";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Plugin {
  id: string;
  name: string;
  type: string;
  icon: any;
  desc: string;
  status: string;
  color: string;
  size: number;
}

interface CodeBrick {
  id: string;
  funcName: string;
  code: string;
  hasError: boolean;
  errorMessage?: string;
  type: 'logic' | 'io' | 'trigger';
}

const SERVERS = [
  { id: 'gemini', name: 'Gemini Neural Node', provider: 'Google AI', latency: '24ms', icon: Sparkles },
  { id: 'openai', name: 'GPT Core Cluster', provider: 'OpenAI', latency: '110ms', icon: Brain },
  { id: 'local', name: 'Local Silicon Host', provider: 'On-Device', latency: '2ms', icon: Database },
];

const PERSONAS = [
  { id: 'jarvis', name: 'JARVIS', vibe: 'Technical & Protective', icon: ShieldCheck, desc: 'Advanced technical advisor with a dry wit.' },
  { id: 'tars', name: 'TARS', vibe: 'Honest & Practical', icon: LayoutGrid, desc: 'Robotic logic with a 90% humor setting.' },
  { id: 'hal', name: 'HAL 9000', vibe: 'Calm & Precise', icon: AlertCircle, desc: 'Mission-first intelligence. Extremely reliable.' },
];

type BootPhase = 'SPLASH' | 'SERVER' | 'PERSONA' | 'OBJ' | 'ACTIVE';
type ViewMode = 'ORBIT' | 'MATRIX';

const categories = ["Core", "Logic", "Utility", "Neural"];

const pluginData: Plugin[] = [
  { id: 'p1', name: 'Neural Processor', type: 'Core', icon: Cpu, desc: 'Primary compute unit', status: 'ACTIVE', color: '#6366f1', size: 1 },
  { id: 'p2', name: 'Logic Gate', type: 'Logic', icon: GitBranch, desc: 'Boolean operation hub', status: 'STANDBY', color: '#8b5cf6', size: 1 },
  { id: 'p3', name: 'Data Vault', type: 'Utility', icon: HardDrive, desc: 'Encrypted storage', status: 'ACTIVE', color: '#3b82f6', size: 1 },
  { id: 'p4', name: 'Synapse Link', type: 'Neural', icon: Zap, desc: 'Fast interconnect', status: 'ACTIVE', color: '#10b981', size: 1 },
];

const mockCodeBricks: CodeBrick[] = [
  { id: 'b1', funcName: 'initialize_core', code: 'function init() {\n  const engine = new Core();\n  engine.start();\n}', hasError: false, type: 'logic' },
  { id: 'b2', funcName: 'data_stream', code: 'async function fetch() {\n  const data = await vault.read();\n  return sanitize(data);\n}', hasError: true, errorMessage: 'Sanitizer not found', type: 'io' },
];

export default function App() {
  const [bootPhase, setBootPhase] = useState<BootPhase>('SPLASH');
  const [serverConfig, setServerConfig] = useState({ 
    provider: 'gemini', 
    baseUrl: 'https://generativelanguage.googleapis.com', 
    apiKey: '' 
  });
  const [personality, setPersonality] = useState(PERSONAS[0]);
  const [suggestedBlueprints, setSuggestedBlueprints] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('ORBIT');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activePlugins, setActivePlugins] = useState<string[]>(['p1']);
  const [rotation, setRotation] = useState(0);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [userMessage, setUserMessage] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [bricks, setBricks] = useState<CodeBrick[]>(mockCodeBricks);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isAiLoading, bootPhase]);

  const generateSuggestions = async () => {
    setIsAiLoading(true);
    try {
      const prompt = `System: You are ${personality.name} (${personality.vibe}). 
      The user is about to start building an AI system using LEGO-like modules.
      Suggest 3 unique, cool project ideas they could build today. 
      Keep each suggestion under 10 words. 
      Return as a simple list.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      const lines = response.text?.split('\n').filter(l => l.trim().length > 0).map(l => l.replace(/^\d+[\.\)]\s*/, '').trim()) || [];
      setSuggestedBlueprints(lines.slice(0, 3));
    } catch (e) {
      setSuggestedBlueprints(["Global Knowledge Vault", "Neural Ethics Guardian", "Autonomous Logic Stream"]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const sendMessage = async (e?: React.FormEvent, customMsg?: string) => {
    if (e) e.preventDefault();
    const msgToUse = customMsg || userMessage;
    if (!msgToUse.trim() || isAiLoading) return;

    setUserMessage("");
    setChatHistory(prev => [...prev, { role: 'user', content: msgToUse }]);
    setIsAiLoading(true);

    try {
      const activePluginNames = activePlugins.map(id => pluginData.find(p => p.id === id)?.name).join(", ");
      const brokenBricks = bricks.filter(b => b.hasError).map(b => b.funcName).join(", ");
      
      const prompt = `
        Identity: You are ${personality.name}. Vibe: ${personality.vibe}.
        Current Assembly State: ${activePluginNames || "Minimal"}.
        Broken Components: ${brokenBricks || "None"}.
        
        User: ${msgToUse}
        
        Response:
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setChatHistory(prev => [...prev, { role: 'assistant', content: response.text || "Connection unstable." }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'assistant', content: "Neural uplink unstable." }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setRotation(r => r + 0.05), 50);
    return () => clearInterval(timer);
  }, []);

  const togglePlugin = (id: string) => {
    setActivePlugins(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const analyzeBricks = async (brick?: CodeBrick) => {
    setIsAiLoading(true);
    try {
      const activePluginNames = activePlugins.map(id => pluginData.find(p => p.id === id)?.name).join(", ");
      const prompt = brick 
        ? `Diagnostic by ${personality.name}: Analyze this error in module ${brick.funcName}: "${brick.errorMessage}". Code snippet: ${brick.code}. Provide a short thematic fix.`
        : `Context: Active Modules: ${activePluginNames}. Provide a short ${personality.name}-style insight on stability.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      const result = response.text || "Diagnostic inconclusive.";
      setAiInsight(result);
      setChatHistory(prev => [...prev, { role: 'assistant', content: result }]);
    } catch (error) {
      setAiInsight("Link parity error. Neural uplink unstable.");
    } finally {
      setIsAiLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'ORBIT' && bootPhase === 'ACTIVE') {
      const timeout = setTimeout(analyzeBricks, 1500);
      return () => clearTimeout(timeout);
    }
  }, [activePlugins, viewMode, bootPhase]);

  const getPluginPos = (id: string) => {
    const plugin = pluginData.find(p => p.id === id);
    if (!plugin) return { x: 0, y: 0 };
    const categoryIdx = categories.indexOf(plugin.type);
    const pluginsInCategory = pluginData.filter(p => p.type === plugin.type);
    const pluginIdx = pluginsInCategory.findIndex(p => p.id === id);
    const parentAngle = (categoryIdx / categories.length) * 360 + rotation;
    const arcWidth = 50;
    const itemAngle = parentAngle - (arcWidth/2) + ((pluginIdx + 0.5) / pluginsInCategory.length) * arcWidth;
    const radius = 380;
    return {
      x: Math.cos((itemAngle * Math.PI) / 180) * radius,
      y: Math.sin((itemAngle * Math.PI) / 180) * radius
    };
  };

  return (
    <div className="h-screen w-screen bg-[#02040a] text-slate-400 font-mono overflow-hidden flex items-center justify-center relative cursor-crosshair select-none">
      
      <AnimatePresence mode="wait">
        {bootPhase === 'SPLASH' && (
          <motion.div 
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex flex-col items-center gap-12 z-[100]"
          >
            <div className="relative">
               <motion.div 
                 animate={{ rotate: 360 }}
                 transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                 className="w-64 h-64 border border-indigo-500/20 rounded-full flex items-center justify-center"
               >
                 <div className="w-48 h-48 border border-indigo-500/40 rounded-full flex items-center justify-center">
                    <div className="w-32 h-32 border-2 border-indigo-500 rounded-full animate-pulse shadow-[0_0_50px_rgba(99,102,241,0.3)]" />
                 </div>
               </motion.div>
               <div className="absolute inset-0 flex items-center justify-center flex-col gap-2">
                 <Brain className="w-12 h-12 text-white animate-bounce" />
                 <span className="text-[10px] font-black tracking-[0.5em] text-indigo-400 uppercase">Neural_Link</span>
               </div>
            </div>

            <div className="text-center space-y-4">
              <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Aether_Assembly</h1>
              <p className="text-xs text-slate-500 max-w-xs font-bold leading-relaxed uppercase tracking-widest">Construct autonomous intelligence via modular silicon logic blocks.</p>
            </div>

            <button 
              onClick={() => setBootPhase('SERVER')}
              className="px-10 py-4 bg-transparent border-2 border-indigo-500 text-indigo-500 font-black uppercase tracking-[0.3em] rounded hover:bg-indigo-500 hover:text-white transition-all shadow-[0_0_30px_rgba(99,102,241,0.2)] active:scale-95"
            >
              Initiate_Uplink
            </button>
          </motion.div>
        )}

        {bootPhase === 'SERVER' && (
          <motion.div 
            key="server"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-4xl z-[100] grid grid-cols-2 gap-12 p-10 bg-[#0d0f14]/80 backdrop-blur-xl border border-white/5 rounded-3xl"
          >
            <div className="space-y-8">
              <div className="space-y-2">
                <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Step_01_Infrastructure</div>
                <h2 className="text-3xl font-black text-white uppercase italic">Select Compute Node</h2>
                <p className="text-xs text-slate-500 leading-relaxed font-bold">Route your neural traffic through a specialized provider cluster.</p>
              </div>

              <div className="space-y-3">
                {SERVERS.map(s => (
                  <button 
                    key={s.id}
                    onClick={() => setServerConfig({...serverConfig, provider: s.id})}
                    className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all group ${serverConfig.provider === s.id ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg' : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/10'}`}
                  >
                    <div className="flex items-center gap-4">
                       <div className={`p-2 rounded bg-black/20 ${serverConfig.provider === s.id ? 'text-white' : 'text-indigo-500'}`}><s.icon className="w-5 h-5" /></div>
                       <div className="text-left">
                         <div className="font-black text-xs uppercase tracking-tight">{s.name}</div>
                         <div className="text-[8px] font-bold opacity-60 uppercase">{s.provider}</div>
                       </div>
                    </div>
                    <div className="text-[10px] font-black opacity-40">{s.latency}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6 pt-12">
               <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-600 uppercase">Provider_Endpoint</label>
                    <input 
                      className="w-full bg-black/40 border border-white/10 rounded px-4 py-2 text-xs font-bold text-white focus:border-indigo-500 outline-none transition-all"
                      value={serverConfig.baseUrl}
                      onChange={(e) => setServerConfig({...serverConfig, baseUrl: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-600 uppercase">Neural_Auth_Key</label>
                    <div className="relative">
                      <input 
                        type="password"
                        className="w-full bg-black/40 border border-white/10 rounded px-4 py-3 text-xs font-bold text-white focus:border-indigo-500 outline-none transition-all pr-10"
                        placeholder="••••••••••••••••"
                        value={serverConfig.apiKey}
                        onChange={(e) => setServerConfig({...serverConfig, apiKey: e.target.value})}
                      />
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-700" />
                    </div>
                  </div>
               </div>

               <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-3 h-3 text-indigo-400" />
                    <span className="text-[9px] font-black text-indigo-400 uppercase">Security_Protocol::Active</span>
                  </div>
                  <p className="text-[9px] text-slate-500 font-bold uppercase leading-tight italic">Your encryption key is processed in an isolated vault. No data egress outside this sandbox.</p>
               </div>

               <button 
                onClick={() => setBootPhase('PERSONA')}
                className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-xs rounded hover:bg-indigo-500 hover:text-white transition-all"
               >
                 Confirm_Node
               </button>
            </div>
          </motion.div>
        )}

        {bootPhase === 'PERSONA' && (
          <motion.div 
            key="persona"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="w-full max-w-5xl z-[100] space-y-10"
          >
            <div className="text-center space-y-2">
              <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Step_02_Personality_Matrix</div>
              <h2 className="text-4xl font-black text-white uppercase italic">Choose Your AI Guide</h2>
            </div>

            <div className="grid grid-cols-3 gap-6">
               {PERSONAS.map(p => (
                 <button 
                  key={p.id}
                  onClick={() => setPersonality(p)}
                  className={`relative p-8 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-6 group overflow-hidden ${personality.id === p.id ? 'bg-indigo-600/10 border-indigo-500 shadow-2xl' : 'bg-white/[0.02] border-white/5 hover:border-white/20'}`}
                 >
                   {personality.id === p.id && (
                     <motion.div layoutId="highlight" className="absolute inset-0 bg-indigo-500/5 pointer-events-none" />
                   )}
                   <div className={`p-6 rounded-full border-2 transition-all ${personality.id === p.id ? 'bg-indigo-500 border-white text-white shadow-[0_0_40px_rgba(79,70,229,0.5)] scale-110' : 'bg-black/40 border-white/10 text-slate-500'}`}>
                      <p.icon className="w-10 h-10" />
                   </div>
                   <div className="space-y-2 relative">
                      <div className="text-xl font-black text-white uppercase tracking-tighter italic">{p.name}</div>
                      <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{p.vibe}</div>
                      <p className="text-[10px] text-slate-500 font-bold leading-relaxed">{p.desc}</p>
                   </div>
                 </button>
               ))}
            </div>

            <div className="flex justify-center pt-6">
              <button 
                onClick={() => {
                  generateSuggestions();
                  setBootPhase('OBJ');
                }}
                className="px-12 py-4 bg-indigo-600 text-white font-black uppercase tracking-[0.3em] rounded border border-indigo-400 shadow-[0_0_30px_rgba(79,70,229,0.4)] hover:bg-indigo-500 transition-all active:scale-95"
              >
                Assemble_Neural_Matrix
              </button>
            </div>
          </motion.div>
        )}

        {bootPhase === 'OBJ' && (
          <motion.div 
            key="obj"
            initial={{ opacity: 0, scale:0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="w-full max-w-3xl z-[100] bg-[#0d0f14] border border-indigo-500/30 rounded-3xl p-10 space-y-8 shadow-[0_0_100px_rgba(79,70,229,0.1)]"
          >
            <div className="flex items-center gap-6">
               <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-[0_0_30px_rgba(79,70,229,0.5)]">
                 <personality.icon className="w-8 h-8" />
               </div>
               <div className="space-y-1">
                 <h2 className="text-xl font-black text-white uppercase italic">Neural Sync Complete</h2>
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Greetings. I am {personality.name}. Let us Begin construction.</p>
               </div>
            </div>

            <div className="space-y-4">
               <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest px-4 border-l-2 border-indigo-500">Suggested_Directives</div>
               <div className="grid gap-3">
                 {isAiLoading ? (
                   <div className="py-10 flex flex-col items-center gap-4">
                     <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                     <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest animate-pulse">Calculating Blueprints...</span>
                   </div>
                 ) : (
                   suggestedBlueprints.map((bp, i) => (
                     <button 
                      key={i}
                      onClick={() => {
                        sendMessage(undefined, `Build directive: ${bp}`);
                        setBootPhase('ACTIVE');
                      }}
                      className="w-full p-5 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-indigo-600 hover:border-indigo-400 text-left transition-all group group flex items-center justify-between"
                     >
                       <span className="text-xs font-black text-slate-300 uppercase tracking-tight group-hover:text-white transition-all">{bp}</span>
                       <Zap className="w-4 h-4 text-indigo-500 opacity-0 group-hover:opacity-100 transition-all transition-all" />
                     </button>
                   ))
                 )}
               </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
               <button onClick={() => setBootPhase('PERSONA')} className="text-[10px] font-black text-slate-700 hover:text-slate-300 uppercase tracking-widest">Reconfigure_personality</button>
               <button 
                onClick={() => setBootPhase('ACTIVE')}
                className="px-6 py-2 bg-white/5 border border-white/10 rounded font-black text-[10px] text-white uppercase hover:bg-white/10"
               >
                 manual_Start
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* GLOBAL HUD OVERLAY */}
      {bootPhase === 'ACTIVE' && (
      <div className="absolute inset-0 pointer-events-none p-10 flex flex-col justify-between z-[60]">
        <header className="flex justify-between items-start pointer-events-auto">
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded backdrop-blur">
               <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
               <span className="text-xs font-black tracking-[0.4em] text-white uppercase">{viewMode}_SYSTEM</span>
             </div>

             {/* MODE SWITCHER */}
             <div className="flex bg-[#12141a] p-1 rounded-lg border border-white/5 shadow-xl">
               <button 
                 onClick={() => setViewMode('ORBIT')}
                 className={`flex items-center gap-2 px-3 py-1.5 rounded transition-all text-[10px] font-black uppercase tracking-widest ${viewMode === 'ORBIT' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-300'}`}
               >
                 <LayoutGrid className="w-3.5 h-3.5" />
                 Assemble
               </button>
               <button 
                 onClick={() => setViewMode('MATRIX')}
                 className={`flex items-center gap-2 px-3 py-1.5 rounded transition-all text-[10px] font-black uppercase tracking-widest ${viewMode === 'MATRIX' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-300'}`}
               >
                 <Code className="w-3.5 h-3.5" />
                 Matrix
               </button>
             </div>
          </div>

          <div className="flex gap-4">
             <button className="h-12 w-12 bg-white/5 border border-white/10 rounded flex items-center justify-center group hover:bg-indigo-500/10 hover:border-indigo-500 transition-all">
               <Settings className="w-5 h-5 text-slate-500 group-hover:text-indigo-400" />
             </button>
             <button 
               onClick={() => setShowConfirmModal(true)}
               className="h-12 px-6 bg-indigo-600 text-white font-black uppercase tracking-widest text-xs rounded border border-indigo-400 shadow-[0_0_30px_rgba(79,70,229,0.4)] flex items-center gap-3 hover:bg-indigo-500 transition-all active:scale-95"
             >
                <Zap className="w-4 h-4 fill-current" />
                Initiate_Build
             </button>
          </div>
        </header>

        <footer className="flex justify-between items-end">
          <div className="max-w-sm pointer-events-auto">
             <div className="text-[10px] flex gap-8 items-center bg-black/40 px-4 py-2 rounded-full border border-white/5 backdrop-blur">
               <div className="flex items-center gap-2">
                 <span className="text-slate-600 font-extrabold uppercase">STABILITY</span>
                 <span className="text-indigo-400 font-black tracking-tighter">99.2%</span>
               </div>
               <div className="flex items-center gap-2">
                 <span className="text-slate-600 font-extrabold uppercase">SYNC_MODE</span>
                 <span className="text-emerald-500 font-black tracking-tighter">OPTIMIZED</span>
               </div>
             </div>
          </div>
          <div className="text-right space-y-2">
            <div className="text-[10px] font-black text-slate-700 tracking-widest uppercase">Encryption_Active::RSA_AES</div>
            <div className="text-[10px] text-slate-500 tracking-tighter font-extrabold">{new Date().toLocaleTimeString().toUpperCase()}</div>
          </div>
        </footer>
      </div>
      )}

      {/* VIEW MODES CONTAINER */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        
        {/* VIEW 1: ORBITAL ASSEMBLY */}
        <AnimatePresence>
          {viewMode === 'ORBIT' && (
            <motion.div 
              key="orbit-view"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {/* Connection Layer */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible opacity-20">
                {activePlugins.map(pId => {
                  const pos = getPluginPos(pId);
                  return (
                    <motion.line
                      key={`l-${pId}`}
                      x1="50%" y1="50%" x2={`calc(50% + ${pos.x}px)`} y2={`calc(50% + ${pos.y}px)`}
                      stroke="#818cf8" strokeWidth="1" strokeDasharray="4 4"
                    />
                  );
                })}
              </svg>

              {/* Core Unit */}
              <div className="relative z-50">
                <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 4 }} className="w-32 h-32 rounded-full bg-indigo-600/10 border-2 border-indigo-500/40 flex items-center justify-center relative shadow-[0_0_80px_rgba(79,70,229,0.2)]">
                  <Bot className="w-12 h-12 text-indigo-400" />
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 10, ease: "linear" }} className="absolute -inset-4 border-2 border-dashed border-indigo-500/20 rounded-full" />
                </motion.div>
              </div>

              {/* Category Orbit */}
              {categories.map((cat, idx) => {
                const angle = (idx / categories.length) * 360 + rotation;
                const radius = 240;
                const x = Math.cos((angle * Math.PI) / 180) * radius;
                const y = Math.sin((angle * Math.PI) / 180) * radius;
                const isSelected = selectedCategory === cat;
                return (
                  <motion.div key={cat} animate={{ x, y }} onClick={() => setSelectedCategory(isSelected ? null : cat)} className="absolute z-30 flex flex-col items-center cursor-pointer">
                    <div className={`relative transition-all duration-300 ${isSelected ? 'scale-125 z-50' : 'opacity-70 flex items-center gap-2 bg-[#12141a]/90 px-4 py-2 border-2 border-indigo-500/30 rounded font-black text-[10px] uppercase tracking-widest text-slate-300'}`}>
                      {isSelected ? (
                        <div className="bg-indigo-600 border-white text-white px-4 py-2 border-2 rounded flex items-center gap-2 shadow-[0_0_30px_rgba(79,70,229,0.5)]">
                          <Terminal className="w-3 h-3" /> {cat}
                        </div>
                      ) : (
                        <>{cat}</>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {/* Plugin Orbit */}
              <AnimatePresence>
                {selectedCategory && pluginData.filter(p => p.type === selectedCategory).map((plugin) => {
                  const pos = getPluginPos(plugin.id);
                  const isActive = activePlugins.includes(plugin.id);
                  const Icon = plugin.icon;
                  return (
                    <motion.div key={plugin.id} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1, x: pos.x, y: pos.y }} exit={{ opacity: 0, scale: 0 }} onClick={() => togglePlugin(plugin.id)} className="absolute z-40 bg-[#12141a]/80 p-4 rounded-xl border-2 cursor-pointer transition-all w-32 border-white/10 hover:border-indigo-500/50">
                      <div className={`mb-2 p-1.5 rounded bg-black/40 ${isActive ? 'text-indigo-400' : 'text-slate-600'}`}><Icon className="w-4 h-4" /></div>
                      <div className="text-[10px] font-black text-white uppercase tracking-tighter truncate">{plugin.name}</div>
                      {isActive && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full shadow-[0_0_10px_#4f46e5]" />}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* VIEW 2: MATRIX CODE IDE (LEGO STYLE) */}
        <AnimatePresence>
          {viewMode === 'MATRIX' && (
            <motion.div 
              key="matrix-view"
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -100 }}
              className="absolute inset-0 px-20 pt-32 pb-40 flex gap-10"
            >
              {/* SIDEBAR: MODULE EXPLORER */}
              <div className="w-64 bg-[#0d0f14] border border-white/5 rounded-2xl flex flex-col overflow-hidden">
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-600 tracking-widest uppercase">Module_Files</span>
                  <PackageCheck className="w-3 h-3 text-slate-700" />
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                   {activePlugins.length === 0 ? (
                     <div className="text-[10px] text-slate-800 text-center py-10 italic">No modules loaded.</div>
                   ) : (
                     activePlugins.map(id => (
                       <div key={id} className="flex items-center gap-3 p-2 border border-white/5 rounded hover:bg-white/5 transition-colors cursor-pointer group">
                         <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                         <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">{id}.sys</span>
                       </div>
                     ))
                   )}
                </div>
              </div>

              {/* MAIN: CODE BRICK STACK */}
              <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-6 pr-4">
                 {bricks.map((brick) => (
                    <motion.div 
                      key={brick.id}
                      className={`relative flex flex-col rounded-xl border-2 overflow-hidden transition-all group ${
                        brick.hasError 
                          ? 'border-rose-500/50 bg-rose-500/[0.03] shadow-[0_0_40px_rgba(244,63,94,0.1)]' 
                          : 'border-white/5 bg-white/[0.02]'
                      }`}
                    >
                      {/* Lego Studs */}
                      <div className="absolute -top-1 inset-x-0 h-4 flex gap-4 px-10 pointer-events-none opacity-20">
                         <div className="w-4 h-2 rounded-t bg-slate-800 border-x border-t border-white/40" />
                         <div className="w-4 h-2 rounded-t bg-slate-800 border-x border-t border-white/40" />
                      </div>

                      {/* Header */}
                      <div className={`px-4 py-2 border-b flex items-center justify-between ${brick.hasError ? 'border-rose-500/20 bg-rose-500/10' : 'border-white/5 bg-white/5'}`}>
                         <div className="flex items-center gap-3">
                           {brick.hasError ? <Bug className="w-4 h-4 text-rose-500" /> : <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                           <span className={`text-[10px] font-black tracking-[0.2em] uppercase ${brick.hasError ? 'text-rose-500' : 'text-indigo-400'}`}>{brick.funcName}</span>
                         </div>
                         <div className="flex items-center gap-2">
                            {brick.hasError && (
                              <button onClick={() => analyzeBricks(brick)} className="bg-rose-500 text-white px-2 py-1 rounded text-[8px] font-black uppercase hover:bg-rose-400 transition-all flex items-center gap-1">
                                <Sparkle className="w-2.5 h-2.5" /> Diagnostic
                              </button>
                            )}
                            <Settings className="w-3 h-3 text-slate-700 cursor-pointer hover:text-white" />
                         </div>
                      </div>

                      <div className="p-6 flex gap-6">
                        <pre className="text-[11px] text-slate-300 font-bold font-mono">{brick.code}</pre>
                      </div>

                      {brick.hasError && (
                        <div className="bg-rose-500/20 border-t border-rose-500/20 p-3 flex items-start gap-3">
                           <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5" />
                           <div className="text-[10px] font-black uppercase text-rose-500">Fractured_Logic_Brick :: {brick.errorMessage}</div>
                        </div>
                      )}
                    </motion.div>
                 ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* AI CHAT INTERFACE */}
      <div 
        className="absolute right-10 bottom-10 w-96 bg-[#12141a]/95 backdrop-blur-2xl border border-indigo-500/30 rounded-2xl overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.8)] z-[100] flex flex-col transition-all h-[450px]"
      >
        {/* Glow Header */}
        <div className="h-1 bg-indigo-500 w-full overflow-hidden relative">
           {isAiLoading && <motion.div animate={{ x: [-400, 400] }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="h-full bg-white w-1/4 shadow-[0_0_15px_#fff]" />}
        </div>
        
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
           <div className="flex items-center gap-3">
              <div className="relative">
                <Sparkle className="w-4 h-4 text-indigo-400" />
                <motion.div animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-0 rounded-full bg-indigo-400/20" />
              </div>
              <span className="text-[10px] font-black tracking-widest text-white uppercase">Jarvis_Neural_Link</span>
           </div>
           <div className="flex gap-2">
             <div className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-bold text-emerald-500 uppercase tracking-widest">
               Online
             </div>
             <button onClick={() => setChatHistory([])} className="text-slate-600 hover:text-white transition-all"><RefreshCw className="w-3 h-3" /></button>
           </div>
        </div>

        {/* Chat History */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/20"
        >
          {chatHistory.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center opacity-30 text-center px-10">
               <Bot className="w-12 h-12 mb-4 text-slate-700" />
               <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">Initialized. Awaiting assembly instructions or neural queries.</p>
            </div>
          )}
          {chatHistory.map((chat, idx) => (
            <div key={idx} className={`flex flex-col ${chat.role === 'user' ? 'items-end' : 'items-start'}`}>
               <div className={`max-w-[85%] px-4 py-3 rounded-xl text-[11px] font-bold leading-relaxed shadow-lg ${
                 chat.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none border border-white/10' 
                  : 'bg-white/5 border border-white/10 text-indigo-100 rounded-tl-none border-l-2 border-l-indigo-500'
               }`}>
                 {chat.content}
               </div>
               <span className="text-[8px] mt-1 font-black text-slate-700 uppercase tracking-tighter">
                 {chat.role === 'user' ? 'USER_ID::ALPHA' : 'JARVIS_COGNITION'}
               </span>
            </div>
          ))}
          {isAiLoading && (
            <div className="flex items-start gap-3">
               <div className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center">
                 <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
               </div>
               <div className="h-10 w-20 bg-white/5 border border-white/10 rounded-xl animate-pulse" />
            </div>
          )}
        </div>

        {/* Input Area */}
        <form onSubmit={sendMessage} className="p-4 bg-[#0d0f14] border-t border-white/5 relative">
           <input 
             value={userMessage}
             onChange={(e) => setUserMessage(e.target.value)}
             placeholder="Transmit neural query..."
             className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[11px] font-bold text-white placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/50 transition-all pr-12"
           />
           <button 
             type="submit"
             disabled={!userMessage.trim() || isAiLoading}
             className="absolute right-6 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-indigo-500 hover:text-white disabled:opacity-0 transition-all"
           >
             <Zap className="w-4 h-4 fill-current" />
           </button>
        </form>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.2); border-radius: 10px; }
      `}} />
    </div>
  );
}
