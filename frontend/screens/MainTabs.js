import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// Import your screens
import Atlas from '../screens/Atlas/Atlas';
import EchoStamp from '../screens/EchoStamp/EchoStamp';
import Home from '../screens/Home/Home';
import Insights from '../screens/Insight/Insights';
import Profile from '../screens/Profile/Profile';

const Tab = createBottomTabNavigator();

const MainTabs = () => {
  const { colors, isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.textMain,
        tabBarInactiveTintColor: isDark ? '#555' : '#AAA',
        tabBarStyle: {
          backgroundColor: isDark ? '#0a1929' : '#fff',
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 90 : 70,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
          position: 'absolute', 
          elevation: 0,
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={Home} 
        options={{ tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={24} color={color} /> }} 
      />
      
      <Tab.Screen 
        name="Atlas" 
        component={Atlas} 
        options={{ tabBarIcon: ({ color }) => <Ionicons name="map-outline" size={24} color={color} /> }} 
      />

      {/* NEW CENTER TAB: Echo Stamp */}
      <Tab.Screen 
        name="Echo" 
        component={EchoStamp} 
        options={{ 
          tabBarLabel: 'Stamp',
          tabBarIcon: ({ color }) => (
            
            <Ionicons name="finger-print" size={32} color={color} /> 
          ) 
        }} 
      />

      <Tab.Screen 
        name="Insights" 
        component={Insights} 
        options={{ tabBarIcon: ({ color }) => <Ionicons name="analytics-outline" size={24} color={color} /> }} 
      />
      
      <Tab.Screen 
        name="Profile" 
        component={Profile} 
        options={{ tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={24} color={color} /> }} 
      />
    </Tab.Navigator>
  );
};

export default MainTabs;
