import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../../../../context/ThemeContext';
import { getStyles } from '../Events.style';
import { getEventImage } from '../utils/Events.utils';

const EventCard = ({ item }) => {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  const navigation = useNavigation();

  return (
    <TouchableOpacity 
      activeOpacity={0.9}
      style={styles.eventCard}
      onPress={() => {
        Haptics.selectionAsync();
        navigation.navigate('Atlas', { location: item.coords });
      }}
    >
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
          <Text style={{color: colors.textSecondary, fontSize: 12, marginLeft: 8}}>
            • {item.attendees?.length || 0} attending
          </Text>
        </View>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location" size={14} color={colors.primary} />
          <Text style={{ color: colors.textSecondary, fontSize: 13, flex: 1 }} numberOfLines={1}>
            {item.locationName}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default React.memo(EventCard);