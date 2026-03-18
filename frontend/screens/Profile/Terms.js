import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
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

const Terms = ({ navigation }) => {
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();

    const Section = ({ title, content }) => (
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textMain }]}>{title}</Text>
            <Text style={[styles.sectionText, { color: colors.textSecondary }]}>{content}</Text>
        </View>
    );

    return (
        <LinearGradient colors={colors.background} style={styles.container}>
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="close-outline" size={30} color={colors.textMain} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.textMain }]}>Terms of Service</Text>
                <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>Last Updated: March 2026</Text>
            </View>

            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Summary Card */}
                <View style={[styles.summaryCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                    <View style={styles.summaryHeader}>
                        <Ionicons name="document-text" size={20} color={colors.primary} />
                        <Text style={[styles.summaryTitle, { color: colors.textMain }]}>TL;DR Summary</Text>
                    </View>
                    <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
                        We value your privacy. Your Echoes are yours, you control your location data, and we promise to never sell your personal information to third parties.
                    </Text>
                </View>

                {/* Legal Sections */}
                <Section 
                    title="1. Acceptance of Terms" 
                    content="By creating an Echo Stamp account, you agree to these terms. If you do not agree, please do not use the service." 
                />

                <Section 
                    title="2. User Content & Echoes" 
                    content="You retain all ownership rights to the photos, text, and location data you post. However, by using the app, you grant us a license to host and store this content so you can access it across devices." 
                />

                <Section 
                    title="3. Location Services" 
                    content="Echo Stamp relies on GPS data to function. You can revoke location permissions at any time through your device settings, though some features may become unavailable." 
                />

                <Section 
                    title="4. Prohibited Conduct" 
                    content="You agree not to use Echo Stamp for any illegal activities, harassment, or to upload malicious code that could harm the Echo Stamp ecosystem." 
                />

                <Section 
                    title="5. Account Termination" 
                    content="We reserve the right to suspend accounts that violate these terms. You may delete your account and all associated data at any time through the Privacy settings." 
                />

                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                        Questions about our Terms? Contact us at legal@echostamp.com
                    </Text>
                </View>
            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingHorizontal: 20, marginBottom: 10 },
    backBtn: { marginBottom: 10 },
    title: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
    lastUpdated: { fontSize: 13, fontWeight: '600', marginTop: 4 },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 60 },
    summaryCard: { 
        padding: 20, 
        borderRadius: 20, 
        borderWidth: 1, 
        marginTop: 20, 
        marginBottom: 30 
    },
    summaryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
    summaryTitle: { fontSize: 16, fontWeight: '800' },
    summaryText: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
    section: { marginBottom: 25 },
    sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 8 },
    sectionText: { fontSize: 15, lineHeight: 22, fontWeight: '500' },
    footer: { marginTop: 20, alignItems: 'center', paddingBottom: 20 },
    footerText: { fontSize: 12, textAlign: 'center', fontWeight: '600', opacity: 0.7 }
});

export default Terms;