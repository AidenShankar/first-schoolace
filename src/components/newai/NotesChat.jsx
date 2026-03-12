import React, { useState, useRef, useEffect } from "react";
import { Send, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";

export default function NotesChat({ notesData, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const notesContext = JSON.stringify({ title: notesData.title, overview: notesData.overview, sections: notesData.sections });
      const reply = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a helpful AI study assistant. The student has the following study notes:

${notesContext}

Conversation so far:
${newMessages.map(m => `${m.role === "user" ? "Student" : "AI"}: ${m.content}`).join("\n")}

Answer the student's latest question helpfully and concisely. Reference the notes when relevant.`,
      });
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I had trouble responding. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-80 xl:w-96 border-l border-gray-100 flex flex-col bg-white shrink-0">
      {/* Header */}
      <div className="px-5 pt-6 pb-3 border-b border-gray-100 flex items-center justify-between">
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 ml-auto">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Greeting or messages */}
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-5 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Hey, I'm Ace</h2>
          <p className="text-sm text-gray-500">I can work with you on your doc and answer any questions!</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                msg.role === "user"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}>
                {msg.role === "assistant"
                  ? <ReactMarkdown className="prose prose-sm max-w-none">{msg.content}</ReactMarkdown>
                  : msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus-within:border-purple-400 transition-colors">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Type a question here..."
            className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400"
          />
          <button onClick={sendMessage} disabled={!input.trim() || loading}
            className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center disabled:opacity-40 hover:bg-purple-700 transition-colors">
            <Send className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}