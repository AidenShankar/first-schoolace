import React, { useEffect, useState, useCallback } from 'react';
import { AssignmentComment } from '@/entities/AssignmentComment';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, MessageSquare, User, Eye, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function PersonalizedTutorMessagesView({ allClasses }) {
    const [messagePairs, setMessagePairs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all' or 'flagged'

    // Add retry logic for rate-limited requests
    const retryWithBackoff = useCallback(async (fn, maxRetries = 3, delay = 1000) => {
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await fn();
            } catch (error) {
                // Check if the error has a response and status, and if it's 429
                if (error.response?.status === 429 && i < maxRetries - 1) {
                    console.log(`Rate limit hit, retrying in ${delay}ms... (Attempt ${i + 1}/${maxRetries})`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    delay *= 2; // Exponential backoff
                } else {
                    throw error; // Re-throw if not 429 or if max retries reached
                }
            }
        }
    }, []);

    const fetchAndProcessMessages = useCallback(async () => {
        setIsLoading(true);
        try {
            const classIds = allClasses.map(c => c.id);
            if (classIds.length === 0) {
                setMessagePairs([]);
                setIsLoading(false);
                return;
            }

            // Optimized to a single API call to reduce load
            const allMessages = await retryWithBackoff(() => AssignmentComment.filter({
                class_id: { $in: classIds },
                is_ai_tutor_message: true
            }, 'created_date')); // Fetch oldest first for easier pairing

            allMessages.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));

            const pairs = [];
            for (let i = 0; i < allMessages.length; i++) {
                if (allMessages[i].user_role === 'student') {
                    const studentMsg = allMessages[i];
                    const aiResponse = (i + 1 < allMessages.length && allMessages[i + 1].user_id === 'ai_tutor')
                        ? allMessages[i + 1]
                        : null;
                    pairs.push({ studentMsg, aiResponse });
                }
            }
            
            setMessagePairs(pairs.reverse()); // Show most recent conversations first
        } catch (error) {
            console.error("Error fetching AI tutor messages:", error);
            if (error.response?.status === 429) {
                alert("Too many requests. Please wait a moment and refresh the page.");
            }
            setMessagePairs([]);
        } finally {
            setIsLoading(false);
        }
    }, [allClasses, retryWithBackoff]);

    useEffect(() => {
        fetchAndProcessMessages();
    }, [fetchAndProcessMessages]);

    const filteredPairs = filter === 'flagged'
        ? messagePairs.filter(p => p.studentMsg.is_flagged)
        : messagePairs;

    return (
        <Card className="backdrop-blur-sm shadow-xl themed-card" style={{ backgroundColor: `rgb(var(--color-surface))`, borderColor: `rgb(var(--color-border))` }}>
            <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-indigo-600" />
                            Personalized Learning Tutor Messages
                        </CardTitle>
                        <p className="text-slate-600 text-sm mt-2">
                            Review AI tutor chat messages from students in your classes.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button 
                            variant={filter === 'all' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilter('all')}
                        >
                            All Messages
                        </Button>
                        <Button 
                            variant={filter === 'flagged' ? 'destructive' : 'outline'}
                            size="sm"
                            onClick={() => setFilter('flagged')}
                        >
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Flagged
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                    </div>
                ) : filteredPairs.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        <User className="w-7 h-7 mx-auto mb-2 text-slate-400" />
                        <p>
                            {filter === 'flagged' 
                                ? "No flagged messages found."
                                : "No AI Tutor messages found."
                            }
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Time Sent</TableHead>
                                    <TableHead>Message</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPairs.map(({ studentMsg, aiResponse }) => (
                                    <TableRow key={studentMsg.id}>
                                        <TableCell>
                                            <div className="font-bold">{studentMsg.user_name}</div>
                                            <div className="text-xs text-slate-500">{studentMsg.student_email || ''}</div>
                                        </TableCell>
                                        <TableCell className="text-xs">{(() => {
                                            const date = new Date(studentMsg.created_date);
                                            date.setHours(date.getHours() - 8);
                                            return date.toLocaleString();
                                        })()}</TableCell>
                                        <TableCell>
                                            <div className="whitespace-pre-wrap">{studentMsg.content}</div>
                                            {studentMsg.is_flagged && (
                                                <Badge variant="destructive" className="mt-2">
                                                    <AlertTriangle className="w-3 h-3 mr-1.5" />
                                                    {studentMsg.flag_reason || 'Flagged'}
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {aiResponse && (
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" size="sm">
                                                            <Eye className="w-4 h-4 mr-2" />
                                                            View Response
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>AI Tutor Response</DialogTitle>
                                                        </DialogHeader>
                                                        <div className="py-4 whitespace-pre-wrap" style={{ color: `rgb(var(--color-text))` }}>
                                                            {aiResponse.content}
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}