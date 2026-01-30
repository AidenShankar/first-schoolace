import React, { useState } from 'react';
import { useTheme } from './ThemeContext';
import { Check, Search, Palette } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

export default function ThemeSelector() {
  const { currentThemeId, setTheme, themes } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredThemes = themes.filter(theme => 
    theme.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full space-y-4">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
                placeholder="Search themes..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
            />
        </div>
        
        <ScrollArea className="h-[300px] rounded-md border p-2">
            <div className="grid grid-cols-1 gap-2">
                {filteredThemes.map((theme) => (
                    <button
                        key={theme.id}
                        onClick={() => setTheme(theme.id)}
                        className={`
                            flex items-center justify-between p-3 rounded-lg border transition-all
                            ${currentThemeId === theme.id 
                                ? 'bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)]' 
                                : 'bg-[var(--bg-card)] hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--text-main)] border-[var(--border)]'
                            }
                        `}
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex gap-1">
                                <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: theme.colors.background }} />
                                <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: theme.colors.primary }} />
                                <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: theme.colors.text }} />
                            </div>
                            <span className="font-medium">{theme.name}</span>
                        </div>
                        {currentThemeId === theme.id && <Check className="w-4 h-4" />}
                    </button>
                ))}
            </div>
        </ScrollArea>
        
        <div className="flex justify-end">
            <p className="text-xs text-[var(--text-muted)]">
                Selected: <span className="font-semibold">{themes.find(t => t.id === currentThemeId)?.name}</span>
            </p>
        </div>
    </div>
  );
}