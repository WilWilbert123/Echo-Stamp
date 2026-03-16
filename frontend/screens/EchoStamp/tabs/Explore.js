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

 
const GOOGLE_API_KEY = thisisit  

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

    const categories = [
        { id: '1', name: 'Nature', icon: 'leaf', color: '#4ADE80', type: 'park' },
        { id: '2', name: 'Cities', icon: 'business', color: '#60A5FA', type: 'tourist_attraction' },
        { id: '3', name: 'Food', icon: 'restaurant', color: '#FB923C', type: 'restaurant' },
        { id: '4', name: 'Museums', icon: 'map', color: '#A855F7', type: 'museum' },
    ];

    useEffect(() => {
        getInitialLocation();
    }, []);

    const getInitialLocation = async () => {
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert("Permission Denied", "Location access is needed to find places nearby.");
                setLoading(false);
                return;
            }
            let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            const coords = {
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            };
            setUserLocation(coords);
            // Default: Fetch nearby Nature spots on load
            fetchNearbyGoogle(loc.coords.latitude, loc.coords.longitude, categories[0]);
        } catch (e) {
            console.error("Location error", e);
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
            image: item.photos 
                ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${item.photos[0].photo_reference}&key=${GOOGLE_API_KEY}`
                : `https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=400`,
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
        try {
            const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=5000&type=${category.type}&key=${GOOGLE_API_KEY}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.status === "OK" && data.results.length > 0) {
                mapGoogleResults(data.results, category.color, category.icon);
            } else {
                // Fallback to text search if specific type yields no results
                const backupUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${category.name}&location=${lat},${lon}&radius=5000&key=${GOOGLE_API_KEY}`;
                const backupRes = await fetch(backupUrl);
                const backupData = await backupRes.json();
                
                if (backupData.status === "OK") {
                    mapGoogleResults(backupData.results || [], category.color, category.icon);
                } else {
                    setPlaces([]);
                }
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
        try {
            const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&location=${userLocation.latitude},${userLocation.longitude}&radius=5000&key=${GOOGLE_API_KEY}`;
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
            {/* Header / Search Area */}
            <View style={styles.headerPadding}>
                <View style={[styles.searchWrapper, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                    <Ionicons name="search" size={20} color={colors.textSecondary} />
                    <TextInput
                        placeholder="Search locations..."
                        placeholderTextColor={colors.textSecondary}
                        style={[styles.searchInput, { color: colors.textMain }]}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearch}
                        editable={!isFetching}
                    />
                </View>

                <View style={styles.categoryGrid}>
                    {categories.map((cat) => (
                        <TouchableOpacity 
                            key={cat.id} 
                            disabled={isFetching}
                            onPress={() => userLocation && fetchNearbyGoogle(userLocation.latitude, userLocation.longitude, cat)}
                            style={[styles.categoryCard, { 
                                backgroundColor: colors.glass, 
                                borderColor: selectedCategory?.id === cat.id ? cat.color : colors.glassBorder,
                                borderWidth: selectedCategory?.id === cat.id ? 2 : 1,
                                opacity: isFetching ? 0.6 : 1
                            }]}
                        >
                            <View style={[styles.iconCircle, { backgroundColor: `${cat.color}20` }]}>
                                <Ionicons name={cat.icon} size={22} color={cat.color} />
                            </View>
                            <Text style={[styles.categoryName, { color: colors.textMain }]}>{cat.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Map View */}
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
                                pinColor={place.categoryColor}
                                onPress={() => { setSelectedPlace(place); setModalVisible(true); }}
                            />
                        ))}
                    </MapView>
                    <TouchableOpacity 
                        style={[styles.recenterBtn, { backgroundColor: colors.primary }]}
                        onPress={() => updateMapRegion(places)}
                    >
                        <Ionicons name="locate" size={20} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Results List */}
                <Text style={[styles.sectionTitle, { color: colors.textMain }]}>
                    {searchQuery ? 'Results' : `Places Near You`}
                </Text>

                {loading ? (
                    <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
                ) : (
                    places.map((item) => (
                        <TouchableOpacity 
                            key={item.id} 
                            style={[styles.placeCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
                            onPress={() => { setSelectedPlace(item); setModalVisible(true); }}
                        >
                            <View style={[styles.imgContainer, { backgroundColor: isDark ? '#121b2e' : '#eee' }]}>
                                <Image source={{ uri: item.image }} style={[styles.placeImg, isDark && styles.darkenedImage]} />
                                {isDark && <View style={styles.imageThemeOverlay} />}
                                <View style={[styles.miniIcon, { backgroundColor: item.categoryColor || colors.primary }]}>
                                    <Ionicons name={item.categoryIcon || 'location'} size={12} color="white" />
                                </View>
                            </View>
                            <View style={styles.placeInfo}>
                                <Text style={[styles.placeName, { color: colors.textMain }]} numberOfLines={1}>{item.name}</Text>
                                <Text style={[styles.placeAddress, { color: colors.textSecondary }]} numberOfLines={1}>{item.address}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>

            {/* Place Details Modal */}
            <Modal visible={isModalVisible} animationType="slide" transparent={true} onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: isDark ? '#0F172A' : '#FFF' }]}>
                        <View style={styles.modalHandle} />
                        <View style={styles.modalHeroContainer}>
                            {selectedPlace?.image && (
                                <Image source={{ uri: selectedPlace.image }} style={[styles.modalHeroImg, isDark && styles.darkenedImage]} />
                            )}
                            {isDark && <View style={styles.imageThemeOverlay} />}
                        </View>
                        <Text style={[styles.modalTitle, { color: colors.textMain }]}>{selectedPlace?.name}</Text>
                        <Text style={[styles.modalSub, { color: colors.textSecondary }]}>{selectedPlace?.address}</Text>
                        
                        <TouchableOpacity 
                            style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                            onPress={() => openInMaps(selectedPlace.lat, selectedPlace.lon, selectedPlace.name)}
                        >
                            <Ionicons name="navigate-circle" size={24} color="white" style={{marginRight: 8}} />
                            <Text style={styles.actionBtnText}>Get Directions</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                            <Text style={{ color: colors.textSecondary, fontWeight: '700' }}>Close</Text>
                        </TouchableOpacity>
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
    headerPadding: { paddingHorizontal: 20, paddingTop: 10 },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
    searchWrapper: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, height: 55, borderRadius: 20, borderWidth: 1, marginBottom: 15 },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },
    categoryGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    categoryCard: { width: (width - 60) / 4, paddingVertical: 12, alignItems: 'center', borderRadius: 20 },
    iconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 5 },
    categoryName: { fontSize: 10, fontWeight: '800' },
    mapContainer: { width: '100%', height: 220, borderRadius: 30, overflow: 'hidden', marginBottom: 20, borderWidth: 1 },
    map: { width: '100%', height: '100%' },
    recenterBtn: { position: 'absolute', bottom: 15, right: 15, padding: 10, borderRadius: 12, elevation: 5 },
    sectionTitle: { fontSize: 18, fontWeight: '900', marginBottom: 15, marginLeft: 5 },
    placeCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 24, borderWidth: 1, marginBottom: 12 },
    imgContainer: { width: 60, height: 60, borderRadius: 15, overflow: 'hidden', position: 'relative' },
    placeImg: { width: '100%', height: '100%' },
    darkenedImage: { opacity: 0.5 },
    imageThemeOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: '#1d2c4d', opacity: 0.4 },
    miniIcon: { position: 'absolute', bottom: 0, right: 0, width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'white' },
    placeInfo: { flex: 1, marginLeft: 15 },
    placeName: { fontWeight: '800', fontSize: 15, marginBottom: 2 },
    placeAddress: { fontSize: 12, opacity: 0.6 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
    modalContent: { height: height * 0.75, borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 25, alignItems: 'center' },
    modalHandle: { width: 40, height: 4, backgroundColor: '#444', borderRadius: 2, marginBottom: 20 },
    modalHeroContainer: { width: '100%', height: 250, borderRadius: 25, overflow: 'hidden', marginBottom: 20, backgroundColor: '#000' },
    modalHeroImg: { width: '100%', height: '100%' },
    modalTitle: { fontSize: 22, fontWeight: '900', textAlign: 'center' },
    modalSub: { fontSize: 14, textAlign: 'center', marginTop: 8, marginBottom: 30 },
    actionBtn: { width: '100%', height: 60, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    actionBtnText: { color: 'white', fontWeight: '900', fontSize: 17 },
    closeBtn: { marginTop: 20, padding: 10 }
});

export default Explore;