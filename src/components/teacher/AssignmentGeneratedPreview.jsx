import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, Send, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

function BouncingDots() {
  return (
    <span className="inline-flex items-end gap-0.5 ml-1 h-4">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1 h-1 rounded-full bg-white inline-block"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </span>
  );
}

export default function AssignmentGeneratedPreview({ onBack }) {
  const [chatInput, setChatInput] = useState("");
  const [finalizeState, setFinalizeState] = useState("idle"); // idle | finalizing | released
  const [showReleasedDialog, setShowReleasedDialog] = useState(false);

  const handleFinalize = () => {
    setFinalizeState("finalizing");
    setTimeout(() => {
      setFinalizeState("idle");
      setShowReleasedDialog(true);
    }, 2500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Generated Assignment</h3>
          <p className="text-sm text-slate-500 mt-0.5">Review the assignment below, request changes, or finalize.</p>
        </div>
        <Button variant="outline" onClick={onBack} className="rounded-xl text-sm">
          ← Back to Generator
        </Button>
      </div>

      {/* Worksheet Preview */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-8 max-w-3xl mx-auto" style={{ fontFamily: "'Arial', sans-serif" }}>
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="font-bold text-base">Circles, Ellipses, and Hyperbolas</div>
            <div className="font-bold text-base">Name_________________________</div>
          </div>

          {/* Instructions */}
          <p className="text-sm mb-8">Write the standard form equation of each conic section shown below.</p>

          {/* Grid of problems */}
          {[[1,2,3],[4,5,6],[7,8,9]].map((row, rowIdx) => (
            <div key={rowIdx} className="mb-8">
              <div className="grid grid-cols-3 gap-6">
                {row.map((num) => (
                  <div key={num} className="flex flex-col items-center">
                    <div className="font-bold text-sm self-start mb-2">{num}.</div>
                    {/* Graph placeholder */}
                    <div className="w-full aspect-square border border-slate-300 rounded bg-slate-50 flex items-center justify-center relative" style={{ maxWidth: 160 }}>
                      {/* Grid lines */}
                      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-20">
                        {[10,20,30,40,50,60,70,80,90].map(v => (
                          <g key={v}>
                            <line x1={v} y1={0} x2={v} y2={100} stroke="#64748b" strokeWidth="0.5"/>
                            <line x1={0} y1={v} x2={100} y2={v} stroke="#64748b" strokeWidth="0.5"/>
                          </g>
                        ))}
                        {/* Axes */}
                        <line x1={50} y1={0} x2={50} y2={100} stroke="#1e293b" strokeWidth="1"/>
                        <line x1={0} y1={50} x2={100} y2={50} stroke="#1e293b" strokeWidth="1"/>
                        {/* Arrows */}
                        <polygon points="50,2 47,8 53,8" fill="#1e293b"/>
                        <polygon points="50,98 47,92 53,92" fill="#1e293b"/>
                        <polygon points="2,50 8,47 8,53" fill="#1e293b"/>
                        <polygon points="98,50 92,47 92,53" fill="#1e293b"/>
                      </svg>
                    </div>
                    {/* Answer line */}
                    <div className="mt-3 w-full border-b border-black" style={{ maxWidth: 160 }}></div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <p className="text-xs text-slate-400 mt-6 text-center">©2011 InquiSoft. Reproduction for educational use permitted provided that this footer text is retained.</p>
        </div>
      </div>

      {/* AI Chat Bubble */}
      <div className="relative">
        <div className="flex items-end gap-3">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          {/* Input bubble */}
          <div className="flex-1 bg-white border border-slate-200 rounded-2xl rounded-bl-sm shadow-sm overflow-hidden">
            <div className="px-4 py-3 text-sm text-slate-400 font-medium">
              Request any changes to this assignment…
            </div>
            <div className="border-t border-slate-100 px-4 py-2 flex items-center justify-between">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder='e.g. "Add a vocabulary section at the end"'
                className="flex-1 text-sm text-slate-700 outline-none bg-transparent placeholder:text-slate-400"
                disabled
              />
              <button disabled className="ml-3 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center opacity-50 cursor-not-allowed">
                <Send className="w-3.5 h-3.5 text-indigo-600" />
              </button>
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-2 ml-12">Powered by ACE AI · Changes coming soon</p>
      </div>

      {/* Finalize Button */}
      <div className="flex justify-end pt-2">
        <Button
          onClick={handleFinalize}
          disabled={finalizeState === "finalizing"}
          className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold text-sm min-w-[180px]"
        >
          {finalizeState === "finalizing" ? (
            <span className="flex items-center">
              Finalizing<BouncingDots />
            </span>
          ) : (
            "Finalize and Release"
          )}
        </Button>
      </div>

      {/* Released Dialog */}
      <Dialog open={showReleasedDialog} onOpenChange={setShowReleasedDialog}>
        <DialogContent className="sm:max-w-sm text-center">
          <DialogHeader>
            <div className="flex justify-center mb-3">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9 text-green-500" />
              </div>
            </div>
            <DialogTitle className="text-2xl font-bold text-slate-900 text-center">Released!</DialogTitle>
          </DialogHeader>
          <p className="text-slate-500 text-sm mt-1 mb-4">The assignment has been released to your students.</p>
          <DialogFooter className="sm:justify-center">
            <Button
              onClick={() => setShowReleasedDialog(false)}
              className="px-10 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl"
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}