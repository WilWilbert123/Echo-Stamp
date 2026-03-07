import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Dimensions,
    ImageBackground,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from '../../../context/ThemeContext';

const { width, height } = Dimensions.get('window');

const Trending = () => {
    const { colors, isDark } = useTheme();
    
    // --- State for Modal ---
    const [selectedViral, setSelectedViral] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    // --- Real World Data Structure ---
    const trendingLocations = [
        { id: '1', name: 'Siargao Island', echoes: '2.4k', image: 'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?w=500' },
        { id: '2', name: 'Intramuros', echoes: '1.8k', image: 'https://gttp.images.tshiftcdn.com/253806/x/0/ultimate-travel-guide-to-intramuros-old-town-in-manila-city-everything-you-need-to-know-1.jpg?w=883' },
        { id: '3', name: 'Baguio City', echoes: '950', image: 'https://trinasimply.wordpress.com/wp-content/uploads/2015/11/bagui.jpg?w=526' },
    ];

    const trendingTags = ['#SummerVibe', '#HistoricalWalk', '#CoffeeLover', '#UrbanExplore'];

    const popularNow = [
        {
            id: 'p1',
            title: 'Viral Discovery in Manila',
            sub: 'Shared by 500+ explorers today',
            details: [
                { id: 'v1', user: '@travel_juan', text: 'Found a hidden cafe in Binondo!' },
                { id: 'v2', user: '@manila_explorer', text: 'The sunset at Baywalk is back.' },
                { id: 'v3', user: '@foodie_phil', text: 'Street food tour was amazing.' }
            ]
        },
        {
            id: 'p2',
            title: 'Siargao Surf Updates',
            sub: 'Live conditions at Cloud 9',
            details: [
                { id: 'v4', user: '@surfer_dude', text: 'Waves are peaking at 5ft right now!' },
                { id: 'v5', user: '@island_girl', text: 'Perfect weather for a surf session.' }
            ]
        },
        {
            id: 'p3',
            title: 'Baguio Night Market',
            sub: '1.2k people talking about this',
            details: [
                { id: 'v6', user: '@thrift_queen', text: 'Got these boots for only 200 pesos!' },
                { id: 'v7', user: '@cold_vibes', text: 'Drinking strawberry taho in 15°C.' }
            ]
        }
    ];

    const openViralModal = (item) => {
        setSelectedViral(item);
        setModalVisible(true);
    };

    return (
        <View style={styles.container}>
            <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* --- Featured Trending Section --- */}
                <View style={styles.sectionHeader}>
                    <Ionicons name="flame" size={20} color="#FF5252" />
                    <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Hot Locations</Text>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                    {trendingLocations.map((item) => (
                        <TouchableOpacity key={item.id} activeOpacity={0.9} style={styles.locationCard}>
                            <ImageBackground 
                                source={{ uri: item.image }} 
                                style={styles.cardImage}
                                imageStyle={{ borderRadius: 20 }}
                            >
                                <View style={styles.cardOverlay}>
                                    <Text style={styles.locationName}>{item.name}</Text>
                                    <Text style={styles.echoCount}>{item.echoes} Echoes</Text>
                                </View>
                            </ImageBackground>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* --- Trending Hashtags --- */}
                <View style={styles.sectionHeader}>
                    <Ionicons name="trending-up" size={20} color={colors.primary} />
                    <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Trending Tags</Text>
                </View>

                <View style={styles.tagGrid}>
                    {trendingTags.map((tag, index) => (
                        <TouchableOpacity 
                            key={index} 
                            style={[styles.tagPill, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
                        >
                            <Text style={[styles.tagText, { color: colors.primary }]}>{tag}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* --- Popular Now List --- */}
                <View style={styles.sectionHeader}>
                    <Ionicons name="list" size={20} color={colors.textSecondary} />
                    <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Popular Now</Text>
                </View>

                {popularNow.map((item, i) => (
                    <TouchableOpacity 
                        key={item.id} 
                        onPress={() => openViralModal(item)}
                        style={[styles.listItem, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
                    >
                        <View style={[styles.rankCircle, { backgroundColor: colors.primary }]}>
                            <Text style={styles.rankNum}>{i + 1}</Text>
                        </View>
                        <View style={styles.listTextContent}>
                            <Text style={[styles.listTitle, { color: colors.textMain }]}>{item.title}</Text>
                            <Text style={[styles.listSub, { color: colors.textSecondary }]}>{item.sub}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* --- Viral Modal (Partial Screen) --- */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <Pressable 
                    style={styles.modalOverlay} 
                    onPress={() => setModalVisible(false)}
                >
                    <Pressable style={[styles.modalContent, { backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF' }]}>
                        <View style={styles.modalHandle} />
                        
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.textMain }]}>
                                {selectedViral?.title}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close-circle" size={28} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} style={styles.modalList}>
                            {selectedViral?.details.map((v) => (
                                <View key={v.id} style={[styles.viralItem, { borderBottomColor: colors.glassBorder }]}>
                                    <View style={styles.viralUserRow}>
                                        <View style={[styles.userAvatar, { backgroundColor: colors.primary + '33' }]}>
                                            <Ionicons name="person" size={14} color={colors.primary} />
                                        </View>
                                        <Text style={[styles.viralUser, { color: colors.primary }]}>{v.user}</Text>
                                    </View>
                                    <Text style={[styles.viralText, { color: colors.textMain }]}>{v.text}</Text>
                                </View>
                            ))}
                        </ScrollView>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
};

export default Trending;

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 120, paddingTop: 10 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, marginTop: 20 },
    sectionTitle: { fontSize: 18, fontWeight: '800', marginLeft: 8 },
    
    horizontalScroll: { marginBottom: 10 },
    locationCard: { width: width * 0.7, height: 180, marginRight: 15 },
    cardImage: { flex: 1, justifyContent: 'flex-end' },
    cardOverlay: { 
        padding: 15, 
        backgroundColor: 'rgba(0,0,0,0.35)', 
        borderBottomLeftRadius: 20, 
        borderBottomRightRadius: 20 
    },
    locationName: { color: 'white', fontWeight: '900', fontSize: 18 },
    echoCount: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600' },

    tagGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    tagPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
    tagText: { fontWeight: '700', fontSize: 14 },

    listItem: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        padding: 15, 
        borderRadius: 20, 
        marginBottom: 12, 
        borderWidth: 1 
    },
    rankCircle: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    rankNum: { color: 'white', fontWeight: '900', fontSize: 14 },
    listTextContent: { flex: 1 },
    listTitle: { fontWeight: '700', fontSize: 15 },
    listSub: { fontSize: 12, marginTop: 2 },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        height: height * 0.6, // Partial screen
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 20,
    },
    modalHandle: {
        width: 40,
        height: 5,
        backgroundColor: '#CCC',
        borderRadius: 5,
        alignSelf: 'center',
        marginBottom: 15,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '900',
        flex: 1,
    },
    modalList: {
        flex: 1,
    },
    viralItem: {
        paddingVertical: 15,
        borderBottomWidth: 1,
    },
    viralUserRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    userAvatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    viralUser: {
        fontWeight: '800',
        fontSize: 13,
    },
    viralText: {
        fontSize: 15,
        lineHeight: 20,
        fontWeight: '500',
    },
});