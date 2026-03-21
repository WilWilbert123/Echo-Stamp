import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import React, { useRef } from 'react';
import {
    Alert,
    Dimensions,
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
    // isDark and colors are extracted from your ThemeContext
    const { colors, isDark } = useTheme(); 
    const insets = useSafeAreaInsets();
    const animation = useRef(null);

    const handleDevelopingLink = (platform) => {
        Alert.alert(
            "Coming Soon!",
            `Our ${platform} page is currently under development. Stay tuned for updates!`,
            [{ text: "OK", style: "default" }]
        );
    };

    return (
        <LinearGradient colors={colors.background} style={styles.container}>
            <ScrollView 
                contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: 60 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Back Button */}
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={28} color={colors.textMain} />
                </TouchableOpacity>

                {/* App Logo/Branding Section */}
                <View style={styles.brandSection}>
                    <View style={styles.logoPlaceholder}>
                        <LottieView
                            autoPlay
                            loop
                            ref={animation}
                            style={{
                                width: 150,  
                                height: 150,
                            }}
                   
                            source={
                                isDark 
                                    ? require('../../assets/TechRotate2.json') 
                                    : require('../../assets/TechRotate.json')
                            }
                           
                            colorFilters={[
                                {
                                    keypath: "**", 
                                    color: colors.textMain, 
                                },
                            ]}
                        />
                    </View>
                    <Text style={[styles.appName, { color: colors.textMain }]}>Echo Stamp</Text>
                    <Text style={[styles.versionText, { color: colors.textSecondary }]}>Version 1.2.0 (Build 2603)</Text>
                </View>

                {/* Mission Section */}
                <View style={styles.contentSection}>
                    <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Our Mission</Text>
                    <Text style={[styles.description, { color: colors.textSecondary }]}>
                        Echo Stamp was built for the modern explorer. We believe that every place has a story, and every story deserves to be "stamped" in time. Our goal is to help you build a living map of your life's journey, one memory at a time.
                    </Text>
                </View>

                {/* Features Row */}
                <View style={styles.featuresRow}>
                    <View style={[styles.featureCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                        <Ionicons name="map-outline" size={24} color={colors.primary} />
                        <Text style={[styles.featureText, { color: colors.textMain }]}>Location Tracking</Text>
                    </View>
                    <View style={[styles.featureCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                        <Ionicons name="images-outline" size={24} color={colors.primary} />
                        <Text style={[styles.featureText, { color: colors.textMain }]}>Cloud Media</Text>
                    </View>
                </View>

                {/* Social & Links Section */}
                <View style={styles.linksSection}>
                    <Text style={[styles.sectionTitle, { color: colors.textMain, marginLeft: 20 }]}>Follow our Journey</Text>
                    <View style={[styles.linkContainer, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                        
                        {/* Instagram */}
                        <TouchableOpacity 
                            style={styles.linkItem} 
                            onPress={() => handleDevelopingLink('Instagram')}
                        >
                            <View style={[styles.socialIcon, { backgroundColor: '#E1306C20' }]}>
                                <Ionicons name="logo-instagram" size={20} color="#E1306C" />
                            </View>
                            <Text style={[styles.linkText, { color: colors.textMain }]}>Instagram</Text>
                            <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                        </TouchableOpacity>
                        
                        <View style={[styles.separator, { backgroundColor: colors.glassBorder }]} />
                        
                        {/* Facebook */}
                        <TouchableOpacity 
                            style={styles.linkItem} 
                            onPress={() => handleDevelopingLink('Facebook')}
                        >
                            <View style={[styles.socialIcon, { backgroundColor: '#1877F220' }]}>
                                <Ionicons name="logo-facebook" size={20} color="#1877F2" />
                            </View>
                            <Text style={[styles.linkText, { color: colors.textMain }]}>Facebook</Text>
                            <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                        </TouchableOpacity>

                        <View style={[styles.separator, { backgroundColor: colors.glassBorder }]} />
                        
                        {/* Official Website */}
                        <TouchableOpacity 
                            style={styles.linkItem} 
                            onPress={() => handleDevelopingLink('Website')}
                        >
                            <View style={[styles.socialIcon, { backgroundColor: `${colors.primary}20` }]}>
                                <Ionicons name="globe-outline" size={20} color={colors.primary} />
                            </View>
                            <Text style={[styles.linkText, { color: colors.textMain }]}>Official Website</Text>
                            <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Credits */}
                <View style={styles.footer}>
                    <Text style={[styles.madeBy, { color: colors.textSecondary }]}>Designed and Developed by jwg</Text>
                    <Text style={[styles.copyright, { color: colors.textSecondary }]}>© 2026 Echo Stamp Labs. All rights reserved.</Text>
                </View>
            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    backBtn: { marginLeft: 20, marginBottom: 10 },
    brandSection: { alignItems: 'center', marginVertical: 30 },
    logoPlaceholder: { 
        width: 150, 
        height: 150, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    appName: { fontSize: 32, fontWeight: '900', marginTop: 15, letterSpacing: -1 },
    versionText: { fontSize: 14, fontWeight: '600', marginTop: 4, opacity: 0.7 },
    contentSection: { paddingHorizontal: 25, marginBottom: 30 },
    sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 12 },
    description: { fontSize: 16, lineHeight: 24, fontWeight: '500' },
    featuresRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginBottom: 40 },
    featureCard: { flex: 1, padding: 20, borderRadius: 24, borderWidth: 1, alignItems: 'center', gap: 8 },
    featureText: { fontSize: 13, fontWeight: '700', textAlign: 'center' },
    linksSection: { marginBottom: 40 },
    linkContainer: { marginHorizontal: 20, borderRadius: 22, borderWidth: 1, overflow: 'hidden' },
    linkItem: { flexDirection: 'row', alignItems: 'center', padding: 15, gap: 15 },
    socialIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    linkText: { flex: 1, fontSize: 16, fontWeight: '600' },
    separator: { height: 1, width: '100%' },
    footer: { alignItems: 'center', paddingHorizontal: 40 },
    madeBy: { fontSize: 14, fontWeight: '700', marginBottom: 5 },
    copyright: { fontSize: 12, fontWeight: '500', opacity: 0.5, textAlign: 'center' }
});

export default About;