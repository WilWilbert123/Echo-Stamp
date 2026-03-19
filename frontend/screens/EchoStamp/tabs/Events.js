import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native'; // 1. Import Navigation
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import thisisit from "../../../config/config";
import { useTheme } from '../../../context/ThemeContext';

const { width } = Dimensions.get('window');
const GOOGLE_API_KEY = thisisit;

const Events = () => {
    const { colors, isDark } = useTheme();
    const navigation = useNavigation(); // 2. Initialize Navigation

    const [places, setPlaces] = useState([]);  
    const [isLoading, setIsLoading] = useState(true);          
    const [showSoon, setShowSoon] = useState(false);      

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert("Permission Denied", "We need location to find nearby trending spots.");
                setIsLoading(false);
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
          
            const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.coords.latitude},${location.coords.longitude}&radius=5000&type=restaurant|cafe|park&key=${GOOGLE_API_KEY}`;
            
            const response = await fetch(url);
            const data = await response.json();

            if (data.status === "OK") {
                const formatted = data.results.map((item) => {
                    const activityCount = Math.floor((item.user_ratings_total || 10) / 10);
                    const capacity = 100;
                    
                    return {
                        id: item.place_id,
                        title: item.name,
                        location: item.vicinity,
                        joined: activityCount > capacity ? capacity - 5 : activityCount,
                        totalSlots: capacity,
                        isHot: item.rating >= 4.5,
                        organizer: item.types[0].replace(/_/g, ' '),
                        image: item.photos 
                            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${item.photos[0].photo_reference}&key=${GOOGLE_API_KEY}`
                            : 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
                        avatars: [
                            `https://i.pravatar.cc/150?u=${item.place_id}1`,
                            `https://i.pravatar.cc/150?u=${item.place_id}2`,
                            `https://i.pravatar.cc/150?u=${item.place_id}3`
                        ],
                        coords: {
                            latitude: item.geometry.location.lat,
                            longitude: item.geometry.location.lng
                        }
                    };
                });
                setPlaces(formatted);
            }
        } catch (error) {
            console.error("Fetch Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // 3. New Function to navigate to Atlas
    const handleGoToAtlas = (event) => {
        navigation.navigate('Atlas', {
            location: event.coords,
            placeName: event.title,
            placeAddress: event.location,
            placeImage: event.image,
            autoShowDirections: true // This triggers the blue lines immediately
        });
    };

    if (isLoading) {
        return (
            <View style={[styles.loaderContainer, { backgroundColor: colors.background[0] }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ color: colors.textSecondary, marginTop: 12, fontWeight: '600' }}>
                    Scanning nearby buzz...
                </Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.background[0] }}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                <TouchableOpacity 
                    activeOpacity={0.9}
                    onPress={() => setShowSoon(true)}
                    style={[styles.spotlightCard, { backgroundColor: colors.primary }]}
                >
                    <View style={styles.spotlightTextContent}>
                        <View style={styles.liveBadge}>
                           <View style={styles.dot} />
                            <Text style={styles.liveText}>TRENDING NEARBY</Text>
                        </View>
                        <Text style={[styles.spotlightTitle, { color: '#FFF' }]}>Local Echo Hotspots</Text>
                        <Text style={[styles.spotlightSub, { color: 'rgba(255,255,255,0.8)' }]}>
                            Discover where people are gathering right now!
                        </Text>
                    </View>
                    <Ionicons name="flame" size={50} color={'rgba(255,255,255,0.2)'} />
                </TouchableOpacity>

                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionLabel, { color: colors.textMain }]}>Popular Gatherings</Text>
                    <TouchableOpacity onPress={loadData}>
                        <Ionicons name="refresh" size={20} color={colors.primary} />
                    </TouchableOpacity>
                </View>

                {places.map((event) => {
                    const occupancy = (event.joined / event.totalSlots) * 100;
                    return (
                        <TouchableOpacity 
                            key={event.id} 
                            activeOpacity={0.9}
                            onPress={() => handleGoToAtlas(event)} // Navigate on Card Press
                            style={[styles.eventCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
                        >
                            <View style={styles.imageWrapper}>
                                <Image source={{ uri: event.image }} style={[styles.eventImage, isDark && { opacity: 0.8 }]} />
                                {event.isHot && (
                                    <View style={styles.hotBadge}>
                                        <Ionicons name="trending-up" size={12} color="#FFF" />
                                        <Text style={styles.hotText}>TOP RATED</Text>
                                    </View>
                                )}
                                <View style={styles.priceTag}><Text style={styles.priceText}>OPEN</Text></View>
                            </View>
                            
                            <View style={styles.eventDetails}>
                                <View style={styles.infoContent}>
                                    <Text style={[styles.organizerText, { color: colors.primary }]}>{event.organizer}</Text>
                                    <Text style={[styles.eventTitle, { color: colors.textMain }]} numberOfLines={1}>{event.title}</Text>
                                    <View style={styles.row}>
                                        <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                                        <Text style={[styles.infoText, { color: colors.textSecondary }]} numberOfLines={1}>{event.location}</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.progressSection}>
                                <View style={[styles.progressBarBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#eee' }]}>
                                    <View style={[styles.progressBarFill, { width: `${occupancy}%`, backgroundColor: colors.primary }]} />
                                </View>
                                <Text style={[styles.progressText, { color: colors.textSecondary }]}>High activity detected</Text>
                            </View>

                            <View style={[styles.footer, { borderTopColor: colors.glassBorder }]}>
                                <View style={styles.attendees}>
                                    <View style={styles.avatarStack}>
                                        {event.avatars.map((url, index) => (
                                            <Image key={index} source={{ uri: url }} style={[styles.avatar, { left: index * -8, borderColor: isDark ? '#1E293B' : '#FFF', zIndex: 10 - index }]} />
                                        ))}
                                    </View>
                                    <Text style={[styles.attendeeText, { color: colors.textSecondary, marginLeft: 10 }]}>{event.joined} exploring</Text>
                                </View>
                                <TouchableOpacity 
                                    style={[styles.joinBtn, { backgroundColor: colors.primary }]} 
                                    onPress={() => handleGoToAtlas(event)} // Navigate on Button Press
                                >
                                    <Text style={[styles.joinBtnText, { color: '#FFF' }]}>GET THERE</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    );
                })}

                <TouchableOpacity 
                    onPress={() => setShowSoon(true)}
                    style={[styles.createCard, { borderColor: colors.glassBorder, borderStyle: 'dashed' }]}
                >
                    <View style={[styles.addIconCircle, { backgroundColor: colors.glass }]}>
                        <Ionicons name="add" size={24} color={colors.primary} />
                    </View>
                    <View>
                        <Text style={[styles.createText, { color: colors.textMain }]}>Host a Community Meetup</Text>
                        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Invite others to join you at a spot</Text>
                    </View>
                </TouchableOpacity>
            </ScrollView>

            <Modal transparent={true} visible={showSoon} animationType="fade" onRequestClose={() => setShowSoon(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalBox, { backgroundColor: isDark ? '#1E293B' : '#FFF' }]}>
                        <View style={[styles.soonIcon, { backgroundColor: colors.primary + '20' }]}>
                            <Ionicons name="construct" size={40} color={colors.primary} />
                        </View>
                        <Text style={[styles.soonTitle, { color: colors.textMain }]}>Feature Incoming</Text>
                        <Text style={[styles.soonSub, { color: colors.textSecondary }]}>
                            We're currently preparing the Echo Engine for personal hosting. You'll be able to create events soon!
                        </Text>
                        <TouchableOpacity style={[styles.soonBtn, { backgroundColor: colors.primary }]} onPress={() => setShowSoon(false)}>
                            <Text style={[styles.soonBtnText, { color: '#FFF' }]}>Got it!</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default Events;

// Styles remain identical to your previous version...
const styles = StyleSheet.create({
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 120, paddingTop: 10 },
    spotlightCard: { padding: 25, borderRadius: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 25 },
    spotlightTextContent: { flex: 1 },
    liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, alignSelf: 'flex-start', marginBottom: 10 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ADE80', marginRight: 6 },
    liveText: { color: '#FFF', fontSize: 10, fontWeight: '900' },
    spotlightTitle: { fontSize: 22, fontWeight: '900', marginBottom: 4 },
    spotlightSub: { fontSize: 13, fontWeight: '600' },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    sectionLabel: { fontSize: 20, fontWeight: '900' },
    eventCard: { borderRadius: 30, borderWidth: 1, marginBottom: 20, overflow: 'hidden' },
    imageWrapper: { width: '100%', height: 180, position: 'relative' },
    eventImage: { width: '100%', height: '100%' },
    hotBadge: { position: 'absolute', top: 15, left: 15, backgroundColor: '#FB923C', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
    hotText: { color: '#FFF', fontSize: 10, fontWeight: '900', marginLeft: 4 },
    priceTag: { position: 'absolute', top: 15, right: 15, backgroundColor: 'rgba(74, 222, 128, 0.9)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
    priceText: { color: '#FFF', fontSize: 10, fontWeight: '900' },
    eventDetails: { paddingHorizontal: 20, paddingTop: 20 },
    infoContent: { flex: 1 },
    organizerText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', marginBottom: 2 },
    eventTitle: { fontSize: 20, fontWeight: '900', marginBottom: 4 },
    row: { flexDirection: 'row', alignItems: 'center' },
    infoText: { fontSize: 12, marginLeft: 5, fontWeight: '500', flex: 1 },
    progressSection: { paddingHorizontal: 20, marginVertical: 15 },
    progressBarBg: { width: '100%', height: 6, borderRadius: 3, overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 3 },
    progressText: { fontSize: 11, fontWeight: '700', marginTop: 6 },
    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, borderTopWidth: 1 },
    attendees: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    avatarStack: { flexDirection: 'row', width: 45 },
    avatar: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, position: 'absolute' },
    attendeeText: { fontSize: 12, fontWeight: '700' },
    joinBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 15 },
    joinBtnText: { fontWeight: '900', fontSize: 12 },
    createCard: { padding: 20, borderRadius: 30, borderWidth: 2, alignItems: 'center', flexDirection: 'row', gap: 15, marginTop: 10 },
    addIconCircle: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(128,128,128,0.2)' },
    createText: { fontWeight: '800', fontSize: 15 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
    modalBox: { width: width * 0.85, padding: 30, borderRadius: 35, alignItems: 'center' },
    soonIcon: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    soonTitle: { fontSize: 20, fontWeight: '900', textAlign: 'center', marginBottom: 12 },
    soonSub: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 25, opacity: 0.8 },
    soonBtn: { width: '100%', paddingVertical: 15, borderRadius: 20, alignItems: 'center' },
    soonBtnText: { fontWeight: '900', fontSize: 15 }
});