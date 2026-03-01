import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef } from 'react';
import { Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import GlassCard from '../components/GlassCard';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const Atlas = () => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);
  
  // 1. Connect to Redux State
  const { list } = useSelector((state) => state.echoes);

  // 2. Custom Map Styles for Dark/Light Mode
  const mapStyle = useMemo(() => {
    if (!isDark) return []; 
    return [
      { "elementType": "geometry", "stylers": [{ "color": "#242f3e" }] },
      { "elementType": "labels.text.fill", "stylers": [{ "color": "#746855" }] },
      { "elementType": "labels.text.stroke", "stylers": [{ "color": "#242f3e" }] },
      { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
      { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#d59563" }] },
      { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#38414e" }] },
      { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#17263c" }] }
    ];
  }, [isDark]);

  // 3. Auto-focus logic: Filtered to prevent "undefined" crashes
  const focusAllMarkers = () => {
    if (list && list.length > 0 && mapRef.current) {
      // FIX: Only map echoes that actually have valid coordinates
      const validCoords = list
        .filter(echo => echo.location?.coords?.latitude && echo.location?.coords?.longitude)
        .map(echo => ({
          latitude: echo.location.coords.latitude,
          longitude: echo.location.coords.longitude,
        }));
      
      if (validCoords.length > 0) {
        mapRef.current.fitToCoordinates(validCoords, {
          edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
          animated: true,
        });
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => focusAllMarkers(), 1000);
    return () => clearTimeout(timer);
  }, [list.length]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFillObject}
        customMapStyle={mapStyle}
        initialRegion={{
          latitude: 14.5995, 
          longitude: 120.9842,
          latitudeDelta: 10,
          longitudeDelta: 10,
        }}
      >
        {/* FIX: Ensure we only map markers for echoes with valid locations */}
        {list.map((echo) => {
          const lat = echo.location?.coords?.latitude;
          const lng = echo.location?.coords?.longitude;

          if (!lat || !lng) return null;

          return (
            <Marker
              key={echo._id || Math.random().toString()}
              coordinate={{ latitude: lat, longitude: lng }}
              tracksViewChanges={false}
            >
              <View style={[styles.markerContainer, { backgroundColor: isDark ? '#304FFE' : '#FFF', borderColor: colors.textMain }]}>
                <Text style={styles.markerEmoji}>
                   {echo.emotion === 'Happy' ? '😊' : echo.emotion === 'Calm' ? '🌊' : echo.emotion === 'Energetic' ? '⚡' : '📍'}
                </Text>
              </View>

              <Callout tooltip>
                <GlassCard style={[styles.calloutCard, { backgroundColor: colors.glass }]}>
                  <View style={styles.calloutHeader}>
                    <Text style={[styles.calloutTitle, { color: colors.textMain }]}>{echo.title || 'Untitled Echo'}</Text>
                    <Ionicons name="chevron-forward" size={12} color={colors.textSecondary} />
                  </View>
                  <Text style={[styles.calloutDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                    {echo.location?.address || 'Saved memory location'}
                  </Text>
                </GlassCard>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      <View style={[styles.floatingHeader, { top: insets.top + 10 }]}>
        <GlassCard style={[styles.headerCard, { backgroundColor: colors.glass }]}>
          <View style={[styles.pulseDot, { backgroundColor: isDark ? '#82B1FF' : '#304FFE' }]} />
          <Text style={[styles.headerText, { color: colors.textMain }]}>
            {list.length} Echoes in your Atlas
          </Text>
        </GlassCard>
      </View>

      <TouchableOpacity 
        style={[styles.recenterBtn, { bottom: insets.bottom + 100 }]}
        onPress={focusAllMarkers}
      >
        <GlassCard style={[styles.recenterInner, { backgroundColor: colors.glass }]}>
            <Ionicons name="locate" size={24} color={colors.textMain} />
        </GlassCard>
      </TouchableOpacity>
    </View>
  );
};

export default Atlas;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  floatingHeader: { position: 'absolute', left: 20, right: 20, zIndex: 10 },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  pulseDot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  headerText: { fontWeight: '800', fontSize: 14, letterSpacing: -0.3 },
  markerContainer: {
    padding: 6,
    borderRadius: 25,
    borderWidth: 2,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4 },
      android: { elevation: 8 }
    })
  },
  markerEmoji: { fontSize: 20 },
  calloutCard: {
    padding: 15,
    width: 220,
    borderRadius: 20,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  calloutHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  calloutTitle: { fontWeight: '900', fontSize: 15 },
  calloutDesc: { fontSize: 12, lineHeight: 16, opacity: 0.8 },
  recenterBtn: { position: 'absolute', right: 20, width: 56, height: 56, zIndex: 10 },
  recenterInner: { flex: 1, borderRadius: 28, justifyContent: 'center', alignItems: 'center' }
});