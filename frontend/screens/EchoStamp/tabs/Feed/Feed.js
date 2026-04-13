import { useNavigation, useRoute } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import { Plus } from 'lucide-react-native';
import { useCallback } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../../../context/ThemeContext';
import { styles } from '../Feed/feed.styles';
import { useFeed } from '../Feed/hooks/useFeed';

// Components
import CommentModal from '../Feed/components/CommentModal';
import GalleryModal from '../Feed/components/GalleryModal';
import PostItem from '../Feed/components/PostItem';

const Feed = ({ filter }) => {
    const { colors, isDark } = useTheme();
    const route = useRoute();
    const navigation = useNavigation();
    const {
        journals, loading, refreshing, onRefresh, flatListRef,
        galleryModal, setGalleryModal, galleryImages,
        activeGalleryIndex, setActiveGalleryIndex,
        commentModal, setCommentModal, selectedPost,
        openGallery, openComments,
        handleViewableItemsChanged, viewabilityConfig, visibleItems
    } = useFeed(filter);

    const renderItem = useCallback(({ item }) => (
        <PostItem 
            item={item} 
            colors={colors} 
            onOpenGallery={openGallery} 
            onOpenComments={openComments}
            isVisible={visibleItems[item._id] || false}
        />
    ), [colors, openGallery, openComments, visibleItems]);

    return (
        <View style={[styles.flex1, { backgroundColor: colors.background[0] }]}>
            {loading && journals.length === 0 ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={{ color: colors.textSecondary, marginTop: 15, fontWeight: '600' }}>Fetching Echoes...</Text>
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={journals}
                    renderItem={renderItem}
                    keyExtractor={item => item._id || Math.random().toString()}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listPadding}
                    onViewableItemsChanged={handleViewableItemsChanged}
                    viewabilityConfig={viewabilityConfig.current}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <LottieView
                                source={require('../../../../assets/empty_ghost.json')}
                                autoPlay loop style={styles.emptyLottie}
                            />
                            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No Journals found yet.</Text>
                        </View>
                    }
                    onScrollToIndexFailed={(info) => {
                        // Attempt to scroll again if the list hasn't finished rendering layout
                        flatListRef.current?.scrollToOffset({ offset: info.averageItemLength * info.index, animated: true });
                    }}
                />
            )}

            <GalleryModal 
                visible={galleryModal}
                images={galleryImages}
                activeIndex={activeGalleryIndex}
                onClose={() => setGalleryModal(false)}
                onScroll={setActiveGalleryIndex}
            />

            <CommentModal 
                visible={commentModal}
                post={selectedPost}
                colors={colors}
                isDark={isDark}
                onClose={() => setCommentModal(false)}
                initialCommentId={route.params?.commentId}
            />

            {/* Floating Action Button to Create New Echo */}
            <TouchableOpacity 
                style={[styles.fab, { backgroundColor: colors.primary }]}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('Atlas', { mode: 'stamping' })}
            >
                <Plus color="white" size={32} strokeWidth={2.5} />
            </TouchableOpacity>
        </View>
    );
};

export default Feed;