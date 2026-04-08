import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import { Alert } from 'react-native';

export const checkIsVideo = (uri) => {
    if (!uri || typeof uri !== 'string') return false;
    const url = uri.toLowerCase();
    return (
        url.includes('/video/upload/') || 
        url.endsWith('.mp4') || 
        url.endsWith('.mov') || 
        url.endsWith('.m4v')
    );
};

export const getRelativeTime = (date) => {
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

export const downloadMedia = async (uri) => {
    if (!uri) return;
    try {
       
        const { status } = await MediaLibrary.requestPermissionsAsync(true);
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Please enable media library permissions in your device settings to download files.');
            return;
        }

        // Clean filename: remove query params and add a timestamp to avoid name collisions
        let cleanName = uri.split('/').pop().split('?')[0];
        if (!cleanName.includes('.')) {
            cleanName += checkIsVideo(uri) ? '.mp4' : '.jpg';
        }
        const filename = `${Date.now()}_${cleanName}`;
        const fileUri = `${FileSystem.documentDirectory}${filename}`;

        const downloadResumable = FileSystem.createDownloadResumable(uri, fileUri);
        const { uri: localUri } = await downloadResumable.downloadAsync();

        if (localUri) {
            await MediaLibrary.createAssetAsync(localUri);
            Alert.alert('Success', 'Media saved to gallery!');
        }
    } catch (error) {
        console.error("Download Error:", error);
        Alert.alert('Error', 'Failed to download media. Please check your connection.');
    }
};