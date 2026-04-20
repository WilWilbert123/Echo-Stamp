// frontend/src/navigation/MainTabs.js (updated)
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import React, { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import AIAgent from '../components/AIAgent';
import NotificationPopup from '../components/NotificationPopup'; // Import this
import { useTheme } from '../context/ThemeContext';
import { getGroupsList } from '../redux/groupSlice';
import { getConversationsList } from '../redux/messageSlice';
import { getNotificationsAsync } from '../redux/notificationSlice';

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
  const navigation = useNavigation();
  
  const { conversations } = useSelector((state) => state.messages);
  const { groups } = useSelector((state) => state.groups);
  const { unreadCount: notifCount } = useSelector((state) => state.notifications || { unreadCount: 0 });
  
  const chatBadge = (conversations?.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0) || 0) + (groups?.reduce((acc, g) => acc + (g.unreadCount || 0), 0) || 0);

  useEffect(() => {
    dispatch(getConversationsList());
    dispatch(getGroupsList());
    dispatch(getNotificationsAsync());

    // Start global polling for badges
    const pollInterval = setInterval(() => {
      dispatch(getConversationsList());
      dispatch(getGroupsList());
      dispatch(getNotificationsAsync());
    }, 10000); // Sync every 10 seconds

    return () => clearInterval(pollInterval);
  }, [dispatch]);

  // --- CALL LISTENER ---
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      const data = notification.request.content.data;
      if (data.type === 'CALL_INVITATION') {
        navigation.navigate('VideoCall', {
            recipient: { _id: data.senderId, firstName: data.senderName }, 
            roomId: data.roomId, 
            callType: data.callType, 
            isCaller: false 
        });
      }
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (data.type === 'CALL_INVITATION') {
        navigation.navigate('VideoCall', {
            recipient: { _id: data.senderId, firstName: data.senderName }, 
            roomId: data.roomId, 
            callType: data.callType, 
            isCaller: false 
        });
      } else if (data.journalId) {
        // Navigate to the Stamp (Journal) tab
        navigation.navigate('Echo', { 
            journalId: data.journalId,
            commentId: data.commentId,
            focusComment: data.focusComment 
        });
      } else if (data.echoId) {
        // Navigate to the Global Echo Feed (Home)
        navigation.navigate('Home', { 
            echoId: data.echoId,
            commentId: data.commentId,
            focusComment: data.focusComment 
        });
      }
    });

    return () => { subscription.remove(); responseSubscription.remove(); };
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: true,
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
            tabBarBadge: chatBadge > 0 ? chatBadge : null, 
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
          options={{ 
            tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={24} color={color} />,
            tabBarBadge: notifCount > 0 ? notifCount : null,
            tabBarBadgeStyle: {
              backgroundColor: colors.accent,
              color: '#000',
              fontSize: 10,
              lineHeight: 14
            }
          }} 
        />
      </Tab.Navigator>
      
      <NotificationPopup />  
      <AIAgent />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
});

export default MainTabs;