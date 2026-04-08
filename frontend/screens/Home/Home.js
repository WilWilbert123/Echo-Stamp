import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Platform,
  Pressable,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
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
import { deleteEchoAsync, getGlobalEchoesAsync } from '../../redux/echoSlice';
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
  const insets = useSafeAreaInsets();

  // Use toggleTheme directly from context
  const { isDark, colors, toggleTheme } = useTheme();

  const { user } = useSelector((state) => state.auth);
  const { list, status } = useSelector((state) => state.echoes);

  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

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

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={[styles.avatarContainer, { backgroundColor: colors.primary + '20' }]}>
                {author?.profilePicture ? (
                    <Image source={{ uri: author.profilePicture }} style={styles.avatarImage} />
                ) : (
                    <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 14 }}>
                        {author?.firstName ? author.firstName[0].toUpperCase() : 
                         (author?.username ? author.username[0].toUpperCase() : 'U')}
                    </Text>
                )}
            </View>

            <View style={{ flex: 1 }}>
                <View style={styles.cardHeader}>
                    <View style={styles.titleContainer}>
                    <Text style={[styles.echoTitle, { color: colors.textMain, fontSize: 16 }]}>
                        {author?.firstName
                          ? `${author.firstName} ${author.lastName || ''}`.trim()
                          : (author?.username || author?.displayName || 'Explorer')}
                    </Text>
                    <Text style={[styles.echoDate, { color: colors.textSecondary }]}>
                        • {getRelativeTime(item.createdAt)}
                    </Text>
                    </View>
                    <View style={styles.emotionContainer}>
                    <LottieView source={animationSource} autoPlay loop style={{ width: 55, height: 55 }} />
                    </View>
                </View>

                <Text style={[styles.echoTitle, { color: colors.textMain, marginTop: 4, fontSize: 18 }]}>{item.title}</Text>
                
                {item.description && (
                    <Text style={[styles.echoDescription, { color: colors.textSecondary, marginBottom: 10 }]} numberOfLines={3}>
                    {item.description}
                    </Text>
                )}
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
              autoPlay loop style={{ width: 100, height: 100 }}
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
    borderRadius: 32,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20 },
      android: {}
    })
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  titleContainer: { flex: 1 },
  avatarContainer: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%' },
  echoTitle: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5, marginBottom: 4 },
  echoDate: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, opacity: 0.5 },
  emotionContainer: { alignItems: 'center' },
  emotionLottie: { width: 50, height: 50 },
  echoEmotion: { fontSize: 9, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1, marginTop: -4 },
  echoDescription: { fontSize: 15, lineHeight: 22, marginBottom: 20, opacity: 0.7, fontWeight: '400' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', paddingTop: 16, borderTopWidth: 1 },
  locationText: { flex: 1, fontSize: 12, marginLeft: 8, fontWeight: '600', opacity: 0.6 },
  fab: { position: 'absolute', bottom: 90, right: 20, width: 70, height: 65,alignItems: 'center', justifyContent: 'center'  },
   
  deleteAction: { width: 90, height: '88%', marginBottom: 16 },
  deleteGradient: { flex: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 32, marginLeft: 10 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyLottie: { width: 200, height: 200 },
  emptyText: { marginTop: -20, fontSize: 16, fontWeight: '700', opacity: 0.5 },
});

export default Home;