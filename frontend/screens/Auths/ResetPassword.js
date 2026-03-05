import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import API from '../../services/api';

const ResetPassword = ({ route, navigation }) => {
    const { isDark, colors } = useTheme();
    const insets = useSafeAreaInsets();
    
    const { email, otp } = route.params || {}; 

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState(null);

    const handleUpdatePassword = async () => {
        if (!password || !confirmPassword) {
            Alert.alert("Error", "Please fill in all fields.");
            return;
        }
        if (password.length < 6) {
            Alert.alert("Weak Password", "Password must be at least 6 characters.");
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            await API.post('/users/reset-password', {
                email: email.toLowerCase().trim(),
                otp,
                newPassword: password
            });

            Alert.alert("Success", "Your password has been updated!", [
                { text: "Login Now", onPress: () => navigation.navigate('Login') }
            ]);
        } catch (error) {
            Alert.alert("Reset Failed", error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background[0] }]}>
            <StatusBar barStyle={colors.status} />
            
            {/* BRANDED WAVY HEADER - Percentages used to stop flickering */}
            <View style={[styles.headerBackground, { backgroundColor: colors.background[0] }]}>
                <View style={[styles.blueWave, { backgroundColor: colors.primary, opacity: isDark ? 0.2 : 0.8 }]} />
                <View style={[styles.darkWave, { backgroundColor: isDark ? colors.textSecondary : colors.primary, opacity: 0.15 }]} />
            </View>

            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                style={styles.flex}
            >
                <View style={[styles.content, { paddingTop: insets.top + 10 }]}>
                    
                    <View style={styles.navHeader}>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => navigation.goBack()}
                            style={[styles.backButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}
                        >
                            <Ionicons name="chevron-back" size={24} color={isDark ? colors.primary : colors.textMain} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.titleSection}>
                        <Text style={[styles.mainTitle, { color: colors.textMain }]}>New Password</Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            Set your new password and confirm it below to regain access.
                        </Text>
                    </View>

                    <View style={[styles.card, { 
                        backgroundColor: isDark ? colors.glass : '#FFF',
                        borderColor: colors.glassBorder,
                        borderWidth: isDark ? 1.5 : 0,
                        shadowColor: isDark ? 'transparent' : '#000',
                    }]}>
                        
                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>NEW PASSWORD</Text>
                            <View style={[
                                styles.inputWrapper, 
                                { 
                                    backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : '#F1F5F9',
                                    borderColor: focusedField === 'pass' ? colors.primary : 'transparent',
                                    borderWidth: 1.5
                                }
                            ]}>
                                <Ionicons 
                                    name="lock-closed-outline" 
                                    size={20} 
                                    color={focusedField === 'pass' ? colors.primary : colors.textSecondary} 
                                    style={styles.inputIcon} 
                                />
                                <TextInput
                                    style={[styles.input, { color: colors.textMain }]}
                                    placeholder="••••••••"
                                    placeholderTextColor={isDark ? "rgba(255,255,255,0.2)" : "#94A3B8"}
                                    secureTextEntry={!showPassword}
                                    value={password}
                                    onFocus={() => setFocusedField('pass')}
                                    onBlur={() => setFocusedField(null)}
                                    onChangeText={setPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons 
                                        name={showPassword ? "eye-off" : "eye"} 
                                        size={20} 
                                        color={colors.textSecondary} 
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>CONFIRM PASSWORD</Text>
                            <View style={[
                                styles.inputWrapper, 
                                { 
                                    backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : '#F1F5F9',
                                    borderColor: focusedField === 'confirm' ? colors.primary : 'transparent',
                                    borderWidth: 1.5
                                }
                            ]}>
                                <Ionicons 
                                    name="checkmark-done-outline" 
                                    size={20} 
                                    color={focusedField === 'confirm' ? colors.primary : colors.textSecondary} 
                                    style={styles.inputIcon} 
                                />
                                <TextInput
                                    style={[styles.input, { color: colors.textMain }]}
                                    placeholder="••••••••"
                                    placeholderTextColor={isDark ? "rgba(255,255,255,0.2)" : "#94A3B8"}
                                    secureTextEntry={!showPassword}
                                    value={confirmPassword}
                                    onFocus={() => setFocusedField('confirm')}
                                    onBlur={() => setFocusedField(null)}
                                    onChangeText={setConfirmPassword}
                                />
                            </View>
                        </View>

                        <TouchableOpacity 
                            style={styles.mainButton} 
                            onPress={handleUpdatePassword} 
                            disabled={loading}
                            activeOpacity={0.8}
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
                                    <Text style={styles.buttonText}>Update Password</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    flex: { flex: 1 },
    headerBackground: { position: 'absolute', top: 0, width: '100%', height: '25%' },
    blueWave: { position: 'absolute', top: -50, right: -50, width: '120%', height: '100%', borderBottomLeftRadius: 300, transform: [{ rotate: '-10deg' }] },
    darkWave: { position: 'absolute', top: -30, right: -80, width: '90%', height: '80%', borderBottomLeftRadius: 200, transform: [{ rotate: '-5deg' }] },
    content: { flex: 1, paddingHorizontal: 25 },
    navHeader: { marginBottom: 15 },
    backButton: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
    titleSection: { marginBottom: 30 },
    mainTitle: { fontSize: 32, fontWeight: '900', marginBottom: 10 },
    subtitle: { fontSize: 15, lineHeight: 22, fontWeight: '500' },
    card: { padding: 24, borderRadius: 30, ...Platform.select({ ios: { shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20 }, android: { elevation: 5 } }) },
    inputContainer: { marginBottom: 20 },
    label: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginBottom: 10 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', borderRadius: 15, paddingHorizontal: 15, height: 55 },
    inputIcon: { marginRight: 12 },
    input: { flex: 1, fontSize: 16, fontWeight: '600' },
    mainButton: { height: 55, borderRadius: 15, overflow: 'hidden', marginTop: 10 },
    buttonGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    buttonText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
});

export default ResetPassword;