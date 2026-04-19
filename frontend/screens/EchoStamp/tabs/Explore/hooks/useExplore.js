import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { calculateDistance, CATEGORIES, formatGoogleResults, getRadiusForCategory, GOOGLE_API_KEY } from '../utils/Explore.utils';

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
    const [searchRadius, setSearchRadius] = useState(500);

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
    if (radius < 50) radius = 50;

    // Define which categories need keyword search instead of type search
    const categoriesNeedingKeywordSearch = [
        'Barbershops', 'Salons', 'Spas', 'Gyms', 'Dentists', 
        'Veterinarians', 'Optometrists', 'Clinics', 'Car Washes', 
        'Auto Repair', 'Dry Cleaners', 'Laundromats', 'Pet Stores',
        'Florists', 'Gift Shops', 'Bookstores', 'Hardware Stores'
    ];

    let url;
    
    if (categoriesNeedingKeywordSearch.includes(category.name)) {
        // Use keyword search for better results
        const keywordMap = {
            'Barbershops': 'barbershop hair cut',
            'Salons': 'hair salon beauty salon',
            'Spas': 'spa massage wellness',
            'Gyms': 'gym fitness center',
            'Dentists': 'dentist dental clinic',
            'Veterinarians': 'veterinarian animal clinic',
            'Optometrists': 'optometrist eye clinic',
            'Clinics': 'medical clinic health clinic',
            'Car Washes': 'car wash auto detailing',
            'Auto Repair': 'auto repair car mechanic',
            'Dry Cleaners': 'dry cleaner laundry',
            'Laundromats': 'laundromat laundry service',
            'Pet Stores': 'pet store pet supplies',
            'Florists': 'florist flower shop',
            'Gift Shops': 'gift shop souvenir',
            'Bookstores': 'bookstore books',
            'Hardware Stores': 'hardware store home improvement'
        };
        
        const searchKeyword = keywordMap[category.name] || category.name;
        url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchKeyword)}&location=${lat},${lon}&radius=${radius}&key=${GOOGLE_API_KEY}`;
    } else {
        // Use type search for reliable categories
        url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=${radius}&type=${category.type}&key=${GOOGLE_API_KEY}`;
    }

    try {
        console.log(`Fetching ${category.name} with ${categoriesNeedingKeywordSearch.includes(category.name) ? 'keyword' : 'type'} search`);
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.status === "OK") {
            let filteredResults = data.results;
            
            // Additional filtering for specific categories
            if (category.name === 'Barbershops') {
                filteredResults = data.results.filter(r => 
                    r.name.toLowerCase().includes('barber') || 
                    r.name.toLowerCase().includes('cut') ||
                    r.types?.includes('barber_shop')
                );
            }
            
            if (category.name === 'Salons') {
                filteredResults = data.results.filter(r => 
                    r.name.toLowerCase().includes('salon') || 
                    r.name.toLowerCase().includes('hair') ||
                    r.types?.includes('hair_care')
                );
            }
            
            if (category.name === 'Cafés') {
                filteredResults = data.results.filter(r => 
                    !r.name.toLowerCase().includes('hotel') &&
                    !r.name.toLowerCase().includes('restaurant')
                );
            }
            
            let formatted = formatGoogleResults(filteredResults, category.color, category.icon);
            
            formatted = formatted.map(place => ({
                ...place,
                distance: calculateDistance(lat, lon, place.lat, place.lon)
            }));
            
            formatted.sort((a, b) => a.distance - b.distance);
            
            if (formatted.length > 60) {
                formatted = formatted.slice(0, 60);
            }
            
            setPlaces(formatted);
            
            if (formatted.length > 0) {
                updateMapRegion(formatted);
            } else {
                Alert.alert("No Results", `No ${category.name} found within ${radius/1000}km of your location.`);
            }
        } else if (data.status === "ZERO_RESULTS") {
            setPlaces([]);
            Alert.alert("No Results", `No ${category.name} found nearby. Try increasing the search radius.`);
        } else {
            console.log('API returned status:', data.status);
            setPlaces([]);
            Alert.alert("Error", `Could not find ${category.name} nearby. Please try again.`);
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
            
            // Find the Restaurants category from CATEGORIES array
            const defaultCategory = CATEGORIES.find(cat => cat.name === 'Restaurants');
            
            if (defaultCategory) {
                await fetchNearbyGoogle(loc.coords.latitude, loc.coords.longitude, defaultCategory, 500);
            } else {
                console.error('Restaurants category not found');
                setLoading(false);
            }
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
        setSelectedCategory,
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