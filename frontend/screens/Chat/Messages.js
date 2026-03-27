import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    RefreshControl,
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
    
    // Select from Redux
    const { activeConversation, loading: messagesLoading } = useSelector((state) => state.messages);
    const { user: currentUser } = useSelector((state) => state.auth); // To identify "Me" vs "Them"
    
    const [search, setSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [message, setMessage] = useState('');
    
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Fetch Users from Backend
    const loadUsers = useCallback(async (isRefreshing = false) => {
        if (isRefreshing) setRefreshing(true);
        else setLoadingUsers(true);
        try {
            const response = await API.get('/users/all'); 
            // Filter out the current user so you don't chat with yourself
            const otherUsers = response.data.filter(u => u._id !== currentUser?._id);
            setUsers(otherUsers);
        } catch (error) {
            console.error("Fetch Users Error:", error);
        } finally {
            setLoadingUsers(false);
            setRefreshing(false);
        }
    }, [currentUser]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    // Fetch Chat History when a user is selected
    useEffect(() => {
        if (selectedUser) {
            dispatch(getChatHistory(selectedUser._id));
        } else {
            dispatch(clearChat());
        }
    }, [selectedUser, dispatch]);

    const handleSendMessage = () => {
        if (message.trim().length === 0) return;
        
        dispatch(sendMessageAction({
            receiverId: selectedUser._id,
            content: message
        }));
        
        setMessage('');
    };

    // --- RENDER FUNCTIONS ---
    const renderActiveUser = (item) => (
        <TouchableOpacity key={item._id} style={styles.activeUserItem} onPress={() => setSelectedUser(item)}>
            <View style={[styles.activeAvatarWrapper, { borderColor: colors.primary }]}>
                <View style={[styles.activeAvatar, { backgroundColor: colors.glass, justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{ color: colors.textMain, fontWeight: 'bold' }}>{item.firstName[0]}</Text>
                </View>
            </View>
            <Text numberOfLines={1} style={[styles.activeUserName, { color: colors.textSecondary }]}>{item.firstName}</Text>
        </TouchableOpacity>
    );

    const renderChatItem = ({ item }) => (
        <TouchableOpacity style={[styles.chatCard, { borderBottomColor: colors.glassBorder }]} onPress={() => setSelectedUser(item)}>
            <View style={styles.avatarContainer}>
                <View style={[styles.avatar, { backgroundColor: colors.glass, justifyContent: 'center', alignItems: 'center' }]}>
                     <Text style={{ color: colors.textMain, fontSize: 18, fontWeight: '700' }}>{item.firstName[0]}{item.lastName[0]}</Text>
                </View>
                <View style={[styles.onlineBadge, { borderColor: colors.background[0] }]} />
            </View>
            <View style={styles.chatInfo}>
                <View style={styles.chatHeader}>
                    <Text style={[styles.userName, { color: colors.textMain }]}>{item.firstName} {item.lastName}</Text>
                    <Text style={[styles.timeText, { color: colors.textSecondary }]}>@{item.username}</Text>
                </View>
                <View style={styles.messageRow}>
                    <Text numberOfLines={1} style={[styles.lastMessage, { color: colors.textSecondary }]}>Start a conversation with {item.firstName}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    // --- CHAT WINDOW VIEW ---
    if (selectedUser) {
        return (
            <View style={[styles.fullChatContainer, { backgroundColor: colors.background[0] }]}>
                {/* Header */}
                <View style={[styles.chatViewHeader, { borderBottomColor: colors.glassBorder }]}>
                    <TouchableOpacity onPress={() => setSelectedUser(null)}>
                        <Ionicons name="chevron-back" size={28} color={colors.textMain} />
                    </TouchableOpacity>
                    <View style={[styles.headerAvatar, { backgroundColor: colors.glass, justifyContent: 'center', alignItems: 'center', marginLeft: 10 }]}>
                         <Text style={{ color: colors.textMain, fontWeight: '700' }}>{selectedUser.firstName[0]}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={[styles.userName, { color: colors.textMain }]}>{selectedUser.firstName} {selectedUser.lastName}</Text>
                        <Text style={{ fontSize: 12, color: '#10B981' }}>Active Now</Text>
                    </View>
                    <TouchableOpacity style={{ marginRight: 15 }}>
                        <Ionicons name="call-outline" size={22} color={colors.textMain} />
                    </TouchableOpacity>
                </View>

                {/* Messages List */}
                {messagesLoading ? (
                    <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />
                ) : (
                    <FlatList
                        data={activeConversation}
                        keyExtractor={(item) => item._id || Math.random().toString()}
                        contentContainerStyle={{ padding: 20 }}
                        renderItem={({ item }) => {
                            // If sender ID matches current user, bubble goes to the right
                            const isMe = item.sender === currentUser?._id; 
                            return (
                                <View style={[
                                    styles.bubble, 
                                    { 
                                        alignSelf: isMe ? 'flex-end' : 'flex-start', 
                                        backgroundColor: isMe ? colors.primary : (isDark ? '#1E293B' : '#F1F5F9'),
                                        borderBottomRightRadius: isMe ? 2 : 18,
                                        borderBottomLeftRadius: isMe ? 18 : 2,
                                    }
                                ]}>
                                    <Text style={{ color: isMe ? '#FFF' : colors.textMain, fontSize: 15 }}>{item.content}</Text>
                                </View>
                            );
                        }}
                    />
                )}

                {/* Input Area */}
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
                    <View style={[styles.inputWrapper, { backgroundColor: colors.background[0], borderTopColor: colors.glassBorder }]}>
                        <TouchableOpacity style={styles.iconBtn}>
                            <Ionicons name="add" size={24} color={colors.primary} />
                        </TouchableOpacity>
                        <TextInput 
                            placeholder="Type a message..." 
                            placeholderTextColor={colors.textSecondary}
                            style={[styles.chatInput, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', color: colors.textMain }]}
                            value={message}
                            onChangeText={setMessage}
                            multiline={false}
                        />
                        <TouchableOpacity style={styles.iconBtn} onPress={handleSendMessage}>
                            <Ionicons name="send" size={24} color={message.length > 0 ? colors.primary : colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </View>
        );
    }

    // --- MAIN MESSAGES LIST VIEW ---
    return (
        <View style={[styles.container, { backgroundColor: colors.background[0] }]}>
            <BrandedHeader colors={colors} isDark={isDark} />
            {loadingUsers ? (
                <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator color={colors.primary} /></View>
            ) : (
                <FlatList
                    data={users.filter(u => (u.firstName + u.lastName + u.username).toLowerCase().includes(search.toLowerCase()))}
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
                                        placeholder="Search people..."
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

                            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>RECENT CHATS</Text>
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
    screenTitle: { fontSize: 28, fontWeight: '900', marginBottom: 15 },
    searchContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, height: 45, borderRadius: 15, borderWidth: 1 },
    searchInput: { flex: 1, marginLeft: 10, fontSize: 15 },
    activeUsersScroll: { marginBottom: 20 },
    activeUsersContent: { paddingHorizontal: 20, gap: 15 },
    activeUserItem: { alignItems: 'center', width: 65 },
    activeAvatarWrapper: { padding: 3, borderWidth: 2, borderRadius: 35, marginBottom: 5 },
    activeAvatar: { width: 56, height: 56, borderRadius: 28 },
    activeUserName: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
    sectionTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginHorizontal: 20, marginBottom: 10 },
    listContent: { paddingBottom: 100 },
    chatCard: { flexDirection: 'row', paddingVertical: 15, marginHorizontal: 20, borderBottomWidth: 1, alignItems: 'center' },
    avatarContainer: { position: 'relative' },
    avatar: { width: 55, height: 55, borderRadius: 27.5 },
    onlineBadge: { position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: '#10B981', borderWidth: 2 },
    chatInfo: { flex: 1, marginLeft: 15 },
    chatHeader: { flexDirection: 'row', justifyContent: 'space-between' },
    userName: { fontSize: 16, fontWeight: '700' },
    timeText: { fontSize: 12 },
    messageRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
    lastMessage: { fontSize: 14, flex: 1 },
    
    fullChatContainer: { flex: 1, paddingTop: Platform.OS === 'ios' ? 50 : 10 },
    chatViewHeader: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1 },
    headerAvatar: { width: 40, height: 40, borderRadius: 20 },
    bubble: { padding: 12, borderRadius: 18, maxWidth: '80%', marginBottom: 10 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', padding: 10, borderTopWidth: 1, paddingBottom: Platform.OS === 'ios' ? 30 : 10 },
    chatInput: { flex: 1, height: 40, borderRadius: 20, paddingHorizontal: 15, marginHorizontal: 10 },
    iconBtn: { padding: 5 }
});

export default Messages;