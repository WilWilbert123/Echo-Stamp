import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import * as MediaLibrary from 'expo-media-library';
import { VideoView, useVideoPlayer } from 'expo-video';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Modal,
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import BrandedHeader from '../../components/BrandedHeader';
import { useTheme } from '../../context/ThemeContext';
import { clearGroupChat, createGroupAction, deleteGroupAction, getGroupHistory, getGroupsList, markGroupReadAction, sendGroupMessageAction, setActiveGroupId } from '../../redux/groupSlice';
import {
    clearChat,
    deleteConversationAction,
    deleteMessageAction,
    editMessageAction,
    getChatHistory,
    getConversationsList,
    markAsReadAction,
    sendMessageAction
} from '../../redux/messageSlice';
import { fetchAllUsers } from '../../services/api';
import { uploadImageToCloudinary } from '../../services/cloudinary';

const MessageVideoPlayer = ({ uri, onDownload }) => {
    const player = useVideoPlayer(uri, (p) => { p.loop = false; });
    return (
        <View>
            <VideoView
                style={{ width: 220, height: 150, borderRadius: 12, marginBottom: 5 }}
                player={player}
                nativeControls={true}
                contentFit="cover"
            />
            <TouchableOpacity
                onPress={() => onDownload(uri)}
                style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 5, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 5 }}
            >
                <Ionicons name="download-outline" size={14} color="white" />
                <Text style={{ color: 'white', fontSize: 10, marginLeft: 4 }}>Save Video</Text>
            </TouchableOpacity>
        </View>
    );
};

const Messages = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const { colors, isDark } = useTheme();
    const flatListRef = useRef(null);
    const prevMsgCount = useRef(0);
    const insets = useSafeAreaInsets();
    const prevChatId = useRef(null);

    // Redux State
    const { activeConversation, conversations, loading: messagesLoading } = useSelector((state) => state.messages);
    const { groups, activeGroupMessages, loading: groupsLoading } = useSelector((state) => state.groups);
    const { user: currentUser } = useSelector((state) => state.auth);

    // Local State
    const [search, setSearch] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [message, setMessage] = useState('');
    const [editingMessage, setEditingMessage] = useState(null);
    const [allUsers, setAllUsers] = useState([]);
    const [recording, setRecording] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [attachedAudio, setAttachedAudio] = useState(null);
    const [playingMessageId, setPlayingMessageId] = useState(null);
    const [playbackTime, setPlaybackTime] = useState(0);
    const [attachedMedia, setAttachedMedia] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
    const [currentImageUri, setCurrentImageUri] = useState(null);

    // Group Creation State
    const [isGroupModalVisible, setIsGroupModalVisible] = useState(false);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [groupName, setGroupName] = useState('');
    const [groupSearch, setGroupSearch] = useState('');
    const [isMembersModalVisible, setIsMembersModalVisible] = useState(false);

    // --- 1. Fetch Conversations and Directory ---
    const loadUsers = useCallback(async (isRefreshing = false) => {
        if (isRefreshing) setRefreshing(true);
        else setLoadingUsers(true);
        try {
            await dispatch(getConversationsList()).unwrap();
            await dispatch(getGroupsList()).unwrap();
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

    // --- Hide Tab Bar when in a Chat ---
    useEffect(() => {
        const parent = navigation.getParent();
        if (selectedUser) {
            // Hide tab bar when a conversation is open
            parent?.setOptions({
                tabBarStyle: { display: 'none' }
            });
        } else {
            // Restore tab bar when back at the list
            parent?.setOptions({
                tabBarStyle: {
                    backgroundColor: isDark ? '#0a1929' : '#fff',
                    borderTopWidth: 0,
                    height: Platform.OS === 'ios' ? 70 : 70,
                    paddingBottom: Platform.OS === 'ios' ? 30 : 10,
                    position: 'absolute',
                    elevation: 0,
                }
            });
        }
    }, [selectedUser, navigation, isDark]);

    // --- 2. Handle User Selection (Start Chat) ---
    const handleSelectUser = (itemOrUser) => {
        dispatch(clearChat());
        dispatch(clearGroupChat());

        // If it's a conversation item from the FlatList
        if (itemOrUser.isGroup || itemOrUser.user) {
            setSelectedUser(itemOrUser);
            if (itemOrUser.isGroup) {
                dispatch(setActiveGroupId(itemOrUser._id));
                dispatch(getGroupHistory(itemOrUser._id));
                dispatch(markGroupReadAction(itemOrUser._id));
            } else {
                dispatch(getChatHistory(itemOrUser.user._id));
                dispatch(markAsReadAction(itemOrUser.user._id));
            }
        } else {
            // It's a raw user object (from search or active users)
            setSelectedUser({ user: itemOrUser });
            dispatch(getChatHistory(itemOrUser._id));
            dispatch(markAsReadAction(itemOrUser._id));
        }
    };

    // --- 3. Real-time Polling ---
    useEffect(() => {
        let interval;
        if (selectedUser) {
            interval = setInterval(() => {
                if (selectedUser.isGroup) {
                    dispatch(getGroupHistory(selectedUser._id));
                    dispatch(markGroupReadAction(selectedUser._id));
                } else if (selectedUser.user?._id) {
                    dispatch(getChatHistory(selectedUser.user._id));
                    dispatch(markAsReadAction(selectedUser.user._id));
                }
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [selectedUser, dispatch]);

    // --- Voice Recording Logic ---
    const onRecordingStatusUpdate = (status) => {
        if (status.isRecording) {
            setRecordingDuration(status.durationMillis);
        }
    };

    const startRecording = async () => {
        try {
            const permission = await Audio.requestPermissionsAsync();
            if (permission.status === 'granted') {
                await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
                const { recording } = await Audio.Recording.createAsync(
                    Audio.RecordingOptionsPresets.HIGH_QUALITY,
                    onRecordingStatusUpdate,
                    1000
                );
                setRecording(recording);
                setIsRecording(true);
                setRecordingDuration(0);
            }
        } catch (err) {
            Alert.alert("Error", "Failed to start recording");
        }
    };

    const stopRecording = async () => {
        setIsRecording(false);
        try {
            const status = await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            setRecording(null);
            setRecordingDuration(0);
            setAttachedAudio({ uri, duration: status.durationMillis });
        } catch (err) {
            Alert.alert("Error", "Failed to save recording");
        }
    };

    const pickMedia = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsMultipleSelection: true,
            quality: 0.7,
        });
        if (!result.canceled) {
            setAttachedMedia([...attachedMedia, ...result.assets]);
        }
    };

    const cancelAttachment = () => {
        setAttachedAudio(null);
        setAttachedMedia([]); // Must be an empty array so .length works
    };

    const formatDuration = (millis) => {
        if (!millis) return "0:00";
        const totalSeconds = millis / 1000;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const playVoice = async (uri, messageId) => {
        try {
            await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
            const { sound } = await Audio.Sound.createAsync(
                { uri },
                { shouldPlay: true }
            );

            setPlayingMessageId(messageId);

            sound.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded) {
                    if (status.isPlaying) {
                        setPlaybackTime(status.durationMillis - status.positionMillis);
                    }
                    if (status.didJustFinish) {
                        setPlayingMessageId(null);
                        setPlaybackTime(0);
                        sound.unloadAsync();
                    }
                }
            });
        } catch (err) {
            Alert.alert("Error", "Could not play audio");
        }
    };

    // --- 4. Auto-scroll Logic ---
    useEffect(() => {
        const chatData = selectedUser?.isGroup ? activeGroupMessages : activeConversation;
        const currentCount = chatData.length;
        const currentChatId = selectedUser?.isGroup ? selectedUser?._id : selectedUser?.user?._id;

        // 1. If we switched to a different conversation, reset the count tracker
        if (prevChatId.current !== currentChatId) {
            prevMsgCount.current = 0;
            prevChatId.current = currentChatId;
        }

        // 2. Only trigger scroll logic if a message was actually added
        if (currentCount > prevMsgCount.current) {
            const lastMsg = chatData[currentCount - 1];
            const isMe = (lastMsg?.sender?._id || lastMsg?.sender) === (currentUser?._id || currentUser?.id);

            // 3. Scroll to end only on first load OR if I sent the new message
            if (prevMsgCount.current === 0 || isMe) {
                setTimeout(() => {
                    flatListRef.current?.scrollToEnd({ animated: true });
                }, 150);
            }
        }
        prevMsgCount.current = currentCount;
    }, [activeConversation.length, activeGroupMessages.length, currentUser, selectedUser]);

    const handleDownload = async (uri) => {
        try {
            const { status } = await MediaLibrary.requestPermissionsAsync(true);
            if (status !== 'granted') {
                Alert.alert("Permission", "Need gallery access to save media.");
                return;
            }

            // Determine extension robustly
            const isVideo = uri.toLowerCase().includes('video') || uri.includes('.mp4');
            const defaultExt = isVideo ? 'mp4' : 'jpg';

            // Extract extension from URL if possible, otherwise use default
            const urlPart = uri.split('?')[0];
            const extMatch = urlPart.match(/\.([a-z0-9]+)$/i);
            const extension = extMatch ? extMatch[1].toLowerCase() : defaultExt;

            const filename = `Echo_${Date.now()}.${extension.length > 4 ? defaultExt : extension}`;
            const fileUri = `${FileSystem.cacheDirectory}${filename}`;

            // Download to temporary cache
            const download = await FileSystem.downloadAsync(uri, fileUri);

            if (download.status === 200) {
                // Save the local file to the phone's gallery
                await MediaLibrary.saveToLibraryAsync(download.uri);
                Alert.alert("Success", "Media saved to gallery!");
            } else {
                throw new Error("Download failed");
            }
        } catch (err) {
            console.error("Save Media Error:", err);
            Alert.alert("Error", "Failed to save media.");
        }
    };

    // --- 5. Send Message Logic ---
    const handleSendMessage = async () => {
        if (!selectedUser || (message.trim().length === 0 && !attachedAudio && attachedMedia.length === 0)) return;
        const messageText = message.trim();

        if (editingMessage) {
            dispatch(editMessageAction({ messageId: editingMessage._id, content: messageText }));
            setEditingMessage(null);
        } else {
            let voiceUrl = null;
            let duration = null;
            let mediaArray = [];

            if (attachedAudio) {
                try {
                    voiceUrl = await uploadImageToCloudinary(attachedAudio.uri);
                    duration = attachedAudio.duration;
                } catch (error) {
                    return Alert.alert("Error", "Failed to upload voice message");
                }
            }

            if (attachedMedia.length > 0) {
                try {
                    mediaArray = await Promise.all(attachedMedia.map(async (file) => {
                        const url = await uploadImageToCloudinary(file.uri);
                        return {
                            url,
                            mediaType: file.type === 'video' ? 'video' : 'image'
                        };
                    }));
                } catch (error) {
                    return Alert.alert("Error", "Failed to upload media");
                }
            }

            const messagePayload = {
                content: (voiceUrl || mediaArray.length > 0)
                    ? (voiceUrl ? "Voice Message" : `${mediaArray.length} Media shared`)
                    : messageText,
                voiceUrl,
                duration,
                media: mediaArray
            };

            const targetId = selectedUser.user?._id || selectedUser._id;
            if (selectedUser.isGroup) {
                dispatch(sendGroupMessageAction({ groupId: targetId, ...messagePayload }));
            } else {
                dispatch(sendMessageAction({
                    receiverId: targetId,
                    ...messagePayload
                }));
            }
        }

        setAttachedAudio(null);
        setAttachedMedia([]);
        setMessage('');
    };

    const handleDeleteConversation = (item) => {
        const isGroup = item.isGroup;
        const name = isGroup ? item.groupName : (item.user?.firstName || 'User');
        const id = item._id;

        // Check if user is admin for groups
        if (isGroup && item.groupAdmin?.toString() !== (currentUser?._id || currentUser?.id)?.toString()) {
            return Alert.alert("Access Denied", "Only the group creator can delete this group.");
        }

        Alert.alert(
            isGroup ? "Delete Group" : "Delete Conversation",
            `Are you sure you want to delete ${isGroup ? 'the group' : 'your chat with'} "${name}"? This cannot be undone.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    onPress: () => {
                        if (isGroup) {
                            dispatch(deleteGroupAction(id));
                        } else {
                            dispatch(deleteConversationAction(id));
                        }
                    },
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
                {
                    text: "Edit", onPress: () => {
                        setEditingMessage(item);
                        setMessage(item.content);
                    }
                },
                {
                    text: "Delete",
                    onPress: () => dispatch(deleteMessageAction(item._id)),
                    style: "destructive"
                },
                { text: "Cancel", style: "cancel" }
            ]
        );
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim()) return Alert.alert("Error", "Please enter a group name");
        if (selectedMembers.length < 2) return Alert.alert("Error", "Select at least 2 members");

        try {
            await dispatch(createGroupAction({
                participants: selectedMembers,
                groupName: groupName.trim()
            })).unwrap();

            setIsGroupModalVisible(false);
            setGroupName('');
            setGroupSearch('');
            setSelectedMembers([]);
            dispatch(getConversationsList());
            Alert.alert("Success", "Group created!");
        } catch (error) {
            Alert.alert("Error", error.message || "Failed to create group");
        }
    };

    // --- RENDER HELPERS ---
    const renderRightActions = (item) => (
        <Pressable
            style={styles.deleteAction}
            onPress={() => handleDeleteConversation(item)}
        >
            <LinearGradient colors={['#EF4444', '#991B1B']} style={styles.deleteGradient}>
                <Ionicons name="trash-outline" size={24} color="white" />
            </LinearGradient>
        </Pressable>
    );

    const renderActiveUser = (item) => {
        const isSelected = selectedMembers.includes(item._id);
        return (
            <TouchableOpacity
                key={item._id}
                style={styles.activeUserItem}
                onPress={() => isGroupModalVisible ? toggleMember(item._id) : handleSelectUser(item)}
            >
                <View style={[styles.activeAvatarWrapper, { borderColor: isSelected ? colors.primary : 'transparent' }]}>
                    <View style={[styles.activeAvatar, { backgroundColor: colors.glass, justifyContent: 'center', alignItems: 'center' }]}>
                        {item.profilePicture ? (
                            <Image source={{ uri: item.profilePicture }} style={styles.activeAvatar} />
                        ) : (
                            <Text style={{ color: colors.textMain, fontWeight: 'bold' }}>{item.firstName?.[0] || '?'}</Text>
                        )}
                    </View>
                    {isSelected && (
                        <View style={{ position: 'absolute', top: -2, right: -2, backgroundColor: colors.primary, borderRadius: 10 }}>
                            <Ionicons name="checkmark-circle" size={18} color="white" />
                        </View>
                    )}
                    <View
                        style={[
                            styles.activeOnlineBadge,
                            {
                                backgroundColor: item.isOnline ? '#10B981' : '#94A3B8',
                                borderColor: colors.background[0]
                            }
                        ]}
                    />
                </View>
                <Text numberOfLines={1} style={[styles.activeUserName, { color: colors.textSecondary }]}>{item.firstName}</Text>
            </TouchableOpacity>
        );
    };

    const toggleMember = (userId) => {
        setSelectedMembers(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const renderChatItem = ({ item }) => (
        <Swipeable
            renderRightActions={() => renderRightActions(item)}
            overshootRight={false}
        >
            <TouchableOpacity
                style={[styles.chatCard, { borderBottomColor: colors.glassBorder, backgroundColor: colors.background[0] }]}
                onPress={() => handleSelectUser(item)}
            >
                <View style={styles.avatarContainer}>
                    <View style={[styles.avatar, { backgroundColor: colors.glass, justifyContent: 'center', alignItems: 'center' }]}>
                        {(!item.isGroup && item.user?.profilePicture) ? (
                            <Image source={{ uri: item.user.profilePicture }} style={styles.avatar} />
                        ) : (
                            <Text style={{ color: colors.textMain, fontSize: 18, fontWeight: '700' }}>
                                {item.isGroup ? (item.groupName?.[0] || 'G') : (item.user?.firstName?.[0] || '?')}
                                {!item.isGroup && item.user?.lastName?.[0] ? item.user.lastName[0] : ''}
                            </Text>
                        )}
                    </View>
                    {!item.isGroup && (
                        <View style={[
                            styles.onlineBadge,
                            {
                                borderColor: colors.background[0],
                                backgroundColor: item.user?.isOnline ? '#10B981' : '#94A3B8'
                            }
                        ]} />
                    )}
                </View>
                <View style={styles.chatInfo}>
                    <View style={styles.chatHeader}>
                        <Text style={[styles.userName, { color: colors.textMain, fontWeight: item?.unreadCount > 0 ? '900' : '700' }]}>
                            {item.isGroup ? (
                                <><Ionicons name="people" size={16} /> {item.groupName}</>
                            ) : (
                                `${item?.user?.firstName || 'User'} ${item?.user?.lastName || ''}`
                            )}
                        </Text>
                        <Text style={[styles.timeText, { color: item?.unreadCount > 0 ? colors.primary : colors.textSecondary }]}>
                            {item.lastMessageTime ? new Date(item.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : ''}
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
        const chatData = selectedUser.isGroup ? activeGroupMessages : activeConversation;
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background[0] }}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    
                keyboardVerticalOffset={0} 
                >
                    {/* Header */}
                    <View style={[styles.chatViewHeader, { borderBottomColor: colors.glassBorder }]}>
                        <TouchableOpacity onPress={() => setSelectedUser(null)}>
                            <Ionicons name="chevron-back" size={28} color={colors.textMain} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                            onPress={() => selectedUser.isGroup && setIsMembersModalVisible(true)}
                            disabled={!selectedUser.isGroup}
                        >
                            {selectedUser.isGroup ? (
                                <View style={[styles.headerAvatar, { backgroundColor: colors.glass, justifyContent: 'center', alignItems: 'center', marginLeft: 10 }]}>
                                    <Ionicons name="people" size={20} color={colors.primary} />
                                </View>
                            ) : (
                                <View style={[styles.headerAvatar, { backgroundColor: colors.glass, justifyContent: 'center', alignItems: 'center', marginLeft: 10, overflow: 'hidden' }]}>
                                    {selectedUser.user?.profilePicture ? (
                                        <Image source={{ uri: selectedUser.user.profilePicture }} style={styles.headerAvatar} />
                                    ) : (
                                        <Text style={{ color: colors.textMain, fontWeight: '700' }}>{selectedUser.user?.firstName?.[0]}</Text>
                                    )}
                                </View>
                            )}
                            <View style={{ flex: 1, marginLeft: 10 }}>
                                <Text style={[styles.userName, { color: colors.textMain }]}>
                                    {selectedUser.isGroup ? selectedUser.groupName : `${selectedUser.user?.firstName} ${selectedUser.user?.lastName}`}
                                </Text>
                                <Text style={{
                                    fontSize: 12,
                                    color: selectedUser.isGroup ? colors.primary : (selectedUser.user?.isOnline ? '#10B981' : '#94A3B8'),
                                    fontWeight: '600'
                                }}>
                                    {selectedUser.isGroup ? 'Group Chat' : (selectedUser.user?.isOnline ? 'Online' : 'Offline')}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Messages List Area */}
                    <View style={{ flex: 1 }}>
                        {(messagesLoading || groupsLoading) && chatData.length === 0 ? (
                            <View style={{ flex: 1, justifyContent: 'center' }}>
                                <ActivityIndicator color={colors.primary} />
                            </View>
                        ) : (
                            <FlatList
                                ref={flatListRef}
                                data={chatData}
                                keyExtractor={(item) => item._id}
                                contentContainerStyle={{ paddingHorizontal: 15, paddingVertical: 20 }}
                                renderItem={({ item }) => {

                                    const senderId = item.sender?._id || item.sender;
                                    const isMe = senderId === (currentUser?._id || currentUser?.id);

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
                                                {item.media && item.media.length > 0 && (
                                                    <View style={{ gap: 5, marginBottom: item.content ? 5 : 0 }}>
                                                        {item.media.map((m, idx) => (
                                                            m.mediaType === 'video' ? (
                                                                <MessageVideoPlayer key={idx} uri={m.url} onDownload={handleDownload} />
                                                            ) : (
                                                                <TouchableOpacity
                                                                    key={idx}
                                                                    onPress={() => { setCurrentImageUri(m.url); setIsImageViewerVisible(true); }}
                                                                    activeOpacity={0.8}
                                                                >
                                                                    <Image
                                                                        source={{ uri: m.url }}
                                                                        style={{ width: 220, height: 150, borderRadius: 12 }}
                                                                        resizeMode="cover"
                                                                    />
                                                                </TouchableOpacity>
                                                            )
                                                        ))}
                                                        {item.content && <View style={{ height: 5 }} />}
                                                    </View>
                                                )}
                                                {item.voiceUrl ? (
                                                    <TouchableOpacity
                                                        onPress={() => playVoice(item.voiceUrl, item._id)}
                                                        style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 5 }}
                                                    >
                                                        <Ionicons name={playingMessageId === item._id ? "pause-circle" : "play-circle"} size={32} color={isMe ? "#FFF" : colors.primary} />
                                                        <View>
                                                            <Text style={{ color: isMe ? '#FFF' : colors.textMain, fontWeight: '600' }}>
                                                                {playingMessageId === item._id ? "Playing..." : "Voice Message"}
                                                            </Text>
                                                            <Text style={{ color: isMe ? 'rgba(255,255,255,0.7)' : colors.textSecondary, fontSize: 11 }}>
                                                                {playingMessageId === item._id ? formatDuration(playbackTime) : formatDuration(item.duration)}
                                                            </Text>
                                                        </View>
                                                    </TouchableOpacity>
                                                ) : (
                                                    <Text style={{ color: isMe ? '#FFF' : colors.textMain, fontSize: 15, lineHeight: 20 }}>
                                                        {item.content}
                                                    </Text>
                                                )}
                                                <View style={{ flexDirection: 'row', alignSelf: 'flex-end', alignItems: 'center' }}>
                                                    {selectedUser.isGroup && !isMe && (
                                                        <Text style={{ fontSize: 9, color: colors.textSecondary, marginRight: 8, fontStyle: 'italic', fontWeight: '600' }}>
                                                            ~ {item.senderName || item.sender?.firstName || 'User'}
                                                        </Text>
                                                    )}
                                                    {item.isEdited && (
                                                        <Text style={{ fontSize: 9, color: isMe ? 'rgba(255,255,255,0.5)' : colors.textSecondary, marginRight: 4 }}>Edited</Text>
                                                    )}
                                                    <Text style={[styles.bubbleTime, { color: isMe ? 'rgba(255,255,255,0.7)' : colors.textSecondary }]}>
                                                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
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
                        {!attachedAudio && attachedMedia.length === 0 && (
                            <TouchableOpacity style={styles.iconBtn} onPress={pickMedia}>
                                <Ionicons name="image-outline" size={24} color={colors.textSecondary} />
                            </TouchableOpacity>
                        )}
                        {!attachedAudio && attachedMedia.length === 0 && (
                            <TouchableOpacity
                                style={styles.iconBtn}
                                onPress={isRecording ? stopRecording : startRecording}
                            >
                                <Ionicons
                                    name={isRecording ? "stop" : "mic-outline"}
                                    size={24}
                                    color={isRecording ? "#EF4444" : colors.textSecondary}
                                />
                            </TouchableOpacity>
                        )}
                        {attachedMedia.length > 0 ? (
                            <View style={[styles.chatInput, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                    <Ionicons name="attach" size={18} color={colors.primary} />
                                    <Text numberOfLines={1} style={{ color: colors.textMain, marginLeft: 8, fontWeight: '600' }}>
                                        {attachedMedia.length} item(s) attached
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={cancelAttachment}>
                                    <Ionicons name="close-circle" size={24} color="#EF4444" />
                                </TouchableOpacity>
                            </View>
                        ) : attachedAudio ? (
                            <View style={[styles.chatInput, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Ionicons name="mic" size={18} color={colors.primary} />
                                    <Text style={{ color: colors.textMain, marginLeft: 8, fontWeight: '600' }}>
                                        Voice ({formatDuration(attachedAudio.duration)})
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={cancelAttachment}>
                                    <Ionicons name="close-circle" size={24} color="#EF4444" />
                                </TouchableOpacity>
                            </View>
                        ) : isRecording ? (
                            <View style={[styles.chatInput, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9', justifyContent: 'center', alignItems: 'flex-start' }]}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Ionicons name="radio-button-on" size={14} color="#EF4444" style={{ marginRight: 6 }} />
                                    <Text style={{ color: '#EF4444', fontWeight: 'bold' }}>
                                        Recording... {formatDuration(recordingDuration)}
                                    </Text>
                                </View>
                            </View>
                        ) : (
                            <TextInput
                                placeholder="Message..."
                                placeholderTextColor={colors.textSecondary}
                                style={[styles.chatInput, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9', color: colors.textMain }]}
                                value={message}
                                onChangeText={setMessage}
                                multiline={true}
                                blurOnSubmit={false}
                            />
                        )}
                        <TouchableOpacity
                            style={[styles.sendBtn, { backgroundColor: (message.trim() || attachedAudio || attachedMedia.length > 0) ? colors.primary : 'transparent' }]}
                            onPress={handleSendMessage}
                            disabled={!message.trim() && !attachedAudio && attachedMedia.length === 0}
                        >
                            <Ionicons
                                name="send"
                                size={20}
                                color={(message.trim() || attachedAudio || attachedMedia.length > 0) ? '#FFF' : colors.textSecondary}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Group Members Modal */}
                    <Modal visible={isMembersModalVisible} animationType="slide" transparent={true}>
                        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                            <View style={{ backgroundColor: colors.background[0], borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, height: '60%' }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                    <View>
                                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.textMain }}>{selectedUser.groupName}</Text>
                                        <Text style={{ fontSize: 14, color: colors.textSecondary }}>{selectedUser.participants?.length || 0} Members</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => setIsMembersModalVisible(false)}>
                                        <Ionicons name="close" size={28} color={colors.textSecondary} />
                                    </TouchableOpacity>
                                </View>

                                <FlatList
                                    data={selectedUser.participants}
                                    keyExtractor={item => item._id}
                                    showsVerticalScrollIndicator={false}
                                    renderItem={({ item }) => (
                                        <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: colors.glassBorder }}>
                                            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.glass, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                                                {item.profilePicture ? (
                                                    <Image source={{ uri: item.profilePicture }} style={{ width: '100%', height: '100%' }} />
                                                ) : (
                                                    <Text style={{ color: colors.textMain, fontWeight: '700' }}>{item.firstName?.[0]}</Text>
                                                )}
                                            </View>
                                            <View style={{ flex: 1, marginLeft: 15 }}>
                                                <Text style={{ color: colors.textMain, fontWeight: '600', fontSize: 16 }}>{item.firstName} {item.lastName}</Text>
                                                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>@{item.username}</Text>
                                            </View>
                                            {selectedUser.groupAdmin === item._id && (
                                                <View style={{ backgroundColor: colors.primary + '20', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                                                    <Text style={{ color: colors.primary, fontSize: 10, fontWeight: 'bold' }}>ADMIN</Text>
                                                </View>
                                            )}
                                        </View>
                                    )}
                                />
                            </View>
                        </View>
                    </Modal>

                    {/* Image Viewer Modal */}
                    <Modal visible={isImageViewerVisible} transparent animationType="fade" onRequestClose={() => setIsImageViewerVisible(false)}>
                        <View style={[styles.imageViewerOverlay, { backgroundColor: 'rgba(0,0,0,0.9)' }]}>
                            <TouchableOpacity style={styles.imageViewerCloseBtn} onPress={() => setIsImageViewerVisible(false)}>
                                <Ionicons name="close-circle" size={40} color="#FFF" />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.imageViewerCloseBtn, { right: 80 }]} onPress={() => handleDownload(currentImageUri)}>
                                <Ionicons name="download-outline" size={40} color="#FFF" />
                            </TouchableOpacity>
                            {currentImageUri && (
                                <Image
                                    source={{ uri: currentImageUri }}
                                    style={styles.imageViewerImage}
                                    resizeMode="contain"
                                />
                            )}
                        </View>
                    </Modal>

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
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                            <Text style={[styles.screenTitle, { color: colors.textMain, marginBottom: 0 }]}>Messages</Text>
                            <TouchableOpacity
                                onPress={() => setIsGroupModalVisible(true)}
                                style={{ backgroundColor: colors.glass, padding: 8, borderRadius: 12, borderWidth: 1, borderColor: colors.glassBorder }}
                            >
                                <Ionicons name="people-outline" size={24} color={colors.primary} />
                            </TouchableOpacity>
                        </View>
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
                        data={[...conversations, ...groups]
                            .filter(c => {
                                const name = c.isGroup ? c.groupName : `${c.user?.firstName} ${c.user?.lastName}`;
                                return name.toLowerCase().includes(search.toLowerCase());
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

            {/* Group Creation Modal */}
            <Modal visible={isGroupModalVisible} animationType="slide" transparent={true}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                    <View style={{ backgroundColor: colors.background[0], borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, height: '80%' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.textMain }}>Create New Group</Text>
                            <TouchableOpacity onPress={() => { setIsGroupModalVisible(false); setGroupSearch(''); }}>
                                <Ionicons name="close" size={28} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            placeholder="Group Name"
                            placeholderTextColor={colors.textSecondary}
                            style={{ backgroundColor: colors.glass, color: colors.textMain, padding: 15, borderRadius: 15, marginBottom: 20 }}
                            value={groupName}
                            onChangeText={setGroupName}
                        />

                        <View style={[styles.searchContainer, { backgroundColor: colors.glass, borderColor: colors.glassBorder, marginBottom: 15, height: 40 }]}>
                            <Ionicons name="search" size={16} color={colors.textSecondary} />
                            <TextInput
                                placeholder="Search users to add..."
                                placeholderTextColor={colors.textSecondary + '80'}
                                style={[styles.searchInput, { color: colors.textMain, fontSize: 14 }]}
                                value={groupSearch}
                                onChangeText={setGroupSearch}
                            />
                        </View>

                        <Text style={{ color: colors.textSecondary, marginBottom: 10, fontWeight: '600' }}>SELECT MEMBERS ({selectedMembers.length})</Text>

                        <FlatList
                            data={allUsers.filter(u =>
                                `${u.firstName} ${u.lastName}`.toLowerCase().includes(groupSearch.toLowerCase()) ||
                                u.username?.toLowerCase().includes(groupSearch.toLowerCase())
                            )}
                            keyExtractor={item => item._id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => toggleMember(item._id)}
                                    style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: colors.glassBorder }}
                                >
                                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.glass, justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ color: colors.textMain }}>{item.firstName[0]}</Text>
                                    </View>
                                    <Text style={{ flex: 1, marginLeft: 15, color: colors.textMain }}>{item.firstName} {item.lastName}</Text>
                                    <Ionicons
                                        name={selectedMembers.includes(item._id) ? "checkbox" : "square-outline"}
                                        size={24}
                                        color={selectedMembers.includes(item._id) ? colors.primary : colors.textSecondary}
                                    />
                                </TouchableOpacity>
                            )}
                        />

                        <TouchableOpacity
                            onPress={handleCreateGroup}
                            style={{ backgroundColor: colors.primary, padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10 }}
                        >
                            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Create Group</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    headerPadding: { paddingHorizontal: 20, marginBottom: 15, paddingTop: Platform.OS === 'ios' ? 40 : 40 },
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
    onlineBadge: { position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, borderWidth: 2 },
    activeOnlineBadge: { position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: 6, borderWidth: 2 },
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

    inputWrapper: { flexDirection: 'row', alignItems: 'center', padding: 12, borderTopWidth: 1, paddingBottom: Platform.OS === 'ios' ? 30 : 75 },
    chatInput: { flex: 1, maxHeight: 100, borderRadius: 22, paddingHorizontal: 18, marginHorizontal: 10, fontSize: 16, paddingTop: 10, paddingBottom: 10 },
    iconBtn: { padding: 5 },
    sendBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    deleteAction: { width: 90, height: '100%' },
    deleteGradient: { flex: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 20, marginVertical: 8, marginLeft: 10, marginRight: 20 },
    imageViewerOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    imageViewerCloseBtn: { position: 'absolute', top: 50, right: 25, zIndex: 100 },
    imageViewerImage: { width: '100%', height: '80%' },

});

export default Messages;