import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../context/ThemeContext';
import { deleteEchoAsync, getEchoesAsync } from '../../redux/echoSlice';

// IMPORT THE NEW CONSTANTS
import { EMOTION_ASSETS, EMOTION_CONFIG } from '../../constants/assets';

const { width, height } = Dimensions.get('window');

const Home = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  
  const { isDark, colors, toggleTheme } = useTheme();

  const { user } = useSelector((state) => state.auth);
  const { list, status } = useSelector((state) => state.echoes);

  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const userId = user?._id || user?.id;
    if (userId) {
      dispatch(getEchoesAsync(userId)); 
    }
  }, [dispatch, user?._id, user?.id]);

  const filteredList = useMemo(() => {
    const data = Array.isArray(list) ? list : [];
    if (!searchQuery) return data;
    return data.filter(echo =>
      echo.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      echo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      echo.emotion?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, list]);

  const onRefresh = async () => {
    const userId = user?._id || user?.id;
    if (userId) {
      setRefreshing(true);
      await dispatch(getEchoesAsync(userId));
      setRefreshing(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert("Delete Echo", "Delete this memory forever?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        style: "destructive", 
        onPress: () => dispatch(deleteEchoAsync({ id, type: 'journal' })) 
      }
    ]);
  };

  const renderRightActions = (id) => (
    <TouchableOpacity 
      style={[styles.deleteAction, { backgroundColor: '#EF4444' }]} 
      onPress={() => handleDelete(id)}
    >
      <Ionicons name="trash-sharp" size={24} color="white" />
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => {
    // LOOKUP LOGIC: Find the config for this specific emotion stored in DB
    const config = EMOTION_CONFIG.find(c => c.value === item.emotion);
    
    // Get the animation file from assets using the key, or fallback to Calm
    const animationSource = config ? EMOTION_ASSETS[config.assetKey] : EMOTION_ASSETS.Calm;
    
    // Use the pretty label from config (e.g., "Chill" instead of "Calm")
    const displayLabel = config ? config.label : item.emotion;

    return (
      <Swipeable renderRightActions={() => renderRightActions(item._id)} overshootRight={false}>
        <TouchableOpacity 
          activeOpacity={0.8} 
          style={[
            styles.echoCard, 
            { 
              backgroundColor: isDark ? colors.glass : '#FFF',
              borderColor: colors.glassBorder,
              borderWidth: isDark ? 1 : 0.5 
            }
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={styles.titleContainer}>
              <Text style={[styles.echoTitle, { color: colors.textMain }]} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={[styles.echoDate, { color: colors.textSecondary }]}>
                  {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </Text>
            </View>

            <View style={styles.emotionContainer}>
              <LottieView
                source={animationSource}
                autoPlay
                loop
                style={styles.emotionLottie}
              />
              <Text style={[styles.echoEmotion, { color: colors.primary }]}>
                {displayLabel}
              </Text>
            </View>
          </View>

          {item.description && (
            <Text style={[styles.echoDescription, { color: isDark ? 'rgba(255,255,255,0.6)' : '#555' }]} numberOfLines={2}>
              {item.description}
            </Text>
          )}

          <View style={styles.cardFooter}>
            <Ionicons name="location-sharp" size={12} color={colors.primary} />
            <Text 
              style={[styles.locationText, { color: colors.textSecondary }]} 
              numberOfLines={1} 
              ellipsizeMode="tail"
            >
              {item.location?.address || 'Somewhere beautiful'}
            </Text>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background[0] }]}>
      <StatusBar barStyle={colors.status} />

      <View style={styles.headerBackground}>
        <View style={[styles.blueWave, { backgroundColor: colors.primary, opacity: isDark ? 0.3 : 0.8 }]} />
        <View style={[styles.darkWave, { backgroundColor: isDark ? '#1E293B' : '#637D8B', opacity: 0.6 }]} />
      </View>

      <View style={[styles.contentWrapper, { paddingTop: insets.top + 30}]}>
        
        <View style={styles.headerContainer}>
          <View style={styles.headerTop}>
            <View>
              <Text style={[styles.welcomeText, { color: isDark ? 'rgba(255,255,255,0.7)' : '#333' }]}>Hello,</Text>
              <Text style={[styles.userName, { color: isDark ? '#FFF' : colors.primary }]}>
                {user?.username || user?.name || "Explorer"}
              </Text>
            </View>
            <TouchableOpacity onPress={toggleTheme} style={[styles.themeToggle, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
              <Ionicons name={isDark ? "sunny" : "moon"} size={22} color={isDark ? "#FBDF24" : colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={[
            styles.searchWrapper, 
            { 
                backgroundColor: isDark ? colors.glass : '#F4F4F4',
                borderColor: colors.glassBorder,
                borderWidth: isDark ? 1 : 0
            }
          ]}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.textMain }]}
              placeholder="Search your echoes..."
              placeholderTextColor={isDark ? 'rgba(255,255,255,0.3)' : '#999'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {status === 'loading' && !refreshing ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={filteredList}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
            }
            renderItem={renderItem}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="journal-outline" size={60} color={colors.glassBorder} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No anchor entries yet.</Text>
              </View>
            }
          />
        )}

        <TouchableOpacity 
          style={styles.fab} 
          onPress={() => navigation.navigate('Create')}
        >
          <LinearGradient 
            colors={isDark ? [colors.primary, '#0369A1'] : ['#8ECCE3', '#6AB8D2']} 
            style={styles.fabGradient}
          >
            <Ionicons name="add" size={32} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBackground: { position: 'absolute', top: 0, width: '100%', height: height * 0.25 },
  blueWave: { position: 'absolute', top: -50, right: -50, width: width * 1.2, height: height * 0.22, borderBottomLeftRadius: 300, transform: [{ rotate: '-10deg' }] },
  darkWave: { position: 'absolute', top: -30, right: -80, width: width * 0.8, height: height * 0.2, borderBottomLeftRadius: 200, transform: [{ rotate: '-5deg' }] },
  contentWrapper: { flex: 1 },
  headerContainer: { paddingHorizontal: 25, marginBottom: 10 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  welcomeText: { fontSize: 16, fontWeight: '500' },
  userName: { fontSize: 28, fontWeight: 'bold' },
  themeToggle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  searchWrapper: { flexDirection: 'row', alignItems: 'center', borderRadius: 15, paddingHorizontal: 15, height: 50 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15 },
  listContent: { paddingHorizontal: 25, paddingTop: 15, paddingBottom: 120 },
  
  // CARD STYLES
  echoCard: { 
    borderRadius: 24, 
    padding: 18, 
    marginBottom: 15, 
    shadowColor: '#000', 
    shadowOpacity: 0.05, 
    shadowRadius: 10, 
    shadowOffset: { width: 0, height: 4 }, 
    
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  titleContainer: { flex: 1, marginRight: 15 },
  echoTitle: { fontSize: 18, fontWeight: '800', marginBottom: 2 },
  echoDate: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, opacity: 0.6 },
  
  emotionContainer: { alignItems: 'center', justifyContent: 'center', minWidth: 70 },
  emotionLottie: { width: 60, height: 60 },
  echoEmotion: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', textAlign: 'center', marginTop: -5 },
  
  echoDescription: { fontSize: 14, lineHeight: 20, marginBottom: 15, opacity: 0.8 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(150,150,150,0.2)', paddingTop: 12 },
  locationText: { flex: 1, fontSize: 11, marginLeft: 6, fontWeight: '600' },
  
  fab: { position: 'absolute', bottom: 100, right: 25, width: 64, height: 64,   shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } },
  fabGradient: { flex: 1, borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
  deleteAction: { justifyContent: 'center', alignItems: 'center', width: 80, height: '88%', marginTop: 0, borderRadius: 24, marginRight: 15 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 15, fontSize: 16, fontWeight: '600' },
});

export default Home;