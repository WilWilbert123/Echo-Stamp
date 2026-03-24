import { FlatList, Modal, Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../feed.styles';

const CommentModal = ({ visible, post, colors, isDark, onClose }) => (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: isDark ? '#121212' : '#FFF' }]}>
                <View style={styles.modalHeader}>
                    <View style={styles.modalHandle} />
                    <Text style={[styles.modalTitle, { color: colors.textMain }]}>Reflections</Text>
                </View>
                <FlatList
                    data={post?.comments || []}
                    keyExtractor={(_, index) => index.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.commentRow}>
                            <View style={[styles.commentAvatar, { backgroundColor: colors.primary + '20' }]} />
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: colors.textMain, fontWeight: '600', fontSize: 13 }}>
                                    {post?.userId?.username || 'Explorer'}
                                </Text>
                                <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 2 }}>{item.text}</Text>
                            </View>
                        </View>
                    )}
                />
                <TouchableOpacity style={[styles.modalClose, { backgroundColor: colors.primary }]} onPress={onClose}>
                    <Text style={{ color: '#FFF', fontWeight: '800' }}>CLOSE</Text>
                </TouchableOpacity>
            </View>
        </View>
    </Modal>
);

export default CommentModal;