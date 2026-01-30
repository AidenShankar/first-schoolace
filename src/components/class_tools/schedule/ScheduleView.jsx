import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Calendar, Clock, FileText, Star, Briefcase, ChevronLeft, ChevronRight } from 'lucide-react';
import { ScheduleEvent } from '@/entities/ScheduleEvent';
import { Assignment } from '@/entities/Assignment';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import ScheduleEventForm from './ScheduleEventForm';
import { useTranslation } from '../../i18n/useTranslation';

const eventIcons = {
    "Test/Quiz": <Star className="w-3 h-3 text-red-500" />,
    "Homework Due": <FileText className="w-3 h-3 text-blue-500" />,
    "Project Due": <Briefcase className="w-3 h-3 text-purple-500" />,
    "Holiday": <Calendar className="w-3 h-3 text-green-500" />,
    "Event": <Clock className="w-3 h-3 text-orange-500" />,
    "Other": <Clock className="w-3 h-3 text-gray-500" />
};

export default function ScheduleView({ currentClass, user }) {
    const { t } = useTranslation();
    const [events, setEvents] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [showForm, setShowForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);

    // Add retry logic for rate-limited requests
    const retryWithBackoff = useCallback(async (fn, maxRetries = 3, delay = 1000) => {
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await fn();
            } catch (error) {
                if (error.response?.status === 429 && i < maxRetries - 1) {
                    console.log(`Rate limit hit, retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    delay *= 2; // Exponential backoff
                } else {
                    throw error;
                }
            }
        }
    }, []);

    // Memoize fetchEvents using useCallback to ensure stable reference
    const fetchEvents = useCallback(async () => {
        if (!currentClass) return;
        
        try {
            // Fetch manual schedule events
            const classEvents = await retryWithBackoff(() => 
                ScheduleEvent.filter({ class_id: currentClass.id }, '-updated_date', 200)
            );
            
            // Fetch assignments with due dates
            const assignments = await retryWithBackoff(() => 
                Assignment.filter({ class_id: currentClass.id }, '-due_date', 100)
            );
            const assignmentEvents = assignments
                .filter(assignment => assignment.due_date && !isNaN(new Date(assignment.due_date).getTime()))
                .map(assignment => ({
                    // Prefix ID to distinguish from manual events, ensure uniqueness
                    id: `assignment-${assignment.id}`, 
                    title: `${assignment.title} (Due)`,
                    description: assignment.description || '',
                    event_date: new Date(assignment.due_date).toISOString(),
                    // Force event_type to "Homework Due" for assignments
                    event_type: 'Homework Due', 
                    isAssignment: true, // Custom flag to identify assignment events
                    originalAssignment: assignment // Store original assignment data for display
                }));
            
            // Combine manual events and assignment due dates
            const allEvents = [...classEvents, ...assignmentEvents];
            setEvents(allEvents.sort((a, b) => new Date(b.event_date) - new Date(a.event_date)));
        } catch (error) {
            console.error("Error fetching events:", error);
            if (error.response?.status === 429) {
                alert("The server is busy at the moment. Please wait a little and refresh the page.");
            }
            setEvents([]);
        }
    }, [currentClass, retryWithBackoff]); // Dependencies for useCallback

    // useEffect now correctly includes fetchEvents as a dependency, which is stable due to useCallback
    useEffect(() => {
        fetchEvents();
    }, [currentClass, fetchEvents]);

    const handleFormSubmit = async (eventData) => {
        if (editingEvent) {
            await ScheduleEvent.update(editingEvent.id, eventData);
        } else {
            await ScheduleEvent.create({ ...eventData, class_id: currentClass.id });
        }
        setShowForm(false);
        setEditingEvent(null);
        fetchEvents();
    };

    const handleDelete = async (eventId) => {
        if (window.confirm(t('classTools.deleteEventConfirm'))) {
            await ScheduleEvent.delete(eventId);
            fetchEvents();
        }
    };
    
    const weekStart = startOfWeek(currentDate);
    const weekEnd = endOfWeek(currentDate);
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
    
    const getEventsForDay = (day) => {
        // Correctly compare dates by ignoring time part
        return events.filter(event => {
            const eventDate = new Date(event.event_date.replace(/-/g, '/')); // Use replace for better cross-browser compatibility
            return isSameDay(eventDate, day);
        }).sort((a, b) => {
            // Sort events, manual events first, then assignments
            if (a.isAssignment && !b.isAssignment) return 1;
            if (!a.isAssignment && b.isAssignment) return -1;
            return 0;
        });
    };

    return (
        <Card className="h-full themed-card" style={{ backgroundColor: `rgb(var(--color-surface))`, borderColor: `rgb(var(--color-border))` }}>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>{t('classTools.classSchedule')}</CardTitle>
                    <p className="text-sm" style={{ color: `rgb(var(--color-textSecondary))` }}>{t('classTools.weekOf')} {format(weekStart, 'MMMM d')} - {format(weekEnd, 'MMMM d, yyyy')}</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center rounded-lg" style={{ backgroundColor: `rgb(var(--color-accentLight))` }}>
                        <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setCurrentDate(subWeeks(currentDate, 1))}
                            className="rounded-r-none"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setCurrentDate(new Date())}
                            className="rounded-none border-x px-4"
                        >
                            {t('classTools.today')}
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setCurrentDate(addWeeks(currentDate, 1))}
                            className="rounded-l-none"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                    {user.app_role === 'teacher' && (
                        <Button onClick={() => { setEditingEvent(null); setShowForm(true); }}>
                            <Plus className="w-4 h-4 mr-2" /> {t('classTools.addEvent')}
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-7 gap-px rounded-lg overflow-hidden" style={{ backgroundColor: `rgb(var(--color-border))` }}>
                    {/* Header Row */}
                    {weekDays.map(day => (
                        <div key={day.toISOString()} className={`p-3 text-center font-medium text-sm ${isToday(day) ? 'text-blue-700' : ''}`} style={{ backgroundColor: isToday(day) ? `rgba(var(--color-primary), 0.1)` : `rgba(var(--color-surface), 0.5)`, color: isToday(day) ? `rgb(var(--color-primary))` : `rgb(var(--color-textSecondary))` }}>
                            <div className="font-semibold">{format(day, 'EEE')}</div>
                            <div className={`text-lg ${isToday(day) ? 'text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mt-1' : ''}`} style={ isToday(day) ? { backgroundColor: `rgb(var(--color-primary))` } : {}}>
                                {format(day, 'd')}
                            </div>
                        </div>
                    ))}
                    
                    {/* Events Row */}
                    {weekDays.map(day => {
                        const dayEvents = getEventsForDay(day);
                        return (
                            <div key={`events-${day.toISOString()}`} className="p-2 min-h-[200px] border-t overflow-y-auto" style={{ backgroundColor: `rgb(var(--color-surface))`, borderColor: `rgb(var(--color-border))` }}>
                                <div className="space-y-1">
                                    {dayEvents.map(event => (
                                        <div 
                                           key={event.id} 
                                           className="text-xs p-2 rounded border-l-2 cursor-pointer"
                                           style={{
                                               backgroundColor: event.event_type === 'Test/Quiz' ? 'rgba(248, 113, 113, 0.1)' :
                                                              event.event_type === 'Homework Due' ? 'rgba(96, 165, 250, 0.1)' :
                                                              event.event_type === 'Project Due' ? 'rgba(168, 85, 247, 0.1)' :
                                                              event.event_type === 'Holiday' ? 'rgba(74, 222, 128, 0.1)' :
                                                              'rgba(251, 146, 60, 0.1)',
                                               borderLeftColor: event.event_type === 'Test/Quiz' ? 'rgb(248, 113, 113)' :
                                                                event.event_type === 'Homework Due' ? 'rgb(96, 165, 250)' :
                                                                event.event_type === 'Project Due' ? 'rgb(168, 85, 247)' :
                                                                event.event_type === 'Holiday' ? 'rgb(74, 222, 128)' :
                                                                'rgb(251, 146, 60)'
                                           }}
                                           onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `rgba(var(--color-border), 0.3)`}
                                           onMouseLeave={(e) => {
                                               e.currentTarget.style.backgroundColor = event.event_type === 'Test/Quiz' ? 'rgba(248, 113, 113, 0.1)' :
                                                              event.event_type === 'Homework Due' ? 'rgba(96, 165, 250, 0.1)' :
                                                              event.event_type === 'Project Due' ? 'rgba(168, 85, 247, 0.1)' :
                                                              event.event_type === 'Holiday' ? 'rgba(74, 222, 128, 0.1)' :
                                                              'rgba(251, 146, 60, 0.1)';
                                           }}
                                            // Only allow editing for teachers and for manual events (not assignments)
                                            onClick={() => user.app_role === 'teacher' && !event.isAssignment ? (setEditingEvent(event), setShowForm(true)) : null}
                                        >
                                            <div className="flex items-center gap-1 font-medium">
                                                {eventIcons[event.event_type]}
                                                <span className="truncate">{event.title}</span>
                                                {/* Display points for assignment events */}
                                                {event.isAssignment && (
                                                    <span className="text-xs bg-blue-200 text-blue-800 px-1 rounded ml-1">
                                                        {event.originalAssignment.max_points}pts
                                                    </span>
                                                )}
                                            </div>
                                            {event.description && (
                                                <p className="mt-1 text-xs truncate" style={{ color: `rgb(var(--color-textSecondary))` }}>{event.description}</p>
                                            )}
                                            {/* Only show delete button for teachers and for manual events (not assignments) */}
                                            {user.app_role === 'teacher' && !event.isAssignment && (
                                                <div className="flex justify-end mt-1">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-4 w-4 text-red-500 hover:text-red-600" 
                                                        onClick={(e) => { e.stopPropagation(); handleDelete(event.id); }}
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {showForm && (
                    <ScheduleEventForm
                        event={editingEvent}
                        onSubmit={handleFormSubmit}
                        onCancel={() => setShowForm(false)}
                    />
                )}
            </CardContent>
        </Card>
    );
}