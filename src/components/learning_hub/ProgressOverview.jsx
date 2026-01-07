import React from 'react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { useTranslation } from '../i18n/useTranslation';

export default function ProgressOverview({ performanceData }) {
    const { t } = useTranslation();
    const strengthItems = [
        ...(performanceData?.assignments || []),
        ...(performanceData?.quizzes || [])
    ].filter(item => item.percentage >= 80)
     .sort((a,b) => b.percentage - a.percentage)
     .slice(0, 5);

    return (
        <motion.div 
            className="bg-white backdrop-blur-xl border border-slate-100 rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] flex flex-col h-full ml-10 w-[450px]"

        >
            <div className="mb-8">
                <h3 className="text-2xl font-semibold text-slate-900 tracking-tight mb-2">{t('personalizedLearning.yourStrengths')}</h3>
                <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
            </div>
            
            {strengthItems.length > 0 ? (
                <div className="space-y-4">
                    {strengthItems.map((item, index) => (
                        <motion.div 
                            key={index} 
                            className="group p-6 bg-gradient-to-br from-slate-50 to-white border border-slate-100 rounded-2xl hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.4 }}
                        >
                            <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-slate-900 text-lg leading-tight pr-4 group-hover:text-slate-700 transition-colors">
                                    {item.title}
                                </h4>
                                <Badge className="bg-gradient-to-r from-blue-400 to-purple-500 text-white border-0 font-semibold px-3 py-1 rounded-full shadow-md">
                                    {item.score_display}
                                </Badge>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 flex-grow flex flex-col justify-center">
                    <h4 className="text-xl font-semibold text-slate-900 mb-2">{t('personalizedLearning.buildingStrengths')}</h4>
                    <p className="text-slate-500 font-medium max-w-xs mx-auto">{t('personalizedLearning.completeAssignments')}</p>
                </div>
            )}
        </motion.div>
    );
}