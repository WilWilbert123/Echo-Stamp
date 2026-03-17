import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
    Dimensions,
    LayoutAnimation,
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

    const faqs = [
        {
            id: 1,
            question: "How do I create an Echo?",
            answer: "Tap the '+' icon on the Map or Home screen. You can add photos, mood tags, and your current location to save a memory.",
            category: "Getting Started"
        },
        {
            id: 2,
            question: "Is my location data private?",
            answer: "Yes. Your Echoes are private by default. We only use your location to pin your memories on your personal map.",
            category: "Privacy"
        },
        {
            id: 3,
            question: "How do Level Ranks work?",
            answer: "The more locations you explore and 'Echo', the higher your level. Every 50 Echoes earns you a new Pioneer Rank!",
            category: "Account"
        }
    ];

    const toggleFaq = (id) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedFaq(expandedFaq === id ? null : id);
    };

    const QuickAction = ({ icon, title, subtitle, color }) => (
        <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
            activeOpacity={0.7}
        >
            <View style={[styles.actionIcon, { backgroundColor: `${color}20` }]}>
                <Ionicons name={icon} size={24} color={color} />
            </View>
            <View>
                <Text style={[styles.actionTitle, { color: colors.textMain }]}>{title}</Text>
                <Text style={[styles.actionSub, { color: colors.textSecondary }]}>{subtitle}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <LinearGradient colors={colors.background} style={styles.container}>
            <ScrollView 
                contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Header Section */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={28} color={colors.textMain} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: colors.textMain }]}>Help Center</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>How can we help you today?</Text>
                </View>

                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <View style={[styles.searchBar, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                        <Ionicons name="search" size={20} color={colors.textSecondary} />
                        <TextInput 
                            placeholder="Search for articles..."
                            placeholderTextColor={colors.textSecondary}
                            style={[styles.searchInput, { color: colors.textMain }]}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </View>

                {/* Contact Options */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Contact Us</Text>
                    <View style={styles.actionGrid}>
                        <QuickAction 
                            icon="chatbubble-ellipses-outline" 
                            title="Live Chat" 
                            subtitle="Wait time: 2 mins" 
                            color="#0EA5E9" 
                        />
                        <QuickAction 
                            icon="mail-outline" 
                            title="Email Support" 
                            subtitle="Reply in 24 hours" 
                            color="#8B5CF6" 
                        />
                    </View>
                </View>

                {/* FAQ Accordion */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Frequently Asked</Text>
                    {faqs.map((faq) => (
                        <TouchableOpacity 
                            key={faq.id}
                            onPress={() => toggleFaq(faq.id)}
                            activeOpacity={0.8}
                            style={[styles.faqCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
                        >
                            <View style={styles.faqHeader}>
                                <Text style={[styles.faqQuestion, { color: colors.textMain }]}>{faq.question}</Text>
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
                    ))}
                </View>

                {/* Community Link */}
                <TouchableOpacity style={[styles.communityCard, { backgroundColor: colors.primary }]}>
                    <Ionicons name="people" size={40} color="rgba(255,255,255,0.3)" style={styles.commIcon} />
                    <Text style={styles.commTitle}>Join the Community</Text>
                    <Text style={styles.commSub}>Ask other Pioneers for tips and tricks!</Text>
                </TouchableOpacity>

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
    searchBar: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: 15, 
        height: 55, 
        borderRadius: 18, 
        borderWidth: 1 
    },
    searchInput: { flex: 1, marginLeft: 12, fontSize: 16, fontWeight: '500' },
    section: { paddingHorizontal: 20, marginBottom: 30 },
    sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 15, marginLeft: 5 },
    actionGrid: { gap: 12 },
    actionCard: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        padding: 18, 
        borderRadius: 22, 
        borderWidth: 1, 
        gap: 15 
    },
    actionIcon: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
    actionTitle: { fontSize: 16, fontWeight: '700' },
    actionSub: { fontSize: 13, fontWeight: '500', marginTop: 2 },
    faqCard: { padding: 20, borderRadius: 22, borderWidth: 1, marginBottom: 10 },
    faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    faqQuestion: { fontSize: 15, fontWeight: '700', flex: 1, paddingRight: 10 },
    faqAnswer: { fontSize: 14, lineHeight: 20, marginTop: 12, fontWeight: '500' },
    communityCard: { marginHorizontal: 20, padding: 25, borderRadius: 28, overflow: 'hidden' },
    commIcon: { position: 'absolute', right: -10, bottom: -10 },
    commTitle: { color: '#FFF', fontSize: 20, fontWeight: '900' },
    commSub: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600', marginTop: 4 }
});

export default Help;