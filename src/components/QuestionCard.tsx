import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Question } from '../data/questions';

interface QuestionCardProps {
  question: Question;
  index: number;
  key?: string;
}

export default function QuestionCard({ question, index }: QuestionCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="mb-6 rounded-2xl border border-red-900/30 bg-zinc-950/50 backdrop-blur-sm overflow-hidden shadow-[0_0_15px_rgba(239,68,68,0.05)] hover:shadow-[0_0_25px_rgba(239,68,68,0.15)] transition-all duration-300"
    >
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-6 flex items-center justify-between focus:outline-none group"
      >
        <h2 className="text-xl md:text-2xl font-medium text-zinc-100 group-hover:text-red-400 transition-colors">
          {question.question}
        </h2>
        <div className="ml-4 flex-shrink-0 text-red-500">
          {isOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 pt-0 border-t border-red-900/20">
              {/* Summary Section */}
              <div className="mb-8 p-4 rounded-xl bg-red-950/20 border border-red-900/40">
                <h3 className="text-red-500 text-sm font-mono uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  Core Viewpoint
                </h3>
                <p className="text-zinc-300 leading-relaxed font-medium">
                  {question.summary}
                </p>
              </div>

              {/* Answer Section */}
              <div className="mb-8">
                <h3 className="text-zinc-500 text-sm font-mono uppercase tracking-wider mb-4">
                  Full Response
                </h3>
                <div className="text-zinc-300 leading-relaxed space-y-4 whitespace-pre-wrap">
                  {question.answer}
                </div>
              </div>

              {/* Images Section */}
              <div className="mt-8 pt-8 border-t border-red-900/20">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-zinc-500 text-sm font-mono uppercase tracking-wider">
                    Visual Concepts
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {question.images.map((img, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.2 }}
                      className="aspect-video rounded-xl overflow-hidden border border-red-900/30 relative group bg-black"
                    >
                      {/* Image with CSS filters to match the black/red aesthetic */}
                      <img 
                        src={img} 
                        alt={`Visual concept ${i + 1}`} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover mix-blend-luminosity opacity-70 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110"
                        onError={(e) => {
                          // Fallback to picsum if local image is missing
                          e.currentTarget.src = `https://picsum.photos/seed/startup_${question.id}_${i + 1}/800/450`;
                        }}
                      />
                      {/* Red tint overlay */}
                      <div className="absolute inset-0 bg-red-900/30 mix-blend-color pointer-events-none" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <span className="text-red-400 font-mono text-xs tracking-widest uppercase">Vision 0{i + 1}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
