import { Ionicons } from '@expo/vector-icons';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../Explore.style';

export const PlaceCard = ({ item, colors, onSelect, onSave, isSaved }) => (
    <TouchableOpacity
        style={[styles.placeCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
        onPress={onSelect}
    >
        <View style={styles.imgContainer}>
            <Image source={{ uri: item.image }} style={styles.placeImg} />
            <View style={[styles.ratingBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
        </View>
        <View style={styles.placeInfo}>
            <Text style={[styles.placeName, { color: colors.textMain }]} numberOfLines={1}>{item.name}</Text>
            <View style={styles.addressRow}>
                <Ionicons name="location-sharp" size={12} color={colors.textSecondary} />
                <Text style={[styles.placeAddress, { color: colors.textSecondary }]} numberOfLines={1}> {item.address}</Text>
            </View>
        </View>
        <TouchableOpacity onPress={() => onSave(item)} style={{ padding: 10 }}>
            <Ionicons
                name={isSaved ? "bookmark" : "bookmark-outline"}
                size={22}
                color={colors.primary}
            />
        </TouchableOpacity>
    </TouchableOpacity>
);