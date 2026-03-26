import React, { useState } from 'react';
import {
    Dimensions,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import { useTheme } from '../../context/ThemeContext';

// --- IMPORT YOUR REUSABLE COMPONENT ---
import BrandedHeader from '../../components/BrandedHeader';

import Feed from '../EchoStamp/tabs/Feed/Feed';
import Events from './tabs/Events/Events';
import Explore from './tabs/Explore/Explore';
import Saved from './tabs/Saved/Saved';
import Trending from './tabs/Trending/Trending';

const { width, height } = Dimensions.get('window');

const EchoStamp = () => {
    const layout = useWindowDimensions();
    const { colors, isDark } = useTheme();
    const [index, setIndex] = useState(0);

    const [routes] = useState([
        { key: 'feed', title: 'Feed' },
        { key: 'trending', title: 'Trending' },
        { key: 'explore', title: 'Explore' },
        { key: 'events', title: 'Events' },
        { key: 'saved', title: 'Saved' },
    ]);

    const renderScene = SceneMap({
        feed: () => <Feed filter="all" />,
        trending: () => <Trending />, 
        explore: () => <Explore />,
        events: () => <Events />,
        saved: () => <Saved />,
    });

    const renderTabBar = (props) => (
        <TabBar
            {...props}
            scrollEnabled
            indicatorStyle={{ backgroundColor: 'transparent' }}
            style={styles.tabBar}
            tabStyle={{ width: 'auto', padding: 0 }}
            contentContainerStyle={{ paddingLeft: 1, paddingBottom: 10 }}
            renderTabBarItem={({ route, onPress, navigationState }) => {
                const isActive = navigationState.routes[navigationState.index].key === route.key;
                return (
                    <TouchableOpacity
                        onPress={onPress}
                        activeOpacity={0.8}
                        style={[
                            styles.categoryPill,
                            { 
                                backgroundColor: isActive 
                                    ? (isDark ? colors.primary : '#243B55') 
                                    : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'),
                                borderColor: isActive ? 'transparent' : colors.glassBorder,
                                borderWidth: 1
                            }
                        ]}
                    >
                        <Text style={[
                            styles.categoryText,
                            { color: isActive ? (isDark ? '#000' : '#FFF') : colors.textSecondary }
                        ]}>
                            {route.title}
                        </Text>
                    </TouchableOpacity>
                );
            }}
        />
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background[0] }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            
            {/* --- REUSABLE BRANDED HEADER --- */}
            <BrandedHeader colors={colors} isDark={isDark} />

            <SafeAreaView style={styles.flex1}>
                <View style={styles.header}>
                    <Text style={[styles.mainTitle, { color: colors.textMain }]}>Stamp</Text>
                </View>

                <TabView
                    navigationState={{ index, routes }}
                    renderScene={renderScene}
                    renderTabBar={renderTabBar}
                    onIndexChange={setIndex}
                    initialLayout={{ width: layout.width }}
                    // Ensures background content doesn't block the waves
                    sceneContainerStyle={{ backgroundColor: 'transparent' }}
                    style={{ backgroundColor: 'transparent' }}
                />
            </SafeAreaView>
        </View>
    );
};

export default EchoStamp;

const styles = StyleSheet.create({
    container: { flex: 1 },
    flex1: { flex: 1, paddingTop: 20 },
    // Content Styles
    header: { paddingHorizontal: 20 },
    mainTitle: { fontSize: 34, fontWeight: '900', letterSpacing: -1 },
    tabBar: { 
        backgroundColor: 'transparent', 
        elevation: 0, 
        shadowOpacity: 0, 
        marginTop: 15,
        borderBottomWidth: 0 
    },
    categoryPill: { 
        paddingHorizontal: 10, 
        paddingVertical: 10, 
        borderRadius: 25, 
        marginRight: 6,
    },
    categoryText: { fontWeight: '800', fontSize: 14 },
});