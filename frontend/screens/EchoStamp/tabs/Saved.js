import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    Linking,
    Modal,
    Platform,
    Pressable,
    RefreshControl,
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

    const [collections, setCollections] = useState([]);
    const [recentSaves, setRecentSaves] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [activeFeature, setActiveFeature] = useState('');

    useFocusEffect(
        useCallback(() => {
            const isSilent = recentSaves.length > 0;
            loadSavedData(isSilent);
        }, [recentSaves.length])
    );

    const loadSavedData = async (silent = false) => {
        try {
            if (!silent) setIsLoading(true);
            else setIsRefreshing(true);

            const savedData = await AsyncStorage.getItem('saved_places');
            const parsedSaves = savedData ? JSON.parse(savedData) : [];

            const sortedSaves = parsedSaves.sort((a, b) =>
                new Date(b.savedAt || 0) - new Date(a.savedAt || 0)
            );

            setRecentSaves(sortedSaves);

            // Updated logic to match Explore categories
            const categories = [...new Set(parsedSaves.map(item => item.organizer || 'General'))];
            const collectionMock = categories.map((cat, index) => {
                let iconName = 'map';
                let iconColor = index % 2 === 0 ? colors.primary : '#F472B6';
                const lowerCat = cat.toLowerCase();

                if (lowerCat.includes('city')) {
                    iconName = 'business';
                    iconColor = '#94A3B8';
                } else if (lowerCat.includes('food')) {
                    iconName = 'restaurant';
                    iconColor = '#FB923C';
                } else if (lowerCat.includes('cafe') || lowerCat.includes('café')) {
                    iconName = 'cafe';
                    iconColor = '#A16207';
                } else if (lowerCat.includes('hotel')) {
                    iconName = 'bed';
                    iconColor = '#60A5FA';
                } else if (lowerCat.includes('nature') || lowerCat.includes('park')) {
                    iconName = 'leaf';
                    iconColor = '#4ADE80';
                } else if (lowerCat.includes('museum')) {
                    iconName = 'color-palette';
                    iconColor = '#A855F7';
                } else if (lowerCat.includes('shopping')) {
                    iconName = 'cart';
                    iconColor = '#EC4899';
                } else if (lowerCat.includes('nightlife') || lowerCat.includes('bar')) {
                    iconName = 'beer';
                    iconColor = '#F43F5E';
                } else if (lowerCat.includes('trending')) {
                    iconName = 'flame';
                }

                return {
                    id: String(index),
                    title: cat,
                    count: parsedSaves.filter(s => (s.organizer || 'General') === cat).length,
                    icon: iconName,
                    color: iconColor
                };
            });

            setCollections(collectionMock);
        } catch (e) {
            console.error("Load Saved Error:", e);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const confirmDelete = (id) => {
        Alert.alert(
            "Delete Bookmark",
            "Are you sure you want to remove this place?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => removeSave(id) }
            ]
        );
    };

    const removeSave = async (id) => {
        try {
            const savedData = await AsyncStorage.getItem('saved_places');
            let parsedSaves = savedData ? JSON.parse(savedData) : [];
            const updated = parsedSaves.filter(item => item.id !== id);

            await AsyncStorage.setItem('saved_places', JSON.stringify(updated));
            setRecentSaves(updated);
            loadSavedData(true);
        } catch (e) {
            console.error("Remove Save Error:", e);
        }
    };

    const openInMaps = (lat, lon, label) => {
        const longitude = lon || 0;
        const latitude = lat || 0;
        const url = Platform.select({
            ios: `maps:0,0?q=${encodeURIComponent(label)}@${latitude},${longitude}`,
            android: `geo:0,0?q=${latitude},${longitude}(${encodeURIComponent(label)})`
        });
        Linking.openURL(url);
    };

    const handleAction = (featureName) => {
        setActiveFeature(featureName);
        setModalVisible(true);
    };

    if (isLoading && recentSaves.length === 0) {
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
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={() => loadSavedData(true)}
                        tintColor={colors.primary}
                    />
                }
            >
                {/* --- Stats Header --- */}
                <View style={[styles.statsBar, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                    <View style={styles.statItem}>
                        <Text style={[styles.statNum, { color: colors.textMain }]}>{recentSaves.length}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Saved Places</Text>
                    </View>
                    <View style={[styles.divider, { backgroundColor: colors.glassBorder }]} />
                    <View style={styles.statItem}>
                        <Text style={[styles.statNum, { color: colors.textMain }]}>{collections.length}</Text>
                        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Folders</Text>
                    </View>
                </View>

                {/* --- Collections Grid --- */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Collections</Text>
                    <TouchableOpacity onPress={() => handleAction('New Collection')}>
                        <Text style={[styles.seeAll, { color: colors.primary }]}>+ New</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.grid}>
                    {collections.length > 0 ? collections.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[styles.folderCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
                        >
                            <View style={[styles.iconBox, { backgroundColor: `${item.color}20` }]}>
                                <Ionicons name={item.icon} size={24} color={item.color} />
                            </View>
                            <Text style={[styles.folderTitle, { color: colors.textMain }]} numberOfLines={1}>{item.title}</Text>
                            <Text style={[styles.folderCount, { color: colors.textSecondary }]}>{item.count} items</Text>
                        </TouchableOpacity>
                    )) : (
                        <Text style={{ color: colors.textSecondary, marginLeft: 5, marginBottom: 20 }}>No categories yet.</Text>
                    )}
                </View>

                {/* --- Recently Bookmarked List --- */}
                <Text style={[styles.sectionTitle, { color: colors.textMain, marginTop: 10, marginBottom: 5 }]}>
                    Recently Bookmarked
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 15, marginLeft: 2 }}>
                    Swipe left on a card to delete
                </Text>

                {recentSaves.length > 0 ? recentSaves.map((item) => (
                    <View key={item.id} style={styles.swipeContainer}>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            snapToInterval={width - 40}
                            bounces={true}
                            decelerationRate="fast"
                            contentContainerStyle={{ width: (width - 40) + 80 }}
                        >
                            <TouchableOpacity
                                activeOpacity={0.9}
                                onPress={() => openInMaps(item.lat, item.lon || item.lng, item.name || item.title)}
                                style={[styles.recentCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
                            >
                                <Image source={{ uri: item.image }} style={styles.recentImg} />
                                <View style={styles.recentInfo}>
                                    <Text style={[styles.recentTitle, { color: colors.textMain }]} numberOfLines={1}>
                                        {item.name || item.title}
                                    </Text>
                                    <Text style={[styles.recentDate, { color: colors.textSecondary }]} numberOfLines={1}>
                                        {item.address || item.location || 'No address available'}
                                    </Text>
                                </View>
                                <Ionicons name="chevron-back" size={16} color={colors.textSecondary} style={{ opacity: 0.3 }} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => confirmDelete(item.id)}
                                style={[styles.deleteBtn, { backgroundColor: '#EF4444' }]}
                            >
                                <Ionicons name="trash-outline" size={24} color="white" />
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                )) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="bookmark-outline" size={50} color={colors.textSecondary} />
                        <Text style={{ color: colors.textSecondary, marginTop: 10 }}>Your saved places will appear here.</Text>
                    </View>
                )}
            </ScrollView>

            <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
                    <View style={[styles.modalContent, { backgroundColor: isDark ? '#1E293B' : '#FFF' }]}>
                        <View style={[styles.modalIconBox, { backgroundColor: colors.primary + '20' }]}>
                            <Ionicons name="flash" size={32} color={colors.primary} />
                        </View>
                        <Text style={[styles.modalTitle, { color: colors.textMain }]}>{activeFeature}</Text>
                        <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
                            This library feature is currently being synced. Access will be available in the next update.
                        </Text>
                        <TouchableOpacity style={[styles.closeBtn, { backgroundColor: colors.primary }]} onPress={() => setModalVisible(false)}>
                            <Text style={[styles.closeBtnText, { color: '#FFF' }]}>Understood</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 120, paddingTop: 10 },
    statsBar: { flexDirection: 'row', padding: 20, borderRadius: 25, borderWidth: 1, alignItems: 'center', marginBottom: 25 },
    statItem: { flex: 1, alignItems: 'center' },
    statNum: { fontSize: 20, fontWeight: '900' },
    statLabel: { fontSize: 12, fontWeight: '600', marginTop: 2 },
    divider: { width: 1, height: 30, marginHorizontal: 10 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    sectionTitle: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
    seeAll: { fontWeight: '800', fontSize: 14 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    folderCard: { width: (width - 55) / 2, padding: 20, borderRadius: 30, borderWidth: 1, marginBottom: 15 },
    iconBox: { width: 45, height: 45, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    folderTitle: { fontWeight: '800', fontSize: 15 },
    folderCount: { fontSize: 12, fontWeight: '600', marginTop: 4 },
    swipeContainer: { marginBottom: 12, overflow: 'hidden', borderRadius: 22 },
    recentCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 22, borderWidth: 1, width: width - 40 },
    deleteBtn: { width: 80, justifyContent: 'center', alignItems: 'center', borderRadius: 22, marginLeft: 10 },
    recentImg: { width: 55, height: 55, borderRadius: 15 },
    recentInfo: { flex: 1, marginLeft: 15 },
    recentTitle: { fontWeight: '700', fontSize: 15 },
    recentDate: { fontSize: 12, marginTop: 2 },
    emptyState: { alignItems: 'center', marginTop: 40, opacity: 0.5 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: width * 0.8, padding: 25, borderRadius: 35, alignItems: 'center' },
    modalIconBox: { width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 22, fontWeight: '900', marginBottom: 10, textAlign: 'center' },
    modalSub: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 25, opacity: 0.7 },
    closeBtn: { width: '100%', paddingVertical: 16, borderRadius: 20, alignItems: 'center' },
    closeBtnText: { fontWeight: '900', fontSize: 16 }
});

export default Saved;