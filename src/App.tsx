import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowDown, Settings } from 'lucide-react';
import { questions } from './data/questions';
import QuestionCard from './components/QuestionCard';
import ChatAssistant from './components/ChatAssistant';
import { generateImagesForAnswer } from './lib/gemini';

export default function App() {
  const [mounted, setMounted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGeneratePresets = async () => {
    // @ts-ignore
    if (!window.aistudio?.hasSelectedApiKey?.()) {
      // @ts-ignore
      await window.aistudio?.openSelectKey?.();
    }
    
    setIsGenerating(true);
    try {
      for (const q of questions) {
        const base64Images = await generateImagesForAnswer(q.answer, 3);
        for (let i = 0; i < base64Images.length; i++) {
          const filename = `${q.id}_${i + 1}.jpg`;
          await fetch('/api/save-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename, base64: base64Images[i] })
          });
        }
      }
      alert('Images generated and saved successfully! Please refresh the page.');
    } catch (e: any) {
      alert('Error generating images: ' + e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans selection:bg-red-900/50 selection:text-red-200">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-red-900/20 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-red-950/30 blur-[150px] mix-blend-screen" />
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-red-800/10 blur-[100px] mix-blend-screen" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8000001a_1px,transparent_1px),linear-gradient(to_bottom,#8000001a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-12">
        {/* Header Section */}
        <motion.header 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-24"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-950/30 border border-red-900/50 text-red-500 text-xs font-mono tracking-widest uppercase mb-8 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
            <Sparkles size={14} className="animate-pulse" />
            <span>AI Startup Application</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-zinc-400 to-zinc-800 mb-6">
            一小步 <br className="md:hidden" />
            <span className="text-red-600 drop-shadow-[0_0_30px_rgba(239,68,68,0.8)]">Project</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-zinc-400 text-lg md:text-xl leading-relaxed font-light">
            探索人机共生的未来，以极简主义重塑价值创造。
            <br />
            这是我的思考、热情与愿景。
          </p>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-16 flex justify-center text-red-900/50 animate-bounce"
          >
            <ArrowDown size={32} />
          </motion.div>
        </motion.header>

        {/* Questions Section */}
        <main className="space-y-8">
          <div className="flex items-center gap-4 mb-12">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-red-900/50 to-transparent" />
            <h2 className="text-red-500 font-mono text-sm tracking-widest uppercase">The Interview</h2>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-red-900/50 to-transparent" />
          </div>

          <div className="flex flex-col gap-6">
            {questions.map((q, index) => (
              <QuestionCard key={q.id} question={q} index={index} />
            ))}
          </div>
        </main>

        {/* Chat Assistant Section */}
        <section className="mt-32">
          <div className="flex items-center gap-4 mb-12">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-red-900/50 to-transparent" />
            <h2 className="text-red-500 font-mono text-sm tracking-widest uppercase">Interactive Dialogue</h2>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-red-900/50 to-transparent" />
          </div>
          
          <ChatAssistant />
        </section>

        {/* Admin Setup Section */}
        <section className="mt-24 pt-12 border-t border-red-900/20 text-center">
          <p className="text-zinc-500 text-sm mb-4">Admin Only: Generate preset images using nanabanana2 model</p>
          <button
            onClick={handleGeneratePresets}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-900 border border-red-900/50 text-red-500 hover:bg-red-950/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Settings size={16} className={isGenerating ? "animate-spin" : ""} />
            {isGenerating ? "Generating & Saving Images..." : "Initialize Preset Images (Admin)"}
          </button>
        </section>
      </div>
    </div>
  );
}
