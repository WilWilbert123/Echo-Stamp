import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
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
  const route = useRoute();
  const navigation = useNavigation();

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
  const hasCenteredSearchRoute = useRef(false);

  // Reset the "fit route" flag when navigation is cancelled
  useEffect(() => {
    if (!atlas.showDirections) {
      hasCenteredRoute.current = false;
    }
  }, [atlas.showDirections]);

  // Reset search route flag when search result changes
  useEffect(() => {
    if (!atlas.searchResult) {
      hasCenteredSearchRoute.current = false;
    }
  }, [atlas.searchResult]);

  // Immersive 3D Navigation Camera Logic
  useEffect(() => {
    if (atlas.showDirections && atlas.userLocation && atlas.mapRef.current) {
      atlas.mapRef.current.animateCamera({
        center: atlas.userLocation,
        pitch: 60,
        heading: atlas.arrowHeading,
        altitude: 200,
        zoom: 18,
      }, { duration: 500 });
    }
  }, [atlas.userLocation, atlas.arrowHeading, atlas.showDirections]);

  // Inject location logic
  useLocation(
    atlas.showDirections,
    atlas.routeCoordinates,
    atlas.setUserLocation,
    atlas.setArrowHeading
  );

  // Clear persistent marker and search result
  const handleClearPersistentMarker = () => {
    atlas.clearPersistentMarker();
    if (atlas.searchResult) {
      atlas.setSearchResult(null);
    }
  };

  // Handle show route from search result
  const handleShowRouteFromSearch = () => {
    if (atlas.searchResult && atlas.userLocation) {
      atlas.setDestination(atlas.searchResult.coords);
      atlas.setShowDirections(true);
      atlas.triggerPinDropAnimation(atlas.searchResult.coords);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background[0] }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        translucent
        backgroundColor="transparent"
      />

      {/* Stamping Instruction Overlay */}
      {route.params?.mode === 'stamping' && !atlas.modalVisible && !atlas.searchResult && (
        <View style={[
            styles.stampingOverlay, 
            { bottom: insets.bottom + 100, backgroundColor: colors.primary }
        ]}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={{ color: 'white', fontWeight: '800', fontSize: 14 }}>
               Search a location and click the PIN button or long-press the map.
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigation.setParams({ mode: null })}>
            <Ionicons name="close-circle" size={26} color="white" />
          </TouchableOpacity>
        </View>
      )}

      {!atlas.showDirections && (
        <AtlasSearchBar
          insets={insets}
          colors={colors}
          isSearching={atlas.isSearching}
          searchQuery={atlas.searchQuery}
          setSearchQuery={atlas.setSearchQuery}
          handleSearch={atlas.handleSearch}
          isListening={atlas.isListening}
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

      {/* Clear Marker FAB - shows only when persistent marker exists */}
      {atlas.showPersistentMarker && !atlas.showDirections && (
        <TouchableOpacity
          style={[styles.clearMarkerFab, { top: insets.top + 150, right: 20, backgroundColor: colors.background[1] }]}
          onPress={handleClearPersistentMarker}
        >
          <Ionicons name="trash-outline" size={20} color={colors.primary} />
          <Text style={{ color: colors.textMain, marginLeft: 8, fontSize: 12 }}>Clear Marker</Text>
        </TouchableOpacity>
      )}

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
        customMapStyle={isDark ? darkMapStyle : []}
        userInterfaceStyle={isDark ? 'dark' : 'light'}
        showsBuildings={true}
        showsTraffic={true}
        showsIndoors={false}
        showsIndoorLevelPicker={false}
        showsUserLocation={false}
        showsMyLocationButton={false}
      >
        {/* Temporary Drop Animation (shows for 1.5 seconds then auto-hides) */}
        {atlas.showPinDropAnimation && atlas.pinDropCoordinates && (
          <Marker 
            coordinate={atlas.pinDropCoordinates}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={true}
            zIndex={1001}
          >
            <LottieView
              source={require('../../assets/drop.json')}
              style={{ width: 60, height: 60 }}
              autoPlay={true}
              loop={false}
              speed={1.2}
              onAnimationFinish={() => {
                atlas.setShowPinDropAnimation(false);
              }}
            />
          </Marker>
        )}

        {/* Persistent Marker with Lottie Animation (stays until cleared) */}
        {atlas.showPersistentMarker && atlas.persistentMarker && (
          <Marker 
            coordinate={atlas.persistentMarker}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={true}
            zIndex={1000}
          >
            <View style={styles.persistentPinContainer}>
              <LottieView
                source={require('../../assets/drop.json')}
                style={{ width: 40, height: 40 }}
                autoPlay={true}
                loop={true}
                speed={0.8}
              />
              <View style={[styles.persistentPinTail, { borderTopColor: colors.primary }]} />
              {/* Label bubble */}
              {atlas.searchResult && (
                <View style={[styles.persistentLabel, { backgroundColor: colors.background[1] }]}>
                  <Text style={[styles.persistentLabelText, { color: colors.textMain }]} numberOfLines={1}>
                    {atlas.searchResult.name}
                  </Text>
                  <TouchableOpacity onPress={handleClearPersistentMarker} style={styles.persistentLabelClose}>
                    <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </Marker>
        )}

        {/* Route from user to destination when showDirections is true - THICKER LINE */}
        {atlas.showDirections && atlas.userLocation && atlas.destination && (
          <>
            <MapViewDirections
              origin={atlas.userLocation}
              destination={atlas.destination}
              apikey={atlas.GOOGLE_MAPS_APIKEY}
              strokeWidth={8}
              strokeColor={colors.primary}
              strokeColors={[colors.primary, '#34A853', '#4285F4']}
              precision="high"
              mode={atlas.travelMode === 'bicycling' ? 'driving' : atlas.travelMode}
              alternatives={true}
              onReady={(result) => {
                if (result.routes && result.routes.length > 0) {
                  atlas.setRouteCoordinates(result.routes[0].coordinates);
                  atlas.setAlternativeRoutes(result.routes.slice(1));
                  atlas.setEstimatedTime(result.routes[0].duration || result.duration);
                } else if (result.coordinates) {
                  atlas.setRouteCoordinates(result.coordinates);
                  atlas.setEstimatedTime(result.duration);
                  atlas.setAlternativeRoutes([]);
                }

                if (!hasCenteredRoute.current) {
                  atlas.mapRef.current?.fitToCoordinates(result.coordinates, {
                    edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
                    animated: true,
                  });
                  hasCenteredRoute.current = true;
                }
              }}
            />
            {atlas.alternativeRoutes.map((route, index) => (
              <MapViewDirections 
                key={`alt-route-${index}`} 
                origin={atlas.userLocation} 
                destination={atlas.destination}
                apikey={atlas.GOOGLE_MAPS_APIKEY} 
                strokeWidth={6}
                strokeColor={`${colors.primary}CC`}
                coordinates={route.coordinates} 
                mode={atlas.travelMode === 'bicycling' ? 'driving' : atlas.travelMode}
              />
            ))}
          </>
        )}

        {/* Route from search result - THICKER AND DARKER LINE */}
        {!atlas.showDirections && atlas.searchResult && atlas.userLocation && (
          <MapViewDirections
            origin={atlas.userLocation}
            destination={atlas.searchResult.coords}
            apikey={atlas.GOOGLE_MAPS_APIKEY}
            strokeWidth={6}
            strokeColor={colors.primary}
            strokeColors={[colors.primary, '#34A853']}
            precision="high"
            mode={atlas.travelMode === 'bicycling' ? 'driving' : atlas.travelMode}
            onReady={(result) => {
              if (!hasCenteredSearchRoute.current && result.coordinates) {
                // Fit the map to show both user location and search result
                const coordinates = [
                  atlas.userLocation,
                  atlas.searchResult.coords
                ];
                atlas.mapRef.current?.fitToCoordinates(coordinates, {
                  edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
                  animated: true,
                });
                hasCenteredSearchRoute.current = true;
                
                // Set estimated time for the route
                if (result.duration) {
                  atlas.setEstimatedTime(result.duration);
                }
              }
            }}
          />
        )}

        {atlas.userLocation && (
          <Marker
            coordinate={atlas.userLocation}
            anchor={{ x: 0.5, y: 0.5 }}
            flat={true}
            rotation={atlas.arrowHeading}
            tracksViewChanges={true}
            zIndex={999}
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
                    source={{ uri: friend.profilePicture || 'https://static.vecteezy.com/system/resources/thumbnails/024/983/914/small_2x/simple-user-default-icon-free-png.png' }}
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
        </View>
      )}

      {/* Travel Mode Selection and Estimated Time */}
      {(atlas.showDirections || (atlas.searchResult && atlas.userLocation && !atlas.showDirections)) && (
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
                  onPress={() => {
                    atlas.setTravelMode(mode.key);
                    if (!atlas.showDirections && atlas.searchResult) {
                      hasCenteredSearchRoute.current = false;
                    }
                  }}
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
            
            {/* Start Navigation button */}
            {!atlas.showDirections && atlas.searchResult && atlas.userLocation && (
              <TouchableOpacity
                onPress={handleShowRouteFromSearch}
                style={[styles.startNavBtn, { backgroundColor: colors.primary, marginTop: 10 }]}
              >
                <Ionicons name="navigate" size={18} color="#fff" />
                <Text style={[styles.startNavBtnText, { color: '#fff' }]}>Start Navigation</Text>
              </TouchableOpacity>
            )}
          </GlassCard>
        </View>
      )}

      {/* Search Result Card */}
      {atlas.searchResult && !atlas.showDirections && (
        <View style={styles.searchCardContainer}>
          <GlassCard style={[styles.searchResultCard, { backgroundColor: colors.background[1], borderColor: colors.glassBorder }]}>
            {/* Close button for search card */}
            <TouchableOpacity 
              style={styles.closeSearchCard} 
              onPress={() => {
                atlas.setSearchResult(null);
                atlas.clearPersistentMarker();
                atlas.setEstimatedTime(null);
              }}
            >
              <Ionicons name="close-circle" size={28} color={colors.textSecondary} />
            </TouchableOpacity>
            
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
            </View>

            <View style={styles.searchCardButtons}>
              <TouchableOpacity 
                onPress={() => { 
                  atlas.setSelectedJournal({ location: { lat: atlas.searchResult.coords.latitude, lng: atlas.searchResult.coords.longitude } }); 
                  atlas.setShowStreetView(true); 
                }} 
                style={[styles.actionBtn, { backgroundColor: '#4285F4', flex: 0.31 }]}
              >
                <Ionicons name="eye" size={18} color="#fff" />
                <Text style={styles.actionBtnText}>View</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleShowRouteFromSearch}
                style={[styles.actionBtn, { backgroundColor: '#34A853', flex: 0.31 }]}
              >
                <Ionicons name="navigate" size={18} color="#fff" />
                <Text style={styles.actionBtnText}>Go</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => { 
                  atlas.setTempCoords(atlas.searchResult.coords); 
                  atlas.setModalVisible(true); 
                }} 
                style={[styles.actionBtn, { backgroundColor: colors.primary, flex: 0.31 }]}
              >
                <Ionicons name="add" size={18} color="#fff" />
                <Text style={styles.actionBtnText}>Pin</Text>
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