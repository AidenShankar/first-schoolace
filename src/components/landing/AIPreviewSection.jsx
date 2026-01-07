import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { 
  Sparkles, Globe, Zap, MessageSquare, History, Bell, BarChart2, BookOpen,
  Send, User, Check, RefreshCw
} from 'lucide-react';
import { Button } from "@/components/ui/button";

const CuteAvatar = ({ size = "lg" }) => (
  <div className={`relative ${size === "lg" ? "w-24 h-24" : "w-10 h-10"} rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg flex items-center justify-center flex-shrink-0`}>
    <div className={`absolute top-[30%] left-[25%] ${size === "lg" ? "w-3 h-3" : "w-1 h-1"} bg-white rounded-full opacity-90`}></div>
    <div className={`absolute top-[30%] right-[25%] ${size === "lg" ? "w-3 h-3" : "w-1 h-1"} bg-white rounded-full opacity-90`}></div>
    <div className={`absolute top-[55%] ${size === "lg" ? "w-4 h-2 border-b-2" : "w-2 h-1 border-b"} border-white rounded-full opacity-80`}></div>
    
    {/* Shine effect */}
    <div className={`absolute top-[15%] left-[20%] ${size === "lg" ? "w-8 h-8" : "w-3 h-3"} bg-white rounded-full opacity-30 blur-sm`}></div>
  </div>
);

const SidebarIcon = ({ icon: Icon, active = false }) => (
  <div className={`p-3 rounded-xl transition-colors ${active ? 'bg-white/10 text-white' : 'text-slate-400'}`}>
    <Icon className="w-5 h-5" />
  </div>
);

const ThinkingStep = ({ text, isActive, isCompleted }) => (
  <motion.div 
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    className={`flex items-center gap-3 text-sm ${isActive ? 'text-indigo-300' : isCompleted ? 'text-slate-500' : 'text-slate-600'}`}
  >
    <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-indigo-400 animate-pulse' : isCompleted ? 'bg-slate-600' : 'bg-slate-700'}`}></div>
    <span>{text}</span>
    {isCompleted && <Check className="w-3 h-3 ml-auto opacity-50" />}
  </motion.div>
);

const ThinkingProcess = ({ steps, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (currentStep < steps.length) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 1500); // Duration per step
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentStep, steps.length, onComplete]);

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 max-w-sm backdrop-blur-sm mb-4">
      <div className="flex items-center gap-2 mb-3 text-slate-400 text-xs font-medium uppercase tracking-wider">
        <Sparkles className="w-3 h-3" />
        Thinking...
      </div>
      <div className="space-y-2.5 pl-1">
        {steps.map((step, idx) => (
          (idx <= currentStep) && (
            <ThinkingStep 
              key={idx} 
              text={step} 
              isActive={idx === currentStep && currentStep < steps.length}
              isCompleted={idx < currentStep}
            />
          )
        ))}
      </div>
    </div>
  );
};

const ChatMessage = ({ role, content, image }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={`flex gap-4 mb-6 ${role === 'user' ? 'flex-row-reverse' : ''}`}
  >
    <div className="flex-shrink-0">
      {role === 'ai' ? (
        <CuteAvatar size="sm" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center">
          <User className="w-5 h-5 text-slate-300" />
        </div>
      )}
    </div>
    
    <div className={`flex flex-col gap-2 max-w-[85%] ${role === 'user' ? 'items-end' : 'items-start'}`}>
      <div className={`p-4 rounded-2xl backdrop-blur-sm ${
        role === 'user' 
          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-sm shadow-lg shadow-purple-900/20' 
          : 'bg-slate-800/80 border border-slate-700/50 text-slate-200 rounded-tl-sm shadow-lg'
      }`}>
        <p className="text-sm leading-relaxed">{content}</p>
      </div>
      
      {image && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl overflow-hidden border border-slate-700/50 shadow-lg max-w-sm relative group mt-2"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
          <img src={image} alt="Content" className="w-full h-auto object-cover" />
          <div className="absolute bottom-3 left-3 right-3">
            <p className="text-white text-xs font-medium bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg inline-block">Biology Assignment Reference</p>
          </div>
        </motion.div>
      )}
    </div>
  </motion.div>
);

export default function AIPreviewSection() {
  const [sequenceState, setSequenceState] = useState(0);
  const [cycle, setCycle] = useState(0);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { amount: 0.6 }); 

  // 0: Teacher Start
  // 1: Teacher Thinking
  // 2: Teacher Response
  // 3: Transition (Loops back to 0)
  // 4: Student Start
  // 5: Student Thinking
  // 6: Student Response
  // 7: Transition (Loops back to 4)

  useEffect(() => {
    if (!isInView) {
      setSequenceState(0);
      return;
    }

    let timer;
    
    const runSequence = () => {
      switch (sequenceState) {
        case 0: // Teacher msg appears
          timer = setTimeout(() => setSequenceState(1), 3000);
          break;
        case 1: // Teacher thinking (handled by ThinkingProcess onComplete)
          break;
        case 2: // Teacher response
          timer = setTimeout(() => setSequenceState(3), 2000); // Read time
          break;
        case 3: // Transition out -> Loop Teacher
          timer = setTimeout(() => {
            setCycle(c => c + 1);
            setSequenceState(0);
          }, 500);
          break;
        case 4: // Student msg appears
          timer = setTimeout(() => setSequenceState(5), 3000);
          break;
        case 5: // Student thinking (handled by ThinkingProcess onComplete)
          break;
        case 6: // Student response
          timer = setTimeout(() => setSequenceState(7), 2000);
          break;
        case 7: // Transition out -> Loop Student
          timer = setTimeout(() => {
            setCycle(c => c + 1);
            setSequenceState(4);
          }, 500); // Slower transition for student as requested previously? No, user said "student to teacher transition, make a bit slower". This is internal loop.
          // Let's keep loop transition consistent.
          break;
        default:
          break;
      }
    };

    runSequence();
    return () => clearTimeout(timer);
  }, [sequenceState, isInView]);

  const toggleAgent = () => {
    setCycle(c => c + 1);
    if (sequenceState <= 3) {
      // Switch to Student
      setSequenceState(4);
    } else {
      // Switch to Teacher
      setSequenceState(0);
    }
  };

  return (
    <div ref={containerRef} className="w-full max-w-6xl mx-auto px-4 perspective-1000">
      <motion.div 
        initial={{ rotateX: 5, opacity: 0, y: 50 }}
        whileInView={{ rotateX: 0, opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-[#0F172A] rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden flex h-[650px] relative z-10 ring-1 ring-white/10"
      >
        {/* Sidebar */}
        <div className="w-16 md:w-20 bg-slate-900/50 border-r border-slate-800 flex flex-col items-center py-6 gap-4 z-20 backdrop-blur-md">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/20 mb-4">
            S
          </div>
          
          <div className="flex flex-col gap-3 w-full px-2">
            <SidebarIcon icon={Zap} active={sequenceState <= 3} />
            <SidebarIcon icon={Globe} />
            <SidebarIcon icon={BookOpen} active={sequenceState > 3} />
            <SidebarIcon icon={MessageSquare} />
            <SidebarIcon icon={History} />
          </div>
          
          <div className="mt-auto flex flex-col gap-3 w-full px-2">
            <SidebarIcon icon={Bell} />
            <SidebarIcon icon={BarChart2} />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-slate-900 flex flex-col relative overflow-hidden">
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 pointer-events-none"></div>

          {/* Header */}
          <div className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm flex items-center justify-between px-8 z-20">
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <div className="font-medium text-slate-200 text-sm tracking-wide">
                <AnimatePresence mode="wait">
                  {sequenceState <= 3 ? (
                    <motion.span 
                      key="teacher-mode"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                    >
                      Teacher Co-Pilot
                    </motion.span>
                  ) : (
                    <motion.span 
                      key="student-mode"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                    >
                      Student Learning Assistant
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-slate-500 text-xs font-mono">ONLINE</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto relative p-8 scrollbar-hide">
            <AnimatePresence mode="wait">
              {/* TEACHER SCENARIO */}
              {sequenceState <= 3 && (
                <motion.div 
                  key={`teacher-scenario-${cycle}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, filter: "blur(10px)", transition: { duration: 0.2 } }}
                  transition={{ duration: 0.2 }}
                  className="max-w-3xl mx-auto h-full flex flex-col justify-end pb-4"
                >
                  <ChatMessage 
                    role="user" 
                    content="grade the submissions for all my classes for their declaration of independence unit test. also post an announcement to all my classes letting them know their scores are released." 
                  />

                  {sequenceState >= 1 && (
                    <div className="ml-14 mb-6">
                      {sequenceState === 1 ? (
                        <ThinkingProcess 
                          steps={[
                            "Grading 'Declaration of Independence' test submissions...",
                            "Calculating final scores for all classes...",
                            "Releasing grades to student portals...",
                            "Drafting announcement...",
                            "Sending to 3 active classes..."
                          ]}
                          onComplete={() => setSequenceState(2)}
                        />
                      ) : (
                        <motion.div 
                          initial={{ opacity: 0 }} 
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-2 text-xs text-slate-500 mb-4 bg-slate-800/30 w-fit px-3 py-1.5 rounded-full"
                        >
                          <Check className="w-3 h-3" />
                          <span>Actions executed successfully</span>
                        </motion.div>
                      )}
                    </div>
                  )}

                  {sequenceState >= 2 && (
                    <ChatMessage 
                      role="ai" 
                      content="Done! I've released the grades for the 'Declaration of Independence' test and notified all students in your History 101, 102, and 103 classes."
                    />
                  )}
                </motion.div>
              )}

              {/* STUDENT SCENARIO */}
              {sequenceState >= 4 && (
                <motion.div 
                  key={`student-scenario-${cycle}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, filter: "blur(10px)", transition: { duration: 1.5 } }}
                  transition={{ duration: 0.2 }}
                  className="max-w-3xl mx-auto h-full flex flex-col justify-end pb-4"
                >
                  <ChatMessage 
                    role="user" 
                    content="why did I get a 79% on my biology assignment from last week" 
                  />

                  {sequenceState >= 5 && (
                    <div className="ml-14 mb-6">
                      {sequenceState === 5 ? (
                        <ThinkingProcess 
                          steps={[
                            "Accessing biology assignment submission...",
                            "Analyzing Section 3 (Atomic Structure)...",
                            "Comparing against rubric...",
                            "Generating personalized feedback..."
                          ]}
                          onComplete={() => setSequenceState(6)}
                        />
                      ) : (
                        // Collapsed thinking state after completion
                        <motion.div 
                          initial={{ opacity: 0 }} 
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-2 text-xs text-slate-500 mb-4 bg-slate-800/30 w-fit px-3 py-1.5 rounded-full"
                        >
                          <Check className="w-3 h-3" />
                          <span>Analyzed submission & rubric</span>
                        </motion.div>
                      )}
                    </div>
                  )}

                  {sequenceState >= 6 && (
                    <ChatMessage 
                      role="ai" 
                      content="Looking at your submission, I see you did great on the cell biology part, but struggled a bit with Section 3 on atomic bonding. Specifically, the covalent bond diagrams needed more detail. Would you like to review that concept?"
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input Area (Visual only) */}
          <div className="p-6 bg-slate-900/50 border-t border-slate-800 z-20">
            <div className="max-w-4xl mx-auto relative">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 pr-12 shadow-lg text-slate-500 font-light flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span className="animate-pulse">
                  {sequenceState % 4 === 0 ? "Type your request here..." : 
                   sequenceState % 4 === 1 ? "Processing..." : 
                   sequenceState % 4 === 2 ? "Waiting for input..." : "Type your request here..."}
                </span>
              </div>
              <div className="absolute right-3 top-3 p-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg shadow-indigo-500/20">
                <Send className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Decorative background glow behind the card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[105%] h-[95%] bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 blur-[80px] -z-10 rounded-full pointer-events-none"></div>

      <div className="flex justify-center mt-12 relative z-20">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button 
            onClick={toggleAgent}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white border-0 rounded-full px-10 py-6 text-lg font-semibold shadow-2xl shadow-indigo-500/30 backdrop-blur-sm transition-all group"
          >
            <RefreshCw className="w-5 h-5 mr-3 group-hover:rotate-180 transition-transform duration-500" />
            {sequenceState <= 3 ? "Switch to Student Agent" : "Switch to Teacher Agent"}
          </Button>
        </motion.div>
      </div>
      </div>
      );
      }