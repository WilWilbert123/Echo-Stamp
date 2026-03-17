import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    Linking,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import thisisit from "../../../config/config";
import { useTheme } from '../../../context/ThemeContext';

const { width, height } = Dimensions.get('window');
const GOOGLE_API_KEY = thisisit;

const Explore = () => {
    const { colors, isDark } = useTheme();
    const mapRef = useRef(null);

    const [userLocation, setUserLocation] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFetching, setIsFetching] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [isModalVisible, setModalVisible] = useState(false);

    // Categories matched with Google Places API "types"
    const categories = [
        { id: '1', name: 'Cities', icon: 'business', color: '#94A3B8', type: 'locality' },
        { id: '2', name: 'Food', icon: 'restaurant', color: '#FB923C', type: 'restaurant' },
        { id: '3', name: 'Café', icon: 'cafe', color: '#A16207', type: 'cafe' },
        { id: '4', name: 'Hotels', icon: 'bed', color: '#60A5FA', type: 'lodging' },
        { id: '5', name: 'Nature', icon: 'leaf', color: '#4ADE80', type: 'park' },
        { id: '6', name: 'Museums', icon: 'color-palette', color: '#A855F7', type: 'museum' },
        { id: '7', name: 'Shopping', icon: 'cart', color: '#EC4899', type: 'shopping_mall' },
        { id: '8', name: 'Nightlife', icon: 'beer', color: '#F43F5E', type: 'bar' },
    ];

    useEffect(() => {
        getInitialLocation();
    }, []);

    const getInitialLocation = async () => {
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert("Permission Denied", "Location access is needed.");
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
            // Default load "Cities" nearby on start
            fetchNearbyGoogle(loc.coords.latitude, loc.coords.longitude, categories[0]);
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    };

    const updateMapRegion = (newPlaces) => {
        if (newPlaces.length > 0 && mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: newPlaces[0].lat,
                longitude: newPlaces[0].lon,
                latitudeDelta: 0.04,
                longitudeDelta: 0.04,
            }, 1000);
        }
    };

    const mapGoogleResults = (results, color, icon) => {
        const formatted = results.map(item => ({
            id: item.place_id,
            name: item.name,
            address: item.vicinity || item.formatted_address || "Address unavailable",
            lat: item.geometry.location.lat,
            lon: item.geometry.location.lng,
            rating: item.rating || 0,
            image: item.photos
                ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${item.photos[0].photo_reference}&key=${GOOGLE_API_KEY}`
                : `https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800`,
            categoryIcon: icon,
            categoryColor: color
        }));
        setPlaces(formatted);
        updateMapRegion(formatted);
    };

    const fetchNearbyGoogle = async (lat, lon, category) => {
        if (isFetching || !GOOGLE_API_KEY) return;
        setLoading(true);
        setIsFetching(true);
        setSelectedCategory(category);

        let url;
        if (category.name === 'Cities') {
            // Use TextSearch for Cities to filter for locality types specifically in a wider radius
            url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=city&location=${lat},${lon}&radius=50000&type=locality&key=${GOOGLE_API_KEY}`;
        } else {
            url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=5000&type=${category.type}&key=${GOOGLE_API_KEY}`;
        }

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.status === "OK") {
                let filteredResults = data.results;
                if (category.type === 'cafe') {
                    filteredResults = data.results.filter(r => !r.name.toLowerCase().includes('hotel'));
                }
                mapGoogleResults(filteredResults, category.color, category.icon);
            } else {
                setPlaces([]);
            }
        } catch (error) {
            console.error("Fetch Error:", error);
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
                mapGoogleResults(data.results, colors.primary, 'location');
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

    const openInMaps = (lat, lon, label) => {
        const url = Platform.select({
            ios: `maps:0,0?q=${encodeURIComponent(label)}@${lat},${lon}`,
            android: `geo:0,0?q=${lat},${lon}(${encodeURIComponent(label)})`
        });
        Linking.openURL(url);
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.background[0] }}>
            <View style={styles.headerArea}>
                <View style={[styles.searchWrapper, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                    <Ionicons name="search" size={20} color={colors.textSecondary} />
                    <TextInput
                        placeholder="Search places or cities..."
                        placeholderTextColor={colors.textSecondary}
                        style={[styles.searchInput, { color: colors.textMain }]}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearch}
                        editable={!isFetching}
                    />
                </View>

                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    contentContainerStyle={styles.categoryScroll}
                >
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat.id}
                            onPress={() => userLocation && fetchNearbyGoogle(userLocation.latitude, userLocation.longitude, cat)}
                            style={[
                                styles.categoryPill,
                                {
                                    backgroundColor: selectedCategory?.id === cat.id ? cat.color : colors.glass,
                                    borderColor: selectedCategory?.id === cat.id ? cat.color : colors.glassBorder
                                }
                            ]}
                        >
                            <Ionicons
                                name={cat.icon}
                                size={16}
                                color={selectedCategory?.id === cat.id ? 'white' : cat.color}
                            />
                            <Text style={[
                                styles.categoryLabel,
                                { color: selectedCategory?.id === cat.id ? 'white' : colors.textMain }
                            ]}>
                                {cat.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={[styles.mapContainer, { borderColor: colors.glassBorder }]}>
                    <MapView
                        ref={mapRef}
                        provider={PROVIDER_GOOGLE}
                        style={styles.map}
                        initialRegion={userLocation}
                        showsUserLocation={true}
                        customMapStyle={isDark ? darkMapStyle : []}
                    >
                        {places.map((place) => (
                            <Marker
                                key={place.id}
                                coordinate={{ latitude: place.lat, longitude: place.lon }}
                                title={place.name}
                                onPress={() => { setSelectedPlace(place); setModalVisible(true); }}
                            >
                                <View style={[styles.customMarker, { backgroundColor: place.categoryColor }]}>
                                    <Ionicons name={place.categoryIcon} size={14} color="white" />
                                </View>
                            </Marker>
                        ))}
                    </MapView>
                    <TouchableOpacity
                        style={[styles.recenterBtn, { backgroundColor: colors.primary }]}
                        onPress={() => updateMapRegion(places)}
                    >
                        <Ionicons name="locate" size={20} color="white" />
                    </TouchableOpacity>
                </View>

                <View style={styles.resultsHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.textMain }]}>
                        {selectedCategory ? `${selectedCategory.name} Nearby` : 'Explore'}
                    </Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{places.length} found</Text>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
                ) : (
                    places.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[styles.placeCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
                            onPress={() => { setSelectedPlace(item); setModalVisible(true); }}
                        >
                            <View style={styles.imgContainer}>
                                <Image source={{ uri: item.image }} style={styles.placeImg} />
                                <View style={[styles.ratingBadge, { backgroundColor: colors.primary }]}>
                                    <Text style={styles.ratingText}>{item.rating}</Text>
                                </View>
                            </View>
                            <View style={styles.placeInfo}>
                                <Text style={[styles.placeName, { color: colors.textMain }]} numberOfLines={1}>{item.name}</Text>
                                <View style={styles.addressRow}>
                                    <Ionicons name="location-sharp" size={12} color={colors.textSecondary} />
                                    <Text style={[styles.placeAddress, { color: colors.textSecondary }]} numberOfLines={1}> {item.address}</Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>

           <Modal visible={isModalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
    <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: isDark ? '#0F172A' : '#FFF' }]}>
            
            {/* Absolute Positioned Close Button */}
            <TouchableOpacity 
                onPress={() => setModalVisible(false)} 
                style={[styles.closeBtnTop, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
            >
                <Ionicons name="close" size={24} color={colors.textMain} />
            </TouchableOpacity>

            <View style={styles.modalHandle} />
            
            <ScrollView showsVerticalScrollIndicator={false} style={{ width: '100%' }}>
                <View style={styles.modalHeroContainer}>
                    <Image source={{ uri: selectedPlace?.image }} style={styles.modalHeroImg} />
                </View>
                
                <Text style={[styles.modalTitle, { color: colors.textMain }]}>{selectedPlace?.name}</Text>
                <Text style={[styles.modalSub, { color: colors.textSecondary }]}>{selectedPlace?.address}</Text>

                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                    onPress={() => openInMaps(selectedPlace.lat, selectedPlace.lon, selectedPlace.name)}
                >
                    <Ionicons name="navigate" size={20} color="white" style={{ marginRight: 10 }} />
                    <Text style={styles.actionBtnText}>Go to {selectedCategory?.id === '1' ? 'City' : 'Place'}</Text>
                </TouchableOpacity>
                
                {/* Extra padding at the bottom for better scrolling */}
                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    </View>
</Modal>
        </View>
    );
};

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

const styles = StyleSheet.create({
    headerArea: { paddingHorizontal: 20, paddingTop: 15, paddingBottom: 5 },
    categoryScroll: { paddingRight: 20, marginBottom: 10, height: 50 },
    categoryPill: {  flexDirection: 'row',  alignItems: 'center',  paddingHorizontal: 16,  paddingVertical: 10,  borderRadius: 25, marginRight: 10,  borderWidth: 1,  height: 40  },
    categoryLabel: { marginLeft: 6, fontSize: 13, fontWeight: '800' },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
    searchWrapper: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, height: 50, borderRadius: 15, borderWidth: 1, marginBottom: 15 },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 15 },
    mapContainer: { width: '100%', height: 250, borderRadius: 30, overflow: 'hidden', marginBottom: 20, borderWidth: 1 },
    map: { width: '100%', height: '100%' },
    customMarker: { padding: 6, borderRadius: 12, borderWidth: 2, borderColor: 'white', elevation: 5 },
    recenterBtn: { position: 'absolute', bottom: 15, right: 15, padding: 10, borderRadius: 12, elevation: 5 },
    resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingHorizontal: 5 },
    sectionTitle: { fontSize: 20, fontWeight: '900' },
    placeCard: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 22, borderWidth: 1, marginBottom: 12 },
    imgContainer: { width: 75, height: 75, borderRadius: 18, overflow: 'hidden' },
    placeImg: { width: '100%', height: '100%' },
    ratingBadge: { position: 'absolute', top: 5, left: 5, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
    ratingText: { color: 'white', fontSize: 10, fontWeight: '900' },
    placeInfo: { flex: 1, marginLeft: 15 },
    placeName: { fontWeight: '900', fontSize: 16, marginBottom: 4 },
    addressRow: { flexDirection: 'row', alignItems: 'center' },
    placeAddress: { fontSize: 12, opacity: 0.7 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
    modalContent: { height: height * 0.75, borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 25, alignItems: 'center' },
    modalHandle: { width: 40, height: 4, backgroundColor: '#444', borderRadius: 2, marginBottom: 20 },
    modalHeroContainer: { width: '100%', height: 280, borderRadius: 25, overflow: 'hidden', marginBottom: 20 },
    modalHeroImg: { width: '100%', height: '100%' },
    modalTitle: { fontSize: 24, fontWeight: '900', textAlign: 'center' },
    modalSub: { fontSize: 14, textAlign: 'center', marginTop: 8, marginBottom: 30 },
    actionBtn: { width: '100%', height: 60, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    actionBtnText: { color: 'white', fontWeight: '900', fontSize: 17 },
    closeBtnTop: {  position: 'absolute',  top: 5, right: 10, zIndex: 10,  padding: 8,  borderRadius: 20,},
});

export default Explore;