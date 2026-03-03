import { Ionicons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useDispatch, useSelector } from 'react-redux';
import GlassCard from '../components/GlassCard';
import { useTheme } from '../context/ThemeContext';

import { addJournalAsync, deleteJournalAsync, getJournalsAsync, removeJournalMediaAsync } from '../redux/journalSlice';

const { width, height } = Dimensions.get('window');

const Atlas = () => {
  const dispatch = useDispatch();
  const { colors, isDark } = useTheme();

  const { list } = useSelector((state) => state.journals);
  const { user } = useSelector((state) => state.auth);

  const [modalVisible, setModalVisible] = useState(false);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [tempCoords, setTempCoords] = useState(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

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

  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsMultipleSelection: true,
      quality: 0.6,
    });
    if (!result.canceled) {
      setMediaList([...mediaList, ...result.assets]);
    }
  };

  const handleSave = async () => {
    const userId = user?._id || user?.id;
    if (!title || !userId) return Alert.alert("Required", "Please add a title.");

    setLoading(true);
    const journalData = {
      userId,
      title,
      description,
      media: mediaList.map(m => m.uri),
      location: {
        lat: tempCoords.latitude,
        lng: tempCoords.longitude,
        address: "Pinned Location"
      }
    };

    try {
      await dispatch(addJournalAsync(journalData)).unwrap();
      setModalVisible(false);
      resetForm();
    } catch (err) {
      Alert.alert("Error", "Could not save to Journal.");
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
    Alert.alert("Delete Entry", "Remove this entire journal from your map?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete All", style: "destructive", onPress: async () => {
          await dispatch(deleteJournalAsync(id));
          setViewerVisible(false);
        }
      }
    ]);
  };

  const handleRemoveSingleSavedMedia = (uriToRemove) => {
    Alert.alert("Remove Photo", "Delete this photo permanently?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", 
        style: "destructive", 
        onPress: async () => {
          try {
            await dispatch(removeJournalMediaAsync({ 
              id: selectedJournal._id, 
              mediaUri: uriToRemove 
            })).unwrap();

            const updatedMedia = selectedJournal.media.filter(m => m !== uriToRemove);
            setSelectedJournal({ ...selectedJournal, media: updatedMedia });

            if (updatedMedia.length === 0) setViewerVisible(false);
          } catch (err) {
            Alert.alert("Error", "Could not delete from server.");
          }
        }
      }
    ]);
  };

  const renderMediaItem = ({ item }) => {
    const isVideo = item.endsWith('.mp4') || item.includes('video');
    return (
      <View style={styles.mediaSlide}>
        {isVideo ? (
          <Video
            source={{ uri: item }}
            style={styles.fullMedia}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
          />
        ) : (
          <Image source={{ uri: item }} style={styles.fullMedia} resizeMode="contain" />
        )}
        <TouchableOpacity 
          style={styles.viewerSingleDelete} 
          onPress={() => handleRemoveSingleSavedMedia(item)}
        >
          <Ionicons name="trash" size={16} color="white" />
          <Text style={{ color: 'white', marginLeft: 5, fontWeight: '600' }}>Remove</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background[0] }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />

      <MapView
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
        {markers.map((journal) => (
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
                {journal.media?.[0] ? (
                  <Image source={{ uri: journal.media[0] }} style={styles.markerImage} />
                ) : (
                  <Ionicons name="journal" size={16} color={colors.primary} />
                )}
              </View>
              <View style={[styles.pinTail, { borderTopColor: colors.primary }]} />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* CREATE MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <GlassCard style={[styles.modalContent, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
            <Text style={[styles.modalHeader, { color: colors.textMain }]}>Add to Atlas</Text>

            <View style={styles.mediaSection}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
                <TouchableOpacity style={[styles.addMediaBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]} onPress={pickMedia}>
                  <Ionicons name="camera" size={30} color={colors.textSecondary} />
                </TouchableOpacity>
                {mediaList.map((item, i) => (
                  <View key={i} style={styles.previewContainer}>
                    <Image source={{ uri: item.uri }} style={styles.previewItem} />
                    <TouchableOpacity
                      style={styles.removeBadge}
                      onPress={() => setMediaList(prev => prev.filter((_, idx) => idx !== i))}
                    >
                      <Ionicons name="close-circle" size={22} color="#ff4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>

            <TextInput
              style={[styles.input, { color: colors.textMain, backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.5)', borderColor: colors.glassBorder }]}
              placeholder="Moment Title..."
              placeholderTextColor={colors.textSecondary}
              value={title}
              onChangeText={setTitle}
            />

            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: 'top', color: colors.textMain, backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.5)', borderColor: colors.glassBorder }]}
              placeholder="Tell the story..."
              multiline
              placeholderTextColor={colors.textSecondary}
              value={description}
              onChangeText={setDescription}
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.btnCancel}>
                <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} style={[styles.btnSave, { backgroundColor: colors.primary }]}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnSaveText}>Pin to Map</Text>}
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>
      </Modal>

      {/* VIEWER MODAL */}
      <Modal visible={viewerVisible} transparent animationType="fade">
        <View style={[styles.viewerOverlay, { backgroundColor: 'rgba(0,0,0,0.95)' }]}>
          <View style={styles.viewerHeader}>
            <TouchableOpacity onPress={() => setViewerVisible(false)} style={styles.headerCircleBtn}>
              <Ionicons name="close" size={28} color="#fff" />
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

              <GlassCard style={[styles.enhancedDetails, { backgroundColor: isDark ? 'rgba(30,30,30,0.8)' : 'rgba(255,255,255,0.9)' }]}>
                <Text style={[styles.viewerTitle, { color: isDark ? '#fff' : '#000' }]}>{selectedJournal.title}</Text>
                <Text style={[styles.viewerDescription, { color: isDark ? '#ccc' : '#444' }]}>{selectedJournal.description}</Text>
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
  pinWrapper: { alignItems: 'center' },
  pinCircle: { width: 34, height: 34, borderRadius: 17, borderWidth: 2, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 3 },
  markerImage: { width: '100%', height: '100%' },
  pinTail: { width: 0, height: 0, borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 8, borderLeftColor: 'transparent', borderRightColor: 'transparent', marginTop: -2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '92%', padding: 20, borderRadius: 30, borderWidth: 1 },
  modalHeader: { fontSize: 24, fontWeight: '900', marginBottom: 15, letterSpacing: -0.5 },
  mediaSection: { height: 100, marginBottom: 15 },
  addMediaBtn: { width: 80, height: 80, borderRadius: 20, borderStyle: 'dashed', borderWidth: 1.5, justifyContent: 'center', alignItems: 'center', borderColor: '#888', marginRight: 10 },
  previewContainer: { width: 10, height: 80, borderRadius: 20, marginRight: 15, position: 'relative' },
  previewItem: { width: '100%', height: '100%', borderRadius: 20 },
  removeBadge: { position: 'absolute', top: -8, right: -8, backgroundColor: '#fff', borderRadius: 12, zIndex: 10 },
  input: { width: '100%', borderRadius: 15, padding: 15, marginBottom: 12, borderWidth: 1 },
  buttonRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 10 },
  btnCancel: { marginRight: 20 },
  btnSave: { paddingHorizontal: 25, paddingVertical: 12, borderRadius: 15, elevation: 2 },
  btnSaveText: { color: '#fff', fontWeight: 'bold' },
  viewerOverlay: { flex: 1 },
  viewerHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, zIndex: 10, position: 'absolute', top: 0, width: '100%' },
  headerCircleBtn: { backgroundColor: 'rgba(0,0,0,0.5)', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  mediaSlide: {   justifyContent: 'center', alightItems: 'center',marginBottom: 40, },
  fullMedia: { width: width, height: '100%', },
  viewerSingleDelete: { position: 'absolute', top: 550, right: 20, backgroundColor: 'rgba(255,0,0,0.8)', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, flexDirection: 'row', alignItems: 'center' },
  paginationRow: { flexDirection: 'row', justifyContent: 'center', position: 'absolute', bottom: height * 0.32, width: '100%' },
  dot: { width: 6, height: 6, borderRadius: 3, marginHorizontal: 4 },
  enhancedDetails: { marginHorizontal: 20, padding: 20, borderRadius: 25, position: 'absolute', bottom: 40, width: width - 40, elevation: 10 },
  viewerTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  viewerDescription: { fontSize: 16, lineHeight: 22 },
});

// COMPREHENSIVE DARK STYLE (Restores road lines and water)
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