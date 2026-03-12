import React, { useState } from "react";
import NotesSidebar from "./NotesSidebar";
import { base44 } from "@/api/base44Client";
import { ChevronLeft, ChevronRight, Lightbulb, Settings, Zap, Send } from "lucide-react";

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
    if (selected[current] !== undefined) return;
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
      setShowHint(false); setHint(""); setAiAnswer("");
    }
  };
  const goPrev = () => {
    if (current > 0) {
      setCurrent(c => c - 1);
      setShowHint(false); setHint(""); setAiAnswer("");
    }
  };

  const answered = selected[current];

  const optionBg = (letter) => {
    if (!answered) return { bg: "#1c1c1e", border: "#2e2e2e", color: "#d1d5db", letterBg: "#2a2a2a", letterColor: "#9ca3af" };
    if (letter === q.correct) return { bg: "#0a2e1a", border: "#16a34a", color: "#4ade80", letterBg: "#16a34a", letterColor: "#fff" };
    if (letter === answered && letter !== q.correct) return { bg: "#2a0a0a", border: "#dc2626", color: "#f87171", letterBg: "#dc2626", letterColor: "#fff" };
    return { bg: "#1c1c1e", border: "#2a2a2a", color: "#4b5563", letterBg: "#2a2a2a", letterColor: "#4b5563" };
  };

  return (
    <>
      <style>{`
        .quiz-option { transition: all 0.15s ease; }
        .quiz-option:not(:disabled):hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(0,0,0,0.4); }
        .quiz-btn { transition: all 0.15s ease; }
        .quiz-btn:not(:disabled):hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
        .hint-btn { transition: all 0.15s ease; }
        .hint-btn:hover { background: rgba(37,99,235,0.1) !important; box-shadow: 0 0 0 1px #2563eb; }
      `}</style>

      <div className="h-screen flex overflow-hidden" style={{ background: "#111111", color: "#e8e8e8" }}>
        <NotesSidebar onReset={onBack} />

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top progress bar */}
          <div className="flex items-center gap-4 px-8 py-3 shrink-0">
            {/* Trophy icon */}
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="#6b6b6b" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2M5 7h14l-1.5 10.5A2 2 0 0115.5 19h-7a2 2 0 01-1.993-1.5L5 7zm4 5h6" />
            </svg>
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "#2a2a2a" }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%`, background: "#4ade80" }} />
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: "#1a2e1a", color: "#4ade80", border: "1px solid #166534" }}>
              {current + 1} / {total}
            </span>
          </div>

          {/* Main content — centered, large card */}
          <div className="flex-1 overflow-y-auto flex items-center justify-center px-8 py-6">
            <div className="w-full max-w-2xl rounded-2xl px-10 py-8" style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}>
              
              {/* Question header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 rounded-full" style={{ background: "#7c3aed" }} />
                    <span className="font-semibold text-base" style={{ color: "#e8e8e8" }}>Question {current + 1}</span>
                    <ChevronRight className="w-4 h-4" style={{ color: "#4b5563" }} />
                  </div>
                  {q.topic && (
                    <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border"
                      style={{ borderColor: "#0e7490", color: "#22d3ee", background: "rgba(14,116,144,0.1)" }}>
                      🏷 {q.topic}
                    </span>
                  )}
                </div>
                <button className="flex items-center gap-1.5 text-xs quiz-btn px-2.5 py-1.5 rounded-lg"
                  style={{ color: "#6b6b6b", border: "1px solid #2a2a2a", background: "#1e1e1e" }}>
                  <Settings className="w-3.5 h-3.5" />
                  Quiz Settings
                </button>
              </div>

              {/* Question text */}
              <p className="text-lg leading-relaxed mb-8" style={{ color: "#f3f4f6" }}>{q.question}</p>

              {/* Options */}
              <div className="space-y-3 mb-6">
                {q.options.map((opt) => {
                  const s = optionBg(opt.letter);
                  return (
                    <button key={opt.letter} onClick={() => handleSelect(opt.letter)}
                      disabled={!!answered}
                      className="quiz-option w-full flex items-center gap-4 px-5 py-4 rounded-xl text-left"
                      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color, cursor: answered ? "default" : "pointer" }}>
                      <span className="w-7 h-7 flex items-center justify-center rounded-md text-xs font-bold shrink-0"
                        style={{ background: s.letterBg, color: s.letterColor }}>{opt.letter}</span>
                      <span className="text-sm leading-relaxed">{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {/* AI Answer */}
              {aiAnswer && (
                <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: "#1e1e2e", border: "1px solid #3730a3", color: "#a5b4fc" }}>
                  {aiLoading ? "Thinking..." : aiAnswer}
                </div>
              )}

              {/* Hint box */}
              {showHint && (
                <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: "#0a2e1a", border: "1px solid #166534", color: "#86efac" }}>
                  {hintLoading ? "Loading hint..." : hint}
                </div>
              )}

              {/* Show Hint button */}
              <button onClick={handleShowHint}
                className="hint-btn w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium mb-4"
                style={{ border: "1px solid #2563eb", color: "#60a5fa", background: "transparent" }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {showHint ? "Hide Hint" : "Show Hint"}
              </button>

              {/* Bottom nav bar */}
              <div className="flex items-center gap-3">
                <button onClick={goPrev} disabled={current === 0}
                  className="quiz-btn flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium disabled:opacity-30"
                  style={{ border: "1px solid #2e2e2e", color: "#9ca3af", background: "#1e1e1e" }}>
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>

                <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl"
                  style={{ background: "#1e1e1e", border: "1px solid #2e2e2e" }}>
                  <Zap className="w-3.5 h-3.5 shrink-0" style={{ color: "#6b6b6b" }} />
                  <input value={askInput} onChange={e => setAskInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleAsk()}
                    placeholder="Ask AI for help..."
                    className="flex-1 bg-transparent text-sm outline-none"
                    style={{ color: "#9ca3af" }} />
                  <button onClick={handleAsk} disabled={!askInput.trim() || aiLoading}
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 disabled:opacity-30 transition-all hover:scale-110"
                    style={{ background: "linear-gradient(135deg, #6d28d9, #7c3aed)" }}>
                    <Send className="w-3 h-3 text-white" />
                  </button>
                </div>

                <button onClick={goNext} disabled={current === total - 1}
                  className="quiz-btn flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium disabled:opacity-30"
                  style={{ border: "1px solid #2e2e2e", color: "#9ca3af", background: "#1e1e1e" }}>
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}