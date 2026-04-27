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
    const slideAnim = useRef(new Animated.Value(20)).current;
    
    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 500,
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
                <View style={[styles.sectionIcon, { backgroundColor: `${colors.primary}10` }]}>
                    <Ionicons name={icon} size={18} color={colors.primary} />
                </View>
                <Text style={[styles.sectionTitle, { color: colors.textMain }]}>{title}</Text>
            </View>
            <Text style={[styles.sectionText, { color: colors.textSecondary }]}>{content}</Text>
        </Animated.View>
    );

    return (
        <LinearGradient colors={colors.background} style={styles.container}>
            {/* Header */}
            <Animated.View style={[
                styles.header, 
                { 
                    paddingTop: insets.top + 10,
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                }
            ]}>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()} 
                    style={styles.backBtn}
                    activeOpacity={0.7}
                >
                    <Ionicons name="close" size={28} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.textMain }]}>Terms of Service</Text>
                <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>Updated March 2026</Text>
            </Animated.View>

            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                bounces={true}
            >
                {/* Summary Card - Apple Style */}
                <Animated.View 
                    style={[
                        styles.summaryCard,
                        { 
                            backgroundColor: isDark ? '#1C1C1E' : '#F2F2F6',
                            opacity: fadeAnim,
                            transform: [{ scale: fadeAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.95, 1]
                            }) }]
                        }
                    ]}
                >
                    <View style={styles.summaryHeader}>
                        <View style={[styles.summaryIcon, { backgroundColor: `${colors.primary}15` }]}>
                            <Ionicons name="document-text" size={22} color={colors.primary} />
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

                {/* Contact Footer - Apple Style */}
                <Animated.View 
                    style={[
                        styles.footer,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >
                    <View style={[styles.contactCard, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F6' }]}>
                        <Ionicons name="mail-outline" size={24} color={colors.primary} />
                        <Text style={[styles.contactTitle, { color: colors.textMain }]}>Questions?</Text>
                        <Text style={[styles.contactEmail, { color: colors.primary }]}>stampecho22@gmail.com</Text>
                        <Text style={[styles.contactText, { color: colors.textSecondary }]}>
                            We're here to help. Reach out anytime.
                        </Text>
                    </View>
                    <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                        By using Echo Stamp, you agree to these terms.
                    </Text>
                </Animated.View>
            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    
    header: {
        paddingHorizontal: 20,
        marginBottom: 8,
    },
    
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        marginLeft: -8,
    },
    
    title: {
        fontSize: 34,
        fontWeight: '700',
        letterSpacing: -0.5,
        fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'System',
        marginBottom: 4,
    },
    
    lastUpdated: {
        fontSize: 14,
        fontWeight: '400',
        opacity: 0.6,
    },
    
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    
    summaryCard: {
        padding: 20,
        borderRadius: 24,
        marginTop: 16,
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
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
        letterSpacing: -0.3,
    },
    
    sectionsContainer: {
        marginBottom: 32,
    },
    
    section: {
        marginBottom: 28,
    },
    
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 12,
        borderLeftWidth: 3,
        paddingLeft: 12,
    },
    
    sectionIcon: {
        width: 30,
        height: 30,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    
    sectionTitle: {
        fontSize: 17,
        fontWeight: '600',
        letterSpacing: -0.3,
        flex: 1,
    },
    
    sectionText: {
        fontSize: 15,
        lineHeight: 22,
        fontWeight: '400',
        letterSpacing: -0.3,
        opacity: 0.8,
        paddingLeft: 24,
    },
    
    footer: {
        marginTop: 16,
        alignItems: 'center',
        gap: 24,
    },
    
    contactCard: {
        width: '100%',
        padding: 24,
        borderRadius: 24,
        alignItems: 'center',
        gap: 12,
    },
    
    contactTitle: {
        fontSize: 18,
        fontWeight: '600',
        letterSpacing: -0.3,
    },
    
    contactEmail: {
        fontSize: 16,
        fontWeight: '500',
        letterSpacing: -0.3,
    },
    
    contactText: {
        fontSize: 14,
        fontWeight: '400',
        textAlign: 'center',
        opacity: 0.7,
        letterSpacing: -0.3,
    },
    
    footerText: {
        fontSize: 13,
        fontWeight: '400',
        textAlign: 'center',
        opacity: 0.6,
        letterSpacing: -0.3,
    },
});

export default Terms;