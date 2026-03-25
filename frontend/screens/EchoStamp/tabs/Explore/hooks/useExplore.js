import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { CATEGORIES, formatGoogleResults, GOOGLE_API_KEY } from '../utils/Explore.utils';

export const useExplore = (mapRef, colors) => {
    const [userLocation, setUserLocation] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFetching, setIsFetching] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [isModalVisible, setModalVisible] = useState(false);
    const [savedIds, setSavedIds] = useState([]);

    const updateMapRegion = useCallback((targetPlaces) => {
        if (targetPlaces?.length > 0 && mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: targetPlaces[0].lat,
                longitude: targetPlaces[0].lon,
                latitudeDelta: 0.04,
                longitudeDelta: 0.04,
            }, 1000);
        }
    }, [mapRef]);

    const fetchNearbyGoogle = async (lat, lon, category) => {
        if (isFetching || !GOOGLE_API_KEY) return;
        setLoading(true);
        setIsFetching(true);
        setSelectedCategory(category);

        const url = category.name === 'Cities'
            ? `https://maps.googleapis.com/maps/api/place/textsearch/json?query=city&location=${lat},${lon}&radius=50000&type=locality&key=${GOOGLE_API_KEY}`
            : `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=5000&type=${category.type}&key=${GOOGLE_API_KEY}`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.status === "OK") {
                let filteredResults = data.results;
                if (category.type === 'cafe') {
                    filteredResults = data.results.filter(r => !r.name.toLowerCase().includes('hotel'));
                }
                const formatted = formatGoogleResults(filteredResults, category.color, category.icon);
                setPlaces(formatted);
                updateMapRegion(formatted);
            } else {
                setPlaces([]);
            }
        } catch (error) {
            console.error(error);
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
            const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&location=${userLocation.latitude},${userLocation.longitude}&radius=10000&key=${GOOGLE_API_KEY}`;
            const response = await fetch(url);
            const data = await response.json();
            if (data.status === "OK") {
                const formatted = formatGoogleResults(data.results, colors.primary, 'location');
                setPlaces(formatted);
                updateMapRegion(formatted);
            } else {
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
                return;
            }
            let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
            const coords = {
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            };
            setUserLocation(coords);
            fetchNearbyGoogle(loc.coords.latitude, loc.coords.longitude, CATEGORIES[0]);
        } catch (e) {
            setLoading(false);
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
        userLocation, searchQuery, setSearchQuery, places, loading, isFetching,
        selectedCategory, selectedPlace, setSelectedPlace, isModalVisible, setModalVisible,
        savedIds, fetchNearbyGoogle, handleSearch, toggleSave, updateMapRegion
    };
};