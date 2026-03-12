import React, { useState } from "react";
import NotesSidebar from "./NotesSidebar";
import { base44 } from "@/api/base44Client";
import { ChevronLeft, ChevronRight, Settings, Zap, Send, Lightbulb, CheckCircle2, XCircle } from "lucide-react";

export default function QuizView({ questions, notesData, onBack }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState({});
  const [showExplanation, setShowExplanation] = useState({});
  const [explanation, setExplanation] = useState({});
  const [explanationLoading, setExplanationLoading] = useState(false);
  const [askInput, setAskInput] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const q = questions[current];
  const total = questions.length;
  const progressPct = ((current + 1) / total) * 100;
  const answered = selected[current];
  const isCorrect = answered === q?.correct;
  const showingExplanation = showExplanation[current];

  const handleSelect = (letter) => {
    if (selected[current] !== undefined) return;
    setSelected(prev => ({ ...prev, [current]: letter }));
    setAiAnswer("");
  };

  const handleShowExplanation = async () => {
    if (showingExplanation) {
      setShowExplanation(prev => ({ ...prev, [current]: false }));
      return;
    }
    setShowExplanation(prev => ({ ...prev, [current]: true }));
    if (explanation[current]) return;
    setExplanationLoading(true);
    try {
      const h = await base44.integrations.Core.InvokeLLM({
        prompt: `Give a clear 2-3 sentence explanation for why the correct answer to this quiz question is "${q.correct}". Question: "${q.question}". Correct answer: ${q.options.find(o => o.letter === q.correct)?.text}. Just the explanation, no preamble.`,
      });
      setExplanation(prev => ({ ...prev, [current]: typeof h === "string" ? h : h.content || "" }));
    } catch {
      setExplanation(prev => ({ ...prev, [current]: "Think carefully about the key concepts covered in your notes." }));
    } finally {
      setExplanationLoading(false);
    }
  };

  const handleAsk = async () => {
    if (!askInput.trim() || aiLoading) return;
    const msg = askInput.trim();
    setAskInput("");
    setAiLoading(true);
    setAiAnswer("");
    try {
      const r = await base44.integrations.Core.InvokeLLM({
        prompt: `A student is taking a quiz. The question is: "${q.question}". The student asks: "${msg}". Give a helpful short response without directly revealing the answer.`,
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
      setAiAnswer("");
      setAskInput("");
    }
  };
  const goPrev = () => {
    if (current > 0) {
      setCurrent(c => c - 1);
      setAiAnswer("");
      setAskInput("");
    }
  };

  const getOptionStyle = (letter) => {
    if (!answered) return {
      bg: "#1c1c1e", border: "#2e2e2e", color: "#d1d5db",
      letterBg: "#2a2a2a", letterColor: "#9ca3af", icon: null
    };
    if (letter === q.correct) return {
      bg: "#0a2e1a", border: "#16a34a", color: "#4ade80",
      letterBg: "#16a34a", letterColor: "#fff", icon: "correct"
    };
    if (letter === answered) return {
      bg: "#2a0a0a", border: "#dc2626", color: "#f87171",
      letterBg: "#dc2626", letterColor: "#fff", icon: "wrong"
    };
    return {
      bg: "#161618", border: "#222", color: "#4b5563",
      letterBg: "#222", letterColor: "#4b5563", icon: null
    };
  };

  return (
    <>
      <style>{`
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-8px); max-height: 0; }
          to { opacity: 1; transform: translateY(0); max-height: 300px; }
        }
        @keyframes optionPop {
          0% { transform: scale(1); }
          40% { transform: scale(0.97); }
          100% { transform: scale(1); }
        }
        @keyframes correctPulse {
          0% { box-shadow: 0 0 0 0 rgba(22,163,74,0.4); }
          70% { box-shadow: 0 0 0 8px rgba(22,163,74,0); }
          100% { box-shadow: 0 0 0 0 rgba(22,163,74,0); }
        }
        @keyframes wrongShake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        .option-btn { transition: background 0.25s, border-color 0.25s, color 0.25s, transform 0.1s, box-shadow 0.15s; }
        .option-btn:not(:disabled):hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(0,0,0,0.4); }
        .option-btn:not(:disabled):active { transform: scale(0.98); }
        .option-correct { animation: optionPop 0.3s ease, correctPulse 0.6s ease 0.15s; }
        .option-wrong { animation: optionPop 0.3s ease, wrongShake 0.4s ease 0.1s; }
        .explanation-box { animation: fadeSlideDown 0.35s ease forwards; overflow: hidden; }
        .nav-btn { transition: all 0.12s ease; }
        .nav-btn:not(:disabled):hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.35); }
        .nav-btn:not(:disabled):active { transform: scale(0.95); }
        .explain-btn { transition: all 0.15s ease; }
        .explain-btn:hover { background: rgba(245,158,11,0.08) !important; box-shadow: 0 0 0 1px rgba(245,158,11,0.5); }
        .explain-btn:active { transform: scale(0.98); }
      `}</style>

      <div className="h-screen flex overflow-hidden" style={{ background: "#111111", color: "#e8e8e8" }}>
        <NotesSidebar onReset={onBack} />

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top progress bar */}
          <div className="flex items-center gap-4 px-8 py-3 shrink-0">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="#6b6b6b" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 8a6 6 0 01-12 0M12 14v6m-4 0h8" />
            </svg>
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "#2a2a2a" }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%`, background: "#4ade80" }} />
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: "#1a2e1a", color: "#4ade80", border: "1px solid #166534" }}>
              {current + 1} / {total}
            </span>
          </div>

          {/* Scrollable main content */}
          <div className="flex-1 overflow-y-auto px-8 pt-4 pb-8">
            <div className="w-full max-w-2xl mx-auto rounded-2xl px-8 py-7" style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}>

              {/* Question header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 rounded-full" style={{ background: "#7c3aed" }} />
                    <span className="font-bold text-base" style={{ color: "#e8e8e8" }}>Question {current + 1}</span>
                    <ChevronRight className="w-4 h-4" style={{ color: "#4b5563" }} />
                  </div>
                  {q.topic && (
                    <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border"
                      style={{ borderColor: "#0e7490", color: "#22d3ee", background: "rgba(14,116,144,0.1)" }}>
                      🏷 {q.topic}
                    </span>
                  )}
                </div>
                <button className="nav-btn flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg"
                  style={{ color: "#6b6b6b", border: "1px solid #2a2a2a", background: "#1e1e1e" }}>
                  <Settings className="w-3.5 h-3.5" />
                  Quiz Settings
                </button>
              </div>

              {/* Question text */}
              <p className="text-base leading-relaxed mb-6" style={{ color: "#f3f4f6" }}>{q.question}</p>

              {/* Options */}
              <div className="space-y-2.5 mb-5">
                {q.options.map((opt) => {
                  const s = getOptionStyle(opt.letter);
                  const isThisCorrect = answered && opt.letter === q.correct;
                  const isThisWrong = answered && opt.letter === answered && opt.letter !== q.correct;
                  return (
                    <button key={opt.letter} onClick={() => handleSelect(opt.letter)}
                      disabled={!!answered}
                      className={`option-btn w-full flex items-center gap-4 px-5 py-3.5 rounded-xl text-left ${isThisCorrect ? "option-correct" : isThisWrong ? "option-wrong" : ""}`}
                      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color, cursor: answered ? "default" : "pointer" }}>
                      <span className="w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold shrink-0 transition-all duration-300"
                        style={{ background: s.letterBg, color: s.letterColor }}>
                        {isThisCorrect ? <CheckCircle2 className="w-4 h-4" style={{ color: "#fff" }} /> :
                         isThisWrong ? <XCircle className="w-4 h-4" style={{ color: "#fff" }} /> :
                         opt.letter}
                      </span>
                      <span className={`text-sm leading-relaxed ${isThisCorrect ? "italic font-medium" : ""}`}>{opt.text}</span>
                    </button>
                  );
                })}
              </div>

              {/* AI Answer */}
              {aiAnswer && (
                <div className="explanation-box mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: "#1e1e2e", border: "1px solid #3730a3", color: "#a5b4fc" }}>
                  {aiLoading ? "Thinking..." : aiAnswer}
                </div>
              )}

              {/* Explanation box — shown after answering */}
              {answered && showingExplanation && (
                <div className="explanation-box mb-4 rounded-xl overflow-hidden" style={{ border: "1px solid #1d4ed8" }}>
                  <div className="px-4 py-3" style={{ background: "#0f172a" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "#1e3a5f" }}>
                        <Lightbulb className="w-3.5 h-3.5" style={{ color: "#60a5fa" }} />
                      </div>
                      <span className="text-sm font-bold" style={{ color: "#e8e8e8" }}>Hint</span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: "#cbd5e1" }}>
                      {explanationLoading ? "Loading explanation..." : explanation[current]}
                    </p>
                  </div>
                </div>
              )}

              {/* Show Explanation / Show Hint button */}
              {answered ? (
                <button onClick={handleShowExplanation}
                  className="explain-btn w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium mb-4"
                  style={{ border: "1px solid rgba(245,158,11,0.5)", color: "#f59e0b", background: "transparent" }}>
                  <Lightbulb className="w-4 h-4" />
                  {showingExplanation ? "Hide Explanation" : "Show Explanation"}
                </button>
              ) : (
                <div className="mb-4" style={{ height: "42px" }} /> 
              )}

              {/* Bottom nav */}
              <div className="flex items-center gap-2">
                <button onClick={goPrev} disabled={current === 0}
                  className="nav-btn flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-30 shrink-0"
                  style={{ border: "1px solid #2e2e2e", color: "#9ca3af", background: "#1e1e1e" }}>
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>

                <div className="flex-1 flex items-center gap-2 px-3.5 py-2.5 rounded-xl"
                  style={{ background: "#1e1e1e", border: "1px solid #2e2e2e" }}>
                  <Zap className="w-3.5 h-3.5 shrink-0" style={{ color: "#6b6b6b" }} />
                  <input value={askInput} onChange={e => setAskInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleAsk()}
                    placeholder="Ask AI for help..."
                    className="flex-1 bg-transparent text-sm outline-none"
                    style={{ color: "#9ca3af" }} />
                  <button onClick={handleAsk} disabled={!askInput.trim() || aiLoading}
                    className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 disabled:opacity-30 transition-all hover:scale-110 active:scale-95"
                    style={{ background: "linear-gradient(135deg, #6d28d9, #7c3aed)" }}>
                    <Send className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>

                <button onClick={goNext} disabled={current === total - 1}
                  className="nav-btn flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-30 shrink-0 transition-all duration-300"
                  style={{
                    border: answered ? "1px solid #7c3aed" : "1px solid #2e2e2e",
                    color: answered ? "#fff" : "#9ca3af",
                    background: answered ? "linear-gradient(135deg, #6d28d9, #7c3aed)" : "#1e1e1e"
                  }}>
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