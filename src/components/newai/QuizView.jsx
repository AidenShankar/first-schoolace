import React, { useState } from "react";
import NotesSidebar from "./NotesSidebar";
import { base44 } from "@/api/base44Client";
import { ChevronLeft, ChevronRight, Lightbulb, Settings, ArrowUpRight, Send } from "lucide-react";

export default function QuizView({ questions, notesData, onBack }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState({});
  const [showHint, setShowHint] = useState(false);
  const [hint, setHint] = useState("");
  const [hintLoading, setHintLoading] = useState(false);
  const [askInput, setAskInput] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const q = questions[current];
  const total = questions.length;
  const progressPct = ((current + 1) / total) * 100;

  const handleSelect = (letter) => {
    if (selected[current] !== undefined) return; // already answered
    setSelected(prev => ({ ...prev, [current]: letter }));
    setShowHint(false);
    setHint("");
    setAiAnswer("");
  };

  const handleShowHint = async () => {
    if (showHint) { setShowHint(false); return; }
    setShowHint(true);
    if (hint) return;
    setHintLoading(true);
    try {
      const h = await base44.integrations.Core.InvokeLLM({
        prompt: `Give a short 1-sentence hint (no answer) for this quiz question: "${q.question}". Just the hint, no preamble.`,
      });
      setHint(typeof h === "string" ? h : h.content || "Think carefully about the key concepts.");
    } catch {
      setHint("Think carefully about the key concepts covered in your notes.");
    } finally {
      setHintLoading(false);
    }
  };

  const handleAsk = async () => {
    if (!askInput.trim() || aiLoading) return;
    const q_text = q.question;
    const msg = askInput.trim();
    setAskInput("");
    setAiLoading(true);
    setAiAnswer("");
    try {
      const r = await base44.integrations.Core.InvokeLLM({
        prompt: `A student is taking a quiz. The question is: "${q_text}". The student asks: "${msg}". Give a helpful short response without directly revealing the answer.`,
      });
      setAiAnswer(typeof r === "string" ? r : r.content || "");
    } catch {
      setAiAnswer("Sorry, I couldn't respond right now.");
    } finally {
      setAiLoading(false);
    }
  };

  const goNext = () => {
    if (current < total - 1) {
      setCurrent(c => c + 1);
      setShowHint(false);
      setHint("");
      setAiAnswer("");
    }
  };
  const goPrev = () => {
    if (current > 0) {
      setCurrent(c => c - 1);
      setShowHint(false);
      setHint("");
      setAiAnswer("");
    }
  };

  const answered = selected[current];
  const isCorrect = answered === q.correct;

  const optionStyle = (letter) => {
    if (!answered) return { background: "#1e1e1e", border: "1px solid #2e2e2e", color: "#d1d5db" };
    if (letter === q.correct) return { background: "#14532d22", border: "1px solid #16a34a", color: "#4ade80" };
    if (letter === answered && letter !== q.correct) return { background: "#7f1d1d22", border: "1px solid #dc2626", color: "#f87171" };
    return { background: "#1e1e1e", border: "1px solid #2e2e2e", color: "#6b6b6b" };
  };

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: "#111111", color: "#e8e8e8" }}>
      <NotesSidebar onReset={onBack} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top progress bar */}
        <div className="flex items-center gap-3 px-6 py-3 shrink-0" style={{ borderBottom: "1px solid #2a2a2a" }}>
          <div className="w-8 h-8 flex items-center justify-center rounded-full" style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#9ca3af"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </div>
          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "#2a2a2a" }}>
            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progressPct}%`, background: "#4ade80" }} />
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: "#14532d", color: "#4ade80" }}>
            {current + 1} / {total}
          </span>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto flex items-start justify-center py-10 px-4">
          <div className="w-full max-w-xl rounded-2xl p-8" style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}>
            {/* Question header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-1 h-5 rounded-full mr-1" style={{ background: "#7c3aed" }} />
                  <span className="font-semibold text-sm" style={{ color: "#e8e8e8" }}>Question {current + 1}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                </div>
                {q.topic && (
                  <span className="text-xs px-2.5 py-1 rounded-full border" style={{ borderColor: "#0e7490", color: "#22d3ee", background: "#0e749010" }}>
                    🏷 {q.topic}
                  </span>
                )}
              </div>
              <button className="flex items-center gap-1.5 text-xs" style={{ color: "#6b6b6b" }}>
                <Settings className="w-3.5 h-3.5" />
                Quiz Settings
              </button>
            </div>

            {/* Question text */}
            <p className="text-base leading-relaxed mb-6" style={{ color: "#f3f4f6" }}>{q.question}</p>

            {/* Options */}
            <div className="space-y-2.5 mb-6">
              {q.options.map((opt) => (
                <button key={opt.letter} onClick={() => handleSelect(opt.letter)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all"
                  style={{ ...optionStyle(opt.letter), cursor: answered ? "default" : "pointer" }}>
                  <span className="w-6 h-6 flex items-center justify-center rounded text-xs font-semibold shrink-0"
                    style={{ background: "#2e2e2e", color: "#9ca3af" }}>{opt.letter}</span>
                  <span className="text-sm">{opt.text}</span>
                </button>
              ))}
            </div>

            {/* AI answer */}
            {aiAnswer && (
              <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: "#1e1e2e", border: "1px solid #3730a3", color: "#a5b4fc" }}>
                {aiAnswer}
              </div>
            )}

            {/* Hint */}
            {showHint && (
              <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: "#1e2a1e", border: "1px solid #166534", color: "#86efac" }}>
                {hintLoading ? "Loading hint..." : hint}
              </div>
            )}

            {/* Show Hint button */}
            <button onClick={handleShowHint}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={{ border: "1px solid #2563eb", color: "#60a5fa", background: "transparent" }}
              onMouseEnter={e => e.currentTarget.style.background = "#1e3a5f20"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <Lightbulb className="w-4 h-4" />
              {showHint ? "Hide Hint" : "Show Hint"}
            </button>

            {/* Bottom bar */}
            <div className="flex items-center gap-2 mt-4">
              <button onClick={goPrev} disabled={current === 0}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm disabled:opacity-30 transition-colors"
                style={{ border: "1px solid #2e2e2e", color: "#9ca3af", background: "#1e1e1e" }}>
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "#1e1e1e", border: "1px solid #2e2e2e" }}>
                <ArrowUpRight className="w-3.5 h-3.5 shrink-0" style={{ color: "#6b6b6b" }} />
                <input value={askInput} onChange={e => setAskInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleAsk()}
                  placeholder="Ask AI for help..."
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: "#9ca3af" }} />
                <button onClick={handleAsk} disabled={!askInput.trim() || aiLoading}
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 disabled:opacity-30"
                  style={{ background: "#7c3aed" }}>
                  <Send className="w-3 h-3 text-white" />
                </button>
              </div>

              <button onClick={goNext} disabled={current === total - 1}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm disabled:opacity-30 transition-colors"
                style={{ border: "1px solid #2e2e2e", color: "#9ca3af", background: "#1e1e1e" }}>
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}