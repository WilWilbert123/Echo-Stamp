import { Send } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Dimensions,
    FlatList,
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addCommentAsync, addReplyAsync, deleteCommentAsync, editCommentAsync, editReplyAsync } from '../../../../../redux/journalSlice';
import { styles } from '../feed.styles';

const { height } = Dimensions.get('window');

const CommentModal = ({ visible, post, colors, isDark, onClose, initialCommentId }) => {
    const dispatch = useDispatch();
    const currentUser = useSelector(state => state.auth.user);
    const [text, setText] = useState('');
    const [activeEdit, setActiveEdit] = useState(null); // { type: 'comment'|'reply', commentId, replyId }
    const [replyTo, setReplyTo] = useState(null);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const flatListRef = useRef(null);

    // Track keyboard height
    useEffect(() => {
        const keyboardWillShow = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (e) => setKeyboardHeight(e.endCoordinates.height)
        );
        const keyboardWillHide = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => setKeyboardHeight(0)
        );

        return () => {
            keyboardWillShow.remove();
            keyboardWillHide.remove();
        };
    }, []);

    // Scroll to bottom when keyboard opens or new content is added
    useEffect(() => {
        if (keyboardHeight > 0 && livePost?.comments?.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [keyboardHeight, livePost?.comments?.length]);

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
        
        // Scroll to bottom after adding comment
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
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
        <Modal 
            visible={visible} 
            animationType="slide" 
            transparent={true}
            onRequestClose={() => {
                Keyboard.dismiss();
                onClose();
            }}
        >
            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.modalKeyboardView}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View style={styles.modalOverlay}>
                        <View style={[
                            styles.modalContent, 
                            { 
                                backgroundColor: isDark ? '#121212' : '#FFF',
                                height: keyboardHeight > 0 ? height * 0.9 : '80%'
                            }
                        ]}>
                            {/* Close button moved to top right */}
                            <View style={styles.modalHeader}>
                                <View style={styles.modalHandle} />
                                <Text style={[styles.modalTitle, { color: colors.textMain }]}>Comments</Text>
                                <TouchableOpacity 
                                    onPress={() => {
                                        Keyboard.dismiss();
                                        onClose();
                                    }}
                                    style={styles.modalCloseButton}
                                >
                                    <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 16 }}>Close</Text>
                                </TouchableOpacity>
                            </View>

                            <FlatList
                                ref={flatListRef}
                                data={livePost?.comments || []}
                                keyExtractor={(item) => item._id}
                                style={styles.commentsList}
                                showsVerticalScrollIndicator={false}
                                keyboardDismissMode="interactive"
                                keyboardShouldPersistTaps="handled"
                                onContentSizeChange={() => {
                                    if (keyboardHeight > 0) {
                                        flatListRef.current?.scrollToEnd({ animated: true });
                                    }
                                }}
                                renderItem={({ item }) => (
                                    <View style={{ 
                                        marginBottom: 15,
                                        backgroundColor: initialCommentId === item._id ? colors.primary + '20' : 'transparent',
                                        borderRadius: 12,
                                        padding: initialCommentId === item._id ? 8 : 0,
                                        borderWidth: initialCommentId === item._id ? 1 : 0,
                                        borderColor: initialCommentId === item._id ? colors.primary : 'transparent'
                                    }}>
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
                                ListFooterComponent={<View style={{ height: 20 }} />}
                            />
                            
                            <View style={[
                                styles.commentInputRow, 
                                { 
                                    borderTopColor: colors.glassBorder,
                                    paddingBottom: Platform.OS === 'ios' ? 10 : 5
                                }
                            ]}>
                                <TextInput
                                    placeholder={
                                        activeEdit 
                                            ? `Editing ${activeEdit.type}...` 
                                            : (replyTo ? "Write a reply..." : "Add a comment...")
                                    }
                                    placeholderTextColor={colors.textSecondary}
                                    style={[
                                        styles.commentInput, 
                                        { 
                                            color: colors.textMain, 
                                            backgroundColor: isDark ? '#1C1C1E' : '#F5F5F5',
                                            flex: 1,
                                            borderRadius: 22,
                                            paddingHorizontal: 15,
                                            paddingVertical: 10,
                                            fontSize: 15
                                        }
                                    ]}
                                    value={text}
                                    onChangeText={setText}
                                    multiline
                                />
                                <TouchableOpacity 
                                    onPress={handleSubmit} 
                                    style={styles.sendButton}
                                >
                                    <Send size={24} color={text.trim() ? colors.primary : colors.textSecondary} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default CommentModal;