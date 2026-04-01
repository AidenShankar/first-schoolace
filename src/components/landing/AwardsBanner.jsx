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
      const animate = (now) => {
        const t = Math.min((now - start) / 8000, 1);
        const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        setSpotlightX(-20 + eased * 140);
        if (t < 1) rafRef.current = requestAnimationFrame(animate);
        else timerRef.current = setTimeout(sweep, 4000);
      };
      rafRef.current = requestAnimationFrame(animate);
    };
    timerRef.current = setTimeout(sweep, 800);
    return () => { clearTimeout(timerRef.current); cancelAnimationFrame(rafRef.current); };
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25 }}
          className="flex justify-center px-4 py-2"
        >
          <div
            className="relative overflow-hidden rounded-full flex items-center gap-3 px-4 py-1.5 text-xs font-medium"
            style={{ background: '#071510', border: '1px solid rgba(52,211,153,0.3)', boxShadow: '0 0 12px rgba(52,211,153,0.08)' }}
          >
            <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(ellipse 160px 100% at ${spotlightX}% 50%, rgba(52,211,153,0.1) 0%, transparent 70%)` }} />
            <span className="relative text-emerald-200/80 whitespace-nowrap">
              🏆 SchoolACE is a <strong className="text-white font-semibold">2026 Conrad Challenge Finalist</strong>, pitching Apr 23 at NASA Space Center, Houston.
              <a href="https://aitutor.schoolace.ai/tutor/awards" className="ml-2 text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">Learn more →</a>
            </span>
            <button onClick={() => setVisible(false)} className="relative text-emerald-600 hover:text-emerald-300 transition-colors ml-1" aria-label="Dismiss">
              <X className="w-3 h-3" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}