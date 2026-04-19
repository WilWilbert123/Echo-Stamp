import { BlurView } from 'expo-blur';
import * as Location from 'expo-location';
import LottieView from "lottie-react-native";
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    Dimensions,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    PanResponder,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../context/ThemeContext';
import {
    addMessage,
    clearHistory,
    setChatLoading,
    setEchoStats,
    setHistory
} from '../redux/chatSlice';
import {
    askAiAssistant,
    clearChatHistory,
    countMyEchoes,
    fetchChatHistory
} from '../services/api';
import { extractPlaceCategory, fetchNearbyPlacesForAI, formatPlacesForChat, isNearbyQuery } from '../utils/aiLocationHelper';

const { width, height } = Dimensions.get("window");

const AIAgent = () => {
    const dispatch = useDispatch();
    const { history, loading } = useSelector((state) => state.chat);
    const { user } = useSelector((state) => state.auth);
    const { colors, isDark } = useTheme();
    const [input, setInput] = useState('');
    const [visible, setVisible] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [hasLoadedHistory, setHasLoadedHistory] = useState(false); // Track if history has been loaded
    const flatListRef = useRef(null);
    const lastRequestTime = useRef(0);
    const requestQueue = useRef([]);
    const isProcessingQueue = useRef(false);

    // Draggable button setup
    const BUTTON_SIZE = 60;
    const EDGE_PADDING = 10;
    
    // Store the current position for constraint calculations
    const currentPosition = useRef({ x: width - BUTTON_SIZE - 20, y: height - 200 });
    
    const pan = useRef(new Animated.ValueXY({ 
        x: currentPosition.current.x, 
        y: currentPosition.current.y 
    })).current;
    
    const moved = useRef(false);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderTerminationRequest: () => false,

            onPanResponderGrant: () => {
                moved.current = false;
                // Stop any ongoing animations
                pan.stopAnimation();
                // Set offset to current position
                pan.setOffset({
                    x: pan.x._value,
                    y: pan.y._value,
                });
                pan.setValue({ x: 0, y: 0 });
            },

            onPanResponderMove: (e, gestureState) => {
                // Check if moved significantly
                if (Math.abs(gestureState.dx) > 3 || Math.abs(gestureState.dy) > 3) {
                    moved.current = true;
                }

                // Calculate new position with constraints
                let newX = gestureState.dx;
                let newY = gestureState.dy;
                
                const currentX = pan.x._offset;
                const currentY = pan.y._offset;
                
                // Apply edge constraints during drag
                if (currentX + newX < EDGE_PADDING) {
                    newX = EDGE_PADDING - currentX;
                } else if (currentX + newX > width - BUTTON_SIZE - EDGE_PADDING) {
                    newX = width - BUTTON_SIZE - EDGE_PADDING - currentX;
                }
                
                if (currentY + newY < EDGE_PADDING) {
                    newY = EDGE_PADDING - currentY;
                } else if (currentY + newY > height - BUTTON_SIZE - EDGE_PADDING - 50) { // -50 for bottom safe area
                    newY = height - BUTTON_SIZE - EDGE_PADDING - 50 - currentY;
                }
                
                pan.x.setValue(newX);
                pan.y.setValue(newY);
            },

            onPanResponderRelease: () => {
                // Flatten the offset
                pan.flattenOffset();
                
                // Update current position reference
                currentPosition.current = {
                    x: pan.x._value,
                    y: pan.y._value
                };
                
                // Only snap to edge if user didn't drag (for tap)
                // Don't auto-snap to edge when dragging - let it stay where user left it
                if (!moved.current) {
                    setVisible(true);
                }
            },
        })
    ).current;

    // Load messages only once when component mounts or when user logs in
    useEffect(() => {
        // Load history when component mounts (but not every time modal opens)
        if (!hasLoadedHistory && user) {
            loadMessages();
            loadEchoStats();
            setHasLoadedHistory(true);
        }
    }, [user]); // Re-run if user changes

    // Request location when modal opens, but don't reload history
    useEffect(() => {
        if (visible) {
            requestLocation();
            getInitialLocation();
        }
    }, [visible]);

    const getInitialLocation = async () => {
        try {
            const { status } = await Location.getForegroundPermissionsAsync();
            if (status === 'granted') {
                const loc = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced
                });
                console.log("Initial location obtained:", loc.coords);
            }
        } catch (err) {
            console.warn("Could not get initial location", err);
        }
    };

    const loadEchoStats = async () => {
        try {
            const response = await countMyEchoes();
            if (response.data) {
                dispatch(setEchoStats(response.data));
            }
        } catch (error) {
            console.error("Failed to load echo stats:", error);
        }
    };

    const requestLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') return;
        } catch (err) {
            console.warn("Location permission error", err);
        }
    };

    const loadMessages = async () => {
        // Only load if we don't already have history
        if (history && history.length > 0) {
            console.log("History already loaded, skipping fetch");
            return;
        }
        
        dispatch(setChatLoading(true));
        try {
            const res = await fetchChatHistory();
            if (res.data && Array.isArray(res.data)) {
                dispatch(setHistory(res.data));
            } else {
                dispatch(setHistory([]));
            }
        } catch (error) {
            console.error("History Load Error:", error);
            dispatch(setHistory([]));
        } finally {
            dispatch(setChatLoading(false));
        }
    };

    const handleClearHistory = async () => {
        Alert.alert(
            "Clear Conversation",
            "Are you sure you want to delete all chat history?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await clearChatHistory();
                            dispatch(clearHistory());
                            // Reset the loaded flag so it can reload if needed
                            setHasLoadedHistory(false);
                        } catch (err) {
                            console.error("Clear History Error:", err);
                        }
                    }
                }
            ]
        );
    };

    // Handle nearby place queries locally
    const handleNearbyQuery = async (userText, locationData) => {
        if (!locationData || !locationData.latitude || !locationData.longitude) {
            return "I need your location to find nearby places. Please enable location services and try again. 📍";
        }
        
        const category = extractPlaceCategory(userText);
        if (!category) return null;
        
        const places = await fetchNearbyPlacesForAI(
            locationData.latitude, 
            locationData.longitude, 
            category
        );
        
        return formatPlacesForChat(places, category);
    };

    const processQueue = async () => {
        if (isProcessingQueue.current || requestQueue.current.length === 0) return;

        isProcessingQueue.current = true;

        while (requestQueue.current.length > 0) {
            const { userText, resolve, reject } = requestQueue.current[0];

            const now = Date.now();
            const timeSinceLastRequest = now - lastRequestTime.current;
            if (timeSinceLastRequest < 3000) {
                const waitTime = 3000 - timeSinceLastRequest;
                console.log(`Waiting ${waitTime}ms before next request...`);
                await new Promise(r => setTimeout(r, waitTime));
            }

            try {
                const result = await sendMessageToAI(userText);
                resolve(result);
                requestQueue.current.shift();
                lastRequestTime.current = Date.now();
            } catch (error) {
                reject(error);
                requestQueue.current.shift();
            }
        }

        isProcessingQueue.current = false;
    };

    const sendMessageToAI = async (userText) => {
        let locationData = null;
        try {
            const { status } = await Location.getForegroundPermissionsAsync();
            if (status === 'granted') {
                const loc = await Location.getCurrentPositionAsync({ 
                    accuracy: Location.Accuracy.Balanced 
                });
                locationData = {
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude
                };
                console.log("📍 Location obtained:", locationData);
                
                // CHECK FOR NEARBY QUERIES FIRST (BEFORE CALLING BACKEND)
                if (isNearbyQuery(userText)) {
                    console.log("📍 Nearby query detected, handling locally...");
                    const nearbyResponse = await handleNearbyQuery(userText, locationData);
                    if (nearbyResponse) {
                        // Return a mock response structure
                        return { data: { text: nearbyResponse } };
                    }
                }
            } else {
                console.log("❌ Location permission not granted");
                
                // Check if it's a nearby query but no location
                if (isNearbyQuery(userText)) {
                    return { data: { text: "I need your location to find nearby places. Please enable location services and try again. 📍" } };
                }
            }
        } catch (locErr) {
            console.error("❌ Could not get location for AI:", locErr);
        }

        // If not a nearby query or location failed, call the backend
        const response = await askAiAssistant(userText, locationData);
        return response;
    };

    const queueMessage = (userText) => {
        return new Promise((resolve, reject) => {
            requestQueue.current.push({ userText, resolve, reject });
            processQueue();
        });
    };

    const handleSend = async () => {
        if (!input.trim() || loading || isSending) return;

        const userText = input.trim();
        setInput('');
        setIsSending(true);

        dispatch(addMessage({ role: 'user', parts: [{ text: userText }] }));
        dispatch(setChatLoading(true));

        try {
            const response = await queueMessage(userText);

            dispatch(addMessage({
                role: 'model',
                parts: [{ text: response.data.text }]
            }));

            if (response.data.stats) {
                dispatch(setEchoStats(response.data.stats));
            }

        } catch (error) {
            console.error("AI Assistant Error:", error);

            let errorMessage = "Sorry, I'm having trouble connecting. Please try again in a moment.";

            if (error.response?.status === 429) {
                errorMessage = "The AI is very busy right now. Please wait a few seconds and try again.";
            } else if (error.code === 'ECONNABORTED') {
                errorMessage = "The request timed out. Please check your connection.";
            } else if (error.message === 'Network Error') {
                errorMessage = "Network error. Please check your internet connection.";
            }

            dispatch(addMessage({
                role: 'model',
                parts: [{ text: errorMessage }]
            }));
        } finally {
            dispatch(setChatLoading(false));
            setIsSending(false);

            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    };

    const renderMessage = ({ item }) => {
        const isUser = item.role === 'user';
        const text = item.parts?.[0]?.text || "";

        if (!text && !isUser) return null;

        return (
            <View style={[styles.msgRow, isUser ? styles.userRow : styles.aiRow]}>
                <View style={[
                    styles.bubble,
                    isUser ? [styles.userBubble, { backgroundColor: colors.primary }] :
                        [styles.aiBubble, { backgroundColor: isDark ? '#2D3748' : '#f0f0f0' }]
                ]}>
                    <Text style={[
                        styles.msgText,
                        { color: isUser ? '#fff' : colors.textMain }
                    ]}>
                        {text}
                    </Text>
                </View>
            </View>
        );
    };

    // Create dynamic styles based on theme
    const dynamicStyles = {
        container: {
            flex: 1,
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)'
        },
        header: {
            padding: 20,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: colors.glassBorder,
            backgroundColor: colors.glass,
        },
        headerTitle: {
            fontSize: 18,
            fontWeight: '700',
            color: colors.textMain
        },
        clearBtn: {
            color: '#ff3b30',
            fontSize: 16
        },
        closeBtn: {
            fontSize: 22,
            color: colors.textSecondary
        },
        inputArea: {
            padding: 12,
            flexDirection: 'row',
            backgroundColor: colors.glass,
            alignItems: 'center',
            borderTopWidth: 1,
            borderTopColor: colors.glassBorder,
        },
        input: {
            flex: 1,
            backgroundColor: isDark ? '#1E293B' : '#f2f2f2',
            borderRadius: 25,
            paddingHorizontal: 18,
            paddingVertical: 10,
            marginRight: 10,
            fontSize: 16,
            maxHeight: 120,
            color: colors.textMain,
        },
        sendBtn: {
            backgroundColor: colors.primary,
            width: 44,
            height: 44,
            borderRadius: 22,
            justifyContent: 'center',
            alignItems: 'center'
        },
        sendBtnDisabled: {
            backgroundColor: isDark ? '#4B5563' : '#ccc'
        },
        loadingText: {
            marginLeft: 8,
            color: colors.textSecondary,
            fontStyle: 'italic'
        },
    };

    return (
        <>
            {/* Draggable Floating Button with Lottie Animation */}
            <Animated.View
                style={[
                    styles.floatingButton,
                    {
                        transform: pan.getTranslateTransform(),
                    },
                ]}
                {...panResponder.panHandlers}
            >
                <View style={[
                    styles.innerButton,
                    {
                        
                    }
                ]}>
                    <LottieView
                        source={require("../assets/Airobot.json")}
                        autoPlay
                        loop
                        style={{ width: 55, height: 55 }}
                    />
                </View>
            </Animated.View>

            {/* Chat Modal */}
            <Modal visible={visible} animationType="slide" transparent>
                <BlurView intensity={100} tint={isDark ? "dark" : "light"} style={{ flex: 1 }}>
                    <SafeAreaView style={dynamicStyles.container}>
                        <View style={dynamicStyles.header}>
                            <TouchableOpacity onPress={handleClearHistory}>
                                <Text style={dynamicStyles.clearBtn}>Clear</Text>
                            </TouchableOpacity>
                            <Text style={dynamicStyles.headerTitle}>Echo AI</Text>
                            <TouchableOpacity onPress={() => setVisible(false)}>
                                <Text style={dynamicStyles.closeBtn}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            ref={flatListRef}
                            data={history}
                            keyExtractor={(_, index) => index.toString()}
                            renderItem={renderMessage}
                            onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
                            contentContainerStyle={{ padding: 15, paddingBottom: 30 }}
                        />

                        {(loading || isSending) && (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="small" color={colors.primary} />
                                <Text style={dynamicStyles.loadingText}>
                                    {isSending ? "Processing..." : "Thinking..."}
                                </Text>
                            </View>
                        )}

                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                        >
                            <View style={dynamicStyles.inputArea}>
                                <TextInput
                                    style={dynamicStyles.input}
                                    value={input}
                                    onChangeText={setInput}
                                    placeholder="Ask me anything..."
                                    placeholderTextColor={colors.textSecondary}
                                    multiline
                                    maxLength={500}
                                    editable={!isSending}
                                />
                                <TouchableOpacity
                                    onPress={handleSend}
                                    activeOpacity={0.8}
                                    style={[
                                        dynamicStyles.sendBtn,
                                        (!input.trim() || loading || isSending) && dynamicStyles.sendBtnDisabled
                                    ]}
                                    disabled={!input.trim() || loading || isSending}
                                >
                                    <MaterialCommunityIcons
                                        name="send"
                                        size={22}
                                        color="#fff"
                                    />
                                </TouchableOpacity>
                            </View>
                        </KeyboardAvoidingView>
                    </SafeAreaView>
                </BlurView>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    floatingButton: {
        position: 'absolute',
        zIndex: 999,
        width: 60,
        height: 60,
    },
    innerButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: "center",
        alignItems: "center",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        
        overflow: 'hidden',
    },
    msgRow: { marginVertical: 6, flexDirection: 'row' },
    userRow: { justifyContent: 'flex-end' },
    aiRow: { justifyContent: 'flex-start' },
    bubble: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        maxWidth: '85%',
        elevation: 1,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
    userBubble: { borderBottomRightRadius: 4 },
    aiBubble: { borderBottomLeftRadius: 4 },
    msgText: { fontSize: 16, lineHeight: 22 },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10
    },
});

export default AIAgent;