import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { formatCoords, getCategoryMeta } from '../utils/Saved.utils';

export const useSaved = (colors) => {
    const navigation = useNavigation();
    const [collections, setCollections] = useState([]);
    const [recentSaves, setRecentSaves] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [activeFeature, setActiveFeature] = useState('');

    const loadSavedData = async (silent = false) => {
        try {
            if (!silent) setIsLoading(true);
            else setIsRefreshing(true);

            const savedData = await AsyncStorage.getItem('saved_places');
            const parsedSaves = savedData ? JSON.parse(savedData) : [];

            const sortedSaves = parsedSaves.sort((a, b) =>
                new Date(b.savedAt || 0) - new Date(a.savedAt || 0)
            );

            setRecentSaves(sortedSaves);

            const categories = [...new Set(parsedSaves.map(item => item.organizer || 'General'))];
            const collectionMock = categories.map((cat, index) => {
                const meta = getCategoryMeta(cat, index, colors);
                return {
                    id: String(index),
                    title: cat,
                    count: parsedSaves.filter(s => (s.organizer || 'General') === cat).length,
                    icon: meta.iconName,
                    color: meta.iconColor
                };
            });

            setCollections(collectionMock);
        } catch (e) {
            console.error("Load Saved Error:", e);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadSavedData(recentSaves.length > 0);
        }, [recentSaves.length])
    );

    const handleGoToAtlas = (item) => {
        navigation.navigate('Atlas', {
            location: formatCoords(item),
            placeName: item.name || item.title,
            placeAddress: item.address || item.location,
            placeImage: item.image,
            autoShowDirections: true 
        });
    };

    const removeSave = async (id) => {
        try {
            const savedData = await AsyncStorage.getItem('saved_places');
            let parsedSaves = savedData ? JSON.parse(savedData) : [];
            const updated = parsedSaves.filter(item => item.id !== id);

            await AsyncStorage.setItem('saved_places', JSON.stringify(updated));
            setRecentSaves(updated);
            loadSavedData(true);
        } catch (e) {
            console.error("Remove Save Error:", e);
        }
    };

    const confirmDelete = (id) => {
        Alert.alert(
            "Delete Bookmark",
            "Are you sure you want to remove this place?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => removeSave(id) }
            ]
        );
    };

    return {
        collections, recentSaves, isLoading, isRefreshing, modalVisible,
        setModalVisible, activeFeature, setActiveFeature, loadSavedData,
        handleGoToAtlas, confirmDelete
    };
};