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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// THEME & API IMPORTS
import { useTheme } from '../../context/ThemeContext';
import API from '../../services/api';

// BRAND COMPONENT
import BrandedHeader from '../../components/BrandedHeader';

const { width, height } = Dimensions.get('window');

const ForgotPassword = ({ navigation }) => {
    const { isDark, colors } = useTheme();
    const insets = useSafeAreaInsets();

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const handleResetPassword = async () => {
        const cleanEmail = email.toLowerCase().trim();
        if (!cleanEmail || !cleanEmail.includes('@')) {
            Alert.alert("Invalid Email", "Please enter a valid email address.");
            return;
        }

        setLoading(true);
        try {   
            await API.post('/users/forgot-password', { 
                email: cleanEmail 
            });

            Alert.alert("Success", "A reset code has been sent to your email.");
            
            navigation.navigate('OtpVerification', { 
                email: cleanEmail, 
                mode: 'reset' 
            });
            
        } catch (error) {
            console.log("Forgot Password Request Info:", error.response?.status);

            let errorMessage = "Could not send reset code. Please try again.";

            if (error.response) {
                if (error.response.status === 404) {
                    errorMessage = "This email is not registered in our system.";
                } 
                else if (error.response.status === 500) {
                    errorMessage = "Email service restricted. Testing mode only allows sending to your own email.";
                }
                else {
                    errorMessage = error.response.data?.message || errorMessage;
                }
            }

            Alert.alert("Reset Failed", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background[0] }]}>
            <StatusBar barStyle={colors.status} translucent backgroundColor="transparent" />

            {/* --- REUSABLE BRANDED HEADER --- */}
            <BrandedHeader colors={colors} isDark={isDark} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <View style={[styles.content, { paddingTop: insets.top + 20 }]}>

                    {/* Header Nav / Back Button */}
                    <View style={styles.navHeader}>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => navigation.goBack()}
                            style={[
                                styles.backButton, 
                                { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
                            ]}
                        >
                            <Ionicons name="chevron-back" size={24} color={isDark ? colors.primary : colors.textMain} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.titleSection}>
                        <Text style={[styles.mainTitle, { color: colors.textMain }]}>
                            Reset Password
                        </Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            Enter your email and we'll send you a code to reset your password.
                        </Text>
                    </View>

                    {/* Main Card */}
                    <View style={[styles.card, {
                        backgroundColor: isDark ? colors.glass : '#FFFFFF',
                        borderColor: colors.glassBorder,
                        borderWidth: isDark ? 1.5 : 0,
                        shadowColor: isDark ? 'transparent' : '#000',
                    }]}>
                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>EMAIL ADDRESS</Text>
                            <View style={[
                                styles.inputWrapper,
                                {
                                    backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : '#F1F5F9',
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
                                    placeholderTextColor={isDark ? "rgba(255,255,255,0.2)" : "#94A3B8"}
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
                                colors={isDark ? [colors.primary, '#0ea5e9'] : [colors.primary, '#475569']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.buttonGradient}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <>
                                        <Text style={styles.buttonText}>Send Reset Code</Text>
                                        <Ionicons name="paper-plane" size={18} color="#FFF" />
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        activeOpacity={0.7}
                        style={styles.footerLink}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={[styles.footerLinkText, { color: colors.textSecondary }]}>
                            Remembered it? <Text style={{ color: colors.primary, fontWeight: '800' }}>Log In</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1, paddingHorizontal: 25 },
    navHeader: { marginBottom: 15, zIndex: 10 },
    backButton: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
    titleSection: { marginBottom: 30, marginTop: 10 },
    mainTitle: { fontSize: 32, fontWeight: '900', marginBottom: 10, letterSpacing: -0.5 },
    subtitle: { fontSize: 15, lineHeight: 22, fontWeight: '500' },
    card: {
        padding: 24, borderRadius: 30,
        ...Platform.select({
            ios: { shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20 },
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
    footerLink: { marginTop: 'auto', marginBottom: 40, alignItems: 'center' },
    footerLinkText: { fontSize: 14, fontWeight: '600' },
});

export default ForgotPassword;