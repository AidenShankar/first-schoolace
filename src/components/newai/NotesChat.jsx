import React, { useState, useRef, useEffect } from "react";
import { Send, Mic, Paperclip, Maximize2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";

export default function NotesChat({ notesData, onQuiz, quizLoading }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setShowChat(true);
    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const notesContext = JSON.stringify({ title: notesData.title, overview: notesData.overview, sections: notesData.sections });
      const reply = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a helpful AI study assistant named Ace. The student has these study notes:\n\n${notesContext}\n\nConversation:\n${newMessages.map(m => `${m.role === "user" ? "Student" : "Ace"}: ${m.content}`).join("\n")}\n\nAnswer the student's latest question helpfully and concisely.`,
      });
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I had trouble responding. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-80 xl:w-96 flex flex-col shrink-0 border-l"
      style={{ background: "#111111", borderColor: "#2a2a2a" }}>

      {/* Expand button */}
      <div className="flex justify-between items-center px-4 pt-3 pb-1">
        <button className="p-1.5 rounded text-gray-600 hover:text-gray-400">
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
        <button className="text-xs px-2 py-1 rounded text-gray-400 hover:text-gray-200 border border-gray-700">
          Hide →
        </button>
      </div>

      {/* Quiz & Flashcard buttons */}
      <div className="grid grid-cols-2 gap-2 px-3 pt-2 pb-3">
        <button onClick={onQuiz} disabled={quizLoading}
          className="rounded-xl p-3 text-left border transition-colors hover:border-purple-500 disabled:opacity-50"
          style={{ background: "#1a1a1a", borderColor: "#2e2e2e" }}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-orange-400 text-sm">?</span>
            <span className="text-sm font-semibold" style={{ color: "#e8e8e8" }}>Quizzes</span>
            <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full font-semibold"
              style={{ background: "#166534", color: "#4ade80" }}>Popular</span>
          </div>
          <p className="text-xs" style={{ color: "#6b6b6b" }}>{quizLoading ? "Generating..." : "Test your knowledge"}</p>
        </button>
        <button className="rounded-xl p-3 text-left border transition-colors hover:border-purple-500"
          style={{ background: "#1a1a1a", borderColor: "#2e2e2e" }}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sky-400 text-sm">≡</span>
            <span className="text-sm font-semibold" style={{ color: "#e8e8e8" }}>Flashcards</span>
          </div>
          <p className="text-xs" style={{ color: "#6b6b6b" }}>Study with active recall</p>
        </button>
      </div>

      {/* Chat area */}
      {!showChat ? (
        <div className="flex-1 flex flex-col items-center justify-center px-5 text-center">
          <h2 className="text-3xl font-bold mb-2" style={{ color: "#f3f4f6" }}>Hey, I'm Ace</h2>
          <p className="text-sm" style={{ color: "#6b6b6b" }}>I can work with you on your doc and answer any questions!</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm`}
                style={msg.role === "user"
                  ? { background: "#7c3aed", color: "#fff" }
                  : { background: "#2a2a2a", color: "#d1d5db" }}>
                {msg.role === "assistant"
                  ? <ReactMarkdown className="prose prose-invert prose-sm max-w-none">{msg.content}</ReactMarkdown>
                  : msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl px-4 py-3" style={{ background: "#2a2a2a" }}>
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{ background: "#6b6b6b", animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Input */}
      <div className="px-3 pb-4 pt-2">
        <div className="rounded-xl px-3 py-2.5 flex items-center gap-2 border"
          style={{ background: "#1e1e1e", borderColor: "#3a3a3a" }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Type a question here or type '@' to reference documents..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "#d1d5db" }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 px-1">
          <button className="p-1 rounded text-gray-600 hover:text-gray-400"><Mic className="w-4 h-4" /></button>
          <div className="flex items-center gap-2">
            <button className="p-1 rounded text-gray-600 hover:text-gray-400"><Paperclip className="w-4 h-4" /></button>
            <button onClick={sendMessage} disabled={!input.trim() || loading}
              className="w-7 h-7 rounded-lg flex items-center justify-center disabled:opacity-30 transition-colors"
              style={{ background: "#7c3aed" }}>
              <Send className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}