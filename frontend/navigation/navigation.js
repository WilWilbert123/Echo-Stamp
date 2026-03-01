import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from 'react';
import CreateEcho from "../screens/CreateEcho";
import MainTabs from "../screens/MainTabs";

const Stack = createNativeStackNavigator();

const HomeStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Remove the 'v' that was right here! */}
      <Stack.Screen name="MainTabsRoot" component={MainTabs} />
      
      <Stack.Screen 
        name="Create" 
        component={CreateEcho} 
        options={{ 
          animation: 'slide_from_bottom',
          presentation: 'modal' 
        }} 
      /> 
    </Stack.Navigator>
  );
};
export default HomeStackNavigator;