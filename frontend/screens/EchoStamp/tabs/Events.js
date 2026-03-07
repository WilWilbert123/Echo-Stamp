import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from '../../../context/ThemeContext';

const { width } = Dimensions.get('window');

const Events = () => {
    const { colors, isDark } = useTheme();

    // --- STATE MANAGEMENT ---
    const [upcomingEvents, setUpcomingEvents] = useState([]); // Real data will live here
    const [isLoading, setIsLoading] = useState(true);        // Loading state
    const [showSoon, setShowSoon] = useState(false);         // Modal state

    // --- DATA FETCHING SIMULATION ---
    // In a real app, this is where you'd call Firebase or your API
    const fetchEvents = async () => {
        try {
            setIsLoading(true);
            
            // Simulating a 1.5s network delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            const realData = [
                {
                    id: '1',
                    title: 'Manila Sunset Photowalk',
                    date: 'OCT 24',
                    time: '4:30 PM',
                    location: 'Baywalk, Roxas Blvd',
                    joined: 42,
                    totalSlots: 50,
                    isHot: true,
                    organizer: 'Manila Photo Club',
                    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
                    avatars: ['https://i.pravatar.cc/150?u=1', 'https://i.pravatar.cc/150?u=2', 'https://i.pravatar.cc/150?u=3']
                },
                {
                    id: '2',
                    title: 'Hidden Cafe Discovery',
                    date: 'OCT 26',
                    time: '10:00 AM',
                    location: 'Binondo, Manila',
                    joined: 15,
                    totalSlots: 20,
                    isHot: false,
                    organizer: 'Coffee Explorers',
                    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800',
                    avatars: ['https://i.pravatar.cc/150?u=4', 'https://i.pravatar.cc/150?u=5', 'https://i.pravatar.cc/150?u=6']
                }
            ];

            setUpcomingEvents(realData);
        } catch (error) {
            console.error("Fetch Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Run fetch on mount
    useEffect(() => {
        fetchEvents();
    }, []);

    // --- LOADING RENDER ---
    if (isLoading) {
        return (
            <View style={[styles.loaderContainer, { backgroundColor: colors.background[0] }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ color: colors.textSecondary, marginTop: 12, fontWeight: '600' }}>
                    Syncing with the world...
                </Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.background[0] }}>
            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* --- Spotlight Banner --- */}
                <TouchableOpacity 
                    activeOpacity={0.9}
                    onPress={() => setShowSoon(true)}
                    style={[styles.spotlightCard, { backgroundColor: colors.primary }]}
                >
                    <View style={styles.spotlightTextContent}>
                        <View style={styles.liveBadge}>
                            <View style={styles.dot} />
                            <Text style={styles.liveText}>LIVE NOW</Text>
                        </View>
                        <Text style={[styles.spotlightTitle, { color: isDark ? '#000' : '#FFF' }]}>Global Echo Day</Text>
                        <Text style={[styles.spotlightSub, { color: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.8)' }]}>
                            Join 5,000+ explorers today!
                        </Text>
                    </View>
                    <Ionicons name="sparkles" size={50} color={isDark ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)'} />
                </TouchableOpacity>

                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionLabel, { color: colors.textMain }]}>Upcoming Meetups</Text>
                    <TouchableOpacity onPress={() => setShowSoon(true)}>
                        <Text style={{ color: colors.primary, fontWeight: '700' }}>See all</Text>
                    </TouchableOpacity>
                </View>

                {/* --- Dynamic Event Cards --- */}
                {upcomingEvents.map((event) => {
                    const occupancy = (event.joined / event.totalSlots) * 100;
                    return (
                        <TouchableOpacity 
                            key={event.id} 
                            activeOpacity={0.9}
                            style={[styles.eventCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
                        >
                            <View style={styles.imageWrapper}>
                                <Image source={{ uri: event.image }} style={[styles.eventImage, isDark && { opacity: 0.7 }]} />
                                {isDark && <View style={styles.darkImageOverlay} />}
                                {event.isHot && (
                                    <View style={styles.hotBadge}>
                                        <Ionicons name="flame" size={12} color="#FFF" />
                                        <Text style={styles.hotText}>POPULAR</Text>
                                    </View>
                                )}
                                <View style={styles.priceTag}><Text style={styles.priceText}>FREE</Text></View>
                            </View>
                            
                            <View style={styles.eventDetails}>
                                <View style={styles.dateBadge}>
                                    <Text style={[styles.dateText, { color: colors.primary }]}>{event.date.split(' ')[0]}</Text>
                                    <Text style={[styles.dayText, { color: colors.textMain }]}>{event.date.split(' ')[1]}</Text>
                                </View>
                                <View style={styles.infoContent}>
                                    <Text style={[styles.organizerText, { color: colors.primary }]}>{event.organizer}</Text>
                                    <Text style={[styles.eventTitle, { color: colors.textMain }]} numberOfLines={1}>{event.title}</Text>
                                    <View style={styles.row}>
                                        <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                                        <Text style={[styles.infoText, { color: colors.textSecondary }]}>{event.location}</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.progressSection}>
                                <View style={[styles.progressBarBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#eee' }]}>
                                    <View style={[styles.progressBarFill, { width: `${occupancy}%`, backgroundColor: colors.primary }]} />
                                </View>
                                <Text style={[styles.progressText, { color: colors.textSecondary }]}>{event.totalSlots - event.joined} spots left</Text>
                            </View>

                            <View style={[styles.footer, { borderTopColor: colors.glassBorder }]}>
                                <View style={styles.attendees}>
                                    <View style={styles.avatarStack}>
                                        {event.avatars.map((url, index) => (
                                            <Image key={index} source={{ uri: url }} style={[styles.avatar, { left: index * -8, borderColor: isDark ? '#1d2c4d' : '#FFF', zIndex: 10 - index }]} />
                                        ))}
                                    </View>
                                    <Text style={[styles.attendeeText, { color: colors.textSecondary, marginLeft: 5 }]}> +{event.joined} joining</Text>
                                </View>
                                <TouchableOpacity style={[styles.joinBtn, { backgroundColor: colors.primary }]} onPress={() => setShowSoon(true)}>
                                    <Text style={[styles.joinBtnText, { color: isDark ? '#000' : '#FFF' }]}>RSVP</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    );
                })}

                {/* --- Create CTA --- */}
                <TouchableOpacity 
                    onPress={() => setShowSoon(true)}
                    style={[styles.createCard, { borderColor: colors.glassBorder, borderStyle: 'dashed' }]}
                >
                    <View style={[styles.addIconCircle, { backgroundColor: colors.glass }]}>
                        <Ionicons name="add" size={24} color={colors.primary} />
                    </View>
                    <View>
                        <Text style={[styles.createText, { color: colors.textMain }]}>Host your own Echo Event</Text>
                        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Create a meetup for the community</Text>
                    </View>
                </TouchableOpacity>
            </ScrollView>

            {/* --- COMING SOON MODAL --- */}
            <Modal
                transparent={true}
                visible={showSoon}
                animationType="fade"
                onRequestClose={() => setShowSoon(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalBox, { backgroundColor: isDark ? '#1E293B' : '#FFF' }]}>
                        <View style={[styles.soonIcon, { backgroundColor: colors.primary + '20' }]}>
                            <Ionicons name="construct" size={40} color={colors.primary} />
                        </View>
                        <Text style={[styles.soonTitle, { color: colors.textMain }]}>Feature Incoming</Text>
                        <Text style={[styles.soonSub, { color: colors.textSecondary }]}>
                            We're currently preparing the Echo Engine for personal hosting. You'll be able to create events soon!
                        </Text>
                        <TouchableOpacity 
                            style={[styles.soonBtn, { backgroundColor: colors.primary }]}
                            onPress={() => setShowSoon(false)}
                        >
                            <Text style={[styles.soonBtnText, { color: isDark ? '#000' : '#FFF' }]}>Got it!</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default Events;

const styles = StyleSheet.create({
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 120, paddingTop: 10 },
    spotlightCard: { padding: 25, borderRadius: 30, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 25 },
    spotlightTextContent: { flex: 1 },
    liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, alignSelf: 'flex-start', marginBottom: 10 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF4B4B', marginRight: 6 },
    liveText: { color: '#FFF', fontSize: 10, fontWeight: '900' },
    spotlightTitle: { fontSize: 24, fontWeight: '900' },
    spotlightSub: { fontSize: 13, fontWeight: '600' },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    sectionLabel: { fontSize: 20, fontWeight: '900' },
    eventCard: { borderRadius: 30, borderWidth: 1, marginBottom: 20, overflow: 'hidden' },
    imageWrapper: { width: '100%', height: 160, position: 'relative', backgroundColor: '#000' },
    eventImage: { width: '100%', height: '100%' },
    darkImageOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: '#1d2c4d', opacity: 0.3 },
    hotBadge: { position: 'absolute', top: 15, left: 15, backgroundColor: '#FF4B4B', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
    hotText: { color: '#FFF', fontSize: 10, fontWeight: '900', marginLeft: 4 },
    priceTag: { position: 'absolute', top: 15, right: 15, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
    priceText: { color: '#FFF', fontSize: 10, fontWeight: '900' },
    eventDetails: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 20, alignItems: 'center' },
    dateBadge: { alignItems: 'center', paddingRight: 15, marginRight: 15, borderRightWidth: 1, borderRightColor: 'rgba(128,128,128,0.2)' },
    dateText: { fontSize: 12, fontWeight: '900' },
    dayText: { fontSize: 18, fontWeight: '900' },
    infoContent: { flex: 1 },
    organizerText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', marginBottom: 2 },
    eventTitle: { fontSize: 18, fontWeight: '800', marginBottom: 4 },
    row: { flexDirection: 'row', alignItems: 'center' },
    infoText: { fontSize: 12, marginLeft: 5, fontWeight: '500' },
    progressSection: { paddingHorizontal: 20, marginVertical: 15 },
    progressBarBg: { width: '100%', height: 6, borderRadius: 3, overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 3 },
    progressText: { fontSize: 11, fontWeight: '700', marginTop: 6 },
    footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, borderTopWidth: 1 },
    attendees: { flexDirection: 'row', alignItems: 'center' },
    avatarStack: { flexDirection: 'row', width: 40 },
    avatar: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, position: 'absolute' },
    attendeeText: { fontSize: 12, fontWeight: '700' },
    joinBtn: { paddingHorizontal: 25, paddingVertical: 10, borderRadius: 15 },
    joinBtnText: { fontWeight: '900', fontSize: 13 },
    createCard: { padding: 20, borderRadius: 30, borderWidth: 2, alignItems: 'center', flexDirection: 'row', gap: 15, marginTop: 10 },
    addIconCircle: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(128,128,128,0.2)' },
    createText: { fontWeight: '800', fontSize: 15 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
    modalBox: { width: width * 0.85, padding: 30, borderRadius: 35, alignItems: 'center' },
    soonIcon: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    soonTitle: { fontSize: 20, fontWeight: '900', textAlign: 'center', marginBottom: 12 },
    soonSub: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 25, opacity: 0.8 },
    soonBtn: { width: '100%', paddingVertical: 15, borderRadius: 20, alignItems: 'center' },
    soonBtnText: { fontWeight: '900', fontSize: 15 }
});