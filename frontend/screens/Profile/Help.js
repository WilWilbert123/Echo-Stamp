import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as MailComposer from 'expo-mail-composer';
import React, { useState } from 'react';
import {
    Alert,
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

    const handleEmailSupport = async () => {
        const isAvailable = await MailComposer.isAvailableAsync();
        if (isAvailable) {
            MailComposer.composeAsync({
                recipients: ['stampecho22@gmail.com'],
                subject: 'Support Request - Echo Stamp',
                body: `\n\n---\nPlatform: ${Platform.OS}\nApp: Echo Stamp v1.0`,
            });
        } else {
            Alert.alert("Error", "Mail app is not available on this device.");
        }
    };

    const QuickAction = ({ icon, title, subtitle, color, onPress }) => (
        <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
            activeOpacity={0.8}
            onPress={onPress}
        >
            <View style={[styles.actionIcon, { backgroundColor: `${color}15` }]}>
                <Ionicons name={icon} size={24} color={color} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[styles.actionTitle, { color: colors.textMain }]}>{title}</Text>
                <Text style={[styles.actionSub, { color: colors.textSecondary }]}>{subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} opacity={0.5} />
        </TouchableOpacity>
    );

    const faqs = [
        { id: 1, question: "How do I create an Echo?", answer: "Navigate to the Map and tap the '+' button or long-press any location to drop a memory stamp." },
        { id: 2, question: "How do I level up my rank?", answer: "Every 50 Echoes you create increases your rank." },
        { id: 3, question: "Is my data private?", answer: "Yes. Your Echoes are stored securely and encrypted." },
        { id: 4, question: "How does the AI Assistant work?", answer: "The Echo AI helps you find specific memories using natural language." }
    ];

    const filteredFaqs = faqs.filter(f => f.question.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <LinearGradient colors={colors.background} style={styles.container}>
            <ScrollView 
                contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: 40 }} 
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={28} color={colors.textMain} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: colors.textMain }]}>Help Center</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>How can we help you today?</Text>
                </View>

                {/* Search */}
                <View style={styles.searchContainer}>
                    <View style={[styles.searchBar, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                        <Ionicons name="search" size={20} color={colors.textSecondary} />
                        <TextInput 
                            placeholder="Search help articles..."
                            placeholderTextColor={colors.textSecondary}
                            style={[styles.searchInput, { color: colors.textMain }]}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>

                {/* Assistance Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Assistance</Text>
                    <View style={styles.actionGrid}>
                        
                        <QuickAction 
                            icon="mail" 
                            title="Email Support" 
                            subtitle="Direct line to our team" 
                            color="#EC4899" 
                            onPress={handleEmailSupport}
                        />
                    </View>
                </View>

                {/* FAQ Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Frequently Asked</Text>
                    {filteredFaqs.map((faq) => (
                        <TouchableOpacity 
                            key={faq.id}
                            onPress={() => {
                                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                                setExpandedFaq(expandedFaq === faq.id ? null : faq.id);
                            }}
                            style={[styles.faqCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
                        >
                            <View style={styles.faqHeader}>
                                <Text style={[styles.faqQuestion, { color: colors.textMain }]}>{faq.question}</Text>
                                <Ionicons 
                                    name={expandedFaq === faq.id ? "remove" : "add"} 
                                    size={20} 
                                    color={colors.primary} 
                                />
                            </View>
                            {expandedFaq === faq.id && (
                                <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>{faq.answer}</Text>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingHorizontal: 25, marginBottom: 25 },
    backBtn: { marginBottom: 15, marginLeft: -10 },
    title: { fontSize: 32, fontWeight: '900', letterSpacing: -1 },
    subtitle: { fontSize: 16, fontWeight: '500', marginTop: 5 },
    searchContainer: { paddingHorizontal: 20, marginBottom: 30 },
    searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, height: 55, borderRadius: 18, borderWidth: 1 },
    searchInput: { flex: 1, marginLeft: 12, fontSize: 16, fontWeight: '500' },
    section: { paddingHorizontal: 20, marginBottom: 30 },
    sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 15, marginLeft: 5 },
    actionGrid: { gap: 12 },
    actionCard: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 22, borderWidth: 1, gap: 15 },
    actionIcon: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
    actionTitle: { fontSize: 16, fontWeight: '700' },
    actionSub: { fontSize: 13, fontWeight: '500', marginTop: 2 },
    faqCard: { padding: 20, borderRadius: 22, borderWidth: 1, marginBottom: 10 },
    faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    faqQuestion: { fontSize: 15, fontWeight: '700', flex: 1, paddingRight: 10 },
    faqAnswer: { fontSize: 14, lineHeight: 20, marginTop: 12, fontWeight: '500' },
});

export default Help;