import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
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

// Custom Components & Context
import GlassCard from '../components/GlassCard';
import { useTheme } from '../context/ThemeContext';
import { setCredentials } from '../redux/authSlice';
import API from '../services/api';

const { width, height } = Dimensions.get('window');

const Login = ({ navigation }) => {
    const { colors, isDark } = useTheme();
    const dispatch = useDispatch();

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [focusedInput, setFocusedInput] = useState(null); // 'email' or 'password'

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            return Alert.alert("Required", "Please enter both email and password.");
        }

        setLoading(true);
        try {
            const response = await API.post('/users/login', {
                email: email.toLowerCase().trim(),
                password
            });

            dispatch(setCredentials(response.data));
            // Navigation usually happens automatically if your App.js listens to the Redux state
        } catch (error) {
            const message = error.response?.data?.error || "Invalid credentials. Please try again.";
            Alert.alert("Login Failed", message);
        } finally {
            setLoading(false);
        }
    };

    // Helper to get dynamic border color for inputs
    const getBorderColor = (inputName) => {
        if (focusedInput === inputName) return colors.primary;
        return colors.glassBorder;
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            
            <LinearGradient 
                colors={isDark ? ['#0F172A', '#1E293B', '#0F172A'] : colors.background} 
                style={StyleSheet.absoluteFill} 
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.inner}>
                    {/* Top Branding Section */}
                    <View style={styles.headerContainer}>
                        <View style={[styles.logoGlow, { backgroundColor: colors.primary, shadowColor: colors.primary }]} />
                        <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
                            <Ionicons name="infinite" size={48} color="#FFF" />
                        </View>
                        <Text style={[styles.greeting, { color: colors.textMain }]}>Welcome Back</Text>
                        <Text style={[styles.subGreeting, { color: colors.textSecondary }]}>
                            Log in to sync your emotional echoes
                        </Text>
                    </View>

                    {/* Auth Card */}
                    <GlassCard style={[styles.card, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                        
                        {/* Email Field */}
                        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Email Address</Text>
                        <View style={[styles.inputContainer, { borderColor: getBorderColor('email'), backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)' }]}>
                            <Ionicons name="mail-outline" size={20} color={focusedInput === 'email' ? colors.primary : colors.textSecondary} />
                            <TextInput
                                style={[styles.input, { color: colors.textMain }]}
                                placeholder="name@example.com"
                                placeholderTextColor={isDark ? '#475569' : '#94A3B8'}
                                value={email}
                                onChangeText={setEmail}
                                onFocus={() => setFocusedInput('email')}
                                onBlur={() => setFocusedInput(null)}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                editable={!loading}
                            />
                        </View>

                        {/* Password Field */}
                        <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 15 }]}>Password</Text>
                        <View style={[styles.inputContainer, { borderColor: getBorderColor('password'), backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)' }]}>
                            <Ionicons name="lock-closed-outline" size={20} color={focusedInput === 'password' ? colors.primary : colors.textSecondary} />
                            <TextInput
                                style={[styles.input, { color: colors.textMain }]}
                                placeholder="••••••••"
                                placeholderTextColor={isDark ? '#475569' : '#94A3B8'}
                                value={password}
                                onChangeText={setPassword}
                                onFocus={() => setFocusedInput('password')}
                                onBlur={() => setFocusedInput(null)}
                                secureTextEntry={!showPassword}
                                editable={!loading}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons 
                                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                                    size={20} 
                                    color={colors.textSecondary} 
                                />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.forgotPassContainer}>
                            <Text style={[styles.forgotPassText, { color: colors.primary }]}>Forgot Password?</Text>
                        </TouchableOpacity>

                        {/* Login Button */}
                        <TouchableOpacity
                            onPress={handleLogin}
                            disabled={loading}
                            activeOpacity={0.85}
                            style={[styles.button, { backgroundColor: colors.primary, shadowColor: colors.primary }]}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <View style={styles.buttonContent}>
                                    <Text style={styles.buttonText}>Sign In</Text>
                                    <Ionicons name="arrow-forward" size={20} color="#FFF" style={{ marginLeft: 8 }} />
                                </View>
                            )}
                        </TouchableOpacity>
                    </GlassCard>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                            New to Echo?{' '}
                        </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                            <Text style={[styles.linkText, { color: colors.primary }]}>Create Account</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

export default Login;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    inner: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoCircle: {
        width: 90,
        height: 90,
        borderRadius: 45,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    logoGlow: {
        position: 'absolute',
        width: 70,
        height: 70,
        borderRadius: 35,
        top: 10,
        opacity: 0.5,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 20,
    },
    greeting: {
        fontSize: 32,
        fontWeight: '800',
        marginTop: 20,
        letterSpacing: -0.5,
    },
    subGreeting: {
        fontSize: 16,
        marginTop: 8,
        textAlign: 'center',
        opacity: 0.8,
    },
    card: {
        padding: 24,
        borderRadius: 32,
        borderWidth: 1,
        width: '100%',
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 8,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 60,
        borderRadius: 16,
        borderWidth: 1.5,
        paddingHorizontal: 16,
    },
    input: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 12,
    },
    forgotPassContainer: {
        alignSelf: 'flex-end',
        marginTop: 12,
        marginBottom: 24,
    },
    forgotPassText: {
        fontSize: 14,
        fontWeight: '700',
    },
    button: {
        height: 60,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '800',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 32,
    },
    footerText: {
        fontSize: 15,
        fontWeight: '600',
    },
    linkText: {
        fontSize: 15,
        fontWeight: '800',
    },
});