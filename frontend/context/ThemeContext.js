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
  background: ['#E0F2F1', '#B3E5FC', '#81D4FA'],
  textMain: '#01579B',
  textSecondary: '#0277BD',
  cardText: '#012B4D',
  cardDesc: '#37474F',
  glass: 'rgba(255, 255, 255, 0.4)',
  glassBorder: 'rgba(255, 255, 255, 0.6)',
  status: 'dark-content'
};

const darkColors = {
  background: ['#012B4D', '#001529', '#000814'],
  textMain: '#81D4FA',
  textSecondary: '#B3E5FC',
  cardText: '#E0F2F1',
  cardDesc: '#B0BEC5',
  glass: 'rgba(0, 0, 0, 0.4)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
  status: 'light-content'
};

export const useTheme = () => useContext(ThemeContext);