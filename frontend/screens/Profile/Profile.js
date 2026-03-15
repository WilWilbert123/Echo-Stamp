import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo } from 'react';
import {
    Alert,
    Dimensions,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../context/ThemeContext';
import { logout } from '../../redux/authSlice';

const { width, height } = Dimensions.get('window');

const Profile = ({navigation}) => {
    // Accessing your ThemeContext
    const { isDark, colors, toggleTheme } = useTheme();
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch();
    
    const { user } = useSelector((state) => state.auth); 
    const { list } = useSelector((state) => state.echoes);

    const statsData = useMemo(() => {
        const cities = list.map(echo => echo.location?.address?.split(',')[0]).filter(Boolean);
        const unique = [...new Set(cities)].length;
        const progress = (list.length % 50) / 50; 
        const level = Math.floor(list.length / 50) + 1;
        return { unique, progress, level };
    }, [list]);

    const handleLogout = () => {
        Alert.alert("Log Out", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            { text: "Log Out", style: "destructive", onPress: () => dispatch(logout()) }
        ]);
    };

    // --- REUSABLE SETTING ITEM ---
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
                        backgroundColor: isDark ? colors.primary : '#D1D5DB',
                        alignItems: isDark ? 'flex-end' : 'flex-start'
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
            <StatusBar barStyle={colors.status} />

            {/* Branded Header Waves */}
              <View style={styles.headerBackground}>
                            <View style={[styles.blueWave, { backgroundColor: colors.primary, opacity: isDark ? 0.3 : 0.8 }]} />
                            <View style={[styles.darkWave, { backgroundColor: isDark ? '#1E293B' : '#637D8B' }]} />
                        </View>
            <ScrollView 
                contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20, paddingBottom: 120 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Identity */}
                <View style={styles.header}>
                    <View style={styles.avatarWrapper}>
                        <LinearGradient 
                            colors={isDark ? [colors.primary, '#0ea5e9'] : [colors.primary, '#475569']} 
                            style={styles.avatar}
                        >
                            <Text style={styles.avatarText}>
                                {user?.username ? user.username.substring(0, 2).toUpperCase() : 'EX'}
                            </Text>
                        </LinearGradient>
                    </View>
                    
                    {/* Dynamic Text Colors */}
                    <Text style={[styles.userName, { color: colors.textMain }]}>
                        {user?.username || 'Explorer'}
                    </Text>
                    <View style={[styles.rankBadge, { backgroundColor: isDark ? 'rgba(56,189,248,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                        <Ionicons name="sparkles" size={12} color={colors.primary} />
                        <Text style={[styles.rankText, { color: colors.primary }]}> LEVEL {statsData.level} PIONEER</Text>
                    </View>
                </View>

               
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

                <View style={styles.statsGrid}>
                    <View style={[styles.miniStat, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                        <Text style={[styles.miniStatNum, { color: colors.textMain }]}>{list.length}</Text>
                        <Text style={[styles.miniStatLabel, { color: colors.textSecondary }]}>Echoes</Text>
                    </View>
                    <View style={[styles.miniStat, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                        <Text style={[styles.miniStatNum, { color: colors.textMain }]}>{statsData.unique}</Text>
                        <Text style={[styles.miniStatLabel, { color: colors.textSecondary }]}>Cities</Text>
                    </View>
                </View>

                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>PREFERENCES</Text>
                <View style={[styles.menuContainer, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                    <SettingItem 
                        icon={isDark ? "moon" : "sunny"} 
                        title="Appearance" 
                        value={isDark ? 'Dark' : 'Light'} 
                        onPress={toggleTheme}
                        isToggle
                    />
                    <SettingItem icon="notifications-outline" title="Notifications" value="On" />
                    <SettingItem icon="shield-outline" title="Privacy & Security" isLast onPress={() => navigation.navigate('PrivacySecurity')} />        
                 


                </View>
                        {/* Support Section */}
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>SUPPORT</Text>
                <View style={[styles.menuContainer, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                    <SettingItem icon="help-buoy-outline" title="Help Center" />
                    <SettingItem icon="document-text-outline" title="Terms of Service" />
                    <SettingItem icon="information-circle-outline" title="About App" isLast />
                </View>       
        
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={22} color="#FF5252" />
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>

                <Text style={[styles.footerText, { color: colors.textSecondary }]}>v1.2.0 Build 2603</Text>
            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
  headerBackground: { position: 'absolute', top: 0, width: '100%', height: height * 0.25 },
    blueWave: { position: 'absolute', top: -50, right: -50, width: width * 1.2, height: height * 0.2, borderBottomLeftRadius: 300, transform: [{ rotate: '-10deg' }] },
    darkWave: { position: 'absolute', top: -30, right: -80, width: width * 0.8, height: height * 0.18, opacity: 0.6, borderBottomLeftRadius: 200, transform: [{ rotate: '-5deg' }] },
    scrollContent: { paddingHorizontal: 20 },
    header: { alignItems: 'center', marginVertical: 30 },
    avatarWrapper: { width: 100, height: 100, borderRadius: 50, padding: 4, backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 16 },
    avatar: { flex: 1, borderRadius: 46, justifyContent: 'center', alignItems: 'center' },
    avatarText: { fontSize: 32, fontWeight: '900', color: '#FFF' },
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
    toggleThumb: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#581515' },
    logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, borderRadius: 24, marginTop: 10 },
    logoutText: { color: '#FF5252', fontWeight: '800', fontSize: 16, marginLeft: 10 },
    footerText: { textAlign: 'center', fontSize: 10, fontWeight: '700', marginTop: 25, opacity: 0.5 }
});

export default Profile;