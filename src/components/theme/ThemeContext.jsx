import React, { createContext, useContext, useState, useEffect } from 'react';
import { themes } from './themes';
import { User } from '@/entities/User';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children, user }) => {
  // Default to the first theme in our list
  const [currentThemeId, setCurrentThemeId] = useState('default');
  
  // Initialize theme from user data or local storage
  useEffect(() => {
    // 1. Try to get from user data if available
    if (user?.data?.theme && themes.find(t => t.id === user.data.theme)) {
      setCurrentThemeId(user.data.theme);
    } 
    // 2. Fallback to localStorage
    else {
      const savedTheme = localStorage.getItem('schoolace_theme');
      if (savedTheme && themes.find(t => t.id === savedTheme)) {
        setCurrentThemeId(savedTheme);
      }
    }
  }, [user]);

  const changeTheme = async (themeId) => {
    if (!themes.find(t => t.id === themeId)) return;
    
    setCurrentThemeId(themeId);
    localStorage.setItem('schoolace_theme', themeId);
    
    // If logged in, save to user preference
    if (user) {
      try {
        await User.updateMyUserData({ theme: themeId });
      } catch (e) {
        console.error("Failed to save theme preference:", e);
      }
    }
  };

  const currentTheme = themes.find(t => t.id === currentThemeId) || themes[0];

  return (
    <ThemeContext.Provider value={{ currentTheme, currentThemeId, changeTheme, themes }}>
      {/* Inject CSS Variables */}
      <style>{`
        :root {
          /* Core App Backgrounds & Text */
          --app-bg-from: ${currentTheme.colors['--app-bg-from']};
          --app-bg-via: ${currentTheme.colors['--app-bg-via']};
          --app-bg-to: ${currentTheme.colors['--app-bg-to']};
          
          --header-bg-from: ${currentTheme.colors['--header-bg-from']};
          --header-bg-via: ${currentTheme.colors['--header-bg-via']};
          --header-bg-to: ${currentTheme.colors['--header-bg-to']};
          --text-main-header: ${currentTheme.colors['--text-main-header'] || '#ffffff'};
          
          --text-main: ${currentTheme.colors['--text-main']};
          --text-muted: ${currentTheme.colors['--text-muted']};
          
          /* ShadCN UI Variables (HSL) */
          --background: ${currentTheme.colors['--background']};
          --foreground: ${currentTheme.colors['--foreground']};
          
          --card: ${currentTheme.colors['--card']};
          --card-foreground: ${currentTheme.colors['--card-foreground']};
          
          --popover: ${currentTheme.colors['--popover']};
          --popover-foreground: ${currentTheme.colors['--popover-foreground']};
          
          --primary: ${currentTheme.colors['--primary']};
          --primary-foreground: ${currentTheme.colors['--primary-foreground']};
          
          --secondary: ${currentTheme.colors['--secondary']};
          --secondary-foreground: ${currentTheme.colors['--secondary-foreground']};
          
          --muted: ${currentTheme.colors['--muted']};
          --muted-foreground: ${currentTheme.colors['--muted-foreground']};
          
          --accent: ${currentTheme.colors['--accent']};
          --accent-foreground: ${currentTheme.colors['--accent-foreground']};
          
          --destructive: ${currentTheme.colors['--destructive']};
          --destructive-foreground: ${currentTheme.colors['--destructive-foreground']};
          
          --border: ${currentTheme.colors['--border']};
          --input: ${currentTheme.colors['--input']};
          --ring: ${currentTheme.colors['--ring']};
          
          --radius: ${currentTheme.colors['--radius'] || '0.5rem'};
        }
        
        /* Global override for transition */
        * {
           transition-property: background-color, border-color, color, fill, stroke;
           transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
           transition-duration: 300ms;
        }
      `}</style>
      {children}
    </ThemeContext.Provider>
  );
};