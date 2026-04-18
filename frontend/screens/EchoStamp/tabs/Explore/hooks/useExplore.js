import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { calculateDistance, formatGoogleResults, getRadiusForCategory, GOOGLE_API_KEY } from '../utils/Explore.utils';

export const useExplore = (mapRef, colors) => {
    const [userLocation, setUserLocation] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFetching, setIsFetching] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null); // This exists
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [isModalVisible, setModalVisible] = useState(false);
    const [savedIds, setSavedIds] = useState([]);
    const [searchRadius, setSearchRadius] = useState(500); // Default 500 meters

    const updateMapRegion = useCallback((targetPlaces) => {
        if (targetPlaces?.length > 0 && mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: targetPlaces[0].lat,
                longitude: targetPlaces[0].lon,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            }, 1000);
        }
    }, [mapRef]);

    const fetchNearbyGoogle = async (lat, lon, category, customRadius = null) => {
        if (isFetching || !GOOGLE_API_KEY) return;
        setLoading(true);
        setIsFetching(true);
        setSelectedCategory(category);

        let radius = customRadius || getRadiusForCategory(category);
        
        if (category.name === 'Cities') {
            radius = 50000;
        }

        if (radius < 50 && category.name !== 'Cities') {
            radius = 50;
        }

        const url = category.name === 'Cities'
            ? `https://maps.googleapis.com/maps/api/place/textsearch/json?query=city&location=${lat},${lon}&radius=${radius}&type=locality&key=${GOOGLE_API_KEY}`
            : `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=${radius}&type=${category.type}&key=${GOOGLE_API_KEY}`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.status === "OK") {
                let filteredResults = data.results;
                
                if (category.type === 'cafe') {
                    filteredResults = data.results.filter(r => !r.name.toLowerCase().includes('hotel'));
                }
                
                let formatted = formatGoogleResults(filteredResults, category.color, category.icon);
                
                formatted = formatted.map(place => ({
                    ...place,
                    distance: calculateDistance(lat, lon, place.lat, place.lon)
                }));
                
                formatted.sort((a, b) => a.distance - b.distance);
                
                const maxResults = 60;
                if (formatted.length > maxResults) {
                    formatted = formatted.slice(0, maxResults);
                }
                
                setPlaces(formatted);
                
                if (formatted.length > 0) {
                    updateMapRegion(formatted);
                }
            } else {
                console.log('No results found:', data.status);
                setPlaces([]);
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Could not fetch nearby places. Please try again.");
        } finally {
            setLoading(false);
            setIsFetching(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery || isFetching || !userLocation) return;
        setLoading(true);
        setIsFetching(true);
        setSelectedCategory(null);
        try {
            const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&location=${userLocation.latitude},${userLocation.longitude}&radius=${searchRadius}&key=${GOOGLE_API_KEY}`;
            const response = await fetch(url);
            const data = await response.json();
            if (data.status === "OK") {
                let formatted = formatGoogleResults(data.results, colors.primary, 'location');
                
                formatted = formatted.map(place => ({
                    ...place,
                    distance: calculateDistance(userLocation.latitude, userLocation.longitude, place.lat, place.lon)
                }));
                
                formatted.sort((a, b) => a.distance - b.distance);
                setPlaces(formatted);
                updateMapRegion(formatted);
            } else {
                Alert.alert("No Results", "No places found matching your search.");
                setPlaces([]);
            }
        } catch (error) {
            Alert.alert("Search Error", "Check your connection.");
        } finally {
            setLoading(false);
            setIsFetching(false);
        }
    };

    const toggleSave = async (place) => {
        try {
            const savedData = await AsyncStorage.getItem('saved_places');
            let savedArray = savedData ? JSON.parse(savedData) : [];
            const isSaved = savedArray.some(item => item.id === place.id);

            if (isSaved) {
                savedArray = savedArray.filter(item => item.id !== place.id);
            } else {
                savedArray.push({
                    ...place,
                    organizer: selectedCategory?.name || 'Explore',
                });
            }
            await AsyncStorage.setItem('saved_places', JSON.stringify(savedArray));
            setSavedIds(savedArray.map(item => item.id));
        } catch (e) {
            Alert.alert("Error", "Could not update bookmark.");
        }
    };

    const getInitialLocation = async () => {
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setLoading(false);
                Alert.alert("Permission Needed", "Location permission is required to find nearby places.");
                return;
            }
            let loc = await Location.getCurrentPositionAsync({ 
                accuracy: Location.Accuracy.Highest
            });
            const coords = {
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            };
            setUserLocation(coords);
            // Default to Restaurants category
            const defaultCategory = { id: '51', name: 'Restaurants', icon: 'restaurant', color: '#FB923C', type: 'restaurant', radius: 500 };
            await fetchNearbyGoogle(loc.coords.latitude, loc.coords.longitude, defaultCategory, 500);
        } catch (e) {
            console.error(e);
            setLoading(false);
            Alert.alert("Location Error", "Could not get your location.");
        }
    };

    useEffect(() => {
        getInitialLocation();
        const loadSaved = async () => {
            const data = await AsyncStorage.getItem('saved_places');
            if (data) setSavedIds(JSON.parse(data).map(i => i.id));
        };
        loadSaved();
    }, []);

    return {
        userLocation, 
        searchQuery, 
        setSearchQuery, 
        places, 
        loading, 
        isFetching,
        selectedCategory, 
        setSelectedCategory, // Make sure this is included!
        selectedPlace, 
        setSelectedPlace, 
        isModalVisible, 
        setModalVisible,
        savedIds, 
        fetchNearbyGoogle, 
        handleSearch, 
        toggleSave, 
        updateMapRegion,
        searchRadius, 
        setSearchRadius
    };
};