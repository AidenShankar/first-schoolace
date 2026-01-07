import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, ArrowRight, Play, Volume2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function Demo() {
  const [showFullDemo, setShowFullDemo] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-950 to-purple-950 text-white flex flex-col">
      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl w-full"
        >
          <AnimatePresence mode="wait">
            {!showFullDemo ? (
              <motion.div
                key="ace-demo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <GraduationCap className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-indigo-300">
                    ACE AI Demo
                  </h1>
                  <p className="text-xl text-slate-300">
                    See how ACE AI transforms personalized learning
                  </p>
                </div>

                {/* Volume Banner */}
                <div className="flex items-center justify-center gap-2 mb-4 text-yellow-400 text-sm">
                  <Volume2 className="w-4 h-4" />
                  <span>Turn up your volume for the best experience</span>
                </div>

                {/* ACE AI Video Container */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black/40 backdrop-blur-sm border border-white/10 mb-8">
                  <div className="aspect-video w-full flex items-center justify-center">
                    <iframe 
                      src="https://drive.google.com/file/d/1yJ780w91d5UY5qg_tlbTazdjDyeHySNb/preview" 
                      width="100%" 
                      height="100%" 
                      allow="autoplay"
                      className="w-full h-full"
                      style={{ minHeight: '480px' }}
                    />
                  </div>
                </div>

                {/* CTA Button */}
                <div className="text-center">
                  <button 
                    onClick={() => setShowFullDemo(true)}
                    className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-semibold text-lg hover:shadow-lg hover:scale-105 transition-all"
                  >
                    <Play className="w-6 h-6" />
                    Watch Full Schoolace Demo
                    <ArrowRight className="w-6 h-6" />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="full-demo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <GraduationCap className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-indigo-300">
                    Full Schoolace Demo
                  </h1>
                  <p className="text-xl text-slate-300">
                    Discover the complete Schoolace platform
                  </p>
                </div>

                {/* Volume Banner */}
                <div className="flex items-center justify-center gap-2 mb-4 text-yellow-400 text-sm">
                  <Volume2 className="w-4 h-4" />
                  <span>Turn up your volume for the best experience</span>
                </div>

                {/* Full Demo Video Container */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black/40 backdrop-blur-sm border border-white/10 mb-8">
                  <div className="aspect-video w-full flex items-center justify-center">
                    <iframe 
                      src="https://drive.google.com/file/d/13JOv4yGMbSAlA9hIrMg6vYOv6XoDVTOH/preview" 
                      width="100%" 
                      height="100%" 
                      allow="autoplay"
                      className="w-full h-full"
                      style={{ minHeight: '480px' }}
                    />
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-4 justify-center">
                  <button 
                    onClick={() => setShowFullDemo(false)}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white font-semibold transition-all"
                  >
                    ← Back to ACE AI Demo
                  </button>
                  <Link 
                    to={createPageUrl('Landing')} 
                    className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white font-semibold hover:shadow-lg hover:scale-105 transition-all"
                  >
                    Get Started with Schoolace
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}