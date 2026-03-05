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

const Saved = () => {
    const { colors, isDark } = useTheme();

    const collections = [
        { id: '1', title: 'Summer Trip 2024', count: 12, icon: 'sunny', color: '#FACC15' },
        { id: '2', title: 'Dream Cafes', count: 8, icon: 'cafe', color: '#A78BFA' },
        { id: '3', title: 'Hiking Trails', count: 5, icon: 'mountain', color: '#4ADE80' },
        { id: '4', title: 'Hidden Gems', count: 24, icon: 'diamond', color: '#F472B6' },
    ];

    return (
        <ScrollView 
            style={styles.container} 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            {/* --- Stats Header --- */}
            <View style={[styles.statsBar, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                <View style={styles.statItem}>
                    <Text style={[styles.statNum, { color: colors.textMain }]}>49</Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Echoes</Text>
                </View>
                <View style={[styles.divider, { backgroundColor: colors.glassBorder }]} />
                <View style={styles.statItem}>
                    <Text style={[styles.statNum, { color: colors.textMain }]}>4</Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Collections</Text>
                </View>
            </View>

            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Your Collections</Text>
                <TouchableOpacity>
                    <Text style={[styles.seeAll, { color: colors.primary }]}>+ New</Text>
                </TouchableOpacity>
            </View>

            {/* --- Collections Grid --- */}
            <View style={styles.grid}>
                {collections.map((item) => (
                    <TouchableOpacity 
                        key={item.id} 
                        style={[styles.folderCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
                    >
                        <View style={[styles.iconBox, { backgroundColor: `${item.color}20` }]}>
                            <Ionicons name={item.icon} size={24} color={item.color} />
                        </View>
                        <Text style={[styles.folderTitle, { color: colors.textMain }]} numberOfLines={1}>
                            {item.title}
                        </Text>
                        <Text style={[styles.folderCount, { color: colors.textSecondary }]}>
                            {item.count} items
                        </Text>
                        
                        <View style={styles.folderOptions}>
                            <Ionicons name="ellipsis-horizontal" size={16} color={colors.textSecondary} />
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            {/* --- Quick Saves / Recent --- */}
            <Text style={[styles.sectionTitle, { color: colors.textMain, marginTop: 10 }]}>Recently Saved</Text>
            
            {[1, 2].map((_, i) => (
                <TouchableOpacity 
                    key={i} 
                    style={[styles.recentCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
                >
                    <Image 
                        source={{ uri: i === 0 ? 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400' : 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400' }} 
                        style={styles.recentImg} 
                    />
                    <View style={styles.recentInfo}>
                        <Text style={[styles.recentTitle, { color: colors.textMain }]}>
                            {i === 0 ? "Yosemite Valley Echo" : "Alpine Lake Discovery"}
                        </Text>
                        <Text style={[styles.recentDate, { color: colors.textSecondary }]}>Saved 2 days ago</Text>
                    </View>
                    <Ionicons name="bookmark" size={20} color={colors.primary} style={{ marginRight: 10 }} />
                </TouchableOpacity>
            ))}

        </ScrollView>
    );
};

export default Saved;

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 120, paddingTop: 10 },
    
    // Stats Bar
    statsBar: { 
        flexDirection: 'row', 
        padding: 20, 
        borderRadius: 25, 
        borderWidth: 1, 
        alignItems: 'center',
        marginBottom: 25 
    },
    statItem: { flex: 1, alignItems: 'center' },
    statNum: { fontSize: 20, fontWeight: '900' },
    statLabel: { fontSize: 12, fontWeight: '600', marginTop: 2 },
    divider: { width: 1, height: 30, marginHorizontal: 10 },

    // Section Header
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    sectionTitle: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
    seeAll: { fontWeight: '800', fontSize: 14 },

    // Grid
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    folderCard: { 
        width: (width - 55) / 2, 
        padding: 20, 
        borderRadius: 30, 
        borderWidth: 1, 
        marginBottom: 15,
        position: 'relative'
    },
    iconBox: { width: 45, height: 45, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    folderTitle: { fontWeight: '800', fontSize: 15 },
    folderCount: { fontSize: 12, fontWeight: '600', marginTop: 4 },
    folderOptions: { position: 'absolute', top: 15, right: 15 },

    // Recent Cards
    recentCard: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        padding: 12, 
        borderRadius: 22, 
        borderWidth: 1, 
        marginBottom: 12 
    },
    recentImg: { width: 50, height: 50, borderRadius: 12 },
    recentInfo: { flex: 1, marginLeft: 15 },
    recentTitle: { fontWeight: '700', fontSize: 14 },
    recentDate: { fontSize: 11, marginTop: 2 }
});