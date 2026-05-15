import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

const Terms = ({ navigation }) => {
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    
    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(25)).current;
    
    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 700,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const termsSections = [
        {
            id: 1,
            title: "Acceptance of Terms",
            content: "By creating an Echo Stamp account, you agree to these terms. If you do not agree, please do not use the service.",
            icon: "checkmark-circle"
        },
        {
            id: 2,
            title: "User Content & Echoes",
            content: "You retain all ownership rights to the photos, text, and location data you post. However, by using the app, you grant us a license to host and store this content so you can access it across devices.",
            icon: "images"
        },
        {
            id: 3,
            title: "Location Services",
            content: "Echo Stamp relies on GPS data to function. You can revoke location permissions at any time through your device settings, though some features may become unavailable.",
            icon: "location"
        },
        {
            id: 4,
            title: "Prohibited Conduct",
            content: "You agree not to use Echo Stamp for any illegal activities, harassment, or to upload malicious code that could harm the Echo Stamp ecosystem.",
            icon: "alert-circle"
        },
        {
            id: 5,
            title: "Account Termination",
            content: "We reserve the right to suspend accounts that violate these terms. You may delete your account and all associated data at any time through the Privacy settings.",
            icon: "person-remove"
        },
        {
            id: 6,
            title: "Data Privacy",
            content: "We collect only essential data to provide our services. Your personal information is never sold to third parties. See our Privacy Policy for more details.",
            icon: "shield"
        },
        {
            id: 7,
            title: "Changes to Terms",
            content: "We may update these terms from time to time. We'll notify you of any material changes via email or through the app. Continued use constitutes acceptance.",
            icon: "refresh"
        }
    ];

    // Glass Container Dynamic Styles Shared Module
    const getGlassStyles = () => ({
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.45)',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.6)',
        shadowColor: isDark ? '#000000' : colors.primary,
        shadowOpacity: isDark ? 0.3 : 0.06,
    });

    const Section = ({ title, content, icon, index }) => (
        <Animated.View 
            style={[
                styles.section,
                {
                    opacity: fadeAnim,
                    transform: [{ translateX: Animated.multiply(slideAnim, new Animated.Value(index % 2 === 0 ? 1 : -1)) }]
                }
            ]}
        >
            <View style={[styles.sectionHeader, { borderLeftColor: colors.primary }]}>
                <View style={[styles.sectionIcon, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                    <Ionicons name={icon} size={16} color={colors.primary} />
                </View>
                <Text style={[styles.sectionTitle, { color: colors.textMain }]}>{title}</Text>
            </View>
            <Text style={[styles.sectionText, { color: colors.textSecondary }]}>{content}</Text>
        </Animated.View>
    );

    return (
        <LinearGradient colors={colors.background} style={styles.container}>
            {/* Ambient background glass elements */}
            <View style={[styles.ambientGlow, { backgroundColor: colors.primary, top: '15%', left: -50 }]} />
            <View style={[styles.ambientGlow, { backgroundColor: '#3B82F6', bottom: '25%', right: -60, opacity: 0.08 }]} />

            {/* Header */}
            <Animated.View style={[
                styles.header, 
                { 
                    paddingTop: insets.top + 15,
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                }
            ]}>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()} 
                    style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}
                    activeOpacity={0.7}
                >
                    <Ionicons name="close" size={24} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.textMain }]}>Terms of Service</Text>
                <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>Updated March 2026</Text>
            </Animated.View>

            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                bounces={true}
            >
                {/* Summary Card - Glassmorphism */}
                <Animated.View 
                    style={[
                        styles.summaryCard,
                        getGlassStyles(),
                        { 
                            opacity: fadeAnim,
                            transform: [{ scale: fadeAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.96, 1]
                            }) }]
                        }
                    ]}
                >
                    <LinearGradient
                        colors={isDark ? ['rgba(255,255,255,0.03)', 'rgba(255,255,255,0.005)'] : ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)']}
                        style={StyleSheet.absoluteFillObject}
                    />
                    <View style={styles.summaryHeader}>
                        <View style={[styles.summaryIcon, { backgroundColor: `${colors.primary}18` }]}>
                            <Ionicons name="document-text" size={20} color={colors.primary} />
                        </View>
                        <Text style={[styles.summaryTitle, { color: colors.textMain }]}>Summary</Text>
                    </View>
                    <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
                        We value your privacy. Your Echoes are yours to keep, you maintain control of your location data, 
                        and we promise to never sell your personal information to third parties. Period.
                    </Text>
                </Animated.View>

                {/* Legal Sections */}
                <View style={styles.sectionsContainer}>
                    {termsSections.map((section, index) => (
                        <Section 
                            key={section.id}
                            title={section.title}
                            content={section.content}
                            icon={section.icon}
                            index={index}
                        />
                    ))}
                </View>

                {/* Contact Footer - Glassmorphism */}
                <Animated.View 
                    style={[
                        styles.footer,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <LinearGradient
                        colors={isDark ? ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.01)'] : ['rgba(255,255,255,0.65)', 'rgba(255,255,255,0.35)']}
                        style={[styles.contactCard, getGlassStyles()]}
                    >
                        <View style={[styles.contactIconCircle, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                            <Ionicons name="mail-outline" size={22} color={colors.primary} />
                        </View>
                        <Text style={[styles.contactTitle, { color: colors.textMain }]}>Questions?</Text>
                        <TouchableOpacity activeOpacity={0.6}>
                            <Text style={[styles.contactEmail, { color: colors.primary }]}>stampecho22@gmail.com</Text>
                        </TouchableOpacity>
                        <Text style={[styles.contactText, { color: colors.textSecondary }]}>
                            We're here to help. Reach out anytime.
                        </Text>
                    </LinearGradient>
                    <Text style={[styles.footerText, { color: colors.textSecondary, opacity: 0.6 }]}>
                        By using Echo Stamp, you agree to these terms.
                    </Text>
                </Animated.View>
            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1 
    },
    ambientGlow: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
        opacity: 0.06,
        blurRadius: 60,
    },
    header: {
        paddingHorizontal: 24,
        marginBottom: 4,
    },
    backBtn: {
        width: 38,
        height: 38,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        letterSpacing: -0.5,
        fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'System',
        marginBottom: 4,
    },
    lastUpdated: {
        fontSize: 14,
        fontWeight: '400',
        opacity: 0.5,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingBottom: 60,
    },
    summaryCard: {
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        marginTop: 20,
        marginBottom: 32,
        overflow: 'hidden',
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 16,
      
    },
    summaryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    summaryIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    summaryTitle: {
        fontSize: 17,
        fontWeight: '600',
        letterSpacing: -0.3,
    },
    summaryText: {
        fontSize: 15,
        lineHeight: 22,
        fontWeight: '400',
        letterSpacing: -0.2,
        opacity: 0.9,
    },
    sectionsContainer: {
        marginBottom: 16,
    },
    section: {
        marginBottom: 26,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        gap: 12,
        borderLeftWidth: 3,
        paddingLeft: 12,
    },
    sectionIcon: {
        width: 28,
        height: 28,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: -0.3,
        flex: 1,
    },
    sectionText: {
        fontSize: 15,
        lineHeight: 22,
        fontWeight: '400',
        letterSpacing: -0.2,
        opacity: 0.75,
        paddingLeft: 24,
    },
    footer: {
        marginTop: 8,
        alignItems: 'center',
        gap: 20,
    },
    contactCard: {
        width: '100%',
        padding: 24,
        borderRadius: 24,
        borderWidth: 1,
        alignItems: 'center',
        gap: 10,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 16,
    },
    contactIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 2,
    },
    contactTitle: {
        fontSize: 18,
        fontWeight: '600',
        letterSpacing: -0.3,
    },
    contactEmail: {
        fontSize: 16,
        fontWeight: '500',
        letterSpacing: -0.2,
    },
    contactText: {
        fontSize: 14,
        fontWeight: '400',
        textAlign: 'center',
        opacity: 0.65,
        letterSpacing: -0.2,
    },
    footerText: {
        fontSize: 12,
        fontWeight: '400',
        textAlign: 'center',
        letterSpacing: -0.2,
    },
});

export default Terms;