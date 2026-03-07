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
  textMain: '#0F172A',         // Deep Slate
  textSecondary: '#64748B',    // Muted Blue-Grey
  cardText: '#1E293B',
  cardDesc: '#475569',
  primary: '#4F46E5',          // Indigo 600
  accent: '#F59E0B',           // Warm Amber
  glass: 'rgba(255, 255, 255, 0.75)', 
  glassBorder: 'rgba(0, 0, 0, 0.05)',
  shadow: '#64748B',
  status: 'dark-content'
};

const darkColors = {
  // Midnight Slate Palette (Better than pure black for depth)
  background: ['#0F172A', '#1E293B', '#0F172A'], 
  textMain: '#F8FAFC',         // Ghost White
  textSecondary: '#94A3B8',    // Slate 400
  cardText: '#F1F5F9',
  cardDesc: '#CBD5E1',
  primary: '#6366F1',          // Indigo 500 (Vibrant)
  accent: '#FACC15',           // Bright Yellow
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