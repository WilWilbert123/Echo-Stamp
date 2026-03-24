import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const Intro = ({ navigation }) => {
    const { colors, isDark } = useTheme();
    const logoText = "ECHOES";
    const letters = logoText.split("");

    // Create an array of animated values, one for each letter
    const animatedValues = useRef(letters.map(() => new Animated.Value(0))).current;
    const subtitleOpacity = useRef(new Animated.Value(0)).current;
    const lineScale = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // 1. Create a staggered animation for the letters
        const letterAnimations = letters.map((_, i) => {
            return Animated.spring(animatedValues[i], {
                toValue: 1,
                tension: 40,
                friction: 7,
                useNativeDriver: true,
                delay: i * 150, // This creates the E... C... H... effect
            });
        });

        // 2. Run animations in sequence
        Animated.sequence([
            Animated.stagger(100, letterAnimations),
            Animated.parallel([
                Animated.timing(subtitleOpacity, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.spring(lineScale, {
                    toValue: 1,
                    tension: 20,
                    useNativeDriver: true,
                })
            ])
        ]).start();

        const timer = setTimeout(() => {
            navigation.replace('Login');
        }, 4000); // Slightly longer to appreciate the animation

        return () => clearTimeout(timer);
    }, []);

    return (
        <LinearGradient 
            colors={isDark ? ['#0F172A', '#1E293B'] : ['#F8FAFC', '#E2E8F0']} 
            style={styles.container}
        >
            <StatusBar barStyle={colors.status} />
            
            <View style={styles.logoRow}>
                {letters.map((letter, index) => (
                    <Animated.Text
                        key={index}
                        style={[
                            styles.logoText,
                            {
                                color: colors.primary,
                                opacity: animatedValues[index],
                                transform: [
                                    {
                                        translateY: animatedValues[index].interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [20, 0],
                                        }),
                                    },
                                    {
                                        scale: animatedValues[index].interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0.5, 1],
                                        }),
                                    },
                                ],
                            },
                        ]}
                    >
                        {letter}
                    </Animated.Text>
                ))}
            </View>

            <Animated.View style={[
                styles.line, 
                { 
                    backgroundColor: colors.primary,
                    transform: [{ scaleX: lineScale }] 
                }
            ]} />
            
            <Animated.Text style={[
                styles.subtitle, 
                { color: colors.textSecondary, opacity: subtitleOpacity }
            ]}>
                Resonate with your memories
            </Animated.Text>

            <Text style={[styles.footer, { color: colors.textSecondary }]}>v1.2.0</Text>
        </LinearGradient>
    );
};

export default Intro;

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    logoRow: { 
        flexDirection: 'row', 
        alignItems: 'center',
        justifyContent: 'center'
    },
    logoText: { 
        fontSize: 52, // Larger for impact
        fontWeight: '900', 
        letterSpacing: 8,
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 10,
    },
    line: { 
        height: 3, 
        width: 100, // Longer line
        marginVertical: 20, 
        borderRadius: 2,
        opacity: 0.8
    },
    subtitle: { 
        fontSize: 12, 
        fontWeight: '700', 
        letterSpacing: 3, 
        textTransform: 'uppercase',
    },
    footer: { 
        position: 'absolute', 
        bottom: 40, 
        fontSize: 11, 
        fontWeight: '800', 
        opacity: 0.4,
        letterSpacing: 1
    },
});