import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import React, { useMemo, useState } from 'react';
import {
    Dimensions,
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

    const chartConfig = {
        backgroundGradientFrom: colors.glass,
        backgroundGradientTo: colors.glass,
        backgroundGradientFromOpacity: 0,
        backgroundGradientToOpacity: 0,
        color: (opacity = 1) => isDark ? `rgba(56, 189, 248, ${opacity})` : `rgba(14, 165, 233, ${opacity})`,
        labelColor: (opacity = 1) => isDark ? `rgba(255, 255, 255, ${opacity * 0.6})` : `rgba(30, 41, 59, ${opacity * 0.7})`,
        strokeWidth: 3,
        decimalPlaces: 0,
        propsForDots: {
            r: "5",
            strokeWidth: "2",
            stroke: isDark ? colors.background[0] : '#FFF'
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
            datasets: [{ data: dataPoints.length > 0 ? dataPoints : [0], strokeWidth: 4 }]
        };
    }, [list]);

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
                // We hide default text to use our Custom Legend below
                legendFontColor: 'transparent',
                legendFontSize: 0 
            };
        }).sort((a, b) => b.population - a.population);
    }, [list]);

    const stats = useMemo(() => {
        const data = Array.isArray(list) ? list : [];
        if (!data.length) return { total: 0, topEmotion: 'Calm', stability: 0 };
        const now = new Date();
        const filtered = data.filter(item => {
            const itemDate = new Date(item.createdAt);
            if (timeframe === 'Day') return itemDate.toDateString() === now.toDateString();
            if (timeframe === 'Month') return itemDate.getMonth() === now.getMonth();
            return true;
        });
        const emotionCounts = filtered.reduce((acc, item) => {
            const emo = item.emotion || 'Calm';
            acc[emo] = (acc[emo] || 0) + 1;
            return acc;
        }, {});
        const topEmotion = Object.keys(emotionCounts).length
            ? Object.keys(emotionCounts).reduce((a, b) => emotionCounts[a] > emotionCounts[b] ? a : b)
            : 'Calm';
        const weights = filtered.map(e => moodWeights[e.emotion] || 5);
        const mean = weights.reduce((a, b) => a + b, 0) / weights.length;
        const variance = weights.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / weights.length;
        const stability = Math.max(0.1, Math.min(1, 1 - (variance / 25)));
        return { total: data.length, topEmotion, stability };
    }, [list, timeframe]);

    const topEmotionDetails = getEmotionDetails(stats.topEmotion);

    return (
        <View style={[styles.container, { backgroundColor: colors.background[0] }]}>
            <StatusBar barStyle={colors.status} />

            <View style={styles.headerBackground}>
                <View style={[styles.blueWave, { backgroundColor: colors.primary, opacity: isDark ? 0.3 : 0.8 }]} />
                <View style={[styles.darkWave, { backgroundColor: isDark ? '#1E293B' : '#637D8B', opacity: 0.6 }]} />
            </View>

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20, paddingBottom: 120 }]}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: isDark ? '#FFF' : colors.primary }]}>Insights</Text>
                    <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Analyzing your emotional resonance.</Text>
                </View>

                {/* PILL PICKER */}
                <View style={[styles.pickerContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                    {['Day', 'Month', 'Year'].map((item) => (
                        <TouchableOpacity
                            key={item}
                            onPress={() => setTimeframe(item)}
                            style={[styles.pickerItem, timeframe === item && { backgroundColor: isDark ? colors.primary : '#FFF', elevation: 2 }]}
                        >
                            <Text style={[styles.pickerText, { color: timeframe === item ? (isDark ? '#000' : colors.primary) : colors.textSecondary }]}>{item}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* GRID STATS */}
                <View style={styles.grid}>
                    <View style={[styles.miniCard, { backgroundColor: isDark ? colors.glass : '#FFF', borderColor: colors.glassBorder }]}>
                        <Ionicons name="analytics" size={24} color={colors.primary} />
                        <Text style={[styles.miniValue, { color: colors.textMain }]}>{stats.total}</Text>
                        <Text style={[styles.miniLabel, { color: colors.textSecondary }]}>Total Echoes</Text>
                    </View>
                    <View style={[styles.miniCard, { backgroundColor: isDark ? colors.glass : '#FFF', borderColor: colors.glassBorder, paddingVertical: 10 }]}>
                        <LottieView 
                            source={topEmotionDetails.animation} 
                            autoPlay 
                            loop 
                            style={{ width: 45, height: 45 }}
                        />
                        <Text style={[styles.miniValue, { color: colors.textMain, marginTop: 5 }]} numberOfLines={1}>{topEmotionDetails.label}</Text>
                        <Text style={[styles.miniLabel, { color: colors.textSecondary }]}>Dominant</Text>
                    </View>
                </View>

                {/* MOOD FLOW */}
                <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Mood Flow</Text>
                <View style={[styles.chartCard, { backgroundColor: isDark ? colors.glass : '#FFF', borderColor: colors.glassBorder }]}>
                    {list?.length > 0 ? (
                        <LineChart
                            data={chartData}
                            width={width - 50}
                            height={220}
                            chartConfig={{ ...chartConfig, fromZero: true, count: 6 }}
                            bezier
                            style={[styles.chartStyle, { paddingRight: 45, marginLeft: -15 }]}
                            withInnerLines={false}
                            withOuterLines={false}
                        />
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="pulse" size={40} color={colors.glassBorder} />
                            <Text style={{ color: colors.textSecondary, marginTop: 10 }}>Anchor an Echo to see your flow</Text>
                        </View>
                    )}
                </View>

                {/* ACTIVITY MAP */}
                <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Activity Map</Text>
                <View style={[styles.chartCard, { paddingHorizontal: 0, backgroundColor: isDark ? colors.glass : '#FFF', borderColor: colors.glassBorder }]}>
                    {journalList?.length > 0 ? (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
                            <ContributionGraph
                                values={heatmapData}
                                endDate={new Date()}
                                numDays={105}
                                width={(105 / 7) * 25}
                                height={200}
                                chartConfig={chartConfig}
                                squareSize={18}
                                gutterSize={3}
                            />
                        </ScrollView>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="calendar-outline" size={40} color={colors.glassBorder} />
                            <Text style={{ color: colors.textSecondary, marginTop: 10 }}>No journal activity recorded</Text>
                        </View>
                    )}
                </View>

                {/* EMOTIONAL PROFILE WITH LOTTIE LEGEND */}
                <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Emotional Profile</Text>
                <View style={[styles.chartCard, { backgroundColor: isDark ? colors.glass : '#FFF', borderColor: colors.glassBorder }]}>
                    {list?.length > 0 ? (
                        <View style={{ width: '100%', alignItems: 'center' }}>
                            <PieChart
                                data={pieData}
                                width={width}
                                height={200}
                                chartConfig={chartConfig}
                                accessor={"population"}
                                backgroundColor={"transparent"}
                                paddingLeft={(width / 4).toString()} // Centers the Pie
                                hasLegend={false} // Disable standard legend
                                absolute
                            />
                            
                            {/* CUSTOM LOTTIE LEGEND */}
                            <View style={styles.lottieLegendContainer}>
                                {pieData.map((item, index) => {
                                    const details = getEmotionDetails(item.name);
                                    const percentage = Math.round((item.population / stats.total) * 100);
                                    
                                    return (
                                        <View key={index} style={styles.legendItem}>
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
                            <Ionicons name="pie-chart-outline" size={40} color={colors.glassBorder} />
                            <Text style={{ color: colors.textSecondary, marginTop: 10 }}>More data needed</Text>
                        </View>
                    )}
                </View>

                {/* RESILIENCE */}
                <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Emotional Resilience</Text>
                <View style={[styles.chartCard, { flexDirection: 'row', backgroundColor: isDark ? colors.glass : '#FFF', borderColor: colors.glassBorder, padding: 20 }]}>
                    {list?.length > 0 ? (
                        <>
                            <ProgressChart
                                data={{ data: [stats.stability] }}
                                width={width * 0.35}
                                height={120}
                                strokeWidth={10}
                                radius={35}
                                chartConfig={{ ...chartConfig, color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})` }}
                                hideLegend={true}
                            />
                            <View style={{ flex: 1, justifyContent: 'center', marginLeft: 15 }}>
                                <Text style={[styles.miniValue, { color: colors.textMain, fontSize: 24, marginTop: 0 }]}>
                                    {Math.round(stats.stability * 100)}%
                                </Text>
                                <Text style={[styles.miniLabel, { color: colors.textSecondary, fontSize: 13 }]}>Stability Score</Text>
                                <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 6, fontStyle: 'italic' }}>
                                    {stats.stability > 0.7 ? "Consistent resonance." : "Diverse emotional range."}
                                </Text>
                            </View>
                        </>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="shield-checkmark-outline" size={40} color={colors.glassBorder} />
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
    darkWave: { position: 'absolute', top: -30, right: -80, width: width * 0.8, height: height * 0.18, borderBottomLeftRadius: 200, transform: [{ rotate: '-5deg' }] },
    scrollContent: { paddingHorizontal: 25 },
    header: { marginBottom: 25 },
    headerTitle: { fontSize: 36, fontWeight: '900', letterSpacing: -1 },
    headerSubtitle: { fontSize: 16, fontWeight: '500' },
    pickerContainer: { flexDirection: 'row', padding: 6, borderRadius: 16, marginBottom: 25 },
    pickerItem: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
    pickerText: { fontWeight: '800', fontSize: 13 },
    sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 15, marginTop: 10, letterSpacing: 0.5 },
    chartCard: { borderRadius: 28, paddingVertical: 20, alignItems: 'center', overflow: 'hidden', marginBottom: 20, borderWidth: 1 },
    chartStyle: { borderRadius: 20, paddingRight: 45, marginTop: 10 },
    grid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
    miniCard: { width: (width - 65) / 2, padding: 20, alignItems: 'center', borderRadius: 28, borderWidth: 1 },
    miniValue: { fontSize: 18, fontWeight: '900', marginTop: 10 },
    miniLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 },
    emptyContainer: { height: 160, justifyContent: 'center', alignItems: 'center', width: '100%' },
    
    // CUSTOM LOTTIE LEGEND STYLES
    lottieLegendContainer: { width: '100%', paddingHorizontal: 20, marginTop: 10 },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 10,
        borderRadius: 20,
    },
    colorIndicator: { width: 4, height: 25, borderRadius: 2, marginRight: 10 },
    legendLottie: { width: 35, height: 35, marginRight: 10 },
    legendText: { fontSize: 14, fontWeight: '700' },
    percentageText: { fontSize: 16, fontWeight: '900' }
});

export default Insights;