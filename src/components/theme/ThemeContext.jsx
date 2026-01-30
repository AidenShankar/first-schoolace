import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const themes = {
  default: {
    name: 'Default',
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
  nord: {
    name: 'Nord',
    popular: true,
    colors: {
      primary: '136 192 208', // #88c0d0
      primaryHover: '129 161 193', // #81a1c1
      secondary: '143 188 187', // #8fbcbb
      background: '216 222 233', // #d8dee9 - darker
      surface: '255 255 255', // #ffffff
      text: '46 52 64', // #2e3440
      textSecondary: '76 86 106', // #4c566a
      border: '216 222 233', // #d8dee9
      accent: '94 129 172', // #5e81ac
      accentLight: '229 233 240', // #e5e9f0
    }
  },
  gruvbox: {
    name: 'Gruvbox',
    colors: {
      primary: '215 153 33', // #d79921
      primaryHover: '254 128 25', // #fe8019
      secondary: '184 187 38', // #b8bb26
      background: '251 241 199', // #fbf1c7
      surface: '242 229 188', // #f2e5bc
      text: '60 56 54', // #3c3836
      textSecondary: '102 92 84', // #665c54
      border: '213 196 161', // #d5c4a1
      accent: '152 151 26', // #98971a
      accentLight: '235 219 178', // #ebdbb2
    }
  },
  ocean: {
    name: 'Ocean',
    colors: {
      primary: '14 165 233', // sky-500
      primaryHover: '2 132 199', // sky-600
      secondary: '6 182 212', // cyan-500
      background: '224 242 254', // sky-100
      surface: '255 255 255', // white
      text: '12 74 110', // sky-900
      textSecondary: '7 89 133', // sky-800
      border: '186 230 253', // sky-200
      accent: '20 184 166', // teal-500
      accentLight: '204 251 241', // teal-100
    }
  },
  forest: {
    name: 'Forest',
    colors: {
      primary: '34 197 94', // green-500
      primaryHover: '22 163 74', // green-600
      secondary: '132 204 22', // lime-500
      background: '240 253 244', // green-50
      surface: '255 255 255', // white
      text: '20 83 45', // green-900
      textSecondary: '22 101 52', // green-800
      border: '187 247 208', // green-200
      accent: '16 185 129', // emerald-500
      accentLight: '209 250 229', // emerald-100
    }
  },
  sunset: {
    name: 'Sunset',
    colors: {
      primary: '249 115 22', // orange-500
      primaryHover: '234 88 12', // orange-600
      secondary: '236 72 153', // pink-500
      background: '255 247 237', // orange-50
      surface: '255 255 255', // white
      text: '124 45 18', // orange-900
      textSecondary: '154 52 18', // orange-800
      border: '254 215 170', // orange-200
      accent: '251 146 60', // orange-400
      accentLight: '254 243 199', // orange-100
    }
  },
  cherry: {
    name: 'Cherry Blossom',
    popular: true,
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
  minimal: {
    name: 'Minimal',
    colors: {
      primary: '0 0 0', // black
      primaryHover: '31 41 55', // gray-800
      secondary: '75 85 99', // gray-600
      background: '255 255 255', // white
      surface: '249 250 251', // gray-50
      text: '0 0 0', // black
      textSecondary: '107 114 128', // gray-500
      border: '229 231 235', // gray-200
      accent: '17 24 39', // gray-900
      accentLight: '243 244 246', // gray-100
    }
  },
  retro: {
    name: 'Retro',
    colors: {
      primary: '251 191 36', // amber-400
      primaryHover: '245 158 11', // amber-500
      secondary: '234 179 8', // yellow-500
      background: '254 252 232', // yellow-50
      surface: '255 255 255', // white
      text: '120 53 15', // amber-900
      textSecondary: '146 64 14', // amber-800
      border: '253 230 138', // amber-200
      accent: '217 119 6', // amber-600
      accentLight: '254 243 199', // amber-100
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