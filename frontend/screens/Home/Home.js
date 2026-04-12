import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import GlassButton from '../../components/GlassButton';
import { EMOTION_ASSETS, EMOTION_CONFIG } from '../../constants/assets';
import { useTheme } from '../../context/ThemeContext';
import {
  commentEchoAsync,
  deleteEchoAsync,
  getGlobalEchoesAsync,
  likeEchoAsync,
  replyToEchoCommentAsync
} from '../../redux/echoSlice';
import { getRelativeTime } from '../EchoStamp/tabs/Feed/utils/feedUtils';

// --- COMPONENTS ---
import BrandedHeader from '../../components/BrandedHeader';

const { width, height } = Dimensions.get('window');

const AnimatedPressable = ({ children, onPress, style }) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => (scale.value = withSpring(0.96))}
      onPressOut={() => (scale.value = withSpring(1))}
    >
      <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
    </Pressable>
  );
};

const Home = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  // Use toggleTheme directly from context
  const { isDark, colors, toggleTheme } = useTheme();

  const { user } = useSelector((state) => state.auth);
  const { list, status } = useSelector((state) => state.echoes);

  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Modal/Interaction States
  const [selectedEchoId, setSelectedEchoId] = useState(null);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [activeCommentId, setActiveCommentId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derive the active echo from Redux list to ensure real-time updates in modal
  const activeEcho = useMemo(() => {
    return list.find(e => e._id === selectedEchoId);
  }, [list, selectedEchoId]);

  // Handle deep linking from notifications
  useEffect(() => {
    if (route.params?.echoId) {
      setSelectedEchoId(route.params.echoId);
      setCommentModalVisible(true);
      if (route.params.commentId) {
        setActiveCommentId(route.params.commentId);
      }
      navigation.setParams({ 
        echoId: undefined, 
        commentId: undefined, 
        focusComment: undefined 
      });
    }
  }, [route.params?.echoId, route.params?.commentId, navigation]);

  useEffect(() => {
    dispatch(getGlobalEchoesAsync()); 
  }, [dispatch]);

  const filteredList = useMemo(() => {
    const data = Array.isArray(list) ? list : [];
    if (!searchQuery) return data;
    return data.filter(echo =>
      echo.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      echo.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, list]);

  const handleLike = (id) => {
    dispatch(likeEchoAsync({ id, userId: user?._id || user?.id }));
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !selectedEchoId) return;
    setIsSubmitting(true);
    try {
      await dispatch(commentEchoAsync({
        id: selectedEchoId,
        data: {
          userId: user?._id || user?.id,
          username: user?.username,
          profilePicture: user?.profilePicture,
          text: commentText.trim()
        }
      })).unwrap();
      setCommentText('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (commentId) => {
    if (!replyText.trim() || !selectedEchoId) return;
    setIsSubmitting(true);
    try {
      await dispatch(replyToEchoCommentAsync({
        id: selectedEchoId,
        commentId,
        data: {
          userId: user?._id || user?.id,
          username: user?.username,
          profilePicture: user?.profilePicture,
          text: replyText.trim()
        }
      })).unwrap();
      setReplyText('');
      setActiveCommentId(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(getGlobalEchoesAsync());
    setRefreshing(false);
  };

  const handleDelete = (id) => {
    Alert.alert("Delete Echo", "Delete this memory forever?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => dispatch(deleteEchoAsync({ id, type: 'journal' })) }
    ]);
  };

  const renderRightActions = (id) => (
    <Pressable
      style={styles.deleteAction}
      onPress={() => handleDelete(id)}
    >
      <LinearGradient colors={['#EF4444', '#991B1B']} style={styles.deleteGradient}>
        <Ionicons name="trash-outline" size={24} color="white" />
      </LinearGradient>
    </Pressable>
  );

  const renderItem = ({ item }) => {
    const config = EMOTION_CONFIG.find(c => c.value === item.emotion);
    const animationSource = config ? EMOTION_ASSETS[config.assetKey] : EMOTION_ASSETS.Calm;
    const displayLabel = config ? config.label : item.emotion;

    // 1. Check if userId is a populated object or just a string ID
    const isPopulated = item.userId && typeof item.userId === 'object';
    const authorId = isPopulated ? (item.userId._id || item.userId.id) : item.userId;
    
    // 2. Determine if it's the current user's post
    const isOwnPost = authorId?.toString() === (user?._id || user?.id)?.toString();

    // 3. Resolve Author object: Use Redux user for self, otherwise use the populated data
    const author = isOwnPost ? user : (isPopulated ? item.userId : null);

    // 4. Like Status
    const isLiked = item.likes?.includes(user?._id || user?.id);
    const likeCount = item.likes?.length || 0;
    const commentCount = item.comments?.length || 0;

    return (
      <Swipeable 
        renderRightActions={() => isOwnPost ? renderRightActions(item._id) : null} 
        enabled={isOwnPost}
        overshootRight={false}
      >
        <AnimatedPressable
          style={[
            styles.echoCard,
            {
              backgroundColor: isDark ? colors.glass : '#FFF',
              borderColor: colors.glassBorder,
            }
          ]}
          onPress={() => { /* Navigate to detail */ }}
        >
          {isDark && Platform.OS === 'ios' && (
            <BlurView intensity={15} style={StyleSheet.absoluteFill} tint="dark" />
          )}

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={[styles.avatarContainer, { backgroundColor: colors.primary + '20', width: 32, height: 32 }]}>
                {author?.profilePicture ? (
                    <Image source={{ uri: author.profilePicture }} style={styles.avatarImage} />
                ) : (
                    <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 12 }}>
                        {author?.firstName ? author.firstName[0].toUpperCase() : 
                         (author?.username ? author.username[0].toUpperCase() : 'U')}
                    </Text>
                )}
            </View>

            <View style={{ flex: 1 }}>
                <View style={styles.cardHeader}>
                    <View style={styles.titleContainer}>
                    <Text style={[styles.echoTitle, { color: colors.textMain, fontSize: 13 }]}>
                        {author?.firstName
                          ? `${author.firstName} ${author.lastName || ''}`.trim()
                          : (author?.username || author?.displayName || 'Explorer')}
                    </Text>
                    <Text style={[styles.echoDate, { color: colors.textSecondary }]}>
                        • {getRelativeTime(item.createdAt)}
                    </Text>
                    </View>
                    <View style={[styles.emotionContainer, { position: 'absolute', top: 10, right: -15 }]}>
                      <LottieView source={animationSource} autoPlay loop style={{ width: 95, height: 95 }} />
                    </View>
                </View>

                <Text style={[styles.echoTitle, { color: colors.textMain, marginTop: -5, fontSize: 15, paddingRight: 70 }]}>{item.title}</Text>
                
                {item.description && (
                    <Text style={[styles.echoDescription, { color: colors.textSecondary, marginBottom: 8, fontSize: 12, paddingRight: 70 }]} numberOfLines={2}>
                    {item.description}
                    </Text>
                )}

                {/* Interaction Bar */}
                <View style={[styles.interactionBar, { paddingTop: 8 }]}>
                  <TouchableOpacity 
                    onPress={() => handleLike(item._id)}
                    style={styles.interactionBtn}
                  >
                    <Ionicons 
                      name={isLiked ? "heart" : "heart-outline"} 
                      size={16} 
                      color={isLiked ? "#EF4444" : colors.textSecondary} 
                    />
                    <Text style={[styles.interactionText, { color: isLiked ? "#EF4444" : colors.textSecondary, fontSize: 11 }]}>
                      {likeCount}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={() => { setSelectedEchoId(item._id); setCommentModalVisible(true); }}
                    style={styles.interactionBtn}
                  >
                    <Ionicons name="chatbubble-outline" size={15} color={colors.textSecondary} />
                    <Text style={[styles.interactionText, { color: colors.textSecondary, fontSize: 11 }]}>
                      {commentCount}
                    </Text>
                  </TouchableOpacity>
                </View>
            </View>
          </View>
        </AnimatedPressable>
      </Swipeable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background[0] }]}>
      <StatusBar barStyle={colors.status} translucent backgroundColor="transparent" />

      <BrandedHeader colors={colors} isDark={isDark} />

      <View style={[styles.contentWrapper, { paddingTop: insets.top + 20 }]}>

        <View style={styles.headerContainer}>
          <View style={styles.headerTop}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={[styles.avatarContainer, { backgroundColor: colors.primary + '20', width: 50, height: 50, borderRadius: 25 }]}>
                {user?.profilePicture ? (
                  <Image source={{ uri: user.profilePicture }} style={styles.avatarImage} />
                ) : (
                  <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 18 }}>
                    {user?.firstName?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'E'}
                  </Text>
                )}
              </View>
              <View>
                <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>Hello,</Text>
                <Text style={[styles.userName, { color: colors.textMain, fontSize: 24 }]}>
                  {user?.firstName ? user.firstName : (user?.username || "Explorer")}
                </Text>
              </View>
            </View>

            {/* Direct toggle for Dark/Light mode */}
            <AnimatedPressable
              onPress={toggleTheme}
              style={[styles.themeToggle, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
            >
              <Ionicons
                name={isDark ? "sunny" : "moon"}
                size={20}
                color={isDark ? colors.accent : colors.primary}
              />
            </AnimatedPressable>
          </View>

          <View style={[styles.searchWrapper, {
            backgroundColor: colors.glass,
            borderColor: colors.glassBorder
          }]}>
            <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.textMain }]}
              placeholder="Search your echoes..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {status === 'loading' && !refreshing ? (
          <View style={styles.loaderContainer}>
            <LottieView
              source={require('../../assets/Loadingblue.json')}
              autoPlay loop style={{ width: 180, height: 180 }}
            />
          </View>
        ) : (
          <FlatList
            data={filteredList}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            renderItem={renderItem}
            style={{ backgroundColor: 'transparent' }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <LottieView
                  source={require('../../assets/empty_ghost.json')}
                  autoPlay loop style={styles.emptyLottie}
                />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No anchor entries yet.</Text>
              </View>
            }
          />
        )}

    <GlassButton
      style={[styles.fab, { borderRadius: 20 }]}
      contentStyle={{ paddingHorizontal: 0 }}
      onPress={() => navigation.navigate('Create')}
    >
      <Ionicons
        name="add"   
        size={28}
        color={isDark ? (colors.primary === '#FFFFFF' ? '#000' : '#FFF') : colors.primary}
      />
    </GlassButton>

      {/* Simple Comment Modal */}
      <Modal 
        visible={commentModalVisible} 
        animationType="slide" 
        transparent={true}
        onRequestClose={() => setCommentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background[0], borderColor: colors.glassBorder }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textMain }]}>Comments</Text>
              <TouchableOpacity onPress={() => setCommentModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={activeEcho?.comments || []}
              keyExtractor={(item) => item._id}
              style={{ flex: 1 }}
              renderItem={({ item }) => (
                <View style={styles.commentItem}>
                  <View style={styles.commentUserRow}>
                    <Image source={{ uri: item.profilePicture }} style={styles.commentAvatar} />
                    <View>
                      <Text style={[styles.commentUsername, { color: colors.textMain }]}>{item.username}</Text>
                      <Text style={[styles.commentText, { color: colors.textSecondary }]}>{item.text}</Text>
                    </View>
                  </View>
                  
                  {/* Replies */}
                  {item.replies?.map((reply, idx) => (
                    <View key={idx} style={styles.replyItem}>
                      <Text style={[styles.commentUsername, { color: colors.textMain, fontSize: 12 }]}>{reply.username}</Text>
                      <Text style={[styles.commentText, { color: colors.textSecondary, fontSize: 13 }]}>{reply.text}</Text>
                    </View>
                  ))}

                  {/* Reply Input Trigger */}
                  {activeCommentId === item._id ? (
                    <View style={styles.replyInputRow}>
                      <TextInput
                        style={[styles.replyInput, { color: colors.textMain, borderColor: colors.glassBorder }]}
                        placeholder="Write a reply..."
                        placeholderTextColor={colors.textSecondary}
                        value={replyText}
                        onChangeText={setReplyText}
                        autoFocus
                      />
                      <TouchableOpacity onPress={() => handleReply(item._id)}>
                        <Ionicons name="send" size={20} color={colors.primary} />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity onPress={() => setActiveCommentId(item._id)}>
                      <Text style={{ fontSize: 12, color: colors.primary, marginLeft: 50, marginTop: 5 }}>Reply</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            />

            <View style={[styles.commentInputRow, { borderTopColor: colors.glassBorder }]}>
              <TextInput
                style={[styles.commentInput, { color: colors.textMain, backgroundColor: colors.glass }]}
                placeholder="Add a comment..."
                placeholderTextColor={colors.textSecondary}
                value={commentText}
                onChangeText={setCommentText}
              />
              <TouchableOpacity onPress={handleAddComment} disabled={isSubmitting}>
                <Ionicons name="send" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentWrapper: { flex: 1, backgroundColor: 'transparent' },
  headerContainer: { paddingHorizontal: 20, marginBottom: 15 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  welcomeText: { fontSize: 14, fontWeight: '600', opacity: 0.6 },
  userName: { fontSize: 32, fontWeight: '900', letterSpacing: -1 },
  themeToggle: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  searchWrapper: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 16, height: 56, borderWidth: 1 },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 16, fontWeight: '500' },
  listContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 150 },
  echoCard: {
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20 },
      android: {}
    })
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 2 },
  titleContainer: { flex: 1 },
  avatarContainer: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  echoTitle: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5, marginBottom: 4 },
  echoDate: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, opacity: 0.5 },
  emotionContainer: { alignItems: 'center' },
  emotionLottie: { width: 50, height: 50 },
  echoEmotion: { fontSize: 9, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1, marginTop: -4 },
  echoDescription: { fontSize: 15, lineHeight: 22, marginBottom: 20, opacity: 0.7, fontWeight: '400' },
  interactionBar: { flexDirection: 'row', gap: 20, marginTop: 10, borderTopWidth: 0.5, borderTopColor: 'rgba(0,0,0,0.05)', paddingTop: 12 },
  interactionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  interactionText: { fontSize: 14, fontWeight: '600' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', paddingTop: 16, borderTopWidth: 1 },
  locationText: { flex: 1, fontSize: 12, marginLeft: 8, fontWeight: '600', opacity: 0.6 },
  fab: { position: 'absolute', bottom: 90, right: 20, width: 70, height: 65,alignItems: 'center', justifyContent: 'center'  },
   
  deleteAction: { width: 90, height: '88%', marginBottom: 16 },
  deleteGradient: { flex: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 32, marginLeft: 10 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyLottie: { width: 300, height: 300 },
  emptyText: { marginTop: -20, fontSize: 16, fontWeight: '700', opacity: 0.5 },
  
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { height: '80%', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 20, borderWidth: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  commentItem: { marginBottom: 20 },
  commentUserRow: { flexDirection: 'row', gap: 12 },
  commentAvatar: { width: 36, height: 36, borderRadius: 18 },
  commentUsername: { fontWeight: '700', fontSize: 14 },
  commentText: { fontSize: 14 },
  commentInputRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 15, borderTopWidth: 1 },
  commentInput: { flex: 1, height: 45, borderRadius: 22, paddingHorizontal: 15 },
  replyItem: { marginLeft: 50, marginTop: 10, paddingLeft: 10, borderLeftWidth: 1, borderLeftColor: '#eee' },
  replyInputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginLeft: 50, marginTop: 10 },
  replyInput: { flex: 1, fontSize: 13, borderBottomWidth: 1, paddingVertical: 4 },
});

export default Home;