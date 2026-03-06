import { Eye, Heart, MapPin, MessageCircle, MoreHorizontal, Share2, X } from 'lucide-react-native';
import React, { memo, useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    Modal,
    Platform,
    RefreshControl,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context/ThemeContext';
import { getJournalsAsync } from '../../../redux/journalSlice';

const { width, height } = Dimensions.get('window');

// Helper for "Real World" Relative Time
const getRelativeTime = (date) => {
    const now = new Date();
    const then = new Date(date);
    const diff = Math.floor((now - then) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return then.toLocaleDateString();
};

const PostItem = memo(({ item, user, colors, isDark, onOpenGallery, onOpenComments }) => {
    const [isLiked, setIsLiked] = useState(false);
    const mediaCount = item.media?.length || 0;

    const handleShare = async () => {
        try {
            await Share.share({ message: `Check out this Echo: ${item.title}` });
        } catch (error) { console.log(error); }
    };

    return (
        <View style={[
            styles.card, 
            { 
                backgroundColor: colors.glass, 
                borderColor: colors.glassBorder,
            }
        ]}>
            {/* User Header */}
            <View style={styles.userInfo}>
                <View style={[styles.avatar, { backgroundColor: colors.primary + '30', borderWidth: 1, borderColor: colors.primary }]}>
                    <Text style={[styles.avatarLetter, { color: colors.primary }]}>
                        {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                    </Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.userName, { color: colors.textMain }]}>{user?.username || 'Explorer'}</Text>
                    <View style={styles.locationRow}>
                        <MapPin size={10} color={colors.primary} />
                        <Text style={[styles.timeText, { color: colors.textSecondary }]} numberOfLines={1}>
                            {item.location?.address || 'Deep Wilderness'} • {getRelativeTime(item.createdAt || new Date())}
                        </Text>
                    </View>
                </View>
                <TouchableOpacity onPress={() => alert('Options')}>
                    <MoreHorizontal size={20} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>

            {/* Content */}
            <TouchableOpacity activeOpacity={0.7} onPress={() => onOpenComments(item)} style={styles.contentArea}>
                <Text style={[styles.postTitle, { color: colors.textMain }]}>{item.title}</Text>
                <Text style={[styles.postContent, { color: colors.textSecondary }]} numberOfLines={3}>
                    {item.description}
                </Text>
            </TouchableOpacity>

            {/* Smart Media Grid - Enhanced Visuals */}
            {mediaCount > 0 && (
                <TouchableOpacity 
                    activeOpacity={0.9} 
                    style={styles.imageGrid} 
                    onPress={() => onOpenGallery(item.media)}
                >
                    <Image source={{ uri: item.media[0] }} style={styles.gridImageMain} />
                    {mediaCount > 1 && (
                        <View style={styles.sideImages}>
                            <Image source={{ uri: item.media[1] }} style={styles.sideImg} />
                            {mediaCount > 2 ? (
                                <View style={styles.sideImgContainer}>
                                    <Image source={{ uri: item.media[2] }} style={styles.sideImg} />
                                    {mediaCount > 3 && (
                                        <View style={styles.overlay}>
                                            <Text style={styles.overlayText}>+{mediaCount - 2}</Text>
                                        </View>
                                    )}
                                </View>
                            ) : null}
                        </View>
                    )}
                </TouchableOpacity>
            )}

            {/* Enhanced Action Bar */}
            <View style={styles.interactionBar}>
                <View style={styles.stats}>
                    <TouchableOpacity style={styles.statItem} onPress={() => setIsLiked(!isLiked)}>
                        <Heart size={20} color={isLiked ? '#FF4B4B' : colors.textSecondary} fill={isLiked ? '#FF4B4B' : 'transparent'} />
                        <Text style={[styles.statText, { color: colors.textSecondary }]}>{item.likes?.length + (isLiked ? 1 : 0) || 0}</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.statItem} onPress={() => onOpenComments(item)}>
                        <MessageCircle size={20} color={colors.textSecondary} />
                        <Text style={[styles.statText, { color: colors.textSecondary }]}>{item.comments?.length || 0}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.statItem} onPress={handleShare}>
                        <Share2 size={18} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>
                
                <TouchableOpacity 
                    style={[styles.reactBtn, { backgroundColor: colors.primary }]} 
                    onPress={() => onOpenComments(item)}
                >
                    <Eye size={14} color="#FFF" style={{ marginRight: 6 }} />
                    <Text style={styles.reactBtnText}>View Echo</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
});

const Feed = ({ filter }) => {
    const { colors, isDark } = useTheme(); 
    const dispatch = useDispatch();
    const { list: journals, loading } = useSelector((state) => state.journals);
    const user = useSelector((state) => state.auth?.user);

    const [refreshing, setRefreshing] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [commentModal, setCommentModal] = useState(false);
    const [galleryModal, setGalleryModal] = useState(false);
    const [galleryImages, setGalleryImages] = useState([]);

    useEffect(() => { 
        if (user?.id) loadData(); 
    }, [user?.id, filter]);

    const loadData = () => dispatch(getJournalsAsync(user.id));
    
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    }, []);

    const openGallery = useCallback((media) => {
        setGalleryImages(media);
        setGalleryModal(true);
    }, []);

    const openComments = useCallback((post) => {
        setSelectedPost(post);
        setCommentModal(true);
    }, []);

    const renderItem = useCallback(({ item }) => (
        <PostItem 
            item={item} 
            user={user} 
            colors={colors} 
            isDark={isDark} 
            onOpenGallery={openGallery} 
            onOpenComments={openComments} 
        />
    ), [user, colors, isDark]);

    return (
        <View style={[styles.flex1, { backgroundColor: colors.background[0] }]}>
            {loading && journals.length === 0 ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={{ color: colors.textSecondary, marginTop: 15, fontWeight: '600' }}>Fetching your adventures...</Text>
                </View>
            ) : (
                <FlatList
                    data={journals}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listPadding}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Image 
                                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/7486/7486744.png' }} 
                                style={{ width: 100, height: 100, opacity: 0.2, marginBottom: 20 }} 
                            />
                            <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>No journals found yet.{"\n"}The world is waiting for your story!</Text>
                        </View>
                    }
                />
            )}

            {/* --- GALLERY MODAL (FULL SCREEN) --- */}
            <Modal visible={galleryModal} transparent animationType="fade" statusBarTranslucent>
                <View style={styles.blackBg}>
                    <TouchableOpacity style={styles.closeGallery} onPress={() => setGalleryModal(false)}>
                        <X color="white" size={28} />
                    </TouchableOpacity>
                    <FlatList
                        data={galleryImages}
                        horizontal
                        pagingEnabled
                        keyExtractor={(_, index) => index.toString()}
                        renderItem={({ item }) => (
                            <Image source={{ uri: item }} style={styles.fullImg} resizeMode="contain" />
                        )}
                    />
                </View>
            </Modal>

            {/* --- COMMENT MODAL (BOTTOM SHEET STYLE) --- */}
            <Modal visible={commentModal} transparent animationType="slide" onRequestClose={() => setCommentModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: isDark ? '#121212' : '#FFF' }]}>
                        <View style={styles.modalHeader}>
                            <View style={styles.modalHandle} />
                            <Text style={[styles.modalTitle, { color: colors.textMain }]}>Reflections</Text>
                        </View>
                        
                        <FlatList
                            data={selectedPost?.comments || []}
                            keyExtractor={(_, index) => index.toString()}
                            renderItem={({ item }) => (
                                <View style={styles.commentRow}>
                                    <View style={[styles.commentAvatar, { backgroundColor: colors.primary + '20' }]} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ color: colors.textMain, fontWeight: '600', fontSize: 13 }}>User</Text>
                                        <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 2 }}>{item.text}</Text>
                                    </View>
                                </View>
                            )}
                            ListEmptyComponent={
                                <View style={styles.emptyCommentState}>
                                    <MessageCircle size={40} color={colors.textSecondary} style={{ opacity: 0.3, marginBottom: 10 }} />
                                    <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No responses yet. Start the conversation!</Text>
                                </View>
                            }
                        />
                        <TouchableOpacity style={[styles.modalClose, { backgroundColor: colors.primary }]} onPress={() => setCommentModal(false)}>
                            <Text style={{ color: '#FFF', fontWeight: '800' }}>CLOSE</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default Feed;

const styles = StyleSheet.create({
    flex1: { flex: 1 },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listPadding: { paddingVertical: 15, paddingBottom: 100 },
    card: { 
        marginHorizontal: 16, 
        borderRadius: 28, 
        padding: 16, 
        marginBottom: 20, 
        borderWidth: 1,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 12 },
            android: {  }
        })
    },
    userInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2, paddingRight: 20 },
    avatar: { width: 42, height: 42, borderRadius: 12, marginRight: 12, justifyContent: 'center', alignItems: 'center' },
    avatarLetter: { fontWeight: '800', fontSize: 16 },
    userName: { fontWeight: '800', fontSize: 15, letterSpacing: -0.3 },
    timeText: { fontSize: 11, marginLeft: 4, fontWeight: '500' },
    contentArea: { marginBottom: 15 },
    postTitle: { fontWeight: '900', fontSize: 20, marginBottom: 8, letterSpacing: -0.6 },
    postContent: { fontSize: 14, lineHeight: 22, opacity: 0.9 },
    imageGrid: { flexDirection: 'row', height: 220, gap: 10, borderRadius: 24, overflow: 'hidden' },
    gridImageMain: { flex: 2, height: '100%', backgroundColor: '#222' },
    sideImages: { flex: 1, gap: 10 },
    sideImg: { flex: 1, width: '100%', backgroundColor: '#222' },
    sideImgContainer: { flex: 1, position: 'relative' },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
    overlayText: { color: '#fff', fontSize: 20, fontWeight: '900' },
    interactionBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(128,128,128,0.08)' },
    stats: { flexDirection: 'row', gap: 18, alignItems: 'center' },
    statItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    statText: { fontSize: 14, fontWeight: '700' },
    reactBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 18 },
    reactBtnText: { color: '#FFF', fontWeight: '900', fontSize: 13 },
    blackBg: { flex: 1, backgroundColor: '#000', justifyContent: 'center' },
    closeGallery: { position: 'absolute', top: 60, right: 25, zIndex: 20, backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 25 },
    fullImg: { width: width, height: height * 0.8 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 24, height: '75%', shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.2, shadowRadius: 15 },
    modalHeader: { alignItems: 'center', marginBottom: 25 },
    modalHandle: { width: 50, height: 5, borderRadius: 3, backgroundColor: 'rgba(128,128,128,0.3)', marginBottom: 15 },
    modalTitle: { fontSize: 22, fontWeight: '900' },
    commentRow: { flexDirection: 'row', gap: 15, paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: 'rgba(128,128,128,0.05)' },
    commentAvatar: { width: 36, height: 36, borderRadius: 12 },
    emptyCommentState: { alignItems: 'center', marginTop: 60 },
    modalClose: { marginVertical: 20, paddingVertical: 18, borderRadius: 20, alignItems: 'center' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 100 },
    emptyText: { textAlign: 'center', fontSize: 14, lineHeight: 20, opacity: 0.6 }
});