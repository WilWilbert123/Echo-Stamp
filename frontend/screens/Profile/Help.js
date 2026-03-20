import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as MailComposer from 'expo-mail-composer';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    LayoutAnimation,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../context/ThemeContext';
import { addMessage, clearHistory, setChatLoading, setHistory } from '../../redux/chatSlice';
import { askAiAssistant, clearChatHistory, fetchChatHistory } from '../../services/api';

const { width } = Dimensions.get('window');

const Help = ({ navigation }) => {
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch();

    // Redux State
    const chatHistory = useSelector((state) => state.chat.history);
    const isTyping = useSelector((state) => state.chat.loading);
    
    // Local UI States
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedFaq, setExpandedFaq] = useState(null);
    const [isChatVisible, setIsChatVisible] = useState(false);
    const [chatMessage, setChatMessage] = useState('');

    const scrollViewRef = useRef();

    // 1. Sync Chat History on Mount/Modal Open
    useEffect(() => {
        const loadHistory = async () => {
            try {
                const response = await fetchChatHistory();
                if (response.data.length > 0) {
                    dispatch(setHistory(response.data));
                }
            } catch (error) {
                console.log("No previous history found or network error.");
            }
        };

        if (isChatVisible) {
            loadHistory();
        }
    }, [isChatVisible]);

    // 2. Action: Delete History
    const confirmDeleteHistory = () => {
        Alert.alert(
            "Clear History",
            "Are you sure you want to delete your chat with Echo AI? This cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive", 
                    onPress: handleDeleteHistory 
                }
            ]
        );
    };

    const handleDeleteHistory = async () => {
        try {
            await clearChatHistory();
            dispatch(clearHistory());
            Alert.alert("Success", "Your chat history has been cleared.");
        } catch (error) {
            Alert.alert("Error", "Could not clear history. Please try again.");
        }
    };

    // 3. Action: Send Message
    const sendMessage = async () => {
        if (chatMessage.trim().length === 0 || isTyping) return;
        
        const userMsg = { role: 'user', parts: [{ text: chatMessage.trim() }] };
        dispatch(addMessage(userMsg));
        
        const messageToSend = chatMessage;
        setChatMessage('');
        dispatch(setChatLoading(true));

        try {
            // Send current message + existing history to Gemini
            const response = await askAiAssistant(messageToSend, chatHistory);

            const botMsg = { 
                role: 'model', 
                parts: [{ text: response.data.text }] 
            };
            dispatch(addMessage(botMsg));
        } catch (error) {
            dispatch(addMessage({ 
                role: 'model', 
                parts: [{ text: "I lost my connection to the Echo-sphere. Try again?" }] 
            }));
        } finally {
            dispatch(setChatLoading(false));
        }
    };

    const handleEmailSupport = async () => {
        const isAvailable = await MailComposer.isAvailableAsync();
        if (isAvailable) {
            MailComposer.composeAsync({
                recipients: ['support@echoapp.com'],
                subject: 'Support Request - Echo Stamp',
                body: `\n\n---\nPlatform: ${Platform.OS}`,
            });
        }
    };

    const toggleFaq = (id) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedFaq(expandedFaq === id ? null : id);
    };

    const QuickAction = ({ icon, title, subtitle, color, onPress }) => (
        <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
            activeOpacity={0.7}
            onPress={onPress}
        >
            <View style={[styles.actionIcon, { backgroundColor: `${color}20` }]}>
                <Ionicons name={icon} size={24} color={color} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[styles.actionTitle, { color: colors.textMain }]}>{title}</Text>
                <Text style={[styles.actionSub, { color: colors.textSecondary }]}>{subtitle}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <LinearGradient colors={colors.background} style={styles.container}>
            <ScrollView contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
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
                            icon="sparkles" 
                            title="AI Assistant" 
                            subtitle="Instant help powered by AI" 
                            color={colors.primary} 
                            onPress={() => setIsChatVisible(true)}
                        />
                        <QuickAction 
                            icon="mail-outline" 
                            title="Email Support" 
                            subtitle="Reply in 24 hours" 
                            color="#8B5CF6" 
                            onPress={handleEmailSupport}
                        />
                    </View>
                </View>

                {/* FAQ Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Frequently Asked</Text>
                    {[
                        { id: 1, question: "How do I create an Echo?", answer: "Tap the '+' icon on the Map or Home screen." },
                        { id: 2, question: "Is my data private?", answer: "Yes, your Echoes are private by default." }
                    ].map((faq) => (
                        <TouchableOpacity 
                            key={faq.id}
                            onPress={() => toggleFaq(faq.id)}
                            style={[styles.faqCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
                        >
                            <View style={styles.faqHeader}>
                                <Text style={[styles.faqQuestion, { color: colors.textMain }]}>{faq.question}</Text>
                                <Ionicons name={expandedFaq === faq.id ? "chevron-up" : "chevron-down"} size={20} color={colors.textSecondary} />
                            </View>
                            {expandedFaq === faq.id && <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>{faq.answer}</Text>}
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* --- LIVE CHAT MODAL --- */}
            <Modal visible={isChatVisible} animationType="slide" onRequestClose={() => setIsChatVisible(false)}>
                <View style={[styles.modalContainer, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
                    <View style={[styles.chatHeader, { paddingTop: insets.top + 10, borderBottomColor: colors.glassBorder }]}>
                        <TouchableOpacity onPress={() => setIsChatVisible(false)}>
                            <Ionicons name="close" size={28} color={colors.textMain} />
                        </TouchableOpacity>
                        <Text style={[styles.chatHeaderText, { color: colors.textMain }]}>Echo AI Assistant</Text>
                        
                        <TouchableOpacity onPress={confirmDeleteHistory}>
                            <Ionicons name="trash-outline" size={24} color="#EF4444" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView 
                        ref={scrollViewRef}
                        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                        style={styles.chatArea}
                        contentContainerStyle={{ padding: 20 }}
                    >
                        {chatHistory.length === 0 && (
                            <View style={[styles.messageBubble, styles.botMessage, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]}>
                                <Text style={{ color: colors.textMain, fontWeight: '500' }}>
                                    Hi! I'm your Echo Assistant. Ask me anything about your memories or app levels!
                                </Text>
                            </View>
                        )}

                        {chatHistory.map((item, index) => (
                            <View key={index} style={[
                                styles.messageBubble, 
                                item.role === 'user' ? [styles.userMessage, { backgroundColor: colors.primary }] : [styles.botMessage, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0' }]
                            ]}>
                                <Text style={{ color: item.role === 'user' ? '#FFF' : colors.textMain, fontWeight: '500' }}>
                                    {item.parts[0].text}
                                </Text>
                            </View>
                        ))}
                        {isTyping && (
                            <View style={[styles.messageBubble, styles.botMessage, { backgroundColor: isDark ? '#1E293B' : '#E2E8F0', width: 60, alignItems: 'center' }]}>
                                <ActivityIndicator size="small" color={colors.primary} />
                            </View>
                        )}
                    </ScrollView>

                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                        <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 10, backgroundColor: isDark ? '#1E293B' : '#FFF' }]}>
                            <TextInput 
                                style={[styles.chatInput, { color: colors.textMain, backgroundColor: isDark ? '#0F172A' : '#F1F5F9' }]}
                                placeholder="How do I reach the next rank?"
                                placeholderTextColor={colors.textSecondary}
                                value={chatMessage}
                                onChangeText={setChatMessage}
                                editable={!isTyping}
                            />
                            <TouchableOpacity 
                                style={[styles.sendBtn, { backgroundColor: chatMessage.trim() && !isTyping ? colors.primary : '#94A3B8' }]} 
                                onPress={sendMessage}
                                disabled={!chatMessage.trim() || isTyping}
                            >
                                <Ionicons name="send" size={20} color="#FFF" />
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>
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
    modalContainer: { flex: 1 },
    chatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 15, borderBottomWidth: 1 },
    chatHeaderText: { fontSize: 18, fontWeight: '800' },
    chatArea: { flex: 1 },
    messageBubble: { padding: 12, borderRadius: 18, marginBottom: 10, maxWidth: '80%' },
    userMessage: { alignSelf: 'flex-end', borderBottomRightRadius: 2 },
    botMessage: { alignSelf: 'flex-start', borderBottomLeftRadius: 2 },
    inputContainer: { flexDirection: 'row', padding: 15, alignItems: 'center', gap: 10 },
    chatInput: { flex: 1, height: 45, borderRadius: 22, paddingHorizontal: 20, fontSize: 15 },
    sendBtn: { width: 45, height: 45, borderRadius: 22, justifyContent: 'center', alignItems: 'center' }
});

export default Help;