import React, { useState, useEffect, useRef } from 'react';
import { AceSpace } from '@/entities/AceSpace';
import { AceSpaceMember } from '@/entities/AceSpaceMember';
import { AceSpaceMessage } from '@/entities/AceSpaceMessage';
import { AceSpaceNote } from '@/entities/AceSpaceNote';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Send, Paperclip, Bot, MoreVertical, Copy, File, Download, Users, ArrowLeft, StickyNote, Plus, Trash2, UserPlus, LogOut, Languages } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { UploadFile, InvokeLLM } from '@/integrations/Core';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "@/components/i18n/useTranslation";
import { useLanguage } from "@/components/i18n/LanguageContext";
import AceTransition, { LOADING_DURATION } from "@/components/common/AceTransition";


export default function AceSpaceDetail({ user }) {
    const { t } = useTranslation();
    const { languageInfo } = useLanguage();
    const languageName = languageInfo?.name || 'English';
    const [space, setSpace] = useState(null);
    const [members, setMembers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageLoading, setPageLoading] = useState(true);
    const [inputValue, setInputValue] = useState("");
    const [isAiMode, setIsAiMode] = useState(false);
    const [sending, setSending] = useState(false);
    const [uploading, setUploading] = useState(false);
    
    // Note creation state
    const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
    const [newNoteTitle, setNewNoteTitle] = useState("");
    const [newNoteContent, setNewNoteContent] = useState("");
    const [creatingNote, setCreatingNote] = useState(false);

    // Member management state
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [addingMember, setAddingMember] = useState(false);

    // Translation state
    const [translations, setTranslations] = useState({});
    const [isTranslatingBatch, setIsTranslatingBatch] = useState(false);

    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const urlParams = new URLSearchParams(window.location.search);
    const spaceId = urlParams.get('id');

    useEffect(() => {
        const timer = setTimeout(() => {
            setPageLoading(false);
        }, LOADING_DURATION);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (spaceId && user) {
            fetchSpaceDetails();
            const interval = setInterval(fetchMessages, 3000); // Poll every 3s
            return () => clearInterval(interval);
        }
    }, [spaceId, user]);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, sending, uploading]); // Scroll on new messages or status changes

    const fetchSpaceDetails = async () => {
        try {
            const spaces = await AceSpace.filter({ id: spaceId });
            if (spaces.length === 0) {
                // Handle 404
                return;
            }
            setSpace(spaces[0]);

            const mems = await AceSpaceMember.filter({ space_id: spaceId });
            setMembers(mems);

            // Fetch notes
            const spaceNotes = await AceSpaceNote.filter({ space_id: spaceId }, "-created_at");
            setNotes(spaceNotes);

            await fetchMessages();
        } catch (error) {
            console.error("Error details:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async () => {
        try {
            // Fetch last 100 messages
            const msgs = await AceSpaceMessage.filter({ space_id: spaceId }, "-created_date", 100);
            // Sort to chronological order
            msgs.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
            
            setMessages(msgs);

            // Also refresh notes periodically (simplified)
            const spaceNotes = await AceSpaceNote.filter({ space_id: spaceId }, "-created_at");
            setNotes(spaceNotes);
        } catch (error) {
            console.error("Error messages:", error);
        }
    };

    const handleCreateNote = async () => {
        if (!newNoteTitle.trim() || !newNoteContent.trim()) return;
        setCreatingNote(true);
        try {
            await AceSpaceNote.create({
                space_id: spaceId,
                creator_id: user.id,
                creator_name: user.full_name,
                title: newNoteTitle,
                content: newNoteContent,
                created_at: new Date().toISOString()
            });
            setIsNoteDialogOpen(false);
            setNewNoteTitle("");
            setNewNoteContent("");
            // Refresh notes immediately
            const spaceNotes = await AceSpaceNote.filter({ space_id: spaceId }, "-created_at");
            setNotes(spaceNotes);
        } catch (error) {
            console.error("Error creating note:", error);
            alert("Failed to create note");
        } finally {
            setCreatingNote(false);
        }
    };

    const handleDeleteNote = async (noteId) => {
        if (!confirm("Are you sure you want to delete this note?")) return;
        try {
            await AceSpaceNote.delete(noteId);
            setNotes(prev => prev.filter(n => n.id !== noteId));
        } catch (error) {
            console.error("Error deleting note:", error);
        }
    };

    const handleAddMember = async () => {
        if (!inviteEmail.trim()) return;
        setAddingMember(true);
        try {
            const response = await base44.functions.invoke('addSpaceMember', {
                space_id: spaceId,
                email: inviteEmail.trim()
            });
            
            if (response.error) {
                alert(response.error);
            } else {
                alert(response.message || "Added!");
                setInviteEmail("");
                setIsAddMemberOpen(false);
                // Refresh members
                const mems = await AceSpaceMember.filter({ space_id: spaceId });
                setMembers(mems);
            }
        } catch (error) {
            console.error("Error adding member:", error);
            alert("Failed to add member. Please check the email and try again.");
        } finally {
            setAddingMember(false);
        }
    };

    const handleLeaveSpace = async () => {
        if (!confirm(`Are you sure you want to leave "${space.name}"?`)) return;
        
        try {
            // Find my membership
            const myMembership = members.find(m => m.student_id === user.id);
            if (myMembership) {
                await AceSpaceMember.delete(myMembership.id);
                // Redirect to spaces list
                window.location.href = createPageUrl('AceSpaces');
            } else {
                alert("Could not find your membership record.");
            }
        } catch (error) {
            console.error("Error leaving space:", error);
            alert("Failed to leave space.");
        }
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim() && !uploading) return;
        
        const content = inputValue.trim();
        const type = isAiMode ? 'ai_request' : 'text';
        
        setInputValue(""); // Optimistic clear
        setSending(true);

        try {
            // Create user message
            const newMessage = await AceSpaceMessage.create({
                space_id: spaceId,
                user_id: user.id,
                user_name: user.full_name,
                content: content,
                type: type,
                created_date: new Date().toISOString()
            });

            // If AI mode, trigger backend function
            if (isAiMode) {
                // We don't await this to keep UI responsive, 
                // but usually good to show "Ace is typing..." state.
                // For MVP, the polling will pick up the response.
                // We trigger the function:
                base44.functions.invoke('invokeAceSpaceAI', {
                    space_id: spaceId,
                    user_message: content,
                    message_id: newMessage.id,
                    language: languageName || 'English'
                }).catch(err => console.error("AI trigger failed", err));
            }

            await fetchMessages();
            setIsAiMode(false); // Reset mode after send? Or keep it? Usually reset is safer to avoid accidental AI spam.
        } catch (error) {
            console.error("Send failed:", error);
            alert("Failed to send message");
        } finally {
            setSending(false);
        }
    };

    // Automatic batch translation
    useEffect(() => {
        if (!messages.length || !languageName) return;

        const autoTranslate = async () => {
            // Find messages that need translation (text/ai_response types that aren't yet translated)
            // We translate everything to ensure consistency, assuming mixed source languages
            const untranslated = messages.filter(m => 
                (m.type === 'text' || m.type === 'ai_response') && 
                !translations[m.id] &&
                m.content // has content
            );

            if (untranslated.length === 0 || isTranslatingBatch) return;

            // Take the most recent 10 untranslated messages to avoid huge payloads
            const batch = untranslated.slice(-10);
            setIsTranslatingBatch(true);

            try {
                const messagesMap = batch.reduce((acc, msg) => {
                    acc[msg.id] = msg.content;
                    return acc;
                }, {});

                const prompt = `You are a translator. Translate the following messages to ${languageName}.
                Input is a JSON object where keys are message IDs and values are the text.
                Return ONLY a JSON object where keys are message IDs and values are the translated text.
                Do not include markdown formatting like \`\`\`json.
                
                Input: ${JSON.stringify(messagesMap)}`;

                const response = await InvokeLLM({ 
                    prompt,
                    response_json_schema: {
                        type: "object",
                        additionalProperties: { type: "string" }
                    }
                });

                if (response) {
                    setTranslations(prev => ({...prev, ...response}));
                }
            } catch (error) {
                console.error("Auto-translation failed:", error);
            } finally {
                setIsTranslatingBatch(false);
            }
        };

        // Debounce slightly to allow messages to settle
        const timeoutId = setTimeout(autoTranslate, 1000);
        return () => clearTimeout(timeoutId);
    }, [messages, languageName, translations, isTranslatingBatch]);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const { file_url } = await UploadFile({ file });
            
            await AceSpaceMessage.create({
                space_id: spaceId,
                user_id: user.id,
                user_name: user.full_name,
                content: `${t('aceSpaces.uploadedFile')}: ${file.name}`,
                type: 'file',
                file_url: file_url,
                file_name: file.name,
                file_size: (file.size / 1024).toFixed(1) + ' KB',
                created_date: new Date().toISOString()
            });
            
            await fetchMessages();
        } catch (error) {
            console.error("Upload failed:", error);
            alert("File upload failed");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const copyCode = () => {
        if (space?.join_code) {
            navigator.clipboard.writeText(space.join_code);
            alert(t('aceSpaces.codeCopied'));
        }
    };

    if (pageLoading || loading) return <AceTransition />;

    if (!space) return <div className="p-8 text-center">Space not found</div>;

    return (
        <div className="flex h-[calc(100vh-64px)] bg-white overflow-hidden">
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Chat Header */}
                <div className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-white shrink-0">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => window.location.href = createPageUrl('AceSpaces')} className="md:hidden mr-2">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                {space.name}
                                <span className="bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded-full font-normal">
                                    {members.length} members
                                </span>
                            </h1>
                            <p className="text-xs text-slate-500 line-clamp-1">{space.description}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="default" 
                            size="sm" 
                            className="hidden md:flex gap-2 bg-black text-white hover:bg-slate-800 shadow-sm"
                            onClick={() => setIsAddMemberOpen(true)}
                        >
                            <UserPlus className="h-4 w-4" />
                            Add Member
                        </Button>
                        
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 ml-2">
                                    <MoreVertical className="h-4 w-4 text-slate-500" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={copyCode}>
                                    <Copy className="h-4 w-4 mr-2" /> Copy Join Code
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setIsAddMemberOpen(true)}>
                                    <UserPlus className="h-4 w-4 mr-2" /> Add Member
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleLeaveSpace} className="text-red-600 focus:text-red-600">
                                    <LogOut className="h-4 w-4 mr-2" /> Leave Space
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Messages Area */}
                <ScrollArea className="flex-1 p-4 md:p-6 bg-slate-50/50">
                    <div className="space-y-4 max-w-4xl mx-auto relative">
{/* Removed AI Mode Pill */}
                        {messages.map((msg, idx) => {
                            const isMe = msg.user_id === user.id;
                            const isAi = msg.type === 'ai_response' || msg.user_name === 'Ace AI';
                            const showAvatar = idx === 0 || messages[idx - 1].user_id !== msg.user_id;
                            
                            return (
                                <motion.div 
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex gap-3 ${isMe ? 'justify-end' : 'justify-start'}`}
                                >
                                    {!isMe && showAvatar && (
                                        <Avatar className={`h-8 w-8 mt-1 ${isAi ? 'ring-2 ring-indigo-100' : ''}`}>
                                            {isAi ? (
                                                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 h-full w-full flex items-center justify-center">
                                                    <Bot className="h-5 w-5 text-white" />
                                                </div>
                                            ) : (
                                                <AvatarFallback className="bg-slate-200 text-slate-600 text-xs">
                                                    {msg.user_name?.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            )}
                                        </Avatar>
                                    )}
                                    {!isMe && !showAvatar && <div className="w-8" />} {/* Spacer */}

                                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[80%] md:max-w-[70%]`}>
                                        {showAvatar && !isMe && (
                                            <span className="text-xs text-slate-400 ml-1 mb-1 flex items-center gap-1">
                                                {msg.user_name}
                                                {isAi && <span className="bg-indigo-100 text-indigo-600 text-[10px] px-1 rounded font-bold">AI</span>}
                                            </span>
                                        )}
                                        
                                        <div className={`rounded-2xl px-4 py-2.5 shadow-sm text-sm ${
                                            isMe 
                                                ? 'bg-indigo-600 text-white rounded-tr-none' 
                                                : isAi 
                                                    ? 'bg-white border border-indigo-100 text-slate-800 rounded-tl-none ring-1 ring-indigo-50/50' 
                                                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                                        }`}>
                                            {msg.type === 'file' ? (
                                                <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-3 p-1 ${isMe ? 'text-white hover:text-indigo-100' : 'text-indigo-600 hover:text-indigo-700'}`}>
                                                    <div className={`p-2 rounded-lg ${isMe ? 'bg-white/20' : 'bg-indigo-50'}`}>
                                                        <File className="h-5 w-5" />
                                                    </div>
                                                    <div className="flex flex-col truncate">
                                                        <span className="font-medium truncate max-w-[150px]">{msg.file_name}</span>
                                                        <span className={`text-xs ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>{msg.file_size || 'File'}</span>
                                                    </div>
                                                    <Download className="h-4 w-4 ml-2 opacity-70" />
                                                </a>
                                            ) : (
                                                <div className={`markdown-content ${isAi ? 'prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2' : ''}`}>
                                                    {/* Auto-translated content */}
                                                    {translations[msg.id] ? (
                                                        <div className="relative">
                                                            {isAi ? (
                                                                <ReactMarkdown>{translations[msg.id]}</ReactMarkdown>
                                                            ) : (
                                                                <p className="whitespace-pre-wrap">{translations[msg.id]}</p>
                                                            )}
                                                            <div className="mt-1 text-[10px] opacity-60 border-t border-black/5 pt-1 flex items-center gap-1">
                                                                <Languages className="h-3 w-3" /> 
                                                                {t('aceSpaces.translatedTo')} {languageName}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        isAi ? <ReactMarkdown>{msg.content}</ReactMarkdown> : <p className="whitespace-pre-wrap">{msg.content}</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="flex items-center gap-2 mt-1">
                                            {msg.type === 'ai_request' && (
                                                <span className="text-[10px] text-indigo-400 font-medium flex items-center gap-1">
                                                    <Bot className="h-3 w-3" /> {t('aceSpaces.askAce')}
                                                </span>
                                            )}
                                            
                                            {/* Translation Status */}
                                            {translations[msg.id] && (
                                                <span className="text-[10px] text-slate-300 flex items-center gap-1">
                                                    <Languages className="h-2 w-2" /> Auto-translated
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-slate-200">
                    <div className="max-w-4xl mx-auto flex flex-col gap-2">
                        {/* Toggle AI Mode */}
                        <div className="flex items-center gap-2">
                             <Button 
                                variant={isAiMode ? "secondary" : "default"} 
                                size="sm"
                                className={`gap-2 h-10 px-4 rounded-full transition-all ${isAiMode ? "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm" : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200"}`}
                                onClick={() => setIsAiMode(!isAiMode)}
                            >
                                {isAiMode ? (
                                    <>
                                        <Users className="h-4 w-4" />
                                        Chat with Group
                                    </>
                                ) : (
                                    <>
                                        <Bot className="h-4 w-4" />
                                        Chat with AI
                                    </>
                                )}
                            </Button>
                        </div>

                        <div className="flex gap-2 items-end">
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                className="hidden" 
                                onChange={handleFileUpload}
                            />
                            <Button 
                                variant="outline" 
                                size="icon" 
                                className="shrink-0 h-10 w-10 rounded-full"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                            >
                                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4 text-slate-500" />}
                            </Button>
                            
                            <div className="relative flex-1">
                                <Input
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                    placeholder={isAiMode ? "Ask Ace AI anything..." : "Message the group..."}
                                    className={`pr-10 rounded-2xl ${isAiMode ? 'border-indigo-300 focus-visible:ring-indigo-500' : ''}`}
                                />
                            </div>

                            <Button 
                                onClick={handleSendMessage} 
                                disabled={sending || (!inputValue.trim() && !uploading)}
                                className={`shrink-0 h-10 w-10 rounded-full ${isAiMode ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
                                size="icon"
                            >
                                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Sidebar (Tabs for Details, Files, Notes) */}
            <div className="hidden lg:flex w-80 border-l border-slate-200 bg-slate-50 flex-col">
                <Tabs defaultValue="members" className="flex-1 flex flex-col">
                    <div className="p-4 border-b border-slate-200 bg-white">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="members">People</TabsTrigger>
                            <TabsTrigger value="files">Files</TabsTrigger>
                            <TabsTrigger value="notes">Notes</TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="members" className="flex-1 overflow-y-auto p-4 m-0 data-[state=active]:flex flex-col">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Members ({members.length})</h4>
                            <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0 hover:bg-slate-100 rounded-full">
                                        <Plus className="h-4 w-4 text-slate-500" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add Member</DialogTitle>
                                        <DialogDescription>
                                            Enter the email address of the user you want to add to this space.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="py-4">
                                        <Input 
                                            placeholder="user@example.com" 
                                            value={inviteEmail} 
                                            onChange={(e) => setInviteEmail(e.target.value)}
                                        />
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={handleAddMember} disabled={addingMember || !inviteEmail.trim()}>
                                            {addingMember ? <Loader2 className="animate-spin h-4 w-4" /> : "Add Member"}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <div className="space-y-3">
                            {members.map(member => (
                                <div key={member.student_id} className="flex items-center gap-3 p-2 bg-white rounded-lg shadow-sm border border-slate-100">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className="text-xs bg-slate-100 text-slate-600">
                                            {member.student_name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-900 truncate">{member.student_name}</p>
                                        <p className="text-xs text-slate-500 capitalize">{member.role}</p>
                                    </div>
                                    {member.role === 'admin' && <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-medium">Admin</span>}
                                </div>
                            ))}
                            <div className="flex items-center gap-3 p-2 bg-gradient-to-r from-indigo-50 to-white rounded-lg shadow-sm border border-indigo-100">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                    <Bot className="h-4 w-4 text-white" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-indigo-900">Ace AI</p>
                                    <p className="text-xs text-indigo-600">Always online</p>
                                </div>
                                <span className="text-[10px] text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded font-medium">Bot</span>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="files" className="flex-1 overflow-y-auto p-4 m-0 data-[state=active]:flex flex-col">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Shared Files</h4>
                        <div className="space-y-2">
                            {messages.filter(m => m.type === 'file').length === 0 ? (
                                <div className="text-center py-8 text-slate-400 text-sm italic">
                                    <File className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    No files shared yet
                                </div>
                            ) : (
                                messages.filter(m => m.type === 'file').slice().reverse().map(file => (
                                    <a 
                                        key={file.id} 
                                        href={file.file_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 p-3 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-sm transition-all group"
                                    >
                                        <div className="p-2 bg-indigo-50 rounded text-indigo-600">
                                            <File className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-900 truncate">{file.file_name}</p>
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <span>{file.file_size}</span>
                                                <span>•</span>
                                                <span>{new Date(file.created_date).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <Download className="h-4 w-4 text-slate-300 group-hover:text-indigo-600" />
                                    </a>
                                ))
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="notes" className="flex-1 overflow-y-auto p-4 m-0 data-[state=active]:flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Shared Notes</h4>
                            <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                                        <Plus className="h-3 w-3" /> Add Note
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add Shared Note</DialogTitle>
                                        <DialogDescription>Create a note visible to all space members.</DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-2">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Title</label>
                                            <Input value={newNoteTitle} onChange={(e) => setNewNoteTitle(e.target.value)} placeholder="e.g. Project Deadlines" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Content</label>
                                            <Textarea value={newNoteContent} onChange={(e) => setNewNoteContent(e.target.value)} placeholder="Type your note here..." className="h-32" />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={handleCreateNote} disabled={creatingNote || !newNoteTitle.trim()}>
                                            {creatingNote ? <Loader2 className="animate-spin h-4 w-4" /> : "Save Note"}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                        
                        <div className="space-y-3">
                            {notes.length === 0 ? (
                                <div className="text-center py-8 text-slate-400 text-sm italic">
                                    <StickyNote className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    No notes yet. Add one!
                                </div>
                            ) : (
                                notes.map(note => (
                                    <div key={note.id} className="bg-yellow-50/50 border border-yellow-200 p-3 rounded-lg relative group hover:shadow-sm transition-all">
                                        <div className="flex justify-between items-start mb-1">
                                            <h5 className="font-semibold text-sm text-slate-800 line-clamp-1 pr-6">{note.title}</h5>
                                            {(note.creator_id === user.id || user.app_role === 'teacher') && (
                                                <button 
                                                    onClick={() => handleDeleteNote(note.id)}
                                                    className="absolute top-3 right-3 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-600 whitespace-pre-wrap line-clamp-4">{note.content}</p>
                                        <div className="mt-2 pt-2 border-t border-yellow-100 flex items-center justify-between text-[10px] text-slate-500">
                                            <span>{note.creator_name}</span>
                                            <span>{new Date(note.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}