import React, { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AwardsBanner() {
  const [visible, setVisible] = useState(true);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="w-full bg-emerald-900/80 border-b border-emerald-700/50 backdrop-blur-sm"
        >
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center gap-2 text-sm text-emerald-100">
            <span>🏆</span>
            <span>
              SchoolACE is a <strong className="text-white">2026 Conrad Challenge Finalist</strong> — pitching Apr 23 at NASA Space Center, Houston.{' '}
              <a
                href="https://www.schoolace.ai/tutor/awards"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 text-emerald-300 hover:text-white transition-colors"
              >
                Learn more →
              </a>
            </span>
            <button
              onClick={() => setVisible(false)}
              className="ml-4 text-emerald-400 hover:text-white transition-colors flex-shrink-0"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}