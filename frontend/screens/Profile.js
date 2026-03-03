import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo } from 'react';
import {
    Alert, // Added Alert for confirmation
    Dimensions,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux'; // Added useDispatch

import GlassCard from '../components/GlassCard';
import { useTheme } from '../context/ThemeContext';
import { logout } from '../redux/authSlice'; // Import your logout action

const { width } = Dimensions.get('window');

const Profile = () => {
    const { isDark, colors, toggleTheme } = useTheme();
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch(); // Initialize dispatch
    
    // Get user and echoes from Redux
    const { user } = useSelector((state) => state.auth); 
    const { list } = useSelector((state) => state.echoes);

    // Dynamic stats logic
    const statsData = useMemo(() => {
        const cities = list
            .map(echo => echo.location?.address?.split(',')[0])
            .filter(Boolean);
        const unique = [...new Set(cities)].length;
        
        const progress = (list.length % 50) / 50; 
        const level = Math.floor(list.length / 50) + 1;

        return { unique, progress, level };
    }, [list]);

    // --- LOGOUT HANDLER ---
    const handleLogout = () => {
        Alert.alert(
            "Log Out",
            "Are you sure you want to exit your session?",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Log Out", 
                    style: "destructive", 
                    onPress: () => dispatch(logout()) // This clears the Redux state
                }
            ]
        );
    };

    const SettingItem = ({ icon, title, value, onPress, isLast, color, isToggle }) => (
    <TouchableOpacity 
        onPress={onPress} 
        activeOpacity={0.7}
        style={[
            styles.settingRow, 
            { borderBottomColor: isLast ? 'transparent' : colors.glassBorder }
        ]}
    >
        <View style={styles.settingLeft}>
            {/* CHANGED THIS FROM div TO View */}
            <View style={[styles.iconBox, { 
                backgroundColor: color ? `${color}20` : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'),
                borderColor: color ? color : colors.glassBorder,
                borderWidth: 0.5
            }]}>
                <Ionicons name={icon} size={20} color={color || (isDark ? colors.primary : colors.textMain)} />
            </View>
            <Text style={[styles.settingTitle, { color: colors.textMain }]}>{title}</Text>
        </View>
        
        <View style={styles.settingRight}>
            {value && <Text style={[styles.settingValue, { color: colors.textSecondary }]}>{value}</Text>}
            {isToggle ? (
                <View style={[styles.toggleTrack, { 
                    backgroundColor: isDark ? colors.primary : '#BDBDBD',
                    alignItems: isDark ? 'flex-end' : 'flex-start'
                }]}>
                    <View style={styles.toggleThumb} />
                </View>
            ) : (
                <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} style={{ opacity: 0.5 }} />
            )}
        </View>
    </TouchableOpacity>
);
    return (
        <LinearGradient colors={colors.background} style={styles.container}>
            <ScrollView 
                contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20, paddingBottom: 120 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Identity */}
                <View style={styles.header}>
                    <View style={[styles.avatarWrapper, { shadowColor: isDark ? colors.primary : '#000' }]}>
                        <LinearGradient 
                            colors={isDark ? ['#81D4FA', colors.primary] : [colors.primary, '#81D4FA']} 
                            style={styles.avatar}
                        >
                            {/* Display initials from actual username if available */}
                            <Text style={styles.avatarText}>
                                {user?.username ? user.username.substring(0, 2).toUpperCase() : 'EX'}
                            </Text>
                        </LinearGradient>
                        <TouchableOpacity style={[styles.editBadge, { backgroundColor: colors.primary, borderColor: isDark ? '#121212' : '#FFF' }]} activeOpacity={0.9}>
                            <Ionicons name="pencil" size={12} color="#FFF" />
                        </TouchableOpacity>
                    </View>
                    
                    <Text style={[styles.userName, { color: colors.textMain }]}>
                        {user?.username || 'Explorer'}
                    </Text>
                    <View style={[styles.rankBadge, { backgroundColor: isDark ? 'rgba(129,212,250,0.1)' : 'rgba(1,87,155,0.05)' }]}>
                        <Ionicons name="sparkles" size={12} color={isDark ? "#81D4FA" : colors.primary} />
                        <Text style={[styles.rankText, { color: isDark ? "#81D4FA" : colors.primary }]}> LEVEL {statsData.level} PIONEER</Text>
                    </View>
                </View>

                {/* ... (Progress Card and Stats Grid stay the same) ... */}
                <GlassCard style={[styles.progressCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                    <View style={styles.progressHeader}>
                        <Text style={[styles.progressTitle, { color: colors.textMain }]}>Next Milestone</Text>
                        <Text style={[styles.progressPercent, { color: colors.textSecondary }]}>{Math.round(statsData.progress * 100)}%</Text>
                    </View>
                    <View style={[styles.progressBarBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                        <View style={[styles.progressBarFill, { 
                            width: `${statsData.progress * 100}%`,
                            backgroundColor: isDark ? '#81D4FA' : colors.primary 
                        }]} />
                    </View>
                </GlassCard>

                <View style={styles.statsGrid}>
                    <GlassCard style={[styles.miniStat, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                        <Text style={[styles.miniStatNum, { color: colors.textMain }]}>{list.length}</Text>
                        <Text style={[styles.miniStatLabel, { color: colors.textSecondary }]}>Echoes</Text>
                    </GlassCard>
                    <GlassCard style={[styles.miniStat, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                        <Text style={[styles.miniStatNum, { color: colors.textMain }]}>{statsData.unique}</Text>
                        <Text style={[styles.miniStatLabel, { color: colors.textSecondary }]}>Cities</Text>
                    </GlassCard>
                </View>

                {/* Settings Sections */}
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>PREFERENCES</Text>
                <GlassCard style={[styles.menuContainer, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                    <SettingItem 
                        icon={isDark ? "moon" : "sunny"} 
                        title="Appearance" 
                        value={isDark ? 'Dark' : 'Light'} 
                        onPress={toggleTheme}
                        isToggle
                    />
                    <SettingItem icon="notifications-outline" title="Notifications" value="On" />
                    <SettingItem icon="shield-outline" title="Privacy" isLast />
                </GlassCard>

                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>SUPPORT</Text>
                <GlassCard style={[styles.menuContainer, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                    <SettingItem icon="help-buoy-outline" title="Help Center" />
                    <SettingItem icon="document-text-outline" title="Terms of Service" isLast />
                </GlassCard>

                {/* UPDATED LOGOUT BUTTON */}
                <TouchableOpacity 
                    style={styles.logoutBtn} 
                    activeOpacity={0.7}
                    onPress={handleLogout} // Attached handler
                >
                    <Ionicons name="log-out-outline" size={20} color="#FF5252" />
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>

                <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                    v1.2.0 Build 2603
                </Text>
            </ScrollView>
        </LinearGradient>
    );
};

export default Profile;

 
const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingHorizontal: 20 },
    header: { alignItems: 'center', marginVertical: 30 },
    avatarWrapper: {
        width: 100,
        height: 100,
        borderRadius: 50,
        padding: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginBottom: 16,
        ...Platform.select({ 
            ios: { shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 15 },
            android: { elevation: 10 }
        })
    },
    avatar: { flex: 1, borderRadius: 46, justifyContent: 'center', alignItems: 'center' },
    avatarText: { fontSize: 32, fontWeight: '900', color: '#FFF' },
    editBadge: {
        position: 'absolute', bottom: 0, right: 0,
        width: 28, height: 28,
        borderRadius: 14, justifyContent: 'center', alignItems: 'center',
        borderWidth: 3
    },
    userName: { fontSize: 28, fontWeight: '900', letterSpacing: -1 },
    rankBadge: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 12, paddingVertical: 6,
        borderRadius: 20, marginTop: 10
    },
    rankText: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
    
    progressCard: { padding: 20, borderRadius: 24, marginBottom: 15, borderWidth: 1 },
    progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    progressTitle: { fontSize: 14, fontWeight: '700' },
    progressPercent: { fontSize: 14, fontWeight: '800' },
    progressBarBg: { height: 8, borderRadius: 4, overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 4 },

    statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
    miniStat: { width: (width - 55) / 2, padding: 15, alignItems: 'center', borderRadius: 20, borderWidth: 1 },
    miniStatNum: { fontSize: 20, fontWeight: '900' },
    miniStatLabel: { fontSize: 11, fontWeight: '600', opacity: 0.6, marginTop: 2 },

    sectionLabel: { fontSize: 11, fontWeight: '800', marginLeft: 12, marginBottom: 8, letterSpacing: 1.5 },
    menuContainer: { borderRadius: 24, overflow: 'hidden', marginBottom: 25, borderWidth: 1 },
    settingRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, alignItems: 'center', borderBottomWidth: 1 },
    settingLeft: { flexDirection: 'row', alignItems: 'center' },
    iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    settingTitle: { fontSize: 16, fontWeight: '600' },
    settingRight: { flexDirection: 'row', alignItems: 'center' },
    settingValue: { fontSize: 14, marginRight: 10, fontWeight: '500' },

    toggleTrack: { width: 40, height: 22, borderRadius: 11, padding: 3, justifyContent: 'center' },
    toggleThumb: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#FFF' },

    logoutBtn: { 
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        padding: 18, borderRadius: 20, marginTop: 10
    },
    logoutText: { color: '#FF5252', fontWeight: '800', fontSize: 16, marginLeft: 8 },
    footerText: { textAlign: 'center', fontSize: 10, fontWeight: '700', marginTop: 20, opacity: 0.5 }
});