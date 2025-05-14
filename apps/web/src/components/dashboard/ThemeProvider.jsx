import React, { createContext, useContext, useEffect, useState } from 'react';
import colorSchemaConfig from '../../../configs/color-schema/config.json';

// Create a context for theme management
const ThemeContext = createContext();

/**
 * ThemeProvider Component
 * 
 * Provides theme context for all dashboard components with
 * integration to the agentland.saarland color schema system
 */
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Initialize from config
    const { themes, userPreferences } = colorSchemaConfig;
    const activeThemeName = userPreferences.activeTheme || 'light';
    return {
      name: activeThemeName,
      ...themes[activeThemeName]
    };
  });
  
  // Apply theme to document root as CSS variables
  useEffect(() => {
    if (!theme || !theme.colors) return;
    
    const colors = theme.colors;
    const root = document.documentElement;
    
    // Primary colors
    root.style.setProperty('--primary-color', colors.primary);
    root.style.setProperty('--secondary-color', colors.secondary);
    root.style.setProperty('--accent-color', colors.accent);
    
    // Status colors
    root.style.setProperty('--success-color', colors.success);
    root.style.setProperty('--warning-color', colors.warning);
    root.style.setProperty('--danger-color', colors.danger);
    root.style.setProperty('--info-color', colors.info || '#2196f3');
    
    // Neutral colors
    root.style.setProperty('--background-color', colors.background);
    root.style.setProperty('--surface-color', colors.surface);
    root.style.setProperty('--text-color', colors.text);
    root.style.setProperty('--text-secondary-color', colors.textSecondary);
    root.style.setProperty('--border-color', colors.border);
    root.style.setProperty('--shadow-color', colors.shadow);
    
    // Apply theme class to body
    document.body.className = document.body.className
      .replace(/theme-\w+/g, '')
      .trim();
    document.body.classList.add(`theme-${theme.name}`);
    
  }, [theme]);
  
  // Change the active theme
  const changeTheme = (themeName) => {
    const { themes } = colorSchemaConfig;
    if (themes[themeName]) {
      setTheme({
        name: themeName,
        ...themes[themeName]
      });
      
      // Save preference to localStorage
      localStorage.setItem('claude_theme_preference', themeName);
      
      // In a real implementation, this would also call an API
      // Example: 
      // fetch('/api/user/set-theme', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ theme: themeName })
      // });
    }
  };
  
  // Toggle between light and dark themes
  const toggleTheme = () => {
    const newTheme = theme.name === 'dark' ? 'light' : 'dark';
    changeTheme(newTheme);
  };
  
  // Check if the current theme is dark
  const isDarkTheme = () => {
    return theme.name === 'dark' || theme.name === 'blue';
  };
  
  // Get a specific color from the theme
  const getColor = (colorName) => {
    return theme.colors?.[colorName] || '';
  };
  
  // Helper to get contrast text color for a background
  const getContrastText = (backgroundColor) => {
    // Convert hex to RGB
    const hexToRgb = (hex) => {
      const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      const formattedHex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
      
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(formattedHex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };
    
    // Calculate relative luminance
    const calculateLuminance = (rgb) => {
      const a = [rgb.r, rgb.g, rgb.b].map(v => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    };
    
    const rgb = hexToRgb(backgroundColor);
    if (!rgb) return '#000000';
    
    const luminance = calculateLuminance(rgb);
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };
  
  return (
    <ThemeContext.Provider 
      value={{ 
        theme,
        changeTheme,
        toggleTheme,
        isDarkTheme,
        getColor,
        getContrastText
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeProvider;