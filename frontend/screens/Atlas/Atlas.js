import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Linking,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import GlassCard from '../../components/GlassCard';
import { useTheme } from '../../context/ThemeContext';
import {
  addJournalAsync,
  deleteJournalAsync,
  getJournalsAsync,
  removeJournalMediaAsync
} from '../../redux/journalSlice';
import { uploadImageToCloudinary } from '../../services/cloudinary';

const { width, height } = Dimensions.get('window');

// --- SUB-COMPONENT FOR MODERN VIDEO ---
const VideoPlayerItem = ({ uri, isVisible }) => {
  const player = useVideoPlayer(uri, (player) => {
    player.loop = true;
    player.muted = false;
    if (isVisible) {
      player.play();
    }
  });

  useEffect(() => {
    if (isVisible) {
      player.play();
    } else {
      player.pause();
    }
  }, [isVisible, player]);

  return (
    <VideoView
      style={styles.fullMedia}
      player={player}
      nativeControls={true}
      contentFit="contain"
    />
  );
};

const Atlas = () => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);
  const { colors, isDark } = useTheme();

  const { list } = useSelector((state) => state.journals);
  const { user } = useSelector((state) => state.auth);

  // --- STATES ---
  const [modalVisible, setModalVisible] = useState(false);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [tempCoords, setTempCoords] = useState(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaList, setMediaList] = useState([]); 
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userId = user?._id || user?.id;
    if (userId) dispatch(getJournalsAsync(userId));
  }, [dispatch, user]);

  const markers = useMemo(() => {
    return (list || []).filter(j => j.location && typeof j.location.lat === 'number');
  }, [list]);

  // --- CLEAN STREET VIEW LOGIC ---
  const openStreetView = (lat, lng) => {
    // This is the universal Google Maps URL that handles Street View correctly
    const url = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`;
    
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert("Error", "Could not open Google Maps.");
      }
    });
  };

  // --- VIDEO CHECK LOGIC ---
  const checkIsVideo = (uri) => {
    if (!uri || typeof uri !== 'string') return false;
    const url = uri.toLowerCase();
    return (
      url.includes('/video/upload/') || 
      url.endsWith('.mp4') || 
      url.endsWith('.mov') || 
      url.endsWith('.m4v')
    );
  };

  // --- SEARCH LOGIC ---
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`,
        { headers: { 'User-Agent': 'EchoStamp-App' } }
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        mapRef.current?.animateToRegion({
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        }, 1500);
      } else {
        Alert.alert("Location Not Found", "Try being more specific.");
      }
    } catch (error) {
      Alert.alert("Error", "Unable to reach search services.");
    } finally {
      setIsSearching(false);
      setSearchQuery('');
    }
  };

  // --- MEDIA PICKER ---
  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 0.6,
    });
    if (!result.canceled) {
      setMediaList([...mediaList, ...result.assets]);
    }
  };

  // --- SAVE JOURNAL ---
  const handleSave = async () => {
    const userId = user?._id || user?.id;
    if (!title) return Alert.alert("Wait!", "Please give this moment a title.");

    setLoading(true);

    try {
      const uploadedUrls = await Promise.all(
        mediaList.map(async (item) => {
          if (item.uri.startsWith('http')) return item.uri;
          return await uploadImageToCloudinary(item.uri);
        })
      );

      let finalAddress = "Pinned Location";
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const [result] = await Location.reverseGeocodeAsync({
            latitude: tempCoords.latitude,
            longitude: tempCoords.longitude,
          });

          if (result) {
            const street = result.street || "";
            const brgy = result.district || "";
            const city = result.city || result.subregion || "";
            const addressParts = [street, brgy, city].filter(part => part.length > 0);
            finalAddress = addressParts.join(', ') || "Pinned Location";
          }
        }
      } catch (geoErr) {
        finalAddress = "Pinned Location";
      }

      const journalData = {
        userId,
        title,
        description,
        media: uploadedUrls,  
        location: {
          lat: tempCoords.latitude,
          lng: tempCoords.longitude,
          address: finalAddress 
        }
      };

      await dispatch(addJournalAsync(journalData)).unwrap();

      setModalVisible(false);
      resetForm();
      Alert.alert("Success!", "Your moment has been pinned.");

    } catch (err) {
      console.error("Upload/Save Error:", err);
      Alert.alert("Save Failed", "We couldn't save the entry.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setMediaList([]);
  };

  const handleDeleteJournal = (id) => {
    Alert.alert("Delete Memory", "This will permanently remove this pin.", [
      { text: "Keep it", style: "cancel" },
      {
        text: "Delete", style: "destructive", onPress: async () => {
          await dispatch(deleteJournalAsync(id));
          setViewerVisible(false);
        }
      }
    ]);
  };

  const handleRemoveSingleSavedMedia = (uriToRemove) => {
    Alert.alert("Remove Media", "Delete this specific file?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove", 
        style: "destructive", 
        onPress: async () => {
          try {
            await dispatch(removeJournalMediaAsync({ id: selectedJournal._id, mediaUri: uriToRemove })).unwrap();
            const updatedMedia = selectedJournal.media.filter(m => m !== uriToRemove);
            setSelectedJournal({ ...selectedJournal, media: updatedMedia });
            if (updatedMedia.length === 0) setViewerVisible(false);
          } catch (err) {
            Alert.alert("Error", "Failed to delete media.");
          }
        }
      }
    ]);
  };

  const renderMediaItem = ({ item, index }) => {
    const isVid = checkIsVideo(item);
    const isCurrentlyVisible = viewerVisible && activeMediaIndex === index;
    
    return (
      <View style={styles.mediaSlide}>
        {isVid ? (
          <VideoPlayerItem uri={item} isVisible={isCurrentlyVisible} />
        ) : (
          <Image source={{ uri: item }} style={styles.fullMedia} resizeMode="contain" />
        )}
        <TouchableOpacity style={styles.viewerSingleDelete} onPress={() => handleRemoveSingleSavedMedia(item)}>
          <Ionicons name="trash" size={16} color="white" />
          <Text style={styles.deleteBtnText}>Remove</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background[0] }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />

      {/* SEARCH BAR */}
      <View style={[styles.searchContainer, { top: insets.top + 10 }]}>
        <GlassCard style={[styles.searchBar, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
          {isSearching ? <ActivityIndicator size="small" color={colors.primary} /> : <Ionicons name="search" size={20} color={colors.primary} style={{ marginRight: 10 }} />}
          <TextInput
            style={[styles.searchInput, { color: colors.textMain }]}
            placeholder="Where to?"
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
        </GlassCard>
      </View>

      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: 14.5995, longitude: 120.9842,
          latitudeDelta: 0.1, longitudeDelta: 0.1,
        }}
        onLongPress={(e) => {
          setTempCoords(e.nativeEvent.coordinate);
          setModalVisible(true);
        }}
        customMapStyle={isDark ? darkMapStyle : []}
      >
        {markers.map((journal) => {
          const firstMedia = journal.media?.[0];
          const isVid = checkIsVideo(firstMedia);

          return (
            <Marker
              key={journal._id}
              coordinate={{ latitude: Number(journal.location.lat), longitude: Number(journal.location.lng) }}
              onPress={() => {
                setSelectedJournal(journal);
                setActiveMediaIndex(0);
                setViewerVisible(true);
              }}
            >
              <View style={styles.pinWrapper}>
                <View style={[styles.pinCircle, { borderColor: colors.primary, backgroundColor: isDark ? '#1a1a1a' : '#fff' }]}>
                  {firstMedia ? (
                    isVid ? (
                      <Ionicons name="play" size={18} color={colors.primary} />
                    ) : (
                      <Image source={{ uri: firstMedia }} style={styles.markerImage} />
                    )
                  ) : (
                    <Ionicons name="heart" size={16} color={colors.primary} />
                  )}
                </View>
                <View style={[styles.pinTail, { borderTopColor: colors.primary }]} />
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* ADD MEMORY MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <GlassCard style={[styles.modalContent, { backgroundColor: colors.background[1], borderColor: colors.glassBorder }]}>
            <Text style={[styles.modalHeader, { color: colors.textMain }]}>Pin a Memory</Text>
            
            <View style={styles.mediaSection}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity style={[styles.addMediaBtn, { borderColor: colors.primary }]} onPress={pickMedia}>
                  <Ionicons name="add" size={30} color={colors.primary} />
                </TouchableOpacity>
                {mediaList.map((item, i) => (
                  <View key={i} style={styles.previewContainer}>
                    {item.type === 'video' ? (
                       <View style={[styles.previewItem, { backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }]}>
                          <Ionicons name="videocam" size={24} color="white" />
                       </View>
                    ) : (
                      <Image source={{ uri: item.uri }} style={styles.previewItem} />
                    )}
                    <TouchableOpacity style={styles.removeBadge} onPress={() => setMediaList(prev => prev.filter((_, idx) => idx !== i))}>
                      <Ionicons name="close-circle" size={22} color="#ff4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>

            <TextInput
              style={[styles.input, { color: colors.textMain, borderColor: colors.glassBorder }]}
              placeholder="Moment Title"
              placeholderTextColor={colors.textSecondary}
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top', color: colors.textMain, borderColor: colors.glassBorder }]}
              placeholder="Tell the story..."
              multiline
              placeholderTextColor={colors.textSecondary}
              value={description}
              onChangeText={setDescription}
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity onPress={() => setModalVisible(false)}><Text style={{ color: colors.textSecondary }}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleSave} style={[styles.btnSave, { backgroundColor: colors.primary }]}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnSaveText}>Save to Map</Text>}
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>
      </Modal>

      {/* MEDIA VIEWER MODAL */}
      <Modal visible={viewerVisible} transparent animationType="fade">
        <View style={styles.viewerOverlay}>
          <View style={styles.viewerHeader}>
            <TouchableOpacity onPress={() => setViewerVisible(false)} style={styles.headerCircleBtn}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>

            {/* STREET VIEW BUTTON */}
            <TouchableOpacity 
              onPress={() => openStreetView(selectedJournal.location.lat, selectedJournal.location.lng)} 
              style={[styles.headerCircleBtn, { backgroundColor: colors.primary }]}
            >
              <Ionicons name="navigate-circle-outline" size={26} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleDeleteJournal(selectedJournal?._id)} style={styles.headerCircleBtn}>
              <Ionicons name="trash-outline" size={22} color="#ff4444" />
            </TouchableOpacity>
          </View>

          {selectedJournal && (
            <View style={{ flex: 1 }}>
              <FlatList
                data={selectedJournal.media}
                renderItem={renderMediaItem}
                keyExtractor={(item, index) => index.toString()}
                horizontal
                pagingEnabled
                onScroll={(e) => setActiveMediaIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
                showsHorizontalScrollIndicator={false}
              />
              <View style={styles.paginationRow}>
                {selectedJournal.media.map((_, i) => (
                  <View key={i} style={[styles.dot, { backgroundColor: i === activeMediaIndex ? colors.primary : '#555' }]} />
                ))}
              </View>

              <GlassCard style={[styles.enhancedDetails, { backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)' }]}>
                <Text style={[styles.viewerTitle, { color: isDark ? '#fff' : '#000' }]}>{selectedJournal.title}</Text>
                <Text style={[styles.viewerDescription, { color: isDark ? '#ccc' : '#444' }]}>{selectedJournal.description}</Text>
                <Text style={{ fontSize: 12, color: colors.primary, marginTop: 5 }}>📍 {selectedJournal.location.address}</Text>
              </GlassCard>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: width, height: height },
  searchContainer: { position: 'absolute', zIndex: 10, width: '100%', alignItems: 'center', paddingHorizontal: 20 },
  searchBar: { flexDirection: 'row', alignItems: 'center', width: '100%', height: 70, borderRadius: 20, paddingHorizontal: 15, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 16, fontWeight: '500' },
  pinWrapper: { alignItems: 'center' },
  pinCircle: { width: 30, height: 30, borderRadius: 20, borderWidth: 3, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  markerImage: { width: '100%', height: '100%' },
  pinTail: { width: 0, height: 30, borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 8, borderLeftColor: 'transparent', borderRightColor: 'transparent', marginTop: -2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', padding: 25, borderRadius: 30, borderWidth: 1 },
  modalHeader: { fontSize: 22, fontWeight: '800', marginBottom: 15 },
  mediaSection: { height: 90, marginBottom: 15 },
  addMediaBtn: { width: 80, height: 80, borderRadius: 20, borderStyle: 'dashed', borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  previewContainer: { width: 80, height: 80, borderRadius: 20, marginRight: 15 },
  previewItem: { width: '100%', height: '100%', borderRadius: 20 },
  removeBadge: { position: 'absolute', top: -5, right: -5, zIndex: 10 },
  input: { width: '100%', borderRadius: 15, padding: 15, marginBottom: 12, borderWidth: 1 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  btnSave: { paddingHorizontal: 25, paddingVertical: 12, borderRadius: 15 },
  btnSaveText: { color: '#fff', fontWeight: 'bold' },
  viewerOverlay: { flex: 1, backgroundColor: '#000' },
  viewerHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, zIndex: 100, position: 'absolute', top: 0, width: '100%' },
  headerCircleBtn: { backgroundColor: 'rgba(0,0,0,0.5)', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  mediaSlide: { width: width, height: height, justifyContent: 'center' },
  fullMedia: { width: width, height: '100%' },
  viewerSingleDelete: { position: 'absolute', top: 120, right: 20, backgroundColor: 'rgba(255,0,0,0.6)', padding: 10, borderRadius: 15, flexDirection: 'row', alignItems: 'center' },
  deleteBtnText: { color: 'white', marginLeft: 5, fontWeight: '600', fontSize: 12 },
  paginationRow: { flexDirection: 'row', justifyContent: 'center', position: 'absolute', bottom: 210, width: '100%' },
  dot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 5 },
  enhancedDetails: { marginHorizontal: 20, padding: 25, borderRadius: 25, position: 'absolute', bottom: 40, width: width - 40 },
  viewerTitle: { fontSize: 26, fontWeight: 'bold', marginBottom: 8 },
  viewerDescription: { fontSize: 16, lineHeight: 22 },
});

const darkMapStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#1d2c4d" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#8ec3b9" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#1a3646" }] },
  { "featureType": "administrative.country", "elementType": "geometry.stroke", "stylers": [{ "color": "#4b6878" }] },
  { "featureType": "landscape.man_made", "elementType": "geometry.stroke", "stylers": [{ "color": "#334e87" }] },
  { "featureType": "landscape.natural", "elementType": "geometry", "stylers": [{ "color": "#023e58" }] },
  { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#283d6a" }] },
  { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#6f9ba5" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#304a7d" }] },
  { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#98a5be" }] },
  { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#2c6675" }] },
  { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#255763" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#0e1626" }] },
  { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#4e6d70" }] }
];

export default Atlas;