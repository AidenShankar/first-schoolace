import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AwardsBanner() {
  const [visible, setVisible] = useState(true);
  const [spotlightPos, setSpotlightPos] = useState(-30);
  const bannerRef = useRef(null);

  useEffect(() => {
    if (!visible) return;

    // Spotlight: sweep every (8s duration + 4s delay) = 12s cycle
    const runSpotlight = () => {
      const start = performance.now();
      const duration = 8000;

      const animate = (now) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease in-out
        const eased = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        // Move from -30% to 130%
        setSpotlightPos(-30 + eased * 160);
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    };

    // Initial run after 1s
    const initial = setTimeout(runSpotlight, 1000);

    // Then every 12s (8s sweep + 4s pause)
    const interval = setInterval(runSpotlight, 12000);

    return () => {
      clearTimeout(initial);
      clearInterval(interval);
    };
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          className="fixed bottom-6 left-1/2 z-[200]"
          style={{ transform: 'translateX(-50%)', width: 'calc(100% - 48px)', maxWidth: '680px' }}
        >
          <div
            ref={bannerRef}
            className="relative overflow-hidden rounded-full border border-emerald-500/40 px-5 py-3 flex items-center gap-3 shadow-lg shadow-emerald-900/30"
            style={{ background: 'rgba(6, 30, 26, 0.92)', backdropFilter: 'blur(12px)' }}
          >
            {/* Spotlight sweep */}
            <div
              className="pointer-events-none absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(ellipse 120px 100% at ${spotlightPos}% 50%, rgba(52, 211, 153, 0.18) 0%, transparent 70%)`,
                transition: 'none',
              }}
            />

            {/* Text */}
            <p className="relative z-10 text-sm text-emerald-100 flex-1 text-center">
              SchoolACE is a{' '}
              <strong className="text-white font-bold">2026 Conrad Challenge Finalist</strong>
              , pitching Apr 23 at NASA Space Center, Houston.{' '}
              <a
                href="https://www.schoolace.ai/tutor/awards"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-emerald-300 hover:text-emerald-200 transition-colors"
              >
                Learn more →
              </a>
            </p>

            {/* Dismiss */}
            <button
              onClick={() => setVisible(false)}
              className="relative z-10 text-emerald-400 hover:text-white transition-colors flex-shrink-0 ml-1"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}