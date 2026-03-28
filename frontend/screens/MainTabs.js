import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../context/ThemeContext';
import { getConversationsList } from '../redux/messageSlice';

// Import your screens
import Atlas from '../screens/Atlas/Atlas';
import Messages from '../screens/Chat/Messages';
import EchoStamp from '../screens/EchoStamp/EchoStamp';
import Home from '../screens/Home/Home';
import Insights from '../screens/Insight/Insights';
import Profile from '../screens/Profile/Profile';
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  const { colors, isDark } = useTheme();
  const dispatch = useDispatch();
  
  // Get conversations from Redux
  const { conversations } = useSelector((state) => state.messages);
  
  // Sum up all unread messages across all conversations
  const badgeCount = conversations?.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0) || 0;

  useEffect(() => {
    // Fetch conversations on mount to update the badge
    dispatch(getConversationsList());
  }, [dispatch]);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.textMain,
        tabBarInactiveTintColor: isDark ? '#555' : '#AAA',
        tabBarStyle: {
          backgroundColor: isDark ? '#0a1929' : '#fff',
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 70 : 70,
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
        name="Messages" 
        component={Messages} 
        options={{ 
          tabBarLabel: 'Chat',
          tabBarIcon: ({ color }) => <Ionicons name="chatbubbles" size={22} color={color} />,
          tabBarBadge: badgeCount > 0 ? badgeCount : null, 
          tabBarBadgeStyle: { 
            backgroundColor: colors.accent, 
            color: '#000', 
            fontSize: 10,
            lineHeight: 14
          }
        }} 
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
