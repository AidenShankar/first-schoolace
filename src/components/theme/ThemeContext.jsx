import React, { createContext, useContext, useState, useEffect } from 'react';
import { themes } from './themes';
import { User } from '@/entities/User';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children, user }) => {
  // Default to the first theme in our list (Default)
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
          --app-bg-from: ${currentTheme.colors['--app-bg-from']};
          --app-bg-via: ${currentTheme.colors['--app-bg-via']};
          --app-bg-to: ${currentTheme.colors['--app-bg-to']};
          
          --header-bg-from: ${currentTheme.colors['--header-bg-from']};
          --header-bg-via: ${currentTheme.colors['--header-bg-via']};
          --header-bg-to: ${currentTheme.colors['--header-bg-to']};
          
          --text-main: ${currentTheme.colors['--text-main']};
          --text-muted: ${currentTheme.colors['--text-muted']};
          
          /* ShadCN UI Overrides based on theme */
          --background: ${currentTheme.type === 'dark' ? '222.2 84% 4.9%' : '0 0% 100%'};
          --foreground: ${currentTheme.type === 'dark' ? '210 40% 98%' : '222.2 84% 4.9%'};
          
          --card: ${currentTheme.type === 'dark' ? '222.2 84% 4.9%' : '0 0% 100%'};
          --card-foreground: ${currentTheme.type === 'dark' ? '210 40% 98%' : '222.2 84% 4.9%'};
          
          --popover: ${currentTheme.type === 'dark' ? '222.2 84% 4.9%' : '0 0% 100%'};
          --popover-foreground: ${currentTheme.type === 'dark' ? '210 40% 98%' : '222.2 84% 4.9%'};
          
          --primary: ${currentTheme.colors['--primary']};
          --primary-foreground: ${currentTheme.colors['--primary-foreground']};
          
          --secondary: ${currentTheme.type === 'dark' ? '217.2 32.6% 17.5%' : '210 40% 96.1%'};
          --secondary-foreground: ${currentTheme.type === 'dark' ? '210 40% 98%' : '222.2 47.4% 11.2%'};
          
          --muted: ${currentTheme.type === 'dark' ? '217.2 32.6% 17.5%' : '210 40% 96.1%'};
          --muted-foreground: ${currentTheme.type === 'dark' ? '215 20.2% 65.1%' : '215.4 16.3% 46.9%'};
          
          --accent: ${currentTheme.type === 'dark' ? '217.2 32.6% 17.5%' : '210 40% 96.1%'};
          --accent-foreground: ${currentTheme.type === 'dark' ? '210 40% 98%' : '222.2 47.4% 11.2%'};
          
          --destructive: 0 84.2% 60.2%;
          --destructive-foreground: 210 40% 98%;
          
          --border: ${currentTheme.type === 'dark' ? '217.2 32.6% 17.5%' : '214.3 31.8% 91.4%'};
          --input: ${currentTheme.type === 'dark' ? '217.2 32.6% 17.5%' : '214.3 31.8% 91.4%'};
          --ring: ${currentTheme.colors['--primary']};
        }
        
        /* Apply global transitions for smooth theme switching */
        body, div, nav, button, input {
           transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
        }
      `}</style>
      {children}
    </ThemeContext.Provider>
  );
};