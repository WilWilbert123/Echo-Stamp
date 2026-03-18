import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
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
import API from '../../services/api';

const PrivacySecurity = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [biometrics, setBiometrics] = useState(false);
  const [twoFactor, setTwoFactor] = useState(user?.twoFactorEnabled || false);

  const [isModalVisible, setModalVisible] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // --- NEW: Delete Account States ---
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const getBioKey = () => {
    if (!user?.email) return "";
    const sanitizedEmail = user.email.toLowerCase().trim().replace(/[^a-zA-Z0-9._-]/g, '_');
    return `user_credentials_${sanitizedEmail}`;
  };

  useEffect(() => {
    if (user?.email) {
      checkInitialStatus();
    }
  }, [user?.email]);

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

  const handleTogglePress = async (value) => {
    if (value) {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHardware || !isEnrolled) {
        return Alert.alert("Not Supported", "Please enable FaceID/Fingerprint in your device settings first.");
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
      Alert.alert("Security Updated", value ? "Two-Factor Auth is now ENABLED." : "Two-Factor Auth is now DISABLED.");
    } catch (error) {
      setTwoFactor(!value);
      Alert.alert("Error", "Could not update security settings.");
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
          Alert.alert("Success", "Biometric login is now active.");
        }
      }
    } catch (err) {
      Alert.alert("Verification Failed", "Incorrect password.");
    } finally {
      setIsVerifying(false);
    }
  };

  // --- NEW: Delete Account Logic ---
  const handlePermanentDelete = async () => {
    if (deleteConfirmationText !== 'DELETE') return;
    setIsDeleting(true);
    try {
      await API.delete(`/users/${user._id}/full-delete`);
      
      // Clear all local storage
      await AsyncStorage.clear();
      await SecureStore.deleteItemAsync(getBioKey());
      
      setDeleteModalVisible(false);
      Alert.alert("Account Deleted", "Your data has been permanently wiped from Echo Stamp.", [
        { text: "Goodbye", onPress: () => dispatch({ type: 'LOGOUT' }) }
      ]);
    } catch (error) {
      Alert.alert("Error", "Could not complete account deletion. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const SettingItem = ({ icon, title, description, type, value, onValueChange, onPress, isDestructive }) => (
    <TouchableOpacity
      style={[styles.item, { backgroundColor: colors.glass, borderColor: isDestructive ? '#EF4444' : colors.glassBorder }]}
      onPress={onPress}
      disabled={type === 'toggle'}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={22} color={isDestructive ? '#EF4444' : colors.primary} />
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

  const handleChangePassword = async () => {
    Alert.alert("Security Check", "We need to verify your email before you can change your password.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Send Code",
        onPress: async () => {
          try {
            await API.post('/users/forgot-password', { email: user.email.toLowerCase().trim() });
            navigation.navigate('SecurityOtpVerify', { email: user.email, mode: 'reset' });
          } catch (err) { Alert.alert("Error", "Could not send code."); }
        }
      }
    ]);
  };

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
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>SECURITY PREFERENCES</Text>
          <SettingItem icon="finger-print-outline" title="Biometric Login" description="Use FaceID or Fingerprint" type="toggle" value={biometrics} onValueChange={handleTogglePress} />
          <SettingItem icon="shield-checkmark-outline" title="Two-Factor Auth" description="Secure your account with 2FA" type="toggle" value={twoFactor} onValueChange={handleTwoFactorToggle} />
          <SettingItem icon="key-outline" title="Change Password" description="Update your account password" onPress={handleChangePassword} />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>PRIVACY</Text>
          <SettingItem icon="eye-off-outline" title="Profile Visibility" onPress={() => { }} />
          <SettingItem icon="document-text-outline" title="Data Usage" onPress={() => { }} />
          <SettingItem
            icon="trash-outline"
            title="Delete Account"
            description="Permanently wipe all your data"
            isDestructive={true}
            onPress={() => setDeleteModalVisible(true)}
          />
        </View>
      </ScrollView>

      {/* --- PASSWORD MODAL (BIOMETRICS) --- */}
      <Modal visible={isModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1E293B' : '#FFF' }]}>
            <Text style={[styles.modalTitle, { color: colors.textMain }]}>Enable Biometrics</Text>
            <Text style={[styles.modalSub, { color: colors.textSecondary }]}>Enter password to link your account</Text>
            <TextInput
              style={[styles.modalInput, { color: colors.textMain, backgroundColor: isDark ? colors.glass : '#F3F3F3' }]}
              placeholder="Password"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalBtn} onPress={() => { setModalVisible(false); setConfirmPassword(''); }}>
                <Text style={{ color: colors.textSecondary }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.confirmBtn, { backgroundColor: colors.primary }]} onPress={verifyAndEnableBiometrics}>
                {isVerifying ? <ActivityIndicator color="#FFF" /> : <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Confirm</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- NEW: DELETE ACCOUNT MODAL --- */}
      <Modal visible={isDeleteModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1E293B' : '#FFF', borderColor: '#EF4444', borderWidth: 1 }]}>
            <View style={styles.warningIcon}>
              <Ionicons name="warning" size={40} color="#EF4444" />
            </View>
            <Text style={[styles.modalTitle, { color: '#EF4444' }]}>Dangerous Action</Text>
            <Text style={[styles.modalSub, { color: colors.textSecondary }]}>
              This will wipe your account, all journals, and all Cloudinary media. This cannot be undone.
            </Text>
            <Text style={{ fontSize: 13, color: colors.textMain, marginBottom: 10, fontWeight: '600' }}>
              Type "DELETE" to confirm:
            </Text>
            <TextInput
              style={[styles.modalInput, { color: '#EF4444', fontWeight: 'bold', textAlign: 'center', backgroundColor: isDark ? colors.glass : '#F3F3F3', borderColor: deleteConfirmationText === 'DELETE' ? '#EF4444' : 'transparent', borderWidth: 1 }]}
              placeholder="Type DELETE"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="characters"
              value={deleteConfirmationText}
              onChangeText={setDeleteConfirmationText}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalBtn} 
                onPress={() => { setDeleteModalVisible(false); setDeleteConfirmationText(''); }}
                disabled={isDeleting}
              >
                <Text style={{ color: colors.textSecondary }}>Keep Account</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.modalBtn, 
                  styles.confirmBtn, 
                  { backgroundColor: deleteConfirmationText === 'DELETE' ? '#EF4444' : '#767577' }
                ]} 
                onPress={handlePermanentDelete}
                disabled={deleteConfirmationText !== 'DELETE' || isDeleting}
              >
                {isDeleting ? <ActivityIndicator color="#FFF" /> : <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Wipe Everything</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 20 },
  navBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, height: 50, width: '100%' },
  backButton: { zIndex: 10 },
  titleContainer: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  navTitle: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  content: { paddingTop: 15, paddingHorizontal: 20, paddingBottom: 40 },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 1.2, marginBottom: 12, marginLeft: 4 },
  item: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 10 },
  iconContainer: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  textContainer: { flex: 1, marginLeft: 12 },
  title: { fontSize: 16, fontWeight: '600' },
  description: { fontSize: 12, marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', padding: 25, borderRadius: 24, alignItems: 'center' },
  warningIcon: { marginBottom: 10 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  modalSub: { fontSize: 14, textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  modalInput: { width: '100%', height: 50, borderRadius: 12, paddingHorizontal: 15, marginBottom: 20 },
  modalButtons: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
  modalBtn: { flex: 1, height: 45, justifyContent: 'center', alignItems: 'center', borderRadius: 10 },
  confirmBtn: { marginLeft: 10 }
});

export default PrivacySecurity;