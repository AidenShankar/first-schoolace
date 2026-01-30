import React, { createContext, useContext, useState, useEffect } from 'react';
import { themes, getTheme } from './themes';
import { User } from '@/entities/User';

const ThemeContext = createContext();

export const ThemeProvider = ({ children, user }) => {
  const [currentThemeId, setCurrentThemeId] = useState('default');

  useEffect(() => {
    if (user?.theme) {
      setCurrentThemeId(user.theme);
    }
  }, [user]);

  const setTheme = async (themeId) => {
    setCurrentThemeId(themeId);
    if (user) {
        try {
            await User.updateMyUserData({ theme: themeId });
        } catch (error) {
            console.error("Failed to persist theme preference:", error);
        }
    }
  };

  const currentTheme = getTheme(currentThemeId);

  // Inject CSS variables
  useEffect(() => {
    const root = document.documentElement;
    const colors = currentTheme.colors;

    root.style.setProperty('--bg-main', colors.background);
    root.style.setProperty('--bg-card', colors.card);
    root.style.setProperty('--text-main', colors.text);
    root.style.setProperty('--text-muted', colors.textMuted);
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--primary-foreground', colors.primaryForeground);
    root.style.setProperty('--secondary', colors.secondary);
    root.style.setProperty('--accent', colors.accent);
    root.style.setProperty('--border', colors.border);
    root.style.setProperty('--header-bg', colors.headerBg);

  }, [currentTheme]);

  return (
    <ThemeContext.Provider value={{ currentTheme, currentThemeId, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};