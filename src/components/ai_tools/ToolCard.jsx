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
            className="w-full p-4 rounded-xl text-left transition-all duration-200 border-2 relative"
            style={{
                backgroundColor: isSelected ? `rgba(var(--color-primary), 0.1)` : `rgb(var(--color-surface))`,
                borderColor: isSelected ? `rgb(var(--color-primary))` : 'transparent',
                boxShadow: isSelected ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' : 'none'
            }}
            onMouseEnter={(e) => {
                if (!isSelected) {
                    e.currentTarget.style.backgroundColor = `rgba(var(--color-border), 0.3)`;
                }
            }}
            onMouseLeave={(e) => {
                if (!isSelected) {
                    e.currentTarget.style.backgroundColor = `rgb(var(--color-surface))`;
                }
            }}
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
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: isSelected ? `rgba(var(--color-primary), 0.2)` : `rgba(var(--color-border), 0.5)` }}>
                        <Icon className="w-5 h-5" style={{ color: isSelected ? `rgb(var(--color-primary))` : `rgb(var(--color-textSecondary))` }} />
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