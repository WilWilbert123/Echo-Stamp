import React from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from '../frontend/context/ThemeContext';
import HomeStackNavigator from '../frontend/navigation/navigation';
import { store } from '../frontend/redux/store';

const Index = () => {
  return (
    <ThemeProvider>
    <Provider store={store}>
      <HomeStackNavigator />
    </Provider>
    </ThemeProvider>
  );
};

export default Index;