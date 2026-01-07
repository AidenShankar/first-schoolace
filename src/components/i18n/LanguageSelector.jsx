import React from 'react';
import { useLanguage, LANGUAGES } from './LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export default function LanguageSelector() {
  const { language, setLanguage, languageInfo } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="h-9 w-12 rounded-full text-indigo-600 border-white/20 hover:bg-white/10 hover:text-white"
        >
          {languageInfo.code}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 bg-white shadow-lg border border-slate-200 rounded-xl p-1">
        {Object.entries(LANGUAGES).map(([key, lang]) => (
          <DropdownMenuItem
            key={key}
            onClick={() => setLanguage(key)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer ${
              language === key 
                ? 'bg-slate-100 font-semibold text-slate-900' 
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span className="font-semibold w-6">{lang.code}</span>
            <span>{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}