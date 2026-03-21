import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator, Alert, Dimensions, Image, Modal,
    ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import thisisit from "../../../config/config";
import { useTheme } from '../../../context/ThemeContext';
import { createCommunityMeetup } from '../../../redux/eventSlice';

const { width } = Dimensions.get('window');
const GOOGLE_API_KEY = thisisit;

const Events = () => {
    const { colors, isDark } = useTheme();
    const navigation = useNavigation();
    const dispatch = useDispatch();

 
    const { isPosting } = useSelector((state) => state.events || { isPosting: false });

   
    const [places, setPlaces] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isHosting, setIsHosting] = useState(false);
    
  
    const [meetupTitle, setMeetupTitle] = useState('');
    const [selectedPlace, setSelectedPlace] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert("Permission Denied", "Location is needed to find hotspots.");
                return setIsLoading(false);
            }

            let location = await Location.getCurrentPositionAsync({});
            
          
            const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.coords.latitude},${location.coords.longitude}&radius=5000&type=restaurant|cafe|park&key=${GOOGLE_API_KEY}`;
            
            const response = await fetch(url);
            const data = await response.json();

            if (data.status === "OK") {
                const formatted = data.results.map((item) => ({
                    id: item.place_id,
                    title: item.name,
                    location: item.vicinity,
                    joined: Math.floor(Math.random() * 20), 
                    totalSlots: 50,
                    isHot: item.rating >= 4.5,
                    organizer: item.types[0].replace(/_/g, ' '),
                    image: item.photos 
                        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${item.photos[0].photo_reference}&key=${GOOGLE_API_KEY}`
                        : 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
                    avatars: [`https://i.pravatar.cc/150?u=${item.place_id}`],
                    coords: {
                        latitude: item.geometry.location.lat,
                        longitude: item.geometry.location.lng
                    }
                }));
                setPlaces(formatted);
            }
        } catch (error) {
            console.error("Discovery Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleHostMeetup = async () => {
        if (!meetupTitle || !selectedPlace) {
            Alert.alert("Wait!", "Please name your meetup and pick a location.");
            return;
        }

        const eventData = {
            title: meetupTitle,
            locationName: selectedPlace.title,
            address: selectedPlace.location,
            coordinates: {
                latitude: selectedPlace.coords.latitude,
                longitude: selectedPlace.coords.longitude
            },
            imageUrl: selectedPlace.image,
            category: selectedPlace.organizer
        };

        try {
            // TRIGGER REDUX & BACKEND
            await dispatch(createCommunityMeetup(eventData)).unwrap();
            
            setIsHosting(false);
            setMeetupTitle('');
            setSelectedPlace(null);
            
            Alert.alert("Success!", "Your Echo is now live on the map.", [
                { text: "View Map", onPress: () => navigation.navigate('Atlas', { location: eventData.coordinates }) },
                { text: "Dismiss" }
            ]);
        } catch (error) {
            Alert.alert("Host Failed", error || "Server connection lost.");
        }
    };

    const handleGoToAtlas = (event) => {
        navigation.navigate('Atlas', { 
            location: event.coords,
            autoShowDirections: true 
        });
    };

    if (isLoading) return (
        <View style={[styles.loaderContainer, { backgroundColor: colors.background[0] }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ color: colors.textSecondary, marginTop: 15 }}>Scanning nearby buzz...</Text>
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: colors.background[0] }}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                {/* Header Spotlight */}
                <View style={[styles.spotlightCard, { backgroundColor: colors.primary }]}>
                    <View style={styles.spotlightTextContent}>
                        <View style={styles.liveBadge}>
                            <View style={styles.dot} />
                            <Text style={styles.liveText}>TRENDING NEARBY</Text>
                        </View>
                        <Text style={[styles.spotlightTitle, { color: '#FFF' }]}>Local Echo Hotspots</Text>
                        <Text style={{ color: 'rgba(255,255,255,0.8)' }}>Discover where people are gathering!</Text>
                    </View>
                    <Ionicons name="flame" size={50} color={'rgba(255,255,255,0.3)'} />
                </View>

                {/* Popular List */}
                {places.map((event) => (
                    <TouchableOpacity 
                        key={event.id} 
                        style={[styles.eventCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
                        onPress={() => handleGoToAtlas(event)}
                    >
                        <Image source={{ uri: event.image }} style={styles.eventImage} />
                        <View style={styles.eventDetails}>
                            <Text style={[styles.organizerText, { color: colors.primary }]}>{event.organizer}</Text>
                            <Text style={[styles.eventTitle, { color: colors.textMain }]}>{event.title}</Text>
                            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{event.location}</Text>
                            
                            <View style={styles.footer}>
                                <Text style={{ color: colors.textSecondary, fontWeight: '700' }}>{event.joined} joined</Text>
                                <TouchableOpacity style={[styles.joinBtn, { backgroundColor: colors.primary }]} onPress={() => handleGoToAtlas(event)}>
                                    <Text style={styles.joinBtnText}>GET THERE</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}

                {/* Host Button */}
                <TouchableOpacity 
                    onPress={() => setIsHosting(true)}
                    style={[styles.createCard, { borderColor: colors.primary, borderStyle: 'dashed' }]}
                >
                    <Ionicons name="add-circle" size={30} color={colors.primary} />
                    <View>
                        <Text style={[styles.createText, { color: colors.textMain }]}>Host a Community Meetup</Text>
                        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Start a gathering at a local spot</Text>
                    </View>
                </TouchableOpacity>
            </ScrollView>

            {/* Hosting Modal - NOW CONNECTED TO REDUX */}
            <Modal visible={isHosting} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalBox, { backgroundColor: isDark ? '#1E293B' : '#FFF' }]}>
                        <Text style={[styles.modalTitle, { color: colors.textMain }]}>Create Meetup</Text>
                        
                        <TextInput 
                            placeholder="What's the vibe? (e.g. Morning Coffee)"
                            placeholderTextColor={colors.textSecondary}
                            style={[styles.input, { color: colors.textMain, borderColor: colors.glassBorder }]}
                            onChangeText={setMeetupTitle}
                        />

                        <Text style={{ color: colors.textSecondary, alignSelf: 'flex-start', marginBottom: 10 }}>Select Location:</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                            {places.slice(0, 8).map(p => (
                                <TouchableOpacity 
                                    key={p.id}
                                    onPress={() => setSelectedPlace(p)}
                                    style={[styles.placeChip, { 
                                        backgroundColor: selectedPlace?.id === p.id ? colors.primary : colors.glass,
                                        borderColor: colors.primary
                                    }]}
                                >
                                    <Text style={{ color: selectedPlace?.id === p.id ? '#FFF' : colors.textMain }}>{p.title}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
                            <TouchableOpacity 
                                style={[styles.soonBtn, { flex: 1, backgroundColor: '#EF4444' }]} 
                                onPress={() => setIsHosting(false)}
                                disabled={isPosting}
                            >
                                <Text style={styles.soonBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={[styles.soonBtn, { flex: 2, backgroundColor: colors.primary }]} 
                                onPress={handleHostMeetup}
                                disabled={isPosting}
                            >
                                {isPosting ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <Text style={styles.soonBtnText}>Go Live</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default Events;

const styles = StyleSheet.create({
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { padding: 20, paddingBottom: 100 },
    spotlightCard: { padding: 25, borderRadius: 25, flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
    spotlightTextContent: { flex: 1 },
    liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, alignSelf: 'flex-start', marginBottom: 10 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ADE80', marginRight: 6 },
    liveText: { color: '#FFF', fontSize: 10, fontWeight: '900' },
    spotlightTitle: { fontSize: 22, fontWeight: '900' },
    eventCard: { borderRadius: 25, borderWidth: 1, marginBottom: 20, overflow: 'hidden' },
    eventImage: { width: '100%', height: 160 },
    eventDetails: { padding: 15 },
    organizerText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
    eventTitle: { fontSize: 18, fontWeight: '900', marginVertical: 4 },
    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 },
    joinBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 15 },
    joinBtnText: { color: '#FFF', fontWeight: '800', fontSize: 12 },
    createCard: { padding: 20, borderRadius: 25, borderWidth: 2, alignItems: 'center', flexDirection: 'row', gap: 15, marginTop: 10 },
    createText: { fontWeight: '800', fontSize: 16 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    modalBox: { padding: 30, borderTopLeftRadius: 35, borderTopRightRadius: 35, alignItems: 'center' },
    modalTitle: { fontSize: 22, fontWeight: '900', marginBottom: 20 },
    input: { width: '100%', padding: 15, borderRadius: 15, borderWidth: 1, marginBottom: 20, fontSize: 16 },
    placeChip: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20, borderWidth: 1, marginRight: 10 },
    soonBtn: { paddingVertical: 15, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    soonBtnText: { color: '#FFF', fontWeight: '900', fontSize: 16 }
});