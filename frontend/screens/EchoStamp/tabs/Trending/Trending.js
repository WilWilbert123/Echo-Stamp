import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, ImageBackground, Modal, Pressable, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../../../context/ThemeContext';
import { useTrending } from './hooks/useTrending';
import { styles } from './Trending.styles';

const Trending = () => {
    const { colors, isDark } = useTheme();
    const {
        loading, refreshing, loadingMore, viralLocations, popularNowLocations,
        savedIds, toggleSave, onRefresh, handleLoadMore, navigation
    } = useTrending();

    const [selectedPlace, setSelectedPlace] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const handleGoToAtlas = (place) => {
        setModalVisible(false);
        navigation.navigate('Atlas', {
            searchLocation: {
                name: place.name,
                address: place.address,
                coords: { latitude: place.lat, longitude: place.lng },
                image: place.image,
                autoShowDirections: true
            }
        });
    };

    const renderViralCard = ({ item }) => {
        const isSaved = savedIds.includes(item.id);
        return (
            <TouchableOpacity activeOpacity={0.9} style={styles.locationCard} onPress={() => { setSelectedPlace(item); setModalVisible(true); }}>
                <ImageBackground source={{ uri: item.image }} style={styles.cardImage} imageStyle={{ borderRadius: 25, backgroundColor: isDark ? '#1e293b' : '#e2e8f0' }}>
                    <TouchableOpacity style={styles.cardBookmark} onPress={() => toggleSave(item)}>
                        <Ionicons name={isSaved ? "bookmark" : "bookmark-outline"} size={20} color={isSaved ? colors.primary : "white"} />
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
            <TouchableOpacity onPress={() => { setSelectedPlace(item); setModalVisible(true); }} style={[styles.listItem, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                <View style={[styles.rankCircle, { backgroundColor: colors.primary }]}>
                    <Text style={styles.rankNum}>{index + 1}</Text>
                </View>
                <View style={styles.listTextContent}>
                    <Text style={[styles.listTitle, { color: colors.textMain }]} numberOfLines={1}>{item.name}</Text>
                    <Text style={[styles.listSub, { color: colors.textSecondary }]} numberOfLines={1}>⭐ {item.rating} • {item.address}</Text>
                </View>
                <TouchableOpacity onPress={() => toggleSave(item)} style={{ padding: 5 }}>
                    <Ionicons name={isSaved ? "bookmark" : "bookmark-outline"} size={22} color={isSaved ? colors.primary : colors.textSecondary} />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    const ListHeader = () => (
        <View>
            <View style={styles.sectionHeader}><Ionicons name="stats-chart" size={22} color="#FF5252" /><Text style={[styles.sectionTitle, { color: colors.textMain }]}>Viral Locations</Text></View>
            <FlatList horizontal data={viralLocations} renderItem={renderViralCard} keyExtractor={(item) => `viral-${item.id}`} showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }} onEndReached={handleLoadMore} onEndReachedThreshold={0.5} />
            <View style={styles.sectionHeader}><Ionicons name="trending-up" size={22} color={colors.primary} /><Text style={[styles.sectionTitle, { color: colors.textMain }]}>Hot Tags</Text></View>
            <View style={styles.tagGrid}>
                {['#HiddenGems', '#StreetFood', '#IslandLife', '#HistoricPH'].map((tag, i) => (
                    <TouchableOpacity key={i} style={[styles.tagPill, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}><Text style={[styles.tagText, { color: colors.primary }]}>{tag}</Text></TouchableOpacity>
                ))}
            </View>
            <View style={styles.sectionHeader}><Ionicons name="flash" size={22} color="#FACC15" /><Text style={[styles.sectionTitle, { color: colors.textMain }]}>Popular Now</Text></View>
        </View>
    );

    if (loading && !refreshing) {
        return <View style={[styles.container, { justifyContent: 'center', backgroundColor: colors.background[0] }]}><ActivityIndicator size="large" color={colors.primary} /></View>;
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
                ListFooterComponent={() => loadingMore && <View style={{ paddingVertical: 30 }}><ActivityIndicator size="small" color={colors.primary} /></View>}
            />

            <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
                    <Pressable style={[styles.modalContent, { backgroundColor: isDark ? '#0F172A' : '#FFF' }]}>
                        <View style={styles.modalHeader}>
                            <View style={styles.modalHandle} />
                            <TouchableOpacity style={[styles.closeButton, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]} onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={20} color={colors.textMain} />
                            </TouchableOpacity>
                        </View>
                        <View style={{ width: '100%' }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <Text style={[styles.modalTitle, { color: colors.textMain, flex: 1 }]}>{selectedPlace?.name}</Text>
                                <TouchableOpacity onPress={() => toggleSave(selectedPlace)}>
                                    <Ionicons name={savedIds.includes(selectedPlace?.id) ? "bookmark" : "bookmark-outline"} size={28} color={colors.primary} />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.streetViewContainer}><ImageBackground source={{ uri: selectedPlace?.streetView }} style={styles.streetViewImg} /></View>
                            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary, marginTop: 25 }]} onPress={() => handleGoToAtlas(selectedPlace)}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Ionicons name="map" size={20} color="white" style={{ marginRight: 10 }} /><Text style={styles.actionBtnText}>Go to Atlas</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
};

export default Trending;