import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import React, { useMemo, useState } from 'react';
import {
    Dimensions,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { ContributionGraph, LineChart, PieChart, ProgressChart } from 'react-native-chart-kit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

import { useTheme } from '../../context/ThemeContext';

const { width, height } = Dimensions.get('window');

const Insights = () => {
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useTheme();

    const { list } = useSelector((state) => state.echoes);
    const { list: journalList } = useSelector((state) => state.journals);

    const [timeframe, setTimeframe] = useState('Month');

    // --- EMOTION CONFIGURATION ---
    const emotions = [
        { label: 'Burnout', value: 'Burnout', animation: require('../../assets/burnout.json'), color: '#FF4B2B' },
        { label: 'Chill', value: 'Calm', animation: require('../../assets/chill.json'), color: '#4FC3F7' },
        { label: 'Fire', value: 'Fire', animation: require('../../assets/Fire.json'), color: '#FF8C00' },
        { label: 'Play', value: 'Excited', animation: require('../../assets/play.json'), color: '#FF5722' },
        { label: 'In Love', value: 'Loved', animation: require('../../assets/inlove.json'), color: '#E91E63' },
        { label: 'Sad', value: 'Sad', animation: require('../../assets/sad.json'), color: '#546E7A' },
        { label: 'Sick', value: 'Sick', animation: require('../../assets/sick.json'), color: '#9E9E9E' },
        { label: 'Walk', value: 'Grateful', animation: require('../../assets/walk.json'), color: '#4CAF50' },
    ];

    const moodWeights = { 'Excited': 10, 'Fire': 9, 'Loved': 8, 'Grateful': 7, 'Calm': 6, 'Burnout': 3, 'Sad': 2, 'Sick': 1 };

    const getEmotionDetails = (val) => emotions.find(e => e.value === val) || emotions[1];

    // --- DYNAMIC CHART CONFIG ---
    // This now pulls directly from your ThemeContext palette
    const chartConfig = {
        backgroundGradientFrom: colors.glass,
        backgroundGradientTo: colors.glass,
        backgroundGradientFromOpacity: 0,
        backgroundGradientToOpacity: 0,
        // Uses your primary indigo theme color
        color: (opacity = 1) => isDark
            ? `rgba(99, 102, 241, ${opacity})`
            : `rgba(79, 70, 229, ${opacity})`,
        labelColor: (opacity = 1) => colors.textSecondary,
        strokeWidth: 3,
        decimalPlaces: 0,
        propsForDots: {
            r: "6",
            strokeWidth: "3",
            stroke: isDark ? colors.background[0] : '#FFF'
        },
        // Styling for the Activity Map squares
        propsForBackgroundLines: {
            strokeDasharray: "", // solid background lines
            stroke: colors.glassBorder,
        }
    };

    // --- DATA LOGIC ---
    const chartData = useMemo(() => {
        const safeList = Array.isArray(list) ? list.filter(echo => echo && echo.createdAt) : [];
        if (safeList.length === 0) return { labels: ["No Data"], datasets: [{ data: [0] }] };

        const sortedList = [...safeList].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        const recentEchoes = sortedList.slice(-6);

        const labels = recentEchoes.map(echo => {
            const date = new Date(echo.createdAt);
            return isNaN(date.getTime()) ? "??" : (date.getMonth() + 1) + "/" + date.getDate();
        });

        const dataPoints = recentEchoes.map(echo => moodWeights[echo.emotion] || 5);

        return {
            labels: labels.length > 0 ? labels : ["..."],
            datasets: [{
                data: dataPoints.length > 0 ? dataPoints : [0],
                strokeWidth: 4,
                color: (opacity = 1) => colors.primary // Line color matches theme
            }]
        };
    }, [list, colors.primary]);

    const heatmapData = useMemo(() => {
        const jList = Array.isArray(journalList) ? journalList : [];
        const dateMap = jList.reduce((acc, entry) => {
            const date = new Date(entry.createdAt).toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});
        return Object.keys(dateMap).map(date => ({ date, count: dateMap[date] }));
    }, [journalList]);

    const pieData = useMemo(() => {
        const data = Array.isArray(list) ? list : [];
        if (data.length === 0) return [];
        const counts = data.reduce((acc, echo) => {
            const emo = echo.emotion || 'Calm';
            acc[emo] = (acc[emo] || 0) + 1;
            return acc;
        }, {});

        return Object.keys(counts).map(key => {
            const details = getEmotionDetails(key);
            return {
                name: key,
                population: counts[key],
                color: details.color,
                legendFontColor: 'transparent',
                legendFontSize: 0
            };
        }).sort((a, b) => b.population - a.population);
    }, [list]);

   const stats = useMemo(() => {
    const data = Array.isArray(list) ? list : [];
    if (!data.length) return { total: 0, topEmotion: 'Calm', stability: 0 };

    const now = new Date();
    
    // 1. Add null-checks for createdAt
    const filtered = data.filter(item => {
        if (!item?.createdAt) return false;
        const itemDate = new Date(item.createdAt);
        if (isNaN(itemDate.getTime())) return false; // Skip invalid dates

        if (timeframe === 'Day') return itemDate.toDateString() === now.toDateString();
        if (timeframe === 'Month') return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
        return true;
    });

    // 2. Safely count emotions
    const emotionCounts = filtered.reduce((acc, item) => {
        const emo = item.emotion || 'Calm';
        acc[emo] = (acc[emo] || 0) + 1;
        return acc;
    }, {});

    // 3. Safely find the top emotion (Check if keys exist first)
    const emotionKeys = Object.keys(emotionCounts);
    const topEmotion = emotionKeys.length > 0
        ? emotionKeys.reduce((a, b) => emotionCounts[a] > emotionCounts[b] ? a : b)
        : 'Calm';

    // 4. Safely calculate stability
    const weights = filtered.map(e => moodWeights[e.emotion] || 5);
    let stability = 0.5; // Default stability
    
    if (weights.length > 0) {
        const mean = weights.reduce((a, b) => a + b, 0) / weights.length;
        const variance = weights.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / weights.length;
        stability = Math.max(0.1, Math.min(1, 1 - (variance / 25)));
    }

    return { total: filtered.length, topEmotion, stability };
}, [list, timeframe]);

    const topEmotionDetails = getEmotionDetails(stats.topEmotion);

    return (
        <View style={[styles.container, { backgroundColor: colors.background[0] }]}>
            <StatusBar barStyle={colors.status} translucent backgroundColor="transparent" />



            <View style={styles.headerBackground}>
                {/* Blue Wave */}
                <View style={[
                    styles.blueWave,
                    {
                        backgroundColor: colors.primary,
                        opacity: isDark ? 0.3 : 0.8
                    }
                ]} />
                {/* Secondary Wave */}
                <View style={[
                    styles.darkWave,
                    {
                        backgroundColor: isDark ? '#1E293B' : '#637D8B',
                        opacity: isDark ? 0.6 : 0.4
                    }
                ]} />
            </View>

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20, paddingBottom: 120 }]}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: colors.textMain }]}>Insights</Text>
                    <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Analyzing your emotional resonance.</Text>
                </View>

                {/* --- THEMED PILL PICKER --- */}
                <View style={[styles.pickerContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
                    {['Day', 'Month', 'Year'].map((item) => (
                        <TouchableOpacity
                            key={item}
                            onPress={() => setTimeframe(item)}
                            style={[
                                styles.pickerItem,
                                timeframe === item && {
                                    backgroundColor: isDark ? colors.primary : '#FFF',
                                    shadowColor: colors.primary,
                                    shadowOpacity: isDark ? 0.4 : 0.1,
                                    shadowRadius: 10,

                                }
                            ]}
                        >
                            <Text style={[
                                styles.pickerText,
                                { color: timeframe === item ? (isDark ? '#FFF' : colors.primary) : colors.textSecondary }
                            ]}>{item}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* --- GRID STATS --- */}
                <View style={styles.grid}>
                    <View style={[styles.miniCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                        <Ionicons name="analytics" size={22} color={colors.primary} />
                        <Text style={[styles.miniValue, { color: colors.textMain }]}>{stats.total}</Text>
                        <Text style={[styles.miniLabel, { color: colors.textSecondary }]}>Total Echoes</Text>
                    </View>
                    <View style={[styles.miniCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                        <LottieView
                            source={topEmotionDetails.animation}
                            autoPlay
                            loop
                            style={{ width: 42, height: 42 }}
                        />
                        <Text style={[styles.miniValue, { color: colors.textMain, marginTop: 4 }]} numberOfLines={1}>
                            {topEmotionDetails.label}
                        </Text>
                        <Text style={[styles.miniLabel, { color: colors.textSecondary }]}>Dominant</Text>
                    </View>
                </View>

                {/* --- MOOD FLOW --- */}
                <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Mood Flow</Text>
                <View style={[styles.chartCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                    {list?.length > 0 ? (
                        <LineChart
                            data={chartData}
                            width={width - 50}
                            height={220}
                            chartConfig={chartConfig}
                            bezier
                            style={styles.chartStyle}
                            withInnerLines={false}
                            withOuterLines={false}
                        />
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="pulse" size={40} color={colors.textSecondary} style={{ opacity: 0.3 }} />
                            <Text style={{ color: colors.textSecondary, marginTop: 10 }}>Anchor an Echo to see your flow</Text>
                        </View>
                    )}
                </View>

                {/* --- ACTIVITY MAP --- */}
                <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Activity Map</Text>
                <View style={[styles.chartCard, { paddingHorizontal: 0, backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                    {journalList?.length > 0 ? (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
                            <ContributionGraph
                                values={heatmapData}
                                endDate={new Date()}
                                numDays={105}
                                width={(105 / 7) * 25}
                                height={200}
                                chartConfig={{
                                    ...chartConfig,
                                    // Custom square coloring based on theme
                                    color: (opacity = 1) => isDark
                                        ? `rgba(99, 102, 241, ${opacity})`
                                        : `rgba(79, 70, 229, ${opacity})`,
                                }}
                                squareSize={18}
                                gutterSize={4}
                            />
                        </ScrollView>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="calendar-outline" size={40} color={colors.textSecondary} style={{ opacity: 0.3 }} />
                            <Text style={{ color: colors.textSecondary, marginTop: 10 }}>No journal activity recorded</Text>
                        </View>
                    )}
                </View>

                {/* --- EMOTIONAL PROFILE --- */}
                <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Emotional Profile</Text>
                <View style={[styles.chartCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                    {list?.length > 0 ? (
                        <View style={{ width: '100%', alignItems: 'center' }}>
                            <PieChart
                                data={pieData}
                                width={width}
                                height={200}
                                chartConfig={chartConfig}
                                accessor={"population"}
                                backgroundColor={"transparent"}
                                paddingLeft={(width / 4).toString()}
                                hasLegend={false}
                                absolute
                            />

                            <View style={styles.lottieLegendContainer}>
                                {pieData.map((item, index) => {
                                    const details = getEmotionDetails(item.name);
                                    const percentage = Math.round((item.population / stats.total) * 100);

                                    return (
                                        <View key={index} style={[styles.legendItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}>
                                            <View style={[styles.colorIndicator, { backgroundColor: item.color }]} />
                                            <LottieView
                                                source={details.animation}
                                                autoPlay
                                                loop
                                                style={styles.legendLottie}
                                            />
                                            <View style={{ flex: 1 }}>
                                                <Text style={[styles.legendText, { color: colors.textMain }]}>{details.label}</Text>
                                                <Text style={{ color: colors.textSecondary, fontSize: 10 }}>{item.population} recorded</Text>
                                            </View>
                                            <Text style={[styles.percentageText, { color: colors.primary }]}>{percentage}%</Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="pie-chart-outline" size={40} color={colors.textSecondary} style={{ opacity: 0.3 }} />
                            <Text style={{ color: colors.textSecondary, marginTop: 10 }}>More data needed</Text>
                        </View>
                    )}
                </View>

                {/* --- EMOTIONAL RESILIENCE --- */}
                <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Emotional Resilience</Text>
                <View style={[styles.chartCard, {
                    flexDirection: 'row',
                    backgroundColor: colors.glass,
                    borderColor: colors.glassBorder,
                    padding: 20,
                    alignItems: 'center'
                }]}>
                    {list?.length > 0 ? (
                        <>
                            <ProgressChart
                                data={{ data: [stats.stability] }}
                                width={width * 0.35}
                                height={120}
                                strokeWidth={12}
                                radius={40}
                                hideLegend={true}
                                chartConfig={{
                                    ...chartConfig,
                                    color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})` // Resilience stays green
                                }}
                            />
                            <View style={{ flex: 1, justifyContent: 'center', marginLeft: 15 }}>
                                <Text style={[styles.miniValue, { color: colors.textMain, fontSize: 26, marginTop: 0 }]}>
                                    {Math.round(stats.stability * 100)}%
                                </Text>
                                <Text style={[styles.miniLabel, { color: colors.textSecondary, fontSize: 12 }]}>Stability Score</Text>
                                <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 8, fontStyle: 'italic', lineHeight: 16 }}>
                                    {stats.stability > 0.7
                                        ? "Your emotional state shows high consistency."
                                        : "You are experiencing a wide, healthy range of emotions."}
                                </Text>
                            </View>
                        </>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="shield-checkmark-outline" size={40} color={colors.textSecondary} style={{ opacity: 0.3 }} />
                            <Text style={{ color: colors.textSecondary, marginTop: 10 }}>Data needed</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    headerBackground: { position: 'absolute', top: 0, width: '100%', height: height * 0.25 },
    blueWave: { position: 'absolute', top: -50, right: -50, width: width * 1.2, height: height * 0.2, borderBottomLeftRadius: 300, transform: [{ rotate: '-10deg' }] },
    darkWave: { position: 'absolute', top: -30, right: -80, width: width * 0.8, height: height * 0.18, borderBottomLeftRadius: 200, transform: [{ rotate: '-5deg' }] }, scrollContent: { paddingHorizontal: 20 },
    header: { marginBottom: 25, marginTop: 10 },
    headerTitle: { fontSize: 38, fontWeight: '900', letterSpacing: -1.5 },
    headerSubtitle: { fontSize: 16, fontWeight: '500', opacity: 0.8 },
    pickerContainer: { flexDirection: 'row', padding: 5, borderRadius: 20, marginBottom: 25 },
    pickerItem: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 16 },
    pickerText: { fontWeight: '800', fontSize: 14 },
    sectionTitle: { fontSize: 20, fontWeight: '800', marginBottom: 16, marginTop: 12, letterSpacing: -0.5 },
    chartCard: {
        borderRadius: 32,
        paddingVertical: 20,
        alignItems: 'center',
        overflow: 'hidden',
        marginBottom: 20,
        borderWidth: 1.5,
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20 },
            android: {}
        })
    },
    chartStyle: { borderRadius: 20, paddingRight: 40, marginTop: 10, marginLeft: -10 },
    grid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
    miniCard: { width: (width - 60) / 2, padding: 20, alignItems: 'center', borderRadius: 30, borderWidth: 1.5 },
    miniValue: { fontSize: 20, fontWeight: '900', marginTop: 12, letterSpacing: -0.5 },
    miniLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4, opacity: 0.7 },
    emptyContainer: { height: 180, justifyContent: 'center', alignItems: 'center', width: '100%' },
    lottieLegendContainer: { width: '100%', paddingHorizontal: 15, marginTop: 15 },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        padding: 12,
        borderRadius: 24,
    },
    colorIndicator: { width: 5, height: 30, borderRadius: 3, marginRight: 12 },
    legendLottie: { width: 38, height: 38, marginRight: 12 },
    legendText: { fontSize: 15, fontWeight: '800' },
    percentageText: { fontSize: 18, fontWeight: '900' }
});

export default Insights;