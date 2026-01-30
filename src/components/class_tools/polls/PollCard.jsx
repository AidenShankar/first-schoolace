import React, { useState, useEffect } from 'react';
import { PollVote } from '@/entities/PollVote';
import { Poll } from '@/entities/Poll';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Unlock, Trash2 } from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';

export default function PollCard({ poll, user, votes = [], onUpdate }) {
    const { t } = useTranslation();
    const [pollVotes, setPollVotes] = useState([]);
    const [userVote, setUserVote] = useState(null);
    const [isVoting, setIsVoting] = useState(false);

    useEffect(() => {
        const fetchVotes = async () => {
            const allPollVotes = await PollVote.filter({ poll_id: poll.id });
            setPollVotes(allPollVotes);
            
            if (user.app_role === 'student') {
                // Check if user has already voted on this specific poll
                const myVote = allPollVotes.find(v => v.student_id === user.id);
                setUserVote(myVote);
            }
        };
        fetchVotes();
    }, [poll, user]);
    
    const handleVote = async (option) => {
        if (userVote || isVoting) return; // Already voted or currently voting
        
        setIsVoting(true);
        try {
            const newVote = await PollVote.create({
                poll_id: poll.id,
                selected_option: option,
                student_id: user.id
            });
            
            // Update local state immediately
            setUserVote(newVote);
            setPollVotes(prev => [...prev, newVote]);
            
            // Update parent component
            onUpdate();
        } catch (error) {
            console.error("Error voting:", error);
            alert("Failed to submit vote. Please try again.");
        } finally {
            setIsVoting(false);
        }
    };
    
    const toggleStatus = async () => {
        const newStatus = poll.status === 'active' ? 'closed' : 'active';
        await Poll.update(poll.id, { status: newStatus });
        onUpdate();
    };

    const handleDeletePoll = async () => {
        if (!window.confirm(`Are you sure you want to delete this poll: "${poll.question}"? This will delete all votes and cannot be undone.`)) {
            return;
        }

        try {
            // Delete all votes first
            const pollVotesToDelete = await PollVote.filter({ poll_id: poll.id });
            for (const vote of pollVotesToDelete) {
                await PollVote.delete(vote.id);
            }

            // Delete the poll
            await Poll.delete(poll.id);
            
            onUpdate(); // Refresh the polls list
        } catch (error) {
            console.error("Failed to delete poll:", error);
            alert("An error occurred while deleting the poll. Please try again.");
        }
    };

    const totalVotes = pollVotes.length;
    const getVoteCount = (option) => pollVotes.filter(v => v.selected_option === option).length;
    const getVotePercentage = (option) => totalVotes > 0 ? (getVoteCount(option) / totalVotes) * 100 : 0;

    return (
        <div className="p-4 border rounded-lg" style={{ borderColor: `rgb(var(--color-border))` }}>
            <div className="flex justify-between items-start">
                <h4 className="font-semibold" style={{ color: `rgb(var(--color-text))` }}>{poll.question}</h4>
                <Badge className={poll.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {poll.status}
                </Badge>
            </div>
            <div className="space-y-2 my-4">
                {poll.options.map((option, index) => (
                    <div key={index}>
                        {user.app_role === 'student' && poll.status === 'active' && !userVote && (
                            <Button 
                                variant="outline" 
                                className="w-full justify-start" 
                                onClick={() => handleVote(option)}
                                disabled={isVoting}
                            >
                                {isVoting ? t('classTools.voting') : option}
                            </Button>
                        )}
                        {(user.app_role === 'teacher' || poll.status === 'closed' || userVote) && (
                            <div className="relative w-full h-8 rounded-md overflow-hidden" style={{ backgroundColor: `rgb(var(--color-border))` }}>
                                <div className="absolute top-0 left-0 h-full transition-all" style={{ width: `${getVotePercentage(option)}%`, backgroundColor: `rgb(var(--color-primary))` }}></div>
                                <div className="absolute top-0 left-2 h-full flex items-center text-sm font-medium z-10" style={{ color: `rgb(var(--color-text))` }}>
                                    {option} ({getVoteCount(option)} {t('classTools.votes')})
                                    {userVote && userVote.selected_option === option && user.app_role === 'student' && (
                                        <span className="ml-2 text-xs text-white px-2 py-0.5 rounded" style={{ backgroundColor: `rgb(var(--color-primary))` }}>{t('classTools.yourVote')}</span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            {totalVotes > 0 && (
                <p className="text-sm mb-2" style={{ color: `rgb(var(--color-textSecondary))` }}>{t('classTools.totalVotes')}: {totalVotes}</p>
            )}
            {user.app_role === 'teacher' && (
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={toggleStatus}>
                        {poll.status === 'active' ? <Lock className="w-4 h-4 mr-1" /> : <Unlock className="w-4 h-4 mr-1" />}
                        {poll.status === 'active' ? t('classTools.closePoll') : t('classTools.reopenPoll')}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDeletePoll} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="w-4 h-4 mr-1" /> {t('classTools.delete')}
                    </Button>
                </div>
            )}
        </div>
    );
}