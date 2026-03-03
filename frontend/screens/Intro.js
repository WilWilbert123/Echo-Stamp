import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { Animated, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const Intro = ({ navigation }) => {
    const { colors, isDark } = useTheme();
    const fadeAnim = new Animated.Value(0);  

    useEffect(() => {
        // 1. Start a fade-in animation
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();

         
        const timer = setTimeout(() => {
            navigation.replace('Login');  
        }, 3000);

        return () => clearTimeout(timer);  
    }, []);

    return (
        <LinearGradient colors={colors.background} style={styles.container}>
            <StatusBar barStyle={colors.status} />
            
            <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
               
                <Text style={[styles.logoText, { color: colors.primary }]}>ECHOES</Text>
                
                <View style={[styles.line, { backgroundColor: colors.primary }]} />
                
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Resonate with your memories.
                </Text>
            </Animated.View>

            
            <Text style={[styles.footer, { color: colors.textSecondary }]}>v1.2.0</Text>
        </LinearGradient>
    );
};

export default Intro;

const styles = StyleSheet.create({
   container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
logoText: { fontSize: 42, fontWeight: '900', letterSpacing: 4 },
line: { height: 2, width: 40, marginVertical: 15, borderRadius: 1 },
subtitle: { fontSize: 14, fontWeight: '600', letterSpacing: 1.5, textTransform: 'uppercase', opacity: 0.8 },
footer: { position: 'absolute', bottom: 40, fontSize: 10, fontWeight: '700', opacity: 0.5 },
});