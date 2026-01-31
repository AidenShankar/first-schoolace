import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Zap, CheckCircle } from 'lucide-react';
import { useTranslation } from '../components/i18n/useTranslation';

const SchoolaceLogo = () => (
    <div className="flex items-center space-x-3">
        <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <GraduationCap className="w-9 h-9 text-white" />
        </div>
        <h1 className="text-5xl font-bold text-slate-800 tracking-tight">Schoolace</h1>
    </div>
);

const PowerSchoolLogo = () => (
    <div className="flex items-center space-x-3">
        <h1 className="text-5xl font-light tracking-tight" style={{ fontFamily: 'Nunito Sans, sans-serif', color: '#00B0F0' }}>PowerSchool</h1>
        <div className="w-16 h-16 flex items-center justify-center">
            <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/5ad61ccfc_logo.png" alt="PowerSchool Logo" className="w-14.1 h-14.1" />
        </div>
    </div>
);

export default function PowerSchoolPage() {
    const { t } = useTranslation();
    const [pageLoading, setPageLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setPageLoading(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

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
                            {t('powerSchool.title')}
                        </h1>
                        <p className="text-lg mt-4 font-medium tracking-wide" style={{ color: `rgb(var(--color-textSecondary))` }}>
                            {t('common.poweredByACE')}
                        </p>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 via-gray-100 to-slate-200 flex flex-col items-center justify-center text-center p-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-12 max-w-4xl w-full border border-slate-200/80"
            >
                <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 mb-8">
                    <SchoolaceLogo />
                    <span className="text-4xl font-light text-slate-400">×</span>
                    <PowerSchoolLogo />
                </div>

                <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-4"
                >
                    {t('powerSchool.comingSoon')}
                </motion.h2>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="text-slate-600 text-lg max-w-2xl mx-auto mb-10"
                >
                    {t('powerSchool.description')}
                </motion.p>
                
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                        visible: {
                            transition: {
                                staggerChildren: 0.2,
                                delayChildren: 0.7
                            }
                        }
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left"
                >
                    <motion.div
                        className="bg-slate-50/70 p-6 rounded-xl border border-slate-200/70"
                        variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0 }
                        }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-indigo-100 p-3 rounded-full">
                                <Zap className="w-6 h-6 text-indigo-600"/>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">{t('powerSchool.syncGradesTitle')}</h3>
                        </div>
                        <p className="text-slate-500 mt-2">
                            {t('powerSchool.syncGradesDescription')}
                        </p>
                    </motion.div>
                    <motion.div
                        className="bg-slate-50/70 p-6 rounded-xl border border-slate-200/70"
                        variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0 }
                        }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-purple-100 p-3 rounded-full">
                                <CheckCircle className="w-6 h-6 text-purple-600"/>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">{t('powerSchool.automateTitle')}</h3>
                        </div>
                        <p className="text-slate-500 mt-2">
                            {t('powerSchool.automateDescription')}
                        </p>
                    </motion.div>
                </motion.div>
                
            </motion.div>
        </div>
    );
}