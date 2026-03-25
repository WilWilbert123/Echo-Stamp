import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import React, { useRef } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import { useTheme } from '../../../../context/ThemeContext';
import { styles } from './Explore.style';
import { useExplore } from './hooks/useExplore';
import { DARK_MAP_STYLE } from './utils/Explore.utils';

// Components
import { CategoryList } from './components/CategoryList';
import { ExploreModal } from './components/ExploreModal';
import { PlaceCard } from './components/PlaceCard';

const Explore = () => {
    const { colors, isDark } = useTheme();
    const navigation = useNavigation();
    const mapRef = useRef(null);
    const {
        userLocation, searchQuery, setSearchQuery, places, loading, isFetching,
        selectedCategory, selectedPlace, setSelectedPlace, isModalVisible, setModalVisible,
        savedIds, fetchNearbyGoogle, handleSearch, toggleSave, updateMapRegion
    } = useExplore(mapRef, colors);

    const goToAtlas = (place) => {
        setModalVisible(false);
        navigation.navigate('Atlas', {
            location: { latitude: place.lat, longitude: place.lon },
            placeName: place.name, placeAddress: place.address, placeImage: place.image
        });
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.background[0] }}>
            <View style={styles.headerArea}>
                <View style={[styles.searchWrapper, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                    <Ionicons name="search" size={20} color={colors.textSecondary} />
                    <TextInput
                        placeholder="Search places..."
                        placeholderTextColor={colors.textSecondary}
                        style={[styles.searchInput, { color: colors.textMain }]}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearch}
                        editable={!isFetching}
                    />
                </View>
                <CategoryList 
                    colors={colors} userLocation={userLocation} 
                    selectedCategory={selectedCategory} onSelect={fetchNearbyGoogle} 
                />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={[styles.mapContainer, { borderColor: colors.glassBorder }]}>
                    <MapView
                        ref={mapRef} provider={PROVIDER_GOOGLE} style={styles.map}
                        initialRegion={userLocation} customMapStyle={isDark ? DARK_MAP_STYLE : []}
                    >
                        {userLocation && (
                            <Marker coordinate={userLocation} anchor={{ x: 0.5, y: 0.5 }}>
                                <View style={{ width: 30, height: 30 }}>
                                    <LottieView source={require('../../../../assets/location-map.json')} autoPlay loop style={{ flex: 1 }} />
                                </View>
                            </Marker>
                        )}
                        {places.map(p => (
                            <Marker key={p.id} coordinate={{ latitude: p.lat, longitude: p.lon }} onPress={() => { setSelectedPlace(p); setModalVisible(true); }}>
                                <View style={[styles.customMarker, { backgroundColor: p.categoryColor }]}>
                                    <Ionicons name={p.categoryIcon} size={14} color="white" />
                                </View>
                            </Marker>
                        ))}
                    </MapView>
                    <TouchableOpacity style={[styles.recenterBtn, { backgroundColor: colors.primary }]} onPress={() => updateMapRegion(places)}>
                        <Ionicons name="locate" size={20} color="white" />
                    </TouchableOpacity>
                </View>

                <View style={styles.resultsHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.textMain }]}>{selectedCategory?.name || 'Explore'}</Text>
                    <Text style={{ color: colors.textSecondary }}>{places.length} found</Text>
                </View>

                {loading ? <ActivityIndicator size="large" color={colors.primary} /> : 
                    places.map(item => (
                        <PlaceCard 
                            key={item.id} item={item} colors={colors} 
                            isSaved={savedIds.includes(item.id)} onSave={toggleSave}
                            onSelect={() => { setSelectedPlace(item); setModalVisible(true); }}
                        />
                    ))
                }
            </ScrollView>

            <ExploreModal 
                visible={isModalVisible} place={selectedPlace} colors={colors} isDark={isDark}
                isSaved={savedIds.includes(selectedPlace?.id)} onSave={toggleSave}
                onClose={() => setModalVisible(false)} onGoToAtlas={() => selectedPlace && goToAtlas(selectedPlace)}
            />
        </View>
    );
};

export default Explore;