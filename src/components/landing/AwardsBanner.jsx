import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AwardsBanner() {
  const [visible, setVisible] = useState(true);
  const [spotlightX, setSpotlightX] = useState(-20);
  const rafRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!visible) return;

    const sweep = () => {
      const start = performance.now();
      const duration = 8000;

      const animate = (now) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        setSpotlightX(-20 + eased * 140);
        if (t < 1) {
          rafRef.current = requestAnimationFrame(animate);
        } else {
          // 4s pause then repeat
          timerRef.current = setTimeout(sweep, 4000);
        }
      };

      rafRef.current = requestAnimationFrame(animate);
    };

    timerRef.current = setTimeout(sweep, 800);

    return () => {
      clearTimeout(timerRef.current);
      cancelAnimationFrame(rafRef.current);
    };
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3 }}
          className="relative w-full overflow-hidden"
          style={{ background: '#0a1f1a', borderBottom: '1px solid rgba(52,211,153,0.25)' }}
        >
          {/* Spotlight sweep */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 180px 100% at ${spotlightX}% 50%, rgba(52,211,153,0.13) 0%, transparent 70%)`,
            }}
          />

          <div className="relative max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-center gap-2 text-sm">
            <span className="text-emerald-100">
              SchoolACE is a 2026{' '}
              <strong className="text-white font-bold">Conrad Challenge Finalist</strong>
              , pitching Apr 23 at NASA Space Center, Houston.{'  '}
              <a
                href="https://www.schoolace.ai/tutor/awards"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Learn more →
              </a>
            </span>
            <button
              onClick={() => setVisible(false)}
              className="ml-3 text-emerald-500 hover:text-white transition-colors flex-shrink-0"
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