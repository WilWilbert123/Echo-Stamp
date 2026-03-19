import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    ImageBackground,
    Modal,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import thisisit from "../../../config/config";
import { useTheme } from '../../../context/ThemeContext';

const { width, height } = Dimensions.get('window');
const GOOGLE_API_KEY = thisisit;

const Trending = () => {
    const { colors, isDark } = useTheme();
    const navigation = useNavigation();

    // States
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [trendingLocations, setTrendingLocations] = useState([]);
    const [savedIds, setSavedIds] = useState([]);
    const [nextPageToken, setNextPageToken] = useState(null);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    // Search Queries for diversity
    const [queryIndex, setQueryIndex] = useState(0);
    const queries = [
        'top+tourist+attractions+in+Philippines',
        'hidden+gems+travel+Philippines',
        'best+street+food+locations+Philippines',
        'famous+landmarks+Philippines',
        'adventure+spots+Philippines'
    ];

    // Data Categorization
    const viralLocations = useMemo(() => {
        return [...trendingLocations].sort((a, b) => b.reviews - a.reviews);
    }, [trendingLocations]);

    const popularNowLocations = useMemo(() => {
        return [...trendingLocations].sort((a, b) => b.rating - a.rating);
    }, [trendingLocations]);

    useEffect(() => {
        fetchTrendingData();
        loadSavedStatus();
    }, []);

    // --- LOGIC: BOOKMARKS ---
    const loadSavedStatus = async () => {
        try {
            const savedData = await AsyncStorage.getItem('saved_places');
            if (savedData) {
                const parsed = JSON.parse(savedData);
                setSavedIds(parsed.map(item => item.id));
            }
        } catch (e) { console.error(e); }
    };

    const toggleSave = async (place) => {
        try {
            const savedData = await AsyncStorage.getItem('saved_places');
            let savedArray = savedData ? JSON.parse(savedData) : [];
            const isAlreadySaved = savedArray.find(item => item.id === place.id);

            if (isAlreadySaved) {
                savedArray = savedArray.filter(item => item.id !== place.id);
            } else {
                savedArray.push({
                    ...place,
                    savedAt: new Date().toISOString(),
                    location: place.address,
                    organizer: 'Trending'
                });
            }

            await AsyncStorage.setItem('saved_places', JSON.stringify(savedArray));
            setSavedIds(savedArray.map(item => item.id));
        } catch (e) { console.error(e); }
    };

    // --- LOGIC: FETCHING ---
    const formatPlaces = (results) => {
        return results.map(place => {
            const photoReference = place.photos?.[0]?.photo_reference;
            const imageUrl = photoReference
                ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoReference}&key=${GOOGLE_API_KEY}`
                : 'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?w=800';

            return {
                id: place.place_id,
                name: place.name,
                rating: place.rating || 4.5,
                reviews: place.user_ratings_total || 120,
                address: place.formatted_address || place.vicinity,
                lat: place.geometry.location.lat,
                lng: place.geometry.location.lng,
                image: imageUrl,
                streetView: `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${place.geometry.location.lat},${place.geometry.location.lng}&heading=151.78&pitch=-0.76&key=${GOOGLE_API_KEY}`,
            };
        });
    };

    const fetchTrendingData = async (token = null) => {
        try {
            if (!token && !loadingMore) setLoading(true);
            else setLoadingMore(true);

            let currentQuery = queries[queryIndex % queries.length];
            let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${currentQuery}&key=${GOOGLE_API_KEY}`;
            if (token) url += `&pagetoken=${token}`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.status === "OK") {
                const newPlaces = formatPlaces(data.results);
                setTrendingLocations(prev => {
                    const combined = token ? [...prev, ...newPlaces] : newPlaces;
                    return combined.filter((item, index, self) =>
                        index === self.findIndex((t) => t.id === item.id)
                    );
                });

                if (data.next_page_token) {
                    setNextPageToken(data.next_page_token);
                } else {
                    setNextPageToken(null);
                    setQueryIndex(prev => prev + 1);
                }
            }
        } catch (error) {
            console.error("Trending fetch error:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
        }
    };

    // --- NAVIGATION: ATLAS HANDLER ---
    const handleGoToAtlas = (place) => {
        setModalVisible(false);
        navigation.navigate('Atlas', {
            searchLocation: {
                name: place.name,
                address: place.address,
                coords: { latitude: place.lat, longitude: place.lng },
                image: place.image,
                autoShowDirections: true // Optional: triggers directions immediately
            }
        });
    };

    const handleLoadMore = useCallback(() => {
        if (!loadingMore) {
            if (nextPageToken) {
                setTimeout(() => fetchTrendingData(nextPageToken), 2000);
            } else {
                fetchTrendingData();
            }
        }
    }, [loadingMore, nextPageToken]);

    const onRefresh = () => {
        setRefreshing(true);
        setQueryIndex(0);
        fetchTrendingData();
    };

    // --- COMPONENTS ---
    const renderViralCard = ({ item }) => {
        const isSaved = savedIds.includes(item.id);
        return (
            <TouchableOpacity
                activeOpacity={0.9}
                style={styles.locationCard}
                onPress={() => { setSelectedPlace(item); setModalVisible(true); }}
            >
                <ImageBackground
                    source={{ uri: item.image }}
                    style={styles.cardImage}
                    imageStyle={{ borderRadius: 25, backgroundColor: isDark ? '#1e293b' : '#e2e8f0' }}
                >
                    <TouchableOpacity
                        style={styles.cardBookmark}
                        onPress={() => toggleSave(item)}
                    >
                        <Ionicons
                            name={isSaved ? "bookmark" : "bookmark-outline"}
                            size={20}
                            color={isSaved ? colors.primary : "white"}
                        />
                    </TouchableOpacity>

                    <View style={styles.cardOverlay}>
                        <Text style={styles.locationName} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.echoCount}>
                            <Ionicons name="flame" size={14} color="#FF5252" />
                            {item.reviews > 1000 ? ` ${(item.reviews / 1000).toFixed(1)}k` : ` ${item.reviews}`} Viral Reviews
                        </Text>
                    </View>
                </ImageBackground>
            </TouchableOpacity>
        );
    };

    const renderPopularItem = ({ item, index }) => {
        const isSaved = savedIds.includes(item.id);
        return (
            <TouchableOpacity
                onPress={() => { setSelectedPlace(item); setModalVisible(true); }}
                style={[styles.listItem, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
            >
                <View style={[styles.rankCircle, { backgroundColor: colors.primary }]}>
                    <Text style={styles.rankNum}>{index + 1}</Text>
                </View>
                <View style={styles.listTextContent}>
                    <Text style={[styles.listTitle, { color: colors.textMain }]} numberOfLines={1}>{item.name}</Text>
                    <Text style={[styles.listSub, { color: colors.textSecondary }]} numberOfLines={1}>⭐ {item.rating} • {item.address}</Text>
                </View>
                <TouchableOpacity onPress={() => toggleSave(item)} style={{ padding: 5 }}>
                    <Ionicons
                        name={isSaved ? "bookmark" : "bookmark-outline"}
                        size={22}
                        color={isSaved ? colors.primary : colors.textSecondary}
                    />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    const ListHeader = () => (
        <View>
            <View style={styles.sectionHeader}>
                <Ionicons name="stats-chart" size={22} color="#FF5252" />
                <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Viral Locations</Text>
            </View>
            <FlatList
                horizontal
                data={viralLocations}
                renderItem={renderViralCard}
                keyExtractor={(item) => `viral-${item.id}`}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 20 }}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
            />

            <View style={styles.sectionHeader}>
                <Ionicons name="trending-up" size={22} color={colors.primary} />
                <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Hot Tags</Text>
            </View>
            <View style={styles.tagGrid}>
                {['#HiddenGems', '#StreetFood', '#IslandLife', '#HistoricPH'].map((tag, index) => (
                    <TouchableOpacity key={index} style={[styles.tagPill, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                        <Text style={[styles.tagText, { color: colors.primary }]}>{tag}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.sectionHeader}>
                <Ionicons name="flash" size={22} color="#FACC15" />
                <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Popular Now</Text>
            </View>
        </View>
    );

    if (loading && !refreshing) {
        return (
            <View style={[styles.container, { justifyContent: 'center', backgroundColor: colors.background[0] }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background[0] }]}>
            <FlatList
                data={popularNowLocations}
                renderItem={renderPopularItem}
                keyExtractor={(item) => `popular-${item.id}`}
                ListHeaderComponent={ListHeader}
                contentContainerStyle={styles.scrollContent}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.7}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
                ListFooterComponent={() => loadingMore && (
                    <View style={{ paddingVertical: 30 }}>
                        <ActivityIndicator size="small" color={colors.primary} />
                    </View>
                )}
            />

            <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
                    <Pressable style={[styles.modalContent, { backgroundColor: isDark ? '#0F172A' : '#FFF' }]}>
                        {/* Modal Handle & Close Button Header */}
                        <View style={styles.modalHeader}>
                            <View style={styles.modalHandle} />
                            <TouchableOpacity
                                style={[styles.closeButton, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Ionicons name="close" size={20} color={colors.textMain} />
                            </TouchableOpacity>
                        </View>

                        <View style={{ width: '100%' }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <Text style={[styles.modalTitle, { color: colors.textMain, flex: 1, textAlign: 'left', marginBottom: 0 }]}>
                                    {selectedPlace?.name}
                                </Text>
                                <TouchableOpacity onPress={() => toggleSave(selectedPlace)}>
                                    <Ionicons
                                        name={savedIds.includes(selectedPlace?.id) ? "bookmark" : "bookmark-outline"}
                                        size={28}
                                        color={colors.primary}
                                    />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.streetViewContainer}>
                                <ImageBackground source={{ uri: selectedPlace?.streetView }} style={styles.streetViewImg} />
                            </View>

                            <TouchableOpacity
                                style={[styles.actionBtn, { backgroundColor: colors.primary, marginTop: 25 }]}
                                onPress={() => handleGoToAtlas(selectedPlace)}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Ionicons name="map" size={20} color="white" style={{ marginRight: 10 }} />
                                    <Text style={styles.actionBtnText}>Go to Atlas</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 50, paddingTop: 10 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, marginTop: 25 },
    sectionTitle: { fontSize: 22, fontWeight: '900', marginLeft: 10 },
    locationCard: { width: width * 0.75, height: 220, marginRight: 15 },
    cardImage: { flex: 1, justifyContent: 'flex-end' },
    cardBookmark: { position: 'absolute', top: 15, right: 15, backgroundColor: 'rgba(0,0,0,0.3)', padding: 8, borderRadius: 15 },
    cardOverlay: { padding: 18, backgroundColor: 'rgba(0,0,0,0.5)', borderBottomLeftRadius: 25, borderBottomRightRadius: 25 },
    locationName: { color: 'white', fontWeight: '900', fontSize: 18, marginBottom: 4 },
    echoCount: { color: 'white', fontSize: 13, fontWeight: '700' },
    tagGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    tagPill: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 25, borderWidth: 1 },
    tagText: { fontWeight: '800', fontSize: 13 },
    listItem: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 25, marginBottom: 12, borderWidth: 1 },
    rankCircle: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    rankNum: { color: 'white', fontWeight: '900', fontSize: 15 },
    listTextContent: { flex: 1 },
    listTitle: { fontWeight: '800', fontSize: 16 },
    listSub: { fontSize: 12, marginTop: 4, opacity: 0.7 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
    modalContent: { height: height * 0.65, borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 25 },
    modalHandle: { width: 50, height: 5, backgroundColor: '#334155', borderRadius: 3, marginBottom: 20, alignSelf: 'center' },
    modalTitle: { fontSize: 24, fontWeight: '900', marginBottom: 20 },
    streetViewContainer: { width: '100%', height: 200, borderRadius: 25, overflow: 'hidden' },
    streetViewImg: { width: '100%', height: '100%' },
    actionBtn: { width: '100%', height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    actionBtnText: { color: 'white', fontWeight: '900', fontSize: 17 },
    modalHeader: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%', marginBottom: 15, position: 'relative' },
closeButton: { position: 'absolute', right: -10, top: -15, width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
});

export default Trending;