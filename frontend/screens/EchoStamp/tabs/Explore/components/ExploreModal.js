import { Ionicons } from '@expo/vector-icons';
import { Image, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../Explore.style';

export const ExploreModal = ({ visible, place, onClose, onSave, isSaved, onGoToAtlas, colors, isDark }) => (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
        <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: isDark ? '#0F172A' : '#FFF' }]}>
                <TouchableOpacity onPress={onClose} style={[styles.closeBtnTop, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                    <Ionicons name="close" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <View style={styles.modalHandle} />
                <ScrollView showsVerticalScrollIndicator={false} style={{ width: '100%' }}>
                    <View style={styles.modalHeroContainer}>
                        <Image source={{ uri: place?.image }} style={styles.modalHeroImg} />
                        <TouchableOpacity style={styles.modalBookmarkBtn} onPress={() => onSave(place)}>
                            <Ionicons name={isSaved ? "bookmark" : "bookmark-outline"} size={26} color="white" />
                        </TouchableOpacity>
                    </View>
                    <Text style={[styles.modalTitle, { color: colors.textMain }]}>{place?.name}</Text>
                    <Text style={[styles.modalSub, { color: colors.textSecondary }]}>{place?.address}</Text>
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={onGoToAtlas}>
                        <Ionicons name="map" size={20} color="white" style={{ marginRight: 10 }} />
                        <Text style={styles.actionBtnText}>Go to Atlas</Text>
                    </TouchableOpacity>
                    <View style={{ height: 40 }} />
                </ScrollView>
            </View>
        </View>
    </Modal>
);