import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator, FlatList,
  Image,
  Modal,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import GlassCard from '../../../components/GlassCard';
import { VideoPlayerWithThumbnail } from '../../../utils/videoThumbnail';
import styles from '../Atlas.styles';
import { checkIsVideo } from '../utils/mediaHelpers';

const VideoPlayerItem = ({ uri, isVisible }) => {
  return (
    <VideoPlayerWithThumbnail
      uri={uri}
      style={styles.fullMedia}
      nativeControls={true}
      contentFit="contain"
      isVisible={isVisible}
      autoPlay={isVisible}
    />
  );
};

export const PinMemoryModal = ({ 
  visible, setVisible, colors, mediaList, setMediaList, 
  pickMedia, title, setTitle, description, setDescription, 
  handleSave, loading 
}) => (
  <Modal visible={visible} transparent animationType="slide">
    <View style={styles.modalOverlay}>
      <GlassCard style={[styles.modalContent, { backgroundColor: colors.background[1], borderColor: colors.glassBorder }]}>
        <Text style={[styles.modalHeader, { color: colors.textMain }]}>Pin a Memory</Text>
        <View style={styles.mediaSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity style={[styles.addMediaBtn, { borderColor: colors.primary }]} onPress={pickMedia}>
              <Ionicons name="add" size={30} color={colors.primary} />
            </TouchableOpacity>
            {mediaList.map((item, i) => (
              <View key={i} style={styles.previewContainer}>
                <Image source={{ uri: item.uri }} style={styles.previewItem} />
                <TouchableOpacity 
                  style={styles.removeBadge} 
                  onPress={() => setMediaList(prev => prev.filter((_, idx) => idx !== i))}
                >
                  <Ionicons name="close-circle" size={22} color="#ff4444" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
        <TextInput 
          style={[styles.input, { color: colors.textMain, borderColor: colors.glassBorder }]} 
          placeholder="Title" 
          value={title} 
          onChangeText={setTitle} 
          placeholderTextColor={colors.textSecondary} 
        />
        <TextInput 
          style={[styles.input, { height: 80, textAlignVertical: 'top', color: colors.textMain, borderColor: colors.glassBorder }]} 
          placeholder="Story..." 
          multiline 
          value={description} 
          onChangeText={setDescription} 
          placeholderTextColor={colors.textSecondary} 
        />
        <View style={styles.buttonRow}>
          <TouchableOpacity onPress={() => setVisible(false)}>
            <Text style={{ color: colors.textSecondary }}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSave} style={[styles.btnSave, { backgroundColor: colors.primary }]}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnSaveText}>Save Pin</Text>}
          </TouchableOpacity>
        </View>
      </GlassCard>
    </View>
  </Modal>
);

export const MediaViewerModal = ({ 
  visible, setVisible, selectedJournal, activeMediaIndex, setActiveMediaIndex, 
  colors, isDark, width, handleDelete, handleRemoveMedia, setShowStreetView, setShowDirections 
}) => {
  const renderMediaItem = ({ item, index }) => {
    const isVid = checkIsVideo(item);
    const isCurrentlyVisible = visible && activeMediaIndex === index;
    return (
      <View style={styles.mediaSlide}>
        {isVid ? (
          <VideoPlayerItem uri={item} isVisible={isCurrentlyVisible} />
        ) : (
          <Image source={{ uri: item }} style={styles.fullMedia} resizeMode="contain" />
        )}
        <TouchableOpacity style={styles.viewerSingleDelete} onPress={() => handleRemoveMedia(item)}>
          <Ionicons name="trash" size={23} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.viewerOverlay}>
        <View style={styles.viewerHeader}>
          <TouchableOpacity onPress={() => setVisible(false)} style={styles.headerCircleBtn}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity onPress={() => { setVisible(false); setShowStreetView(true); }} style={[styles.headerCircleBtn, { backgroundColor: '#4285F4', marginRight: 12 }]}>
              <Ionicons name="eye" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setVisible(false); setShowDirections(true); }} style={[styles.headerCircleBtn, { backgroundColor: '#34A853', marginRight: 12 }]}>
              <Ionicons name="navigate" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(selectedJournal?._id)} style={[styles.headerCircleBtn, { backgroundColor: '#e33030', marginRight: 12 }]}>
              <Ionicons name="trash-outline" size={22} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        {selectedJournal && (
          <View style={{ flex: 1 }}>
            <FlatList
              data={selectedJournal.media || []}
              renderItem={renderMediaItem}
              keyExtractor={(_, index) => index.toString()}
              horizontal pagingEnabled
              onScroll={(e) => setActiveMediaIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
              showsHorizontalScrollIndicator={false}
            />
            <View style={styles.paginationRow}>
              {(selectedJournal.media || []).map((_, i) => (
                <View key={i} style={[styles.dot, { backgroundColor: i === activeMediaIndex ? colors.primary : '#555' }]} />
              ))}
            </View>
            <GlassCard style={[styles.enhancedDetails, { backgroundColor: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255,255,255,0.9)' }]}>
              <Text style={[styles.viewerTitle, { color: isDark ? '#fff' : '#000' }]}>{selectedJournal.title}</Text>
              <Text style={[styles.viewerDescription, { color: isDark ? '#ccc' : '#444' }]}>{selectedJournal.description}</Text>
              <Text style={{ fontSize: 12, color: colors.primary, marginTop: 8 }}>📍 {selectedJournal.location?.address}</Text>
            </GlassCard>
          </View>
        )}
      </View>
    </Modal>
  );
};

export const ShareLocationModal = ({ 
  visible, setVisible, users, selectedIds, toggleSelect, 
  searchQuery, setSearchQuery, colors 
}) => {
  const filteredUsers = users.filter(u => 
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <GlassCard style={[styles.modalContent, { backgroundColor: colors.background[1], borderColor: colors.glassBorder, height: '70%' }]}>
          <TouchableOpacity style={styles.modalCloseIcon} onPress={() => setVisible(false)}>
            <Ionicons name="close" size={26} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={[styles.modalHeader, { color: colors.textMain }]}>Share Location</Text>
          <TextInput
            style={[styles.modalSearchInput, { color: colors.textMain, borderColor: colors.glassBorder, backgroundColor: colors.glass }]}
            placeholder="Search friends..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
          />
          <FlatList
            data={filteredUsers}
            keyExtractor={item => item._id}
            style={styles.userListContainer}
            renderItem={({ item }) => {
              const isSelected = selectedIds.includes(item._id);
              return (
                <TouchableOpacity 
                  style={[styles.userItem, { backgroundColor: isSelected ? colors.primary + '20' : 'transparent', borderColor: isSelected ? colors.primary : colors.glassBorder }]}
                  onPress={() => toggleSelect(item._id)}
                >
                  <Image source={{ uri: item.profilePicture || 'https://via.placeholder.com/100' }} style={styles.userAvatar} />
                  <Text style={{ flex: 1, color: colors.textMain, fontWeight: '600' }}>{item.firstName} {item.lastName}</Text>
                  <Switch
                    value={isSelected}
                    onValueChange={() => toggleSelect(item._id)}
                    trackColor={{ false: colors.glassBorder, true: colors.primary + '80' }}
                    thumbColor={isSelected ? colors.primary : '#f4f3f4'}
                  />
                </TouchableOpacity>
              );
            }}
          />
        </GlassCard>
      </View>
    </Modal>
  );
};