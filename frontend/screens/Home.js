import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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

import GlassCard from '../components/GlassCard';
import { useTheme } from '../context/ThemeContext';
import { deleteEchoAsync, getEchoesAsync } from '../redux/echoSlice';

const Home = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { isDark, colors, toggleTheme } = useTheme();

  // 1. Critical: Get the user object from Redux Auth
  // Note: Check your authSlice; if your user object is stored differently, 
  // you might need state.auth.currentUser or similar.
  const { user } = useSelector((state) => state.auth);
  const { list, status } = useSelector((state) => state.echoes);

  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // 2. Fetch specifically for THIS user.
  // We pass user._id to ensure the query in MongoDB finds the document you showed me.
useEffect(() => {
  // Use a logical check to find the ID regardless of underscore
  const userId = user?._id || user?.id;
  
  if (userId) {
    console.log("Refreshing - Fetching for:", userId);
    // Force 'mode' in the slice or ensure the slice defaults to it
    dispatch(getEchoesAsync(userId)); 
  } else {
    console.warn("Home Refresh failed: No User ID found in Redux state");
  }
}, [dispatch, user?._id, user?.id]);
  
 const filteredList = useMemo(() => {
   
    const data = Array.isArray(list) ? list : [];
    
     
    if (!searchQuery) return data;

    return data.filter(echo =>
      echo.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      echo.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, list]);
  const onRefresh = async () => {
    if (user?._id) {
      setRefreshing(true);
      await dispatch(getEchoesAsync(user._id));
      setRefreshing(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert("Delete Echo", "Delete this memory?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          // Specify type: 'journal' so Redux knows which list to update
          dispatch(deleteEchoAsync({ id, type: 'journal' }));
        }
      }
    ]);
  };

  const renderRightActions = (id) => (
    <TouchableOpacity
      style={styles.deleteAction}
      onPress={() => handleDelete(id)}
    >
      <Ionicons name="trash-outline" size={24} color="white" />
      <Text style={styles.deleteText}>DELETE</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => (
    <Swipeable
      renderRightActions={() => renderRightActions(item._id)}
      overshootRight={false}
    >
      <TouchableOpacity activeOpacity={0.9}>
        <GlassCard style={[styles.echoCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
          <View style={styles.cardHeader}>
            <View style={styles.titleContainer}>
              <Text style={[styles.echoTitle, { color: colors.textMain }]}>{item.title}</Text>
              <Text style={[styles.echoDate, { color: colors.textSecondary }]}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.emotionBadge}>
              <Text style={[styles.echoEmotion, { color: colors.textMain }]}>
                {item.emotion === 'Calm' ? '🌊' : '😊'} {item.emotion}
              </Text>
            </View>
          </View>

          {item.description ? (
            <Text style={[styles.echoDescription, { color: colors.cardDesc }]}>
              {item.description}
            </Text>
          ) : null}

          <View style={[styles.cardFooter, { borderTopColor: colors.glassBorder }]}>
            <Ionicons name="location-outline" size={14} color={colors.primary} />
            <Text style={[styles.locationText, { color: colors.textSecondary }]}>
              {item.location?.address}
            </Text>
          </View>
        </GlassCard>
      </TouchableOpacity>
    </Swipeable>
  );

  return (
    <LinearGradient colors={colors.background} style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={[styles.contentWrapper, { paddingTop: insets.top }]}>

        {/* Header Section */}
        <View style={styles.headerContainer}>
          <View style={styles.headerTop}>
            <View>
              <Text style={[styles.title, { color: colors.textMain }]}>Echo Stamp</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {user?.name ? `Welcome back, ${user.name}` : "Your life, anchored."}
              </Text>
            </View>
            <TouchableOpacity onPress={toggleTheme} style={styles.iconButton}>
              <Ionicons name={isDark ? "sunny" : "moon"} size={22} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <GlassCard style={[styles.searchContainer, { borderColor: colors.glassBorder }]}>
            <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.textMain }]}
              placeholder="Search journals..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </GlassCard>
        </View>

        {/* Content Section */}
        {status === 'loading' && !refreshing ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={filteredList}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
            }
            renderItem={renderItem}
            ListEmptyComponent={
              <View style={styles.emptyCard}>
                <Text style={{ color: colors.textSecondary }}>No journal entries found for this user.</Text>
              </View>
            }
          />
        )}

        {/* Create Button */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('Create')}
        >
          <LinearGradient colors={[colors.primary, '#1A237E']} style={styles.fabGradient}>
            <Ionicons name="add" size={35} color={'#FFF'} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

// ... keep your styles exactly as they were
const styles = StyleSheet.create({
  container: { flex: 1 },
  contentWrapper: { flex: 1 },
  headerContainer: { paddingHorizontal: 25, paddingBottom: 10 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 10 },
  title: { fontSize: 32, fontWeight: '900', letterSpacing: -1.5 },
  subtitle: { fontSize: 14, opacity: 0.8, fontWeight: '600' },
  iconButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 15, borderWidth: 1 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },
  listContent: { padding: 20, paddingBottom: 150 },
  echoCard: { marginBottom: 16, padding: 20, borderRadius: 24, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  titleContainer: { flex: 1 },
  echoTitle: { fontSize: 20, fontWeight: '800' },
  echoDate: { fontSize: 11, textTransform: 'uppercase', marginTop: 2 },
  emotionBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.05)' },
  echoEmotion: { fontSize: 12, fontWeight: '700' },
  echoDescription: { fontSize: 14, lineHeight: 20, marginBottom: 15 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, paddingTop: 12 },
  locationText: { fontSize: 11, marginLeft: 4 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyCard: { alignItems: 'center', marginTop: 40 },
  fab: { position: 'absolute', right: 25, bottom: 100, width: 65, height: 65 },
  fabGradient: { flex: 1, borderRadius: 32.5, justifyContent: 'center', alignItems: 'center' },
  deleteAction: { backgroundColor: '#FF5252', justifyContent: 'center', alignItems: 'center', width: 80, marginBottom: 16, borderRadius: 24 },
  deleteText: { color: 'white', fontSize: 10, fontWeight: '800' }
});

export default Home;