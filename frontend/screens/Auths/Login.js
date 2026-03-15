import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useDispatch } from 'react-redux';

// --- BIOMETRIC IMPORTS ---
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

import { useTheme } from '../../context/ThemeContext';
import { setCredentials } from '../../redux/authSlice';
import API from '../../services/api';

const Login = ({ navigation }) => {
    const { colors, isDark } = useTheme();
    const dispatch = useDispatch();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    
    // --- BIOMETRIC STATE ---
    const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);

    // --- FIXED: Helper to sanitize email for SecureStore (No "@" allowed) ---
    const getBioKey = (targetEmail) => {
        if (!targetEmail) return "";
        const sanitized = targetEmail.toLowerCase().trim().replace(/[^a-zA-Z0-9._-]/g, '_');
        return `user_credentials_${sanitized}`;
    };

    // Re-check biometrics whenever the email text changes
    useEffect(() => {
        checkBiometrics();
    }, [email]);

    const checkBiometrics = async () => {
        // Only check if email has at least an '@' to avoid premature SecureStore calls
        if (!email.trim() || !email.includes('@')) {
            setIsBiometricAvailable(false);
            return;
        }

        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            
            // Check for the specific key belonging to the typed email
            const key = getBioKey(email);
            const savedCreds = await SecureStore.getItemAsync(key);
            
            if (hasHardware && isEnrolled && savedCreds) {
                setIsBiometricAvailable(true);
            } else {
                setIsBiometricAvailable(false);
            }
        } catch (error) {
            setIsBiometricAvailable(false);
        }
    };

    const handleBiometricLogin = async () => {
        try {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: `Login to ${email}`,
                fallbackLabel: 'Use Password',
                disableDeviceFallback: false,
            });

            if (result.success) {
                const key = getBioKey(email);
                const savedCreds = await SecureStore.getItemAsync(key);
                if (savedCreds) {
                    const { email: storedEmail, password: storedPassword } = JSON.parse(savedCreds);
                    performLogin(storedEmail, storedPassword);
                }
            }
        } catch (error) {
            Alert.alert("Error", "Biometric authentication failed");
        }
    };

    const handleLogin = () => {
        if (!email.trim() || !password.trim()) {
            return Alert.alert("Error", "Please fill in all fields");
        }
        performLogin(email.toLowerCase().trim(), password);
    };

    const performLogin = async (loginEmail, loginPassword) => {
        setLoading(true);
        try {
            const response = await API.post('/users/login', {
                email: loginEmail,
                password: loginPassword
            });

            // --- TWO FACTOR CHECK ---
            if (response.data.twoFactorRequired) {
                navigation.navigate('OtpVerification', { 
                    email: loginEmail,
                    mode: '2fa_login' 
                });
            } else {
                // Regular Login flow
                dispatch(setCredentials(response.data));
            }

        } catch (error) {
            Alert.alert("Login Failed", error.response?.data?.error || "Check your credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background[0] }]}>
            <StatusBar barStyle={colors.status} />

            <View style={[styles.headerBackground, { backgroundColor: colors.background[0] }]}>
                <View style={[styles.blueWave, { backgroundColor: colors.primary, opacity: isDark ? 0.4 : 1 }]} />
                <View style={[styles.darkWave, { backgroundColor: isDark ? '#1E293B' : '#637D8B', opacity: 0.6 }]} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.flex}
            >
                <View style={styles.inner}>
                    <View style={styles.logoContainer}>
                        <Text style={[styles.logoText, { color: colors.primary }]}>ECHO</Text>
                        <Text style={[styles.welcomeTitle, { color: colors.textMain }]}>Welcome back!</Text>
                    </View>

                    <View style={styles.inputArea}>
                        <View style={[styles.inputWrapper, { backgroundColor: isDark ? colors.glass : '#F3F3F3', borderColor: colors.glassBorder, borderWidth: isDark ? 1 : 0 }]}>
                            <Ionicons name="person-outline" size={20} color={colors.textSecondary} />
                            <TextInput
                                placeholder="Username/Email"
                                placeholderTextColor={isDark ? '#64748B' : '#999'}
                                style={[styles.input, { color: colors.textMain }]}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={[styles.inputWrapper, { backgroundColor: isDark ? colors.glass : '#F3F3F3', borderColor: colors.glassBorder, borderWidth: isDark ? 1 : 0 }]}>
                            <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />
                            <TextInput
                                placeholder="Password"
                                placeholderTextColor={isDark ? '#64748B' : '#999'}
                                style={[styles.input, { color: colors.textMain }]}
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.forgotBtn}
                            activeOpacity={0.7}
                            onPress={() => navigation.navigate('ForgotPassword')} 
                        >
                            <Text style={[styles.forgotText, { color: colors.textSecondary }]}>Forgot Password?</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.actionRow}>
                        <TouchableOpacity
                            style={[styles.loginBtn, { flex: isBiometricAvailable ? 0.82 : 1 }]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            <LinearGradient
                                colors={isDark ? [colors.primary, '#0369A1'] : ['#8ECCE3', '#6AB8D2']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.gradientBtn}
                            >
                                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.loginBtnText}>LOG IN</Text>}
                            </LinearGradient>
                        </TouchableOpacity>

                        {isBiometricAvailable && (
                            <TouchableOpacity 
                                style={[styles.biometricBtn, { backgroundColor: isDark ? colors.glass : '#F3F3F3', borderColor: colors.glassBorder }]} 
                                onPress={handleBiometricLogin}
                            >
                                <Ionicons name="finger-print" size={28} color={colors.primary} />
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.socialSection}>
                        <Text style={[styles.socialText, { color: colors.textSecondary }]}>Or sign up using</Text>
                        <View style={styles.socialIcons}>
                            <TouchableOpacity style={[styles.iconCircle, { backgroundColor: isDark ? colors.glass : '#FFF' }]}>
                                <FontAwesome5 name="facebook-f" size={20} color="#1877F2" />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.iconCircle, { backgroundColor: isDark ? colors.glass : '#FFF' }]}>
                                <FontAwesome5 name="google" size={20} color="#EA4335" />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.iconCircle, { backgroundColor: isDark ? colors.glass : '#FFF' }]}>
                                <FontAwesome5 name="apple" size={20} color={isDark ? "#FFF" : "#000"} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.footer}
                        onPress={() => navigation.navigate('Signup')}
                    >
                        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                            Don't have an account? <Text style={[styles.signUpText, { color: colors.primary }]}>Sign Up</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    flex: { flex: 1 },
    headerBackground: { position: 'absolute', top: 0, width: '100%', height: '25%' },
    blueWave: { position: 'absolute', top: -50, right: -50, width: '120%', height: '80%', borderBottomLeftRadius: 300, transform: [{ rotate: '-10deg' }] },
    darkWave: { position: 'absolute', top: -30, right: -80, width: '80%', height: '70%', borderBottomLeftRadius: 200, transform: [{ rotate: '-5deg' }] },
    inner: { flex: 1, paddingHorizontal: 35, justifyContent: 'center', paddingTop: 80 },
    logoContainer: { alignItems: 'center', marginBottom: 40 },
    logoText: { fontSize: 50, fontWeight: '200', letterSpacing: 5, marginBottom: 10 },
    welcomeTitle: { fontSize: 22, fontWeight: 'bold' },
    inputArea: { marginBottom: 20 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 15, height: 55, marginBottom: 15 },
    input: { flex: 1, marginLeft: 10, fontSize: 14 },
    forgotBtn: { alignSelf: 'flex-end' },
    forgotText: { fontSize: 13, fontWeight: '500' },
    actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 },
    loginBtn: { height: 55, borderRadius: 12, overflow: 'hidden', elevation: 4 },
    biometricBtn: { width: 55, height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, elevation: 2 },
    gradientBtn: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loginBtnText: { color: '#FFF', fontWeight: '800', fontSize: 15, letterSpacing: 1 },
    socialSection: { alignItems: 'center', marginTop: 40 },
    socialText: { fontSize: 13, marginBottom: 20, fontWeight: '500' },
    socialIcons: { flexDirection: 'row', justifyContent: 'space-around', width: '70%' },
    iconCircle: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    footer: { marginTop: 50, alignItems: 'center' },
    footerText: { fontSize: 14 },
    signUpText: { fontWeight: 'bold' },
});

export default Login;