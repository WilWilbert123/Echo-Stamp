import { useRoute } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getGlobalJournalsAsync } from '../../../../../redux/journalSlice';

export const useFeed = (filter) => {
    const dispatch = useDispatch();
    const route = useRoute();
    const { globalList: journals, globalLoading: loading } = useSelector((state) => state.journals);
    
    const [refreshing, setRefreshing] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [commentModal, setCommentModal] = useState(false);
    const [galleryModal, setGalleryModal] = useState(false);
    const [galleryImages, setGalleryImages] = useState([]);
    const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
    const [visibleItems, setVisibleItems] = useState({}); // Track visible journal IDs
    
    const flatListRef = useRef(null);
    const lastHandledJournal = useRef(null);

    const handleViewableItemsChanged = useCallback(({ viewableItems }) => {
        const visible = {};
        viewableItems.forEach((item) => {
            visible[item.item._id] = true;
        });
        setVisibleItems(visible);
    }, []);

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 70, // Video must be 70% visible to auto-play
    });

    const loadData = useCallback(() => {
        dispatch(getGlobalJournalsAsync());
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

    const openComments = useCallback((post) => {
        setSelectedPost(post);
        setCommentModal(true);
    }, []);

    // Deep Linking logic: Handle navigation from notifications
    useEffect(() => {
        const { journalId, focusComment } = route.params || {};
        
        if (journalId && journals.length > 0 && lastHandledJournal.current !== journalId) {
            const index = journals.findIndex(j => j._id === journalId);
            if (index !== -1) {
                lastHandledJournal.current = journalId;
                const post = journals[index];
                
                // 1. Scroll to the specific post
                setTimeout(() => {
                    flatListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0 });
                }, 500);

                // 2. Open the comments modal automatically
                if (focusComment) {
                    openComments(post);
                }
            }
        }
    }, [route.params, journals, openComments]);

    return {
        journals, loading, refreshing, onRefresh, flatListRef,
        galleryModal, setGalleryModal, galleryImages,
        activeGalleryIndex, setActiveGalleryIndex,
        commentModal, setCommentModal, selectedPost,
        openGallery, openComments,
        handleViewableItemsChanged, viewabilityConfig, visibleItems
    };
};