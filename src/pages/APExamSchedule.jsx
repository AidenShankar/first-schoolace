import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, Calendar, Clock, BookOpen, ChevronRight, Send, X, MessageCircle, Bot } from 'lucide-react';
import { InvokeLLM } from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const SCHEDULE_DATA = [
  {
    week: "Week 1",
    days: [
      {
        date: "Monday, May 4, 2026",
        morning: ["Biology", "Latin"],
        afternoon: ["European History", "Microeconomics"]
      },
      {
        date: "Tuesday, May 5, 2026",
        morning: ["Chemistry", "Human Geography"],
        afternoon: ["United States Government and Politics"]
      },
      {
        date: "Wednesday, May 6, 2026",
        morning: ["English Literature and Composition"],
        afternoon: ["Comparative Government and Politics", "Physics 1: Algebra-Based"]
      },
      {
        date: "Thursday, May 7, 2026",
        morning: ["Physics 2: Algebra-Based", "World History: Modern"],
        afternoon: ["African American Studies", "Statistics"]
      },
      {
        date: "Friday, May 8, 2026",
        morning: ["Italian Language and Culture", "United States History"],
        afternoon: ["Chinese Language and Culture", "Macroeconomics"],
        note: "Art and Design: Friday, May 8, 2026 (8 p.m. ET), is the deadline for AP Art and Design students to submit their three portfolio components as final in the AP Digital Portfolio."
      }
    ]
  },
  {
    week: "Week 2",
    days: [
      {
        date: "Monday, May 11, 2026",
        morning: ["Calculus AB", "Calculus BC"],
        afternoon: ["Music Theory", "Seminar"]
      },
      {
        date: "Tuesday, May 12, 2026",
        morning: ["French Language and Culture", "Precalculus"],
        afternoon: ["Japanese Language and Culture", "Psychology"]
      },
      {
        date: "Wednesday, May 13, 2026",
        morning: ["English Language and Composition", "German Language and Culture"],
        afternoon: ["Physics C: Mechanics", "Spanish Literature and Culture"]
      },
      {
        date: "Thursday, May 14, 2026",
        morning: ["Art History", "Spanish Language and Culture"],
        afternoon: ["Computer Science Principles", "Physics C: Electricity and Magnetism"]
      },
      {
        date: "Friday, May 15, 2026",
        morning: ["Environmental Science"],
        afternoon: ["Computer Science A"]
      }
    ]
  }
];

const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm ACE AI. Ask me anything about the 2026 AP Exam Schedule! For example, 'When is the Calc BC exam?' or 'What exams are on May 7th?'" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const scheduleContext = JSON.stringify(SCHEDULE_DATA);
      const systemPrompt = `You are an AI assistant for the 2026 AP Exam Schedule. 
      Here is the schedule data: ${scheduleContext}. 
      Answer the user's questions about dates, times (Morning is 8 a.m., Afternoon is 12 p.m.), and specific exams. 
      Be helpful, concise, and friendly. 
      If they ask about something not in the schedule, politely say you only know about the 2026 AP Exam Schedule.`;

      const response = await InvokeLLM({
        prompt: JSON.stringify([
          { role: 'system', content: systemPrompt },
          ...messages.map(m => ({ role: m.role, content: m.content })),
          userMessage
        ])
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-4 md:right-8 w-[90vw] md:w-[400px] h-[500px] bg-white/90 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden"
            style={{ boxShadow: "0 20px 50px -12px rgba(0, 0, 0, 0.25)" }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-full">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">ACE AI Assistant</h3>
                  <p className="text-[10px] text-white/80">Powered by ACE AI</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-br-none' 
                        : 'bg-slate-100 text-slate-800 rounded-bl-none'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-slate-100 bg-white/50">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex items-center gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about exams..."
                  className="rounded-full border-slate-200 bg-white/80 focus-visible:ring-indigo-500"
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  className="rounded-full bg-indigo-600 hover:bg-indigo-700 shrink-0"
                  disabled={isLoading || !input.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger */}
      <motion.div
        className="fixed bottom-6 left-0 right-0 flex justify-center z-40 pointer-events-none"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
      >
        <div className="pointer-events-auto shadow-2xl rounded-full p-1 bg-white/80 backdrop-blur-md border border-white/40 flex items-center gap-2 pr-2 pl-4 cursor-text transition-all hover:scale-105 hover:bg-white"
             onClick={() => setIsOpen(true)}
        >
             <Bot className="w-5 h-5 text-indigo-600" />
             <span className="text-slate-500 text-sm font-medium mr-16 md:mr-32">Ask a question...</span>
             <Button size="icon" className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors">
                <ChevronRight className="w-4 h-4" />
             </Button>
        </div>
      </motion.div>
    </>
  );
};

export default function APExamSchedule() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900 pb-24">
      
      {/* Hero Section */}
      <div className="relative bg-[#0F172A] text-white overflow-hidden pb-20 pt-24">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-3xl" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-indigo-600/20 blur-3xl" />
          <div className="absolute top-[20%] left-[20%] w-[300px] h-[300px] rounded-full bg-blue-500/20 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium text-indigo-200 mb-6 backdrop-blur-sm">
                    <Sparkles className="w-3 h-3" />
                    <span>Official Schedule</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-indigo-200">
                    2026 AP Exam Schedule
                </h1>
                <p className="text-xl text-indigo-200/80 max-w-2xl mx-auto mb-8 font-light">
                    Plan your success with the official College Board schedule.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-white/40">
                    <span>Powered by</span>
                    <span className="font-bold text-white tracking-wider flex items-center gap-1">
                        <Bot className="w-4 h-4" /> ACE AI
                    </span>
                </div>
            </motion.div>
        </div>
      </div>

      {/* Schedule Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
        
        {SCHEDULE_DATA.map((week, weekIdx) => (
          <motion.div 
            key={week.week}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: weekIdx * 0.2 }}
            className="mb-12"
          >
            <div className="flex items-center gap-4 mb-6">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-indigo-200 to-transparent" />
                <h2 className="text-2xl font-bold text-slate-800 bg-white px-6 py-2 rounded-full shadow-sm border border-slate-100">
                    {week.week}
                </h2>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-indigo-200 to-transparent" />
            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-slate-200/60 overflow-hidden backdrop-blur-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 bg-slate-50/50 border-b border-slate-100">
                <div className="p-4 md:p-6 font-semibold text-slate-500 text-sm uppercase tracking-wider">Date</div>
                <div className="p-4 md:p-6 font-semibold text-indigo-600 text-sm uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Morning (8 a.m.)
                </div>
                <div className="p-4 md:p-6 font-semibold text-purple-600 text-sm uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Afternoon (12 p.m.)
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {week.days.map((day, dayIdx) => (
                  <div key={day.date} className="group hover:bg-slate-50/50 transition-colors duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-3">
                        {/* Date Column */}
                        <div className="p-6 md:border-r border-slate-50 flex flex-col justify-center">
                            <span className="font-bold text-slate-800 text-lg group-hover:text-indigo-700 transition-colors">
                                {day.date.split(',')[0]}
                            </span>
                            <span className="text-slate-500 text-sm">
                                {day.date.split(',').slice(1).join(',')}
                            </span>
                        </div>

                        {/* Morning Column */}
                        <div className="p-6 md:border-r border-slate-50">
                            <ul className="space-y-2">
                                {day.morning.map(exam => (
                                    <li key={exam} className="flex items-start gap-2">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                                        <span className="text-slate-700 font-medium">{exam}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Afternoon Column */}
                        <div className="p-6">
                            <ul className="space-y-2">
                                {day.afternoon.map(exam => (
                                    <li key={exam} className="flex items-start gap-2">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                                        <span className="text-slate-700 font-medium">{exam}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    {/* Notes Row */}
                    {day.note && (
                        <div className="bg-amber-50/50 px-6 py-3 border-t border-amber-100/50 text-amber-800 text-sm flex gap-3 items-start">
                             <div className="mt-0.5 p-1 bg-amber-100 rounded-full shrink-0">
                                <BookOpen className="w-3 h-3 text-amber-600" />
                             </div>
                             {day.note}
                        </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}

      </div>

      <AIChatWidget />
    </div>
  );
}