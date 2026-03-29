import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Image, LayoutAnimation, Text, TouchableOpacity, View } from 'react-native';
import { useSelector } from 'react-redux';
import { useTheme } from '../../../../../context/ThemeContext';
import { getStyles } from '../Events.style';
import { getEventImage } from '../utils/Events.utils';

const EventCard = ({ item, onJoin, onDelete }) => {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const navigation = useNavigation();
  const { user } = useSelector(state => state.auth);
  const [showAttendees, setShowAttendees] = useState(false);

  const isHost = (item.hostId?._id || item.hostId) === (user?.id || user?._id);
  const isJoined = item.attendees?.some(a => (a._id || a) === (user?.id || user?._id));

  const toggleAttendees = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowAttendees(!showAttendees);
  };

  return (
    <View style={styles.eventCard}>
      <Image 
        source={{ uri: getEventImage(item.coords) }} 
        style={styles.eventImage}
        resizeMode="cover"
      />
      <View style={styles.eventDetails}>
        <View style={styles.row}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category || 'Event'}</Text>
          </View>
          <TouchableOpacity onPress={toggleAttendees}>
            <Text style={{color: colors.primary, fontSize: 12, marginLeft: 8, fontWeight: '700'}}>
              • {item.attendees?.length || 0} attending <Ionicons name={showAttendees ? "chevron-up" : "chevron-down"} />
            </Text>
          </TouchableOpacity>
        </View>

        {showAttendees && (
          <View style={styles.attendeeDropdown}>
            {item.attendees?.map((a, i) => (
              <Text key={i} style={styles.attendeeName}>@{a.username || 'user'}</Text>
            ))}
          </View>
        )}

        <Text style={styles.eventTitle}>{item.title}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location" size={14} color={colors.primary} />
          <Text style={{ color: colors.textSecondary, fontSize: 13, flex: 1 }} numberOfLines={1}>
            {item.locationName}
          </Text>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={[styles.miniActionBtn, isJoined && { backgroundColor: colors.glassBorder }]} 
            onPress={() => onJoin(item._id)}
          >
            <Text style={[styles.miniActionText, { color: isJoined ? colors.textSecondary : colors.primary }]}>
              {isJoined ? 'Leave' : 'Join'}
            </Text>
          </TouchableOpacity>
          
          {isHost && (
            <TouchableOpacity onPress={() => onDelete(item._id)}>
              <Ionicons name="trash" size={20} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default React.memo(EventCard);