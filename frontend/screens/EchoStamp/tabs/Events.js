import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Dimensions,
    Image,
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

    const upcomingEvents = [
        {
            id: '1',
            title: 'Manila Sunset Photowalk',
            date: 'OCT 24',
            time: '4:30 PM',
            location: 'Baywalk, Roxas Blvd',
            joined: 42,
            image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500'
        },
        {
            id: '2',
            title: 'Hidden Cafe Discovery',
            date: 'OCT 26',
            time: '10:00 AM',
            location: 'Binondo, Manila',
            joined: 15,
            image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500'
        }
    ];

    return (
        <ScrollView 
            style={styles.container} 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            {/* --- Spotlight Banner --- */}
            <View style={[styles.spotlightCard, { backgroundColor: colors.primary }]}>
                <View style={styles.spotlightTextContent}>
                    <Text style={[styles.spotlightLabel, { color: isDark ? '#000' : '#FFF' }]}>COMMUNITY CHOICE</Text>
                    <Text style={[styles.spotlightTitle, { color: isDark ? '#000' : '#FFF' }]}>Global Echo Day 2024</Text>
                    <Text style={[styles.spotlightSub, { color: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.8)' }]}>Join 5,000 explorers worldwide.</Text>
                </View>
                <Ionicons name="megaphone" size={40} color={isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.3)'} />
            </View>

            <Text style={[styles.sectionLabel, { color: colors.textMain }]}>Upcoming Meetups</Text>

            {/* --- Event Cards --- */}
            {upcomingEvents.map((event) => (
                <TouchableOpacity 
                    key={event.id} 
                    activeOpacity={0.9}
                    style={[styles.eventCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
                >
                    <Image source={{ uri: event.image }} style={styles.eventImage} />
                    
                    <View style={styles.eventDetails}>
                        <View style={styles.dateBadge}>
                            <Text style={[styles.dateText, { color: colors.primary }]}>{event.date.split(' ')[0]}</Text>
                            <Text style={[styles.dayText, { color: colors.textMain }]}>{event.date.split(' ')[1]}</Text>
                        </View>

                        <View style={styles.infoContent}>
                            <Text style={[styles.eventTitle, { color: colors.textMain }]} numberOfLines={1}>
                                {event.title}
                            </Text>
                            <View style={styles.row}>
                                <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                                <Text style={[styles.infoText, { color: colors.textSecondary }]}>{event.location}</Text>
                            </View>
                            <View style={styles.row}>
                                <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                                <Text style={[styles.infoText, { color: colors.textSecondary }]}>{event.time}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={[styles.footer, { borderTopColor: colors.glassBorder }]}>
                        <View style={styles.attendees}>
                            <Ionicons name="people" size={16} color={colors.primary} />
                            <Text style={[styles.attendeeText, { color: colors.textSecondary }]}> {event.joined} joined</Text>
                        </View>
                        <TouchableOpacity style={[styles.joinBtn, { backgroundColor: colors.primary }]}>
                            <Text style={[styles.joinBtnText, { color: isDark ? '#000' : '#FFF' }]}>I'm Interested</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            ))}

            {/* --- Create Event CTA --- */}
            <TouchableOpacity style={[styles.createCard, { borderColor: colors.glassBorder, borderStyle: 'dashed' }]}>
                <Ionicons name="add-circle-outline" size={24} color={colors.textSecondary} />
                <Text style={[styles.createText, { color: colors.textSecondary }]}>Host your own Echo Event</Text>
            </TouchableOpacity>

        </ScrollView>
    );
};

export default Events;

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 120, paddingTop: 10 },
    
    // Spotlight
    spotlightCard: { 
        padding: 25, 
        borderRadius: 30, 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: 25 
    },
    spotlightLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },
    spotlightTitle: { fontSize: 22, fontWeight: '900', marginVertical: 4 },
    spotlightSub: { fontSize: 12, fontWeight: '600' },

    // Section
    sectionLabel: { fontSize: 20, fontWeight: '900', marginBottom: 15 },

    // Event Card
    eventCard: { borderRadius: 30, borderWidth: 1, marginBottom: 20, overflow: 'hidden' },
    eventImage: { width: '100%', height: 140 },
    eventDetails: { flexDirection: 'row', padding: 20, alignItems: 'center' },
    
    dateBadge: { 
        alignItems: 'center', 
        paddingRight: 15, 
        marginRight: 15, 
        borderRightWidth: 1, 
        borderRightColor: 'rgba(128,128,128,0.2)' 
    },
    dateText: { fontSize: 12, fontWeight: '900' },
    dayText: { fontSize: 18, fontWeight: '900' },
    
    infoContent: { flex: 1 },
    eventTitle: { fontSize: 18, fontWeight: '800', marginBottom: 6 },
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
    infoText: { fontSize: 12, marginLeft: 5, fontWeight: '500' },

    footer: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingHorizontal: 20, 
        paddingVertical: 15, 
        borderTopWidth: 1 
    },
    attendees: { flexDirection: 'row', alignItems: 'center' },
    attendeeText: { fontSize: 12, fontWeight: '700' },
    joinBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 15 },
    joinBtnText: { fontWeight: '900', fontSize: 12 },

    // Create Event
    createCard: { 
        padding: 30, 
        borderRadius: 30, 
        borderWidth: 2, 
        alignItems: 'center', 
        justifyContent: 'center', 
        flexDirection: 'row',
        gap: 10
    },
    createText: { fontWeight: '700', fontSize: 14 }
});