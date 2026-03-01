import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Platform, // Added for Search
    RefreshControl // Added for Pull-to-Refresh
    ,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

import GlassCard from '../components/GlassCard';
import { useTheme } from '../context/ThemeContext';
import { getEchoesAsync } from '../redux/echoSlice';

const Home = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { isDark, colors, toggleTheme } = useTheme();
  const { list, status } = useSelector((state) => state.echoes);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(getEchoesAsync());
  }, [dispatch]);

  // Logic: Filter list based on search query
  const filteredList = useMemo(() => {
    if (!searchQuery) return list;
    return list.filter(echo => 
      echo.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      echo.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, list]);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(getEchoesAsync());
    setRefreshing(false);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      activeOpacity={0.9} 
      onPress={() => {/* Add navigation to Detail if you have it */}}
    >
        <GlassCard style={[styles.echoCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
            <View style={styles.cardHeader}>
                <View style={styles.titleContainer}>
                    <Text style={[styles.echoTitle, { color: colors.cardText }]}>{item.title}</Text>
                    <Text style={styles.echoDate}>
                        {item.createdAt 
                        ? new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) 
                        : 'Date unknown'}
                    </Text>
                </View>
                <View style={[styles.emotionBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                    <Text style={[styles.echoEmotion, { color: colors.textMain }]}>
                        {item.emotion === 'Happy' ? '😊' : item.emotion === 'Calm' ? '🌊' : item.emotion === 'Proud' ? '⭐' : '☁️'} {item.emotion || 'Calm'}
                    </Text>
                </View>
            </View>
            
            {item.description ? (
                <Text style={[styles.echoDescription, { color: colors.cardDesc }]} numberOfLines={2}>
                    {item.description}
                </Text>
            ) : null}

            <View style={[styles.cardFooter, { borderTopColor: colors.glassBorder }]}>
                <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                <Text style={[styles.locationText, { color: colors.textSecondary }]} numberOfLines={1}>
                    {item.location?.address || 'Somewhere beautiful'}
                </Text>
            </View>
        </GlassCard>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={colors.background} style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      <View style={[styles.contentWrapper, { paddingTop: insets.top }]}>
        
        {/* Enhanced Header with Search */}
        <View style={styles.headerContainer}>
            <View style={styles.headerTop}>
                <View>
                    <Text style={[styles.title, { color: colors.textMain }]}>Echo Stamp</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Your life, anchored.</Text>
                </View>
                <TouchableOpacity onPress={toggleTheme} style={[styles.iconButton, { backgroundColor: colors.glass }]}>
                    <Ionicons name={isDark ? "sunny" : "moon"} size={22} color={colors.textMain} />
                </TouchableOpacity>
            </View>

            {/* Search Bar Area */}
            <GlassCard style={styles.searchContainer}>
                <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
                <TextInput
                    style={[styles.searchInput, { color: colors.textMain }]}
                    placeholder="Search your memories..."
                    placeholderTextColor={colors.textSecondary + '80'}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                        <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                    </TouchableOpacity>
                )}
            </GlassCard>
        </View>

        {/* Content Section */}
        {status === 'loading' && !refreshing ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.textMain} />
            <Text style={[styles.loadingText, { color: colors.textMain }]}>Gathering your echoes...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredList}
            keyExtractor={(item) => item._id || Math.random().toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.textMain} />
            }
            ListEmptyComponent={
              <GlassCard style={[styles.emptyCard, { backgroundColor: colors.glass }]}>
                <Ionicons 
                    name={searchQuery ? "search-outline" : "cloud-outline"} 
                    size={50} 
                    color={colors.textSecondary} 
                    style={{ marginBottom: 10 }} 
                />
                <Text style={[styles.emptyText, { color: colors.textMain }]}>
                    {searchQuery ? "No matches found" : "No memories yet"}
                </Text>
                <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                    {searchQuery ? "Try a different keyword" : "Tap the + to anchor your first Echo."}
                </Text>
              </GlassCard>
            }
            renderItem={renderItem}
          />
        )}

        {/* Floating Action Button */}
        <TouchableOpacity style={styles.fab} activeOpacity={0.8} onPress={() => navigation.navigate('Create')}>
          <LinearGradient 
            colors={isDark ? ['#304FFE', '#1A237E'] : ['#01579B', '#81D4FA']} 
            style={styles.fabGradient}
          >
            <Ionicons name="add" size={35} color={'#FFF'} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentWrapper: { flex: 1 },
  headerContainer: { paddingHorizontal: 25, paddingBottom: 10 },
  headerTop: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10
  },
  title: { fontSize: 32, fontWeight: '900', letterSpacing: -1.5 },
  subtitle: { fontSize: 14, opacity: 0.7, fontWeight: '600' },
  iconButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  
  // Search Bar Styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '500',
  },

  listContent: { padding: 20, paddingBottom: 150 },
  echoCard: { marginBottom: 16, padding: 20, borderRadius: 24 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  titleContainer: { flex: 1, paddingRight: 10 },
  echoTitle: { fontSize: 20, fontWeight: '800', marginBottom: 2 },
  echoDate: { fontSize: 11, color: '#546E7A', fontWeight: '700', textTransform: 'uppercase' },
  emotionBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  echoEmotion: { fontSize: 12, fontWeight: '700' },
  echoDescription: { fontSize: 14, lineHeight: 20, marginBottom: 15, opacity: 0.8 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, paddingTop: 12, opacity: 0.6 },
  locationText: { fontSize: 11, marginLeft: 4, fontWeight: '600' },
  
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 15, fontWeight: '700', letterSpacing: 0.5 },
  
  emptyCard: { alignItems: 'center', marginTop: 40, paddingVertical: 40, paddingHorizontal: 20, borderRadius: 24 },
  emptyText: { fontSize: 20, fontWeight: '800' },
  emptySubtext: { fontSize: 14, opacity: 0.6, marginTop: 8, textAlign: 'center' },
  
  fab: { 
    position: 'absolute', 
    right: 25, 
    bottom: Platform.OS === 'ios' ? 100 : 80, 
    width: 65, 
    height: 65, 
    borderRadius: 32.5, 
    elevation: 8,
    shadowColor: '#000', 
    shadowOpacity: 0.3, 
    shadowRadius: 12 
  },
  fabGradient: { 
    flex: 1, 
    borderRadius: 32.5, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: 'rgba(255, 255, 255, 0.3)' 
  },
});

export default Home;