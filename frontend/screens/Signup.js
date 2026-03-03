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

// Custom Components & Context
import GlassCard from '../components/GlassCard';
import { useTheme } from '../context/ThemeContext';
import API from '../services/api';

const { width } = Dimensions.get('window');

const Signup = ({ navigation }) => {
    const { colors, isDark } = useTheme();
    
    // Form State
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [focusedInput, setFocusedInput] = useState(null);

    const handleSignup = async () => {
        // 1. Validation
        if (!email.trim() || !password.trim() || !username.trim()) {
            Alert.alert("Missing Info", "Please fill in all fields to create your Echo.");
            return;
        }

        if (password.length < 6) {
            Alert.alert("Security", "Password should be at least 6 characters.");
            return;
        }

        setLoading(true);
        try {
            // 2. API Call
            await API.post('/users/register', { 
                username: username.trim(), 
                email: email.toLowerCase().trim(), 
                password 
            });

            // 3. Success Feedback
            Alert.alert(
                "Welcome!", 
                "Account created successfully. Please login to continue.",
                [{ text: "OK", onPress: () => navigation.navigate('Login') }]
            );
        } catch (error) {
            const message = error.response?.data?.message || "Something went wrong during signup.";
            Alert.alert("Signup Failed", message);
        } finally {
            setLoading(false);
        }
    };

    // Dynamic style helper
    const getInputBorder = (name) => ({
        borderColor: focusedInput === name ? colors.primary : colors.glassBorder,
        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
    });

    return (
        <View style={styles.container}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <LinearGradient colors={colors.background} style={StyleSheet.absoluteFill} />
            
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                style={styles.flex}
            >
                <View style={styles.inner}>
                    {/* Back Button */}
                    <TouchableOpacity 
                        style={[styles.backBtn, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]} 
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={22} color={colors.textMain} />
                    </TouchableOpacity>

                    <View style={styles.headerArea}>
                        <Text style={[styles.title, { color: colors.textMain }]}>Create Echo</Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            Begin your emotional resonance
                        </Text>
                    </View>

                    <GlassCard style={[styles.authCard, { 
                        backgroundColor: colors.glass, 
                        borderColor: colors.glassBorder 
                    }]}>
                        {/* Username Input */}
                        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Username</Text>
                        <View style={[styles.inputWrapper, getInputBorder('username')]}>
                            <Ionicons name="person-outline" size={20} color={focusedInput === 'username' ? colors.primary : colors.textSecondary} style={styles.inputIcon} />
                            <TextInput 
                                placeholder="Display name"
                                placeholderTextColor={isDark ? '#94A3B880' : '#64748B80'}
                                style={[styles.input, { color: colors.textMain }]}
                                value={username}
                                onChangeText={setUsername}
                                onFocus={() => setFocusedInput('username')}
                                onBlur={() => setFocusedInput(null)}
                                editable={!loading}
                            />
                        </View>

                        {/* Email Input */}
                        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Email</Text>
                        <View style={[styles.inputWrapper, getInputBorder('email')]}>
                            <Ionicons name="mail-outline" size={20} color={focusedInput === 'email' ? colors.primary : colors.textSecondary} style={styles.inputIcon} />
                            <TextInput 
                                placeholder="email@address.com"
                                placeholderTextColor={isDark ? '#94A3B880' : '#64748B80'}
                                style={[styles.input, { color: colors.textMain }]}
                                value={email}
                                onChangeText={setEmail}
                                onFocus={() => setFocusedInput('email')}
                                onBlur={() => setFocusedInput(null)}
                                autoCapitalize="none"
                                keyboardType="email-address"
                                editable={!loading}
                            />
                        </View>

                        {/* Password Input */}
                        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Password</Text>
                        <View style={[styles.inputWrapper, getInputBorder('password')]}>
                            <Ionicons name="lock-closed-outline" size={20} color={focusedInput === 'password' ? colors.primary : colors.textSecondary} style={styles.inputIcon} />
                            <TextInput 
                                placeholder="••••••••"
                                placeholderTextColor={isDark ? '#94A3B880' : '#64748B80'}
                                style={[styles.input, { color: colors.textMain }]}
                                value={password}
                                onChangeText={setPassword}
                                onFocus={() => setFocusedInput('password')}
                                onBlur={() => setFocusedInput(null)}
                                secureTextEntry={!showPassword}
                                editable={!loading}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity 
                            style={[
                                styles.signupBtn, 
                                { backgroundColor: colors.primary, shadowColor: colors.primary, opacity: loading ? 0.8 : 1 }
                            ]}
                            onPress={handleSignup}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <Text style={styles.signupBtnText}>Get Started</Text>
                            )}
                        </TouchableOpacity>
                    </GlassCard>

                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                            Already a member?{' '}
                        </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={[styles.loginLink, { color: colors.primary }]}>Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

export default Signup;

const styles = StyleSheet.create({
    container: { flex: 1 },
    flex: { flex: 1 },
    inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 28 },
    backBtn: { 
        position: 'absolute', 
        top: 50, 
        left: 20, 
        width: 45, 
        height: 45, 
        borderRadius: 15, 
        justifyContent: 'center', 
        alignItems: 'center', 
        borderWidth: 1 
    },
    headerArea: { marginBottom: 35 },
    title: { fontSize: 34, fontWeight: '900', letterSpacing: -1 },
    subtitle: { fontSize: 16, marginTop: 4, opacity: 0.7 },
    authCard: { padding: 24, borderRadius: 30, borderWidth: 1 },
    inputLabel: { fontSize: 13, fontWeight: '700', marginBottom: 8, marginLeft: 4, textTransform: 'uppercase', opacity: 0.6 },
    inputWrapper: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        borderRadius: 16, 
        paddingHorizontal: 15, 
        marginBottom: 20, 
        height: 58, 
        borderWidth: 1.5 
    },
    inputIcon: { marginRight: 12 },
    input: { flex: 1, fontSize: 16, fontWeight: '600' },
    signupBtn: { 
        height: 58, 
        borderRadius: 18, 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginTop: 10, 
        shadowOpacity: 0.3, 
        shadowRadius: 10, 
        shadowOffset: { width: 0, height: 5 },
        elevation: 5
    },
    signupBtnText: { color: '#FFF', fontSize: 18, fontWeight: '800' },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
    footerText: { fontSize: 15, fontWeight: '600' },
    loginLink: { fontSize: 15, fontWeight: '800' }
});