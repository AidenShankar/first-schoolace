import React from "react";
import { Clock, Zap } from "lucide-react";

const TIPS = [
  "Your notes will be organized into sections automatically.",
  "Key terms and definitions will be highlighted.",
  "Reading check questions will be generated for you.",
  "You can chat with an AI about your notes after they're created.",
  "Compare & contrast tables will be built from your document.",
];

export default function ProcessingView({ progress, label }) {
  const tip = TIPS[Math.floor((progress / 100) * TIPS.length)] || TIPS[0];
  const clampedProgress = Math.min(progress, 100);

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #f0f4ff 100%)" }}>
      
      <div className="w-full max-w-lg bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-purple-100 p-10"
        style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(245,240,255,0.9) 100%)" }}>
        
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-gray-900">Creating Your Notes</h2>
          <div className="flex items-center gap-1.5 text-sm text-gray-400">
            <Clock className="w-4 h-4" />
            This should take a few minutes...
          </div>
        </div>

        <div className="text-center mb-6">
          <span className="text-6xl font-bold text-gray-900">{clampedProgress}<span className="text-4xl">%</span></span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-3 bg-purple-100 rounded-full overflow-hidden mb-4">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${clampedProgress}%`,
              background: "linear-gradient(to right, #a855f7, #818cf8)"
            }}
          />
        </div>

        <p className="text-center font-semibold text-gray-700 mb-8">{label}</p>

        <div className="border-t border-purple-100 pt-5">
          <p className="text-xs font-bold text-purple-500 tracking-widest text-center mb-2">TIP</p>
          <p className="text-sm text-gray-500 text-center flex items-center justify-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            {tip}
          </p>
        </div>
      </div>
    </div>
  );
}