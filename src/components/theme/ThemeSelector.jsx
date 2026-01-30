import React, { useState } from 'react';
import { useTheme } from './ThemeContext';
import { Check, Search, Palette } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export default function ThemeSelector() {
  const { currentThemeId, changeTheme, themes } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredThemes = themes.filter(theme => 
    theme.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search theme..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 bg-slate-50 border-slate-200"
        />
      </div>

      <ScrollArea className="h-[300px] w-full rounded-md border border-slate-200 p-2">
        <div className="grid grid-cols-1 gap-1">
          {filteredThemes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => changeTheme(theme.id)}
              className={cn(
                "flex items-center justify-between w-full px-3 py-2.5 rounded-md text-sm transition-colors",
                currentThemeId === theme.id 
                  ? "bg-indigo-50 text-indigo-700 font-medium" 
                  : "hover:bg-slate-100 text-slate-700"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  {/* Color preview bubbles */}
                  <div 
                    className="w-4 h-4 rounded-full border shadow-sm"
                    style={{ backgroundColor: theme.colors['--primary'].includes('%') ? `hsl(${theme.colors['--primary']})` : theme.colors['--primary'] }} 
                  />
                  <div 
                    className="w-4 h-4 rounded-full border shadow-sm"
                    style={{ backgroundColor: theme.colors['--header-bg-from'] }} 
                  />
                  <div 
                    className="w-4 h-4 rounded-full border shadow-sm"
                    style={{ backgroundColor: theme.colors['--app-bg-from'] }} 
                  />
                </div>
                <span>{theme.name}</span>
              </div>
              
              {currentThemeId === theme.id && (
                <Check className="h-4 w-4 text-indigo-600" />
              )}
            </button>
          ))}
          
          {filteredThemes.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              No themes found matching "{searchQuery}"
            </div>
          )}
        </div>
      </ScrollArea>
      
      <div className="text-xs text-center text-slate-400 flex items-center justify-center gap-1">
        <Palette className="w-3 h-3" />
        <span>{themes.length} themes available</span>
      </div>
    </div>
  );
}