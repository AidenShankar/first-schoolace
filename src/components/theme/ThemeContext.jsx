import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const themes = {
  default: {
    name: 'Default',
    recommended: true,
    colors: {
      primary: '99 102 241', // indigo-500
      primaryHover: '79 70 229', // indigo-600
      secondary: '168 85 247', // purple-500
      background: '248 250 252', // slate-50
      surface: '255 255 255', // white
      text: '15 23 42', // slate-900
      textSecondary: '71 85 105', // slate-600
      border: '226 232 240', // slate-200
      accent: '59 130 246', // blue-500
      accentLight: '219 234 254', // blue-100
    }
  },
  cherry: {
    name: 'Cherry Blossom',
    colors: {
      primary: '244 114 182', // pink-400
      primaryHover: '236 72 153', // pink-500
      secondary: '251 207 232', // pink-200
      background: '253 242 248', // pink-50
      surface: '255 255 255', // white
      text: '131 24 67', // pink-900
      textSecondary: '157 23 77', // pink-800
      border: '251 207 232', // pink-200
      accent: '219 39 119', // pink-600
      accentLight: '252 231 243', // pink-100
    }
  },
  nord: {
    name: 'Nord',
    colors: {
      primary: '136 192 208', // #88c0d0
      primaryHover: '129 161 193', // #81a1c1
      secondary: '143 188 187', // #8fbcbb
      background: '229 233 240', // #e5e9f0 - darker
      surface: '255 255 255', // #ffffff
      text: '46 52 64', // #2e3440
      textSecondary: '76 86 106', // #4c566a
      border: '216 222 233', // #d8dee9
      accent: '94 129 172', // #5e81ac
      accentLight: '229 233 240', // #e5e9f0
    }
  },
   dark: {
    name: 'Dark Mode',
    colors: {
      primary: '129 140 248', // indigo-400
      primaryHover: '165 180 252', // indigo-300
      secondary: '192 132 252', // purple-400
      background: '15 23 42', // slate-900
      surface: '30 41 59', // slate-800
      text: '248 250 252', // slate-50
      textSecondary: '203 213 225', // slate-300
      border: '51 65 85', // slate-700
      accent: '96 165 250', // blue-400
      accentLight: '30 64 175', // blue-800
    }
  }
};

export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState('default');

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('schoolace-theme');
    if (savedTheme && themes[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    // Apply theme to document
    const theme = themes[currentTheme];
    const root = document.documentElement;
    
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Sync shadcn --primary variable so Button and other shadcn components
    // use the correct theme color instead of defaulting to white.
    const primaryRgb = theme.colors.primary; // e.g. "99 102 241"
    const [r, g, b] = primaryRgb.split(' ').map(Number);
    // Convert RGB to HSL for shadcn's hsl(var(--primary)) format
    const rn = r / 255, gn = g / 255, bn = b / 255;
    const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
    const l = (max + min) / 2;
    let h = 0, s = 0;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6; break;
        case gn: h = ((bn - rn) / d + 2) / 6; break;
        case bn: h = ((rn - gn) / d + 4) / 6; break;
      }
    }
    const hDeg = Math.round(h * 360);
    const sPct = Math.round(s * 100);
    const lPct = Math.round(l * 100);
    root.style.setProperty('--primary', `${hDeg} ${sPct}% ${lPct}%`);
    root.style.setProperty('--primary-foreground', '0 0% 100%');

    // Save to localStorage
    localStorage.setItem('schoolace-theme', currentTheme);
  }, [currentTheme]);

  const changeTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, changeTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}