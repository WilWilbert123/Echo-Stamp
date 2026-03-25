import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

const ListHeader = ({ styles }) => (
  <View style={styles.spotlightCard}>
    <View style={styles.spotlightTextContent}>
      <View style={styles.liveBadge}>
        <View style={styles.dot} />
        <Text style={styles.liveText}>LIVE FEED</Text>
      </View>
      <Text style={styles.spotlightTitle}>Local Meetups</Text>
      <Text style={{ color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
        Discover what's happening nearby
      </Text>
    </View>
    <Ionicons name="sparkles" size={40} color={'rgba(255,255,255,0.4)'} />
  </View>
);

export default React.memo(ListHeader);