import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Modal,
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

const About = ({ navigation }) => {
    const { colors, isDark } = useTheme(); 
    const insets = useSafeAreaInsets();
    const animation = useRef(null);
    const [showTechStack, setShowTechStack] = useState(false);
    const [selectedTech, setSelectedTech] = useState(null);
    
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
    
    // Tech Stack
    const techStack = [
        { name: 'React Native', icon: 'logo-react', color: '#61DAFB' },
        { name: 'Node.js', icon: 'logo-nodejs', color: '#339933' },
        { name: 'Express', icon: 'server-outline', color: isDark ? '#FFFFFF' : '#000000' },
        { name: 'MongoDB', icon: 'leaf-outline', color: '#47A248' },
        { name: 'Google APIs', icon: 'logo-google', color: '#4285F4' },
        { name: 'OpenAI', icon: 'bulb-outline', color: '#10A37F' },
        { name: 'Cloudinary', icon: 'cloud-upload-outline', color: '#3448C5' },
        { name: 'Firebase', icon: 'flame-outline', color: '#FFCA28' },
    ];
    
    const features = [
        { icon: 'map-outline', title: 'Location Tracking', description: 'Real-time GPS with smart battery optimization' },
        { icon: 'cloud-upload-outline', title: 'Cloud Sync', description: 'Secure auto-backup of your memories' },
        { icon: 'shield-checkmark-outline', title: 'Privacy First', description: 'End-to-end encryption for your data' },
        { icon: 'flash-outline', title: 'Lightning Fast', description: '<2s load time with optimized performance' },
    ];

    // Glass Container Dynamic Styles Shared Module
    const getGlassStyles = () => ({
        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.45)',
        borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.6)',
        shadowColor: isDark ? '#000000' : colors.primary,
        shadowOpacity: isDark ? 0.3 : 0.06,
    });

    const TechDetailModal = ({ tech, visible, onClose }) => (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <TouchableOpacity 
                style={[styles.modalOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.3)' }]} 
                activeOpacity={1} 
                onPress={onClose}
            >
                <TouchableOpacity activeOpacity={1}>
                    <LinearGradient
                        colors={isDark ? ['rgba(30,30,32,0.9)', 'rgba(20,20,22,0.95)'] : ['rgba(255,255,255,0.9)', 'rgba(245,245,247,0.95)']}
                        style={[styles.modalContent, getGlassStyles()]}
                    >
                        <View style={[styles.modalIcon, { backgroundColor: `${tech?.color}18` }]}>
                            <Ionicons name={tech?.icon} size={32} color={tech?.color} />
                        </View>
                        <Text style={[styles.modalTitle, { color: colors.textMain }]}>{tech?.name}</Text>
                        <Text style={[styles.modalDescription, { color: colors.textSecondary }]}>
                            Integrated seamlessly into Echo Stamp for optimal performance and user experience.
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );

    return (
        <LinearGradient colors={colors.background} style={styles.container}>
            {/* Ambient background glass elements */}
            <View style={[styles.ambientGlow, { backgroundColor: colors.primary, top: '25%', right: -60 }]} />
            <View style={[styles.ambientGlow, { backgroundColor: '#EC4899', bottom: '20%', left: -60, opacity: 0.1 }]} />

            <ScrollView 
                contentContainerStyle={{ 
                    paddingTop: insets.top + 15, 
                    paddingBottom: 60 
                }}
                showsVerticalScrollIndicator={false}
                bounces={true}
            >
                {/* Back Button */}
                <Animated.View style={{ opacity: fadeAnim, paddingHorizontal: 20 }}>
                    <TouchableOpacity 
                        onPress={() => navigation.goBack()} 
                        style={[styles.backBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="chevron-back" size={24} color={colors.textMain} />
                    </TouchableOpacity>
                </Animated.View>

                {/* App Logo/Branding Section */}
                <Animated.View 
                    style={[
                        styles.brandSection,
                        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                    ]}
                >
                    <View style={styles.logoContainer}>
                        <LottieView
                            autoPlay
                            loop
                            ref={animation}
                            style={{ width: 180, height: 180 }}
                            source={isDark ? require('../../assets/TechRotate2.json') : require('../../assets/TechRotate.json')}
                        />
                    </View>
                </Animated.View>

                {/* Mission Section */}
                <Animated.View 
                    style={[
                        styles.missionSection,
                        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                    ]}
                >
                    <Text style={[styles.appName, { color: colors.textMain }]}>Echo Stamp</Text>
                    <Text style={[styles.versionText, { color: colors.textSecondary }]}>Version 1.5.0</Text>
                    <View style={styles.missionDivider} />
                    <Text style={[styles.missionText, { color: colors.textSecondary }]}>
                        Every place has a story. Every story deserves to be stamped in time.
                    </Text>
                </Animated.View>

                {/* Features Grid */}
                <Animated.View 
                    style={[
                        styles.featuresSection,
                        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                    ]}
                >
                    <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Features</Text>
                    <View style={styles.featuresGrid}>
                        {features.map((feature, index) => (
                            <LinearGradient
                                key={index}
                                colors={isDark ? ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.01)'] : ['rgba(255,255,255,0.65)', 'rgba(255,255,255,0.35)']}
                                style={[styles.featureItem, getGlassStyles()]}
                            >
                                <View style={[styles.featureIcon, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
                                    <Ionicons name={feature.icon} size={20} color={colors.primary} />
                                </View>
                                <Text style={[styles.featureTitle, { color: colors.textMain }]}>{feature.title}</Text>
                                <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>{feature.description}</Text>
                            </LinearGradient>
                        ))}
                    </View>
                </Animated.View>

                {/* Tech Stack Accordion Container */}
                <Animated.View 
                    style={[
                        styles.techSection,
                        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                    ]}
                >
                    <TouchableOpacity 
                        style={styles.techHeader}
                        onPress={() => setShowTechStack(!showTechStack)}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.sectionTitle, { color: colors.textMain, marginBottom: 0 }]}>Technology</Text>
                        <Ionicons 
                            name={showTechStack ? "chevron-up" : "chevron-forward"} 
                            size={18} 
                            color={colors.textSecondary} 
                            style={{ opacity: 0.7 }}
                        />
                    </TouchableOpacity>
                    
                    {showTechStack && (
                        <View style={styles.techGrid}>
                            <LinearGradient
                                colors={isDark ? ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.01)'] : ['rgba(255,255,255,0.65)', 'rgba(255,255,255,0.35)']}
                                style={[styles.techList, getGlassStyles()]}
                            >
                                {techStack.map((tech, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        activeOpacity={0.8}
                                        onPress={() => setSelectedTech(tech)}
                                        style={[
                                            styles.techItem, 
                                            { borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' },
                                            index === techStack.length - 1 && { borderBottomWidth: 0 }
                                        ]}
                                    >
                                        <View style={[styles.techIcon, { backgroundColor: `${tech.color}15` }]}>
                                            <Ionicons name={tech.icon} size={18} color={tech.color} />
                                        </View>
                                        <Text style={[styles.techName, { color: colors.textMain }]}>{tech.name}</Text>
                                        <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} style={styles.techChevron} />
                                    </TouchableOpacity>
                                ))}
                            </LinearGradient>
                        </View>
                    )}
                </Animated.View>

                {/* Stats */}
                <Animated.View 
                    style={[
                        styles.statsSection,
                        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                    ]}
                >
                    <LinearGradient
                        colors={isDark ? ['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.01)'] : ['rgba(255,255,255,0.5)', 'rgba(255,255,255,0.25)']}
                        style={[styles.statsContainer, getGlassStyles()]}
                    >
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: colors.textMain }]}>98%</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Crash Free</Text>
                        </View>
                        <View style={[styles.statDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }]} />
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: colors.textMain }]}>&lt;2s</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Load Time</Text>
                        </View>
                        <View style={[styles.statDivider, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }]} />
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: colors.textMain }]}>24/7</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Support</Text>
                        </View>
                    </LinearGradient>
                </Animated.View>

                {/* Credits Section */}
                <Animated.View 
                    style={[
                        styles.creditsSection,
                        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                    ]}
                >
                    <Text style={[styles.developerName, { color: colors.textMain }]}>John Wilbert Gamis</Text>
                    <Text style={[styles.developerRole, { color: colors.textSecondary, opacity: 0.7 }]}>Lead Developer</Text>
                    <Text style={[styles.copyright, { color: colors.textSecondary, opacity: 0.5 }]}>© 2026 Echo Stamp</Text>
                </Animated.View>
            </ScrollView>
            
            {/* Tech Detail Modal */}
            {selectedTech && (
                <TechDetailModal 
                    tech={selectedTech} 
                    visible={!!selectedTech} 
                    onClose={() => setSelectedTech(null)} 
                />
            )}
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1 
    },
    ambientGlow: {
        position: 'absolute',
        width: 250,
        height: 250,
        borderRadius: 125,
        opacity: 0.07,
        blurRadius: 50,
    },
    backBtn: {
        width: 38,
        height: 38,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 8,
    },
    brandSection: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    logoContainer: {
        width: 180,
        height: 180,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    missionSection: {
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 8,
        marginBottom: 16,
    },
    appName: {
        fontSize: 32,
        fontWeight: '700',
        letterSpacing: -0.5,
        fontFamily: Platform.OS === 'ios' ? 'SF Pro Display' : 'System',
        marginBottom: 4,
    },
    versionText: {
        fontSize: 14,
        fontWeight: '400',
        opacity: 0.5,
        marginBottom: 16,
    },
    missionDivider: {
        width: 40,
        height: 1,
        backgroundColor: '#8E8E93',
        opacity: 0.25,
        marginBottom: 16,
    },
    missionText: {
        fontSize: 16,
        lineHeight: 23,
        fontWeight: '400',
        textAlign: 'center',
        letterSpacing: -0.2,
        opacity: 0.8,
    },
    featuresSection: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        letterSpacing: -0.4,
        marginBottom: 14,
        paddingHorizontal: 4,
    },
    featuresGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    featureItem: {
        width: (width - 52) / 2,
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        gap: 6,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
    },
    featureIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    featureTitle: {
        fontSize: 15,
        fontWeight: '600',
        letterSpacing: -0.2,
    },
    featureDesc: {
        fontSize: 13,
        fontWeight: '400',
        lineHeight: 18,
        opacity: 0.7,
    },
    techSection: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    techHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    techGrid: {
        marginTop: 6,
    },
    techList: {
        borderRadius: 20,
        borderWidth: 1,
        overflow: 'hidden',
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
    },
    techItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 0.5,
    },
    techIcon: {
        width: 34,
        height: 34,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    techName: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
        letterSpacing: -0.2,
    },
    techChevron: {
        opacity: 0.4,
    },
    statsSection: {
        paddingHorizontal: 20,
        marginVertical: 16,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 18,
        borderRadius: 20,
        borderWidth: 1,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: 22,
        fontWeight: '700',
        letterSpacing: -0.4,
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '400',
        opacity: 0.6,
    },
    statDivider: {
        width: 0.5,
        height: 24,
    },
    creditsSection: {
        alignItems: 'center',
        paddingTop: 24,
        paddingBottom: 16,
        paddingHorizontal: 20,
    },
    developerName: {
        fontSize: 15,
        fontWeight: '500',
        letterSpacing: -0.2,
        marginBottom: 2,
    },
    developerRole: {
        fontSize: 13,
        fontWeight: '400',
        marginBottom: 12,
    },
    copyright: {
        fontSize: 12,
        fontWeight: '400',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: width - 56,
        padding: 24,
        borderRadius: 24,
        borderWidth: 1,
        alignItems: 'center',
        gap: 12,
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 24,
    },
    modalIcon: {
        width: 60,
        height: 60,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        letterSpacing: -0.4,
    },
    modalDescription: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        letterSpacing: -0.2,
        opacity: 0.8,
    },
});

export default About;