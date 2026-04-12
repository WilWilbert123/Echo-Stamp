import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Image, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import GlassCard from '../../components/GlassCard';
import { useTheme } from '../../context/ThemeContext';


import styles, { darkMapStyle } from '../Atlas/Atlas.styles';

import AtlasMarker from './components/AtlasMarker';
import { MediaViewerModal, PinMemoryModal, ShareLocationModal } from './components/AtlasModals';
import AtlasSearchBar from './components/AtlasSearchBar';
import { useAtlas } from './hooks/useAtlas';
import { useLocation } from './hooks/useLocation';
import { renderStreetViewHTML } from './utils/mediaHelpers';

const Atlas = () => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  const travelModes = [
    { key: 'driving', icon: 'car', label: 'Car' },
    { key: 'walking', icon: 'walk', label: 'Walk' },
    { key: 'bicycling', icon: 'bicycle', label: 'Motor' },
    { key: 'transit', icon: 'train', label: 'Transit' },
  ];

  const formatTime = (minutes) => {
    const mins = Math.round(minutes);
    if (mins < 60) return `${mins} mins`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return remainingMins > 0 ? `${hours} hr ${remainingMins} min` : `${hours} hr`;
  };

  const atlas = useAtlas();
  const hasCenteredRoute = useRef(false);

  // Reset the "fit route" flag when navigation is cancelled
  useEffect(() => {
    if (!atlas.showDirections) {
      hasCenteredRoute.current = false;
    }
  }, [atlas.showDirections]);

  // Immersive 3D Navigation Camera Logic
  useEffect(() => {
    if (atlas.showDirections && atlas.userLocation && atlas.mapRef.current) {
      atlas.mapRef.current.animateCamera({
        center: atlas.userLocation,
        pitch: 60, // Tilted forward to look down the road for a "straight-ahead" view
        heading: atlas.arrowHeading, // Align map heading with device compass
        altitude: 200, // Lower altitude for a more immersive perspective
        zoom: 18, // Adjusted zoom level to ensure traffic lines (green/red) remain visible
      }, { duration: 500 }); // Faster duration to keep the camera locked to your direction
    }
  }, [atlas.userLocation, atlas.arrowHeading, atlas.showDirections]);

  // Inject location logic
  useLocation(
    atlas.showDirections,
    atlas.routeCoordinates,
    atlas.setUserLocation,
    atlas.setArrowHeading
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background[0] }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        translucent
        backgroundColor="transparent"
      />

      {!atlas.showDirections && (
        <AtlasSearchBar
          insets={insets}
          colors={colors}
          isSearching={atlas.isSearching}
          searchQuery={atlas.searchQuery}
          setSearchQuery={atlas.setSearchQuery}
          handleSearch={atlas.handleSearch}
          isListening={atlas.isListening}
          toggleListening={atlas.toggleListening}
        />
      )}

      {/* Share Location FAB */}
      <TouchableOpacity
        style={[styles.shareFab, { top: insets.top + 90, backgroundColor: colors.background[1], borderColor: colors.glassBorder, borderWidth: 1 }]}
        onPress={atlas.openShareModal}
      >
        <Ionicons
          name={atlas.isLiveSharingActive ? "location" : "share-social"}
          size={22}
          color={atlas.isLiveSharingActive ? "#10B981" : colors.primary}
        />
      </TouchableOpacity>

      <MapView
        ref={atlas.mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: 14.5995,
          longitude: 120.9842,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1
        }}
        onLongPress={(e) => {
          atlas.setTempCoords(e.nativeEvent.coordinate);
          atlas.setModalVisible(true);
        }}
        // Properly applying the dark theme JSON here
        customMapStyle={isDark ? darkMapStyle : []}
        userInterfaceStyle={isDark ? 'dark' : 'light'}
        showsBuildings={true} // Enable 3D buildings
        showsTraffic={true} // Explicitly keeping traffic layer enabled
        showsIndoors={false}
        showsIndoorLevelPicker={false}
        showsUserLocation={false} // Hide the native blue dot to prevent overlapping
        showsMyLocationButton={false} // We can use a custom one
      >
        {atlas.showDirections && atlas.userLocation && atlas.destination && (
          <>
            <MapViewDirections
              origin={atlas.userLocation}
              destination={atlas.destination}
              apikey={atlas.GOOGLE_MAPS_APIKEY}
              strokeWidth={4}
              strokeColor={colors.primary} // Restored to solid color to fix the "not color" (faded) appearance
              precision="high"
              mode={atlas.travelMode === 'bicycling' ? 'driving' : atlas.travelMode} // Map 'bicycling' to 'driving' for API

              alternatives={true}
              onReady={(result) => {
                if (result.routes && result.routes.length > 0) {
                  // Set the primary route coordinates
                  atlas.setRouteCoordinates(result.routes[0].coordinates);
                  // Set alternative routes (excluding the first one)
                  atlas.setAlternativeRoutes(result.routes.slice(1));
                  // Set estimated time for the primary route
                  atlas.setEstimatedTime(result.routes[0].duration || result.duration);
                } else if (result.coordinates) {
                  // Fallback for responses without a routes array
                  atlas.setRouteCoordinates(result.coordinates);
                  atlas.setEstimatedTime(result.duration);
                  atlas.setAlternativeRoutes([]);
                }

                if (result.duration) {
                  console.log("Estimated duration:", result.duration, "minutes");
                }

                // Only fit to coordinates ONCE to avoid "zooming from top" refresh loop
                if (!hasCenteredRoute.current) {
                  atlas.mapRef.current?.fitToCoordinates(result.coordinates, {
                    edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
                    animated: true,
                  });
                  hasCenteredRoute.current = true;
                }
              }}
            />
            {/* Render alternative routes with lighter color */}
            {atlas.alternativeRoutes.map((route, index) => (
              <MapViewDirections key={`alt-route-${index}`} origin={atlas.userLocation} destination={atlas.destination}
                apikey={atlas.GOOGLE_MAPS_APIKEY} strokeWidth={3} strokeColor={`${colors.primary}80`} coordinates={route.coordinates} mode={atlas.travelMode} />
            ))}
          </>
        )}

        {atlas.userLocation && (
          <Marker
            coordinate={atlas.userLocation}
            anchor={{ x: 0.5, y: 0.5 }}
            flat={true} // Makes the marker tilt with the map
            rotation={atlas.arrowHeading}
            tracksViewChanges={true}
            zIndex={999} // Ensure the marker is always on top
          >
            <Image
              source={require('../../assets/navigation.png')}
              style={{
                width: 30,
                height: 30,
                resizeMode: 'contain'
              }}
            />

          </Marker>

        )}



        {/* Render Friends' Live Locations */}
        {atlas.activeShares.map((share) => {
          const friend = share.sharer;
          if (!friend.lastKnownLocation) return null;
          return (
            <Marker
              key={`live-${friend._id}`}
              coordinate={friend.lastKnownLocation}
              title={`${friend.firstName}'s Live Location`}
            >
              <View style={styles.liveMarkerContainer}>
                <View style={styles.liveMarker}>
                  <Image
                    source={{ uri: friend.profilePicture || 'https://via.placeholder.com/100' }}
                    style={styles.liveAvatar}
                    resizeMode="cover"
                  />
                </View>
              </View>
            </Marker>
          );
        })}

        {atlas.markers.map((journal) => (
          <AtlasMarker
            key={journal._id}
            journal={journal}
            colors={colors}
            isDark={isDark}
            onPress={() => {
              atlas.setSelectedJournal(journal);
              atlas.setDestination({ latitude: Number(journal.location.lat), longitude: Number(journal.location.lng) });
              atlas.setActiveMediaIndex(0);
              atlas.setViewerVisible(true);
            }}
          />
        ))}
      </MapView>

      {/* Navigation Cancel Button */}
      {atlas.showDirections && (
        <View style={[styles.cancelNavBtn, { top: insets.top + 100, flexDirection: 'column' }]}>
          <TouchableOpacity onPress={atlas.cancelNavigation}>
            <GlassCard style={styles.cancelNavCard}>
              <Ionicons name="close-circle" size={20} color="#ff4444" />
              <Text style={{ color: '#ff4444', fontWeight: '700', marginLeft: 5 }}>Stop</Text>
            </GlassCard>
          </TouchableOpacity>
          {/* Estimated time moved to travelModeCard */}
        </View>
      )}

      {/* Travel Mode Selection and Estimated Time */}
      {atlas.showDirections && (
        <View style={[styles.travelModeContainer, { bottom: insets.bottom + 10 }]}>
          <GlassCard style={[styles.travelModeCard, { borderColor: colors.glassBorder }]}>
            {atlas.estimatedTime !== null && atlas.estimatedTime !== undefined && (
              <View style={{ width: '100%', alignItems: 'center', marginBottom: 8 }}>
                <Text style={[styles.estimatedTimeText, { color: colors.textMain, fontSize: 16 }]}>
                  Estimated Arrival: <Text style={{ color: '#10B981' }}>{formatTime(atlas.estimatedTime)}</Text>
                </Text>
              </View>
            )}
            <View style={styles.travelModeButtons}>
              {travelModes.map((mode) => (
                <TouchableOpacity
                  key={mode.key}
                  style={[styles.travelModeButton, atlas.travelMode === mode.key && { backgroundColor: colors.primary }]}
                  onPress={() => atlas.setTravelMode(mode.key)}
                >
                  <Ionicons 
                    name={mode.icon} 
                    size={20} 
                    color={atlas.travelMode === mode.key ? '#FFF' : (isDark ? '#FFFFFF' : '#000000')} 
                  />
                  <Text style={[styles.travelModeButtonText, { color: atlas.travelMode === mode.key ? '#FFF' : (isDark ? '#FFFFFF' : '#000000') }]}>
                    {mode.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </GlassCard>
        </View>
      )}

      {/* Search Result Card */}
      {atlas.searchResult && !atlas.showDirections && (
        <View style={styles.searchCardContainer}>
          <GlassCard style={[styles.searchResultCard, { backgroundColor: colors.background[1], borderColor: colors.glassBorder }]}>
            <View style={{ alignItems: 'center' }}>
              {atlas.searchResult.image ? (
                <Image source={{ uri: atlas.searchResult.image }} style={styles.searchResultImg} />
              ) : (
                <View style={[styles.searchResultImg, { backgroundColor: colors.glassBorder, justifyContent: 'center', alignItems: 'center' }]}>
                  <Ionicons name="image-outline" size={24} color={colors.textSecondary} />
                </View>
              )}
              <View style={{ flex: 1, marginTop: 20 }}>
                <Text style={[styles.searchResultTitle, { color: colors.textMain }]} numberOfLines={1}>{atlas.searchResult.name}</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12, width: 300 }} numberOfLines={1}>{atlas.searchResult.address}</Text>
              </View>
              <TouchableOpacity style={{ position: 'absolute', right: -20, bottom: 235 }} onPress={() => atlas.setSearchResult(null)}>
                <Ionicons name="close-circle" size={30} color={atlas.colors?.textSecondary || '#888'} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchCardButtons}>
              <TouchableOpacity onPress={() => { atlas.setSelectedJournal({ location: { lat: atlas.searchResult.coords.latitude, lng: atlas.searchResult.coords.longitude } }); atlas.setShowStreetView(true); }} style={[styles.actionBtn, { backgroundColor: '#4285F4', flex: 0.31 }]}>
                <Ionicons name="eye" size={18} color="#fff" /><Text style={styles.actionBtnText}>View</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { atlas.setDestination(atlas.searchResult.coords); atlas.setShowDirections(true); }} style={[styles.actionBtn, { backgroundColor: '#34A853', flex: 0.31 }]}>
                <Ionicons name="navigate" size={18} color="#fff" />
                <Text style={styles.actionBtnText}>Navigate</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { atlas.setTempCoords(atlas.searchResult.coords); atlas.setModalVisible(true); }} style={[styles.actionBtn, { backgroundColor: colors.primary, flex: 0.31 }]}>
                <Ionicons name="add" size={18} color="#fff" /><Text style={styles.actionBtnText}>Pin</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </View>
      )}

      {/* Street View Overlay */}
      {atlas.showStreetView && atlas.selectedJournal && (
        <View style={StyleSheet.absoluteFill}>
          <WebView source={{ html: renderStreetViewHTML(atlas.selectedJournal.location.lat, atlas.selectedJournal.location.lng, atlas.GOOGLE_MAPS_APIKEY) }} />
          <TouchableOpacity style={[styles.closeStreetView, { top: insets.top + 20 }]} onPress={() => atlas.setShowStreetView(false)}>
            <Ionicons name="close-circle" size={45} color="white" />
          </TouchableOpacity>
        </View>
      )}

      <MediaViewerModal
        visible={atlas.viewerVisible}
        setVisible={atlas.setViewerVisible}
        selectedJournal={atlas.selectedJournal}
        activeMediaIndex={atlas.activeMediaIndex}
        setActiveMediaIndex={atlas.setActiveMediaIndex}
        colors={colors}
        isDark={isDark}
        width={atlas.width}
        handleDelete={atlas.handleDeleteJournal}
        handleRemoveMedia={atlas.handleRemoveSingleSavedMedia}
        setShowStreetView={atlas.setShowStreetView}
        setShowDirections={atlas.setShowDirections}
      />

      <PinMemoryModal
        visible={atlas.modalVisible}
        setVisible={atlas.setModalVisible}
        colors={colors}
        mediaList={atlas.mediaList}
        setMediaList={atlas.setMediaList}
        pickMedia={atlas.pickMedia}
        title={atlas.title}
        setTitle={atlas.setTitle}
        description={atlas.description}
        setDescription={atlas.setDescription}
        handleSave={atlas.handleSave}
        loading={atlas.loading}
      />

      <ShareLocationModal
        visible={atlas.shareModalVisible}
        setVisible={atlas.setShareModalVisible}
        users={atlas.allUsers}
        selectedIds={atlas.selectedUserIds}
        toggleSelect={atlas.toggleUserSelection}
        searchQuery={atlas.userSearchQuery}
        setSearchQuery={atlas.setUserSearchQuery}
        colors={colors}
      />
    </View>
  );
};

export default Atlas;