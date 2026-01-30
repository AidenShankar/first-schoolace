import React from 'react';
import { useTheme } from './ThemeContext';
import { Check } from 'lucide-react';

export default function ThemeSelector() {
  const { currentTheme, changeTheme, themes } = useTheme();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(themes).map(([themeKey, theme]) => {
          const isActive = currentTheme === themeKey;
          return (
            <button
              key={themeKey}
              onClick={() => changeTheme(themeKey)}
              className={`
                relative p-4 rounded-lg border-2 transition-all duration-200
                ${isActive ? 'border-indigo-600 shadow-md' : 'border-slate-200 hover:border-slate-300'}
              `}
            >
              {isActive && (
                <div className="absolute top-2 right-2">
                  <Check className="w-4 h-4 text-indigo-600" />
                </div>
              )}
              <div className="flex items-center gap-3 mb-2">
                <div className="flex gap-1">
                  <div 
                    className="w-5 h-5 rounded-full border border-slate-200"
                    style={{ backgroundColor: `rgb(${theme.colors.primary})` }}
                  />
                  <div 
                    className="w-5 h-5 rounded-full border border-slate-200"
                    style={{ backgroundColor: `rgb(${theme.colors.secondary})` }}
                  />
                  <div 
                    className="w-5 h-5 rounded-full border border-slate-200"
                    style={{ backgroundColor: `rgb(${theme.colors.accent})` }}
                  />
                </div>
              </div>
              <p className="text-sm font-medium text-slate-900 text-left">
                {theme.name}
              </p>
              <div 
                className="mt-2 h-8 rounded border"
                style={{ 
                  backgroundColor: `rgb(${theme.colors.background})`,
                  borderColor: `rgb(${theme.colors.border})`
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}