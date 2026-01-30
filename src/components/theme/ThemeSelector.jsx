import React from 'react';
import { useTheme } from './ThemeContext';
import { Check, Sparkles } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ThemeSelector() {
  const { currentTheme, changeTheme, themes } = useTheme();

  return (
    <Select value={currentTheme} onValueChange={changeTheme}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select theme" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(themes).map(([themeKey, theme]) => (
          <SelectItem key={themeKey} value={themeKey}>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div 
                  className="w-3 h-3 rounded-full border border-slate-200"
                  style={{ backgroundColor: `rgb(${theme.colors.primary})` }}
                />
                <div 
                  className="w-3 h-3 rounded-full border border-slate-200"
                  style={{ backgroundColor: `rgb(${theme.colors.secondary})` }}
                />
              </div>
              <span>{theme.name}</span>
              {theme.recommended && (
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">Recommended</span>
              )}
              {theme.popular && (
                <Sparkles className="w-3 h-3 text-amber-500" />
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}