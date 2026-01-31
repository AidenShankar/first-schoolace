import React, { useState, useEffect, useRef } from 'react';
import { Message } from '@/entities/Message';
import { User } from '@/entities/User';
import { Class } from '@/entities/Class';
import { ClassEnrollment } from '@/entities/ClassEnrollment';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, subHours } from 'date-fns';
import { useTranslation } from '../components/i18n/useTranslation';
import AceTransition, { LOADING_DURATION } from "@/components/common/AceTransition";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function ChatPage() {
    const { t } = useTranslation();
    const [pageLoading, setPageLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [currentClassId, setCurrentClassId] = useState(null);
    const [allClasses, setAllClasses] = useState([]);
    const [currentClass, setCurrentClass] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const messagesEndRef = useRef(null);

    // Loading screen timer (same as other tabs)
    useEffect(() => {
        const timer = setTimeout(() => {
            setPageLoading(false);
        }, LOADING_DURATION);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const classIdFromUrl = urlParams.get('classId');
        
        const initialize = async () => {
            setIsLoading(true);
            try {
                const userData = await User.me();
                setUser(userData);
                
                const fetchedClasses = await fetchUserClasses(userData);
                setAllClasses(fetchedClasses);

                if (classIdFromUrl && fetchedClasses.some(c => c.id === classIdFromUrl)) {
                    setCurrentClassId(classIdFromUrl);
                } else if (fetchedClasses.length > 0) {
                    setCurrentClassId(fetchedClasses[0].id);
                }

            } catch (error) {
                console.error("Initialization failed:", error);
            } finally {
                // isLoading will be set to false once initial messages are loaded in the next effect
                // if there's a currentClassId, otherwise it stays true until a class is picked or error state
            }
        };

        initialize();
    }, []);
    
    useEffect(() => {
        if (currentClassId && user) {
            const cls = allClasses.find(c => c.id === currentClassId);
            setCurrentClass(cls);
            
            const loadInitialMessages = async () => {
                await fetchMessages(currentClassId);
                setIsLoading(false);
            };
            loadInitialMessages();

            const url = new URL(window.location);
            url.searchParams.set('classId', currentClassId);
            window.history.replaceState({}, '', url);

            const interval = setInterval(async () => {
                setIsRefreshing(true);
                await fetchMessages(currentClassId);
                setIsRefreshing(false);
            }, 10000); // Increased polling interval to 10 seconds
            return () => clearInterval(interval);
        } else if (!currentClassId && isLoading) {
            setIsLoading(false);
        }
    }, [currentClassId, allClasses, user, isLoading]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    
    const fetchUserClasses = async (userData) => {
        if (userData.app_role === 'teacher') {
            return await Class.filter({ teacher_id: userData.id }, "-created_date");
        } else {
            const enrollments = await ClassEnrollment.filter({ student_id: userData.id }, "-created_date");
            const classIds = enrollments.map(e => e.class_id);
            const classPromises = classIds.map(id => Class.filter({ id: id }).then(res => res[0]));
            return (await Promise.all(classPromises)).filter(Boolean);
        }
    };

    const fetchMessages = async (classId) => {
        if (!classId) return;
        try {
            const fetchedMessages = await Message.filter({ class_id: classId }, "created_date");
            setMessages(fetchedMessages);
        } catch (error) {
            console.error("Error fetching messages:", error);
            // Silently fail on background refresh to avoid user disruption from 429s
            // The existing error logging is sufficient for "silent fail" as it does not throw or show an alert.
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !user || !currentClassId) return;

        setIsSending(true);
        try {
            await Message.create({
                content: newMessage.trim(),
                user_id: user.id,
                user_name: user.full_name || user.email,
                user_role: user.app_role,
                class_id: currentClassId,
            });
            setNewMessage('');
            await fetchMessages(currentClassId);
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setIsSending(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    if (pageLoading) {
        return <AceTransition />;
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: `rgb(var(--color-primary))` }} />
            </div>
        );
    }

    if (!user || !currentClass) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-center">
                <Users className="w-12 h-12 mb-4" style={{ color: `rgb(var(--color-textSecondary))` }} />
                <h2 className="text-xl font-semibold" style={{ color: `rgb(var(--color-text))` }}>{t('chat.unavailable')}</h2>
                <p className="mt-2" style={{ color: `rgb(var(--color-textSecondary))` }}>{t('chat.mustBeEnrolled')}</p>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] flex flex-col max-w-4xl mx-auto p-4">
            <div className="flex-shrink-0 mb-4 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: `rgb(var(--color-text))` }}>{t('chat.title')}</h1>
                    <div className="flex items-center gap-2">
                        <p style={{ color: `rgb(var(--color-textSecondary))` }}>{t('chat.chattingIn')}: {currentClass.name}</p>
                        {isRefreshing && <Loader2 className="w-4 h-4 animate-spin" style={{ color: `rgb(var(--color-textSecondary))` }} />}
                    </div>
                </div>
                {allClasses.length > 1 && (
                    <Select value={currentClassId} onValueChange={setCurrentClassId}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder={t('chat.switchClass')} />
                        </SelectTrigger>
                        <SelectContent>
                            {allClasses.map(cls => (
                                <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>

            <div className="flex-grow rounded-2xl flex flex-col overflow-hidden themed-card">
                <div className="flex-grow p-6 space-y-6 overflow-y-auto">
                    <AnimatePresence>
                        {messages.map((message) => {
                            const isMyMessage = message.user_id === user.id;
                            return (
                                <motion.div
                                    key={message.id}
                                    layout
                                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                    className={`flex items-end gap-3 ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex flex-col space-y-1 max-w-sm ${isMyMessage ? 'items-end' : 'items-start'}`}>
                                        <div className={`px-4 py-3 rounded-2xl ${isMyMessage ? 'text-white rounded-br-none' : 'rounded-bl-none'}`} style={{ backgroundColor: isMyMessage ? `rgb(var(--color-primary))` : `rgb(var(--color-accentLight))`, color: isMyMessage ? 'white' : `rgb(var(--color-text))` }}>
                                            <p className="font-semibold text-sm mb-1">{message.user_name} <span className="font-normal opacity-80">({message.user_role})</span></p>
                                            <p className="leading-snug">{message.content}</p>
                                        </div>
                                        <p className="text-xs mt-1 px-1" style={{ color: `rgb(var(--color-textSecondary))` }}>
                                            {format(subHours(new Date(message.created_date), 8), 'MMM d, p')}
                                        </p>
                                        </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                </div>
                
                <div className="p-4 border-t" style={{ backgroundColor: `rgb(var(--color-accentLight))`, borderColor: `rgb(var(--color-border))` }}>
                    <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={t('chat.typeMessage')}
                            className="flex-grow"
                            style={{ backgroundColor: `rgb(var(--color-surface))` }}
                            disabled={isSending}
                        />
                        <Button type="submit" disabled={isSending || !newMessage.trim()}>
                            {isSending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                            <span className="sr-only">{t('chat.send')}</span>
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}