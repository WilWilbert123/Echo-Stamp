import { useNavigation, useRoute } from '@react-navigation/native';
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
import { uploadImageToCloudinary } from '../../../services/cloudinary';
const { width } = Dimensions.get('window');
const GOOGLE_MAPS_APIKEY = thisisit;

export const useAtlas = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const mapRef = useRef(null);

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

  // Functional State
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [tempCoords, setTempCoords] = useState(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [searchResult, setSearchResult] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [arrowHeading, setArrowHeading] = useState(0);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mediaList, setMediaList] = useState([]);

  // Filter valid markers for MapView
  const markers = useMemo(() => {
    return (list || []).filter(j => j.location && typeof j.location.lat === 'number');
  }, [list]);

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

  // Initial Fetch
  useEffect(() => {
    const userId = user?._id || user?.id;
    if (userId) dispatch(getJournalsAsync(userId));
  }, [dispatch, user]);

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

  const cancelNavigation = () => {
    setShowDirections(false);
    setRouteCoordinates([]);
    setDestination(null);
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
    setRouteCoordinates, arrowHeading, setArrowHeading, title, setTitle, 
    description, setDescription, mediaList, setMediaList, markers,
    // Methods
    handleSearch, pickMedia, handleSave, handleDeleteJournal, 
    handleRemoveSingleSavedMedia, cancelNavigation,
    // Constants/Config
    GOOGLE_MAPS_APIKEY, width
  };
};
 