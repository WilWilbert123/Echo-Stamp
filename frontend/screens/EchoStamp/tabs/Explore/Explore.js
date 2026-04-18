import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import { useTheme } from '../../../../context/ThemeContext';
import { styles } from './Explore.style';
import { useExplore } from './hooks/useExplore';
import { DARK_MAP_STYLE } from './utils/Explore.utils';
// In Explore.js
// Components
import { CategoryGroupList } from './components/CategoryGroupList';
import { CategoryModal } from './components/CategoryModal';
import { ExploreModal } from './components/ExploreModal';
import { PlaceCard } from './components/PlaceCard';
import { QuickAccess } from './components/QuickAccess';
import { RadiusSelector } from './components/RadiusSelector';

const Explore = () => {
    const { colors, isDark } = useTheme();
    const navigation = useNavigation();
    const mapRef = useRef(null);
    const [isRadiusModalVisible, setRadiusModalVisible] = useState(false);
    const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);

    const {
        userLocation, searchQuery, setSearchQuery, places, loading, isFetching,
        selectedCategory, setSelectedCategory, selectedPlace, setSelectedPlace,
        isModalVisible, setModalVisible, savedIds, fetchNearbyGoogle,
        handleSearch, toggleSave, updateMapRegion, searchRadius, setSearchRadius
    } = useExplore(mapRef, colors);

    const goToAtlas = (place) => {
        setModalVisible(false);
        navigation.navigate('Atlas', {
            location: { latitude: place.lat, longitude: place.lon },
            placeName: place.name, placeAddress: place.address, placeImage: place.image
        });
    };

    const handleRadiusSelect = (radius) => {
        setSearchRadius(radius);
        if (userLocation && selectedCategory) {
            fetchNearbyGoogle(userLocation.latitude, userLocation.longitude, selectedCategory, radius);
        } else if (userLocation) {
            const foodCategory = { name: 'Restaurants', type: 'restaurant', color: colors.primary, icon: 'restaurant' };
            fetchNearbyGoogle(userLocation.latitude, userLocation.longitude, foodCategory, radius);
        }
    };

    const handleSelectCategory = (category) => {
        setSelectedCategory(category);
        if (userLocation) {
            fetchNearbyGoogle(userLocation.latitude, userLocation.longitude, category);
        }
    };

    const handleSelectGroup = (group) => {
        setSelectedGroup(group);
        setCategoryModalVisible(true);
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
                    <TouchableOpacity
                        style={[styles.radiusBtn, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
                        onPress={() => setRadiusModalVisible(true)}
                    >
                        <Ionicons name="resize" size={18} color={colors.primary} />
                        <Text style={[styles.radiusBtnText, { color: colors.textMain }]}>
                            {searchRadius >= 1000 ? `${searchRadius / 1000}km` : `${searchRadius}m`}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Quick Access Categories */}
                <QuickAccess
                    colors={colors}
                    selectedCategory={selectedCategory}
                    onSelectCategory={handleSelectCategory}
                />

                {/* Category Groups */}
                <CategoryGroupList
                    colors={colors}
                    onSelectGroup={handleSelectGroup}
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
                    <Text style={[styles.sectionTitle, { color: colors.textMain }]}>
                        {selectedCategory?.name || 'Explore'}
                    </Text>
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

            <RadiusSelector
                visible={isRadiusModalVisible}
                onClose={() => setRadiusModalVisible(false)}
                currentRadius={searchRadius}
                onSelectRadius={handleRadiusSelect}
                colors={colors}
            />
           

            <CategoryModal
                visible={isCategoryModalVisible}
                onClose={() => setCategoryModalVisible(false)}
                group={selectedGroup}
                onSelectCategory={handleSelectCategory}
                colors={colors}
            />
        </View>
    );
};

export default Explore;