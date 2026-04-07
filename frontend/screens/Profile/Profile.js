import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Image,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../context/ThemeContext';
import { logout, setCredentials } from '../../redux/authSlice';
import { getJournalsAsync, updateJournalUser } from '../../redux/journalSlice';
import { getNotificationsAsync, markAllReadAsync } from '../../redux/notificationSlice';
import { clearNotifications, markNotificationsUnread, removeNotification, updatePrivacy, updateProfile } from '../../services/api';
import { uploadImageToCloudinary } from '../../services/cloudinary';

// --- IMPORT YOUR REUSABLE COMPONENT ---
import BrandedHeader from '../../components/BrandedHeader';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

const { width, height } = Dimensions.get('window');

const Profile = ({ navigation }) => {
    const { isDark, colors, toggleTheme } = useTheme();
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch();

    const { user, token: authToken } = useSelector((state) => state.auth);
    const { list: journals = [] } = useSelector((state) => state.journals || {});

    const [localNotif, setLocalNotif] = useState(null);
    const [saveCredsEnabled, setSaveCredsEnabled] = useState(null);

    // Edit Profile State
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [tempFirstName, setTempFirstName] = useState('');
    const [tempLastName, setTempLastName] = useState('');
    const [tempUsername, setTempUsername] = useState('');
    const [tempImage, setTempImage] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Settings Modal State
    const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);

    // Date Filter State
    const [filterDate, setFilterDate] = useState(null); // Format: 'YYYY-MM-DD'
    const [showDatePicker, setShowDatePicker] = useState(false); // Used for iOS

    // Notifications State
    const [isNotifModalVisible, setIsNotifModalVisible] = useState(false);
    const { list: notifications, unreadCount } = useSelector(state => state.notifications || { list: [], unreadCount: 0 });

    // Media Preview State
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [isPreviewVisible, setIsPreviewVisible] = useState(false);

    const statsData = useMemo(() => {
        const cities = journals.map(j => j.location?.address?.split(',')[0]).filter(Boolean);
        const unique = [...new Set(cities)].length;
        const progress = (journals.length % 50) / 50;
        const level = Math.floor(journals.length / 50) + 1;
        return { unique, progress, level };
    }, [journals]);

    // Flatten all media arrays from all journals to show in the grid
    const allMedia = useMemo(() => {
        return journals.reduce((acc, journal) => {
            if (journal.media && Array.isArray(journal.media)) {
                journal.media.forEach(url => {
                    acc.push({
                        url,
                        journalId: journal._id,
                        createdAt: journal.createdAt,
                        isVideo: url.toLowerCase().includes('/video/upload/') || 
                                 url.match(/\.(mp4|mov|m4v|avi|webm)$/i)
                    });
                });
            }
            return acc;
        }, []);
    }, [journals]);

    const isFilterActive = !!filterDate;

    const filteredMedia = useMemo(() => {
        if (!isFilterActive) return allMedia;

        return allMedia.filter(item => {
            if (!item.createdAt) return false;
            const d = new Date(item.createdAt).toISOString().split('T')[0];
            return d === filterDate;
        });
    }, [allMedia, filterDate, isFilterActive]);

    const showPicker = () => {
        if (Platform.OS === 'android') {
            DateTimePickerAndroid.open({
                value: filterDate ? new Date(filterDate + 'T12:00:00') : new Date(),
                onChange: onDateChange,
                mode: 'date',
            });
        } else {
            setShowDatePicker(true);
        }
    };

    const onDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate && event.type !== 'dismissed') {
            const year = selectedDate.getFullYear();
            const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const day = String(selectedDate.getDate()).padStart(2, '0');
            const formatted = `${year}-${month}-${day}`;
            setFilterDate(formatted);
        }
    };

    useEffect(() => {
        dispatch(getNotificationsAsync());
    }, [dispatch]);

    useEffect(() => {
        const userId = user?._id || user?.id;
        if (userId) {
            dispatch(getJournalsAsync(userId));
        }
    }, [dispatch, user?._id, user?.id]);

    useEffect(() => {
        const loadNotifPref = async () => {
            try {
                const saved = await AsyncStorage.getItem(`notif_pref_${user?.email}`);
                if (saved !== null) {
                    setLocalNotif(saved === 'true');
                }

                const savedCredsPref = await AsyncStorage.getItem(`save_creds_pref_${user?.email}`);
                if (savedCredsPref !== null) {
                    setSaveCredsEnabled(savedCredsPref === 'true');
                }
            } catch (e) {
                console.log("Error loading local notification pref:", e);
            }
        };
        if (user?.email) loadNotifPref();
    }, [user?.email]);

    const isNotifEnabled = localNotif !== null ? localNotif : (user?.notificationsEnabled !== false);
    const isSaveCredsEnabled = saveCredsEnabled !== null ? saveCredsEnabled : true;

    const registerForPushNotificationsAsync = async () => {
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
            });
        }

        if (!Device.isDevice) {
            Alert.alert('Must use physical device for Push Notifications');
            return null;
        }
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            Alert.alert('Failed to get push token for push notification!');
            return null;
        }

        try {
            const projectId = Constants?.expoConfig?.extra?.eas?.projectId || Constants?.easConfig?.projectId;
            const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
            return token;
        } catch (e) {
            console.error("Error getting push token:", e);
            return null;
        }
    };

    const handleNotificationToggle = async () => {
        const isEnabling = !isNotifEnabled;
        let token = user?.pushToken;

        if (isEnabling && !token) {
            token = await registerForPushNotificationsAsync();
        }

        try {
            const response = await updatePrivacy({
                notificationsEnabled: isEnabling,
                pushToken: token
            });

            // Save to AsyncStorage for persistence across app restarts
            await AsyncStorage.setItem(`notif_pref_${user?.email}`, isEnabling.toString());
            setLocalNotif(isEnabling);

            // Update Redux state so the toggle UI updates immediately
            dispatch(setCredentials({ user: response.data.user, token: authToken }));
            Alert.alert("Success", `Notifications turned ${isEnabling ? 'On' : 'Off'}`);
        } catch (e) { Alert.alert("Error", "Could not update notification settings"); }
    };

    const handleSaveCredentials = async () => {
        const newValue = !isSaveCredsEnabled;
        setSaveCredsEnabled(newValue);
        
        try {
            await AsyncStorage.setItem(`save_creds_pref_${user?.email}`, newValue.toString());
            
            if (!newValue) {
                // Clear saved credentials if disabled
                const sanitized = user.email.toLowerCase().trim().replace(/[^a-zA-Z0-9._-]/g, '_');
                await SecureStore.deleteItemAsync(`user_credentials_${sanitized}`);
            }
        } catch (error) { console.error("Error toggling save credentials:", error); }
    };

    const handleLogout = () => {
        Alert.alert("Log Out", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            { text: "Log Out", style: "destructive", onPress: () => dispatch(logout()) }
        ]);
    };

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            setTempImage(result.assets[0].uri);
        }
    };

    const handleSaveProfile = async () => {
        if (!tempFirstName.trim() || !tempLastName.trim()) 
            return Alert.alert("Error", "Name fields cannot be empty");
        setIsSaving(true);
        try {
            let imageUrl = user.profilePicture;

            // Upload new image if changed
            if (tempImage && tempImage !== user.profilePicture) {
                imageUrl = await uploadImageToCloudinary(tempImage);
            } else if (tempImage === null && user.profilePicture) {
                imageUrl = null; // Handle deletion
            }

            const response = await updateProfile({
                firstName: tempFirstName.trim(),
                lastName: tempLastName.trim(),
                profilePicture: imageUrl
            });

            const updatedUser = response.data.user;
            dispatch(setCredentials({ user: updatedUser, token: authToken }));
            
            // Sync changes to the Journal Feed locally
            dispatch(updateJournalUser({
                userId: updatedUser.id,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                profilePicture: updatedUser.profilePicture
            }));

            setIsEditModalVisible(false);
            Alert.alert("Success", "Profile updated successfully");
        } catch (error) {
            Alert.alert("Error", error.response?.data?.message || "Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    const openEditModal = () => {
        setTempFirstName(user.firstName || '');
        setTempLastName(user.lastName || '');
        setTempImage(user.profilePicture);
        setIsEditModalVisible(true);
    };

    const openNotifModal = () => {
        setIsNotifModalVisible(true);
        if (unreadCount > 0) dispatch(markAllReadAsync());
    };

    const handleClearAll = async () => {
        Alert.alert("Clear All", "Delete all notifications?", [
            { text: "Cancel", style: "cancel" },
            { text: "Clear", style: "destructive", onPress: async () => {
                try {
                    await clearNotifications();
                    dispatch(getNotificationsAsync());
                } catch (e) { Alert.alert("Error", "Failed to clear notifications"); }
            }}
        ]);
    };

    const handleMarkAllUnread = async () => {
        try {
            await markNotificationsUnread();
            dispatch(getNotificationsAsync());
        } catch (e) { Alert.alert("Error", "Failed to update notifications"); }
    };

    const handleDeleteNotification = async (id) => {
        Alert.alert("Delete Notification", "Remove this activity from your list?", [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: async () => {
                try {
                    await removeNotification(id);
                    dispatch(getNotificationsAsync());
                } catch (e) { Alert.alert("Error", "Failed to delete notification"); }
            }}
        ]);
    };

    // --- REUSABLE SETTING ITEM ---
    const SettingItem = ({ icon, title, value, onPress, isLast, color, isToggle, toggleValue }) => (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            style={[
                styles.settingRow,
                { borderBottomColor: isLast ? 'transparent' : colors.glassBorder }
            ]}
        >
            <View style={styles.settingLeft}>
                <View style={[styles.iconBox, {
                    backgroundColor: color ? `${color}20` : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'),
                    borderColor: colors.glassBorder,
                }]}>
                    <Ionicons name={icon} size={20} color={color || colors.primary} />
                </View>
                <Text style={[styles.settingTitle, { color: colors.textMain }]}>{title}</Text>
            </View>

            <View style={styles.settingRight}>
                {value && <Text style={[styles.settingValue, { color: colors.textSecondary }]}>{value}</Text>}
                {isToggle ? (
                    <View style={[styles.toggleTrack, {
                        backgroundColor: toggleValue ? colors.primary : (isDark ? 'rgba(255,255,255,0.1)' : '#D1D5DB'),
                        alignItems: toggleValue ? 'flex-end' : 'flex-start'
                    }]}>
                        <View style={styles.toggleThumb} />
                    </View>
                ) : (
                    <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <LinearGradient colors={colors.background} style={styles.container}>
            <StatusBar barStyle={colors.status} translucent backgroundColor="transparent" />

            {/* --- REUSABLE BRANDED HEADER --- */}
            <BrandedHeader colors={colors} isDark={isDark} />

            {/* Settings Icon (Top Left) */}
            <TouchableOpacity 
                onPress={() => setIsSettingsModalVisible(true)}
                style={[styles.settingsHeaderBtn, { top: insets.top + 15 }]}
            >
                <Ionicons name="settings-outline" size={24} color={colors.textMain} />
            </TouchableOpacity>

            {/* Notification Bell Icon */}
            <TouchableOpacity 
                onPress={openNotifModal}
                style={[styles.notifHeaderBtn, { top: insets.top + 15 }]}
            >
                <Ionicons name="notifications" size={24} color={colors.textMain} />
                {unreadCount > 0 && (
                    <View style={[styles.notifBadge, { backgroundColor: colors.accent }]}>
                        <Text style={styles.notifBadgeText}>{unreadCount}</Text>
                    </View>
                )}
            </TouchableOpacity>

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20, paddingBottom: 120 }]}
                showsVerticalScrollIndicator={false}
                style={{ backgroundColor: 'transparent' }}
            >
                {/* Profile Identity */}
                <View style={styles.header}>
                   
                     <TouchableOpacity onPress={openEditModal} activeOpacity={0.8}>
                        <View style={styles.avatarWrapper}>
                            <LinearGradient
                                colors={isDark ? [colors.primary, '#0ea5e9'] : [colors.primary, '#475569']}
                                style={styles.avatar}
                            >
                                {user?.profilePicture ? (
                                    <Image source={{ uri: user.profilePicture }} style={styles.avatarImage} />
                                ) : (
                                    <Text style={styles.avatarText}>
                                        {user?.username ? user.username.substring(0, 2).toUpperCase() : 'EX'}
                                    </Text>
                                )}
                            </LinearGradient>
                            <View style={[
                                styles.editIconBadge, 
                                { 
                                    backgroundColor: colors.primary, 
                                    borderColor: isDark ? colors.background[0] : '#FFF' 
                                }
                            ]}>
                                <Ionicons name="pencil" size={14} color="#FFF" />
                            </View>
                        </View>
                    </TouchableOpacity>
                    <Text style={[styles.userName, { color: colors.textMain }]}>
                        {user ? `${user.firstName} ${user.lastName}` : 'Explorer'}
                    </Text>
                    <View style={[styles.rankBadge, { backgroundColor: isDark ? 'rgba(56,189,248,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                        <Ionicons name="sparkles" size={12} color={colors.primary} />
                        <Text style={[styles.rankText, { color: colors.primary }]}> LEVEL {statsData.level} PIONEER</Text>
                    </View>
                </View>

                {/* Milestone Card */}
                <View style={[styles.card, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                    <View style={styles.progressHeader}>
                        <Text style={[styles.progressTitle, { color: colors.textMain }]}>Next Milestone</Text>
                        <Text style={[styles.progressPercent, { color: colors.textSecondary }]}>{Math.round(statsData.progress * 100)}%</Text>
                    </View>
                    <View style={[styles.progressBarBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                        <View style={[styles.progressBarFill, {
                            width: `${statsData.progress * 100}%`,
                            backgroundColor: colors.primary
                        }]} />
                    </View>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    <View style={[styles.miniStat, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                        <Text style={[styles.miniStatNum, { color: colors.textMain }]}>{journals.length}</Text>
                        <Text style={[styles.miniStatLabel, { color: colors.textSecondary }]}>Echoes</Text>
                    </View>
                    <View style={[styles.miniStat, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                        <Text style={[styles.miniStatNum, { color: colors.textMain }]}>{statsData.unique}</Text>
                        <Text style={[styles.miniStatLabel, { color: colors.textSecondary }]}>Cities</Text>
                    </View>
                </View>

                {/* Media Grid (Echoes) */}
                <View style={styles.mediaGridHeader}>
                    <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginBottom: 0 }]}>MY ECHOES</Text>
                    <TouchableOpacity 
                        style={[styles.filterButton, { backgroundColor: isFilterActive ? colors.primary : colors.glass, borderColor: isFilterActive ? colors.primary : colors.glassBorder }]}
                        onPress={showPicker}
                    >
                        <Text style={[styles.filterButtonText, { color: isFilterActive ? '#FFF' : colors.textMain }]}>
                            FILTER
                        </Text>
                        {isFilterActive && <Ionicons name="filter" size={14} color="#FFF" style={{ marginLeft: 5 }} />}
                    </TouchableOpacity>
                </View>
                {isFilterActive && (
                    <TouchableOpacity onPress={() => setFilterDate(null)} style={styles.filterBadge}>
                        <Text style={[styles.filterBadgeText, { color: colors.primary }]}>
                            Date: {filterDate}  ✕
                        </Text>
                    </TouchableOpacity>
                )}
                
                <View style={styles.mediaGrid}>
                    {filteredMedia.length > 0 ? (
                        filteredMedia.map((item, index) => (
                            <TouchableOpacity 
                                key={`${item.journalId}-${index}`} 
                                style={styles.mediaItem}
                                activeOpacity={0.8}
                                onPress={() => {
                                    setSelectedMedia(item);
                                    setIsPreviewVisible(true);
                                }}
                            >
                                <Image 
                                    source={{ uri: item.url }} 
                                    style={styles.mediaImage} 
                                />
                                {item.isVideo && (
                                    <View style={styles.videoBadge}>
                                        <Ionicons name="play" size={12} color="#FFF" />
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={[styles.emptyMedia, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                            <Ionicons name="images-outline" size={40} color={colors.textSecondary} style={{ opacity: 0.3 }} />
                            <Text style={[styles.emptyMediaText, { color: colors.textSecondary }]}>No media shared yet</Text>
                        </View>
                    )}
                </View>

                <Text style={[styles.footerText, { color: colors.textSecondary }]}>v1.0.8 Build 2603</Text>
            </ScrollView>

            {/* Edit Profile Modal */}
            <Modal visible={isEditModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.background[0] }]}>
                        <Text style={[styles.modalTitle, { color: colors.textMain }]}>Edit Profile</Text>
                        
                        <TouchableOpacity onPress={handlePickImage} style={styles.modalAvatarWrapper}>
                            {tempImage ? (
                                <Image source={{ uri: tempImage }} style={styles.modalAvatar} />
                            ) : (
                                <View style={[styles.modalAvatar, { backgroundColor: colors.glass, justifyContent: 'center', alignItems: 'center' }]}>
                                    <Ionicons name="camera" size={30} color={colors.primary} />
                                </View>
                            )}
                            <View style={styles.changePhotoBadge}>
                                <Text style={styles.changePhotoText}>Change Photo</Text>
                            </View>
                            {tempImage && (
                                <TouchableOpacity 
                                    style={styles.deletePhotoBtn} 
                                    onPress={() => setTempImage(null)}
                                >
                                    <Ionicons name="trash" size={16} color="#FFF" />
                                </TouchableOpacity>
                            )}
                        </TouchableOpacity>

                        <View style={styles.inputGroup}>
                            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>FIRST NAME</Text>
                            <TextInput
                                style={[styles.modalInput, { 
                                    color: colors.textMain, 
                                    backgroundColor: colors.glass,
                                    borderColor: colors.glassBorder
                                }]}
                                value={tempFirstName}
                                onChangeText={setTempFirstName}
                                placeholder="First Name"
                                placeholderTextColor={colors.textSecondary}
                            />

                            <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 15 }]}>LAST NAME</Text>
                            <TextInput
                                style={[styles.modalInput, { 
                                    color: colors.textMain, 
                                    backgroundColor: colors.glass,
                                    borderColor: colors.glassBorder
                                }]}
                                value={tempLastName}
                                onChangeText={setTempLastName}
                                placeholder="Last Name"
                                placeholderTextColor={colors.textSecondary}
                            />

                            <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 15 }]}>USERNAME</Text>
                            <TextInput
                                style={[styles.modalInput, { 
                                    color: colors.textMain, 
                                    backgroundColor: colors.glass,
                                    borderColor: colors.glassBorder
                                }]}
                                value={tempUsername}
                                onChangeText={setTempUsername}
                                placeholder="Username"
                                placeholderTextColor={colors.textSecondary}
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity 
                                style={[styles.modalBtn, { backgroundColor: colors.glass }]} 
                                onPress={() => setIsEditModalVisible(false)}
                            >
                                <Text style={{ color: colors.textMain, fontWeight: '700' }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.modalBtn, { backgroundColor: colors.primary }]} 
                                onPress={handleSaveProfile}
                                disabled={isSaving}
                            >
                                {isSaving ? <ActivityIndicator color="#FFF" /> : <Text style={{ color: '#FFF', fontWeight: '700' }}>Save Changes</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Notifications Modal */}
            <Modal visible={isNotifModalVisible} animationType="slide" transparent>
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { backgroundColor: colors.background[0], height: '70%' }]}>
                            <View style={styles.modalHeaderRow}>
                                <Text style={[styles.modalTitle, { color: colors.textMain, marginBottom: 0 }]}>Activity</Text>
                                <View style={{ flexDirection: 'row', gap: 15, alignItems: 'center' }}>
                                    <TouchableOpacity onPress={handleMarkAllUnread}>
                                        <Ionicons name="eye-off-outline" size={22} color={colors.primary} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={handleClearAll}>
                                        <Ionicons name="trash-outline" size={22} color="#EF4444" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => setIsNotifModalVisible(false)}>
                                        <Ionicons name="close-circle" size={28} color={colors.textSecondary} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            
                            <FlatList
                                data={notifications}
                                keyExtractor={item => item._id}
                                style={{ width: '100%' }}
                                contentContainerStyle={{ paddingVertical: 10 }}
                                ListEmptyComponent={
                                    <View style={{ alignItems: 'center', marginTop: 40 }}>
                                        <Ionicons name="notifications-off-outline" size={48} color={colors.textSecondary} opacity={0.3} />
                                        <Text style={{ color: colors.textSecondary, marginTop: 10 }}>No notifications yet</Text>
                                    </View>
                                }
                                renderItem={({ item }) => (
                                    <Swipeable
                                        renderRightActions={() => (
                                            <Pressable
                                                style={styles.deleteNotifAction}
                                                onPress={() => handleDeleteNotification(item._id)}
                                            >
                                                <LinearGradient colors={['#EF4444', '#991B1B']} style={styles.deleteNotifGradient}>
                                                    <Ionicons name="trash-outline" size={20} color="white" />
                                                </LinearGradient>
                                            </Pressable>
                                        )}
                                        overshootRight={false}
                                    >
                                        <View style={[styles.notifRow, { borderBottomColor: colors.glassBorder, backgroundColor: colors.background[0] }]}>
                                            <View style={styles.notifAvatar}>
                                                {item.sender?.profilePicture ? (
                                                    <Image source={{ uri: item.sender.profilePicture }} style={styles.avatarImage} />
                                                ) : (
                                                    <LinearGradient colors={[colors.primary, colors.accent]} style={styles.avatar}>
                                                        <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{item.sender?.firstName?.[0]}</Text>
                                                    </LinearGradient>
                                                )}
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={{ color: colors.textMain, fontSize: 14 }}>
                                                    <Text style={{ fontWeight: 'bold' }}>{item.sender?.firstName} {item.sender?.lastName}</Text>
                                                    {` ${item.content} `}
                                                    {item.journalId?.title && <Text style={{ fontWeight: '600', color: colors.primary }}>"{item.journalId.title}"</Text>}
                                                </Text>
                                                <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 4 }}>
                                                    {new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </Text>
                                            </View>
                                            {!item.isRead && (
                                                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent }} />
                                            )}
                                        </View>
                                    </Swipeable>
                                )}
                            />
                        </View>
                    </View>
                </GestureHandlerRootView>
            </Modal>

            {/* Native Date Picker */}
            {showDatePicker && Platform.OS === 'ios' && (
                <DateTimePicker
                    value={filterDate ? new Date(filterDate + 'T12:00:00') : new Date()}
                    mode="date"
                    display="inline"
                    onChange={onDateChange}
                />
            )}

            {/* Semi Full Screen Preview Modal */}
            <Modal visible={isPreviewVisible} transparent animationType="fade" onRequestClose={() => setIsPreviewVisible(false)}>
                <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.9)' }]}>
                    <TouchableOpacity style={styles.previewCloseBtn} onPress={() => setIsPreviewVisible(false)}>
                        <Ionicons name="close-circle" size={40} color="#FFF" />
                    </TouchableOpacity>
                    <View style={styles.previewContent}>
                        <Image source={{ uri: selectedMedia?.url }} style={styles.previewImage} resizeMode="contain" />
                        {selectedMedia?.isVideo && (
                            <View style={styles.previewVideoIcon}>
                                <Ionicons name="play-circle" size={80} color="rgba(255,255,255,0.6)" />
                            </View>
                        )}
                    </View>
                    
                </View>
            </Modal>

            {/* Settings Modal (Preferences & Support) */}
            <Modal visible={isSettingsModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.background[0], height: '85%', width: '100%', borderRadius: 30, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, position: 'absolute', bottom: 0 }]}>
                        <View style={styles.modalHeaderRow}>
                            <Text style={[styles.modalTitle, { color: colors.textMain, marginBottom: 0 }]}>Settings</Text>
                            <TouchableOpacity onPress={() => setIsSettingsModalVisible(false)}>
                                <Ionicons name="close-circle" size={28} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={{ width: '100%' }} showsVerticalScrollIndicator={false}>
                            <Text style={[styles.sectionLabel, { color: colors.textSecondary, marginTop: 10 }]}>PREFERENCES</Text>
                            <View style={[styles.menuContainer, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                                <SettingItem
                                    icon={isDark ? "moon" : "sunny"}
                                    title="Appearance"
                                    value={isDark ? 'Dark' : 'Light'}
                                    onPress={toggleTheme}
                                    isToggle={true}
                                    toggleValue={isDark}
                                />
                                <SettingItem
                                    icon="notifications-outline"
                                    title="Notifications"
                                    value={isNotifEnabled ? "On" : "Off"}
                                    onPress={handleNotificationToggle}
                                    isToggle={true}
                                    toggleValue={isNotifEnabled}
                                />
                                <SettingItem
                                    icon="key-outline"
                                    title="Save Credentials"
                                    value={isSaveCredsEnabled ? "On" : "Off"}
                                    onPress={handleSaveCredentials}
                                    isToggle={true}
                                    toggleValue={isSaveCredsEnabled}
                                />
                                <SettingItem 
                                    icon="shield-outline" 
                                    title="Privacy & Security" 
                                    isLast 
                                    onPress={() => {
                                        setIsSettingsModalVisible(false);
                                        navigation.navigate('PrivacySecurity');
                                    }} 
                                />
                            </View>

                            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>SUPPORT</Text>
                            <View style={[styles.menuContainer, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                                <SettingItem icon="help-buoy-outline" title="Help Center" onPress={() => {
                                    setIsSettingsModalVisible(false);
                                    navigation.navigate('Help');
                                }} />
                                <SettingItem icon="document-text-outline" title="Terms of Service" onPress={() => {
                                    setIsSettingsModalVisible(false);
                                    navigation.navigate('Terms');
                                }} />
                                <SettingItem icon="information-circle-outline" title="About App" isLast onPress={() => {
                                    setIsSettingsModalVisible(false);
                                    navigation.navigate('About');
                                }} />
                            </View>

                            <TouchableOpacity 
                                style={[styles.logoutBtn, { backgroundColor: isDark ? 'rgba(255, 82, 82, 0.1)' : 'rgba(255, 82, 82, 0.05)' }]} 
                                onPress={() => {
                                    setIsSettingsModalVisible(false);
                                    handleLogout();
                                }}
                            >
                                <Ionicons name="log-out-outline" size={22} color="#FF5252" />
                                <Text style={styles.logoutText}>Log Out</Text>
                            </TouchableOpacity>
                            <View style={{ height: 40 }} />
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingHorizontal: 20 },
    header: { alignItems: 'center', marginVertical: 30 },
    avatarWrapper: { width: 100, height: 100, borderRadius: 50, padding: 4, backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 16 },
    avatar: { flex: 1, borderRadius: 46, justifyContent: 'center', alignItems: 'center' },
    avatarText: { fontSize: 32, fontWeight: '900', color: '#FFF' },
    avatarImage: { width: '100%', height: '100%', borderRadius: 46 },
    editIconBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#6366F1', width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
    userName: { fontSize: 28, fontWeight: '900', letterSpacing: -1 },
    rankBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginTop: 10 },
    rankText: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
    card: { padding: 20, borderRadius: 24, marginBottom: 15, borderWidth: 1 },
    progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    progressTitle: { fontSize: 14, fontWeight: '700' },
    progressPercent: { fontSize: 14, fontWeight: '800' },
    progressBarBg: { height: 8, borderRadius: 4, overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 4 },
    statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
    miniStat: { width: (width - 55) / 2, padding: 20, alignItems: 'center', borderRadius: 24, borderWidth: 1 },
    miniStatNum: { fontSize: 22, fontWeight: '900' },
    miniStatLabel: { fontSize: 12, fontWeight: '600', opacity: 0.6 },
    sectionLabel: { fontSize: 11, fontWeight: '800', marginLeft: 12, marginBottom: 10, letterSpacing: 1.5 },
    menuContainer: { borderRadius: 24, overflow: 'hidden', marginBottom: 25, borderWidth: 1 },
    settingRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 18, alignItems: 'center', borderBottomWidth: 1 },
    settingLeft: { flexDirection: 'row', alignItems: 'center' },
    iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16, borderWidth: 1 },
    settingTitle: { fontSize: 16, fontWeight: '600' },
    settingRight: { flexDirection: 'row', alignItems: 'center' },
    settingValue: { fontSize: 14, marginRight: 10, fontWeight: '500' },
    toggleTrack: { width: 44, height: 24, borderRadius: 12, padding: 3, justifyContent: 'center' },
    toggleThumb: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#FFF' },
    logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, borderRadius: 24, marginTop: 10 },
    logoutText: { color: '#FF5252', fontWeight: '800', fontSize: 16, marginLeft: 10 },
    footerText: { textAlign: 'center', fontSize: 10, fontWeight: '700', marginTop: 25, opacity: 0.5 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: '85%', borderRadius: 30, padding: 25, alignItems: 'center' },
    modalTitle: { fontSize: 20, fontWeight: '900', marginBottom: 20 },
    modalAvatarWrapper: { width: 120, height: 120, borderRadius: 60, marginBottom: 20, position: 'relative' },
    modalAvatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: '#6366F1' },
    changePhotoBadge: { position: 'absolute', bottom: -10, alignSelf: 'center', backgroundColor: '#6366F1', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
    changePhotoText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
    deletePhotoBtn: { position: 'absolute', top: 0, right: 0, backgroundColor: '#EF4444', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
    inputGroup: { width: '100%', marginBottom: 20 },
    inputLabel: { fontSize: 10, fontWeight: '800', marginLeft: 10, marginBottom: 5 },
    modalInput: { width: '100%', height: 55, borderRadius: 18, paddingHorizontal: 20, fontSize: 16, fontWeight: '600', borderWidth: 1 },
    modalActions: { flexDirection: 'row', gap: 10, width: '100%' },
    modalBtn: { flex: 1, height: 55, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    notifHeaderBtn: { position: 'absolute', right: 25, zIndex: 100, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    notifBadge: { position: 'absolute', top: 5, right: 5, minWidth: 16, height: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
    notifBadgeText: { color: '#000', fontSize: 10, fontWeight: '900' },
    modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 20 },
    notifRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, gap: 15 },
    notifAvatar: { width: 45, height: 45, borderRadius: 22.5, overflow: 'hidden' },
    settingsHeaderBtn: { position: 'absolute', left: 25, zIndex: 100, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    mediaGridHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingHorizontal: 5 },
    mediaCount: { fontSize: 12, fontWeight: '700' },
    mediaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    mediaItem: { width: (width - 60) / 3, height: (width - 60) / 3, borderRadius: 12, overflow: 'hidden' },
    mediaImage: { width: '100%', height: '100%' },
    videoBadge: { position: 'absolute', top: 5, right: 5, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 10, padding: 3 },
    emptyMedia: { width: '100%', height: 200, borderRadius: 24, borderWidth: 1, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
    emptyMediaText: { fontSize: 14, fontWeight: '600', marginTop: 10, opacity: 0.5 },
    filterBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, backgroundColor: 'rgba(99, 102, 241, 0.1)', marginBottom: 15, marginLeft: 5 },
    filterBadgeText: { fontSize: 12, fontWeight: '700', opacity: 0.8 },
    filterButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 18, borderWidth: 1 },
    filterButtonText: { fontSize: 12, fontWeight: '700' },
    previewCloseBtn: { position: 'absolute', top: 50, right: 25, zIndex: 100 },
    previewContent: { width: width, height: height * 0.7, justifyContent: 'center', alignItems: 'center' },
    previewImage: { width: '100%', height: '100%' },
    previewVideoIcon: { position: 'absolute' },
    
    viewJournalText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
    deleteNotifAction: { width: 70, height: '100%' },
    deleteNotifGradient: { flex: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 12, marginVertical: 8, marginRight: 10 },
});

export default Profile;