import React, { useState } from 'react';
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
import { useTheme } from '../../context/ThemeContext';
import { setCredentials } from '../../redux/authSlice';
import API from '../../services/api';

const OtpVerification = ({ route, navigation }) => {
    // mode can be 'register' (default) or 'reset'
    const { email, mode = 'register' } = route.params || {}; 
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { colors, isDark } = useTheme();
    const dispatch = useDispatch();

    const handleVerify = async () => {
        const cleanOtp = otp.trim();
        const cleanEmail = email ? email.toLowerCase().trim() : "";
        
        // Validation
        if (cleanOtp.length !== 6) {
            Alert.alert("Error", "Please enter the full 6-digit code.");
            return;
        }

        // --- FORGOT PASSWORD FLOW ---
        if (mode === 'reset') {
            navigation.navigate('ResetPassword', { 
                email: cleanEmail, 
                otp: cleanOtp 
            });
            return;
        }

        // --- REGISTRATION FLOW ---
        setLoading(true);
        try {
            const response = await API.post('/users/verify-otp', { 
                email: cleanEmail, 
                otp: cleanOtp 
            });

            const { token, user } = response.data;

            // Update Redux state
            dispatch(setCredentials({ token, user }));
            
            Alert.alert("Success", "Account verified successfully!");
            // Navigation handled by auth state change in App.js
  
        } catch (error) {
            console.error("Verification Error:", error.response?.data);
            const errorMsg = error.response?.data?.message || "Invalid or expired code.";
            Alert.alert("Verification Failed", errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.container, { backgroundColor: colors.background[0] }]}
        >
            <StatusBar barStyle={colors.status} />
            
            <View style={styles.inner}>
                <Text style={[styles.title, { color: colors.textMain }]}>
                    {mode === 'reset' ? 'Reset Code' : 'Verify Your Email'}
                </Text>
                
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Enter the 6-digit code sent to{"\n"}
                    <Text style={{ fontWeight: 'bold', color: colors.primary }}>{email}</Text>
                </Text>
                
                <TextInput
                    style={[
                        styles.input, 
                        { 
                            color: colors.textMain, 
                            borderBottomColor: colors.primary,
                            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'
                        }
                    ]}
                    placeholder="000000"
                    placeholderTextColor={isDark ? "rgba(255,255,255,0.3)" : "#94A3B8"}
                    keyboardType="number-pad"
                    maxLength={6}
                    value={otp}
                    onChangeText={setOtp}
                    autoFocus={true}
                    selectionColor={colors.primary}
                />

                <TouchableOpacity 
                    style={[
                        styles.button, 
                        { 
                            backgroundColor: colors.primary, 
                            opacity: loading ? 0.7 : 1,
                            shadowColor: colors.primary 
                        }
                    ]} 
                    onPress={handleVerify}
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>
                            {mode === 'reset' ? 'CONTINUE' : 'VERIFY & REGISTER'}
                        </Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.resendBtn} 
                    onPress={() => navigation.goBack()}
                    disabled={loading}
                >
                    <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                        Entered the wrong email? <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Go Back</Text>
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
   container: { flex: 1 },
inner: { flex: 1, justifyContent: 'center', padding: 40 },
title: { fontSize: 28, fontWeight: 'bold', marginBottom: 10, textAlign: 'center', letterSpacing: -0.5 },
subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 40, lineHeight: 22 },
input: { borderBottomWidth: 3, fontSize: 36, textAlign: 'center', letterSpacing: 10, marginBottom: 50, paddingVertical: 12, borderRadius: 8 },
button: { height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5 },
buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
resendBtn: { marginTop: 25, alignItems: 'center' },
footerText: { fontSize: 14 }
});

export default OtpVerification;