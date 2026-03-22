import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native'; // Added useRoute
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useVideoPlayer, VideoView } from 'expo-video';
import LottieView from 'lottie-react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import MapViewDirections from 'react-native-maps-directions';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useDispatch, useSelector } from 'react-redux';
import GlassCard from '../../components/GlassCard';
import thisisit from '../../config/config';
import { useTheme } from '../../context/ThemeContext';
import {
  addJournalAsync,
  deleteJournalAsync,
  getJournalsAsync,
  removeJournalMediaAsync
} from '../../redux/journalSlice';
import { uploadImageToCloudinary } from '../../services/cloudinary';
const { width, height } = Dimensions.get('window');
const GOOGLE_MAPS_APIKEY = thisisit;

const VideoPlayerItem = ({ uri, isVisible }) => {
  const player = useVideoPlayer(uri, (p) => {
    p.loop = true;
    p.muted = false;
    if (isVisible) p.play();
  });

  useEffect(() => {
    if (isVisible) player.play();
    else player.pause();
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
  const navigation = useNavigation();
  const route = useRoute(); // Hook to receive data from Trending
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);
  const { colors, isDark } = useTheme();

  const { list } = useSelector((state) => state.journals);
  const { user } = useSelector((state) => state.auth);

  const [modalVisible, setModalVisible] = useState(false);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [tempCoords, setTempCoords] = useState(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);

  // Location & Navigation State
  const [userLocation, setUserLocation] = useState(null);
  const [showDirections, setShowDirections] = useState(false);
  const [showStreetView, setShowStreetView] = useState(false);
  const [destination, setDestination] = useState(null);
  const [searchResult, setSearchResult] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [arrowHeading, setArrowHeading] = useState(0);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaList, setMediaList] = useState([]);

  // ---   HANDLES BOTH EXPLORE & TRENDING DATA ---
  useEffect(() => {
    const params = route.params;
    if (!params) return;

    // --- 1. HANDLE "VIEW ECHO" FROM FEED (Now mimics Search Result Overlay) ---
    if (params.zoomTo) {
      const {
        latitude,
        longitude,
        journalId,
        title,
        address,
        image,
        autoNavigate
      } = params.zoomTo;

      const zoomRegion = {
        latitude: latitude,
        longitude: longitude,
        latitudeDelta: 0.005, // Closer zoom for specific echoes
        longitudeDelta: 0.005,
      };

      // Trigger the GlassCard overlay (SearchResult) using the Feed data
      setSearchResult({
        name: title || "Echo Location",
        address: address || "Pinned Location",
        coords: { latitude, longitude },
        // Show the actual image from the post, or fallback to Street View preview
        image: image || `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${latitude},${longitude}&key=${GOOGLE_MAPS_APIKEY}`
      });

      // Set destination immediately for navigation logic
      setDestination({ latitude, longitude });

      // Set selectedJournal so the Street View WebView knows what to load
      setSelectedJournal({
        _id: journalId,
        location: { lat: latitude, lng: longitude }
      });

      // Animate to the specific journal location
      setTimeout(() => {
        mapRef.current?.animateToRegion(zoomRegion, 1500);

        // Auto-start the blue line if requested
        if (autoNavigate) {
          setShowDirections(true);
        }
      }, 500);

      // Clear params to prevent re-triggering on component updates
      navigation.setParams({ zoomTo: undefined });
      return;
    }

    // --- 2. HANDLE SEARCH RESULTS / LOCATION PICKER ---
    if (params.location || params.searchLocation) {
      const incoming = params.searchLocation || {
        coords: params.location,
        name: params.placeName || params.title || "Community Meetup",
        address: params.placeAddress || params.locationName || "",
        image: params.placeImage || params.image || null,
        autoShowDirections: params.autoShowDirections || false,
      };

      const { coords, name, address, image, autoShowDirections } = incoming;

      setSearchResult({
        name,
        address,
        coords,
        image: image || `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${coords.latitude},${coords.longitude}&key=${GOOGLE_MAPS_APIKEY}`
      });

      const region = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.008,
        longitudeDelta: 0.008,
      };

      setTimeout(() => {
        mapRef.current?.animateToRegion(region, 1500);
      }, 500);

      if (autoShowDirections) {
        setDestination(coords);
        setShowDirections(true);
      }

      // Clean up all possible search navigation params
      navigation.setParams({
        searchLocation: undefined,
        location: undefined,
        placeName: undefined,
        title: undefined,
        locationName: undefined,
        placeAddress: undefined,
        placeImage: undefined,
        image: undefined,
        autoShowDirections: undefined
      });
    }
  }, [route.params, list]);

  useEffect(() => {
    const userId = user?._id || user?.id;
    if (userId) dispatch(getJournalsAsync(userId));

    let locationSubscription;

    const startTracking = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "We need location access to show where you are.");
        return;
      }

      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 1,
        },
        (location) => {
          const newCoords = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
          setUserLocation(newCoords);

          if (showDirections && routeCoordinates.length > 0) {
            calculateHeading(newCoords, routeCoordinates);
          }
        }
      );
    };

    startTracking();
    return () => { if (locationSubscription) locationSubscription.remove(); };
  }, [dispatch, user, showDirections, routeCoordinates]);

  const calculateHeading = (currentPos, path) => {
    if (path.length < 2) return;
    const nextPoint = path[1];
    const r2d = 180 / Math.PI;
    const dLon = nextPoint.longitude - currentPos.longitude;
    const dLat = nextPoint.latitude - currentPos.latitude;
    const angle = Math.atan2(dLon, dLat) * r2d;
    setArrowHeading(angle);
  };

  const markers = useMemo(() => {
    return (list || []).filter(j => j.location && typeof j.location.lat === 'number');
  }, [list]);

  const cancelNavigation = () => {
    setShowDirections(false);
    setRouteCoordinates([]);
    setDestination(null);
  };

  const renderStreetViewHTML = (lat, lng) => `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="initial-scale=1.0, user-scalable=no">
    <style>
      html, body, #pano { height: 100%; margin: 0; padding: 0; background-color: #000; }
      #loader {
        position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
        text-align: center; color: white; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto;
        z-index: 10; transition: opacity 0.5s ease;
      }
      .spinner {
        border: 4px solid rgba(255, 255, 255, 0.1);
        border-left-color: #4285F4;
        border-radius: 50%; width: 40px; height: 40px;
        animation: spin 1s linear infinite; margin: 0 auto 15px;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
    </style>
  </head>
  <body>
    <div id="loader">
      <div class="spinner"></div>
      <div id="status">Finding best view...</div>
    </div>
    <div id="pano"></div>

    <script src="https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_APIKEY}"></script>
    <script>
      function calculateHeading(from, to) {
        if (!from || !to) return 0;
        const lat1 = from.lat() * Math.PI / 180;
        const lon1 = from.lng() * Math.PI / 180;
        const lat2 = to.lat * Math.PI / 180;
        const lon2 = to.lng * Math.PI / 180;
        const dLon = lon2 - lon1;
        const y = Math.sin(dLon) * Math.cos(lat2);
        const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
        return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
      }

      function init() {
        const loader = document.getElementById('loader');
        const status = document.getElementById('status');
        const sv = new google.maps.StreetViewService();
        const targetPoint = { lat: ${lat}, lng: ${lng} };

        // Search for outdoor road-view within 100m for better coverage
        sv.getPanorama({
          location: targetPoint,
          radius: 100,
          source: google.maps.StreetViewSource.OUTDOOR
        }, (data, statusResult) => {
          
          const panoOptions = {
            addressControl: false,
            fullscreenControl: false,
            motionTracking: true,
            motionTrackingControl: false,
            linksControl: true,    // The arrows
            panControl: true,      // The compass/pan tool
            zoomControl: true,     // Pinch to zoom is enabled by default, but this adds buttons
            clickToGo: true,       // Tap road to move
            enableCloseButton: false
          };

          if (statusResult === "OK") {
            // Calculate heading so camera faces the exact pin location
            const heading = calculateHeading(data.location.latLng, targetPoint);
            
            const panorama = new google.maps.StreetViewPanorama(
              document.getElementById('pano'), 
              { 
                ...panoOptions,
                position: data.location.latLng,
                pov: { heading: heading, pitch: 0 } 
              }
            );

            // Hide loader only when view is ready
            google.maps.event.addListenerOnce(panorama, 'status_changed', () => {
              loader.style.opacity = '0';
              setTimeout(() => loader.style.display = 'none', 500);
            });

          } else {
            status.innerHTML = "No road found. Using snapshot...";
            const fallbackPano = new google.maps.StreetViewPanorama(
              document.getElementById('pano'), 
              { 
                ...panoOptions,
                position: targetPoint 
              }
            );
            setTimeout(() => {
                loader.style.display = 'none';
            }, 2000);
          }
        });
      }
      google.maps.event.addDomListener(window, 'load', init);
    </script>
  </body>
</html>
`;

  const checkIsVideo = (uri) => {
    if (!uri || typeof uri !== 'string') return false;
    const url = uri.toLowerCase();
    return url.includes('/video/upload/') || url.endsWith('.mp4') || url.endsWith('.mov');
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchResult(null);

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(searchQuery)}&inputtype=textquery&fields=photos,geometry,name,formatted_address&key=${GOOGLE_MAPS_APIKEY}`
      );
      const data = await response.json();

      if (data.candidates?.length > 0) {
        const place = data.candidates[0];
        const { lat, lng } = place.geometry.location;
        let imageUrl = null;

        if (place.photos && place.photos.length > 0) {
          const photoRef = place.photos[0].photo_reference;
          imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoRef}&key=${GOOGLE_MAPS_APIKEY}`;
        }

        const region = {
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015
        };

        setSearchResult({
          name: place.name,
          address: place.formatted_address,
          coords: { latitude: lat, longitude: lng },
          image: imageUrl
        });

        mapRef.current?.animateToRegion(region, 1500);
      } else {
        Alert.alert("Location Not Found", "Try being more specific.");
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Search failed.");
    } finally {
      setIsSearching(false);
      setSearchQuery('');
    }
  };

  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 0.6,
    });
    if (!result.canceled) setMediaList([...mediaList, ...result.assets]);
  };

  const handleSave = async () => {
    const userId = user?._id || user?.id;
    if (!title) return Alert.alert("Wait!", "Title is required.");
    setLoading(true);
    try {
      const uploadedUrls = await Promise.all((mediaList || []).map(async (item) =>
        item.uri.startsWith('http') ? item.uri : await uploadImageToCloudinary(item.uri)
      ));
      const [geo] = await Location.reverseGeocodeAsync(tempCoords);
      const addr = geo ? `${geo.street || ''}, ${geo.city || ''}` : "Pinned Location";
      await dispatch(addJournalAsync({
        userId, title, description, media: uploadedUrls,
        location: { lat: tempCoords.latitude, lng: tempCoords.longitude, address: addr }
      })).unwrap();
      setModalVisible(false);
      setTitle(''); setDescription(''); setMediaList([]);
      Alert.alert("Success!", "Your moment has been pinned.");
    } catch (err) {
      Alert.alert("Save Failed", "We couldn't save the entry.");
    } finally {
      setLoading(false);
    }
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
        text: "Remove", style: "destructive", onPress: async () => {
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
          <Ionicons name="trash" size={23} color="white" />

        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background[0] }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />

      <View style={[styles.searchContainer, { top: insets.top + 10 }]}>
        <GlassCard style={[styles.searchBar, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
          {isSearching ? <ActivityIndicator size="small" color={colors.primary} /> : <Ionicons name="search" size={20} color={colors.primary} style={{ marginRight: 10 }} />}
          <TextInput
            style={[styles.searchInput, { color: colors.textMain }]}
            placeholder="Search places..."
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
        initialRegion={{ latitude: 14.5995, longitude: 120.9842, latitudeDelta: 0.1, longitudeDelta: 0.1 }}
        onLongPress={(e) => { setTempCoords(e.nativeEvent.coordinate); setModalVisible(true); }}
        customMapStyle={isDark ? darkMapStyle : []}
      >
        {showDirections && userLocation && destination && (
          <MapViewDirections
            origin={userLocation}
            destination={destination}
            apikey={GOOGLE_MAPS_APIKEY}
            strokeWidth={5}
            strokeColor={colors.primary}
            onReady={(result) => {
              setRouteCoordinates(result.coordinates);
              mapRef.current?.fitToCoordinates(result.coordinates, {
                edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
                animated: true,
              });
            }}
          />
        )}

        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude
            }}
            anchor={{ x: 0.5, y: 0.5 }}
            // STABILITY FIX: Setting this to false keeps the icon "standing" 
            // upright even if you rotate or tilt the map.
            flat={false}
            // If you want the Rider to always face "North" (Up), set this to 0.
            // If you want it to point where you are moving, keep arrowHeading.
            rotation={showDirections ? arrowHeading : 0}
          >
            <View style={{
              width: showDirections ? 50 : 35,
              height: showDirections ? 50 : 35,
              alignItems: 'center',
              justifyContent: 'center',
              // MIRROR EFFECT: Flipped horizontally
              transform: [
                { scaleX: showDirections ? -1 : 1 }
              ]
            }}>
              <LottieView
                source={
                  showDirections
                    ? require('../../assets/RIder.json')
                    : require('../../assets/location-map.json')
                }
                autoPlay
                loop
                style={{
                  width: '100%',
                  height: '100%',
                }}
              />
            </View>
          </Marker>
        )}

        {markers.map((journal) => (
          <Marker
            key={journal._id}
            coordinate={{ latitude: Number(journal.location.lat), longitude: Number(journal.location.lng) }}
            onPress={() => {
              setSelectedJournal(journal);
              setDestination({ latitude: Number(journal.location.lat), longitude: Number(journal.location.lng) });
              setActiveMediaIndex(0);
              setViewerVisible(true);
            }}
          >
            <View style={styles.pinWrapper}>
              <View style={[styles.pinCircle, { borderColor: colors.primary, backgroundColor: isDark ? '#1a1a1a' : '#fff' }]}>
                {journal.media?.[0] ? (
                  checkIsVideo(journal.media[0]) ? <Ionicons name="play" size={18} color={colors.primary} /> : <Image source={{ uri: journal.media[0] }} style={styles.markerImage} />
                ) : <Ionicons name="heart" size={16} color={colors.primary} />}
              </View>
              <View style={[styles.pinTail, { borderTopColor: colors.primary }]} />
            </View>
          </Marker>
        ))}
      </MapView>

      {showDirections && (
        <TouchableOpacity
          style={[styles.cancelNavBtn, { top: insets.top + 100 }]}
          onPress={cancelNavigation}
        >
          <GlassCard style={styles.cancelNavCard}>
            <Ionicons name="close-circle" size={20} color="#ff4444" />
            <Text style={{ color: '#ff4444', fontWeight: '700', marginLeft: 5 }}>Stop</Text>
          </GlassCard>
        </TouchableOpacity>
      )}

      {searchResult && (
        <View style={styles.searchCardContainer}>
          <GlassCard style={[styles.searchResultCard, { backgroundColor: colors.background[1], borderColor: colors.glassBorder }]}>
            <View style={{ alignItems: 'center' }}>
              {searchResult.image ? (
                <Image source={{ uri: searchResult.image }} style={styles.searchResultImg} />
              ) : (
                <View style={[styles.searchResultImg, { backgroundColor: colors.glassBorder, justifyContent: 'center', alignItems: 'center' }]}>
                  <Ionicons name="image-outline" size={24} color={colors.textSecondary} />
                </View>
              )}
              <View style={{ flex: 1, marginRight: -10, marginTop: 20 }}>
                <Text style={[styles.searchResultTitle, { color: colors.textMain }]} numberOfLines={1}>{searchResult.name}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12, width: 300 }} numberOfLines={1}>{searchResult.address}</Text>
              </View>
              <View style={{ position: 'absolute', right: -20, bottom: 235 }}>
                <TouchableOpacity onPress={() => setSearchResult(null)}>
                  <Ionicons name="close-circle" size={30} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.searchCardButtons}>
              <TouchableOpacity
                onPress={() => {
                  setSelectedJournal({
                    location: {
                      lat: searchResult.coords.latitude,
                      lng: searchResult.coords.longitude
                    }
                  });
                  setShowStreetView(true);
                }}
                style={[styles.actionBtn, { backgroundColor: '#4285F4', flex: 0.31 }]}
              >
                <Ionicons name="eye" size={18} color="#fff" />
                <Text style={styles.actionBtnText}>View</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => { setDestination(searchResult.coords); setShowDirections(true); }}
                style={[styles.actionBtn, { backgroundColor: '#34A853', flex: 0.31 }]}
              >
                <Ionicons name="navigate" size={18} color="#fff" />
                <Text style={styles.actionBtnText}>Go</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => { setTempCoords(searchResult.coords); setModalVisible(true); }}
                style={[styles.actionBtn, { backgroundColor: colors.primary, flex: 0.31 }]}
              >
                <Ionicons name="add" size={18} color="#fff" />
                <Text style={styles.actionBtnText}>Pin</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>
      )}

      {showStreetView && selectedJournal && (
        <View style={StyleSheet.absoluteFill}>
          <WebView source={{ html: renderStreetViewHTML(selectedJournal.location.lat, selectedJournal.location.lng) }} />
          <TouchableOpacity style={[styles.closeStreetView, { top: insets.top + 20 }]} onPress={() => setShowStreetView(false)}>
            <Ionicons name="close-circle" size={45} color="white" />
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={viewerVisible} transparent animationType="fade">
        <View style={styles.viewerOverlay}>
          <View style={styles.viewerHeader}>
            <TouchableOpacity onPress={() => setViewerVisible(false)} style={styles.headerCircleBtn}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity onPress={() => { setViewerVisible(false); setShowStreetView(true); }} style={[styles.headerCircleBtn, { backgroundColor: '#4285F4', marginRight: 12 }]}>
                <Ionicons name="eye" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setViewerVisible(false); setShowDirections(true); }} style={[styles.headerCircleBtn, { backgroundColor: '#34A853', marginRight: 12 }]}>
                <Ionicons name="navigate" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteJournal(selectedJournal?._id)} style={[styles.headerCircleBtn, { backgroundColor: '#e33030', marginRight: 12 }]}>
                <Ionicons name="trash-outline" size={22} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>

          {selectedJournal && (
            <View style={{ flex: 1 }}>
              <FlatList
                data={selectedJournal.media || []}
                renderItem={renderMediaItem}
                keyExtractor={(item, index) => index.toString()}
                horizontal pagingEnabled
                onScroll={(e) => setActiveMediaIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
                showsHorizontalScrollIndicator={false}
              />
              <View style={styles.paginationRow}>
                {(selectedJournal.media || []).map((_, i) => (
                  <View key={i} style={[styles.dot, { backgroundColor: i === activeMediaIndex ? colors.primary : '#555' }]} />
                ))}
              </View>
              <GlassCard style={[styles.enhancedDetails, { backgroundColor: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.9)' }]}>
                <Text style={[styles.viewerTitle, { color: isDark ? '#fff' : '#000' }]}>{selectedJournal.title}</Text>
                <Text style={[styles.viewerDescription, { color: isDark ? '#ccc' : '#444' }]}>{selectedJournal.description}</Text>
                <Text style={{ fontSize: 12, color: colors.primary, marginTop: 8 }}>📍 {selectedJournal.location?.address}</Text>
              </GlassCard>
            </View>
          )}
        </View>
      </Modal>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <GlassCard style={[styles.modalContent, { backgroundColor: colors.background[1], borderColor: colors.glassBorder }]}>
            <Text style={[styles.modalHeader, { color: colors.textMain }]}>Pin a Memory</Text>
            <View style={styles.mediaSection}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity style={[styles.addMediaBtn, { borderColor: colors.primary }]} onPress={pickMedia}>
                  <Ionicons name="add" size={30} color={colors.primary} />
                </TouchableOpacity>
                {(mediaList || []).map((item, i) => (
                  <View key={i} style={styles.previewContainer}>
                    <Image source={{ uri: item.uri }} style={styles.previewItem} />
                    <TouchableOpacity style={styles.removeBadge} onPress={() => setMediaList(prev => prev.filter((_, idx) => idx !== i))}>
                      <Ionicons name="close-circle" size={22} color="#ff4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
            <TextInput style={[styles.input, { color: colors.textMain, borderColor: colors.glassBorder }]} placeholder="Title" value={title} onChangeText={setTitle} placeholderTextColor={colors.textSecondary} />
            <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top', color: colors.textMain, borderColor: colors.glassBorder }]} placeholder="Story..." multiline value={description} onChangeText={setDescription} placeholderTextColor={colors.textSecondary} />
            <View style={styles.buttonRow}>
              <TouchableOpacity onPress={() => setModalVisible(false)}><Text style={{ color: colors.textSecondary }}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleSave} style={[styles.btnSave, { backgroundColor: colors.primary }]}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnSaveText}>Save Pin</Text>}
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>
      </Modal>
    </View>
  );
};



const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: width, height: height },
  userDot: { width: 18, height: 18, borderRadius: 9, borderWidth: 3, borderColor: 'white', elevation: 5 },
  searchContainer: { position: 'absolute', zIndex: 10, width: '100%', alignItems: 'center', paddingHorizontal: 20 },
  searchBar: { flexDirection: 'row', alignItems: 'center', width: '100%', height: 70, borderRadius: 20, paddingHorizontal: 15, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 16, fontWeight: '500' },
  searchCardContainer: { position: 'absolute', bottom: 30, width: '100%', paddingHorizontal: 20, zIndex: 10 },
  searchResultCard: { padding: 15, borderRadius: 25, borderWidth: 1, marginBottom: 60 },
  searchResultImg: { width: '100%', height: 175, borderRadius: 12 },
  searchResultTitle: { fontSize: 18, fontWeight: 'bold' },
  searchCardButtons: { flexDirection: 'row', marginTop: 15, justifyContent: 'space-between' },
  actionBtn: { flex: 0.31, flexDirection: 'row', height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  actionBtnText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
  pinWrapper: { alignItems: 'center' },
  pinCircle: { width: 34, height: 34, borderRadius: 17, borderWidth: 3, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  markerImage: { width: '100%', height: '100%' },
  pinTail: { width: 0, height: 0, borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 8, borderLeftColor: 'transparent', borderRightColor: 'transparent', marginTop: -1 },
  closeStreetView: { position: 'absolute', right: 20, zIndex: 999 },
  viewerOverlay: { flex: 1, backgroundColor: '#000' },
  viewerHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, zIndex: 100, position: 'absolute', top: 0, width: '100%' },
  headerCircleBtn: { backgroundColor: 'rgba(0,0,0,0.5)', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  mediaSlide: { width: width, height: height, justifyContent: 'center' },
  fullMedia: { width: width, height: '100%' },
  viewerSingleDelete: { position: 'absolute', top: 135, right: 10, padding: 10, borderRadius: 15, flexDirection: 'row', alignItems: 'center' },
  deleteBtnText: { color: 'white', marginLeft: 5, fontWeight: '600', fontSize: 12 },
  paginationRow: { flexDirection: 'row', justifyContent: 'center', position: 'absolute', bottom: 210, width: '100%' },
  dot: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 5 },
  enhancedDetails: { marginHorizontal: 20, padding: 25, borderRadius: 25, position: 'absolute', bottom: 40, width: width - 40 },
  viewerTitle: { fontSize: 26, fontWeight: 'bold', marginBottom: 8 },
  viewerDescription: { fontSize: 16, lineHeight: 22 },
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
  cancelNavBtn: { position: 'absolute', right: 20, zIndex: 20 },
  cancelNavCard: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 15, backgroundColor: 'rgba(0,0,0,0.6)' },
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