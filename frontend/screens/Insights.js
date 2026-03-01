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
import { ContributionGraph, LineChart } from 'react-native-chart-kit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

import GlassCard from '../components/GlassCard';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const Insights = () => {
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useTheme();
    const { list } = useSelector((state) => state.echoes);
    const [timeframe, setTimeframe] = useState('Month');

    // 1. Define Mood Weights
    const moodWeights = {
        'Energetic': 10,
        'Happy': 8,
        'Calm': 6,
        'Sad': 3,
        'Angry': 2,
    };

    // 2. Controller Logic: Line Chart
    const chartData = useMemo(() => {
        if (!list || list.length === 0) {
            return {
                labels: ["No Data"],
                datasets: [{ data: [0] }]
            };
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
            datasets: [
                {
                    data: dataPoints,
                    color: (opacity = 1) => isDark ? `rgba(130, 177, 255, ${opacity})` : `rgba(48, 79, 254, ${opacity})`,
                    strokeWidth: 4
                }
            ],
            legend: ["Mood Intensity"]
        };
    }, [list, timeframe, isDark]);

    // --- NEW: Controller Logic for Activity Map ---
    const heatmapData = useMemo(() => {
        if (!list || list.length === 0) return [];

        // Reduce list to a map of { "YYYY-MM-DD": count }
        const dateMap = list.reduce((acc, echo) => {
            const date = new Date(echo.createdAt).toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});

        // Convert map to array format required by ContributionGraph
        return Object.keys(dateMap).map(date => ({
            date: date,
            count: dateMap[date]
        }));
    }, [list]);

    // 3. Stats Calculation
    const stats = useMemo(() => {
        if (!list.length) return { total: 0, topEmotion: 'N/A' };

        const now = new Date();
        const filtered = list.filter(item => {
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
            : 'None';

        return { total: filtered.length, topEmotion };
    }, [list, timeframe]);

    const chartConfig = {
        backgroundGradientFromOpacity: 0,
        backgroundGradientToOpacity: 0,
        color: (opacity = 1) => isDark ? `rgba(129, 212, 250, ${opacity})` : `rgba(1, 87, 155, ${opacity})`,
        labelColor: (opacity = 1) => isDark ? `rgba(255, 255, 255, ${opacity * 0.7})` : `rgba(0, 0, 0, ${opacity * 0.6})`,
        strokeWidth: 3,
        decimalPlaces: 0,
        propsForDots: {
            r: "5",
            strokeWidth: "2",
            stroke: isDark ? "#82B1FF" : "#304FFE"
        }
    };

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
                <View style={[styles.pickerContainer, { backgroundColor: colors.glass }]}>
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

                {/* Mood Flow Chart */}
                <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Mood Flow</Text>
                <GlassCard style={styles.chartWrapper}>
                    {list.length > 0 ? (
                        <LineChart
                            data={chartData}
                            width={width - 20}
                            height={220}
                            chartConfig={chartConfig}
                            bezier
                            style={styles.chartStyle}
                            withInnerLines={false}
                            withOuterLines={false}
                            yAxisInterval={1}
                            fromZero={true}
                        />
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="pulse" size={40} color={colors.textSecondary} />
                            <Text style={{ color: colors.textSecondary, marginTop: 10 }}>Anchor an Echo to see your flow</Text>
                        </View>
                    )}
                </GlassCard>

                <View style={styles.grid}>
                    <GlassCard style={styles.miniCard}>
                        <Ionicons name="analytics" size={24} color={isDark ? "#82B1FF" : "#304FFE"} />
                        <Text style={[styles.miniValue, { color: colors.textMain }]}>{stats.total}</Text>
                        <Text style={[styles.miniLabel, { color: colors.textSecondary }]}>Echoes</Text>
                    </GlassCard>
                    <GlassCard style={styles.miniCard}>
                        <Ionicons name="heart" size={24} color="#F44336" />
                        <Text style={[styles.miniValue, { color: colors.textMain }]}>{stats.topEmotion}</Text>
                        <Text style={[styles.miniLabel, { color: colors.textSecondary }]}>Dominant</Text>
                    </GlassCard>
                </View>

                {/* Activity Map (GitHub Style Heatmap) */}
                <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Activity Map</Text>
                <GlassCard style={[styles.chartWrapper, { paddingHorizontal: 0 }]}>
                    {list.length > 0 ? (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ paddingHorizontal: 20 }}
                        >
                            <ContributionGraph
                                values={heatmapData}
                                endDate={new Date()}
                                numDays={105}
                                // Increase width to (numDays / 7 * (squareSize + gutter)) 
                                // to ensure it doesn't look "squashed"
                                width={(105 / 7) * 22}
                                height={200}
                                chartConfig={chartConfig}
                                tooltipDataAttrs={(value) => ({
                                    'data-tip': value.count ? `${value.count} echoes` : 'No echoes'
                                })}
                                gutterSize={2}
                                squareSize={18}
                            />
                        </ScrollView>
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="calendar-outline" size={40} color={colors.textSecondary} />
                            <Text style={{ color: colors.textSecondary, marginTop: 10 }}>
                                No activity recorded yet
                            </Text>
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
    headerSubtitle: { fontSize: 16, opacity: 0.7 },
    pickerContainer: { flexDirection: 'row', padding: 5, borderRadius: 15, marginBottom: 25 },
    pickerItem: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
    pickerText: { fontWeight: '700', fontSize: 14 },
    sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 15, marginTop: 10 },
    chartWrapper: { borderRadius: 20, paddingVertical: 15, alignItems: 'center', overflow: 'hidden', marginBottom: 20 },
    chartStyle: { borderRadius: 20, paddingRight: 40, marginTop: 10 },
    grid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    miniCard: { width: (width - 60) / 2, padding: 20, alignItems: 'center' },
    miniValue: { fontSize: 18, fontWeight: '900', marginTop: 8 },
    miniLabel: { fontSize: 12, fontWeight: '600', opacity: 0.5 },
    emptyContainer: { height: 180, justifyContent: 'center', alignItems: 'center' }
});

export default Insights;