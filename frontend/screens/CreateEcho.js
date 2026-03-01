import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useDispatch } from 'react-redux';

import GlassButton from '../components/GlassButton';
import GlassCard from '../components/GlassCard';
import { useTheme } from '../context/ThemeContext'; // 1. Import Theme Hook
import { addEchoAsync } from '../redux/echoSlice';

const CreateEcho = ({ navigation }) => {
  const { isDark, colors } = useTheme(); // 2. Access current theme
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [emotion, setEmotion] = useState('Calm');
  const [loading, setLoading] = useState(false);
  
  const [locationData, setLocationData] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    const preFetchLocation = async () => {
      try {
        setIsLocating(true);
        let { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });

          const reverseGeocode = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });

          if (reverseGeocode.length > 0) {
            const area = reverseGeocode[0];
            const street = area.street || area.name || "";
            const barangay = area.district || area.subregion || "";
            const city = area.city || area.region || "";

            const fullAddress = [street, barangay, city]
              .filter(Boolean)
              .join(', ');

            setLocationData({
              lat: location.coords.latitude,
              lng: location.coords.longitude,
              address: fullAddress || "Somewhere beautiful"
            });
          }
        }
      } catch (error) {
        console.error("Pre-fetch location error:", error);
      } finally {
        setIsLocating(false);
      }
    };

    preFetchLocation();
  }, []);

  const emotions = [
    { label: 'Happy', emoji: '😊' },
    { label: 'Calm', emoji: '🌊' },
    { label: 'Proud', emoji: '⭐' },
    { label: 'Sad', emoji: '☁️' },
  ];

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Wait", "Please give this moment a title.");
      return;
    }

    try {
      setLoading(true);
      const finalLocation = locationData || { address: "Somewhere beautiful" };

      const echoData = {
        title: title.trim(),
        description: description.trim(),
        emotion: emotion,
        location: finalLocation,
        createdAt: new Date().toISOString(),
      };

      await dispatch(addEchoAsync(echoData)).unwrap();
      navigation.goBack();
    } catch (error) {
      Alert.alert("Sync Error", "We couldn't anchor this memory.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={colors.background} style={styles.container}>
      <StatusBar barStyle={colors.status} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.navHeader}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={28} color={colors.textMain} />
            </TouchableOpacity>
            <Text style={[styles.header, { color: colors.textMain }]}>New Echo</Text>
            <View style={{ width: 28 }} /> 
          </View>

          {/* Location Status */}
          <View style={[styles.locationStatus, { backgroundColor: colors.glass }]}>
            <Ionicons 
                name={locationData ? "location" : "location-outline"} 
                size={14} 
                color={locationData ? (isDark ? "#81C784" : "#2E7D32") : colors.textMain} 
            />
            <Text style={[styles.locationStatusText, { color: colors.textMain }, locationData && { color: isDark ? "#81C784" : "#2E7D32" }]}>
              {isLocating ? "Finding your exact spot..." : locationData ? locationData.address : "Location ready"}
            </Text>
          </View>

          {/* Title Input */}
          <GlassCard style={[styles.inputCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: colors.textMain }]}>What happened?</Text>
              <Text style={[styles.counter, { color: colors.textSecondary }]}>{title.length}/40</Text>
            </View>
            <TextInput 
              style={[styles.input, { color: colors.cardText }]} 
              placeholder="Name this moment..."
              placeholderTextColor={isDark ? "rgba(255,255,255,0.3)" : "rgba(1, 87, 155, 0.4)"}
              value={title}
              onChangeText={setTitle}
              maxLength={40}
            />
          </GlassCard>

          {/* Emotion Selector */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.label, { color: colors.textMain }]}>How did it feel?</Text>
          </View>
          <View style={styles.emotionGrid}>
            {emotions.map((item) => (
              <TouchableOpacity
                key={item.label}
                onPress={() => setEmotion(item.label)}
                style={[
                  styles.emotionBox,
                  { backgroundColor: colors.glass, borderColor: colors.glassBorder },
                  emotion === item.label && [styles.activeEmotionBox, { borderColor: colors.textMain, backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.8)' }]
                ]}
              >
                <Text style={styles.emojiText}>{item.emoji}</Text>
                <Text style={[
                  styles.emotionText,
                  { color: colors.textSecondary },
                  emotion === item.label && { color: colors.textMain, fontWeight: '800' }
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Description */}
          <GlassCard style={[styles.inputCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
            <Text style={[styles.label, { color: colors.textMain }]}>Add more detail (Optional)</Text>
            <TextInput 
              style={[styles.input, styles.textArea, { color: colors.cardText }]} 
              placeholder="Capture the small things..."
              placeholderTextColor={isDark ? "rgba(255,255,255,0.3)" : "rgba(1, 87, 155, 0.4)"}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </GlassCard>

          <View style={styles.buttonContainer}>
            {loading ? (
              <View style={styles.loadingWrapper}>
                <ActivityIndicator size="large" color={colors.textMain} />
                <Text style={[styles.loadingText, { color: colors.textMain }]}>Anchoring to the cloud...</Text>
              </View>
            ) : (
              <GlassButton 
                title="Anchor Memory" 
                onPress={handleSave} 
                // Note: Your GlassButton should also consume colors.textMain internally or via props
              />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20,  paddingBottom: 60 },
  navHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  header: { fontSize: 24, fontWeight: '800' },
  locationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start'
  },
  locationStatusText: {
    fontSize: 11,
    marginLeft: 5,
    fontWeight: '600'
  },
  inputCard: { marginBottom: 25, padding: 18, borderWidth: 1 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  label: { fontWeight: '700', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 },
  counter: { fontSize: 11, opacity: 0.6 },
  input: { fontSize: 18, fontWeight: '500' },
  textArea: { minHeight: 80, fontSize: 16, marginTop: 10 },
  sectionHeader: { marginBottom: 15, paddingLeft: 5 },
  emotionGrid: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 25 
  },
  emotionBox: {
    width: '22%',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 1,
  },
  activeEmotionBox: {
    transform: [{ scale: 1.05 }],
  },
  emojiText: { fontSize: 24, marginBottom: 5 },
  emotionText: { fontSize: 10, fontWeight: '600' },
  buttonContainer: { marginTop: 10, alignItems: 'center' },
  loadingWrapper: { alignItems: 'center' },
  loadingText: { marginTop: 10, fontWeight: '600', fontSize: 14 }
});

export default CreateEcho;