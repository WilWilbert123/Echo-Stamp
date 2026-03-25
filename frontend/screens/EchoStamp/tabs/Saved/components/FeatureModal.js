import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';

const FeatureModal = ({ visible, featureName, onClose, styles, colors }) => (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
        <Pressable style={styles.modalOverlay} onPress={onClose}>
            <View style={styles.modalContent}>
                <View style={styles.modalIconBox}>
                    <Ionicons name="flash" size={32} color={colors.primary} />
                </View>
                <Text style={styles.modalTitle}>{featureName}</Text>
                <Text style={styles.modalSub}>
                    This library feature is currently being synced. Access will be available in the next update.
                </Text>
                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                    <Text style={styles.closeBtnText}>Understood</Text>
                </TouchableOpacity>
            </View>
        </Pressable>
    </Modal>
);

export default FeatureModal;