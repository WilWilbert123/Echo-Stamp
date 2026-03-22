import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator, Alert, Dimensions,
    FlatList,
    Image,
    Modal,
    RefreshControl,
    StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useDispatch, useSelector } from 'react-redux';
import thisisit from "../../../config/config";
import { useTheme } from '../../../context/ThemeContext';
import { createCommunityMeetup, fetchAllEvents } from '../../../redux/eventSlice';

const { width, height } = Dimensions.get('window');
const GOOGLE_API_KEY = thisisit;

const Events = () => {
    const { colors, isDark } = useTheme();
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const mapRef = useRef(null);

    // Redux State
    const { allEvents = [], isPosting = false } = useSelector((state) => state.events || {});

    // Component State
    const [refreshing, setRefreshing] = useState(false);
    const [isHosting, setIsHosting] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    
    // Hosting Form State
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
                const region = {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.015,
                    longitudeDelta: 0.015,
                };
                setUserLocation(region);
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

    const getEventImage = (coords) => {
        if (!coords?.latitude) return 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400';
        return `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${coords.latitude},${coords.longitude}&fov=90&heading=235&pitch=10&key=${GOOGLE_API_KEY}`;
    };

    const handleManualSearch = async () => {
        if (!form.searchQuery.trim()) return;
        setForm(prev => ({ ...prev, isSearching: true }));
        
        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(form.searchQuery)}&inputtype=textquery&fields=photos,geometry,name,place_id,formatted_address&key=${GOOGLE_API_KEY}`
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

    const renderEventItem = ({ item }) => (
        <TouchableOpacity 
            activeOpacity={0.9}
            style={[styles.eventCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
            onPress={() => {
                Haptics.selectionAsync();
                navigation.navigate('Atlas', { location: item.coords });
            }}
        >
            <Image 
                source={{ uri: getEventImage(item.coords) }} 
                style={styles.eventImage}
                resizeMode="cover"
            />
            <View style={styles.eventDetails}>
                <View style={styles.row}>
                    <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '20' }]}>
                        <Text style={[styles.categoryText, { color: colors.primary }]}>{item.category || 'Event'}</Text>
                    </View>
                    <Text style={{color: colors.textSecondary, fontSize: 12, marginLeft: 8}}>
                        • {item.attendees?.length || 0} attending
                    </Text>
                </View>
                <Text style={[styles.eventTitle, { color: colors.textMain }]}>{item.title}</Text>
                <View style={styles.locationRow}>
                    <Ionicons name="location" size={14} color={colors.primary} />
                    <Text style={{ color: colors.textSecondary, fontSize: 13, flex: 1 }} numberOfLines={1}>
                        {item.locationName}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const ListHeader = () => (
        <View style={[styles.spotlightCard, { backgroundColor: colors.primary }]}>
            <View style={styles.spotlightTextContent}>
                <View style={styles.liveBadge}>
                    <View style={styles.dot} />
                    <Text style={styles.liveText}>LIVE FEED</Text>
                </View>
                <Text style={[styles.spotlightTitle, { color: '#FFF' }]}>Local Meetups</Text>
                <Text style={{ color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>Discover what's happening nearby</Text>
            </View>
            <Ionicons name="sparkles" size={40} color={'rgba(255,255,255,0.4)'} />
        </View>
    );

    const ListFooter = () => (
        <TouchableOpacity 
            onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setIsHosting(true);
            }}
            style={[styles.createCard, { borderColor: colors.primary, borderStyle: 'dashed' }]}
        >
            <Ionicons name="add-circle" size={32} color={colors.primary} />
            <View>
                <Text style={[styles.createText, { color: colors.textMain }]}>Host a Meetup</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Pin a location and gather the squad</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={{ flex: 1, backgroundColor: colors.background[0] }}>
            <FlatList
                data={allEvents}
                keyExtractor={(item, index) => item._id?.$oid || item._id || `event-${index}`}
                renderItem={renderEventItem}
                ListHeaderComponent={ListHeader}
                ListFooterComponent={ListFooter}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                }
            />

            <Modal visible={isHosting} animationType="slide" transparent={true} statusBarTranslucent={true}>
                <View style={[styles.modalOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.4)' }]}>
                    <View style={[styles.modalBox, { backgroundColor: isDark ? colors.background[0] : '#FFF' }]}>
                        <View style={[styles.modalHandle, { backgroundColor: colors.glassBorder }]} />
                        
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.textMain }]}>Create Event</Text>
                            <TouchableOpacity onPress={() => setIsHosting(false)}>
                                <Ionicons name="close-circle" size={28} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        
                        <FlatList
                            data={[{}]} 
                            keyExtractor={() => "form"}
                            renderItem={() => (
                                <View>
                                    <Text style={[styles.inputLabel, { color: colors.textMain }]}>Event Title</Text>
                                    <TextInput 
                                        placeholder="What's the vibe?"
                                        placeholderTextColor={colors.textSecondary}
                                        style={[styles.input, { color: colors.textMain, borderColor: colors.glassBorder, backgroundColor: colors.glass }]}
                                        onChangeText={(val) => setForm(p => ({ ...p, title: val }))}
                                        value={form.title}
                                    />

                                    <Text style={[styles.inputLabel, { color: colors.textMain }]}>Location</Text>
                                    <View style={[styles.searchContainer, { borderColor: colors.glassBorder, backgroundColor: colors.glass }]}>
                                        <TextInput 
                                            placeholder="Search a place..."
                                            placeholderTextColor={colors.textSecondary}
                                            style={[styles.searchInput, { color: colors.textMain }]}
                                            value={form.searchQuery}
                                            onChangeText={(val) => setForm(p => ({ ...p, searchQuery: val }))}
                                            onSubmitEditing={handleManualSearch}
                                        />
                                        <TouchableOpacity onPress={handleManualSearch} style={styles.searchIconBtn}>
                                            {form.isSearching ? <ActivityIndicator size="small" color={colors.primary} /> : <Ionicons name="search" size={20} color={colors.primary} />}
                                        </TouchableOpacity>
                                    </View>

                                    <View style={[styles.miniMapWrapper, { borderColor: colors.glassBorder }]}>
                                        <MapView
                                            ref={mapRef}
                                            provider={PROVIDER_GOOGLE}
                                            style={styles.miniMap}
                                            initialRegion={userLocation}
                                            customMapStyle={isDark ? darkMapStyle : []}
                                            showsUserLocation={true}
                                        >
                                            {form.selectedPlace && <Marker coordinate={form.selectedPlace.coords} />}
                                        </MapView>
                                    </View>

                                    {form.selectedPlace && (
                                        <View style={styles.previewContainer}>
                                            <Image 
                                                source={{ uri: getEventImage(form.selectedPlace.coords) }} 
                                                style={styles.resultImage} 
                                            />
                                            <View style={styles.resultOverlay}>
                                                <Text style={styles.resultName}>{form.selectedPlace.title}</Text>
                                                <Text style={styles.resultSub}>{form.selectedPlace.location}</Text>
                                            </View>
                                        </View>
                                    )}
                                    <View style={{height: 100}} /> 
                                </View>
                            )}
                            showsVerticalScrollIndicator={false}
                        />

                        <View style={[styles.modalActions, { borderTopWidth: 1, borderTopColor: colors.glassBorder }]}>
                            <TouchableOpacity 
                                style={[styles.actionBtn, { backgroundColor: colors.primary }]} 
                                onPress={handleHostMeetup}
                                disabled={isPosting}
                            >
                                {isPosting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.actionBtnText}>Publish Meetup</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    scrollContent: { padding: 20, paddingBottom: 120 },
    spotlightCard: { padding: 25, borderRadius: 30, flexDirection: 'row', alignItems: 'center', marginBottom: 25, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
    spotlightTextContent: { flex: 1 },
    liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start', marginBottom: 10 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ADE80', marginRight: 6 },
    liveText: { color: '#FFF', fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
    spotlightTitle: { fontSize: 26, fontWeight: '900' },
    
    eventCard: { borderRadius: 24, borderWidth: 1, marginBottom: 20, overflow: 'hidden'  },
    eventImage: { width: '100%', height: 200 },
    eventDetails: { padding: 18 },
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    categoryBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    categoryText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
    eventTitle: { fontSize: 20, fontWeight: '800', marginBottom: 6 },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    
    createCard: { padding: 20, borderRadius: 24, borderWidth: 2, alignItems: 'center', flexDirection: 'row', gap: 15, marginTop: 10 },
    createText: { fontWeight: '800', fontSize: 17 },
    
    modalOverlay: { flex: 1, justifyContent: 'center',paddingTop:150 },
    modalBox: { 
        borderTopLeftRadius: 35, 
        borderTopRightRadius: 35, 
        height: height * 0.85,
        width: '100%',
        paddingHorizontal: 20,
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.3,
        shadowRadius: 15
    },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 15 },
    modalHandle: { width: 45, height: 5, borderRadius: 10, alignSelf: 'center', marginTop: 10 },
    modalTitle: { fontSize: 22, fontWeight: '900' },
    inputLabel: { fontSize: 14, fontWeight: '700', marginBottom: 8, marginTop: 15, opacity: 0.8 },
    input: { width: '100%', padding: 16, borderRadius: 16, borderWidth: 1, fontSize: 16 },
    searchContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 16, paddingHorizontal: 12 },
    searchInput: { flex: 1, paddingVertical: 14, fontSize: 15 },
    searchIconBtn: { padding: 8 },
    miniMapWrapper: { width: '100%', height: 200, borderRadius: 24, overflow: 'hidden', marginTop: 15, borderWidth: 1 },
    miniMap: { width: '100%', height: '100%' },
    
    previewContainer: { marginTop: 20, borderRadius: 20, overflow: 'hidden', height: 150 },
    resultImage: { width: '100%', height: '100%' },
    resultOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 15, backgroundColor: 'rgba(0,0,0,0.6)' },
    resultName: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
    resultSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
    
    modalActions: { paddingVertical: 20, paddingBottom: 40 },
    actionBtn: { paddingVertical: 18, borderRadius: 20, alignItems: 'center', justifyContent: 'center'  },
    actionBtnText: { color: '#FFF', fontWeight: '900', fontSize: 18 }
});
const darkMapStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#1d2c4d" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#8ec3b9" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#1a3646" }] },
  { "featureType": "administrative.country", "elementType": "geometry.stroke", "stylers": [{ "color": "#4b6878" }] },
  { "featureType": "landscape.man_made", "elementType": "geometry.stroke", "stylers": [{ "color": "#334e87" }] },
  { "featureType": "landscape.natural", "elementType": "geometry", "stylers": [{ "color": "#023e58" }] },
  { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#283d6a" }] },
  { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#6f9ba5" }] }, // Fixed here
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#304a7d" }] },
  { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#98a5be" }] },
  { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#2c6675" }] },
  { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#255763" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#0e1626" }] },
  { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#4e6d70" }] }
];

export default Events;