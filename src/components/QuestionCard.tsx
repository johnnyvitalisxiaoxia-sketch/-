import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Question } from '../data/questions';
import { getImages, saveImages } from '../lib/db';
import { generateImagesForAnswer } from '../lib/gemini';

interface QuestionCardProps {
  question: Question;
  index: number;
  key?: string;
}

export default function QuestionCard({ question, index }: QuestionCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadImages = async () => {
      try {
        const storedImages = await getImages(question.id);
        if (storedImages && storedImages.length > 0) {
          setImages(storedImages);
        }
      } catch (err) {
        console.error('Failed to load images from DB', err);
      }
    };
    loadImages();
  }, [question.id]);

  const handleGenerateImages = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Check if API key is selected
    // @ts-ignore
    if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
      try {
        // @ts-ignore
        await window.aistudio.openSelectKey();
      } catch (err) {
        setError('Please select an API key to generate images.');
        return;
      }
    }

    setIsLoadingImages(true);
    setError(null);
    try {
      const generatedImages = await generateImagesForAnswer(question.answer, 3);
      setImages(generatedImages);
      await saveImages(question.id, generatedImages);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate images.');
    } finally {
      setIsLoadingImages(false);
    }
  };

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
                    AI Generated Visions
                  </h3>
                  
                  {images.length === 0 && !isLoadingImages && (
                    <button 
                      onClick={handleGenerateImages}
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-600/10 text-red-500 border border-red-500/30 hover:bg-red-600/20 transition-colors text-sm font-medium"
                    >
                      <ImageIcon size={16} />
                      Generate Images
                    </button>
                  )}
                </div>

                {isLoadingImages && (
                  <div className="flex flex-col items-center justify-center py-12 text-red-500">
                    <Loader2 size={32} className="animate-spin mb-4" />
                    <p className="text-sm font-mono animate-pulse">Synthesizing visual concepts...</p>
                  </div>
                )}

                {error && (
                  <div className="p-4 rounded-xl bg-red-950/50 border border-red-500/50 text-red-400 text-sm mb-6">
                    {error}
                  </div>
                )}

                {images.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {images.map((img, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.2 }}
                        className="aspect-video rounded-xl overflow-hidden border border-red-900/30 relative group"
                      >
                        <img 
                          src={img} 
                          alt={`Generated vision ${i + 1}`} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                          <span className="text-red-400 font-mono text-xs">Vision 0{i + 1}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
                
                {images.length > 0 && !isLoadingImages && (
                  <div className="mt-4 flex justify-end">
                    <button 
                      onClick={handleGenerateImages}
                      className="text-xs text-zinc-500 hover:text-red-400 transition-colors underline underline-offset-4"
                    >
                      Regenerate Images
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
