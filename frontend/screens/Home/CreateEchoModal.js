import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

// Components & Context
import { EMOTION_ASSETS, EMOTION_CONFIG } from '../../constants/assets';
import { useTheme } from '../../context/ThemeContext';
import { addEchoAsync } from '../../redux/echoSlice';

const { width, height } = Dimensions.get('window');

// Optimized Lazy Lottie Component
const LazyLottie = React.memo(({ source, shouldAnimate, style }) => {
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 50);
    return () => clearTimeout(timer);
  }, []);
  
  if (!isReady) return <View style={style} />;
  
  return (
    <LottieView 
      source={source} 
      autoPlay={shouldAnimate}
      loop={shouldAnimate}
      style={style} 
    />
  );
});

// Memoized Emotion Item - Grid version
const EmotionItem = React.memo(({ item, isSelected, onSelect, isDark, colors }) => {
  const animationSource = EMOTION_ASSETS[item.assetKey];
  
  return (
    <TouchableOpacity
      onPress={() => onSelect(item.value)}
      activeOpacity={0.7}
      style={[
        styles.emotionGridItem,
        {
          backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#FFF',
          borderColor: isSelected ? colors.primary : (isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0'),
          borderWidth: isSelected ? 2 : 1,
        },
        isSelected && {
          backgroundColor: colors.primary + '15', 
        }
      ]}
    >
      <LazyLottie 
        source={animationSource}
        shouldAnimate={isSelected}
        style={{ width: 55, height: 55 }}
      />
      <Text
        style={[
          styles.emotionText,
          { 
            color: isSelected ? colors.primary : colors.textSecondary, 
            fontWeight: isSelected ? '800' : '500' 
          }
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );
});

const CreateEchoModal = ({ visible, onClose, onSuccess }) => {
  const { isDark, colors } = useTheme();
  const [title, setTitle] = useState('');
  const [emotion, setEmotion] = useState('Calm');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isReady, setIsReady] = useState(false);
  
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const titleInputRef = useRef(null);
  
  // Animation values
  const slideAnim = useRef(new Animated.Value(height)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  // Handle modal animations
  useEffect(() => {
    if (visible) {
      setIsReady(true);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 25,
          mass: 1.2,
          stiffness: 200,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTimeout(() => {
          titleInputRef.current?.focus();
        }, 100);
      });
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        resetForm();
      });
    }
  }, [visible]);

  const resetForm = () => {
    setTitle('');
    setEmotion('Calm');
    setSearchQuery('');
    setIsSearching(false);
  };

  const filteredEmotions = useMemo(() => {
    if (!searchQuery) return EMOTION_CONFIG;
    return EMOTION_CONFIG.filter((item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Wait", "Please give this moment a title.");
      return;
    }
    const userId = user?._id || user?.id;
    if (!userId) {
      Alert.alert("Error", "No active user session found.");
      return;
    }

    try {
      setLoading(true);
      const echoData = {
        userId: userId,
        title: title.trim(),
        description: '', // Empty description as requested
        emotion: emotion,
        location: {
          address: "Somewhere beautiful"
        }
      };

      await dispatch(addEchoAsync(echoData)).unwrap();
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "We couldn't save this memory.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmotionSelect = useCallback((value) => {
    setEmotion(value);
  }, []);

  const handleClose = useCallback(() => {
    if (!loading) {
      onClose();
    }
  }, [loading, onClose]);

  if (!visible && !isReady) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      <StatusBar barStyle="light-content" />
      
      {/* Backdrop */}
      <Animated.View 
        style={[
          styles.backdrop,
          {
            opacity: backdropAnim,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
          }
        ]}
      >
        <TouchableOpacity 
          style={StyleSheet.absoluteFill} 
          onPress={handleClose}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Modal Content */}
      <Animated.View
        style={[
          styles.modalContainer,
          {
            transform: [{ translateY: slideAnim }],
            backgroundColor: colors.background[0],
            borderTopColor: colors.glassBorder,
          }
        ]}
      >
        {/* Drag Handle */}
        <View style={styles.dragHandleContainer}>
          <View style={[styles.dragHandle, { backgroundColor: colors.textSecondary + '40' }]} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.textMain }]}>New Echo</Text>
          <TouchableOpacity
            onPress={handleClose}
            style={[styles.closeButton, { backgroundColor: colors.glass, borderColor: colors.glassBorder, borderWidth: 1 }]}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Title Input Card */}
            <View style={[styles.inputCard, {
              backgroundColor: isDark ? colors.glass : '#FFF',
              borderColor: colors.glassBorder,
              borderWidth: 1
            }]}>
              <View style={styles.labelRow}>
                <Text style={[styles.label, { color: colors.primary }]}>What happened?</Text>
                <Text style={[styles.counter, { color: colors.textSecondary }]}>{title.length}/300</Text>
              </View>
              <TextInput
                ref={titleInputRef}
                style={[styles.input, { color: colors.textMain }]}
                placeholder="Name this moment..."
                placeholderTextColor={isDark ? 'rgba(255,255,255,0.3)' : '#94A3B8'}
                value={title}
                onChangeText={setTitle}
                maxLength={300}
                returnKeyType="done"
              />
            </View>

            {/* Emotion Section Header with Search */}
            <View style={styles.sectionHeaderRow}>
              {!isSearching ? (
                <>
                  <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>HOW DID IT FEEL?</Text>
                  <TouchableOpacity 
                    onPress={() => setIsSearching(true)} 
                    style={styles.searchIconButton}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="search" size={18} color={colors.textSecondary} />
                  </TouchableOpacity>
                </>
              ) : (
                <View style={[styles.searchBarContainer, { backgroundColor: colors.glass, borderColor: colors.glassBorder, borderWidth: 1 }]}>
                  <Ionicons name="search" size={16} color={colors.primary} style={{ marginLeft: 10 }} />
                  <TextInput
                    autoFocus
                    style={[styles.searchInput, { color: colors.textMain }]}
                    placeholder="Search emotions..."
                    placeholderTextColor={isDark ? 'rgba(255,255,255,0.3)' : '#94A3B8'}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  <TouchableOpacity 
                    onPress={() => { setIsSearching(false); setSearchQuery(''); }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close-circle" size={18} color={colors.textSecondary} style={{ marginRight: 10 }} />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Emotions Grid with ScrollView */}
            <ScrollView 
              style={styles.emotionsScrollView}
              contentContainerStyle={styles.emotionsGridContainer}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              {filteredEmotions.map((item) => (
                <EmotionItem
                  key={item.value}
                  item={item}
                  isSelected={emotion === item.value}
                  onSelect={handleEmotionSelect}
                  isDark={isDark}
                  colors={colors}
                />
              ))}
            </ScrollView>

            {/* Create Button - at the bottom */}
            <TouchableOpacity
              onPress={handleSave}
              disabled={loading}
              activeOpacity={0.8}
              style={[
                styles.createButton,
                { 
                  backgroundColor: colors.primary,
                  opacity: loading ? 0.7 : 1,
                }
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={[styles.buttonText, { color: '#FFF' }]}>
                  {loading ? "Anchoring..." : "Anchor Memory"}
                </Text>
                {!loading && (
                  <Ionicons 
                    name="bookmark" 
                    size={20} 
                    color="#FFF" 
                  />
                )}
                {loading && (
                  <View style={styles.loadingDot}>
                    <View style={[styles.dot, { backgroundColor: '#FFF' }]} />
                    <View style={[styles.dot, { backgroundColor: '#FFF', marginLeft: 4 }]} />
                    <View style={[styles.dot, { backgroundColor: '#FFF', marginLeft: 4 }]} />
                  </View>
                )}
              </View>
            </TouchableOpacity>
            
            {/* Extra bottom padding for safe area */}
            <View style={{ height: Platform.OS === 'ios' ? 20 : 10 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  modalContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, borderTopLeftRadius: 30, borderTopRightRadius: 30, borderTopWidth: 1, maxHeight: height * 0.9, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 10 },
  dragHandleContainer: { alignItems: 'center', paddingTop: 12, paddingBottom: 8 },
  dragHandle: { width: 40, height: 4, borderRadius: 2 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 0.5, borderBottomColor: 'rgba(0,0,0,0.05)' },
  headerTitle: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  closeButton: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  keyboardView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: Platform.OS === 'ios' ? 20 : 10 },
  inputCard: { padding: 20, borderRadius: 24, marginBottom: 20 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  label: { fontWeight: '800', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5 },
  counter: { fontSize: 11, fontWeight: '600' },
  input: { fontSize: 17, fontWeight: '500', lineHeight: 24, padding: 0 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, marginTop: 5, paddingRight: 10 },
  sectionLabel: { fontSize: 11, fontWeight: '800', marginLeft: 4, letterSpacing: 1.5 },
  searchIconButton: { padding: 5, borderRadius: 10 },
  searchBarContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', height: 40, borderRadius: 20, marginLeft: 10 },
  searchInput: { flex: 1, fontSize: 14, paddingHorizontal: 10, fontWeight: '600' },
  emotionsScrollView: { maxHeight: 280, marginBottom: 16 },
  emotionsGridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingBottom: 8 },
  emotionGridItem: { width: (width - 60) / 3, height: 105, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  emotionText: { fontSize: 11, marginTop: 6, letterSpacing: -0.2 },
  createButton: { width: '100%', height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginTop: 8, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  buttonText: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  loadingDot: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3 },
});

export default CreateEchoModal;