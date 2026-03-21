import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import NoInternet from '../frontend/components/NoInternet';
import { ThemeProvider } from '../frontend/context/ThemeContext';
import HomeStackNavigator from '../frontend/navigation/navigation';
import { store } from '../frontend/redux/store';

const Index = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <ThemeProvider>
    
          <NavigationIndependentTree>
            <NavigationContainer>
              <HomeStackNavigator />
            </NavigationContainer>
          </NavigationIndependentTree>
          <NoInternet />
        </ThemeProvider>
      </Provider>
    </GestureHandlerRootView>
  );
};

export default Index;