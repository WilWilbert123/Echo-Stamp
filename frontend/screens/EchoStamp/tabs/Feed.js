import { Eye, Heart, MapPin, MessageCircle, Share2, X } from 'lucide-react-native';
import React, { memo, useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    Modal,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../../context/ThemeContext';
import { getJournalsAsync } from '../../../redux/journalSlice';

const { width, height } = Dimensions.get('window');


const PostItem = memo(({ item, user, colors, isDark, onOpenGallery, onOpenComments }) => {
    const mediaCount = item.media?.length || 0;

    return (
        <View style={[
            styles.card, 
            { 
                backgroundColor: colors.glass, 
                borderColor: colors.glassBorder,
                shadowColor: isDark ? '#000' : '#888'
            }
        ]}>
            {/* User Header */}
            <View style={styles.userInfo}>
                <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                    <Text style={[styles.avatarLetter, { color: '#FFF' }]}>
                        {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                    </Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.userName, { color: colors.textMain }]}>{user?.username || 'Anonymous'}</Text>
                    <View style={styles.locationRow}>
                        <MapPin size={10} color={colors.textSecondary} />
                        <Text style={[styles.timeText, { color: colors.textSecondary }]}>
                            {item.location?.address || 'Private Location'}
                        </Text>
                    </View>
                </View>
                <TouchableOpacity>
                    <Text style={{ color: colors.textSecondary, fontSize: 18 }}>•••</Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.contentArea}>
                <Text style={[styles.postTitle, { color: colors.textMain }]}>{item.title}</Text>
                <Text style={[styles.postContent, { color: colors.cardDesc }]} numberOfLines={3}>
                    {item.description}
                </Text>
            </View>

            {/* Smart Media Grid */}
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

            {/* Action Bar */}
            <View style={styles.interactionBar}>
                <View style={styles.stats}>
                    <View style={styles.statItem}>
                        <Heart size={18} color={item.likes?.length > 0 ? '#FF4B4B' : colors.textSecondary} />
                        <Text style={[styles.statText, { color: colors.textSecondary }]}>{item.likes?.length || 0}</Text>
                    </View>
                    <TouchableOpacity style={styles.statItem} onPress={() => onOpenComments(item)}>
                        <MessageCircle size={18} color={colors.textSecondary} />
                        <Text style={[styles.statText, { color: colors.textSecondary }]}>{item.comments?.length || 0}</Text>
                    </TouchableOpacity>
                    <View style={styles.statItem}>
                        <Eye size={18} color={colors.textSecondary} />
                        <Text style={[styles.statText, { color: colors.textSecondary }]}>124</Text>
                    </View>
                </View>
                
                <TouchableOpacity 
                    style={[styles.reactBtn, { backgroundColor: colors.primary }]} 
                    onPress={() => onOpenComments(item)}
                >
                    <Share2 size={14} color="#FFF" style={{ marginRight: 6 }} />
                    <Text style={styles.reactBtnText}>View</Text>
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
        <View style={[styles.flex1, { backgroundColor: colors.background }]}>
            {loading && journals.length === 0 ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={{ color: colors.textSecondary, marginTop: 10 }}>Curating your feed...</Text>
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
                            <Text style={{ color: colors.textSecondary }}>No journals found yet. Start writing!</Text>
                        </View>
                    }
                />
            )}

            {/* --- GALLERY MODAL --- */}
            <Modal visible={galleryModal} transparent animationType="fade">
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

            {/* --- COMMENT MODAL --- */}
            <Modal visible={commentModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: isDark ? '#1A1A1A' : '#FFF' }]}>
                        <View style={styles.modalHeader}>
                            <View style={styles.modalHandle} />
                            <Text style={[styles.modalTitle, { color: colors.textMain }]}>Responses</Text>
                        </View>
                        
                        <FlatList
                            data={selectedPost?.comments || []}
                            keyExtractor={(_, index) => index.toString()}
                            renderItem={({ item }) => (
                                <View style={styles.commentRow}>
                                    <View style={styles.commentAvatar} />
                                    <Text style={{ color: colors.textMain, flex: 1 }}>{item.text}</Text>
                                </View>
                            )}
                            ListEmptyComponent={
                                <Text style={styles.emptyText}>Be the first to comment!</Text>
                            }
                        />
                        <TouchableOpacity style={styles.modalClose} onPress={() => setCommentModal(false)}>
                            <Text style={{ color: colors.primary, fontWeight: '700' }}>DONE</Text>
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
    listPadding: { paddingVertical: 20, paddingBottom: 120 },
    card: { 
        marginHorizontal: 16, 
        borderRadius: 24, 
        padding: 16, 
        marginBottom: 16, 
        borderWidth: 1,
        ...Platform.select({
            ios: { shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 10 },
            android: { elevation: 4 }
        })
    },
    userInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    avatar: { width: 44, height: 44, borderRadius: 14, marginRight: 12, justifyContent: 'center', alignItems: 'center' },
    avatarLetter: { fontWeight: '800', fontSize: 18 },
    userName: { fontWeight: '700', fontSize: 15 },
    timeText: { fontSize: 11, marginLeft: 4 },
    contentArea: { marginBottom: 15 },
    postTitle: { fontWeight: '800', fontSize: 19, marginBottom: 6, letterSpacing: -0.5 },
    postContent: { fontSize: 14, lineHeight: 21, opacity: 0.8 },
    
    // Improved Grid
    imageGrid: { flexDirection: 'row', height: 200, gap: 8, borderRadius: 20, overflow: 'hidden' },
    gridImageMain: { flex: 2, height: '100%', backgroundColor: '#222' },
    sideImages: { flex: 1, gap: 8 },
    sideImg: { flex: 1, width: '100%', backgroundColor: '#222' },
    sideImgContainer: { flex: 1, position: 'relative' },
    
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    overlayText: { color: '#fff', fontSize: 18, fontWeight: '800' },
    
    interactionBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTopWidth: 0.5, borderTopColor: 'rgba(128,128,128,0.1)' },
    stats: { flexDirection: 'row', gap: 15 },
    statItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    statText: { fontSize: 13, fontWeight: '600' },
    reactBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    reactBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
    
    // Modals
    blackBg: { flex: 1, backgroundColor: '#000' },
    closeGallery: { position: 'absolute', top: 50, right: 25, zIndex: 20, backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 20 },
    fullImg: { width: width, height: height },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, height: '80%' },
    modalHeader: { alignItems: 'center', marginBottom: 20 },
    modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#888', marginBottom: 15 },
    modalTitle: { fontSize: 20, fontWeight: '800' },
    commentRow: { flexDirection: 'row', gap: 12, paddingVertical: 15, borderBottomWidth: 0.5, borderBottomColor: 'rgba(128,128,128,0.1)' },
    commentAvatar: { width: 30, height: 30, borderRadius: 10, backgroundColor: '#ccc' },
    modalClose: { padding: 20, alignItems: 'center' },
    emptyText: { textAlign: 'center', marginTop: 50, opacity: 0.5 }
});
