import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location'; // Added location import
import * as MailComposer from 'expo-mail-composer';
import React, { useEffect, useRef, useState } from 'react';
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

// Context & Redux
import { useTheme } from '../../context/ThemeContext';
import { addMessage, clearHistory, setChatLoading, setHistory } from '../../redux/chatSlice';
import { askAiAssistant, clearChatHistory, fetchChatHistory } from '../../services/api';

const { width } = Dimensions.get('window');

const Help = ({ navigation }) => {
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch();

    // Redux State
    const chatHistory = useSelector((state) => state.chat?.history || []);
    const isTyping = useSelector((state) => state.chat?.loading || false);
    
    // Local UI States
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedFaq, setExpandedFaq] = useState(null);
    const [isChatVisible, setIsChatVisible] = useState(false);
    const [chatMessage, setChatMessage] = useState('');
    const [location, setLocation] = useState(null); // Local location state

    const scrollViewRef = useRef();

    // Sync Chat History & Fetch Location
    useEffect(() => {
        const loadHistoryAndLocation = async () => {
            // 1. Fetch History
            try {
                const response = await fetchChatHistory();
                const historyData = response.data || response;
                if (Array.isArray(historyData)) {
                    dispatch(setHistory(historyData));
                }
            } catch (error) {
                console.log("Chat history sync skipped: Backend offline or empty.");
            }

            // 2. Request Location Permissions and Get Current Position
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status === 'granted') {
                    const currentLoc = await Location.getCurrentPositionAsync({
                        accuracy: Location.Accuracy.Balanced,
                    });
                    setLocation(currentLoc.coords);
                }
            } catch (error) {
                console.log("Location permission denied or failed.");
            }
        };

        if (isChatVisible) {
            loadHistoryAndLocation();
        }
    }, [isChatVisible, dispatch]);

    // Scroll to bottom when history changes or typing starts
    useEffect(() => {
        if (isChatVisible) {
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [chatHistory, isTyping, isChatVisible]);

    const handleSendMessage = async () => {
        if (!chatMessage.trim() || isTyping) return;
        
        const messageText = chatMessage.trim();
        const userMsg = { role: 'user', parts: [{ text: messageText }] };
        
        setChatMessage('');
        dispatch(addMessage(userMsg));
        dispatch(setChatLoading(true));

        try {
            // Passing 'location' as a second argument to your API service
            const response = await askAiAssistant(messageText, location);
            const responseText = response.data?.text || response.text;

            if (responseText) {
                dispatch(addMessage({ 
                    role: 'model', 
                    parts: [{ text: responseText }] 
                }));
            }
        } catch (error) {
            const errorMsg = error.response?.data?.details || "The connection is a bit fuzzy. Try again?";
            dispatch(addMessage({ 
                role: 'model', 
                parts: [{ text: `Error: ${errorMsg}` }] 
            }));
        } finally {
            dispatch(setChatLoading(false));
        }
    };

    const confirmDeleteHistory = () => {
        Alert.alert(
            "Clear Conversation",
            "This will permanently delete your chat history with Echo AI.",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive", 
                    onPress: async () => {
                        try {
                            await clearChatHistory();
                            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                            dispatch(clearHistory());
                        } catch (e) {
                            Alert.alert("Error", "Failed to clear history.");
                        }
                    } 
                }
            ]
        );
    };

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
        { id: 2, question: "How do I level up my rank?", answer: "Every 50 Echoes you create increases your rank. Check your progress in the Profile tab." },
        { id: 3, question: "Is my data private?", answer: "Yes. Your Echoes are stored securely and encrypted. Only you can access your personal memories." },
        { id: 4, question: "How does the AI Assistant work?", answer: "The Echo AI can help you find specific memories or explain app features using natural language." }
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
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>We're here to help you navigate your memories.</Text>
                </View>

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

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Assistance</Text>
                    <View style={styles.actionGrid}>
                        <QuickAction 
                            icon="sparkles" 
                            title="Echo AI Assistant" 
                            subtitle="Instant help powered by AI" 
                            color="#6366F1" 
                            onPress={() => setIsChatVisible(true)}
                        />
                        <QuickAction 
                            icon="mail" 
                            title="Email Support" 
                            subtitle="Direct line to our team" 
                            color="#EC4899" 
                            onPress={handleEmailSupport}
                        />
                    </View>
                </View>

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

            <Modal visible={isChatVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setIsChatVisible(false)}>
                <View style={[styles.modalContainer, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC' }]}>
                    <View style={[styles.chatHeader, { paddingTop: 20, borderBottomColor: isDark ? '#1E293B' : '#E2E8F0' }]}>
                        <TouchableOpacity onPress={() => setIsChatVisible(false)} style={styles.closeBtn}>
                            <Ionicons name="close" size={26} color={colors.textMain} />
                        </TouchableOpacity>
                        <View style={{ alignItems: 'center' }}>
                            <Text style={[styles.chatHeaderText, { color: colors.textMain }]}>Echo AI</Text>
                            <View style={styles.onlineStatus}>
                                <View style={styles.statusDot} />
                                <Text style={styles.statusText}>Online</Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={confirmDeleteHistory} style={styles.closeBtn}>
                            <Ionicons name="trash-outline" size={22} color="#EF4444" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView 
                        ref={scrollViewRef}
                        style={styles.chatArea}
                        contentContainerStyle={{ padding: 20 }}
                    >
                        {chatHistory.length === 0 && (
                            <View style={[styles.messageBubble, styles.botMessage, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
                                <Text style={{ color: colors.textMain, lineHeight: 20 }}>
                                    Welcome back! I'm your Echo AI. How can I assist you with your memories today?
                                </Text>
                            </View>
                        )}

                        {chatHistory.map((item, index) => (
                            <View key={index} style={[
                                styles.messageBubble, 
                                (item.role === 'user' || item.role === 'User')
                                    ? [styles.userMessage, { backgroundColor: colors.primary }] 
                                    : [styles.botMessage, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]
                            ]}>
                                <Text style={{ color: (item.role === 'user' || item.role === 'User') ? '#FFF' : colors.textMain, fontSize: 15 }}>
                                    {item.parts?.[0]?.text || item.text}
                                </Text>
                            </View>
                        ))}
                        
                        {isTyping && (
                            <View style={[styles.messageBubble, styles.botMessage, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', width: 60 }]}>
                                <ActivityIndicator size="small" color={colors.primary} />
                            </View>
                        )}
                    </ScrollView>

                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
                        <View style={[styles.inputContainer, { paddingBottom: insets.bottom + 10, backgroundColor: isDark ? '#1E293B' : '#FFF' }]}>
                            <TextInput 
                                style={[styles.chatInput, { color: colors.textMain, backgroundColor: isDark ? '#0F172A' : '#F1F5F9' }]}
                                placeholder="Ask about your Echoes..."
                                placeholderTextColor={colors.textSecondary}
                                value={chatMessage}
                                onChangeText={setChatMessage}
                                editable={!isTyping}
                                multiline
                            />
                            <TouchableOpacity 
                                style={[styles.sendBtn, { backgroundColor: chatMessage.trim() ? colors.primary : '#94A3B8' }]} 
                                onPress={handleSendMessage}
                                disabled={!chatMessage.trim() || isTyping}
                            >
                                <Ionicons name="send" size={18} color="#FFF" />
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
    messageBubble: { padding: 14, borderRadius: 18, marginBottom: 10, maxWidth: '80%' },
    userMessage: { alignSelf: 'flex-end', borderBottomRightRadius: 2 },
    botMessage: { alignSelf: 'flex-start', borderBottomLeftRadius: 2 },
    inputContainer: { flexDirection: 'row', padding: 15, alignItems: 'center', gap: 10 },
    chatInput: { flex: 1, height: 48, borderRadius: 24, paddingHorizontal: 20, fontSize: 15 },
    sendBtn: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' }
});

export default Help;