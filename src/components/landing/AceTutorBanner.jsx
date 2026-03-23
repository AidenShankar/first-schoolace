import React from "react";
import { ArrowRight } from "lucide-react";

export default function AceTutorBanner() {
  return (
    <div className="relative z-30 w-full flex justify-center px-4 py-3">
      <div
        className="w-full max-w-4xl rounded-2xl overflow-hidden px-4 py-3 flex flex-row items-center justify-center gap-3 whitespace-nowrap"
        style={{
          background: "linear-gradient(90deg, #3b0764, #4c1d95, #6d28d9, #7c3aed, #6d28d9, #4c1d95, #3b0764)",
          backgroundSize: "200% 100%",
          animation: "gradient-x 4s ease infinite",
        }}
      >
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white border border-white/30 tracking-wide uppercase">
            Invite Only
          </span>
          <span className="text-white font-semibold text-sm sm:text-base">
            <span className="font-extrabold text-yellow-300">MEET ACE</span> — Your 24/7 AI tutor that adapts in real time to how you learn.
          </span>
        </div>
        <a
          href="https://schoolace.ai/tutor?requestacess"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold text-purple-900 bg-white hover:bg-yellow-300 transition-all duration-200 shadow-lg whitespace-nowrap"
        >
          Get Early Access <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}