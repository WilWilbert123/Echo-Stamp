import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { StatusBar } from 'react-native';

const ThemeContext = createContext();

const lightColors = {
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

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);
  const [customColors, setCustomColors] = useState({
    primary: null,
    accent: null,
  });

  // --- 1. LOAD SAVED SETTINGS ON STARTUP ---
  useEffect(() => {
    const loadThemeSettings = async () => {
      try {
        const savedMode = await AsyncStorage.getItem('@user_is_dark');
        const savedPrimary = await AsyncStorage.getItem('@user_primary_color');
        const savedAccent = await AsyncStorage.getItem('@user_accent_color');

        if (savedMode !== null) {
          setIsDark(savedMode === 'true');
        }
        
        if (savedPrimary !== null || savedAccent !== null) {
          setCustomColors({
            primary: savedPrimary || null,
            accent: savedAccent || null,
          });
        }
      } catch (error) {
        console.error("Error loading theme settings:", error);
      }
    };

    loadThemeSettings();
  }, []);

  // --- 2. TOGGLE THEME & SAVE ---
  const toggleTheme = async (manualMode) => {
    let newMode;
    if (typeof manualMode === 'string') {
      newMode = manualMode === 'dark';
    } else {
      newMode = !isDark;
    }
    
    setIsDark(newMode);
    try {
      await AsyncStorage.setItem('@user_is_dark', JSON.stringify(newMode));
    } catch (e) {
      console.error("Failed to save theme mode");
    }
  };

  // --- 3. SET CUSTOM COLOR & SAVE ---
  const setCustomColor = async (key, value) => {
    setCustomColors(prev => ({ ...prev, [key]: value }));
    try {
      if (key === 'primary') {
        await AsyncStorage.setItem('@user_primary_color', value);
      } else if (key === 'accent') {
        await AsyncStorage.setItem('@user_accent_color', value);
      }
    } catch (e) {
      console.error("Failed to save custom color");
    }
  };

  const theme = useMemo(() => {
    const baseColors = isDark ? darkColors : lightColors;
    return {
      isDark,
      colors: {
        ...baseColors,
        primary: customColors.primary || baseColors.primary,
        accent: customColors.accent || baseColors.accent,
      },
      toggleTheme,
      setCustomColor,
    };
  }, [isDark, customColors]);

  return (
    <ThemeContext.Provider value={theme}>
      <StatusBar 
        barStyle={theme.colors.status} 
        translucent 
        backgroundColor="transparent" 
      />
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