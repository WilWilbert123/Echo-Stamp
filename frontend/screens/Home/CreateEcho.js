import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import LottieView from 'lottie-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
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

// Components & Context
import BrandedHeader from '../../components/BrandedHeader';
import GlassButton from '../../components/GlassButton';
import { EMOTION_ASSETS, EMOTION_CONFIG } from '../../constants/assets';
import { useTheme } from '../../context/ThemeContext';
import { addEchoAsync } from '../../redux/echoSlice';

const { width } = Dimensions.get('window');

const CreateEcho = ({ navigation }) => {
  const { isDark, colors } = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [emotion, setEmotion] = useState('Calm');
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const filteredEmotions = EMOTION_CONFIG.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const preFetchLocation = async () => {
      try {
        setIsLocating(true);
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setAddress("Permission denied");
          return;
        }

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
            const streetName = area.street && !area.street.includes('+') ? area.street : "";
            const brgy = area.district || "";
            const cityName = area.city || "";
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

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Wait", "Please give this moment a title.");
      return;
    }
    const userId = user?._id || user?.id;
    if (!userId) {
      Alert.alert("Error", "No active user session found.");
      return;
    }

    try {
      setLoading(true);
      const echoData = {
        userId: userId,
        title: title.trim(),
        description: description.trim(),
        emotion: emotion,
        location: {
          address: address || "Somewhere beautiful"
        }
      };

      await dispatch(addEchoAsync(echoData)).unwrap();
      navigation.goBack();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "We couldn't save this memory.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background[0] }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />

      {/* 1. BRANDED HEADER APPLIED HERE */}
      <BrandedHeader colors={colors} isDark={isDark} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Custom Navigation Row */}
          <View style={styles.navHeader}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={[styles.backButton, { backgroundColor: colors.glass, borderColor: colors.glassBorder, borderWidth: 1 }]}
            >
              <Ionicons name="chevron-back" size={24} color={colors.textMain} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.textMain }]}>New Echo</Text>
            <View style={{ width: 44 }} />
          </View>

          {/* Location Bar */}
          <View style={[styles.locationStatus, { backgroundColor: colors.glass, borderColor: colors.glassBorder, borderWidth: 1 }]}>
            <Ionicons
              name={address && !address.includes("denied") ? "location" : "location-outline"}
              size={14}
              color={colors.primary}
            />
            <Text numberOfLines={1} style={[styles.locationStatusText, { color: colors.textSecondary }]}>
              {isLocating ? "Finding your spot..." : address || "Location ready"}
            </Text>
          </View>

          {/* Main Input Area */}
          <View style={[styles.solidCard, {
            backgroundColor: isDark ? colors.glass : '#FFF',
            borderColor: colors.glassBorder,
            borderWidth: 1
          }]}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: colors.primary }]}>What happened?</Text>
              <Text style={[styles.counter, { color: colors.textSecondary }]}>{title.length}/500</Text>
            </View>
            <TextInput
              style={[styles.input, { color: colors.textMain }]}
              placeholder="Name this moment..."
              placeholderTextColor={isDark ? 'rgba(255,255,255,0.3)' : '#94A3B8'}
              value={title}
              onChangeText={setTitle}
              maxLength={500}
              multiline
            />
          </View>

          {/* Emotion Section */}
          <View style={styles.sectionHeaderRow}>
            {!isSearching ? (
              <>
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>HOW DID IT FEEL?</Text>
                <TouchableOpacity onPress={() => setIsSearching(true)} style={styles.searchIconButton}>
                  <Ionicons name="search" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </>
            ) : (
              <View style={[styles.searchBarContainer, { backgroundColor: colors.glass, borderColor: colors.glassBorder, borderWidth: 1 }]}>
                <Ionicons name="search" size={16} color={colors.primary} style={{ marginLeft: 10 }} />
                <TextInput
                  autoFocus
                  style={[styles.searchInput, { color: colors.textMain }]}
                  placeholder="Search emotions..."
                  placeholderTextColor={isDark ? 'rgba(255,255,255,0.3)' : '#94A3B8'}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                <TouchableOpacity onPress={() => { setIsSearching(false); setSearchQuery(''); }}>
                  <Ionicons name="close-circle" size={18} color={colors.textSecondary} style={{ marginRight: 10 }} />
                </TouchableOpacity>
              </View>
            )}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.emotionScrollContent}
            style={styles.emotionScrollView}
          >
            {filteredEmotions.map((item) => {
              const isSelected = emotion === item.value;
              const animationFile = EMOTION_ASSETS[item.assetKey];

              return (
                <TouchableOpacity
                  key={item.value}  
                  onPress={() => setEmotion(item.value)}
                  activeOpacity={0.7}
                  style={[
                    styles.emotionBox,
                    {
                      backgroundColor: isDark ? colors.glass : '#FFF',
                      borderColor: isSelected ? colors.primary : colors.glassBorder,
                      borderWidth: isSelected ? 2 : 1,
                    },
                    isSelected && {
                      backgroundColor: colors.primary + '15', 
                    }
                  ]}
                >
                  <LottieView
                    source={animationFile}
                    autoPlay
                    loop={isSelected}  
                    style={{ width: 70, height: 70 }}
                  />
                  <Text
                    style={[
                      styles.emotionText,
                      { color: isSelected ? colors.primary : colors.textSecondary, fontWeight: isSelected ? '900' : '600' }
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Details Card */}
          <View style={[styles.solidCard, {
            backgroundColor: isDark ? colors.glass : '#FFF',
            borderColor: colors.glassBorder,
            borderWidth: 1
          }]}>
            <Text style={[styles.label, { color: colors.primary, marginBottom: 10 }]}>ADD MORE DETAIL</Text>
            <TextInput
              style={[styles.input, styles.textArea, { color: colors.textMain }]}
              placeholder="Capture the small things..."
              placeholderTextColor={isDark ? 'rgba(255,255,255,0.3)' : '#94A3B8'}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Footer Action */}
          <View style={styles.footer}>
            <GlassButton
              onPress={handleSave}
              loading={loading}
              style={styles.mainButton}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={[styles.buttonText, { color: isDark ? '#FFF' : colors.textMain }]}>
                  Anchor Memory
                </Text>
                <Ionicons 
                  name="bookmark" 
                  size={20} 
                  color={isDark ? '#FFF' : colors.textMain} 
                />
              </View>
            </GlassButton>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100, paddingTop: 50 },
  navHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  backButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  locationStatus: { flexDirection: 'row', alignItems: 'center', marginBottom: 25, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, alignSelf: 'center' },
  locationStatusText: { fontSize: 12, marginLeft: 6, fontWeight: '700' },
  solidCard: { padding: 20, borderRadius: 24, marginBottom: 20 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  label: { fontWeight: '800', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5 },
  counter: { fontSize: 11, fontWeight: '600' },
  input: { fontSize: 17, fontWeight: '500', lineHeight: 24 },
  textArea: { minHeight: 120 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingRight: 10 },
  sectionLabel: { fontSize: 11, fontWeight: '800', marginLeft: 10, letterSpacing: 1.5 },
  searchIconButton: { padding: 5, borderRadius: 10 },
  searchBarContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', height: 40, borderRadius: 20, marginLeft: 10 },
  searchInput: { flex: 1, fontSize: 14, paddingHorizontal: 10, fontWeight: '600' },
  emotionScrollView: { marginBottom: 25 },
  emotionScrollContent: { paddingHorizontal: 5, gap: 12 },
  emotionBox: { width: 95, height: 105, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  emotionText: { fontSize: 11, marginTop: 4 },
  footer: { marginTop: 10, alignItems: 'center' },
  mainButton: { width: '100%', height: 60, borderRadius: 30, overflow: 'hidden' },
  buttonGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  buttonText: { fontSize: 18, fontWeight: '800' },
});

export default CreateEcho;