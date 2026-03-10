import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { getGenAI } from '../lib/gemini';
import { questions } from '../data/questions';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '你好！我是基于 Gemini 3 Flash 的 AI 助手。你可以向我提问关于这份申请的任何内容，或者和我探讨 AI 创业、极简主义、人机共存等话题。'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const ai = getGenAI();
      
      // Build context from questions
      const context = questions.map(q => `Q: ${q.question}\nA: ${q.answer}`).join('\n\n');
      
      const systemInstruction = `你是一个AI创业项目申请者的个人AI助手。你的任务是帮助浏览者更好地了解申请者。
以下是申请者的核心问答内容作为你的背景知识：
${context}

请用专业、真诚、富有科技感和哲学思考的语气回答用户的问题。如果用户问及申请者的信息，请基于上述背景知识回答。如果用户探讨更广泛的话题（如AI、创业、未来），请结合申请者的价值观（如人机共存、创造人类推动力、极简主义）进行探讨。`;

      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction,
        }
      });

      // Send previous conversation history (simplified for this demo)
      for (const msg of messages.slice(1)) { // skip initial greeting
        if (msg.role === 'user') {
          await chat.sendMessage({ message: msg.content });
        }
      }

      const response = await chat.sendMessage({ message: userMessage });
      
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'assistant', 
        content: response.text || '抱歉，我无法生成回复。' 
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'assistant', 
        content: '抱歉，系统连接出现问题，请稍后再试。' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-16 mb-24 rounded-2xl border border-red-900/30 bg-zinc-950/80 backdrop-blur-md overflow-hidden shadow-[0_0_30px_rgba(239,68,68,0.1)] flex flex-col h-[500px]">
      <div className="p-4 border-b border-red-900/30 bg-black/50 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-red-600/20 flex items-center justify-center text-red-500 border border-red-500/30">
          <Bot size={18} />
        </div>
        <div>
          <h3 className="text-zinc-100 font-medium">AI Assistant</h3>
          <p className="text-red-500/70 text-xs font-mono">Powered by Gemini 3 Flash</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
              msg.role === 'user' 
                ? 'bg-zinc-800 border-zinc-700 text-zinc-300' 
                : 'bg-red-950 border-red-900 text-red-500'
            }`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`max-w-[80%] rounded-2xl p-4 ${
              msg.role === 'user'
                ? 'bg-zinc-800/50 border border-zinc-700/50 text-zinc-200 rounded-tr-none'
                : 'bg-red-950/20 border border-red-900/30 text-zinc-300 rounded-tl-none'
            }`}>
              <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                {msg.content}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-red-950 border border-red-900 text-red-500 flex items-center justify-center shrink-0">
              <Bot size={16} />
            </div>
            <div className="bg-red-950/20 border border-red-900/30 rounded-2xl rounded-tl-none p-4 flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-red-500" />
              <span className="text-zinc-500 text-sm font-mono">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-red-900/30 bg-black/50">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about the application..."
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-full py-3 pl-6 pr-12 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center disabled:opacity-50 disabled:bg-zinc-700 transition-colors"
          >
            <Send size={14} className="ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
