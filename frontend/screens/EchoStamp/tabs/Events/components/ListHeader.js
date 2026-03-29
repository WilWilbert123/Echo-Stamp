import LottieView from 'lottie-react-native';
import React from 'react';
import { Text, View } from 'react-native';

const ListHeader = ({ styles }) => (
  <View style={styles.spotlightCard}>
    <View style={styles.spotlightTextContent}>
      <View style={styles.liveBadge}>
        <LottieView
          source={require('../../../../../assets/live2.json')}
          autoPlay
          loop
          style={{ width: 24, height: 24, marginLeft: -6, marginRight: -4 }}
        />
        <Text style={styles.liveText}>LIVE FEED</Text>
      </View>
      <Text style={styles.spotlightTitle}>Local Meetups</Text>
      <Text style={{ color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
        Discover what's happening nearby
      </Text>
    </View>
    <LottieView
      source={require('../../../../../assets/location-map.json')}
      autoPlay
      loop
       
      style={{ width: 50, height: 60 }}
    />
  </View>
);

export default React.memo(ListHeader);