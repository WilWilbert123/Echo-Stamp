import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

const ForgotPassword = ({ navigation }) => {
    const { isDark, colors } = useTheme();
    const insets = useSafeAreaInsets();

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const handleResetPassword = async () => {
        if (!email.trim() || !email.includes('@')) {
            Alert.alert("Invalid Email", "Please enter a valid email address.");
            return;
        }

        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setIsSubmitted(true);
        }, 1500);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background[0] }]}>
            <StatusBar barStyle={colors.status} />

            {/* BRANDED WAVY HEADER */}
            <View style={[styles.headerBackground, { backgroundColor: colors.background[0] }]}>

                <View style={[styles.blueWave, { backgroundColor: colors.primary, opacity: isDark ? 0.4 : 1 }]} />
                <View style={[styles.darkWave, { backgroundColor: isDark ? '#1E293B' : '#637D8B', opacity: 0.6 }]} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={[styles.content, { paddingTop: insets.top + 10 }]}>

                    {/* Header Nav */}
                    <View style={styles.navHeader}>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => navigation.goBack()}
                            style={[styles.backButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
                        >
                            <Ionicons name="chevron-back" size={24} color={isDark ? '#FFF' : colors.primary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.titleSection}>
                        <Text style={[styles.mainTitle, { color: isDark ? '#FFF' : colors.primary }]}>
                            Reset Password
                        </Text>
                        <Text style={[styles.subtitle, { color: isDark ? 'rgba(255,255,255,0.7)' : colors.textSecondary }]}>
                            {isSubmitted
                                ? "Check your inbox for instructions."
                                : "Enter your email and we'll send you a link to get back into your account."}
                        </Text>
                    </View>

                    {/* Main Card */}
                    <View style={[styles.card, {
                        backgroundColor: isDark ? colors.glass : '#FFF',
                        borderColor: colors.glassBorder,
                        borderWidth: isDark ? 1 : 0
                    }]}>
                        {!isSubmitted ? (
                            <>
                                <View style={styles.inputContainer}>
                                    <Text style={[styles.label, { color: colors.textSecondary }]}>EMAIL ADDRESS</Text>
                                    <View style={[
                                        styles.inputWrapper,
                                        {
                                            backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : '#F1F5F9',
                                            borderColor: isFocused ? colors.primary : 'transparent',
                                            borderWidth: 1.5
                                        }
                                    ]}>
                                        <Ionicons
                                            name="mail-outline"
                                            size={20}
                                            color={isFocused ? colors.primary : colors.textSecondary}
                                            style={styles.inputIcon}
                                        />
                                        <TextInput
                                            style={[styles.input, { color: colors.textMain }]}
                                            placeholder="example@email.com"
                                            placeholderTextColor={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}
                                            value={email}
                                            onFocus={() => setIsFocused(true)}
                                            onBlur={() => setIsFocused(false)}
                                            onChangeText={setEmail}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                        />
                                    </View>
                                </View>

                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    style={styles.mainButton}
                                    onPress={handleResetPassword}
                                    disabled={loading}
                                >
                                    <LinearGradient
                                        colors={isDark ? [colors.primary, '#0369A1'] : ['#8ECCE3', '#6AB8D2']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.buttonGradient}
                                    >
                                        {loading ? (
                                            <ActivityIndicator color="#FFF" />
                                        ) : (
                                            <>
                                                <Text style={styles.buttonText}>Send Reset Link</Text>
                                                <Ionicons name="paper-plane" size={18} color="#FFF" />
                                            </>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <View style={styles.successWrapper}>
                                <View style={[styles.successIconBox, { backgroundColor: isDark ? 'rgba(56,189,248,0.1)' : 'rgba(36, 59, 85, 0.05)' }]}>
                                    <Ionicons name="checkmark-circle" size={80} color={colors.primary} />
                                </View>

                                <Text style={[styles.successTitle, { color: colors.textMain }]}>Email Sent!</Text>

                                <Text style={[styles.successDesc, { color: colors.textSecondary }]}>
                                    We've sent a recovery link to{"\n"}
                                    <Text style={{ color: colors.primary, fontWeight: '700' }}>{email}</Text>
                                </Text>

                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    style={[styles.lightButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(36, 59, 85, 0.05)' }]}
                                    onPress={() => navigation.navigate('Login')}
                                >
                                    <Text style={[styles.lightButtonText, { color: colors.primary }]}>Back to Login</Text>
                                    <Ionicons name="arrow-forward" size={18} color={colors.primary} />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {!isSubmitted && (
                        <TouchableOpacity
                            activeOpacity={0.7}
                            style={styles.footerLink}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={[styles.footerLinkText, { color: colors.textSecondary }]}>
                                Remembered it? <Text style={{ color: colors.primary, fontWeight: '800' }}>Log In</Text>
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    headerBackground: { position: 'absolute', top: 0, width: '100%', height: height * 0.25 },
    blueWave: { position: 'absolute', top: -50, right: -50, width: width * 1.2, height: height * 0.2, borderBottomLeftRadius: 300, transform: [{ rotate: '-10deg' }] },
    darkWave: { position: 'absolute', top: -30, right: -80, width: width * 0.8, height: height * 0.18, borderBottomLeftRadius: 200, transform: [{ rotate: '-5deg' }] },
    content: { flex: 1, paddingHorizontal: 25 },
    navHeader: { marginBottom: 15 },
    backButton: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
    titleSection: { marginBottom: 30 },
    mainTitle: { fontSize: 32, fontWeight: '900', marginBottom: 10 },
    subtitle: { fontSize: 15, lineHeight: 22, fontWeight: '500' },
    card: {
        padding: 24, borderRadius: 30,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20 },
            android: { elevation: 5 }
        })
    },
    inputContainer: { marginBottom: 20 },
    label: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginBottom: 10 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', borderRadius: 15, paddingHorizontal: 15, height: 55 },
    inputIcon: { marginRight: 12 },
    input: { flex: 1, fontSize: 16, fontWeight: '600' },
    mainButton: { height: 55, borderRadius: 15, overflow: 'hidden', marginTop: 10 },
    buttonGradient: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
    buttonText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
    successWrapper: { alignItems: 'center', paddingVertical: 10 },
    successIconBox: { width: 110, height: 110, borderRadius: 55, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
    successTitle: { fontSize: 26, fontWeight: '900', marginBottom: 10, letterSpacing: -0.5 },
    successDesc: { fontSize: 15, textAlign: 'center', marginBottom: 30, lineHeight: 22, opacity: 0.8 },
    lightButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, paddingHorizontal: 20, borderRadius: 18, width: '100%' },
    lightButtonText: { fontWeight: '800', fontSize: 16, letterSpacing: 0.5 },
    footerLink: { marginTop: 225, alignItems: 'center' },
    footerLinkText: { fontSize: 14, fontWeight: '600' },
});

export default ForgotPassword;