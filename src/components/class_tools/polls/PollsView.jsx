import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Poll } from '@/entities/Poll';
import { PollVote } from '@/entities/PollVote';
import PollCreateForm from './PollCreateForm';
import PollCard from './PollCard';
import { useTranslation } from '../../i18n/useTranslation';

export default function PollsView({ user, currentClass }) {
    const { t } = useTranslation();
    const [polls, setPolls] = useState([]);
    const [votes, setVotes] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);

    // Add retry logic for rate-limited requests
    const retryWithBackoff = useCallback(async (fn, maxRetries = 3, delay = 1000) => {
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await fn();
            } catch (error) {
                if (error.response?.status === 429 && i < maxRetries - 1) {
                    console.log(`Rate limit hit, retrying in ${delay}ms... (Attempt ${i + 1}/${maxRetries})`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    delay *= 2; // Exponential backoff
                } else {
                    throw error;
                }
            }
        }
    }, []);

    const fetchData = useCallback(async () => {
        if (!currentClass) return;
        
        try {
            // Fetch polls first
            const classPolls = await retryWithBackoff(() => 
                Poll.filter({ class_id: currentClass.id }, '-created_date', 100)
            );
            
            // Filter polls based on user role
            if (user.app_role === 'student') {
                // Students only see active polls - filter out closed ones completely
                const activePolls = classPolls.filter(poll => poll.status === 'active');
                setPolls(activePolls);
                
                // Fetch student votes
                const studentVotes = await retryWithBackoff(() => 
                    PollVote.filter({ student_id: user.id }, '-created_date', 200)
                );
                setVotes(studentVotes);
            } else {
                // Teachers see all polls
                setPolls(classPolls);
                setVotes([]); // Teachers don't need vote data
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            if (error.response?.status === 429) {
                 alert("The server is busy at the moment. Please wait a little and refresh the page.");
            }
            setPolls([]);
            setVotes([]);
        }
    }, [currentClass, user, retryWithBackoff]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handlePollCreated = () => {
        fetchData();
        setShowCreateForm(false);
    };

    const handlePollUpdated = () => {
        fetchData();
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t('classTools.polls')}</CardTitle>
                {user.app_role === 'teacher' && (
                    <Button onClick={() => setShowCreateForm(true)}>
                        <Plus className="w-4 h-4 mr-2" /> {t('classTools.createPoll')}
                    </Button>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                {showCreateForm && <PollCreateForm currentClass={currentClass} onCreated={handlePollCreated} onCancel={() => setShowCreateForm(false)} />}
                
                {polls.length === 0 ? (
                    <p className="text-center text-slate-500 py-8">
                        {user.app_role === 'teacher' ? t('classTools.noPolls') : t('classTools.noPollsStudent')}
                    </p>
                ) : polls.map(poll => (
                    <PollCard 
                        key={poll.id} 
                        poll={poll} 
                        user={user} 
                        votes={votes}
                        onUpdate={handlePollUpdated} 
                    />
                ))}
            </CardContent>
        </Card>
    );
}