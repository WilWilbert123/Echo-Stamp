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

import Events from '../EchoStamp/tabs/Events';
import Explore from '../EchoStamp/tabs/Explore';
import Feed from '../EchoStamp/tabs/Feed/Feed';
import Saved from '../EchoStamp/tabs/Saved';
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
            
            {/* --- Branded Header Waves --- */}
            <View style={styles.headerBackground}>
                <View style={[styles.blueWave, { backgroundColor: colors.primary, opacity: isDark ? 0.3 : 0.8 }]} />
                <View style={[styles.darkWave, { backgroundColor: isDark ? '#1E293B' : '#637D8B' }]} />
            </View>

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
                    // This ensures the scenes don't have their own conflicting backgrounds
                    sceneContainerStyle={{ backgroundColor: 'transparent' }}
                />
            </SafeAreaView>
        </View>
    );
};

export default EchoStamp;

const styles = StyleSheet.create({
    container: { flex: 1 },
    flex1: { flex: 1 ,paddingTop:20},
    // Branded Wave Styles
    headerBackground: { 
        position: 'absolute', 
        top: 0, 
        width: '100%', 
        height: height * 0.25 
    },
    blueWave: { 
        position: 'absolute', 
        top: -50, 
        right: -50, 
        width: width * 1.2, 
        height: height * 0.2, 
        borderBottomLeftRadius: 300, 
        transform: [{ rotate: '-10deg' }] 
    },
    darkWave: { 
        position: 'absolute', 
        top: -30, 
        right: -80, 
        width: width * 0.8, 
        height: height * 0.18, 
        opacity: 0.6, 
        borderBottomLeftRadius: 200, 
        transform: [{ rotate: '-5deg' }] 
    },
    // Content Styles
    header: { paddingHorizontal: 20  },
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