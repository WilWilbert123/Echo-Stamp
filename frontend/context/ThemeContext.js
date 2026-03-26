import React, { createContext, useContext, useMemo, useState } from 'react';
import { StatusBar } from 'react-native';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true); // Default to Dark for that "Premium" look

  const toggleTheme = () => setIsDark(!isDark);

  // useMemo ensures we don't recalculate the theme object unless isDark changes
  const theme = useMemo(() => ({
    isDark,
    colors: isDark ? darkColors : lightColors,
    toggleTheme,
  }), [isDark]);

  return (
    <ThemeContext.Provider value={theme}>
      {/* This ensures the top status bar icons match your theme automatically */}
      <StatusBar barStyle={theme.colors.status} translucent backgroundColor="transparent" />
      {children}
    </ThemeContext.Provider>
  );
};

const lightColors = {
  // Soft Arctic Palette
  background: ['#F8FAFC', '#F1F5F9', '#E2E8F0'], 
  textMain: '#0F172A',         
  textSecondary: '#000204',     
  cardText: '#1E293B',
  cardDesc: '#475569',
  primary: '#4F46E5',         
  accent: '#F59E0B',          
  glass: 'rgba(255, 255, 255, 0.75)', 
  glassBorder: 'rgba(0, 0, 0, 0.05)',
  shadow: '#64748B',
  status: 'dark-content'
};

const darkColors = {
  
  background: ['#0F172A', '#1E293B', '#0F172A'], 
  textMain: '#F8FAFC',         
  textSecondary: '#ffffff',    
  cardText: '#F1F5F9',
  cardDesc: '#CBD5E1',
  primary: '#6366F1',          
  accent: '#FACC15',           
  glass: 'rgba(30, 41, 59, 0.7)', 
  glassBorder: 'rgba(255, 255, 255, 0.12)',
  shadow: '#000000',
  status: 'light-content'
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};