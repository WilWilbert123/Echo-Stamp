import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// REDUX IMPORTS
import { useTheme } from '../../context/ThemeContext';
// API IMPORT
import { requestOtp } from '../../services/api';

// Get dimensions outside the component or use fixed values to prevent keyboard-flicker
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const Signup = ({ navigation }) => {
    const { colors, isDark } = useTheme();
    
    // Form State
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        // 1. Basic Presence Validation
        if (!firstName.trim() || !lastName.trim() || !username.trim() || !email.trim() || !password.trim()) {
            Alert.alert("Error", "Please fill in all fields.");
            return;
        }

        // 2. Email Format Validation
        const emailRegex = /\S+@\S+\.\S+/;
        if (!emailRegex.test(email)) {
            Alert.alert("Error", "Please enter a valid email address.");
            return;
        }

        // 3. Password Strength & Match
        if (password.length < 6) {
            Alert.alert("Error", "Password must be at least 6 characters long.");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            const userData = {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                username: username.trim(),
                email: email.toLowerCase().trim(),
                password
            };

            // Hits: /users/request-otp
            const response = await requestOtp(userData);
            
            // Success: Navigate to OTP
            Alert.alert("Success", "Verification code sent to your email!");
            navigation.navigate('OtpVerification', { email: userData.email });

        } catch (error) {
            // Detailed Logging for Debugging
            console.log("--- Signup Error Detail ---");
            if (error.response) {
                console.log("Status:", error.response.status);
                console.log("Data:", error.response.data);
            } else {
                console.log("Message:", error.message);
            }

            let errorMessage = "Something went wrong. Please try again.";

            if (error.message === 'Network Error') {
                errorMessage = "Network Error: Cannot connect to server. If you are testing locally, check your IP. If on Render, the server might be starting up.";
            } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
                errorMessage = "The server is taking too long to respond (Waking up). Please wait a moment and try again.";
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            Alert.alert("Signup Failed", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Use useMemo so these aren't recalculated unless the theme changes
    // This prevents the background shapes from jumping when the keyboard alters "window height"
    const dynamicStyles = useMemo(() => ({
        headerBackground: { height: SCREEN_HEIGHT * 0.25 },
        blueWave: { width: SCREEN_WIDTH * 1.2, height: SCREEN_HEIGHT * 0.2 },
        darkWave: { width: SCREEN_WIDTH * 0.8, height: SCREEN_HEIGHT * 0.18 },
    }), []);

    return (
        <View style={[styles.container, { backgroundColor: colors.background[0] }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            
            <View style={[styles.headerBackground, dynamicStyles.headerBackground, { backgroundColor: colors.background[0] }]}>
                <View style={[styles.blueWave, dynamicStyles.blueWave, { backgroundColor: colors.primary, opacity: isDark ? 0.4 : 1 }]} />
                <View style={[styles.darkWave, dynamicStyles.darkWave, { backgroundColor: isDark ? '#1E293B' : '#637D8B', opacity: 0.6 }]} />
            </View>

            <KeyboardAvoidingView 
                // FIXED behavior: Changed from 'height' to 'padding' for Android to stop the flickering
                behavior={Platform.OS === 'ios' ? 'padding' : 'padding'} 
                style={styles.flex}
                // Optional: add keyboardVerticalOffset if the header is covering inputs on some devices
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.inner}>
                        <View style={styles.headerArea}>
                            <Text style={[styles.title, { color: colors.textMain }]}>Let's Get Started!</Text>
                            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                                Create an account to get all features
                            </Text>
                        </View>

                        <View style={styles.formContainer}>
                            {[
                                { icon: 'person-outline', placeholder: 'First Name', val: firstName, set: setFirstName },
                                { icon: 'person-outline', placeholder: 'Last Name', val: lastName, set: setLastName },
                                { icon: 'at-outline', placeholder: 'User Name', val: username, set: setUsername },
                                { icon: 'mail-outline', placeholder: 'Email', val: email, set: setEmail, type: 'email-address' },
                                { icon: 'lock-closed-outline', placeholder: 'Password', val: password, set: setPassword, secure: true },
                                { icon: 'shield-checkmark-outline', placeholder: 'Confirm Password', val: confirmPassword, set: setConfirmPassword, secure: true },
                            ].map((item, index) => (
                                <View key={index} style={[
                                    styles.inputWrapper, 
                                    { 
                                        backgroundColor: isDark ? colors.glass : '#F4F4F4',
                                        borderColor: colors.glassBorder,
                                        borderWidth: isDark ? 1 : 0
                                    }
                                ]}>
                                    <Ionicons name={item.icon} size={20} color={colors.textSecondary} style={styles.inputIcon} />
                                    <TextInput 
                                        placeholder={item.placeholder}
                                        placeholderTextColor={isDark ? '#64748B' : '#999'}
                                        style={[styles.input, { color: colors.textMain }]}
                                        value={item.val}
                                        onChangeText={item.set}
                                        secureTextEntry={item.secure}
                                        keyboardType={item.type || 'default'}
                                        autoCapitalize="none"
                                        editable={!loading}
                                    />
                                </View>
                            ))}
                        </View>

                        <TouchableOpacity 
                            style={styles.createBtn} 
                            onPress={handleSignup}
                            disabled={loading}
                        >
                            <LinearGradient
                                colors={isDark ? [colors.primary, '#0369A1'] : ['#8ECCE3', '#6AB8D2']}
                                start={{x: 0, y: 0}} end={{x: 1, y: 0}}
                                style={styles.gradient}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <Text style={styles.createBtnText}>CREATE</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.footerLink} 
                            onPress={() => navigation.navigate('Login')}
                        >
                            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                                Already have an account? <Text style={[styles.loginLink, { color: colors.primary }]}>Login here</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    flex: { flex: 1 },
    scrollContent: { flexGrow: 1, paddingTop: 60 },
    headerBackground: { position: 'absolute', top: 0, width: '100%' },
    blueWave: { position: 'absolute', top: -50, right: -50, borderBottomLeftRadius: 300, transform: [{ rotate: '-10deg' }] },
    darkWave: { position: 'absolute', top: -30, right: -80, borderBottomLeftRadius: 200, transform: [{ rotate: '-5deg' }] },
    inner: { paddingHorizontal: 35, paddingVertical: 40 },
    headerArea: { alignItems: 'center', marginBottom: 25 },
    title: { fontSize: 26, fontWeight: 'bold' },
    subtitle: { fontSize: 13, marginTop: 5 },
    formContainer: { marginBottom: 10 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 15, height: 50, marginBottom: 12 },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, fontSize: 14 },
    createBtn: { height: 50, borderRadius: 12, overflow: 'hidden', marginTop: 10, elevation: 4 },
    gradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    createBtnText: { color: '#FFF', fontSize: 15, fontWeight: '800', letterSpacing: 1 },
    footerLink: { marginTop: 20, marginBottom: 20, alignItems: 'center' },
    footerText: { fontSize: 13 },
    loginLink: { fontWeight: 'bold' },
});

export default Signup;