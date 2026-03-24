import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getGlobalJournalsAsync } from '../../../../../redux/journalSlice';

export const useFeed = (filter) => {
    const dispatch = useDispatch();
    const { globalList: journals, globalLoading: loading } = useSelector((state) => state.journals);
    
    const [refreshing, setRefreshing] = useState(false);
    const [selectedPost, setSelectedPost] = useState(null);
    const [commentModal, setCommentModal] = useState(false);
    const [galleryModal, setGalleryModal] = useState(false);
    const [galleryImages, setGalleryImages] = useState([]);
    const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);

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

    return {
        journals, loading, refreshing, onRefresh,
        galleryModal, setGalleryModal, galleryImages,
        activeGalleryIndex, setActiveGalleryIndex,
        commentModal, setCommentModal, selectedPost,
        openGallery, openComments
    };
};