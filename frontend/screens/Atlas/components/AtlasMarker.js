import { Ionicons } from '@expo/vector-icons';
import { Image, View } from 'react-native';
import { Marker } from 'react-native-maps';
import styles from '../Atlas.styles';
import { checkIsVideo } from '../utils/mediaHelpers';

const AtlasMarker = ({ journal, colors, isDark, onPress }) => {
  return (
    <Marker
      coordinate={{ 
        latitude: Number(journal.location.lat), 
        longitude: Number(journal.location.lng) 
      }}
      onPress={onPress}
    >
      <View style={styles.pinWrapper}>
        <View style={[
          styles.pinCircle, 
          { borderColor: colors.primary, backgroundColor: isDark ? '#1a1a1a' : '#fff' }
        ]}>
          {journal.media?.[0] ? (
            checkIsVideo(journal.media[0]) ? (
              <Ionicons name="play" size={18} color={colors.primary} />
            ) : (
              <Image source={{ uri: journal.media[0] }} style={styles.markerImage} />
            )
          ) : (
            <Ionicons name="heart" size={16} color={colors.primary} />
          )}
        </View>
        <View style={[styles.pinTail, { borderTopColor: colors.primary }]} />
      </View>
    </Marker>
  );
};

export default AtlasMarker;