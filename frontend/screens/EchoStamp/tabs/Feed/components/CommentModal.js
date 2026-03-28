import { Send } from 'lucide-react-native';
import React, { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Modal, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { addCommentAsync, addReplyAsync } from '../../../../../redux/journalSlice';
import { styles } from '../feed.styles';

const CommentModal = ({ visible, post, colors, isDark, onClose }) => {
    const dispatch = useDispatch();
    const [text, setText] = useState('');
    const [replyTo, setReplyTo] = useState(null); // Stores commentId if replying

    const handleSubmit = () => {
        if (!text.trim()) return;
        if (replyTo) {
            dispatch(addReplyAsync({ id: post._id, commentId: replyTo, text: text.trim() }));
        } else {
            dispatch(addCommentAsync({ id: post._id, text: text.trim() }));
        }
        setText('');
        setReplyTo(null);
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.modalOverlay}
            >
                <View style={[styles.modalContent, { backgroundColor: isDark ? '#121212' : '#FFF' }]}>
                    <View style={styles.modalHeader}>
                        <View style={styles.modalHandle} />
                        <Text style={[styles.modalTitle, { color: colors.textMain }]}>Comments</Text>
                    </View>
                    <FlatList
                        data={post?.comments || []}
                        keyExtractor={(item) => item._id}
                        renderItem={({ item }) => (
                            <View style={{ marginBottom: 15 }}>
                                <View style={styles.commentRow}>
                                    <View style={[styles.commentAvatar, { backgroundColor: colors.primary + '20' }]} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ color: colors.textMain, fontWeight: '700', fontSize: 13 }}>
                                            {item.username || 'Explorer'}
                                        </Text>
                                        <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 2 }}>{item.text}</Text>
                                        <TouchableOpacity onPress={() => setReplyTo(item._id)}>
                                            <Text style={{ color: colors.primary, fontSize: 12, marginTop: 5, fontWeight: '600' }}>Reply</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                {/* Nested Replies */}
                                {item.replies?.map((reply) => (
                                    <View key={reply._id} style={[styles.commentRow, { marginLeft: 40, marginTop: 10 }]}>
                                        <View style={[styles.commentAvatar, { width: 24, height: 24, backgroundColor: colors.accent + '20' }]} />
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ color: colors.textMain, fontWeight: '700', fontSize: 12 }}>
                                                {reply.username}
                                            </Text>
                                            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{reply.text}</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}
                    />
                    
                    <View style={{ 
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        paddingTop: 15, 
                        borderTopWidth: 1, 
                        borderTopColor: colors.glassBorder 
                    }}>
                        <TextInput
                            placeholder={replyTo ? "Write a reply..." : "Add a comment..."}
                            placeholderTextColor={colors.textSecondary}
                            style={{ flex: 1, color: colors.textMain, paddingVertical: 10, fontSize: 15 }}
                            value={text}
                            onChangeText={setText}
                            multiline
                        />
                        <TouchableOpacity onPress={handleSubmit} style={{ marginLeft: 10 }}>
                            <Send size={24} color={text.trim() ? colors.primary : colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={[styles.modalClose, { backgroundColor: colors.primary }]} onPress={onClose}>
                        <Text style={{ color: '#FFF', fontWeight: '800' }}>CLOSE</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default CommentModal;