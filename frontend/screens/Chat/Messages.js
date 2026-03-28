import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';
import BrandedHeader from '../../components/BrandedHeader';
import { useTheme } from '../../context/ThemeContext';
import {
    clearChat,
    deleteConversationAction,
    deleteMessageAction,
    editMessageAction,
    getChatHistory,
    getConversationsList,
    initiateCallAction,
    markAsReadAction,
    sendMessageAction
} from '../../redux/messageSlice';
import { fetchAllUsers } from '../../services/api';

const Messages = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const { colors, isDark } = useTheme();
    const flatListRef = useRef(null);
    
    // Redux State
    const { activeConversation, conversations, loading: messagesLoading } = useSelector((state) => state.messages);
    const { user: currentUser } = useSelector((state) => state.auth); 
    
    // Local State
    const [search, setSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [message, setMessage] = useState('');
    const [editingMessage, setEditingMessage] = useState(null);
    const [allUsers, setAllUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // --- 1. Fetch Conversations and Directory ---
    const loadUsers = useCallback(async (isRefreshing = false) => {
        if (isRefreshing) setRefreshing(true);
        else setLoadingUsers(true);
        try {
            await dispatch(getConversationsList()).unwrap();
            const usersRes = await fetchAllUsers();
            setAllUsers(usersRes.data);
        } catch (error) {
            console.error("Fetch Conversations Error:", error);
        } finally {
            setLoadingUsers(false);
            setRefreshing(false);
        }
    }, [dispatch]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    // --- 2. Handle User Selection (Start Chat) ---
    const handleSelectUser = (user) => {
        dispatch(clearChat());
        setSelectedUser(user);
        dispatch(getChatHistory(user._id));
        dispatch(markAsReadAction(user._id)); // Mark as read when opening
    };

    // --- 3. Real-time Polling ---
    useEffect(() => {
        let interval;
        if (selectedUser) {
            interval = setInterval(() => {
                dispatch(getChatHistory(selectedUser._id));
            }, 5000); 
        }
        return () => clearInterval(interval);
    }, [selectedUser, dispatch]);

    // --- 4. Auto-scroll Logic ---
    useEffect(() => {
        if (activeConversation.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 150);
        }
    }, [activeConversation]);

    // --- 5. Send Message Logic ---
    const handleSendMessage = () => {
        if (!selectedUser || message.trim().length === 0) return;
        const messageText = message.trim();

        if (editingMessage) {
            dispatch(editMessageAction({ messageId: editingMessage._id, content: messageText }));
            setEditingMessage(null);
        } else {
            dispatch(sendMessageAction({
                receiverId: selectedUser._id,
                content: messageText
            }));
        }

        setMessage('');
    };

    const handleCall = (user, callType) => {
        if (!user || !user._id) return;
        
        // Use id or _id to ensure compatibility with backend response
        const currentId = currentUser?.id || currentUser?._id;
        const roomId = `room_${Date.now()}_${currentId}`;
        
        // 1. Tell backend to send Push Notification to recipient
        dispatch(initiateCallAction({
            receiverId: user._id,
            roomId: roomId,
            type: callType
        }));

        // 2. Open the call screen locally
        navigation.navigate('VideoCall', { 
            recipient: user,
            roomId: roomId,
            isCaller: true,
            callType: callType
        });
    };

    const handleDeleteConversation = (otherUserId, name) => {
        Alert.alert(
            "Delete Conversation",
            `Are you sure you want to delete your entire chat history with ${name}? This cannot be undone.`,
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    onPress: () => dispatch(deleteConversationAction(otherUserId)),
                    style: "destructive" 
                }
            ]
        );
    };

    const handleLongPressMessage = (item, isMe) => {
        if (!isMe) return;

        Alert.alert(
            "Message Options",
            "Choose an action",
            [
                { text: "Edit", onPress: () => {
                    setEditingMessage(item);
                    setMessage(item.content);
                }},
                { 
                    text: "Delete", 
                    onPress: () => dispatch(deleteMessageAction(item._id)), 
                    style: "destructive" 
                },
                { text: "Cancel", style: "cancel" }
            ]
        );
    };

    // --- RENDER HELPERS ---
    const renderRightActions = (id, name) => (
        <Pressable
            style={styles.deleteAction}
            onPress={() => handleDeleteConversation(id, name)}
        >
            <LinearGradient colors={['#EF4444', '#991B1B']} style={styles.deleteGradient}>
                <Ionicons name="trash-outline" size={24} color="white" />
            </LinearGradient>
        </Pressable>
    );

    const renderActiveUser = (item) => (
        <TouchableOpacity key={item._id} style={styles.activeUserItem} onPress={() => handleSelectUser(item)}>
            <View style={[styles.activeAvatarWrapper, { borderColor: colors.primary }]}>
                <View style={[styles.activeAvatar, { backgroundColor: colors.glass, justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{ color: colors.textMain, fontWeight: 'bold' }}>{item.firstName?.[0] || '?'}</Text>
                </View>
            </View>
            <Text numberOfLines={1} style={[styles.activeUserName, { color: colors.textSecondary }]}>{item.firstName}</Text>
        </TouchableOpacity>
    );

    const renderChatItem = ({ item }) => (
        <Swipeable 
            renderRightActions={() => renderRightActions(item._id, item.user?.firstName || 'User')}
            overshootRight={false}
        >
            <TouchableOpacity 
                style={[styles.chatCard, { borderBottomColor: colors.glassBorder, backgroundColor: colors.background[0] }]} 
                onPress={() => item.user && handleSelectUser(item.user)}
            >
                <View style={styles.avatarContainer}>
                    <View style={[styles.avatar, { backgroundColor: colors.glass, justifyContent: 'center', alignItems: 'center' }]}>
                        <Text style={{ color: colors.textMain, fontSize: 18, fontWeight: '700' }}>
                            {item.user?.firstName?.[0] || '?'}{item.user?.lastName?.[0] || ''}
                        </Text>
                    </View>
                    <View style={[styles.onlineBadge, { borderColor: colors.background[0] }]} />
                </View>
                <View style={styles.chatInfo}>
                    <View style={styles.chatHeader}>
                        <Text style={[styles.userName, { color: colors.textMain, fontWeight: item?.unreadCount > 0 ? '900' : '700' }]}>
                            {item?.user?.firstName || 'User'} {item?.user?.lastName || ''}
                        </Text>
                        <Text style={[styles.timeText, { color: item?.unreadCount > 0 ? colors.primary : colors.textSecondary }]}>
                            {item.lastMessageTime ? new Date(item.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </Text>
                    </View>
                    <View style={styles.messageRow}>
                        <Text numberOfLines={1} style={[styles.lastMessage, { color: item?.unreadCount > 0 ? colors.textMain : colors.textSecondary, fontWeight: item?.unreadCount > 0 ? '600' : '400' }]}>
                            {item?.lastMessage || 'No messages yet'}
                        </Text>
                        {item?.unreadCount > 0 && (
                            <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                                <Text style={styles.unreadText}>{item.unreadCount}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        </Swipeable>
    );

    // --- CHAT WINDOW (DETAIL VIEW) ---
    if (selectedUser) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background[0] }}>
                <KeyboardAvoidingView 
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
                >
                {/* Header */}
                <View style={[styles.chatViewHeader, { borderBottomColor: colors.glassBorder }]}>
                    <TouchableOpacity onPress={() => setSelectedUser(null)}>
                        <Ionicons name="chevron-back" size={28} color={colors.textMain} />
                    </TouchableOpacity>
                    <View style={[styles.headerAvatar, { backgroundColor: colors.glass, justifyContent: 'center', alignItems: 'center', marginLeft: 10 }]}>
                         <Text style={{ color: colors.textMain, fontWeight: '700' }}>{selectedUser.firstName?.[0]}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={[styles.userName, { color: colors.textMain }]}>{selectedUser.firstName} {selectedUser.lastName}</Text>
                        <Text style={{ fontSize: 12, color: '#10B981', fontWeight: '600' }}>Online</Text>
                    </View>
                    <TouchableOpacity 
                        style={{ marginRight: 20 }}
                        onPress={() => handleCall(selectedUser, 'audio')}
                    >
                        <Ionicons name="call-outline" size={24} color={colors.textMain} />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={{ marginRight: 15 }}
                        onPress={() => handleCall(selectedUser, 'video')}
                    >
                        <Ionicons name="videocam-outline" size={24} color={colors.textMain} />
                    </TouchableOpacity>
                </View>

                {/* Messages List Area */}
                <View style={{ flex: 1 }}>
                    {messagesLoading && activeConversation.length === 0 ? (
                        <View style={{ flex: 1, justifyContent: 'center' }}>
                            <ActivityIndicator color={colors.primary} />
                        </View>
                    ) : (
                        <FlatList
                            ref={flatListRef}
                            data={activeConversation}
                            keyExtractor={(item) => item._id}
                            contentContainerStyle={{ paddingHorizontal: 15, paddingVertical: 20 }}
                            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                            renderItem={({ item }) => {
                                // Robust check: convert to string and check multiple possible ID fields
                                const senderId = (item.sender?._id || item.sender?.id || item.sender)?.toString();
                                const currentUserId = (currentUser?._id || currentUser?.id)?.toString();
                                
                                const isMe = senderId && currentUserId && senderId === currentUserId;

                                return (
                                    <TouchableOpacity 
                                        onLongPress={() => handleLongPressMessage(item, isMe)}
                                        delayLongPress={500}
                                        style={[
                                        styles.messageContainer, 
                                        { alignItems: isMe ? 'flex-end' : 'flex-start' }
                                    ]}>
                                        <View style={[
                                            styles.bubble, 
                                            { 
                                                backgroundColor: isMe ? colors.primary : (isDark ? '#334155' : '#E2E8F0'),
                                                borderBottomRightRadius: isMe ? 4 : 20,
                                                borderBottomLeftRadius: isMe ? 20 : 4,
                                            }
                                        ]}>
                                            <Text style={{ color: isMe ? '#FFF' : colors.textMain, fontSize: 15, lineHeight: 20 }}>
                                                {item.content}
                                            </Text>
                                            <View style={{ flexDirection: 'row', alignSelf: 'flex-end', alignItems: 'center' }}>
                                                {item.isEdited && (
                                                    <Text style={{ fontSize: 9, color: isMe ? 'rgba(255,255,255,0.5)' : colors.textSecondary, marginRight: 4 }}>Edited</Text>
                                                )}
                                                <Text style={[styles.bubbleTime, { color: isMe ? 'rgba(255,255,255,0.7)' : colors.textSecondary }]}>
                                                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    )}
                </View>

                {/* Input Area */}
                {editingMessage && (
                    <View style={{ backgroundColor: colors.glass, paddingHorizontal: 15, paddingVertical: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontSize: 12, color: colors.primary, fontWeight: '600' }}>Editing message...</Text>
                        <TouchableOpacity onPress={() => { setEditingMessage(null); setMessage(''); }}>
                            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                )}
                <View style={[styles.inputWrapper, { backgroundColor: colors.background[0], borderTopColor: colors.glassBorder }]}>
                    <TouchableOpacity style={styles.iconBtn}>
                        <Ionicons name="happy-outline" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <TextInput 
                        placeholder="Message..." 
                        placeholderTextColor={colors.textSecondary}
                        style={[styles.chatInput, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9', color: colors.textMain }]}
                        value={message}
                        onChangeText={setMessage}
                        multiline={true}
                        blurOnSubmit={false}
                    />
                    <TouchableOpacity 
                        style={[styles.sendBtn, { backgroundColor: message.trim() ? colors.primary : 'transparent' }]} 
                        onPress={handleSendMessage}
                        disabled={!message.trim()}
                    >
                        <Ionicons 
                            name={message.trim() ? "send" : "arrow-up"} 
                            size={20} 
                            color={message.trim() ? '#FFF' : colors.textSecondary} 
                        />
                    </TouchableOpacity>
                </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }

    // --- MAIN LIST VIEW ---
    return (
        <View style={[styles.container, { backgroundColor: colors.background[0] }]}>
            <BrandedHeader colors={colors} isDark={isDark} />
            {loadingUsers ? (
                <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator color={colors.primary} /></View>
            ) : (
                <>
                    <View style={styles.headerPadding}>
                        <Text style={[styles.screenTitle, { color: colors.textMain }]}>Messages</Text>
                        <View style={[styles.searchContainer, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                            <Ionicons name="search" size={18} color={colors.textSecondary} />
                            <TextInput
                                placeholder="Search contacts..."
                                placeholderTextColor={colors.textSecondary + '80'}
                                style={[styles.searchInput, { color: colors.textMain }]}
                                value={search}
                                onChangeText={setSearch}
                            />
                        </View>
                    </View>

                    <View>
                        <ScrollView 
                            horizontal 
                            showsHorizontalScrollIndicator={false} 
                            style={styles.activeUsersScroll} 
                            contentContainerStyle={styles.activeUsersContent}
                        >
                            {allUsers.map(renderActiveUser)}
                        </ScrollView>
                    </View>

                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>RECENT MESSAGES</Text>

                    <FlatList
                        data={conversations
                            .filter(c => {
                                const fullName = c?.user ? `${c.user.firstName} ${c.user.lastName}` : '';
                                return fullName.toLowerCase().includes(search.toLowerCase());
                            })
                            .sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime))
                        }
                        keyExtractor={(item) => item._id}
                        renderItem={renderChatItem}
                        contentContainerStyle={styles.listContent}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadUsers(true)} tintColor={colors.primary} />}
                    />
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    headerPadding: { paddingHorizontal: 20, marginBottom: 15,paddingTop: Platform.OS === 'ios' ? 40 : 40},
    screenTitle: { fontSize: 32, fontWeight: '900', marginBottom: 15 },
    searchContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, height: 48, borderRadius: 24, borderWidth: 1 },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },
    activeUsersScroll: { marginBottom: 20 },
    activeUsersContent: { paddingHorizontal: 20, gap: 15 },
    activeUserItem: { alignItems: 'center', width: 70 },
    activeAvatarWrapper: { padding: 3, borderWidth: 2, borderRadius: 35, marginBottom: 5 },
    activeAvatar: { width: 56, height: 56, borderRadius: 28 },
    activeUserName: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
    sectionTitle: { fontSize: 12, fontWeight: '800', letterSpacing: 1.5, marginHorizontal: 20, marginBottom: 10 },
    listContent: { paddingBottom: 100 },
    chatCard: { flexDirection: 'row', paddingVertical: 15, marginHorizontal: 20, borderBottomWidth: 0.5, alignItems: 'center' },
    avatarContainer: { position: 'relative' },
    avatar: { width: 60, height: 60, borderRadius: 30 },
    onlineBadge: { position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: '#10B981', borderWidth: 2 },
    chatInfo: { flex: 1, marginLeft: 15 },
    chatHeader: { flexDirection: 'row', justifyContent: 'space-between' },
    userName: { fontSize: 17, fontWeight: '700' },
    timeText: { fontSize: 12 },
    messageRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
    unreadBadge: { minWidth: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6 },
    unreadText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
    lastMessage: { fontSize: 14, flex: 1 },

    fullChatContainer: { flex: 1 }, 
    chatViewHeader: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, paddingTop: Platform.OS === 'ios' ? 40 : 50 },
    headerAvatar: { width: 44, height: 44, borderRadius: 22 },
    
    // THE KEY STYLES FOR ALIGNMENT
    messageContainer: { width: '100%', marginVertical: 4 },
    bubble: { padding: 14, borderRadius: 20, maxWidth: '80%', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 1 },
    bubbleTime: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
    
    inputWrapper: { flexDirection: 'row', alignItems: 'center', padding: 12, borderTopWidth: 1, paddingBottom: Platform.OS === 'ios' ? 20 : 80 },
    chatInput: { flex: 1, maxHeight: 100, borderRadius: 22, paddingHorizontal: 18, marginHorizontal: 10, fontSize: 16, paddingTop: 10, paddingBottom: 10 },
    iconBtn: { padding: 5 },
    sendBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    deleteAction: { width: 90, height: '100%' },
    deleteGradient: { flex: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 20, marginVertical: 8, marginLeft: 10, marginRight: 20 },
});

export default Messages;