import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { ContributionGraph, LineChart, PieChart, ProgressChart } from 'react-native-chart-kit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

import GlassCard from '../components/GlassCard';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const Insights = () => {
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useTheme();
    
    // Core state for most charts
    const { list } = useSelector((state) => state.echoes);
    // Specifically for the Activity Map (Atlas/Journal)
    const { list: journalList } = useSelector((state) => state.journals);
    
    const [timeframe, setTimeframe] = useState('Month');

    // Mood Weights for Line Chart Logic
    const moodWeights = {
        'Excited': 10,
        'Happy': 8,
        'Loved': 8,
        'Grateful': 7,
        'Calm': 6,
        'Neutral': 5,
        'Tired': 4,
        'Sad': 3,
        'Angry': 2,
    };

    // Emotional Profile Palette
    const emotionPalette = {
        Happy: '#FFD700',
        Calm: '#4FC3F7',
        Proud: '#9C27B0',
        Sad: '#546E7A',
        Excited: '#FF5722',
        Loved: '#E91E63',
        Tired: '#3F51B5',
        Grateful: '#4CAF50',
        Neutral: '#9E9E9E',
    };

    const emojiMap = {
        'Happy': '😊', 'Calm': '🌊', 'Proud': '⭐', 'Sad': '☁️',
        'Excited': '✨', 'Loved': '❤️', 'Tired': '🔋', 'Grateful': '🙏', 'Neutral': '😐'
    };

    const chartConfig = {
        backgroundGradientFromOpacity: 0,
        backgroundGradientToOpacity: 0,
        color: (opacity = 1) => isDark ? `rgba(130, 177, 255, ${opacity})` : `rgba(48, 79, 254, ${opacity})`,
        labelColor: (opacity = 1) => colors.textSecondary,
        strokeWidth: 3,
        decimalPlaces: 0,
        propsForDots: {
            r: "5",
            strokeWidth: "2",
            stroke: colors.background[0]
        }
    };

    // Mood Flow Chart Logic (Keeping Echoes)
    const chartData = useMemo(() => {
        if (!list || list.length === 0) {
            return { labels: ["No Data"], datasets: [{ data: [0] }] };
        }
        const sortedList = [...list].sort((a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        const recentEchoes = sortedList.slice(-6);
        const labels = recentEchoes.map(echo => {
            const date = new Date(echo.createdAt);
            return timeframe === 'Day'
                ? date.getHours() + ":00"
                : (date.getMonth() + 1) + "/" + date.getDate();
        });
        const dataPoints = recentEchoes.map(echo => moodWeights[echo.emotion] || 5);
        return {
            labels,
            datasets: [{
                data: dataPoints,
                color: (opacity = 1) => isDark ? `rgba(130, 177, 255, ${opacity})` : `rgba(48, 79, 254, ${opacity})`,
                strokeWidth: 4
            }],
            legend: ["Mood Flow"]
        };
    }, [list, timeframe, isDark]);

    // --- ACTIVITY MAP LOGIC (NOW BASED ON JOURNAL/ATLAS) ---
    const heatmapData = useMemo(() => {
        if (!journalList || journalList.length === 0) return [];
        const dateMap = journalList.reduce((acc, entry) => {
            const date = new Date(entry.createdAt).toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});
        return Object.keys(dateMap).map(date => ({
            date: date,
            count: dateMap[date]
        }));
    }, [journalList]);

    // Pie Chart Data (Keeping Echoes)
    const pieData = useMemo(() => {
        if (!list || list.length === 0) return [];
        const counts = list.reduce((acc, echo) => {
            const emo = echo.emotion || 'Neutral';
            acc[emo] = (acc[emo] || 0) + 1;
            return acc;
        }, {});
        return Object.keys(counts).map(key => ({
            name: `${emojiMap[key] || ''} ${key}`,
            population: counts[key],
            color: emotionPalette[key] || '#9E9E9E',
            legendFontColor: colors.textMain,
            legendFontSize: 12
        })).sort((a, b) => b.population - a.population);
    }, [list, colors]);

    // Statistics Calculation (Keeping Echoes)
    const stats = useMemo(() => {
        if (!list.length) return { total: 0, topEmotion: 'N/A', stability: 0 };
        const now = new Date();
        const filtered = list.filter(item => {
            const itemDate = new Date(item.createdAt);
            if (timeframe === 'Day') return itemDate.toDateString() === now.toDateString();
            if (timeframe === 'Month') return itemDate.getMonth() === now.getMonth();
            return true;
        });
        const emotionCounts = filtered.reduce((acc, item) => {
            const emo = item.emotion || 'Neutral';
            acc[emo] = (acc[emo] || 0) + 1;
            return acc;
        }, {});
        const topEmotion = Object.keys(emotionCounts).length
            ? Object.keys(emotionCounts).reduce((a, b) => emotionCounts[a] > emotionCounts[b] ? a : b)
            : 'None';
        const weights = filtered.map(e => moodWeights[e.emotion] || 5);
        if (weights.length < 2) return { total: filtered.length, topEmotion, stability: 1 };
        const mean = weights.reduce((a, b) => a + b, 0) / weights.length;
        const variance = weights.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / weights.length;
        const stability = Math.max(0.1, Math.min(1, 1 - (variance / 20)));
        return { total: filtered.length, topEmotion, stability };
    }, [list, timeframe]);

    return (
        <LinearGradient colors={colors.background} style={styles.container}>
            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20, paddingBottom: 120 }]}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: colors.textMain }]}>Insights</Text>
                    <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Analyzing your emotional resonance.</Text>
                </View>

                {/* Segmented Picker */}
                <View style={[styles.pickerContainer, { backgroundColor: colors.glass, borderColor: colors.glassBorder, borderWidth: 1 }]}>
                    {['Day', 'Month', 'Year'].map((item) => (
                        <TouchableOpacity
                            key={item}
                            onPress={() => setTimeframe(item)}
                            style={[
                                styles.pickerItem,
                                timeframe === item && { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : '#fff' }
                            ]}
                        >
                            <Text style={[
                                styles.pickerText,
                                { color: timeframe === item ? colors.textMain : colors.textSecondary }
                            ]}>{item}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Grid Stats */}
                <View style={styles.grid}>
                    <GlassCard style={[styles.miniCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                        <Ionicons name="analytics" size={24} color={isDark ? "#82B1FF" : "#304FFE"} />
                        <Text style={[styles.miniValue, { color: colors.textMain }]}>{stats.total}</Text>
                        <Text style={[styles.miniLabel, { color: colors.textSecondary }]}>Total Echoes</Text>
                    </GlassCard>
                    <GlassCard style={[styles.miniCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                        <Ionicons name="heart" size={24} color="#F44336" />
                        <Text style={[styles.miniValue, { color: colors.textMain }]} numberOfLines={1}>{stats.topEmotion}</Text>
                        <Text style={[styles.miniLabel, { color: colors.textSecondary }]}>Dominant</Text>
                    </GlassCard>
                </View>

                {/* Mood Flow Chart */}
                <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Mood Flow</Text>
                <GlassCard style={[styles.chartWrapper, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                    {list.length > 0 ? (
                        <LineChart
                            data={chartData}
                            width={width - 40}
                            height={200}
                            chartConfig={chartConfig}
                            bezier
                            style={styles.chartStyle}
                            withInnerLines={false}
                            withOuterLines={false}
                            fromZero={true}
                        />
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="pulse" size={40} color={colors.textSecondary + '80'} />
                            <Text style={{ color: colors.textSecondary, marginTop: 10 }}>Anchor an Echo to see your flow</Text>
                        </View>
                    )}
                </GlassCard>

                {/* Activity Map (Updated to Journal List) */}
                <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Activity Map</Text>
                <GlassCard style={[styles.chartWrapper, { paddingHorizontal: 0, backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                    {journalList && journalList.length > 0 ? (
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
                            <Ionicons name="calendar-outline" size={40} color={colors.textSecondary + '80'} />
                            <Text style={{ color: colors.textSecondary, marginTop: 10 }}>No journal activity recorded yet</Text>
                        </View>
                    )}
                </GlassCard>

                {/* Emotional Profile */}
                <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Emotional Profile</Text>
                <GlassCard style={[styles.chartWrapper, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                    {list.length > 0 ? (
                        <PieChart
                            data={pieData}
                            width={width - 40}
                            height={200}
                            chartConfig={chartConfig}
                            accessor={"population"}
                            backgroundColor={"transparent"}
                            paddingLeft={"15"}
                            absolute
                        />
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="pie-chart-outline" size={40} color={colors.textSecondary + '80'} />
                            <Text style={{ color: colors.textSecondary, marginTop: 10 }}>Anchor more memories</Text>
                        </View>
                    )}
                </GlassCard>

                {/* Resilience Score */}
                <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Emotional Resilience</Text>
                <GlassCard
                    style={[
                        styles.chartWrapper,
                        list.length > 0 && { flexDirection: 'row', paddingHorizontal: 20 },  
                        { backgroundColor: colors.glass, borderColor: colors.glassBorder }
                    ]}
                >
                    {list.length > 0 ? (
                        <>
                            <ProgressChart
                                data={{ data: [stats.stability] }}
                                width={width * 0.4}
                                height={140}
                                strokeWidth={12}
                                radius={40}
                                chartConfig={{
                                    ...chartConfig,
                                    color: (opacity = 1) => isDark ? `rgba(165, 214, 167, ${opacity})` : `rgba(76, 175, 80, ${opacity})`,
                                }}
                                hideLegend={true}
                            />
                            <View style={{ flex: 1, justifyContent: 'center', marginLeft: 10 }}>
                                <Text style={[styles.miniValue, { color: colors.textMain, fontSize: 22 }]}>
                                    {Math.round(stats.stability * 100)}%
                                </Text>
                                <Text style={[styles.miniLabel, { color: colors.textSecondary, fontSize: 14 }]}>Stability Score</Text>
                                <Text style={{ color: colors.textSecondary, fontSize: 11, marginTop: 8, fontStyle: 'italic' }}>
                                    {stats.stability > 0.7 ? "Consistent resonance." : "High emotional range."}
                                </Text>
                            </View>
                        </>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="shield-checkmark-outline" size={40} color={colors.textSecondary + '80'} />
                            <Text style={{ color: colors.textSecondary, marginTop: 10 }}>Data needed for resilience</Text>
                        </View>
                    )}
                </GlassCard>
            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { paddingHorizontal: 20 },
    header: { marginBottom: 20 },
    headerTitle: { fontSize: 34, fontWeight: '900', letterSpacing: -1 },
    headerSubtitle: { fontSize: 16, opacity: 0.8 },
    pickerContainer: { flexDirection: 'row', padding: 5, borderRadius: 15, marginBottom: 25 },
    pickerItem: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
    pickerText: { fontWeight: '700', fontSize: 14 },
    sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 15, marginTop: 10 },
    chartWrapper: { borderRadius: 24, paddingVertical: 15, alignItems: 'center', overflow: 'hidden', marginBottom: 20, borderWidth: 1 },
    chartStyle: { borderRadius: 20, paddingRight: 40, marginTop: 10 },
    grid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    miniCard: { width: (width - 60) / 2, padding: 20, alignItems: 'center', borderRadius: 24, borderWidth: 1 },
    miniValue: { fontSize: 18, fontWeight: '900', marginTop: 8 },
    miniLabel: { fontSize: 12, fontWeight: '600', opacity: 0.6 },
    emptyContainer: { height: 180, justifyContent: 'center', alignItems: 'center',width: '100%', }
});

export default Insights;