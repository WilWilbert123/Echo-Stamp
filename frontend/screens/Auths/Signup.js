import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
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

// REDUX / CONTEXT IMPORTS
import { useTheme } from '../../context/ThemeContext';
// API IMPORT
import { requestOtp } from '../../services/api';
// BRAND COMPONENT
import BrandedHeader from '../../components/BrandedHeader';
import GlassButton from '../../components/GlassButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
                password,
                isPublic: false
            };

            // Hits: /users/request-otp
            const response = await requestOtp(userData);
            
            // Success: Navigate to OTP
            Alert.alert("Success", "Verification code sent to your email!");
            navigation.navigate('OtpVerification', { email: userData.email });

        } catch (error) {
            console.log("--- Signup Error Detail ---");
            if (error.response) {
                console.log("Status:", error.response.status);
                console.log("Data:", error.response.data);
            } else {
                console.log("Message:", error.message);
            }

            let errorMessage = "Something went wrong. Please try again.";

            if (error.message === 'Network Error') {
                errorMessage = "Network Error: Cannot connect to server.";
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            Alert.alert("Signup Failed", errorMessage);
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
                style={styles.flex}
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

                        <GlassButton
                            title="CREATE"
                            onPress={handleSignup}
                            loading={loading}
                            style={styles.createBtn}
                            textStyle={[
                                styles.createBtnText, 
                                { 
                                    color: colors.primary === '#FFFFFF' ? '#000' : (isDark ? '#FFF' : colors.primary) 
                                }
                            ]}
                        />

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
    scrollContent: { flexGrow: 1, paddingTop: 100 },  
    inner: { paddingHorizontal: 30, paddingBottom: 40 },
    headerArea: { alignItems: 'center', marginBottom: 25 },
    title: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
    subtitle: { fontSize: 14, marginTop: 5, fontWeight: '500' },
    formContainer: { marginBottom: 10 },
    inputWrapper: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        borderRadius: 16, 
        paddingHorizontal: 15, 
        height: 56, 
        marginBottom: 12 
    },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, fontSize: 15, fontWeight: '500' },
    createBtn: { height: 56, borderRadius: 16, overflow: 'hidden', marginTop: 10  },
    gradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    createBtnText: { color: '#FFF', fontSize: 16, fontWeight: '900', letterSpacing: 1.5 },
    footerLink: { marginTop: 20, marginBottom: 20, alignItems: 'center' },
    footerText: { fontSize: 14, fontWeight: '500' },
    loginLink: { fontWeight: '800' },
});

export default Signup;