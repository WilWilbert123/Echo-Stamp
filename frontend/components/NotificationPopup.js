// frontend/src/components/NotificationPopup.js
import React, { useEffect, useRef, useState } from 'react'
import { Animated, Dimensions, PanResponder, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { useTheme } from '../context/ThemeContext'
import { getNotificationsAsync } from '../redux/notificationSlice'
import * as api from '../services/api'

const { width: screenWidth } = Dimensions.get('window')
const SWIPE_THRESHOLD = -80 // Swipe left threshold to dismiss

const NotificationPopup = () => {
  const [visible, setVisible] = useState(false)
  const [currentNotification, setCurrentNotification] = useState(null)
  const { list } = useSelector((state) => state.notifications)
  const dispatch = useDispatch()
  const { colors, isDark } = useTheme()
  
  // Keep track of shown notifications
  const [shownNotifications, setShownNotifications] = useState(new Set())
  
  // Animation values
  const slideInAnim = useRef(new Animated.Value(screenWidth)).current // Start from right
  const fadeAnim = useRef(new Animated.Value(0)).current
  const swipeAnim = useRef(new Animated.Value(0)).current
  const timeoutRef = useRef(null)

  // PanResponder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow left swipe (negative dx) - move left
        if (gestureState.dx < 0) {
          swipeAnim.setValue(gestureState.dx)
        } else if (gestureState.dx > 0) {
          // Optional: Allow slight right swipe but resist
          swipeAnim.setValue(gestureState.dx * 0.3)
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < SWIPE_THRESHOLD) {
          // Swipe left threshold reached - dismiss
          dismissNotification()
        } else {
          // Reset position - animate back to 0
          Animated.spring(swipeAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 40,
            friction: 7,
          }).start()
        }
      },
    })
  ).current

  useEffect(() => {
    // Fetch notifications
    dispatch(getNotificationsAsync())
    
    // Poll for new notifications every 5 seconds
    const interval = setInterval(() => {
      dispatch(getNotificationsAsync())
    }, 5000)
    
    return () => {
      clearInterval(interval)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [dispatch])

  useEffect(() => {
    // Check for new unread notifications
    const newUnreadNotifications = list.filter(
      n => !n.isRead && !shownNotifications.has(n._id)
    )
    
    if (newUnreadNotifications.length > 0 && !visible) {
      // Show the latest notification
      const latest = newUnreadNotifications[0]
      setCurrentNotification(latest)
      setShownNotifications(prev => new Set(prev).add(latest._id))
      showNotification()
      
      // Try to mark as read
      markAsRead(latest._id).catch(err => {
        console.log('Mark as read endpoint not available yet:', err.message)
      })
    }
  }, [list])

  const markAsRead = async (notificationId) => {
    try {
      await api.markNotificationRead(notificationId)
      dispatch(getNotificationsAsync())
    } catch (error) {
      console.log('Could not mark notification as read')
    }
  }

  const showNotification = () => {
    setVisible(true)
    swipeAnim.setValue(0) // Reset swipe position
    
    // Slide in animation from right
    Animated.parallel([
      Animated.timing(slideInAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start()
    
    // Auto-hide after 5 seconds
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      dismissNotification()
    }, 5000)
  }

  const dismissNotification = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    
    // Slide out animation - move to LEFT side
    Animated.parallel([
      Animated.timing(slideInAnim, {
        toValue: -screenWidth, // Move to left
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      setVisible(false)
      setCurrentNotification(null)
      swipeAnim.setValue(0)
    })
  }

  const handlePress = () => {
    // You can add navigation logic here based on notification type
    dismissNotification()
  }

  const getNotificationTitle = (notification) => {
    switch (notification.type) {
      case 'message':
        return 'New Message'
      case 'like':
        return 'New Like'
      case 'comment':
        return 'New Comment'
      case 'follow':
        return 'New Follower'
      default:
        return 'Notification'
    }
  }

  const getNotificationMessage = (notification) => {
    switch (notification.type) {
      case 'message':
        return `${notification.sender?.username || 'Someone'} sent you a message`
      case 'like':
        return `${notification.sender?.username || 'Someone'} liked your ${notification.journalId?.title || 'post'}`
      case 'comment':
        return `${notification.sender?.username || 'Someone'} commented on your post`
      case 'follow':
        return `${notification.sender?.username || 'Someone'} started following you`
      default:
        return notification.message || 'You have a new notification'
    }
  }

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  // Transform for swipe gesture - moves left when swiping left
  const swipeTransform = swipeAnim.interpolate({
    inputRange: [-200, 0, 100],
    outputRange: [-200, 0, 30],
    extrapolate: 'clamp',
  })

  // Combine entrance animation and swipe animation
  const combinedTransform = Animated.add(slideInAnim, swipeTransform)

  // Opacity for swipe hint
  const swipeHintOpacity = swipeAnim.interpolate({
    inputRange: [-80, -40, 0],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  })

  if (!visible || !currentNotification) return null

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          transform: [{ translateX: combinedTransform }],
          opacity: fadeAnim,
        }
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity 
        style={[styles.touchable, { shadowColor: colors.shadow }]}
        activeOpacity={0.95}
        onPress={handlePress}
      >
        <View style={[
          styles.content, 
          { 
            backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            borderLeftColor: colors.primary,
          }
        ]}>
          {/* Swipe hint indicator */}
          <Animated.View 
            style={[
              styles.swipeHint,
              {
                opacity: swipeHintOpacity,
                backgroundColor: colors.primary,
              }
            ]}
          >
            <Text style={styles.swipeHintText}>←</Text>
          </Animated.View>

          <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}15` }]}>
            <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
              <Text style={styles.iconText}>
                {currentNotification.type === 'message' && '💬'}
                {currentNotification.type === 'like' && '❤️'}
                {currentNotification.type === 'comment' && '💭'}
                {currentNotification.type === 'follow' && '👥'}
              </Text>
            </View>
          </View>
          
          <View style={styles.messageContainer}>
            <Text style={[styles.title, { color: colors.textMain }]}>
              {getNotificationTitle(currentNotification)}
            </Text>
            <Text style={[styles.message, { color: colors.textSecondary }]} numberOfLines={2}>
              {getNotificationMessage(currentNotification)}
            </Text>
            <Text style={[styles.time, { color: colors.cardDesc }]}>
              {getTimeAgo(currentNotification.createdAt)}
            </Text>
          </View>

          {/* Swipe instruction text */}
          <Animated.Text 
            style={[
              styles.swipeInstruction,
              {
                opacity: swipeHintOpacity,
                color: colors.primary,
              }
            ]}
          >
            Swipe to dismiss
          </Animated.Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  )
}

export default NotificationPopup

const styles = StyleSheet.create({
 container: { position: 'absolute', top: 50, right: 12, left: 12, zIndex: 9999, elevation: 10 },
touchable: { width: 'auto', minHeight: 70, maxWidth: screenWidth - 24, alignSelf: 'flex-end', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
content: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, minHeight: 70, width: '100%', position: 'relative', borderLeftWidth: 4, borderLeftColor: '#4F46E5', overflow: 'hidden' },
swipeHint: { position: 'absolute', right: 8, top: '50%', marginTop: -12, width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
swipeHintText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
swipeInstruction: { position: 'absolute', right: 40, top: '50%', marginTop: -8, fontSize: 10, fontWeight: '500', zIndex: 2 },
iconContainer: { marginRight: 12, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
iconCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
iconText: { fontSize: 18 },
messageContainer: { flex: 1, paddingRight: 8 },
title: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
message: { fontSize: 12, fontWeight: '500', lineHeight: 16, marginBottom: 2 },
time: { fontSize: 10, fontWeight: '400' },
})