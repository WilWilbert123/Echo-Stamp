import { Ionicons } from '@expo/vector-icons';
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
    const [showPassword, setShowPassword] = useState(false);
    const getBioKey = (targetEmail) => {
        if (!targetEmail) return "";
        const sanitized = targetEmail.toLowerCase().trim().replace(/[^a-zA-Z0-9._-]/g, '_');
        return `user_credentials_${sanitized}`;
    };

    useEffect(() => {
        checkBiometrics();
    }, [email]);

    const checkBiometrics = async () => {
        if (!email.trim() || !email.includes('@')) {
            setIsBiometricAvailable(false);
            return;
        }
        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
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

            if (response.data.twoFactorRequired) {
                navigation.navigate('OtpVerification', {
                    email: loginEmail,
                    mode: '2fa_login'
                });
            } else {
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

            {/* Header remains unchanged as requested */}
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

                    {/* ENHANCED FORM CARD */}
                    <View style={[styles.formCard, {
                        backgroundColor: isDark ? 'rgba(30, 41, 59, 0.7)' : '#FFFFFF',
                        shadowColor: isDark ? '#000' : '#64748B'
                    }]}>
                        <View style={styles.inputArea}>
                            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Email Address</Text>
                            <View style={[styles.inputWrapper, {
                                backgroundColor: isDark ? colors.glass : '#F8FAFC',
                                borderColor: isDark ? colors.glassBorder : '#E2E8F0'
                            }]}>
                                <Ionicons name="mail-outline" size={18} color={colors.primary} />
                                <TextInput
                                    placeholder="your@email.com"
                                    placeholderTextColor={isDark ? '#475569' : '#94A3B8'}
                                    style={[styles.input, { color: colors.textMain }]}
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                />
                            </View>

                            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Password</Text>
                            <View style={[styles.inputWrapper, {
                                backgroundColor: isDark ? colors.glass : '#F8FAFC',
                                borderColor: isDark ? colors.glassBorder : '#E2E8F0'
                            }]}>
                                <Ionicons name="lock-closed-outline" size={18} color={colors.primary} />
                                <TextInput
                                    placeholder="••••••••"
                                    placeholderTextColor={isDark ? '#475569' : '#94A3B8'}
                                    style={[styles.input, { color: colors.textMain }]}
                                    // CHANGE THIS LINE:
                                    secureTextEntry={!showPassword}
                                    value={password}
                                    onChangeText={setPassword}
                                />

                                {/* --- EYE ICON BUTTON --- */}
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Ionicons
                                        name={showPassword ? "eye-outline" : "eye-off-outline"}
                                        size={20}
                                        color={colors.textSecondary}
                                    />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={styles.forgotBtn}
                                activeOpacity={0.7}
                                onPress={() => navigation.navigate('ForgotPassword')}
                            >
                                <Text style={[styles.forgotText, { color: colors.primary }]}>Forgot Password?</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.actionRow}>
                            <TouchableOpacity
                                style={[styles.loginBtn, { flex: isBiometricAvailable ? 0.8 : 1 }]}
                                onPress={handleLogin}
                                disabled={loading}
                            >
                                <LinearGradient
                                    colors={isDark ? [colors.primary, '#0369A1'] : ['#47B5FF', '#06283D']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={styles.gradientBtn}
                                >
                                    {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.loginBtnText}>LOG IN</Text>}
                                </LinearGradient>
                            </TouchableOpacity>

                            {isBiometricAvailable && (
                                <TouchableOpacity
                                    style={[styles.biometricBtn, {
                                        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.5)' : '#F1F5F9',
                                        borderColor: isDark ? colors.glassBorder : '#E2E8F0'
                                    }]}
                                    onPress={handleBiometricLogin}
                                >
                                    <Ionicons name="finger-print" size={28} color={colors.primary} />
                                </TouchableOpacity>
                            )}
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
    headerBackground: { position: 'absolute', top: 0, width: '100%', height: '30%' },
    blueWave: { position: 'absolute', top: -50, right: -50, width: '120%', height: '85%', borderBottomLeftRadius: 300, transform: [{ rotate: '-10deg' }] },
    darkWave: { position: 'absolute', top: -30, right: -80, width: '80%', height: '75%', borderBottomLeftRadius: 200, transform: [{ rotate: '-5deg' }] },
    inner: { flex: 1, paddingHorizontal: 25, justifyContent: 'center', paddingTop: 60 },

    // Logo Section
    logoContainer: { alignItems: 'center', marginBottom: 30 },
    logoText: { fontSize: 48, fontWeight: '100', letterSpacing: 8, marginBottom: 5 },
    welcomeTitle: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
     

    // Form Card
    formCard: {
        borderRadius: 24,
        padding: 25,
        elevation: 8,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        borderWidth: Platform.OS === 'ios' ? 1 : 0,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    inputArea: { marginBottom: 10 },
    inputLabel: {
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 8,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 1
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 15,
        paddingHorizontal: 15,
        height: 58,
        marginBottom: 20,
        borderWidth: 1,
    },
    input: { flex: 1, marginLeft: 12, fontSize: 15, fontWeight: '500' },
    forgotBtn: { alignSelf: 'flex-end', marginTop: -5 },
    forgotText: { fontSize: 13, fontWeight: '700' },

    // Actions
    actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 25 },
    loginBtn: { height: 58, borderRadius: 16, overflow: 'hidden', elevation: 4 },
    biometricBtn: { width: 58, height: 58, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    gradientBtn: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loginBtnText: { color: '#FFF', fontWeight: '900', fontSize: 16, letterSpacing: 1.5 },

    footer: { marginTop: 30, alignItems: 'center' },
    footerText: { fontSize: 15, fontWeight: '500' },
    signUpText: { fontWeight: '800' },
});

export default Login;