
import React from 'react';
import { motion } from 'framer-motion';
import { Pin, PinOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ToolCard({ icon: Icon, title, description, isSelected, isPinned, hasBetaTag, onSelect, onPinToggle }) {
    return (
        <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full p-4 rounded-xl text-left transition-all duration-200 border-2 relative ${
                isSelected 
                ? 'bg-indigo-50 border-indigo-500 shadow-lg' 
                : 'bg-white border-transparent hover:bg-slate-50'
            }`}
        >
            <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                    e.stopPropagation();
                    onPinToggle();
                }}
                className={`absolute top-2 right-2 h-6 w-6 ${isPinned ? 'text-yellow-600 hover:text-yellow-700' : 'text-slate-400 hover:text-slate-600'}`}
            >
                {isPinned ? <Pin className="w-3 h-3" /> : <PinOff className="w-3 h-3" />}
            </Button>
            
            <button
                onClick={onSelect}
                className="w-full text-left"
            >
                <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${isSelected ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-indigo-600' : 'text-slate-600'}`} />
                    </div>
                    <div className="pr-8">
                        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                            {title}
                            {hasBetaTag && (
                                <Badge variant="outline" className="border-yellow-400 text-yellow-400 text-xs">Beta</Badge>
                            )}
                        </h3>
                        <p className="text-sm text-slate-600 mt-1">{description}</p>
                    </div>
                </div>
            </button>
        </motion.div>
    );
}
