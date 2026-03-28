import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import BrandedHeader from '../../components/BrandedHeader';
import { useTheme } from '../../context/ThemeContext';
import { clearChat, getChatHistory, sendMessageAction } from '../../redux/messageSlice';
import API from '../../services/api';

const Messages = () => {
    const dispatch = useDispatch();
    const { colors, isDark } = useTheme();
    const flatListRef = useRef(null);
    
    // Redux State
    const { activeConversation, loading: messagesLoading } = useSelector((state) => state.messages);
    const { user: currentUser } = useSelector((state) => state.auth); 
    
    // Local State
    const [search, setSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [message, setMessage] = useState('');
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // --- 1. Fetch Users List ---
    const loadUsers = useCallback(async (isRefreshing = false) => {
        if (isRefreshing) setRefreshing(true);
        else setLoadingUsers(true);
        try {
            const response = await API.get('/users/all'); 
            const otherUsers = response.data.filter(u => u._id !== currentUser?._id);
            setUsers(otherUsers);
        } catch (error) {
            console.error("Fetch Users Error:", error.message, error.config?.url);
        } finally {
            setLoadingUsers(false);
            setRefreshing(false);
        }
    }, [currentUser]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    // --- 2. Handle User Selection (Start Chat) ---
    const handleSelectUser = (user) => {
        dispatch(clearChat());
        setSelectedUser(user);
        dispatch(getChatHistory(user._id));
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
        
    
        dispatch(sendMessageAction({
            receiverId: selectedUser._id,
            content: messageText
        }));

        setMessage('');
    };

    // --- RENDER HELPERS ---
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
        <TouchableOpacity 
            style={[styles.chatCard, { borderBottomColor: colors.glassBorder }]} 
            onPress={() => handleSelectUser(item)}
        >
            <View style={styles.avatarContainer}>
                <View style={[styles.avatar, { backgroundColor: colors.glass, justifyContent: 'center', alignItems: 'center' }]}>
                     <Text style={{ color: colors.textMain, fontSize: 18, fontWeight: '700' }}>
                        {item.firstName?.[0]}{item.lastName?.[0]}
                    </Text>
                </View>
                <View style={[styles.onlineBadge, { borderColor: colors.background[0] }]} />
            </View>
            <View style={styles.chatInfo}>
                <View style={styles.chatHeader}>
                    <Text style={[styles.userName, { color: colors.textMain }]}>{item.firstName} {item.lastName}</Text>
                    <Text style={[styles.timeText, { color: colors.textSecondary }]}>@{item.username}</Text>
                </View>
                <View style={styles.messageRow}>
                    <Text numberOfLines={1} style={[styles.lastMessage, { color: colors.textSecondary }]}>
                        Tap to chat with {item.firstName}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    // --- CHAT WINDOW (DETAIL VIEW) ---
    if (selectedUser) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background[0] }}>
                <KeyboardAvoidingView 
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
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
                    <TouchableOpacity style={{ marginRight: 15 }}>
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
                                    <View style={[
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
                                            <Text style={[styles.bubbleTime, { color: isMe ? 'rgba(255,255,255,0.7)' : colors.textSecondary }]}>
                                                {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            }}
                        />
                    )}
                </View>

                {/* Input Area */}
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
                <FlatList
                    data={users.filter(u => `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase()))}
                    keyExtractor={(item) => item._id}
                    renderItem={renderChatItem}
                    contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadUsers(true)} tintColor={colors.primary} />}
                    ListHeaderComponent={
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

                            <ScrollView 
                                horizontal 
                                showsHorizontalScrollIndicator={false} 
                                style={styles.activeUsersScroll} 
                                contentContainerStyle={styles.activeUsersContent}
                            >
                                {users.slice(0, 8).map(renderActiveUser)}
                            </ScrollView>

                            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>RECENT MESSAGES</Text>
                        </>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    headerPadding: { paddingHorizontal: 20, marginBottom: 15 },
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
    lastMessage: { fontSize: 14, flex: 1 },

    fullChatContainer: { flex: 1 }, 
    chatViewHeader: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, paddingTop: Platform.OS === 'ios' ? 40 : 30 },
    headerAvatar: { width: 44, height: 44, borderRadius: 22 },
    
    // THE KEY STYLES FOR ALIGNMENT
    messageContainer: { width: '100%', marginVertical: 4 },
    bubble: { padding: 14, borderRadius: 20, maxWidth: '80%', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 1 },
    bubbleTime: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
    
    inputWrapper: { flexDirection: 'row', alignItems: 'center', padding: 12, borderTopWidth: 1, paddingBottom: Platform.OS === 'ios' ? 20 : 80 },
    chatInput: { flex: 1, maxHeight: 100, borderRadius: 22, paddingHorizontal: 18, marginHorizontal: 10, fontSize: 16, paddingTop: 10, paddingBottom: 10 },
    iconBtn: { padding: 5 },
    sendBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' }
});

export default Messages;