import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, FlatList, Image, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { darkMapStyle, getEventImage } from '../utils/Events.utils';

const HostingModal = ({ 
  visible, onClose, form, setForm, onSearch, onPublish, 
  userLocation, mapRef, isPosting, colors, isDark, styles 
}) => {
  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <View style={styles.modalHandle} />
          
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Event</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={28} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={[{}]}
            keyExtractor={() => "form-fields"}
            showsVerticalScrollIndicator={false}
            renderItem={() => (
              <View>
                <Text style={styles.inputLabel}>Event Title</Text>
                <TextInput 
                  placeholder="What's the vibe?"
                  placeholderTextColor={colors.textSecondary}
                  style={styles.input}
                  onChangeText={(val) => setForm(p => ({ ...p, title: val }))}
                  value={form.title}
                />

                <Text style={styles.inputLabel}>Location</Text>
                <View style={styles.searchContainer}>
                  <TextInput 
                    placeholder="Search a place..."
                    placeholderTextColor={colors.textSecondary}
                    style={styles.searchInput}
                    value={form.searchQuery}
                    onChangeText={(val) => setForm(p => ({ ...p, searchQuery: val }))}
                    onSubmitEditing={onSearch}
                  />
                  <TouchableOpacity onPress={onSearch} style={styles.searchIconBtn}>
                    {form.isSearching ? 
                      <ActivityIndicator size="small" color={colors.primary} /> : 
                      <Ionicons name="search" size={20} color={colors.primary} />
                    }
                  </TouchableOpacity>
                </View>

                <View style={styles.miniMapWrapper}>
                  <MapView
                    ref={mapRef}
                    provider={PROVIDER_GOOGLE}
                    style={styles.miniMap}
                    initialRegion={userLocation}
                    customMapStyle={isDark ? darkMapStyle : []}
                    showsUserLocation
                  >
                    {form.selectedPlace && <Marker coordinate={form.selectedPlace.coords} />}
                  </MapView>
                </View>

                {form.selectedPlace && (
                  <View style={styles.previewContainer}>
                    <Image 
                      source={{ uri: getEventImage(form.selectedPlace.coords) }} 
                      style={styles.resultImage} 
                    />
                    <View style={styles.resultOverlay}>
                      <Text style={styles.resultName}>{form.selectedPlace.title}</Text>
                      <Text style={styles.resultSub}>{form.selectedPlace.location}</Text>
                    </View>
                  </View>
                )}
                <View style={{ height: 100 }} /> 
              </View>
            )}
          />

          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={styles.actionBtn} 
              onPress={onPublish}
              disabled={isPosting}
            >
              {isPosting ? 
                <ActivityIndicator color="#FFF" /> : 
                <Text style={styles.actionBtnText}>Publish Meetup</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default HostingModal;