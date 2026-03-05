import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useTheme } from '../../../context/ThemeContext';

const { width } = Dimensions.get('window');

const Explore = () => {
    const { colors, isDark } = useTheme();
    const [search, setSearch] = useState('');

    const categories = [
        { id: '1', name: 'Nature', icon: 'leaf-outline', color: '#4ADE80' },
        { id: '2', name: 'Cities', icon: 'business-outline', color: '#60A5FA' },
        { id: '3', name: 'Food', icon: 'restaurant-outline', color: '#FB923C' },
        { id: '4', name: 'Hidden', icon: 'map-outline', color: '#A855F7' },
    ];

    return (
        <ScrollView 
            style={styles.container} 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            {/* --- Search Bar --- */}
            <View style={[styles.searchWrapper, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                <Ionicons name="search" size={20} color={colors.textSecondary} />
                <TextInput
                    placeholder="Search destinations..."
                    placeholderTextColor={colors.textSecondary}
                    style={[styles.searchInput, { color: colors.textMain }]}
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            {/* --- Category Grid --- */}
            <View style={styles.categoryGrid}>
                {categories.map((cat) => (
                    <TouchableOpacity 
                        key={cat.id} 
                        style={[styles.categoryCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
                    >
                        <View style={[styles.iconCircle, { backgroundColor: `${cat.color}20` }]}>
                            <Ionicons name={cat.icon} size={22} color={cat.color} />
                        </View>
                        <Text style={[styles.categoryName, { color: colors.textMain }]}>{cat.name}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* --- Featured Discovery (Hero) --- */}
            <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Nearby Discovery</Text>
            <TouchableOpacity activeOpacity={0.9} style={styles.heroCard}>
                <Image 
                    source={{ uri: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=800' }} 
                    style={styles.heroImage} 
                />
                <View style={[styles.heroOverlay, { backgroundColor: 'rgba(0,0,0,0.4)' }]}>
                    <View>
                        <Text style={styles.heroLocation}>Crystal Falls</Text>
                        <Text style={styles.heroDistance}>2.5 km away from you</Text>
                    </View>
                    <View style={styles.heroBadge}>
                        <Text style={styles.badgeText}>New</Text>
                    </View>
                </View>
            </TouchableOpacity>

            {/* --- Map Preview Placeholder --- */}
            <View style={[styles.mapPlaceholder, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                <Ionicons name="navigate-circle" size={40} color={colors.primary} />
                <Text style={[styles.mapText, { color: colors.textMain }]}>Open Exploration Map</Text>
                <Text style={[styles.mapSubText, { color: colors.textSecondary }]}>See 124 Echoes near you</Text>
                
                <TouchableOpacity style={[styles.mapBtn, { backgroundColor: colors.primary }]}>
                    <Text style={[styles.mapBtnText, { color: isDark ? '#000' : '#FFF' }]}>View Map</Text>
                </TouchableOpacity>
            </View>

        </ScrollView>
    );
};

export default Explore;

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 120, paddingTop: 10 },
    
    // Search
    searchWrapper: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: 15, 
        height: 55, 
        borderRadius: 20, 
        borderWidth: 1,
        marginBottom: 20 
    },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 16, fontWeight: '600' },

    // Category Grid
    categoryGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
    categoryCard: { 
        width: (width - 60) / 4, 
        paddingVertical: 15, 
        alignItems: 'center', 
        borderRadius: 20, 
        borderWidth: 1 
    },
    iconCircle: { width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    categoryName: { fontSize: 12, fontWeight: '800' },

    // Hero Section
    sectionTitle: { fontSize: 20, fontWeight: '900', marginBottom: 15, letterSpacing: -0.5 },
    heroCard: { width: '100%', height: 220, borderRadius: 30, overflow: 'hidden', marginBottom: 25 },
    heroImage: { width: '100%', height: '100%' },
    heroOverlay: { 
        ...StyleSheet.absoluteFillObject, 
        justifyContent: 'flex-end', 
        padding: 20, 
        flexDirection: 'row', 
        alignItems: 'flex-end', 
        justifyContent: 'space-between' 
    },
    heroLocation: { color: 'white', fontSize: 22, fontWeight: '900' },
    heroDistance: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600' },
    heroBadge: { backgroundColor: '#FFD700', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
    badgeText: { color: '#000', fontWeight: '900', fontSize: 10 },

    // Map Section
    mapPlaceholder: { 
        padding: 30, 
        borderRadius: 30, 
        alignItems: 'center', 
        borderWidth: 1,
        borderStyle: 'dashed' 
    },
    mapText: { fontSize: 18, fontWeight: '800', marginTop: 10 },
    mapSubText: { fontSize: 14, marginTop: 5, marginBottom: 20 },
    mapBtn: { paddingHorizontal: 30, paddingVertical: 12, borderRadius: 20 },
    mapBtnText: { fontWeight: '900', fontSize: 14 }
});