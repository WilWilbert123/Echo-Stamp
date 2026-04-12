import { useRoute } from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import React, { useCallback } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from 'react-native';
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
    const {
        journals, loading, refreshing, onRefresh, flatListRef,
        galleryModal, setGalleryModal, galleryImages,
        activeGalleryIndex, setActiveGalleryIndex,
        commentModal, setCommentModal, selectedPost,
        openGallery, openComments
    } = useFeed(filter);

    const renderItem = useCallback(({ item }) => (
        <PostItem 
            item={item} 
            colors={colors} 
            onOpenGallery={openGallery} 
            onOpenComments={openComments} 
        />
    ), [colors, openGallery, openComments]);

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
        </View>
    );
};

export default Feed;