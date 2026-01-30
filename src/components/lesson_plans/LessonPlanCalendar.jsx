import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    ChevronLeft, 
    ChevronRight, 
    Calendar,
    Clock,
    Eye,
    EyeOff
} from 'lucide-react';
import { 
    format, 
    parseISO, 
    startOfWeek, 
    endOfWeek, 
    eachDayOfInterval,
    addWeeks,
    subWeeks,
    isSameDay,
    isToday
} from 'date-fns';
import { motion } from 'framer-motion';
import { useTranslation } from '../i18n/useTranslation';

export default function LessonPlanCalendar({ 
    lessons, 
    selectedWeek, 
    onWeekChange, 
    onLessonClick, 
    onEditLesson, 
    onToggleRelease,
    currentUser 
}) {
    const { t } = useTranslation();
    const weekStart = startOfWeek(selectedWeek);
    const weekEnd = endOfWeek(selectedWeek);
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    const isTeacher = currentUser?.app_role === 'teacher';

    const getLessonsForDay = (day) => {
        return lessons.filter(lesson => 
            isSameDay(parseISO(lesson.lesson_date), day)
        );
    };

    const previousWeek = () => {
        onWeekChange(subWeeks(selectedWeek, 1));
    };

    const nextWeek = () => {
        onWeekChange(addWeeks(selectedWeek, 1));
    };

    const statusColors = {
        draft: 'bg-gray-100 text-gray-600 border-gray-200',
        published: 'bg-blue-100 text-blue-700 border-blue-200',
        completed: 'bg-green-100 text-green-700 border-green-200'
    };

    const getReleaseStatusColor = (lesson) => {
        if (!isTeacher) return 'border-l-indigo-500'; // Students see default color
        
        return lesson.is_released 
            ? 'border-l-green-500' // Released lessons are green
            : 'border-l-red-500';  // Unreleased lessons are red
    };

    const getReleaseCardBackground = (lesson) => {
        if (!isTeacher) return 'bg-white'; // Students see default background
        
        return lesson.is_released 
            ? 'bg-green-50 hover:bg-green-100' // Released lessons have light green background
            : 'bg-red-50 hover:bg-red-100';    // Unreleased lessons have light red background
    };

    return (
        <div className="space-y-6">
            {/* Week Navigation */}
            <Card style={{ backgroundColor: `rgb(var(--color-surface))`, borderColor: `rgb(var(--color-border))` }}>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <Button
                            variant="outline"
                            onClick={previousWeek}
                            className="flex items-center gap-2"
                            style={{ backgroundColor: `rgb(var(--color-surface))`, borderColor: `rgb(var(--color-border))`, color: `rgb(var(--color-text))` }}
                        >
                            <ChevronLeft className="w-4 h-4" />
                            {t('lessonPlans.previous')}
                        </Button>
                        
                        <div className="text-center">
                            <h3 className="text-lg font-semibold" style={{ color: `rgb(var(--color-text))` }}>
                                {format(weekStart, 'MMMM d')} - {format(weekEnd, 'MMMM d, yyyy')}
                            </h3>
                            <p className="text-sm" style={{ color: `rgb(var(--color-textSecondary))` }}>{t('lessonPlans.weekView')}</p>
                        </div>
                        
                        <Button
                            variant="outline"
                            onClick={nextWeek}
                            className="flex items-center gap-2"
                            style={{ backgroundColor: `rgb(var(--color-surface))`, borderColor: `rgb(var(--color-border))`, color: `rgb(var(--color-text))` }}
                        >
                            {t('lessonPlans.next')}
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Teacher Release Status Legend */}
            {isTeacher && (
                <Card style={{ backgroundColor: `rgb(var(--color-surface))`, borderColor: `rgb(var(--color-border))` }}>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-center gap-8 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-green-200 border-l-4 border-l-green-500 rounded-sm"></div>
                                <Eye className="w-4 h-4 text-green-600" />
                                <span style={{ color: `rgb(var(--color-text))` }}>{t('lessonPlans.releasedStudentsCanSee')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-red-200 border-l-4 border-l-red-500 rounded-sm"></div>
                                <EyeOff className="w-4 h-4 text-red-600" />
                                <span style={{ color: `rgb(var(--color-text))` }}>{t('lessonPlans.unreleasedStudentsCannotSee')}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Weekly Calendar Grid */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {weekDays.map((day, dayIndex) => {
                    const dayLessons = getLessonsForDay(day);
                    const isCurrentDay = isToday(day);
                    
                    return (
                        <motion.div
                            key={day.toISOString()}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: dayIndex * 0.1 }}
                            className="min-h-[300px] rounded-xl border-2 transition-all duration-200 shadow-sm hover:shadow-md"
                            style={{
                                backgroundColor: isCurrentDay ? `rgba(var(--color-primary), 0.1)` : `rgb(var(--color-surface))`,
                                borderColor: isCurrentDay ? `rgb(var(--color-primary))` : `rgb(var(--color-border))`
                            }}
                            onMouseEnter={(e) => {
                                if (!isCurrentDay) e.currentTarget.style.borderColor = `rgba(var(--color-border), 0.7)`;
                            }}
                            onMouseLeave={(e) => {
                                if (!isCurrentDay) e.currentTarget.style.borderColor = `rgb(var(--color-border))`;
                            }}
                        >
                            {/* Day Header */}
                            <div className="p-4 border-b" style={{ borderColor: isCurrentDay ? `rgb(var(--color-primary))` : `rgb(var(--color-border))` }}>
                                <div className="text-center">
                                    <h4 className="font-semibold" style={{ color: isCurrentDay ? `rgb(var(--color-primary))` : `rgb(var(--color-text))` }}>
                                        {format(day, 'EEEE')}
                                    </h4>
                                    <div className="text-2xl font-bold mt-1" style={{ color: isCurrentDay ? `rgb(var(--color-primary))` : `rgb(var(--color-text))` }}>
                                        {format(day, 'd')}
                                    </div>
                                    {format(day, 'MMM') !== format(weekStart, 'MMM') && (
                                        <div className="text-xs mt-1" style={{ color: `rgb(var(--color-textSecondary))` }}>
                                            {format(day, 'MMM')}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Lessons for the day */}
                            <div className="p-3 space-y-2">
                                {dayLessons.length === 0 ? (
                                    <div className="text-center text-sm py-8" style={{ color: `rgb(var(--color-textSecondary))` }}>
                                        <Calendar className="w-6 h-6 mx-auto mb-2 opacity-50" style={{ color: `rgb(var(--color-textSecondary))` }} />
                                        <p>{t('lessonPlans.noLessonsForDay')}</p>
                                    </div>
                                ) : (
                                    dayLessons.map((lesson, lessonIndex) => (
                                        <motion.div
                                            key={lesson.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: (dayIndex * 0.1) + (lessonIndex * 0.05) }}
                                            className="group relative"
                                        >
                                            <Card 
                                                className="cursor-pointer transition-all duration-200 hover:shadow-md border-l-4 hover:border-l-8 themed-card"
                                                style={{
                                                    borderLeftColor: isTeacher ? (lesson.is_released ? 'rgb(34 197 94)' : 'rgb(239 68 68)') : `rgb(var(--color-primary))`
                                                }}
                                                onClick={() => onLessonClick(lesson)}
                                            >
                                                <CardContent className="p-3">
                                                    <div className="space-y-2">
                                                        {/* Title and Release Status */}
                                                        <div className="flex items-start justify-between gap-2">
                                                            <h5 className="font-medium text-sm leading-tight line-clamp-2 transition-colors flex-1" style={{ color: `rgb(var(--color-text))` }}>
                                                                {lesson.title}
                                                            </h5>
                                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                                {/* Release Status Badge for Teachers */}
                                                                {isTeacher && onToggleRelease && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className={`h-6 px-2 text-xs ${
                                                                            lesson.is_released
                                                                                ? 'text-green-700 hover:bg-green-200'
                                                                                : 'text-red-700 hover:bg-red-200'
                                                                        }`}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            onToggleRelease(lesson.id, lesson.is_released);
                                                                        }}
                                                                    >
                                                                        {lesson.is_released ? (
                                                                            <Eye className="w-3 h-3" />
                                                                        ) : (
                                                                            <EyeOff className="w-3 h-3" />
                                                                        )}
                                                                    </Button>
                                                                )}
                                                                
                                                                {/* Status Badge */}
                                                                {lesson.status && (
                                                                    <Badge 
                                                                        className={`${statusColors[lesson.status]} text-xs px-2 py-0.5 flex-shrink-0`}
                                                                        variant="outline"
                                                                    >
                                                                        {lesson.status.charAt(0).toUpperCase()}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Duration info */}
                                                        {lesson.activities && lesson.activities.length > 0 && lesson.activities.some(a => a.duration) && (
                                                            <div className="flex items-center gap-1 text-xs" style={{ color: `rgb(var(--color-textSecondary))` }}>
                                                                <Clock className="w-3 h-3" />
                                                                <span>
                                                                    {lesson.activities.reduce((sum, a) => sum + (a.duration || 0), 0)} {t('lessonPlans.min')}
                                                                </span>
                                                            </div>
                                                        )}

                                                        {/* Release status indicator at bottom for teachers */}
                                                        {isTeacher && (
                                                            <div className="flex items-center gap-1 text-xs pt-1">
                                                                {lesson.is_released ? (
                                                                    <div className="flex items-center gap-1 text-green-600">
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center gap-1 text-red-600">
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>



            {/* Summary Stats */}
            <Card style={{ backgroundColor: `rgb(var(--color-surface))`, borderColor: `rgb(var(--color-border))` }}>
                <CardContent className="p-4">
                    <div className="flex items-center justify-center gap-8 text-sm" style={{ color: `rgb(var(--color-textSecondary))` }}>
                        <div className="text-center">
                            <div className="text-2xl font-bold" style={{ color: `rgb(var(--color-text))` }}>
                                {lessons.filter(l => {
                                    const lessonDate = parseISO(l.lesson_date);
                                    return lessonDate >= weekStart && lessonDate <= weekEnd;
                                }).length}
                            </div>
                            <div>{t('lessonPlans.lessonsThisWeek')}</div>
                        </div>
                        <div className="h-8 w-px" style={{ backgroundColor: `rgb(var(--color-border))` }}></div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                                {lessons.filter(l => {
                                    const lessonDate = parseISO(l.lesson_date);
                                    return lessonDate >= weekStart && lessonDate <= weekEnd && l.is_released;
                                }).length}
                            </div>
                            <div>{t('lessonPlans.releasedCount')}</div>
                        </div>
                        <div className="h-8 w-px" style={{ backgroundColor: `rgb(var(--color-border))` }}></div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">
                                {lessons.filter(l => {
                                    const lessonDate = parseISO(l.lesson_date);
                                    return lessonDate >= weekStart && lessonDate <= weekEnd && !l.is_released;
                                }).length}
                            </div>
                            <div>{t('lessonPlans.unreleasedCount')}</div>
                        </div>
                    </div>
                </CardContent>
            </Card>


        </div>
    );
}