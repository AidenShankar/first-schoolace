import React, { useState, useRef, useEffect } from "react";
import { Send, Mic, Paperclip, Maximize2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";

const INITIAL_MESSAGE = {
  role: "assistant",
  content: `Hi there! 👋 I'm here to help you with anything about this note—or any other question you have.\n\n- Need a quick summary of the content?\n- Want to generate flashcards or a quiz?\n- Looking for help with a different topic altogether?\n\nWhat would you like to dive into first?`,
};

function AiMessage({ content, animate }) {
  return (
    <div className={`transition-all duration-500 ${animate ? "opacity-0 translate-y-2 animate-fade-in" : ""}`}
      style={{ animation: animate ? "fadeSlideIn 0.4s ease forwards" : "none" }}>
      {/* Turbo AI badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white"
          style={{ background: "linear-gradient(135deg, #6d28d9, #7c3aed)" }}>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l14 9-14 9V3z" />
          </svg>
          Ace AI
        </span>
      </div>
      <div className="text-sm leading-relaxed" style={{ color: "#e8e8e8" }}>
        <ReactMarkdown
          components={{
            p: ({ children }) => <p className="mb-3">{children}</p>,
            ul: ({ children }) => <ul className="space-y-1 mb-3">{children}</ul>,
            li: ({ children }) => (
              <li className="flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#6b6b6b" }} />
                <span>{children}</span>
              </li>
            ),
            strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
          }}
        >{content}</ReactMarkdown>
      </div>
    </div>
  );
}

function UserMessage({ content }) {
  return (
    <div className="flex justify-end mb-6" style={{ animation: "fadeSlideIn 0.3s ease forwards" }}>
      <span className="px-3 py-2 rounded-xl text-sm font-medium"
        style={{ background: "#2a2a2a", color: "#d1d5db", border: "1px solid #3a3a3a" }}>
        {content}
      </span>
    </div>
  );
}

function ThinkingIndicator() {
  return (
    <div style={{ animation: "fadeSlideIn 0.3s ease forwards" }}>
      <div className="flex items-center gap-2 mb-3">
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white"
          style={{ background: "linear-gradient(135deg, #6d28d9, #7c3aed)" }}>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l14 9-14 9V3z" />
          </svg>
          Ace AI
        </span>
      </div>
      <div className="flex items-center gap-2 text-sm" style={{ color: "#9ca3af" }}>
        <div className="w-2 h-2 rounded-full" style={{ background: "#7c3aed", animation: "pulse 1.5s ease-in-out infinite" }} />
        Thinking...
      </div>
    </div>
  );
}

export default function NotesChat({ notesData, onQuiz, quizLoading }) {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [newMsgIndex, setNewMsgIndex] = useState(-1);
  const bottomRef = useRef();
  const inputRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const userMsg = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const notesContext = JSON.stringify({ title: notesData?.title, overview: notesData?.overview, sections: notesData?.sections });
      const history = [...messages, userMsg];
      const reply = await base44.integrations.Core.InvokeLLM({
        prompt: `You are Ace AI, a helpful study assistant. The student has these study notes:\n\n${notesContext}\n\nConversation:\n${history.map(m => `${m.role === "user" ? "Student" : "Ace"}: ${m.content}`).join("\n")}\n\nRespond helpfully and concisely. Use bullet points when listing things.`,
      });
      const assistantMsg = { role: "assistant", content: typeof reply === "string" ? reply : reply.content || "" };
      setMessages(prev => {
        setNewMsgIndex(prev.length);
        return [...prev, assistantMsg];
      });
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I had trouble responding. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
      `}</style>

      <div className="flex flex-col shrink-0 border-l" style={{ width: "380px", minWidth: "380px" }}
        style={{ background: "#141414", borderColor: "#2a2a2a" }}>

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2 shrink-0">
          <button className="p-1.5 rounded-lg text-gray-600 hover:text-gray-400 border"
            style={{ borderColor: "#2a2a2a", background: "#1e1e1e" }}>
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg text-gray-300 border"
            style={{ borderColor: "#2a2a2a", background: "#1e1e1e" }}>
            Hide →
          </button>
        </div>

        {/* Quiz & Flashcard buttons */}
        <div className="grid grid-cols-2 gap-2 px-3 pb-3">
          <button onClick={onQuiz} disabled={quizLoading}
            className="rounded-xl p-3 text-left border transition-all hover:border-purple-600 disabled:opacity-50"
            style={{ background: "#1a1a1a", borderColor: "#2e2e2e" }}>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-orange-400">?</span>
              <span className="text-xs font-semibold" style={{ color: "#e8e8e8" }}>Quizzes</span>
              <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full font-semibold"
                style={{ background: "#14532d50", color: "#4ade80", border: "1px solid #166534" }}>Popular</span>
            </div>
            <p className="text-xs" style={{ color: "#6b6b6b" }}>{quizLoading ? "Generating..." : "Test your knowledge"}</p>
          </button>
          <button className="rounded-xl p-3 text-left border transition-all hover:border-sky-600"
            style={{ background: "#1a1a1a", borderColor: "#2e2e2e" }}>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-sky-400 text-xs">≡</span>
              <span className="text-xs font-semibold" style={{ color: "#e8e8e8" }}>Flashcards</span>
            </div>
            <p className="text-xs" style={{ color: "#6b6b6b" }}>Study with active recall</p>
          </button>
        </div>

        {/* Divider */}
        <div className="mx-3 mb-2" style={{ height: "1px", background: "#2a2a2a" }} />

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-6">
          {messages.map((msg, i) =>
            msg.role === "user"
              ? <UserMessage key={i} content={msg.content} />
              : <AiMessage key={i} content={msg.content} animate={i === newMsgIndex} />
          )}
          {loading && <ThinkingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="px-3 pb-4 pt-2 shrink-0">
          <div className="rounded-2xl border overflow-hidden"
            style={{ background: "#1e1e1e", borderColor: "#3a3a3a" }}>
            <div className="px-4 py-3">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder="Type a question here or type '@' to reference documents..."
                className="w-full bg-transparent text-sm outline-none"
                style={{ color: "#d1d5db" }}
              />
            </div>
            <div className="flex items-center justify-between px-3 pb-3 pt-1">
              <button className="p-1.5 rounded-lg text-gray-600 hover:text-gray-400 transition-colors">
                <Mic className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2">
                <button className="p-1.5 rounded-lg text-gray-600 hover:text-gray-400 transition-colors">
                  <Paperclip className="w-4 h-4" />
                </button>
                <button onClick={sendMessage} disabled={!input.trim() || loading}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
                  style={{ background: input.trim() ? "#7c3aed" : "#2a2a2a" }}>
                  <Send className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}