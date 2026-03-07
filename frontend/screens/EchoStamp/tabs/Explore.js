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
import { useTheme } from '../../../context/ThemeContext';

const { width, height } = Dimensions.get('window');
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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
        { id: '1', name: 'Nature', icon: 'leaf', color: '#4ADE80', osmTag: 'leisure=park' },
        { id: '2', name: 'Cities', icon: 'business', color: '#60A5FA', osmTag: 'tourism=attraction' },
        { id: '3', name: 'Food', icon: 'restaurant', color: '#FB923C', osmTag: 'amenity=restaurant' },
        { id: '4', name: 'Hidden', icon: 'map', color: '#A855F7', osmTag: 'historic=monument' },
    ];

    useEffect(() => {
        getInitialLocation();
    }, []);

    const getInitialLocation = async () => {
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setLoading(false);
                return;
            }
            let loc = await Location.getCurrentPositionAsync({});
            const coords = {
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            };
            setUserLocation(coords);
            fetchNearbyByTag(loc.coords.latitude, loc.coords.longitude, categories[0]);
        } catch (e) {
            setLoading(false);
        }
    };

    const updateMapRegion = (newPlaces) => {
        if (newPlaces.length > 0 && mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: parseFloat(newPlaces[0].lat),
                longitude: parseFloat(newPlaces[0].lon),
                latitudeDelta: 0.03,
                longitudeDelta: 0.03,
            }, 1000);
        }
    };

    const safeFetch = async (url, retries = 2, backoff = 1500) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);
        try {
            const response = await fetch(url, { 
                signal: controller.signal,
                headers: { 'User-Agent': 'EchoStamp_v2_Stable' } 
            });
            clearTimeout(timeoutId);
            if ((response.status === 429 || response.status === 504) && retries > 0) {
                await sleep(backoff);
                return safeFetch(url, retries - 1, backoff * 2);
            }
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            if (retries > 0 && error.name !== 'AbortError') {
                await sleep(backoff);
                return safeFetch(url, retries - 1, backoff * 2);
            }
            throw error;
        }
    };

    const handleSearch = async () => {
        if (!searchQuery || isFetching) return;
        setLoading(true);
        setIsFetching(true);
        try {
            const data = await safeFetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=10`
            );
            const results = data.map(item => ({
                id: item.place_id.toString(),
                name: item.display_name.split(',')[0],
                address: item.display_name,
                lat: parseFloat(item.lat),
                lon: parseFloat(item.lon),
                image: `https://static-maps.yandex.ru/1.x/?ll=${item.lon},${item.lat}&z=15&l=map&size=450,450`,
                categoryIcon: 'location',
                categoryColor: colors.primary
            }));
            setPlaces(results);
            updateMapRegion(results);
        } catch (error) {
            Alert.alert("Search Error", "Could not find location.");
        } finally {
            setLoading(false);
            setIsFetching(false);
        }
    };

    const fetchNearbyByTag = async (lat, lon, category) => {
        if (isFetching) return;
        setLoading(true);
        setIsFetching(true);
        setSelectedCategory(category);
        try {
            const query = `[out:json][timeout:15];node["${category.osmTag.split('=')[0]}"="${category.osmTag.split('=')[1]}"](around:3000,${lat},${lon});out qt 15;`;
            const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
            const data = await safeFetch(url);
            if (data?.elements) {
                const results = data.elements.map(item => ({
                    id: item.id.toString(),
                    name: item.tags.name || "Local Spot",
                    address: item.tags["addr:street"] || "Nearby Location",
                    lat: item.lat,
                    lon: item.lon,
                    image: `https://static-maps.yandex.ru/1.x/?ll=${item.lon},${item.lat}&z=15&l=map&size=450,450`,
                    categoryIcon: category.icon,
                    categoryColor: category.color
                }));
                setPlaces(results);
                updateMapRegion(results);
            }
        } catch (error) {
            Alert.alert("Server Busy", "Try again in a few seconds.");
        } finally {
            setLoading(false);
            setIsFetching(false);
        }
    };

    const openInMaps = (lat, lon, label) => {
        const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
        const url = Platform.select({
            ios: `${scheme}${encodeURIComponent(label)}@${lat},${lon}`,
            android: `${scheme}${lat},${lon}(${encodeURIComponent(label)})`
        });
        Linking.openURL(url);
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.background[0] }}>
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
                            onPress={() => userLocation && fetchNearbyByTag(userLocation.latitude, userLocation.longitude, cat)}
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
                
                {/* INTERACTIVE MAP */}
                <View style={[styles.mapContainer, { borderColor: colors.glassBorder }]}>
                    <MapView
                        ref={mapRef}
                        provider={PROVIDER_GOOGLE}
                        style={styles.map}
                        region={userLocation}
                        showsUserLocation={true}
                        customMapStyle={isDark ? darkMapStyle : []}
                    >
                        {places.map((place) => (
                            <Marker
                                key={place.id}
                                coordinate={{ latitude: parseFloat(place.lat), longitude: parseFloat(place.lon) }}
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
                                <Image 
                                    source={{ uri: item.image }} 
                                    style={[styles.placeImg, isDark && styles.darkenedImage]} 
                                />
                                {/* THE TINT LAYER: This "paints" the image dark */}
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

            <Modal visible={isModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: isDark ? '#0F172A' : '#FFF' }]}>
                        <View style={styles.modalHandle} />
                        <View style={styles.modalHeroContainer}>
                            <Image source={{ uri: selectedPlace?.image }} style={[styles.modalHeroImg, isDark && styles.darkenedImage]} />
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

// Dark Mode styling for MapView
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

export default Explore;

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
    
    // --- DARK MODE IMAGE LOGIC ---
    imgContainer: { width: 60, height: 60, borderRadius: 15, overflow: 'hidden', position: 'relative' },
    placeImg: { width: '100%', height: '100%' },
    darkenedImage: { opacity: 0.5 }, // Dim the light image
    imageThemeOverlay: { 
        ...StyleSheet.absoluteFillObject, 
        backgroundColor: '#1d2c4d', // Use the dark geometry color from your map style
        opacity: 0.4 
    },

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