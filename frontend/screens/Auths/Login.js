import { FontAwesome5, Ionicons } from '@expo/vector-icons';
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
import { useDispatch } from 'react-redux';

import { useTheme } from '../../context/ThemeContext';
import { setCredentials } from '../../redux/authSlice';
import API from '../../services/api';

const Login = ({ navigation }) => {
    const { colors, isDark } = useTheme();
    const dispatch = useDispatch();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            return Alert.alert("Error", "Please fill in all fields");
        }
        setLoading(true);
        try {
            const response = await API.post('/users/login', {
                email: email.toLowerCase().trim(),
                password
            });
            dispatch(setCredentials(response.data));
        } catch (error) {
            Alert.alert("Login Failed", error.response?.data?.error || "Check your credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background[0] }]}>
            <StatusBar barStyle={colors.status} />

            {/* CURVED HEADER BACKGROUND */}
            <View style={[styles.headerBackground, { backgroundColor: colors.background[0] }]}>
                <View style={[styles.blueWave, { backgroundColor: colors.primary, opacity: isDark ? 0.4 : 1 }]} />
                <View style={[styles.darkWave, { backgroundColor: isDark ? '#1E293B' : '#637D8B', opacity: 0.6 }]} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.flex}
            >
                <View style={styles.inner}>

                    {/* LOGO SECTION */}
                    <View style={styles.logoContainer}>
                        <Text style={[styles.logoText, { color: colors.primary }]}>ECHO</Text>
                        <Text style={[styles.welcomeTitle, { color: colors.textMain }]}>Welcome back!</Text>
                    </View>

                    {/* INPUT FIELDS */}
                    <View style={styles.inputArea}>
                        <View style={[styles.inputWrapper, { backgroundColor: isDark ? colors.glass : '#F3F3F3', borderColor: colors.glassBorder, borderWidth: isDark ? 1 : 0 }]}>
                            <Ionicons name="person-outline" size={20} color={colors.textSecondary} />
                            <TextInput
                                placeholder="Username"
                                placeholderTextColor={isDark ? '#64748B' : '#999'}
                                style={[styles.input, { color: colors.textMain }]}
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={[styles.inputWrapper, { backgroundColor: isDark ? colors.glass : '#F3F3F3', borderColor: colors.glassBorder, borderWidth: isDark ? 1 : 0 }]}>
                            <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />
                            <TextInput
                                placeholder="Password"
                                placeholderTextColor={isDark ? '#64748B' : '#999'}
                                style={[styles.input, { color: colors.textMain }]}
                                secureTextEntry
                                value={password}
                                onChangeText={setPassword}
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.forgotBtn}
                            activeOpacity={0.7}
                            onPress={() => navigation.navigate('ForgotPassword')} 
                        >
                            <Text style={[styles.forgotText, { color: colors.textSecondary }]}>Forgot Password?</Text>
                        </TouchableOpacity>
                    </View>

                    {/* LOGIN BUTTON */}
                    <TouchableOpacity
                        style={styles.loginBtn}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        <LinearGradient
                            colors={isDark ? [colors.primary, '#0369A1'] : ['#8ECCE3', '#6AB8D2']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.gradientBtn}
                        >
                            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.loginBtnText}>LOG IN</Text>}
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* SOCIAL LOGIN SECTION */}
                    <View style={styles.socialSection}>
                        <Text style={[styles.socialText, { color: colors.textSecondary }]}>Or sign up using</Text>
                        {/* FIXED: Changed div to View */}
                        <View style={styles.socialIcons}>
                            <TouchableOpacity style={[styles.iconCircle, { backgroundColor: isDark ? colors.glass : '#FFF' }]}>
                                <FontAwesome5 name="facebook-f" size={20} color="#1877F2" />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.iconCircle, { backgroundColor: isDark ? colors.glass : '#FFF' }]}>
                                <FontAwesome5 name="google" size={20} color="#EA4335" />
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.iconCircle, { backgroundColor: isDark ? colors.glass : '#FFF' }]}>
                                <FontAwesome5 name="apple" size={20} color={isDark ? "#FFF" : "#000"} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* FOOTER */}
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
    headerBackground: { 
        position: 'absolute', 
        top: 0, 
        width: '100%', 
        height: '25%' 
    },
    blueWave: { 
        position: 'absolute', 
        top: -50, 
        right: -50, 
        width: '120%', 
        height: '80%', 
        borderBottomLeftRadius: 300, 
        transform: [{ rotate: '-10deg' }] 
    },
    darkWave: { 
        position: 'absolute', 
        top: -30, 
        right: -80, 
        width: '80%', 
        height: '70%', 
        borderBottomLeftRadius: 200, 
        transform: [{ rotate: '-5deg' }] 
    },
    inner: { flex: 1, paddingHorizontal: 35, justifyContent: 'center', paddingTop: 80 },
    logoContainer: { alignItems: 'center', marginBottom: 40 },
    logoText: { fontSize: 50, fontWeight: '200', letterSpacing: 5, marginBottom: 10 },
    welcomeTitle: { fontSize: 22, fontWeight: 'bold' },
    inputArea: { marginBottom: 20 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 15, height: 55, marginBottom: 15 },
    input: { flex: 1, marginLeft: 10, fontSize: 14 },
    forgotBtn: { alignSelf: 'flex-end' },
    forgotText: { fontSize: 13, fontWeight: '500' },
    loginBtn: { width: '100%', height: 55, borderRadius: 12, overflow: 'hidden', marginTop: 20, elevation: 4 },
    gradientBtn: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loginBtnText: { color: '#FFF', fontWeight: '800', fontSize: 15, letterSpacing: 1 },
    socialSection: { alignItems: 'center', marginTop: 40 },
    socialText: { fontSize: 13, marginBottom: 20, fontWeight: '500' },
    socialIcons: { flexDirection: 'row', justifyContent: 'space-around', width: '70%' },
    iconCircle: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    footer: { marginTop: 50, alignItems: 'center' },
    footerText: { fontSize: 14 },
    signUpText: { fontWeight: 'bold' },
});

export default Login;