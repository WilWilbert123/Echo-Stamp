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
import { useDispatch, useSelector } from 'react-redux';

import GlassButton from '../components/GlassButton';
import GlassCard from '../components/GlassCard';
import { useTheme } from '../context/ThemeContext';
import { addEchoAsync } from '../redux/echoSlice';

const CreateEcho = ({ navigation }) => {
  const { isDark, colors } = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [emotion, setEmotion] = useState('Calm');
  const [loading, setLoading] = useState(false);

  const [address, setAddress] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const preFetchLocation = async () => {
      try {
        setIsLocating(true);
        
        // Check for permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setAddress("Permission denied");
          return;
        }

        // Get position with high accuracy
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High, 
        });

        if (location) {
          const reverseGeocode = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });

          if (reverseGeocode.length > 0) {
            const area = reverseGeocode[0];
            
            // Refined formatting to handle Pitogo/Taguig/Makati border
            const streetName = area.street && !area.street.includes('+') ? area.street : "";
            const brgy = area.district || ""; // Pitogo usually lives here
            const cityName = area.city || "";
            // Only show province if it's not Metro Manila to keep it short
            const province = (area.region && area.region !== "Metro Manila") ? area.region : "";

            const formattedAddress = [streetName, brgy, cityName, province]
              .filter(Boolean)
              .join(', ');

            setAddress(formattedAddress || "Taguig City");
          }
        }
      } catch (error) {
        console.warn("Location fetch failed:", error.message);
        setAddress("Taguig City");
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
    { label: 'Excited', emoji: '✨' },
    { label: 'Loved', emoji: '❤️' },
    { label: 'Tired', emoji: '😴' },
    { label: 'Grateful', emoji: '🙏' },
  ];

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Wait", "Please give this moment a title.");
      return;
    }

    if (!user?.id) {
        Alert.alert("Error", "No active user session found.");
        return;
    }

    try {
      setLoading(true);
      
      const echoData = {
        userId: user.id, 
        title: title.trim(),
        description: description.trim(),
        emotion: emotion,
        location: {
          address: address || "Somewhere beautiful"
        }
      
      };

      await dispatch(addEchoAsync(echoData)).unwrap();
      
      Alert.alert("Success", "Memory anchored!");
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "We couldn't save this memory.");
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
          <View style={styles.navHeader}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={28} color={colors.textMain} />
            </TouchableOpacity>
            <Text style={[styles.header, { color: colors.textMain }]}>New Echo</Text>
            <View style={{ width: 28 }} />
          </View>

          {/* Location Status Bar */}
          <View style={[styles.locationStatus, { backgroundColor: colors.glass }]}>
            <Ionicons
              name={address && !address.includes("denied") ? "location" : "location-outline"}
              size={14}
              color={address && !address.includes("denied") ? (isDark ? "#81C784" : "#2E7D32") : colors.textMain}
            />
            <Text 
                numberOfLines={1}
                style={[styles.locationStatusText, { color: colors.textMain }, address && !address.includes("denied") && { color: isDark ? "#81C784" : "#2E7D32" }]}
            >
              {isLocating ? "Finding your spot..." : address || "Location ready"}
            </Text>
          </View>

          {/* Title Input */}
          <GlassCard style={[styles.inputCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: colors.textMain }]}>What happened?</Text>
              <Text style={[styles.counter, { color: colors.textSecondary }]}>{title.length}/500</Text>
            </View>
            <TextInput
              style={[styles.input, { color: colors.cardText }]}
              placeholder="Name this moment..."
              placeholderTextColor={isDark ? "rgba(255,255,255,0.3)" : "rgba(1, 87, 155, 0.4)"}
              value={title}
              onChangeText={setTitle}
              maxLength={500}
            />
          </GlassCard>

          <View style={styles.sectionHeader}>
            <Text style={[styles.label, { color: colors.textMain }]}>How did it feel?</Text>
          </View>

          {/* Emotion Selection */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollPadding}
            style={styles.emotionScrollView}
          >
            {emotions.map((item) => (
              <TouchableOpacity
                key={item.label}
                onPress={() => setEmotion(item.label)}
                style={[
                  styles.emotionBox,
                  { backgroundColor: colors.glass, borderColor: colors.glassBorder },
                  emotion === item.label && [
                    styles.activeEmotionBox,
                    { borderColor: colors.textMain, backgroundColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.8)' }
                  ]
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
          </ScrollView>

          {/* Detail Input */}
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

          {/* Save Button */}
          <View style={styles.buttonContainer}>
            {loading ? (
              <View style={styles.loadingWrapper}>
                <ActivityIndicator size="large" color={colors.textMain} />
              </View>
            ) : (
              <GlassButton
                title="Anchor Memory"
                onPress={handleSave}
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
  scrollContent: { padding: 20, paddingBottom: 60 },
  navHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  header: { fontSize: 24, fontWeight: '800' },
  locationStatus: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, alignSelf: 'flex-start', maxWidth: '100%' },
  locationStatusText: { fontSize: 11, marginLeft: 5, fontWeight: '600' },
  inputCard: { marginBottom: 25, padding: 18, borderWidth: 1 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  label: { fontWeight: '700', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 },
  counter: { fontSize: 11, opacity: 0.6 },
  input: { fontSize: 18, fontWeight: '500' },
  textArea: { minHeight: 80, fontSize: 16, marginTop: 10 },
  sectionHeader: { marginBottom: 15, paddingLeft: 5 },
  emotionBox: { width: 85, paddingVertical: 15, borderRadius: 35, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  activeEmotionBox: { transform: [{ scale: 0.9 }] },
  emojiText: { fontSize: 24, marginBottom: 5 },
  emotionText: { fontSize: 10, fontWeight: '600' },
  buttonContainer: { marginTop: 10, alignItems: 'center' },
  loadingWrapper: { alignItems: 'center' },
  emotionScrollView: { marginBottom: 25 },
  horizontalScrollPadding: { paddingHorizontal: 5, gap: 12 }
});

export default CreateEcho;