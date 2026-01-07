
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, CornerDownLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { getAgentSystemPrompt } from './systemPrompt';
import { InvokeLLM } from '@/integrations/Core';
import ReactMarkdown from 'react-markdown';

export default function AIAgent({ user, currentClass, onAction }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [conversation, setConversation] = useState([]);
    const [input, setInput] = useState('');
    const conversationEndRef = useRef(null);

    useEffect(() => {
        if (isOpen && conversation.length === 0) {
            setConversation([
                { role: 'assistant', content: "I am GradeAI's Personal Agent. How can I assist you today? You can ask me to create assignments, make quizzes, and more." }
            ]);
        }
    }, [isOpen]);

    useEffect(() => {
        conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input };
        setConversation(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const systemPrompt = getAgentSystemPrompt(user, currentClass);
        const messagesForApi = [
            { role: 'system', content: systemPrompt },
            ...conversation.slice(-6).map(msg => ({ // Send last 6 messages for context
                role: msg.role === 'assistant' ? 'assistant' : 'user',
                content: msg.content
            })),
            userMessage
        ];

        try {
            const response = await InvokeLLM({
                prompt: JSON.stringify(messagesForApi), // Pass messages as a stringified JSON
                response_json_schema: {
                    type: "object",
                    properties: {
                        type: { type: "string", enum: ["clarification", "action", "answer"] },
                        thought: { type: "string" },
                        content: { type: "string" },
                        action: {
                            type: "object",
                            properties: {
                                name: { type: "string" },
                                params: { type: "object", additionalProperties: true }
                            }
                        }
                    },
                    required: ["type", "content"]
                }
            });

            if (response) {
                const assistantMessage = { role: 'assistant', content: response.content };
                setConversation(prev => [...prev, assistantMessage]);

                if (response.type === 'action' && response.action) {
                    onAction(response.action.name, response.action.params);
                    // maybe close the agent after an action
                    setTimeout(() => setIsOpen(false), 2000); 
                }
            }
        } catch (error) {
            console.error("AI Agent Error:", error);
            const errorMessage = { role: 'assistant', content: "I seem to be having trouble connecting. Please try again in a moment." };
            setConversation(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <motion.div
                className="fixed bottom-6 right-6 z-50"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}
            >
                <Button
                    onClick={() => setIsOpen(true)}
                    className="rounded-full w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-2xl hover:scale-110 transition-transform duration-300"
                >
                    <Sparkles className="w-8 h-8" />
                </Button>
            </motion.div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed inset-0 md:inset-auto md:bottom-28 md:right-6 z-50 w-full md:w-[440px] h-full md:h-[70vh] bg-slate-800/50 backdrop-blur-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-700"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <Sparkles className="w-6 h-6 text-purple-400" />
                                <h2 className="text-lg font-bold text-white">AI Agent</h2>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Conversation */}
                        <div className="flex-grow p-4 overflow-y-auto space-y-6">
                            {conversation.map((msg, index) => (
                                <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                                        <ReactMarkdown className="prose prose-invert prose-sm max-w-none">
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="p-3 bg-slate-700 rounded-2xl rounded-bl-none">
                                        <motion.div
                                            className="flex items-center gap-2 text-slate-400"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.2 }}
                                        >
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
                        <div className="p-4 border-t border-slate-700">
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
                                    placeholder="Ask me anything..."
                                    className="bg-slate-700 border-slate-600 text-white rounded-lg pr-20 resize-none"
                                    rows={1}
                                />
                                <Button
                                    onClick={handleSend}
                                    disabled={isLoading}
                                    size="icon"
                                    className="absolute right-2 bottom-2 bg-indigo-600 hover:bg-indigo-500"
                                >
                                    {isLoading ? <CornerDownLeft className="w-5 h-5 animate-ping" /> : <Send className="w-5 h-5" />}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
