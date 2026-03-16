import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
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
import { useDispatch } from 'react-redux';
import { useTheme } from '../../context/ThemeContext';
import { setCredentials } from '../../redux/authSlice';
import API from '../../services/api';

 

const OtpVerification = ({ route, navigation }) => {
    const { email, mode = 'register' } = route.params || {};
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(30);

    const { colors, isDark } = useTheme();
    const dispatch = useDispatch();

    useEffect(() => {
        let interval = null;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleVerify = async () => {
        const cleanOtp = otp.trim();
        const cleanEmail = email ? email.toLowerCase().trim() : "";

        if (cleanOtp.length !== 6) {
            Alert.alert("Error", "Please enter the full 6-digit code.");
            return;
        }

        setLoading(true);
        try {
            if (mode === 'reset') {
                await API.post('/users/verify-only', {
                    email: cleanEmail,
                    otp: cleanOtp
                });

                navigation.navigate('ResetPassword', {
                    email: cleanEmail,
                    otp: cleanOtp
                });

            } else if (mode === '2fa') {
                await API.post('/users/verify-only', {
                    email: cleanEmail,
                    otp: cleanOtp
                });

                Alert.alert("Success", "Two-Factor Authentication is now enabled!", [
                    { text: "OK", onPress: () => navigation.goBack() }
                ]);

            } else if (mode === '2fa_login') {
                const response = await API.post('/users/login-2fa-verify', {
                    email: cleanEmail,
                    otp: cleanOtp
                });

                const { token, user } = response.data;
                dispatch(setCredentials({ token, user }));

            } else {
                // Mode: Registration
                const response = await API.post('/users/verify-otp', {
                    email: cleanEmail,
                    otp: cleanOtp
                });

                const { token, user } = response.data;


                Alert.alert("Success", "Account verified successfully!", [
                    {
                        text: "OK",
                        onPress: () => {

                            dispatch(setCredentials({ token, user }));
                        }
                    }
                ]);
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || "Invalid or expired code.";
            Alert.alert("Verification Failed", errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (timer > 0) return;
        try {
            const endpoint = mode === 'reset' ? '/users/forgot-password' : '/users/request-otp';
            await API.post(endpoint, { email: email.toLowerCase().trim() });
            setTimer(60);
            Alert.alert("Sent", "A new code has been sent to your email.");
        } catch (error) {
            Alert.alert("Error", "Could not resend code. Please try again later.");
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background[0] }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : null}
                style={styles.flex}
            >
              
                <ScrollView
                    contentContainerStyle={styles.scrollGrow}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.inner}>
                        <Text style={[styles.title, { color: colors.textMain }]}>
                            {mode === 'reset' ? 'Reset Code' :
                                mode === '2fa' || mode === '2fa_login' ? 'Secure Verification' :
                                    'Verify Your Email'}
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
                                    {mode === 'reset' ? 'CONTINUE' :
                                        mode === '2fa' ? 'ACTIVATE 2FA' :
                                            mode === '2fa_login' ? 'CONFIRM LOGIN' :
                                                'VERIFY & REGISTER'}
                                </Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.footerActions}>
                            <TouchableOpacity
                                onPress={handleResend}
                                disabled={timer > 0}
                            >
                                <Text style={[styles.footerText, { color: timer > 0 ? colors.textSecondary : colors.primary }]}>
                                    {timer > 0 ? `Resend code in ${timer}s` : "Resend Code"}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.resendBtn}
                                onPress={() => navigation.goBack()}
                                disabled={loading}
                            >
                                <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                                    {mode === '2fa' || mode === '2fa_login' ? 'Cancel' : 'Wrong email? '}
                                    {(mode !== '2fa' && mode !== '2fa_login') && <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Go Back</Text>}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    flex: { flex: 1 },
    scrollGrow: {
        flexGrow: 1,
        justifyContent: 'center'  
    },
    inner: {
        paddingHorizontal: 40,
        paddingVertical: 30,
    },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 10, textAlign: 'center', letterSpacing: -0.5 },
    subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 40, lineHeight: 22 },
    input: { borderBottomWidth: 3, fontSize: 36, textAlign: 'center', letterSpacing: 10, marginBottom: 50, paddingVertical: 12, borderRadius: 8 },
    button: { height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5 },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
    footerActions: { marginTop: 25, alignItems: 'center' },
    resendBtn: { marginTop: 15 },
    footerText: { fontSize: 14 }
});

export default OtpVerification;