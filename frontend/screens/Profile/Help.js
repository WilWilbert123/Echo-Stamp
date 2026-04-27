import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as MailComposer from 'expo-mail-composer';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    LayoutAnimation,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

const Help = ({ navigation }) => {
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedFaq, setExpandedFaq] = useState(null);
    
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

    const handleEmailSupport = async () => {
        const isAvailable = await MailComposer.isAvailableAsync();
        if (isAvailable) {
            MailComposer.composeAsync({
                recipients: ['stampecho22@gmail.com'],
                subject: 'Support Request - Echo Stamp',
                body: `\n\n---\nPlatform: ${Platform.OS}\nApp Version: 1.3.0\nDevice: ${Platform.OS === 'ios' ? 'iOS' : 'Android'}`,
            });
        } else {
            Alert.alert(
                "Email Not Available",
                "Please send us an email directly at stampecho22@gmail.com",
                [{ text: "OK", style: "default" }]
            );
        }
    };

    const QuickAction = ({ icon, title, subtitle, color, onPress }) => (
        <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F6' }]}
            activeOpacity={0.7}
            onPress={onPress}
        >
            <View style={[styles.actionIcon, { backgroundColor: `${color}15` }]}>
                <Ionicons name={icon} size={24} color={color} />
            </View>
            <View style={styles.actionContent}>
                <Text style={[styles.actionTitle, { color: colors.textMain }]}>{title}</Text>
                <Text style={[styles.actionSub, { color: colors.textSecondary }]}>{subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} style={styles.actionChevron} />
        </TouchableOpacity>
    );

    const faqs = [
        { 
            id: 1, 
            question: "How do I create an Echo?", 
            answer: "Navigate to the Map and tap the '+' button or long-press any location to drop a memory stamp. You can add photos, notes, and tags to make it special.",
            icon: "create-outline"
        },
        { 
            id: 2, 
            question: "How do I level up my rank?", 
            answer: "Every 50 Echoes you create increases your rank. Higher ranks unlock special badges and features. Keep exploring and stamping!",
            icon: "trending-up-outline"
        },
        { 
            id: 3, 
            question: "Is my data private?", 
            answer: "Yes absolutely. Your Echoes are stored securely with end-to-end encryption. We never share your personal data with third parties.",
            icon: "shield-outline"
        },
        { 
            id: 4, 
            question: "How does the AI Assistant work?", 
            answer: "The Echo AI helps you find specific memories using natural language. Just ask 'Show me my beach memories' or 'Find stamps from last summer' and it will smartly filter your Echoes.",
            icon: "bulb-outline"
        },
        { 
            id: 5, 
            question: "Can I edit or delete an Echo?", 
            answer: "Yes! Tap on any Echo in your collection, then use the edit or delete buttons. You can update photos, notes, or remove it entirely.",
            icon: "create-outline"
        },
        { 
            id: 6, 
            question: "What happens if I change devices?", 
            answer: "Your Echoes are cloud-synced. Simply log in with the same account on your new device, and all your stamps will be there automatically.",
            icon: "sync-outline"
        }
    ];

    const filteredFaqs = faqs.filter(f => 
        f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <LinearGradient colors={colors.background} style={styles.container}>
            <ScrollView 
                contentContainerStyle={{ paddingTop: insets.top + 10, paddingBottom: 40 }} 
                showsVerticalScrollIndicator={false}
                bounces={true}
            >
                {/* Header */}
                <Animated.View style={[
                    styles.header,
                    { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                ]}>
                    <TouchableOpacity 
                        onPress={() => navigation.goBack()} 
                        style={styles.backBtn}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="chevron-back" size={28} color={colors.textMain} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: colors.textMain }]}>Help Center</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        Get answers to your questions
                    </Text>
                </Animated.View>

                {/* Search Bar */}
                <Animated.View style={[
                    styles.searchContainer,
                    { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                ]}>
                    <View style={[styles.searchBar, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F6' }]}>
                        <Ionicons name="search" size={20} color={colors.textSecondary} />
                        <TextInput 
                            placeholder="Search questions..."
                            placeholderTextColor={colors.textSecondary}
                            style={[styles.searchInput, { color: colors.textMain }]}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            returnKeyType="search"
                            autoCapitalize="none"
                        />
                        {searchQuery !== '' && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                            </TouchableOpacity>
                        )}
                    </View>
                </Animated.View>

                {/* Quick Actions Section */}
                <Animated.View style={[
                    styles.section,
                    { opacity: fadeAnim, transform: [{ translateX: slideAnim }] }
                ]}>
                    <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Quick Help</Text>
                    <View style={styles.actionGrid}>
                        <QuickAction 
                            icon="mail-outline" 
                            title="Email Support" 
                            subtitle="Direct message to our team" 
                            color="#EC4899" 
                            onPress={handleEmailSupport}
                        />
                    </View>
                </Animated.View>

                {/* FAQ Section */}
                <Animated.View style={[
                    styles.section,
                    { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                ]}>
                    <Text style={[styles.sectionTitle, { color: colors.textMain }]}>
                        Frequently Asked Questions
                        <Text style={[styles.faqCount, { color: colors.textSecondary }]}> ({filteredFaqs.length})</Text>
                    </Text>
                    
                    {filteredFaqs.length === 0 ? (
                        <View style={[styles.emptyState, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F6' }]}>
                            <Ionicons name="search-outline" size={48} color={colors.textSecondary} />
                            <Text style={[styles.emptyStateTitle, { color: colors.textMain }]}>No results found</Text>
                            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                                Try searching with different keywords
                            </Text>
                        </View>
                    ) : (
                        filteredFaqs.map((faq, index) => (
                            <TouchableOpacity 
                                key={faq.id}
                                onPress={() => {
                                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                                    setExpandedFaq(expandedFaq === faq.id ? null : faq.id);
                                }}
                                activeOpacity={0.7}
                                style={[
                                    styles.faqCard, 
                                    { 
                                        backgroundColor: isDark ? '#1C1C1E' : '#F2F2F6',
                                        marginBottom: index === filteredFaqs.length - 1 ? 0 : 12
                                    }
                                ]}
                            >
                                <View style={styles.faqHeader}>
                                    <View style={styles.faqHeaderLeft}>
                                        <View style={[styles.faqIcon, { backgroundColor: `${colors.primary}10` }]}>
                                            <Ionicons name={faq.icon} size={18} color={colors.primary} />
                                        </View>
                                        <Text style={[styles.faqQuestion, { color: colors.textMain }]}>{faq.question}</Text>
                                    </View>
                                    <Ionicons 
                                        name={expandedFaq === faq.id ? "chevron-up" : "chevron-down"} 
                                        size={20} 
                                        color={colors.textSecondary}
                                    />
                                </View>
                                {expandedFaq === faq.id && (
                                    <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>{faq.answer}</Text>
                                )}
                            </TouchableOpacity>
                        ))
                    )}
                </Animated.View>

                {/* Footer Note */}
                <Animated.View style={[
                    styles.footer,
                    { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                ]}>
                    <View style={[styles.footerNote, { backgroundColor: isDark ? '#1C1C1E' : '#F2F2F6' }]}>
                        <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
                        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                            Still need help? Our support team is here for you.
                        </Text>
                    </View>
                    <Text style={[styles.responseTime, { color: colors.textSecondary }]}>
                        Average response time: 24 hours
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
        marginBottom: 24 
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
    
    subtitle: { 
        fontSize: 16, 
        fontWeight: '400', 
        opacity: 0.7,
        letterSpacing: -0.3,
    },
    
    searchContainer: { 
        paddingHorizontal: 20, 
        marginBottom: 32 
    },
    
    searchBar: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: 16, 
        height: 52, 
        borderRadius: 16, 
        gap: 12,
    },
    
    searchInput: { 
        flex: 1, 
        fontSize: 16, 
        fontWeight: '400',
        letterSpacing: -0.3,
    },
    
    section: { 
        paddingHorizontal: 20, 
        marginBottom: 32 
    },
    
    sectionTitle: { 
        fontSize: 20, 
        fontWeight: '600', 
        letterSpacing: -0.5,
        marginBottom: 16,
    },
    
    faqCount: {
        fontSize: 15,
        fontWeight: '400',
    },
    
    actionGrid: { 
        gap: 12 
    },
    
    actionCard: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        padding: 16, 
        borderRadius: 16, 
        gap: 14,
    },
    
    actionIcon: { 
        width: 48, 
        height: 48, 
        borderRadius: 12, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    
    actionContent: {
        flex: 1,
    },
    
    actionTitle: { 
        fontSize: 16, 
        fontWeight: '600',
        letterSpacing: -0.3,
        marginBottom: 2,
    },
    
    actionSub: { 
        fontSize: 13, 
        fontWeight: '400',
        opacity: 0.7,
        letterSpacing: -0.3,
    },
    
    actionChevron: {
        opacity: 0.5,
    },
    
    faqCard: { 
        padding: 18, 
        borderRadius: 16, 
    },
    
    faqHeader: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        gap: 12,
    },
    
    faqHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    
    faqIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    
    faqQuestion: { 
        fontSize: 16, 
        fontWeight: '500',
        letterSpacing: -0.3,
        flex: 1,
    },
    
    faqAnswer: { 
        fontSize: 14, 
        lineHeight: 20, 
        marginTop: 14,
        marginLeft: 44,
        fontWeight: '400',
        letterSpacing: -0.3,
        opacity: 0.8,
    },
    
    emptyState: {
        padding: 40,
        borderRadius: 16,
        alignItems: 'center',
        gap: 12,
    },
    
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: '600',
        letterSpacing: -0.3,
        marginTop: 8,
    },
    
    emptyStateText: {
        fontSize: 14,
        fontWeight: '400',
        textAlign: 'center',
        letterSpacing: -0.3,
        opacity: 0.7,
    },
    
    footer: {
        paddingHorizontal: 20,
        marginTop: 8,
        gap: 12,
    },
    
    footerNote: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        gap: 12,
    },
    
    footerText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '400',
        letterSpacing: -0.3,
    },
    
    responseTime: {
        fontSize: 12,
        fontWeight: '400',
        textAlign: 'center',
        opacity: 0.6,
        letterSpacing: -0.3,
    },
});

export default Help;