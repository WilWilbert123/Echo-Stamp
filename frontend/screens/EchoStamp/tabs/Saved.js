import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Image,
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

const Saved = () => {
    const { colors, isDark } = useTheme();
    
    // --- State Management ---
    const [collections, setCollections] = useState([]);
    const [recentSaves, setRecentSaves] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [activeFeature, setActiveFeature] = useState('');

    // --- Real-World Data Fetching Simulation ---
    useEffect(() => {
        const loadSavedData = async () => {
            try {
                setIsLoading(true);
                // Simulate API call delay
                await new Promise(resolve => setTimeout(resolve, 1200));

                // Real-world structured data
                setCollections([
                    { id: '1', title: 'Summer Trip 2024', count: 12, icon: 'sunny', color: '#FACC15' },
                    { id: '2', title: 'Dream Cafes', count: 8, icon: 'cafe', color: '#A78BFA' },
                    { id: '3', title: 'Hiking Trails', count: 5, icon: 'earth', color: '#4ADE80' },
                    { id: '4', title: 'Hidden Gems', count: 24, icon: 'diamond', color: '#F472B6' },
                ]);

                setRecentSaves([
                    { id: 'r1', title: "Yosemite Valley Echo", date: "2 days ago", img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400' },
                    { id: 'r2', title: "Alpine Lake Discovery", date: "5 days ago", img: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400' },
                ]);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };

        loadSavedData();
    }, []);

    // --- Action Handlers ---
    const handleAction = (featureName) => {
        setActiveFeature(featureName);
        setModalVisible(true);
    };

    if (isLoading) {
        return (
            <View style={[styles.loader, { backgroundColor: colors.background[0] }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.background[0] }}>
            <ScrollView 
                style={styles.container} 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* --- Stats Header --- */}
                <View style={[styles.statsBar, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                    <TouchableOpacity style={styles.statItem} onPress={() => handleAction('Total Echoes')}>
                        <Text style={[styles.statNum, { color: colors.textMain }]}>49</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Echoes</Text>
                    </TouchableOpacity>
                    <View style={[styles.divider, { backgroundColor: colors.glassBorder }]} />
                    <TouchableOpacity style={styles.statItem} onPress={() => handleAction('Collections')}>
                        <Text style={[styles.statNum, { color: colors.textMain }]}>{collections.length}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Collections</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Your Collections</Text>
                    <TouchableOpacity onPress={() => handleAction('Create Collection')}>
                        <Text style={[styles.seeAll, { color: colors.primary }]}>+ New</Text>
                    </TouchableOpacity>
                </View>

                {/* --- Collections Grid --- */}
                <View style={styles.grid}>
                    {collections.map((item) => (
                        <TouchableOpacity 
                            key={item.id} 
                            onPress={() => handleAction(item.title)}
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
                            
                            <TouchableOpacity style={styles.folderOptions} onPress={() => handleAction('Settings')}>
                                <Ionicons name="ellipsis-horizontal" size={16} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* --- Quick Saves / Recent --- */}
                <Text style={[styles.sectionTitle, { color: colors.textMain, marginTop: 10 }]}>Recently Saved</Text>
                
                {recentSaves.map((item) => (
                    <TouchableOpacity 
                        key={item.id} 
                        onPress={() => handleAction(item.title)}
                        style={[styles.recentCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
                    >
                        <Image source={{ uri: item.img }} style={styles.recentImg} />
                        <View style={styles.recentInfo}>
                            <Text style={[styles.recentTitle, { color: colors.textMain }]}>{item.title}</Text>
                            <Text style={[styles.recentDate, { color: colors.textSecondary }]}>Saved {item.date}</Text>
                        </View>
                        <Ionicons name="bookmark" size={20} color={colors.primary} style={{ marginRight: 10 }} />
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* --- Universal Coming Soon Modal --- */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <Pressable 
                    style={styles.modalOverlay} 
                    onPress={() => setModalVisible(false)}
                >
                    <View style={[styles.modalContent, { backgroundColor: isDark ? '#1E293B' : '#FFF' }]}>
                        <View style={[styles.modalIconBox, { backgroundColor: colors.primary + '20' }]}>
                            <Ionicons name="flash" size={32} color={colors.primary} />
                        </View>
                        <Text style={[styles.modalTitle, { color: colors.textMain }]}>{activeFeature}</Text>
                        <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
                            This library feature is currently being synced with your global Echo account. Access will be available in the next update.
                        </Text>
                        <TouchableOpacity 
                            style={[styles.closeBtn, { backgroundColor: colors.primary }]}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={[styles.closeBtnText, { color: isDark ? '#000' : '#FFF' }]}>Understood</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
};

export default Saved;

const styles = StyleSheet.create({
    container: { flex: 1 },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 120, paddingTop: 10 },
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
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    sectionTitle: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
    seeAll: { fontWeight: '800', fontSize: 14 },
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
    recentDate: { fontSize: 11, marginTop: 2 },

    // Modal Styles
    modalOverlay: { 
        flex: 1, 
        backgroundColor: 'rgba(0,0,0,0.6)', 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    modalContent: { 
        width: width * 0.8, 
        padding: 25, 
        borderRadius: 35, 
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10
    },
    modalIconBox: { width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 22, fontWeight: '900', marginBottom: 10, textAlign: 'center' },
    modalSub: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 25, opacity: 0.7 },
    closeBtn: { width: '100%', paddingVertical: 16, borderRadius: 20, alignItems: 'center' },
    closeBtnText: { fontWeight: '900', fontSize: 16 }
});