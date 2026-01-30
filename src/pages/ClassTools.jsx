import React, { useState, useEffect } from 'react';
import { Calendar, Loader2, FileText, BarChart, Bot } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from 'framer-motion';
import { useTranslation } from '../components/i18n/useTranslation';

// Lazy import components to prevent them from loading until needed
const ScheduleView = React.lazy(() => import('@/components/class_tools/schedule/ScheduleView'));
const QuizzesView = React.lazy(() => import('@/components/class_tools/quizzes/QuizzesView'));
const PollsView = React.lazy(() => import('@/components/class_tools/polls/PollsView'));
const PersonalizedTutorMessagesView = React.lazy(() => import('@/components/class_tools/personalized/PersonalizedTutorMessagesView'));
const ScreeningView = React.lazy(() => import('@/components/class_tools/screening/ScreeningView'));

export default function ClassTools({ user, currentClass: initialCurrentClass, allClasses, isLayoutLoading }) {
    const { t } = useTranslation();
    const [pageLoading, setPageLoading] = useState(true);
    const [currentClass, setCurrentClass] = useState(initialCurrentClass);
    const [activeTab, setActiveTab] = useState('schedule');
    const [loadedTabs, setLoadedTabs] = useState(new Set(['schedule'])); // Track which tabs have been loaded

    useEffect(() => {
        setCurrentClass(initialCurrentClass);
    }, [initialCurrentClass]);
    
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const toolFromUrl = urlParams.get('tool');
        if (toolFromUrl) {
            setActiveTab(toolFromUrl);
            setLoadedTabs(prev => new Set([...prev, toolFromUrl])); // Mark this tab as loaded
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setPageLoading(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    const handleClassChange = (classId) => {
        const newUrl = new URL(window.location);
        newUrl.searchParams.set('classId', classId);
        window.history.pushState({}, '', newUrl.toString());
        window.location.reload();
    };

    const handleTabChange = (tabValue) => {
        setActiveTab(tabValue);
        setLoadedTabs(prev => new Set([...prev, tabValue])); // Mark this tab as loaded when user clicks on it
    };

    if (pageLoading) {
            return (
                <div className="fixed inset-0 flex items-center justify-center z-[9999]" style={{ backgroundColor: `rgb(var(--color-background))` }}>
                    <div className="text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                            className="text-center"
                        >
                            <h1 className="text-5xl font-bold tracking-tight" style={{ color: `rgb(var(--color-text))` }}>
                                {t('classTools.title')}
                            </h1>
                            <p className="text-lg mt-4 font-medium tracking-wide" style={{ color: `rgb(var(--color-textSecondary))` }}>
                                {t('common.poweredByACE')}
                            </p>
                        </motion.div>
                    </div>
                </div>
            );
        }

    if (!allClasses || allClasses.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4" style={{ color: `rgb(var(--color-text))` }}>{t('classTools.title')}</h1>
                    <p className="font-medium text-lg" style={{ color: `rgb(var(--color-textSecondary))` }}>{t('classTools.noClasses')}</p>
                    <p className="text-sm mt-2" style={{ color: `rgb(var(--color-textSecondary))` }}>{t('classTools.goToDashboard')}</p>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'schedule', label: t('classTools.schedule'), icon: Calendar },
        { id: 'quizzes', label: t('classTools.quizzes'), icon: FileText },
        { id: 'polls', label: t('classTools.polls'), icon: BarChart },
        // { id: 'screening', label: 'Screening', icon: Brain }
        ];

    if (user?.app_role === 'teacher') {
        tabs.push({ id: 'personalized', label: t('classTools.personalizedLearning'), icon: Bot });
    }

    // Function to render tab content with lazy loading and suspense
    const renderTabContent = (tabId) => {
        // Only render if the tab has been loaded (clicked on)
        if (!loadedTabs.has(tabId)) {
            return null;
        }

        return (
            <React.Suspense fallback={
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin" style={{ color: `rgb(var(--color-primary))` }} />
                </div>
            }>
                {tabId === 'schedule' && <ScheduleView user={user} currentClass={currentClass} />}
                {tabId === 'quizzes' && <QuizzesView user={user} currentClass={currentClass} allClasses={allClasses} />}
                {tabId === 'polls' && <PollsView user={user} currentClass={currentClass} />}
                {tabId === 'screening' && <ScreeningView user={user} currentClass={currentClass} allClasses={allClasses} />}
                {tabId === 'personalized' && user?.app_role === 'teacher' && <PersonalizedTutorMessagesView allClasses={allClasses} />}
            </React.Suspense>
        );
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" style={{ backgroundColor: `rgb(var(--color-background))` }}>
            <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold" style={{ color: `rgb(var(--color-text))` }}>{t('classTools.title')}</h1>
                        <p className="mt-1" style={{ color: `rgb(var(--color-textSecondary))` }}>{t('classTools.subtitle')}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <label className="text-sm font-medium" style={{ color: `rgb(var(--color-text))` }}>{t('classTools.selectClass')}:</label>
                        <Select value={currentClass?.id || ''} onValueChange={handleClassChange}>
                            <SelectTrigger className="w-64">
                                <SelectValue placeholder={t('classTools.chooseClass')}>
                                    {currentClass ? (
                                        <div className="flex items-center gap-2">
                                            <span>{currentClass.name}</span>
                                            {user?.app_role === 'teacher' && (
                                                <span className="text-xs text-slate-500">({currentClass.class_code})</span>
                                            )}
                                        </div>
                                    ) : 'Select a class'}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {allClasses.map(cls => (
                                    <SelectItem key={cls.id} value={cls.id}>
                                        <div className="flex items-center gap-2">
                                            <span>{cls.name}</span>
                                            {user?.app_role === 'teacher' && (
                                                <span className="text-xs text-slate-500">({cls.class_code})</span>
                                            )}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {currentClass && (
                <Tabs value={activeTab} className="w-full" onValueChange={handleTabChange}>
                    <TabsList className="grid w-full grid-flow-col auto-cols-fr rounded-xl p-2 themed-card">
                        {tabs.map(tab => (
                            <TabsTrigger
                                key={tab.id}
                                value={tab.id}
                                className="flex items-center gap-2 rounded-lg data-[state=active]:shadow-md transition-colors"
                                style={{
                                    color: activeTab === tab.id ? `rgb(var(--color-primary))` : `rgb(var(--color-textSecondary))`
                                }}
                                onMouseEnter={(e) => {
                                    if (activeTab !== tab.id) {
                                        e.currentTarget.style.backgroundColor = `rgba(var(--color-border), 0.5)`;
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (activeTab !== tab.id) {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }
                                }}
                            >
                                <tab.icon className="w-4 h-4" /> {tab.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    
                    {tabs.map(tab => (
                        <TabsContent key={tab.id} value={tab.id} className="mt-6">
                            {activeTab === tab.id && renderTabContent(tab.id)}
                        </TabsContent>
                    ))}
                </Tabs>
            )}
        </div>
    );
}