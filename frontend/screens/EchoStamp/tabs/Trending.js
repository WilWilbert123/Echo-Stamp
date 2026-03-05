import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Dimensions,
    ImageBackground,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from '../../../context/ThemeContext';

const { width } = Dimensions.get('window');

const Trending = () => {
    const { colors, isDark } = useTheme();

    // Mock data for a "Real World" feel
    const trendingLocations = [
        { id: '1', name: 'Siargao Island', echoes: '2.4k', image: 'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?w=500' },
        { id: '2', name: 'Intramuros', echoes: '1.8k', image: 'https://gttp.images.tshiftcdn.com/253806/x/0/ultimate-travel-guide-to-intramuros-old-town-in-manila-city-everything-you-need-to-know-1.jpg?auto=compress%2Cformat&ch=Width%2CDPR&dpr=1&ixlib=php-3.3.0&w=883' },
        { id: '3', name: 'Bagiuo City', echoes: '950', image: 'https://trinasimply.wordpress.com/wp-content/uploads/2015/11/bagui.jpg?w=526&h=348' },
    ];

    const trendingTags = ['#SummerVibe', '#HistoricalWalk', '#CoffeeLover', '#UrbanExplore'];

    return (
        <ScrollView 
            style={styles.container} 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
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

            {[1, 2, 3].map((_, i) => (
                <View 
                    key={i} 
                    style={[styles.listItem, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
                >
                    <View style={[styles.rankCircle, { backgroundColor: colors.primary }]}>
                        <Text style={styles.rankNum}>{i + 1}</Text>
                    </View>
                    <View style={styles.listTextContent}>
                        <Text style={[styles.listTitle, { color: colors.textMain }]}>Viral Discovery in Manila</Text>
                        <Text style={[styles.listSub, { color: colors.textSecondary }]}>Shared by 500+ explorers today</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                </View>
            ))}
        </ScrollView>
    );
};

export default Trending;

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 120, paddingTop: 10 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, marginTop: 20 },
    sectionTitle: { fontSize: 18, fontWeight: '800', marginLeft: 8 },
    
    // Horizontal Cards
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

    // Tags
    tagGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    tagPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
    tagText: { fontWeight: '700', fontSize: 14 },

    // List items
    listItem: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        padding: 15, 
        borderRadius: 20, 
        marginBottom: 10, 
        borderWidth: 1 
    },
    rankCircle: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    rankNum: { color: 'white', fontWeight: '900', fontSize: 14 },
    listTextContent: { flex: 1 },
    listTitle: { fontWeight: '700', fontSize: 15 },
    listSub: { fontSize: 12, marginTop: 2 }
});