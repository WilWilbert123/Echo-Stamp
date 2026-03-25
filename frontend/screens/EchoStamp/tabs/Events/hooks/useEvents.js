import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { createCommunityMeetup, fetchAllEvents } from '../../../../../redux/eventSlice';
import { GOOGLE_API_KEY } from '../utils/Events.utils';

export const useEvents = () => {
  const dispatch = useDispatch();
  const mapRef = useRef(null);
  
  // Redux State
  const { allEvents = [], isPosting = false } = useSelector((state) => state.events || {});

  // UI State
  const [refreshing, setRefreshing] = useState(false);
  const [isHosting, setIsHosting] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [form, setForm] = useState({
    title: '',
    searchQuery: '',
    selectedPlace: null,
    isSearching: false
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        });
      }
      dispatch(fetchAllEvents());
    } catch (error) {
      console.error("Initialization Error:", error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await dispatch(fetchAllEvents());
    setRefreshing(false);
  }, [dispatch]);

  const handleManualSearch = async () => {
    if (!form.searchQuery.trim()) return;
    setForm(prev => ({ ...prev, isSearching: true }));
    
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(form.searchQuery)}&inputtype=textquery&fields=geometry,name,place_id,formatted_address&key=${GOOGLE_API_KEY}`
      );
      const data = await response.json();
      
      if (data.candidates?.length > 0) {
        const place = data.candidates[0];
        const newPlace = {
          id: place.place_id,
          title: place.name,
          location: place.formatted_address,
          coords: {
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng
          }
        };

        setForm(prev => ({ ...prev, selectedPlace: newPlace }));
        mapRef.current?.animateToRegion({
          ...newPlace.coords,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }, 1000);
      } else {
        Alert.alert("No Results", "Try a more specific name.");
      }
    } catch (e) { 
      Alert.alert("Search Error", "Could not find location."); 
    } finally { 
      setForm(prev => ({ ...prev, isSearching: false })); 
    }
  };

  const handleHostMeetup = async () => {
    if (!form.title.trim() || !form.selectedPlace) {
      Alert.alert("Missing Info", "Title and Location are required.");
      return;
    }

    const eventData = {
      title: form.title,
      placeId: form.selectedPlace.id,
      locationName: form.selectedPlace.title,
      coords: form.selectedPlace.coords, 
      category: "Community",
    };

    try { 
      await dispatch(createCommunityMeetup(eventData)).unwrap();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsHosting(false);
      setForm({ title: '', searchQuery: '', selectedPlace: null, isSearching: false });
      Alert.alert("Live!", "Your meetup is now visible.");
    } catch (error) {
      Alert.alert("Error", error || "Failed to post meetup.");
    }
  };

  return {
    allEvents, isPosting, refreshing, isHosting, setIsHosting,
    userLocation, form, setForm, onRefresh, handleManualSearch,
    handleHostMeetup, mapRef
  };
};