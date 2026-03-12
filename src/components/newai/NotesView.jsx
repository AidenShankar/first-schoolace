import React, { useState, useRef } from "react";
import NotesSidebar from "./NotesSidebar";
import NotesContent from "./NotesContent";
import NotesChat from "./NotesChat";
import QuizView from "./QuizView";
import { base44 } from "@/api/base44Client";

export default function NotesView({ notesData, onReset }) {
  const editorRef = useRef(null);
  const [quizQuestions, setQuizQuestions] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  const exec = (cmd, value = null) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, value);
  };

  const handleGenerateQuiz = async () => {
    if (quizLoading) return;
    setQuizLoading(true);
    try {
      const notesText = editorRef.current?.innerText || JSON.stringify(notesData);
      const raw = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a quiz generator. Based on these study notes, generate exactly 20 multiple-choice questions.

Notes:
${notesText}

Return ONLY a valid JSON array (no markdown) like:
[
  {
    "question": "Question text here?",
    "topic": "Short topic label",
    "options": [
      {"letter": "A", "text": "Option A"},
      {"letter": "B", "text": "Option B"},
      {"letter": "C", "text": "Option C"},
      {"letter": "D", "text": "Option D"}
    ],
    "correct": "B"
  }
]

Make questions challenging and diverse, covering all major topics in the notes.`,
      });

      let questions;
      if (typeof raw === "string") {
        const match = raw.match(/\[[\s\S]*\]/);
        questions = JSON.parse(match ? match[0] : raw);
      } else if (Array.isArray(raw)) {
        questions = raw;
      } else {
        questions = raw.questions || raw;
      }

      setQuizQuestions(questions);
      setShowQuiz(true);
    } catch (e) {
      console.error(e);
      alert("Failed to generate quiz. Please try again.");
    } finally {
      setQuizLoading(false);
    }
  };

  if (showQuiz && quizQuestions) {
    return <QuizView questions={quizQuestions} notesData={notesData} onBack={() => setShowQuiz(false)} />;
  }

  return (
    <div className="h-screen flex overflow-hidden" style={{ background: "#1a1a1a", color: "#e8e8e8" }}>
      <NotesSidebar onReset={onReset} fileName={notesData?.fileName} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b shrink-0"
          style={{ borderColor: "#2e2e2e", background: "#1a1a1a" }}>
          <span className="text-xs text-gray-400 truncate max-w-xs">{notesData?.fileName}</span>
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded text-gray-400 hover:text-gray-200">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
              style={{ background: "#7c3aed" }}>
              Share
            </button>
          </div>
        </div>

        {/* Formatting toolbar */}
        <div className="flex items-center gap-1 px-4 py-1.5 border-b shrink-0 flex-wrap"
          style={{ borderColor: "#2e2e2e", background: "#161616" }}>
          {/* Font selector (display only) */}
          <div className="flex items-center gap-1 px-2 py-1 rounded text-xs text-gray-300 border border-gray-700 cursor-pointer hover:border-gray-500 mr-1">
            <span>Clar...</span>
            <svg className="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
          <div className="h-5 w-px mx-1" style={{ background: "#3a3a3a" }} />
          {/* Font size */}
          <button onMouseDown={e => { e.preventDefault(); exec("fontSize", "3"); }} className="p-1 text-gray-400 hover:text-gray-200 text-sm">−</button>
          <span className="px-2 py-0.5 text-xs text-gray-300 border border-gray-700 rounded">24</span>
          <button onMouseDown={e => { e.preventDefault(); exec("fontSize", "5"); }} className="p-1 text-gray-400 hover:text-gray-200 text-sm">+</button>
          <div className="h-5 w-px mx-1" style={{ background: "#3a3a3a" }} />
          {/* Bold */}
          <button onMouseDown={e => { e.preventDefault(); exec("bold"); }} className="w-7 h-7 flex items-center justify-center rounded text-xs text-gray-300 hover:bg-gray-700 font-bold">B</button>
          {/* Italic */}
          <button onMouseDown={e => { e.preventDefault(); exec("italic"); }} className="w-7 h-7 flex items-center justify-center rounded text-xs text-gray-300 hover:bg-gray-700 italic">I</button>
          {/* Underline */}
          <button onMouseDown={e => { e.preventDefault(); exec("underline"); }} className="w-7 h-7 flex items-center justify-center rounded text-xs text-gray-300 hover:bg-gray-700 underline">U</button>
          {/* Text color */}
          <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-700 text-gray-300 text-xs font-bold relative">
            A
            <span className="absolute bottom-1 left-1.5 right-1.5 h-0.5 rounded" style={{ background: "#ef4444" }} />
          </button>
          {/* Highlight */}
          <button onMouseDown={e => { e.preventDefault(); exec("hiliteColor", "#fef08a"); }} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-700 text-gray-300">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          </button>
          <div className="h-5 w-px mx-1" style={{ background: "#3a3a3a" }} />
          <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-700 text-gray-300 text-sm">Σ</button>
          <div className="h-5 w-px mx-1" style={{ background: "#3a3a3a" }} />
          {/* Align */}
          <button onMouseDown={e => { e.preventDefault(); exec("justifyLeft"); }} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-700 text-gray-300">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg>
          </button>
          <button onMouseDown={e => { e.preventDefault(); exec("insertUnorderedList"); }} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-700 text-gray-300">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          </button>
          <div className="flex-1" />
          <button onClick={handleGenerateQuiz} disabled={quizLoading}
            className="px-3 py-1 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
            style={{ background: "#7c3aed" }}>
            {quizLoading ? "Generating..." : "Upgrade to Premium"}
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <NotesContent notesData={notesData} editorRef={editorRef} />
          <NotesChat notesData={notesData} onQuiz={handleGenerateQuiz} quizLoading={quizLoading} />
        </div>
      </div>
    </div>
  );
}