import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator, Alert, Dimensions, Image,
    KeyboardAvoidingView, Modal, Platform, RefreshControl,
    ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useDispatch, useSelector } from 'react-redux';
import thisisit from "../../../config/config";
import { useTheme } from '../../../context/ThemeContext';

// Import Redux Actions
import { createCommunityMeetup, fetchAllEvents } from '../../../redux/eventSlice';

const { width, height } = Dimensions.get('window');
const GOOGLE_API_KEY = thisisit;

const Events = () => {
    const { colors, isDark } = useTheme();
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const mapRef = useRef(null);

    // Redux State with safety fallbacks
    const eventState = useSelector((state) => state.events || {});
    const allEvents = eventState?.allEvents || [];  
    const isLoading = eventState?.isLoading || false;
    const isPosting = eventState?.isPosting || false;

    // Component State
    const [refreshing, setRefreshing] = useState(false);
    const [isHosting, setIsHosting] = useState(false);
    
    // Hosting Form State
    const [meetupTitle, setMeetupTitle] = useState('');
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [searchQuery, setSearchQuery] = useState(''); 
    const [isSearching, setIsSearching] = useState(false); 

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                let location = await Location.getCurrentPositionAsync({});
                setUserLocation({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.015,
                    longitudeDelta: 0.015,
                });
            }
            // Fetch all events from MongoDB
            dispatch(fetchAllEvents());
        } catch (error) {
            console.error("Initialization Error:", error);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await dispatch(fetchAllEvents());
        setRefreshing(false);
    };

    const handleManualSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(searchQuery)}&inputtype=textquery&fields=photos,geometry,name,place_id,formatted_address&key=${GOOGLE_API_KEY}`
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
                    },
                    image: place.photos 
                        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${place.photos[0].photo_reference}&key=${GOOGLE_API_KEY}`
                        : 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400'
                };
                setSelectedPlace(newPlace);
                mapRef.current?.animateToRegion({
                    ...newPlace.coords,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                }, 1000);
            }
        } catch (e) { 
            Alert.alert("Search Error", "Could not find location."); 
        } finally { 
            setIsSearching(false); 
        }
    };

    const handleHostMeetup = async () => {
        if (!meetupTitle.trim() || !selectedPlace) {
            Alert.alert("Missing Info", "Title and Location are required.");
            return;
        }

        const eventData = {
            title: meetupTitle,
            placeId: selectedPlace.id,
            locationName: selectedPlace.title,
            description: `Join us at ${selectedPlace.title}!`,
            coords: { 
                latitude: selectedPlace.coords.latitude,
                longitude: selectedPlace.coords.longitude,
            },
            category: "Community",
        };

        try { 
            await dispatch(createCommunityMeetup(eventData)).unwrap();
            setIsHosting(false);
            setMeetupTitle('');
            setSelectedPlace(null);
            setSearchQuery('');
            Alert.alert("Live!", "Your meetup is now visible to everyone.");
        } catch (error) {
            Alert.alert("Error", error || "Failed to post meetup.");
        }
    };

    if (isLoading && !refreshing && allEvents.length === 0) return (
        <View style={[styles.loaderContainer, { backgroundColor: colors.background[0] }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ color: colors.textSecondary, marginTop: 15 }}>Loading Community...</Text>
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: colors.background[0] }}>
            <ScrollView 
                contentContainerStyle={styles.scrollContent} 
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            >
                {/* Community Header */}
                <View style={[styles.spotlightCard, { backgroundColor: colors.primary }]}>
                    <View style={styles.spotlightTextContent}>
                        <View style={styles.liveBadge}>
                            <View style={styles.dot} />
                            <Text style={styles.liveText}>COMMUNITY FEED</Text>
                        </View>
                        <Text style={[styles.spotlightTitle, { color: '#FFF' }]}>Local Meetups</Text>
                        <Text style={{color: 'rgba(255,255,255,0.8)', fontSize: 12}}>Events hosted by users near you</Text>
                    </View>
                    <Ionicons name="people" size={50} color={'rgba(255,255,255,0.3)'} />
                </View>

                {/* MongoDB Event List */}
                {allEvents.length > 0 ? (
                    allEvents.map((event) => (
                        <TouchableOpacity 
                            key={event._id || Math.random().toString()} 
                            style={[styles.eventCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
                            onPress={() => navigation.navigate('Atlas', { location: event.coords })}
                        >
                            <Image 
                                source={{ uri: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400' }} 
                                style={styles.eventImage} 
                            />
                            <View style={styles.eventDetails}>
                                <View style={styles.row}>
                                    <Text style={[styles.categoryText, { color: colors.primary }]}>{event.category || 'Event'}</Text>
                                    <Text style={{color: colors.textSecondary, fontSize: 10}}> • {event.attendees?.length || 0} joined</Text>
                                </View>
                                <Text style={[styles.eventTitle, { color: colors.textMain }]}>{event.title}</Text>
                                <View style={styles.locationRow}>
                                    <Ionicons name="location" size={12} color={colors.textSecondary} />
                                    <Text style={{ color: colors.textSecondary, fontSize: 12 }} numberOfLines={1}>{event.locationName}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="calendar-outline" size={60} color={colors.textSecondary} />
                        <Text style={{color: colors.textSecondary, marginTop: 10}}>No active meetups found.</Text>
                    </View>
                )}

                {/* Create Button */}
                <TouchableOpacity 
                    onPress={() => setIsHosting(true)}
                    style={[styles.createCard, { borderColor: colors.primary, borderStyle: 'dashed' }]}
                >
                    <Ionicons name="add-circle" size={30} color={colors.primary} />
                    <View>
                        <Text style={[styles.createText, { color: colors.textMain }]}>Host a Meetup</Text>
                        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Pin a location and gather the squad</Text>
                    </View>
                </TouchableOpacity>
            </ScrollView>

            <Modal visible={isHosting} animationType="slide" transparent={true}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalBox, { backgroundColor: isDark ? '#1E293B' : '#FFF' }]}>
                            <View style={styles.modalHandle} />
                            <Text style={[styles.modalTitle, { color: colors.textMain }]}>New Community Event</Text>
                            
                            <TextInput 
                                placeholder="Event Name (e.g. Basketball Night)"
                                placeholderTextColor={colors.textSecondary}
                                style={[styles.input, { color: colors.textMain, borderColor: colors.glassBorder }]}
                                onChangeText={setMeetupTitle}
                                value={meetupTitle}
                            />

                            <View style={[styles.searchContainer, { borderColor: colors.glassBorder, backgroundColor: colors.glass }]}>
                                <TextInput 
                                    placeholder="Search location to pin..."
                                    placeholderTextColor={colors.textSecondary}
                                    style={[styles.searchInput, { color: colors.textMain }]}
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    onSubmitEditing={handleManualSearch}
                                />
                                <TouchableOpacity onPress={handleManualSearch} style={styles.searchIconBtn}>
                                    {isSearching ? <ActivityIndicator size="small" color={colors.primary} /> : <Ionicons name="search" size={20} color={colors.primary} />}
                                </TouchableOpacity>
                            </View>

                            <View style={styles.miniMapWrapper}>
                                <MapView
                                    ref={mapRef}
                                    provider={PROVIDER_GOOGLE}
                                    style={styles.miniMap}
                                    initialRegion={userLocation}
                                    customMapStyle={isDark ? darkMapStyle : []}
                                    showsUserLocation={true}
                                >
                                    {selectedPlace && (
                                        <Marker coordinate={selectedPlace.coords}>
                                            <View style={[styles.miniMarker, { backgroundColor: colors.primary }]}>
                                                <Ionicons name="pin" size={14} color="white" />
                                            </View>
                                        </Marker>
                                    )}
                                </MapView>
                            </View>

                            <View style={styles.modalActions}>
                                <TouchableOpacity 
                                    style={[styles.actionBtn, { flex: 1, backgroundColor: isDark ? '#334155' : '#E2E8F0' }]} 
                                    onPress={() => setIsHosting(false)}
                                >
                                    <Text style={[styles.actionBtnText, { color: colors.textMain }]}>Close</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity 
                                    style={[styles.actionBtn, { flex: 2, backgroundColor: colors.primary }]} 
                                    onPress={handleHostMeetup}
                                    disabled={isPosting}
                                >
                                    {isPosting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.actionBtnText}>Create Event</Text>}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { padding: 20, paddingBottom: 100 },
    spotlightCard: { padding: 20, borderRadius: 25, flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    spotlightTextContent: { flex: 1 },
    liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, alignSelf: 'flex-start', marginBottom: 8 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ADE80', marginRight: 6 },
    liveText: { color: '#FFF', fontSize: 10, fontWeight: '900' },
    spotlightTitle: { fontSize: 22, fontWeight: '900' },
    eventCard: { borderRadius: 25, borderWidth: 1, marginBottom: 15, overflow: 'hidden' },
    eventImage: { width: '100%', height: 140 },
    eventDetails: { padding: 15 },
    row: { flexDirection: 'row', alignItems: 'center' },
    categoryText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
    eventTitle: { fontSize: 18, fontWeight: '900', marginVertical: 2 },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    emptyState: { alignItems: 'center', marginVertical: 40, opacity: 0.5 },
    createCard: { padding: 20, borderRadius: 20, borderWidth: 2, alignItems: 'center', flexDirection: 'row', gap: 15, marginTop: 10 },
    createText: { fontWeight: '800', fontSize: 16 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    modalBox: { padding: 20, borderTopLeftRadius: 30, borderTopRightRadius: 30, height: height * 0.88 },
    modalHandle: { width: 40, height: 4, backgroundColor: '#CBD5E1', borderRadius: 10, alignSelf: 'center', marginBottom: 15 },
    modalTitle: { fontSize: 20, fontWeight: '900', marginBottom: 20, textAlign: 'center' },
    input: { width: '100%', padding: 15, borderRadius: 15, borderWidth: 1, marginBottom: 12, fontSize: 16 },
    searchContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 15, marginBottom: 15, paddingHorizontal: 12 },
    searchInput: { flex: 1, paddingVertical: 12, fontSize: 14 },
    searchIconBtn: { padding: 5 },
    miniMapWrapper: { width: '100%', flex: 1, borderRadius: 25, overflow: 'hidden', borderWidth: 1, borderColor: '#CBD5E1' },
    miniMap: { width: '100%', height: '100%' },
    miniMarker: { padding: 6, borderRadius: 10, borderWidth: 1, borderColor: 'white' },
    modalActions: { flexDirection: 'row', gap: 12, width: '100%', marginTop: 20 },
    actionBtn: { paddingVertical: 16, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    actionBtnText: { color: '#FFF', fontWeight: '900', fontSize: 16 }
});

const darkMapStyle = [
    { "elementType": "geometry", "stylers": [{ "color": "#1e293b" }] },
    { "elementType": "labels.text.fill", "stylers": [{ "color": "#94a3b8" }] },
    { "elementType": "labels.text.stroke", "stylers": [{ "color": "#1e293b" }] },
    { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#334155" }] },
    { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#334155" }] },
    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#0f172a" }] }
];

export default Events;