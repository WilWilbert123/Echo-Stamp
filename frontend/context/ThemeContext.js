import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => setIsDark(!isDark);

  const theme = {
    isDark,
    colors: isDark ? darkColors : lightColors,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

const lightColors = {
  // Soft mint to sky blue gradient
  background: ['#ffffff', '#f3f4f6', '#ffffff'], 
  textMain: '#102A43',      
  textSecondary: '#010406',    
  cardText: '#6d859c',
  cardDesc: '#3e5569',
  primary: '#243B55',          
  glass: 'rgba(255, 255, 255, 0.5)', 
  glassBorder: 'rgba(255, 255, 255, 0.8)',
  status: 'dark-content'
  
};

const darkColors = {
  // Deep Navy to Charcoal (Adds depth)
  background: ['#000000', '#000000', '#010101'], 
  textMain: '#F8FAFC',         
  textSecondary: '#94A3B8',    
  cardText: '#F1F5F9',
  cardDesc: '#CBD5E1',
  primary: '#38BDF8',       
  glass: 'rgba(14, 21, 39, 0.6)', 
  glassBorder: 'rgba(255, 255, 255, 0.15)',
  status: 'light-content'
};
export const useTheme = () => useContext(ThemeContext);