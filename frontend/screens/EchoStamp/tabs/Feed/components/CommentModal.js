import { Send } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, FlatList, Image, KeyboardAvoidingView, Modal, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addCommentAsync, addReplyAsync, deleteCommentAsync, editCommentAsync, editReplyAsync } from '../../../../../redux/journalSlice';
import { styles } from '../feed.styles';

const CommentModal = ({ visible, post, colors, isDark, onClose }) => {
    const dispatch = useDispatch();
    const currentUser = useSelector(state => state.auth.user);
    const [text, setText] = useState('');
    const [activeEdit, setActiveEdit] = useState(null); // { type: 'comment'|'reply', commentId, replyId }
    const [replyTo, setReplyTo] = useState(null); 

    // Get the most up-to-date version of this post from the Redux store
    const livePost = useSelector(state => 
        state.journals.globalList.find(p => p._id === post?._id) || post
    );

    const handleSubmit = () => {
        if (!text.trim()) return;
        
        if (activeEdit) {
            if (activeEdit.type === 'comment') {
                dispatch(editCommentAsync({ id: post._id, commentId: activeEdit.commentId, text: text.trim() }));
            } else {
                dispatch(editReplyAsync({ id: post._id, commentId: activeEdit.commentId, replyId: activeEdit.replyId, text: text.trim() }));
            }
        } else if (replyTo) {
            dispatch(addReplyAsync({ id: post._id, commentId: replyTo, text: text.trim() }));
        } else {
            dispatch(addCommentAsync({ id: post._id, text: text.trim() }));
        }
        
        setText('');
        setReplyTo(null);
        setActiveEdit(null);
    };

    const handleLongPress = (item, type, commentId = null) => {
        const isMe = item.userId === (currentUser?._id || currentUser?.id);
        if (!isMe) return;

        Alert.alert(
            "Action",
            "Choose what to do with this reflection",
            [
                { text: "Edit", onPress: () => {
                    setText(item.text);
                    setActiveEdit({ 
                        type, 
                        commentId: type === 'comment' ? item._id : commentId, 
                        replyId: type === 'reply' ? item._id : null 
                    });
                }},
                type === 'comment' ? { 
                    text: "Delete", 
                    style: "destructive", 
                    onPress: () => dispatch(deleteCommentAsync({ id: post._id, commentId: item._id })) 
                } : null,
                { text: "Cancel", style: "cancel" }
            ].filter(Boolean)
        );
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
                        data={livePost?.comments || []}
                        keyExtractor={(item) => item._id}
                        renderItem={({ item }) => (
                            <View style={{ marginBottom: 15 }}>
                                <TouchableOpacity 
                                    onLongPress={() => handleLongPress(item, 'comment')}
                                    style={styles.commentRow}>
                                    <View style={[styles.commentAvatar, { backgroundColor: colors.primary + '20', overflow: 'hidden', borderWidth: 1, borderColor: colors.glassBorder }]}>
                                        {(item.userId?.profilePicture || item.profilePicture) ? (
                                            <Image 
                                                source={{ uri: item.userId?.profilePicture || item.profilePicture }} 
                                                style={styles.commentAvatarImage} 
                                            />
                                        ) : (
                                            <Text style={{ color: colors.primary, fontWeight: 'bold', textAlign: 'center', lineHeight: 36 }}>
                                                {(item.userId?.firstName || item.username)?.[0]?.toUpperCase() || 'E'}
                                            </Text>
                                        )}
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ color: colors.textMain, fontWeight: '700', fontSize: 13 }}>
                                            {item.userId?.firstName ? `${item.userId.firstName} ${item.userId.lastName}` : (item.username || 'Explorer')}
                                        </Text>
                                        <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 2 }}>{item.text}</Text>
                                        <TouchableOpacity onPress={() => setReplyTo(item._id)}>
                                            <Text style={{ color: colors.primary, fontSize: 12, marginTop: 5, fontWeight: '600' }}>Reply</Text>
                                        </TouchableOpacity>
                                    </View>
                                </TouchableOpacity>

                                {/* Nested Replies */}
                                {item.replies?.map((reply) => (
                                    <TouchableOpacity 
                                        key={reply._id} 
                                        onLongPress={() => handleLongPress(reply, 'reply', item._id)}
                                        style={[styles.commentRow, { marginLeft: 40, marginTop: 10 }]}>
                                        <View style={[styles.commentAvatar, { width: 26, height: 26, borderRadius: 8, backgroundColor: colors.accent + '20', overflow: 'hidden', borderWidth: 1, borderColor: colors.glassBorder }]}>
                                            {(reply.userId?.profilePicture || reply.profilePicture) ? (
                                                <Image 
                                                    source={{ uri: reply.userId?.profilePicture || reply.profilePicture }} 
                                                    style={{ width: '100%', height: '100%' }} 
                                                />
                                            ) : (
                                                <Text style={{ color: colors.accent, fontWeight: 'bold', textAlign: 'center', lineHeight: 24, fontSize: 10 }}>
                                                    {(reply.userId?.firstName || reply.username)?.[0]?.toUpperCase()}
                                                </Text>
                                            )}
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ color: colors.textMain, fontWeight: '700', fontSize: 12 }}>
                                                {reply.userId?.firstName ? `${reply.userId.firstName} ${reply.userId.lastName}` : reply.username}
                                            </Text>
                                            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{reply.text}</Text>
                                        </View>
                                    </TouchableOpacity>
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
                            placeholder={
                                activeEdit 
                                    ? `Editing ${activeEdit.type}...` 
                                    : (replyTo ? "Write a reply..." : "Add a comment...")
                            }
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