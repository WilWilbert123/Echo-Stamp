import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
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

  // --- FIXED: Helper to sanitize key (Replacing "@" with "_" for SecureStore) ---
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

        // 1. Check Biometrics status using UNIQUE KEY
        const saved = await SecureStore.getItemAsync(key);
        setBiometrics(!!saved);

        // 2. Check 2FA Persistent status
        const saved2FA = await AsyncStorage.getItem(`2fa_enabled_${user?.email}`);
        if (saved2FA !== null) {
            setTwoFactor(saved2FA === 'true');
        } else {
            setTwoFactor(user?.twoFactorEnabled || false);
        }
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
      // Delete using UNIQUE KEY
      await SecureStore.deleteItemAsync(getBioKey());
      setBiometrics(false);
    }
  };

  const handleTwoFactorToggle = async (value) => {
    try {
      setTwoFactor(value);
      await API.post('/users/update-security', {
        email: user.email, 
        twoFactorEnabled: value
      });

      await AsyncStorage.setItem(`2fa_enabled_${user?.email}`, value.toString());

      dispatch({ 
        type: 'UPDATE_USER_DATA', 
        payload: { twoFactorEnabled: value } 
      });

      Alert.alert(
        "Security Updated", 
        value ? "Two-Factor Auth is now ENABLED." : "Two-Factor Auth is now DISABLED."
      );
    } catch (error) {
      setTwoFactor(!value);
      console.error("2FA Update Error:", error.response?.data);
      const msg = error.response?.data?.message || "Could not update security settings.";
      Alert.alert("Error", msg);
    }
  };

  const verifyAndEnableBiometrics = async () => {
    if (!confirmPassword) return;

    setIsVerifying(true);
    try {
      const response = await API.post('/users/login', {
        email: user.email.toLowerCase().trim(),
        password: confirmPassword,
      });

      if (response.data.token) {
        const auth = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Confirm Biometrics',
        });

        if (auth.success) {
          // Store using UNIQUE KEY
          await SecureStore.setItemAsync(getBioKey(), JSON.stringify({
            email: user.email,
            password: confirmPassword,
          }));
          setBiometrics(true);
          setModalVisible(false);
          setConfirmPassword('');
          Alert.alert("Success", "Biometric login is now active.");
        }
      }
    } catch (err) {
      Alert.alert("Verification Failed", "Incorrect password. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const SettingItem = ({ icon, title, description, type, value, onValueChange, onPress }) => (
    <TouchableOpacity
      style={[styles.item, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
      onPress={onPress}
      disabled={type === 'toggle'}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={22} color={colors.primary} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: colors.textMain }]}>{title}</Text>
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textMain} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.header, { color: colors.textMain }]}>Privacy & Security</Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>SECURITY PREFERENCES</Text>
          <SettingItem
            icon="finger-print-outline"
            title="Biometric Login"
            description="Use FaceID or Fingerprint"
            type="toggle"
            value={biometrics}
            onValueChange={handleTogglePress}
          />
          <SettingItem
            icon="shield-checkmark-outline"
            title="Two-Factor Auth"
            description="Secure your account with 2FA"
            type="toggle"
            value={twoFactor}
            onValueChange={handleTwoFactorToggle}
          />
          <SettingItem
            icon="key-outline"
            title="Change Password"
            onPress={() => {}}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>PRIVACY</Text>
          <SettingItem icon="eye-off-outline" title="Profile Visibility" onPress={() => {}} />
          <SettingItem icon="document-text-outline" title="Data Usage" onPress={() => {}} />
          <SettingItem
            icon="trash-outline"
            title="Delete Account"
            onPress={() => Alert.alert("Confirm", "Delete account?")}
          />
        </View>
      </ScrollView>

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
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalBtn} 
                onPress={() => { setModalVisible(false); setConfirmPassword(''); }}
              >
                <Text style={{ color: colors.textSecondary }}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalBtn, styles.confirmBtn, { backgroundColor: colors.primary }]} 
                onPress={verifyAndEnableBiometrics}
              >
                {isVerifying ? <ActivityIndicator color="#FFF" /> : <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Confirm</Text>}
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
  navBar: { paddingHorizontal: 20, paddingTop: 10, height: 50, justifyContent: 'center' },
  content: { paddingTop: 20, paddingHorizontal: 20, paddingBottom: 40 },
  header: { fontSize: 28, fontWeight: '800', marginBottom: 30, letterSpacing: -0.5 },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 1.2, marginBottom: 12, marginLeft: 4 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    elevation: 2
  },
  iconContainer: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  textContainer: { flex: 1, marginLeft: 12 },
  title: { fontSize: 16, fontWeight: '600' },
  description: { fontSize: 12, marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', padding: 25, borderRadius: 24, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  modalSub: { fontSize: 14, textAlign: 'center', marginBottom: 20 },
  modalInput: { width: '100%', height: 50, borderRadius: 12, paddingHorizontal: 15, marginBottom: 20 },
  modalButtons: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
  modalBtn: { flex: 1, height: 45, justifyContent: 'center', alignItems: 'center', borderRadius: 10 },
  confirmBtn: { marginLeft: 10 }
});

export default PrivacySecurity;