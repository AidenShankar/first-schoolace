
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Upload, X, ChevronsUp, ChevronsDown, Bot, Eye, Zap, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import ReactMarkdown from 'react-markdown';

const FuturisticButton = ({ action, onExecute }) => {
    const getIcon = () => {
        switch (action.type) {
            case 'navigate': return <Eye className="w-4 h-4" />;
            case 'create': return <Sparkles className="w-4 h-4" />;
            case 'upload': return <Upload className="w-4 h-4" />;
            case 'view': return <FileText className="w-4 h-4" />;
            default: return <Zap className="w-4 h-4" />;
        }
    };
    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onExecute(action)}
            className="bg-purple-600/50 backdrop-blur-sm border border-purple-500/50 text-white rounded-lg px-4 py-2 flex items-center gap-2 text-sm font-medium hover:bg-purple-600/80 transition-all duration-200"
        >
            {getIcon()}
            {action.label}
        </motion.button>
    );
};

export default function AIAgentWidget({ user, conversation, onSendMessage, onExecuteAction, isMinimized, setMinimized, isLoading, isThinking, currentClass }) {
    const [input, setInput] = useState('');
    const conversationEndRef = useRef(null);
    const [isMaximized, setIsMaximized] = useState(false);

    const scrollToBottom = () => {
        conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [conversation, isMaximized]);
    
    // Add another useEffect to scroll when the widget is opened.
    useEffect(() => {
        if (!isMinimized) {
            const timer = setTimeout(() => {
                scrollToBottom();
            }, 100); // Small delay to allow animation to finish
            return () => clearTimeout(timer);
        }
    }, [isMinimized]);


    const handleSend = () => {
        if (!input.trim() || isLoading) return;
        onSendMessage(input);
        setInput('');
    };

    const placeholderText = user.app_role === 'teacher' 
      ? "Ask me anything... e.g., 'Create a 10 question quiz on WWII in my History class'"
      : "Ask me anything... e.g., 'When is my book report due?'";

    const mainClass = isMaximized
      ? "fixed inset-0 z-50 w-full h-full bg-slate-900/80 backdrop-blur-2xl flex flex-col"
      : "fixed inset-0 md:inset-auto md:bottom-6 md:right-6 z-50 w-full md:max-w-md h-full md:h-[75vh] bg-slate-900/50 backdrop-blur-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-purple-500/30";

    if (isMinimized) {
        return (
            <motion.div
                initial={{ scale: 0, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                className="fixed bottom-6 right-6 z-50"
            >
                <Button
                    onClick={() => setMinimized(false)}
                    className="rounded-full w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-2xl hover:scale-110 transition-transform duration-300"
                >
                    <Bot className="w-8 h-8" />
                </Button>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={mainClass}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-purple-500/30 flex-shrink-0 bg-slate-900/80">
                <div className="flex items-center gap-3">
                    <Bot className="w-6 h-6 text-purple-400" />
                    <h2 className="text-lg font-bold text-white">AI Personal Agent</h2>
                </div>
                <div className="flex items-center gap-1">
                     <Button variant="ghost" size="icon" onClick={() => setIsMaximized(!isMaximized)} className="text-slate-400 hover:text-white">
                        {isMaximized ? <ChevronsDown className="w-5 h-5" /> : <ChevronsUp className="w-5 h-5" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setMinimized(true)} className="text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Conversation */}
            <div className="flex-grow p-4 overflow-y-auto space-y-6">
                <AnimatePresence>
                    {conversation.map((msg, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                          <div className={`max-w-[90%] p-4 rounded-2xl backdrop-blur-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-700/80 text-slate-200 rounded-bl-none'}`}>
                              <ReactMarkdown className="prose prose-invert prose-sm max-w-none">
                                  {msg.content}
                              </ReactMarkdown>
                              {msg.actions?.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mt-4">
                                      {msg.actions.map((action, idx) => (
                                          <FuturisticButton key={idx} action={action} onExecute={onExecuteAction} />
                                      ))}
                                  </div>
                              )}
                          </div>
                      </motion.div>
                    ))}
                </AnimatePresence>
                {(isLoading || isThinking) && (
                    <div className="flex justify-start">
                        <div className="p-4 bg-slate-700/80 rounded-2xl rounded-bl-none">
                            <motion.div
                                className="flex items-center gap-2 text-slate-400"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <p className="text-xs font-mono">{isThinking ? "Accessing data..." : "Thinking..."}</p>
                                <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></span>
                                <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                                <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                            </motion.div>
                        </div>
                    </div>
                )}
                <div ref={conversationEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-purple-500/30">
                <div className="relative">
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder={placeholderText}
                        className="bg-slate-800/50 border-slate-700 text-white rounded-lg pr-20 resize-none"
                        rows={1}
                    />
                    <Button
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        size="icon"
                        className="absolute right-2 bottom-2 bg-indigo-600 hover:bg-indigo-500"
                    >
                        <Send className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}
