import { useNavigation, useRoute } from '@react-navigation/native';
import { Audio } from 'expo-av';
import Constants from 'expo-constants';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Dimensions } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import thisisit from '../../../config/config';
import {
  addJournalAsync,
  deleteJournalAsync,
  getJournalsAsync,
  removeJournalMediaAsync
} from '../../../redux/journalSlice';
import { getActiveShares, startSharing, stopSharing } from '../../../redux/shareLocationSlice';
import { fetchAllUsers, fetchMyOutgoingShare, updateLiveLocation } from '../../../services/api';
import { uploadImageToCloudinary, uploadWithConcurrency } from '../../../services/cloudinary';
const { width } = Dimensions.get('window');
const GOOGLE_MAPS_APIKEY = thisisit;

export const useAtlas = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const mapRef = useRef(null);
  const voiceModuleRef = useRef(null);

  // Redux State
  const { list } = useSelector((state) => state.journals);
  const { user } = useSelector((state) => state.auth);

  // UI Visibility State
  const [modalVisible, setModalVisible] = useState(false);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [showStreetView, setShowStreetView] = useState(false);
  const [showDirections, setShowDirections] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const { activeShares, isLiveSharing: isLiveSharingActive } = useSelector((state) => state.shareLocation);

  // Functional State
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [tempCoords, setTempCoords] = useState(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [searchResult, setSearchResult] = useState(null);
  const [navigationOrigin, setNavigationOrigin] = useState(null); // Stable origin for directions
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [alternativeRoutes, setAlternativeRoutes] = useState([]); // New state for alternative routes
  const [travelMode, setTravelMode] = useState('driving'); // New state for travel mode
  const [estimatedTime, setEstimatedTime] = useState(null); // New state for estimated time
  const [arrowHeading, setArrowHeading] = useState(0);
  const [hasCenteredInitial, setHasCenteredInitial] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaList, setMediaList] = useState([]);

  // Filter valid markers for MapView
  const markers = useMemo(() => {
    return (list || []).filter(j => j.location && typeof j.location.lat === 'number');
  }, [list]);

  // Throttled Navigation Origin Logic: Only update route if user moves > 30 meters
  useEffect(() => {
    if (showDirections && userLocation) {
      if (!navigationOrigin) {
        setNavigationOrigin(userLocation);
        return;
      }
      
      const latDiff = Math.abs(userLocation.latitude - navigationOrigin.latitude);
      const lngDiff = Math.abs(userLocation.longitude - navigationOrigin.longitude);
      if (latDiff > 0.0003 || lngDiff > 0.0003) { // Approx 30 meters
        setNavigationOrigin(userLocation);
      }
    }
  }, [userLocation, showDirections]);

  // Handle Incoming Route Params  
  useEffect(() => {
    const params = route.params;
    if (!params) return;

    if (params.zoomTo) {
      const { latitude, longitude, journalId, title, address, image, autoNavigate } = params.zoomTo;
      const zoomRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };

      setSearchResult({
        name: title || "Echo Location",
        address: address || "Pinned Location",
        coords: { latitude, longitude },
        image: image || `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${latitude},${longitude}&key=${GOOGLE_MAPS_APIKEY}`
      });

      setDestination({ latitude, longitude });
      setSelectedJournal({
        _id: journalId,
        location: { lat: latitude, lng: longitude }
      });

      setTimeout(() => {
        mapRef.current?.animateToRegion(zoomRegion, 1500);
        if (autoNavigate) setShowDirections(true);
      }, 500);

      navigation.setParams({ zoomTo: undefined });
    }

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

      setTimeout(() => {
        mapRef.current?.animateToRegion({
          ...coords,
          latitudeDelta: 0.008,
          longitudeDelta: 0.008,
        }, 1500);
      }, 500);

      if (autoShowDirections) {
        setDestination(coords);
        setShowDirections(true);
      }

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
  }, [route.params]);

  // Auto-center on user location once when first acquired
  useEffect(() => {
    if (userLocation && mapRef.current && !hasCenteredInitial) {
      mapRef.current.animateToRegion({
        ...userLocation,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      }, 1000);
      setHasCenteredInitial(true);
    }
  }, [userLocation, hasCenteredInitial, mapRef.current]);

  // Initial Fetch
  useEffect(() => {
    const userId = user?._id || user?.id;
    if (userId) dispatch(getJournalsAsync(userId));
  }, [dispatch, user]);

  // Poll for active shares from friends into Redux
  useEffect(() => {
    const interval = setInterval(async () => {
      dispatch(getActiveShares());
    }, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []);

  // Sync my location if I'm sharing
  useEffect(() => {
    if (isLiveSharingActive && userLocation) {
      updateLiveLocation(userLocation).catch(e => console.log("Sync failed"));
    }
  }, [userLocation, isLiveSharingActive]);

  const openShareModal = async () => {
    setShareModalVisible(true);
    try {
      // Load all users for the list
      const usersRes = await fetchAllUsers();
      setAllUsers(usersRes.data);

      // Load who we are CURRENTLY sharing with to set toggles correctly
      const statusRes = await fetchMyOutgoingShare();
      setSelectedUserIds(statusRes.data || []);
    } catch (e) {
      console.log("Failed to initialize share modal", e);
    }
  };

  const toggleUserSelection = async (userId) => {
    const isCurrentlySelected = selectedUserIds.includes(userId);
    const newSelectedIds = isCurrentlySelected 
      ? selectedUserIds.filter(id => id !== userId) 
      : [...selectedUserIds, userId];
    
    setSelectedUserIds(newSelectedIds);

    try {
      if (newSelectedIds.length === 0) {
        await dispatch(stopSharing()).unwrap();
      } else {
        if (!userLocation) {
          Alert.alert("Error", "Could not determine your location to start sharing.");
          return;
        }
        await dispatch(startSharing({
          recipientIds: newSelectedIds,
          durationMinutes: 60
        })).unwrap();
      }
    } catch (e) {
      console.error("Location share toggle failed:", e);
    }
  };

  const handleSearch = async (queryOverride) => {
    const currentQuery = typeof queryOverride === 'string' ? queryOverride : searchQuery;
    if (!currentQuery.trim()) return;
    setIsSearching(true);
    setSearchResult(null);

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(currentQuery)}&inputtype=textquery&fields=photos,geometry,name,formatted_address&key=${GOOGLE_MAPS_APIKEY}`
      );
      const data = await response.json();

      if (data.candidates?.length > 0) {
        const place = data.candidates[0];
        const { lat, lng } = place.geometry.location;
        let imageUrl = place.photos?.[0] 
          ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${place.photos[0].photo_reference}&key=${GOOGLE_MAPS_APIKEY}`
          : null;

        setSearchResult({
          name: place.name,
          address: place.formatted_address,
          coords: { latitude: lat, longitude: lng },
          image: imageUrl
        });

        mapRef.current?.animateToRegion({
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015
        }, 1500);
      } else {
        Alert.alert("Location Not Found", "Try being more specific.");
      }
    } catch (e) {
      Alert.alert("Error", "Search failed.");
    } finally {
      setIsSearching(false);
      setSearchQuery('');
    }
  };

  // Keep a ref to handleSearch to use in Voice listeners safely
  const handleSearchRef = useRef(handleSearch);
  handleSearchRef.current = handleSearch;

  useEffect(() => {
    const isExpoGo = Constants.appOwnership === 'expo';
    if (isExpoGo) return;

    const setupVoice = async () => {
      try {
        const importedVoice = require('@react-native-voice/voice');
        voiceModuleRef.current = importedVoice?.default || importedVoice;
        const Voice = voiceModuleRef.current;
        if (!Voice) {
          console.log('Voice module could not be loaded.');
          return;
        }

        Voice.onSpeechStart = () => setIsListening(true);
        Voice.onSpeechEnd = () => setIsListening(false);
        Voice.onSpeechError = (e) => {
          console.log('Speech recognition error:', e);
          setIsListening(false);
        };
        Voice.onSpeechResults = (e) => {
          if (e.value && e.value.length > 0) {
            const spokenText = e.value[0];
            setSearchQuery(spokenText);
            if (handleSearchRef.current) handleSearchRef.current(spokenText);
          }
        };
      } catch (e) {
        console.log('Voice module not initialized:', e?.message || e);
      }
    };

    setupVoice();

    return () => {
      try {
        const Voice = voiceModuleRef.current;
        if (Voice && typeof Voice.destroy === 'function') {
          Voice.destroy().then(() => {
            if (Voice.removeAllListeners) Voice.removeAllListeners();
          }).catch(e => console.log('Voice destroy error:', e));
        }
      } catch (e) {
        console.log('Voice cleanup error:', e);
      }
    };
  }, []);

  const toggleListening = async () => {
    try {
      const Voice = voiceModuleRef.current;
      if (Constants.appOwnership === 'expo' || !Voice || typeof Voice.start !== 'function') {
        Alert.alert("Environment Error", "Voice Recognition is not available in Expo Go. Please use a Development or Production build.");
        return;
      }

      // Ensure microphone permissions are granted via Expo
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "Microphone access is required for voice search.");
        return;
      }

      if (isListening) {
        await Voice.stop();
      } else {
        setSearchQuery(''); // Clear previous search
        await Voice.start('en-US');
      }
    } catch (e) {
      if (e.message && e.message.includes('null')) {
        Alert.alert("Environment Error", "Voice Recognition module not found. This feature requires a Development Client build (not Expo Go).");
      } else {
        console.error("Voice recognition error:", e);
        Alert.alert("Voice Error", "Could not start voice recognition. Please try again.");
      }
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
      const uploadedUrls = await uploadWithConcurrency(mediaList || [], async (item) =>
        item.uri.startsWith('http') ? item.uri : await uploadImageToCloudinary(item.uri),
      3);
      
      let addr = "Pinned Location";
      try {
        const geo = await Location.reverseGeocodeAsync(tempCoords);
        if (geo && geo[0]) {
          addr = `${geo[0].street || ''}, ${geo[0].city || ''}`.replace(/^, /, '');
        }
      } catch (e) {
        console.log("Reverse geocode failed, using default address");
      }
      
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

  const cancelNavigation = () => {
    setShowDirections(false);
    setRouteCoordinates([]);
    setDestination(null);
    setAlternativeRoutes([]); // Clear alternative routes
    setEstimatedTime(null); // Clear estimated time
    setTravelMode('driving'); // Reset travel mode to default
  };

  const startNavigation = (coords) => {
    setDestination(coords);
    setNavigationOrigin(userLocation); // Initialize origin immediately to prevent "Line Gone" delay
    setShowDirections(true);
  };

  return {
    // Refs
    mapRef,
    // States
    list, user, modalVisible, setModalVisible, viewerVisible, setViewerVisible,
    selectedJournal, setSelectedJournal, tempCoords, setTempCoords,
    activeMediaIndex, setActiveMediaIndex, searchQuery, setSearchQuery,
    isSearching, loading, userLocation, setUserLocation, showDirections, 
    setShowDirections, showStreetView, setShowStreetView, destination,
    setDestination, searchResult, setSearchResult, routeCoordinates, 
    setRouteCoordinates, alternativeRoutes, setAlternativeRoutes, travelMode, setTravelMode, estimatedTime, setEstimatedTime, arrowHeading, setArrowHeading, title, setTitle,
    description, setDescription, mediaList, setMediaList, markers,
    shareModalVisible, setShareModalVisible, allUsers, selectedUserIds,
    userSearchQuery, setUserSearchQuery, activeShares, startNavigation,
    isListening, toggleListening,
    // Methods
    handleSearch, pickMedia, handleSave, handleDeleteJournal,
    handleRemoveSingleSavedMedia, cancelNavigation, openShareModal,
    toggleUserSelection,
    // Constants/Config
    GOOGLE_MAPS_APIKEY, width
  };
};
 