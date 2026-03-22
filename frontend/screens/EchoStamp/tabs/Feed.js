import { useNavigation } from '@react-navigation/native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Eye, Heart, MapPin, MessageCircle, MoreHorizontal, Play, Share2, X } from 'lucide-react-native';
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

// --- VIDEO CHECK LOGIC ---
const checkIsVideo = (uri) => {
    if (!uri || typeof uri !== 'string') return false;
    const url = uri.toLowerCase();
    return (
        url.includes('/video/upload/') || 
        url.endsWith('.mp4') || 
        url.endsWith('.mov') || 
        url.endsWith('.m4v')
    );
};

// --- RELATIVE TIME HELPER ---
const getRelativeTime = (date) => {
    try {
        const now = new Date();
        const past = new Date(date);
        const diffInSeconds = Math.floor((now - past) / 1000);
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return past.toLocaleDateString();
    } catch (e) {
        return 'Recently';
    }
};

// --- VIDEO ITEM FOR GALLERY ---
const GalleryVideoItem = ({ uri, isVisible }) => {
    const player = useVideoPlayer(uri, (player) => {
        player.loop = true;
        if (isVisible) player.play();
    });

    useEffect(() => {
        if (isVisible) {
            player.play();
        } else {
            player.pause();
        }
    }, [isVisible, player]);

    return (
        <VideoView
            style={styles.fullImg} 
            player={player}
            nativeControls
            contentFit="contain"
        />
    );
};

// --- POST ITEM ---
const PostItem = memo(({ item, colors, isDark, onOpenGallery, onOpenComments }) => {
    const navigation = useNavigation();
    const [isLiked, setIsLiked] = useState(false);
    console.log("Post Media Array:", item.media);
    // FIX: Use the user data attached to the journal entry (item.user), 
    // not the global logged-in user.
    const author = item.userId;
    
    const mediaCount = item.media?.length || 0;
    const isMainVid = checkIsVideo(item.media?.[0]);

    const handleShare = async () => {
        try {
            await Share.share({ message: `Check out this Echo: ${item.title}` });
        } catch (error) { console.log(error); }
    };

    const handleViewEcho = () => {
        navigation.navigate('Atlas', {
            zoomTo: {
                latitude: item.location.lat,
                longitude: item.location.lng,
                journalId: item._id
            }
        });
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
                        {author?.username ? author.username.charAt(0).toUpperCase() : 'U'}
                    </Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.userName, { color: colors.textMain }]}>{author?.username || 'Explorer'}</Text>
                    <View style={styles.locationRow}>
                        <MapPin size={10} color={colors.primary} style={{ marginTop: 2 }} />
                        <Text style={[styles.timeText, { color: colors.textSecondary }]}>
                            {item.location?.address || 'Deep Wilderness'} • {getRelativeTime(item.createdAt)}
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

            {/* Smart Media Grid */}
            {mediaCount > 0 && (
                <TouchableOpacity 
                    activeOpacity={0.9} 
                    style={styles.imageGrid} 
                    onPress={() => onOpenGallery(item.media)}
                >
                    <View style={styles.gridImageMain}>
                        <Image source={{ uri: item.media[0] }} style={StyleSheet.absoluteFill} />
                        {isMainVid && (
                            <View style={styles.overlay}>
                                <Play size={32} color="white" fill="white" />
                            </View>
                        )}
                    </View>
                    
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

            {/* Action Bar */}
            <View style={styles.interactionBar}>
                <View style={styles.stats}>
                    <TouchableOpacity style={styles.statItem} onPress={() => setIsLiked(!isLiked)}>
                        <Heart size={20} color={isLiked ? '#FF4B4B' : colors.textSecondary} fill={isLiked ? '#FF4B4B' : 'transparent'} />
                        <Text style={[styles.statText, { color: colors.textSecondary }]}>{(item.likes?.length || 0) + (isLiked ? 1 : 0)}</Text>
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
                    onPress={handleViewEcho}
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
    
    // Select the journal list from Redux
    const { list: journals, loading } = useSelector((state) => state.journals);
    const user = useSelector((state) => state.auth?.user);

    const [refreshing, setRefreshing] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [commentModal, setCommentModal] = useState(false);
    const [galleryModal, setGalleryModal] = useState(false);
    const [galleryImages, setGalleryImages] = useState([]);
    const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  
    
    const loadData = useCallback(() => {
        dispatch(getJournalsAsync());  
    }, [dispatch]);

    useEffect(() => { 
        loadData(); 
    }, [loadData, filter]);
    
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    }, [loadData]);

    const openGallery = useCallback((media) => {
        setGalleryImages(media);
        setActiveGalleryIndex(0);
        setGalleryModal(true);
    }, []);

    const renderItem = useCallback(({ item }) => (
        <PostItem 
            item={item} 
            colors={colors} 
            isDark={isDark} 
            onOpenGallery={openGallery} 
            onOpenComments={(post) => {
                setSelectedPost(post);
                setCommentModal(true);
            }} 
        />
    ), [colors, isDark, openGallery]);

    return (
        <View style={[styles.flex1, { backgroundColor: colors.background[0] }]}>
            {loading && journals.length === 0 ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={{ color: colors.textSecondary, marginTop: 15, fontWeight: '600' }}>Fetching Echoes...</Text>
                </View>
            ) : (
                <FlatList
                    data={journals}
                    renderItem={renderItem}
                    keyExtractor={item => item._id || Math.random().toString()}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listPadding}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                    }
                />
            )}

            {/* GALLERY MODAL */}
            <Modal visible={galleryModal} transparent animationType="fade" statusBarTranslucent>
                <View style={styles.blackBg}>
                    <TouchableOpacity style={styles.closeGallery} onPress={() => setGalleryModal(false)}>
                        <X color="white" size={28} />
                    </TouchableOpacity>
                    
                    <FlatList
                        data={galleryImages}
                        horizontal
                        pagingEnabled
                        onScroll={(e) => setActiveGalleryIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
                        keyExtractor={(_, index) => index.toString()}
                        renderItem={({ item, index }) => (
                            <View style={styles.gallerySlide}>
                                {checkIsVideo(item) ? (
                                    <GalleryVideoItem uri={item} isVisible={galleryModal && activeGalleryIndex === index} />
                                ) : (
                                    <Image source={{ uri: item }} style={styles.fullImg} resizeMode="contain" />
                                )}
                            </View>
                        )}
                        showsHorizontalScrollIndicator={false}
                    />
                </View>
            </Modal>

            {/* COMMENT MODAL */}
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
                                        <Text style={{ color: colors.textMain, fontWeight: '600', fontSize: 13 }}>
                                           {author?.username || 'Explorer'}
                                        </Text>
                                        <Text style={{ color: colors.textSecondary, fontSize: 14, marginTop: 2 }}>{item.text}</Text>
                                    </View>
                                </View>
                            )}
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
    card: { marginHorizontal: 16, borderRadius: 28, padding: 16, marginBottom: 20, borderWidth: 1, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 12 }, android: {} }) },
    userInfo: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 15 },
    locationRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 2, paddingRight: 10 },
    avatar: { width: 42, height: 42, borderRadius: 12, marginRight: 12, justifyContent: 'center', alignItems: 'center' },
    avatarLetter: { fontWeight: '800', fontSize: 16 },
    userName: { fontWeight: '800', fontSize: 15, letterSpacing: -0.3 },
    timeText: { fontSize: 11, marginLeft: 4, fontWeight: '500', flex: 1, lineHeight: 14 },
    contentArea: { marginBottom: 15 },
    postTitle: { fontWeight: '900', fontSize: 20, marginBottom: 8, letterSpacing: -0.6 },
    postContent: { fontSize: 14, lineHeight: 22, opacity: 0.9 },
    imageGrid: { flexDirection: 'row', height: 240, gap: 10, borderRadius: 24, overflow: 'hidden', marginTop: 5 },
    gridImageMain: { flex: 2, height: '100%', backgroundColor: '#222', position: 'relative', overflow: 'hidden' },
    sideImages: { flex: 1, gap: 10, height: '100%' },
    sideImg: { flex: 1, width: '100%', height: '100%', backgroundColor: '#222', borderRadius: 0 },
    sideImgContainer: { flex: 1, position: 'relative', height: '100%', overflow: 'hidden' },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
    overlayText: { color: '#fff', fontSize: 20, fontWeight: '900' },
    interactionBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(128,128,128,0.08)' },
    stats: { flexDirection: 'row', gap: 18, alignItems: 'center' },
    statItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    statText: { fontSize: 14, fontWeight: '700' },
    reactBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 18 },
    reactBtnText: { color: '#FFF', fontWeight: '900', fontSize: 13 },
    blackBg: { flex: 1, backgroundColor: '#000' },
    gallerySlide: { width: width, height: height, justifyContent: 'center', alignItems: 'center' },
    fullImg: { width: width, height: height * 0.8 },
    closeGallery: { position: 'absolute', top: 60, right: 25, zIndex: 20, backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 25 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 24, height: '75%' },
    modalHeader: { alignItems: 'center', marginBottom: 25 },
    modalHandle: { width: 50, height: 5, borderRadius: 3, backgroundColor: 'rgba(128,128,128,0.3)', marginBottom: 15 },
    modalTitle: { fontSize: 22, fontWeight: '900' },
    commentRow: { flexDirection: 'row', gap: 15, paddingVertical: 18 },
    commentAvatar: { width: 36, height: 36, borderRadius: 12 },
    modalClose: { marginVertical: 20, paddingVertical: 18, borderRadius: 20, alignItems: 'center' }
});