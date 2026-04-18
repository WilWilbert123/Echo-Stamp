import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, RefreshControl, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../../../context/ThemeContext';
import { getStyles } from './Events.style';
import { useEvents } from './hooks/useEvents';

// Internal Components
import EventCard from './components/EventCard';
import HostingModal from './components/HostingModal';
import ListHeader from './components/ListHeader';

const Events = () => {
  const { colors, isDark } = useTheme();
  const styles = getStyles(colors, isDark);
  
  const { 
    allEvents, refreshing, onRefresh, isHosting, setIsHosting,
    form, setForm, handleManualSearch, handleHostMeetup, 
    handleJoinToggle, handleDeleteEvent,
    userLocation, mapRef, isPosting
  } = useEvents();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background[0] }}>
      <FlatList
        data={allEvents}
        keyExtractor={(item, index) => item._id?.$oid || item._id || `event-${index}`}
        renderItem={({ item }) => (
          <EventCard 
            item={item} 
            onJoin={handleJoinToggle} 
            onDelete={handleDeleteEvent} 
          />
        )}
        ListHeaderComponent={<ListHeader colors={colors} styles={styles} />}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity 
        onPress={() => setIsHosting(true)}
        style={styles.fab}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={32} color="#FFF" />
      </TouchableOpacity>

      <HostingModal 
        visible={isHosting}
        onClose={() => setIsHosting(false)}
        form={form}
        setForm={setForm}
        onSearch={handleManualSearch}
        onPublish={handleHostMeetup}
        userLocation={userLocation}
        mapRef={mapRef}
        isPosting={isPosting}
        colors={colors}
        isDark={isDark}
        styles={styles}
      />
    </View>
  );
};

export default Events;