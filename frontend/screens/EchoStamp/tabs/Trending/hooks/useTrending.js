import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import thisisit from "../../../../../config/config";

const GOOGLE_API_KEY = thisisit;
const QUERIES = [   
    'top+tourist+attractions+in+Philippines',
    'hidden+gems+travel+Philippines',
    'best+street+food+locations+Philippines',
    'famous+landmarks+Philippines',
    'adventure+spots+Philippines'
];

export const useTrending = () => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [trendingLocations, setTrendingLocations] = useState([]);
    const [savedIds, setSavedIds] = useState([]);
    const [nextPageToken, setNextPageToken] = useState(null);
    const [queryIndex, setQueryIndex] = useState(0);

    // Data Categorization
    const viralLocations = useMemo(() => 
        [...trendingLocations].sort((a, b) => b.reviews - a.reviews), 
    [trendingLocations]);

    const popularNowLocations = useMemo(() => 
        [...trendingLocations].sort((a, b) => b.rating - a.rating), 
    [trendingLocations]);

    const formatPlaces = (results) => {
        return results.map(place => {
            const photoReference = place.photos?.[0]?.photo_reference;
            const imageUrl = photoReference
                ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoReference}&key=${GOOGLE_API_KEY}`
                : 'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?w=800';

            return {
                id: place.place_id,
                name: place.name,
                rating: place.rating || 4.5,
                reviews: place.user_ratings_total || 120,
                address: place.formatted_address || place.vicinity,
                lat: place.geometry.location.lat,
                lng: place.geometry.location.lng,
                image: imageUrl,
                streetView: `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${place.geometry.location.lat},${place.geometry.location.lng}&heading=151.78&pitch=-0.76&key=${GOOGLE_API_KEY}`,
            };
        });
    };

    const fetchTrendingData = async (token = null) => {
        try {
            if (!token && !loadingMore) setLoading(true);
            else setLoadingMore(true);

            let currentQuery = QUERIES[queryIndex % QUERIES.length];
            let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${currentQuery}&key=${GOOGLE_API_KEY}`;
            if (token) url += `&pagetoken=${token}`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.status === "OK") {
                const newPlaces = formatPlaces(data.results);
                setTrendingLocations(prev => {
                    const combined = token ? [...prev, ...newPlaces] : newPlaces;
                    return combined.filter((item, index, self) =>
                        index === self.findIndex((t) => t.id === item.id)
                    );
                });

                if (data.next_page_token) {
                    setNextPageToken(data.next_page_token);
                } else {
                    setNextPageToken(null);
                    setQueryIndex(prev => prev + 1);
                }
            }
        } catch (error) {
            console.error("Trending fetch error:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
        }
    };

    const loadSavedStatus = async () => {
        try {
            const savedData = await AsyncStorage.getItem('saved_places');
            if (savedData) {
                const parsed = JSON.parse(savedData);
                setSavedIds(parsed.map(item => item.id));
            }
        } catch (e) { console.error(e); }
    };

    const toggleSave = async (place) => {
        try {
            const savedData = await AsyncStorage.getItem('saved_places');
            let savedArray = savedData ? JSON.parse(savedData) : [];
            const isAlreadySaved = savedArray.find(item => item.id === place.id);

            if (isAlreadySaved) {
                savedArray = savedArray.filter(item => item.id !== place.id);
            } else {
                savedArray.push({
                    ...place,
                    savedAt: new Date().toISOString(),
                    location: place.address,
                    organizer: 'Trending'
                });
            }

            await AsyncStorage.setItem('saved_places', JSON.stringify(savedArray));
            setSavedIds(savedArray.map(item => item.id));
        } catch (e) { console.error(e); }
    };

    const onRefresh = () => {
        setRefreshing(true);
        setQueryIndex(0);
        fetchTrendingData();
    };

    const handleLoadMore = useCallback(() => {
        if (!loadingMore) {
            if (nextPageToken) {
                setTimeout(() => fetchTrendingData(nextPageToken), 2000);
            } else {
                fetchTrendingData();
            }
        }
    }, [loadingMore, nextPageToken]);

    useEffect(() => {
        fetchTrendingData();
        loadSavedStatus();
    }, []);

    return {
        loading, refreshing, loadingMore,
        viralLocations, popularNowLocations,
        savedIds, toggleSave, onRefresh, handleLoadMore,
        navigation
    };
};