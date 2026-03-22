import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Modern Expo 54+ FileSystem API
import { Directory, File, cacheDirectory, documentDirectory } from 'expo-file-system';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Network from 'expo-network';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../context/ThemeContext';
import { logout, updatePrivacy } from '../../redux/authSlice';
import API, { fullDeleteAccount } from '../../services/api';


const PrivacySecurity = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // --- Core States ---
  const [biometrics, setBiometrics] = useState(false);
  const [twoFactor, setTwoFactor] = useState(user?.twoFactorEnabled || false);
  const [profileVisible, setProfileVisible] = useState(user?.isPublic ?? true);
  const [isModalVisible, setModalVisible] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // --- Data Usage States ---
  const [isUsageModalVisible, setUsageModalVisible] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [storageStats, setStorageStats] = useState({ total: '0 B', cache: '0 B', docs: '0 B' });
  const [networkInfo, setNetworkInfo] = useState({ type: 'Unknown', isConnected: false });

  // --- Delete Account States ---
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
const [isPrivacyLoading, setIsPrivacyLoading] = useState(false);
  
useEffect(() => {
    if (user?.email) {
      checkInitialStatus();
    }
  }, [user?.email]);
  useEffect(() => {
    if (user?.isPublic !== undefined) {
      setProfileVisible(user.isPublic);
    }
  }, [user?.isPublic]);
  
  const getBioKey = () => {
    if (!user?.email) return "";
    const sanitizedEmail = user.email.toLowerCase().trim().replace(/[^a-zA-Z0-9._-]/g, '_');
    return `user_credentials_${sanitizedEmail}`;
  };

  const checkInitialStatus = async () => {
    try {
      const key = getBioKey();
      if (!key) return;
      const saved = await SecureStore.getItemAsync(key);
      setBiometrics(!!saved);
      const saved2FA = await AsyncStorage.getItem(`2fa_enabled_${user?.email}`);
      setTwoFactor(saved2FA !== null ? saved2FA === 'true' : user?.twoFactorEnabled || false);
    } catch (error) {
      console.error("Status check error:", error);
    }
  };

  // --- Logic: Modern Data Usage ---
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Modern recursive directory sizing
  const calculateDirectorySize = async (uri) => {
    let totalSize = 0;
    const dir = new Directory(uri);

    if (!dir.exists) return 0;

    const contents = dir.list();
    for (const item of contents) {
      if (item instanceof File) {
        totalSize += item.size;
      } else if (item instanceof Directory) {
        totalSize += await calculateDirectorySize(item.uri);
      }
    }
    return totalSize;
  };

  const handleFetchUsage = async () => {
    setIsCalculating(true);
    try {
      // Using new modern API constants
      const cacheSize = await calculateDirectorySize(cacheDirectory);
      const docSize = await calculateDirectorySize(documentDirectory);
      const net = await Network.getNetworkStateAsync();

      setStorageStats({
        total: formatBytes(cacheSize + docSize),
        cache: formatBytes(cacheSize),
        docs: formatBytes(docSize)
      });
      setNetworkInfo({
        type: net.type,
        isConnected: net.isConnected
      });
      setUsageModalVisible(true);
    } catch (error) {
      Alert.alert("Error", "Could not calculate storage usage.");
    } finally {
      setIsCalculating(false);
    }
  };

  const handleClearCache = async () => {
    try {
      const cacheDir = new Directory(cacheDirectory);
      const contents = cacheDir.list();
      for (const item of contents) {
        item.delete(); // Modern delete method
      }
      Alert.alert("Success", "Temporary cache cleared.");
      handleFetchUsage();
    } catch (e) {
      Alert.alert("Error", "Failed to clear cache.");
    }
  };

  // --- Logic: Profile Visibility ---

 const handleProfileVisibility = async (value) => {
    setIsPrivacyLoading(true);  
    try {
        await updatePrivacyAPI({ isPublic: value });
        dispatch(updatePrivacy(value));
        setProfileVisible(value);
    } catch (error) {
        setProfileVisible(!value);
        Alert.alert("Error", "Could not save setting.");
    } finally {
        setIsPrivacyLoading(false);  
    }
};



  // --- Logic: Security ---
  const handleTogglePress = async (value) => {
    if (value) {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHardware || !isEnrolled) {
        return Alert.alert("Not Supported", "Please enable FaceID/Fingerprint in settings.");
      }
      setModalVisible(true);
    } else {
      await SecureStore.deleteItemAsync(getBioKey());
      setBiometrics(false);
    }
  };

  const handleTwoFactorToggle = async (value) => {
    try {
      setTwoFactor(value);
      await API.post('/users/update-security', { email: user.email, twoFactorEnabled: value });
      await AsyncStorage.setItem(`2fa_enabled_${user?.email}`, value.toString());
      dispatch({ type: 'UPDATE_USER_DATA', payload: { twoFactorEnabled: value } });
      Alert.alert("Security Updated", value ? "2FA Enabled" : "2FA Disabled");
    } catch (error) {
      setTwoFactor(!value);
      Alert.alert("Error", "Failed to update 2FA.");
    }
  };

  const verifyAndEnableBiometrics = async () => {
    if (!confirmPassword) return;
    setIsVerifying(true);
    try {
      const response = await API.post('/users/login', { email: user.email.toLowerCase().trim(), password: confirmPassword });
      if (response.data.token) {
        const auth = await LocalAuthentication.authenticateAsync({ promptMessage: 'Confirm Biometrics' });
        if (auth.success) {
          await SecureStore.setItemAsync(getBioKey(), JSON.stringify({ email: user.email, password: confirmPassword }));
          setBiometrics(true);
          setModalVisible(false);
          setConfirmPassword('');
          Alert.alert("Success", "Biometric login active.");
        }
      }
    } catch (err) {
      Alert.alert("Verification Failed", "Incorrect password.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePermanentDelete = async () => {
    if (deleteConfirmationText !== 'DELETE') return;
    const targetId = user?._id || user?.id;
    setIsDeleting(true);
    try {
      await fullDeleteAccount(targetId);
      await AsyncStorage.clear();
      setDeleteModalVisible(false);
      Alert.alert("Account Deleted", "Wiped.", [{ text: "Goodbye", onPress: () => dispatch(logout()) }]);
    } catch (error) {
      Alert.alert("Error", "Deletion failed.");
    } finally {
      setIsDeleting(false);
    }
  };

  const SettingItem = ({ icon, title, description, type, value, onValueChange, onPress, isDestructive, isLoading }) => (
    <TouchableOpacity
      style={[styles.item, { backgroundColor: colors.glass, borderColor: isDestructive ? '#EF4444' : colors.glassBorder }]}
      onPress={onPress}
      disabled={type === 'toggle' || isLoading}
    >
      <View style={styles.iconContainer}>
        {isLoading ? <ActivityIndicator size="small" color={colors.primary} /> : <Ionicons name={icon} size={22} color={isDestructive ? '#EF4444' : colors.primary} />}
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: isDestructive ? '#EF4444' : colors.textMain }]}>{title}</Text>
        {description && <Text style={[styles.description, { color: colors.textSecondary }]}>{description}</Text>}
      </View>
      {type === 'toggle' ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#767577', true: colors.primary }}
          thumbColor={isDark ? colors.accent : '#f4f3f4'}
        />
      ) : (
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background[0] }]}>
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textMain} />
        </TouchableOpacity>
        <View style={styles.titleContainer} pointerEvents="none">
          <Text style={[styles.navTitle, { color: colors.textMain }]}>Privacy & Security</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>SECURITY</Text>
          <SettingItem icon="finger-print-outline" title="Biometric Login" description="Use FaceID/Fingerprint" type="toggle" value={biometrics} onValueChange={handleTogglePress} />
          <SettingItem icon="shield-checkmark-outline" title="Two-Factor Auth" type="toggle" value={twoFactor} onValueChange={handleTwoFactorToggle} />
          <SettingItem icon="key-outline" title="Change Password" onPress={() => { }} />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>PRIVACY & DATA</Text>
          <SettingItem icon="eye-outline" title="Profile Visibility" description="Make profile searchable" type="toggle" value={profileVisible} onValueChange={handleProfileVisibility} isLoading={isPrivacyLoading}/>
          <SettingItem icon="document-text-outline" title="Data Usage" description="Manage app storage & cache" onPress={handleFetchUsage} isLoading={isCalculating} />
          <SettingItem icon="trash-outline" title="Delete Account" description="Permanently wipe data" isDestructive={true} onPress={() => setDeleteModalVisible(true)} />
        </View>
      </ScrollView>

      {/* --- DATA USAGE MODAL --- */}
      <Modal visible={isUsageModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1E293B' : '#FFF' }]}>
            <Ionicons name="stats-chart" size={40} color={colors.primary} style={{ marginBottom: 10 }} />
            <Text style={[styles.modalTitle, { color: colors.textMain }]}>Storage Usage</Text>
            <View style={styles.usageContainer}>
              <View style={styles.usageRow}><Text style={{ color: colors.textSecondary }}>Documents</Text><Text style={{ color: colors.textMain, fontWeight: '700' }}>{storageStats.docs}</Text></View>
              <View style={styles.usageRow}><Text style={{ color: colors.textSecondary }}>Cache</Text><Text style={{ color: colors.textMain, fontWeight: '700' }}>{storageStats.cache}</Text></View>
              <View style={[styles.usageRow, styles.usageTotal]}><Text style={{ color: colors.textMain, fontWeight: 'bold' }}>Total</Text><Text style={{ color: colors.primary, fontWeight: 'bold' }}>{storageStats.total}</Text></View>
            </View>
            <TouchableOpacity style={styles.clearCacheBtn} onPress={handleClearCache}><Text style={{ color: '#EF4444', fontWeight: '600' }}>Clear Cache</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.primary, width: '100%', marginTop: 15 }]} onPress={() => setUsageModalVisible(false)}><Text style={{ color: '#FFF', fontWeight: 'bold' }}>Close</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- PASSWORD MODAL --- */}
      <Modal visible={isModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1E293B' : '#FFF' }]}>
            <Text style={[styles.modalTitle, { color: colors.textMain }]}>Verification</Text>
            <TextInput style={[styles.modalInput, { color: colors.textMain, backgroundColor: isDark ? colors.glass : '#F3F3F3' }]} placeholder="Password" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalBtn} onPress={() => { setModalVisible(false); setConfirmPassword(''); }}><Text style={{ color: colors.textSecondary }}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.confirmBtn, { backgroundColor: colors.primary }]} onPress={verifyAndEnableBiometrics}>
                {isVerifying ? <ActivityIndicator color="#FFF" /> : <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Confirm</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- DELETE MODAL --- */}
      <Modal visible={isDeleteModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1E293B' : '#FFF', borderColor: '#EF4444', borderWidth: 1 }]}>
            <Ionicons name="warning" size={40} color="#EF4444" />
            <Text style={[styles.modalTitle, { color: '#EF4444' }]}>Dangerous Action</Text>
            <TextInput style={[styles.modalInput, { color: '#EF4444', textAlign: 'center', backgroundColor: isDark ? colors.glass : '#F3F3F3' }]} placeholder="DELETE" autoCapitalize="characters" value={deleteConfirmationText} onChangeText={setDeleteConfirmationText} />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalBtn} onPress={() => setDeleteModalVisible(false)}><Text style={{ color: colors.textSecondary }}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.confirmBtn, { backgroundColor: deleteConfirmationText === 'DELETE' ? '#EF4444' : '#767577' }]} onPress={handlePermanentDelete} disabled={deleteConfirmationText !== 'DELETE' || isDeleting}>
                {isDeleting ? <ActivityIndicator color="#FFF" /> : <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Wipe All</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  navBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, height: 60 },
  backButton: { zIndex: 10 },
  titleContainer: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  navTitle: { fontSize: 18, fontWeight: '700' },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 12, fontWeight: '700', marginBottom: 10, marginLeft: 5 },
  item: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
  iconContainer: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  textContainer: { flex: 1, marginLeft: 12 },
  title: { fontSize: 16, fontWeight: '600' },
  description: { fontSize: 12, marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', padding: 25, borderRadius: 24, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15 },
  modalInput: { width: '100%', height: 50, borderRadius: 12, paddingHorizontal: 15, marginBottom: 15 },
  modalButtons: { flexDirection: 'row', width: '100%' },
  modalBtn: { flex: 1, height: 48, justifyContent: 'center', alignItems: 'center', borderRadius: 12 },
  confirmBtn: { marginLeft: 10 },
  usageContainer: { width: '100%', marginVertical: 10 },
  usageRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 5 },
  usageTotal: { borderTopWidth: 1, borderTopColor: 'rgba(150,150,150,0.2)', marginTop: 8, paddingTop: 8 },
  clearCacheBtn: { marginVertical: 10, padding: 10 }
});

export default PrivacySecurity;