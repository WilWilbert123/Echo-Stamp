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
    
    // Minimal Tech Stack
    const techStack = [
        { name: 'React Native', icon: 'logo-react', color: '#61DAFB' },
        { name: 'Node.js', icon: 'logo-nodejs', color: '#339933' },
        { name: 'Express', icon: 'server-outline', color: '#000000' },
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

    const TechDetailModal = ({ tech, visible, onClose }) => (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <TouchableOpacity 
                style={styles.modalOverlay} 
                activeOpacity={1} 
                onPress={onClose}
            >
                <View style={[styles.modalContent, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
                    <View style={[styles.modalIcon, { backgroundColor: `${tech?.color}15` }]}>
                        <Ionicons name={tech?.icon} size={32} color={tech?.color} />
                    </View>
                    <Text style={[styles.modalTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>{tech?.name}</Text>
                    <Text style={[styles.modalDescription, { color: isDark ? '#98989E' : '#6C6C70' }]}>
                        Integrated seamlessly into Echo Stamp for optimal performance and user experience.
                    </Text>
                </View>
            </TouchableOpacity>
        </Modal>
    );

    return (
        <LinearGradient colors={colors.background} style={styles.container}>
            <ScrollView 
                contentContainerStyle={{ 
                    paddingTop: insets.top + 10, 
                    paddingBottom: 40 
                }}
                showsVerticalScrollIndicator={false}
                bounces={true}
            >
                {/* Back Button - Minimal */}
                <Animated.View style={{ opacity: fadeAnim, paddingHorizontal: 16 }}>
                    <TouchableOpacity 
                        onPress={() => navigation.goBack()} 
                        style={styles.backBtn}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="chevron-back" size={24} color={colors.textMain} />
                    </TouchableOpacity>
                </Animated.View>

                {/* App Logo/Branding Section - Minimal */}
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
                            style={{ width: 200, height: 200 }}
                            source={isDark ? require('../../assets/TechRotate2.json') : require('../../assets/TechRotate.json')}
                        />
                    </View>
                </Animated.View>

                {/* Mission Section - Fixed */}
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

                {/* Features Grid - Minimal */}
                <Animated.View 
                    style={[
                        styles.featuresSection,
                        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                    ]}
                >
                    <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Features</Text>
                    <View style={styles.featuresGrid}>
                        {features.map((feature, index) => (
                            <View key={index} style={[styles.featureItem, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F6' }]}>
                                <View style={[styles.featureIcon, { backgroundColor: `${colors.primary}10` }]}>
                                    <Ionicons name={feature.icon} size={22} color={colors.primary} />
                                </View>
                                <Text style={[styles.featureTitle, { color: colors.textMain }]}>{feature.title}</Text>
                                <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>{feature.description}</Text>
                            </View>
                        ))}
                    </View>
                </Animated.View>

                {/* Tech Stack - Minimal */}
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
                        <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Technology</Text>
                        <Ionicons 
                            name={showTechStack ? "chevron-up" : "chevron-forward"} 
                            size={20} 
                            color={colors.textSecondary} 
                        />
                    </TouchableOpacity>
                    
                    {showTechStack && (
                        <Animated.View style={[styles.techGrid, { marginTop: 16 }]}>
                            <View style={styles.techList}>
                                {techStack.map((tech, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        activeOpacity={0.7}
                                        onPress={() => setSelectedTech(tech)}
                                        style={[styles.techItem, { borderBottomColor: isDark ? '#2C2C2E' : '#E5E5EA' }]}
                                    >
                                        <View style={[styles.techIcon, { backgroundColor: `${tech.color}15` }]}>
                                            <Ionicons name={tech.icon} size={18} color={tech.color} />
                                        </View>
                                        <Text style={[styles.techName, { color: colors.textMain }]}>{tech.name}</Text>
                                        <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} style={styles.techChevron} />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </Animated.View>
                    )}
                </Animated.View>

                {/* Stats - Minimal */}
                <Animated.View 
                    style={[
                        styles.statsSection,
                        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                    ]}
                >
                    <View style={[styles.statsContainer, { borderTopColor: isDark ? '#2C2C2E' : '#E5E5EA', borderBottomColor: isDark ? '#2C2C2E' : '#E5E5EA' }]}>
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: colors.textMain }]}>98%</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Crash Free</Text>
                        </View>
                        <View style={[styles.statDivider, { backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA' }]} />
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: colors.textMain }]}>&lt;2s</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Load Time</Text>
                        </View>
                        <View style={[styles.statDivider, { backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA' }]} />
                        <View style={styles.statItem}>
                            <Text style={[styles.statValue, { color: colors.textMain }]}>24/7</Text>
                            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Support</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* Credits - Minimal */}
                <Animated.View 
                    style={[
                        styles.creditsSection,
                        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                    ]}
                >
                    <Text style={[styles.developerName, { color: colors.textMain }]}>John Wilbert Gamis</Text>
                    <Text style={[styles.developerRole, { color: colors.textSecondary }]}>Lead Developer</Text>
                    <Text style={[styles.copyright, { color: colors.textSecondary }]}>© 2026 Echo Stamp</Text>
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
    container: { flex: 1 },
    
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 8,
    },
    
    brandSection: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    
    logoContainer: {
        width: 200,
        height: 200,
        marginBottom: 8,
    },
    
    missionSection: {
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
        marginBottom: 8,
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
        opacity: 0.6,
        marginBottom: 20,
    },
    
    missionDivider: {
        width: 40,
        height: 1,
        backgroundColor: '#8E8E93',
        opacity: 0.3,
        marginBottom: 20,
    },
    
    missionText: {
        fontSize: 17,
        lineHeight: 24,
        fontWeight: '400',
        textAlign: 'center',
        letterSpacing: -0.3,
    },
    
    featuresSection: {
        paddingHorizontal: 20,
        marginTop: 16,
        marginBottom: 24,
    },
    
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        letterSpacing: -0.5,
        marginBottom: 16,
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
        borderRadius: 16,
        gap: 8,
    },
    
    featureIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    
    featureTitle: {
        fontSize: 15,
        fontWeight: '600',
        letterSpacing: -0.3,
    },
    
    featureDesc: {
        fontSize: 13,
        fontWeight: '400',
        lineHeight: 18,
        opacity: 0.7,
    },
    
    techSection: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    
    techHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    
    techList: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    
    techItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderBottomWidth: 0.5,
    },
    
    techIcon: {
        width: 34,
        height: 34,
        borderRadius: 17,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    
    techName: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        letterSpacing: -0.3,
    },
    
    techChevron: {
        opacity: 0.5,
    },
    
    techGrid: {
        marginTop: 8,
    },
    
    statsSection: {
        marginVertical: 24,
    },
    
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 20,
        borderTopWidth: 0.5,
        borderBottomWidth: 0.5,
    },
    
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        letterSpacing: -0.5,
        marginBottom: 4,
    },
    
    statLabel: {
        fontSize: 12,
        fontWeight: '400',
        opacity: 0.6,
    },
    
    statDivider: {
        width: 0.5,
        height: 30,
    },
    
    creditsSection: {
        alignItems: 'center',
        paddingVertical: 32,
        paddingHorizontal: 20,
    },
    
    developerName: {
        fontSize: 15,
        fontWeight: '500',
        letterSpacing: -0.3,
        marginBottom: 4,
    },
    
    developerRole: {
        fontSize: 13,
        fontWeight: '400',
        opacity: 0.6,
        marginBottom: 12,
    },
    
    copyright: {
        fontSize: 12,
        fontWeight: '400',
        opacity: 0.5,
    },
    
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    
    modalContent: {
        width: width - 48,
        padding: 24,
        borderRadius: 20,
        alignItems: 'center',
        gap: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
    },
    
    modalIcon: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        letterSpacing: -0.5,
    },
    
    modalDescription: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 20,
        letterSpacing: -0.3,
    },
});

export default About;