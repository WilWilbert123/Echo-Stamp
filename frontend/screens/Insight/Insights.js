import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Dimensions,
    Platform,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { ContributionGraph, LineChart, PieChart, ProgressChart } from 'react-native-chart-kit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

// --- Redux Imports ---
import { getJournalsAsync } from '../../redux/journalSlice';
 
import { getEchoesAsync } from '../../redux/echoSlice';

import { EMOTION_ASSETS, EMOTION_CONFIG } from '../../constants/assets';
import { useTheme } from '../../context/ThemeContext';

const { width, height } = Dimensions.get('window');

const Insights = () => {
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useTheme();
    const dispatch = useDispatch();

    // --- Selectors ---
 
    const { user } = useSelector((state) => state.auth || {});
    const { list: echoesList = [] } = useSelector((state) => state.echoes || {});
    const { list: journalList = [] } = useSelector((state) => state.journals || {});

    const [timeframe, setTimeframe] = useState('Month');
    const [refreshing, setRefreshing] = useState(false);
    const [chartKey, setChartKey] = useState(0);

    // --- Modernized Refresh Logic ---
    const onRefresh = useCallback(async () => {
        if (!user?._id) return;
        
        setRefreshing(true);
        try {
            // Fetch both Journals and Echoes in parallel
            await Promise.all([
                dispatch(getJournalsAsync(user._id)).unwrap(),
                // Adjust parameters based on your echoSlice requirements
                dispatch(getEchoesAsync({ userId: user._id })).unwrap()
            ]);
            
            // Force charts to re-animate after data sync
            setChartKey(prev => prev + 1);
        } catch (error) {
            console.error("Data Sync Error:", error);
        } finally {
            setRefreshing(false);
        }
    }, [user?._id, dispatch]);

    useEffect(() => {
        setChartKey(prev => prev + 1);
    }, [timeframe, journalList, echoesList]);

    const moodColors = {
        Burnout: '#FF4B2B', Calm: '#4FC3F7', Fire: '#FF8C00', Play: '#FF5722',
        Loved: '#E91E63', Sad: '#546E7A', Sick: '#9E9E9E', Walk: '#4CAF50',
        ChillBeach: '#00BCD4', NoEnergy: '#78909C', Jogging: '#8BC34A',
        Ok: '#CDDC39', Rides: '#673AB7', Haha: '#FFEB3B', What: '#FF9800',
        Blee: '#F06292', Beach: '#03A9F4'
    };

    const moodWeights = { 
        'Play': 10, 'Fire': 9, 'Loved': 8, 'Walk': 7, 'Calm': 6, 
        'Ok': 5, 'Burnout': 3, 'Sad': 2, 'Sick': 1 
    };

    const parseDate = (dateData) => {
        if (!dateData) return null;
        const dateValue = dateData.$date ? dateData.$date : dateData;
        const parsed = new Date(dateValue);
        return isNaN(parsed.getTime()) ? null : parsed;
    };

    const getEmotionDetails = (val) => {
        const config = EMOTION_CONFIG.find(e => e.value === val) || EMOTION_CONFIG[1];
        return {
            ...config,
            animation: EMOTION_ASSETS[config.assetKey],
            color: moodColors[config.assetKey] || colors.primary
        };
    };

    const journalActivityData = useMemo(() => {
        const dateMap = {};
        journalList.forEach(entry => {
            const rawDate = entry?.createdAt || entry?.dataCreated;
            if (rawDate) {
                const date = parseDate(rawDate);
                if (!date) return;
                const dateStr = date.toISOString().split('T')[0];
                dateMap[dateStr] = (dateMap[dateStr] || 0) + 1;
            }
        });
        return Object.keys(dateMap).map(date => ({ date, count: dateMap[date] }));
    }, [journalList]);

    const isWithinTimeframe = (dateInput) => {
        const itemDate = parseDate(dateInput);
        if (!itemDate) return false;
        const now = new Date();
        if (timeframe === 'Day') return itemDate.toDateString() === now.toDateString();
        if (timeframe === 'Month') return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
        if (timeframe === 'Year') return itemDate.getFullYear() === now.getFullYear();
        return true;
    };

    const filteredEchoes = useMemo(() => {
        const data = Array.isArray(echoesList) ? echoesList : [];
        return data
            .filter(item => (item?.createdAt || item?.dataCreated) && isWithinTimeframe(item.createdAt || item.dataCreated))
            .sort((a, b) => parseDate(a.createdAt || a.dataCreated) - parseDate(b.createdAt || b.dataCreated));
    }, [echoesList, timeframe]);

    const stats = useMemo(() => {
        if (!filteredEchoes.length) return { total: 0, topEmotion: 'Calm', stability: 0.5 };
        const emotionCounts = filteredEchoes.reduce((acc, item) => {
            const emo = item.emotion || 'Calm';
            acc[emo] = (acc[emo] || 0) + 1;
            return acc;
        }, {});
        const topEmotion = Object.keys(emotionCounts).reduce((a, b) => emotionCounts[a] > emotionCounts[b] ? a : b);
        const weights = filteredEchoes.map(e => moodWeights[e.emotion] || 5);
        let stability = 0.5;
        if (weights.length > 1) {
            const mean = weights.reduce((a, b) => a + b, 0) / weights.length;
            const variance = weights.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / weights.length;
            stability = Math.max(0.1, Math.min(1, 1 - (variance / 25)));
        }
        return { total: filteredEchoes.length, topEmotion, stability };
    }, [filteredEchoes]);

    const moodFlowData = useMemo(() => {
        if (filteredEchoes.length === 0) return null;
        const displayData = filteredEchoes.slice(-7);
        return {
            labels: displayData.map(e => {
                const d = parseDate(e.createdAt || e.dataCreated);
                return timeframe === 'Day' 
                    ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                    : `${d.getMonth() + 1}/${d.getDate()}`;
            }),
            datasets: [{ data: displayData.map(e => moodWeights[e.emotion] || 5), strokeWidth: 4 }]
        };
    }, [filteredEchoes, timeframe]);

    const pieData = useMemo(() => {
        if (filteredEchoes.length === 0) return [];
        const counts = filteredEchoes.reduce((acc, echo) => {
            const emo = echo.emotion || 'Calm';
            acc[emo] = (acc[emo] || 0) + 1;
            return acc;
        }, {});
        return Object.keys(counts).map(key => ({
            name: key,
            population: counts[key],
            color: getEmotionDetails(key).color,
            legendFontColor: 'transparent',
            legendFontSize: 0
        })).sort((a, b) => b.population - a.population);
    }, [filteredEchoes]);

    const chartConfig = {
        backgroundGradientFrom: colors.glass,
        backgroundGradientTo: colors.glass,
        backgroundGradientFromOpacity: 0,
        backgroundGradientToOpacity: 0,
        color: (opacity = 1) => isDark ? `rgba(129, 140, 248, ${opacity})` : `rgba(79, 70, 229, ${opacity})`,
        labelColor: (opacity = 1) => colors.textSecondary,
        strokeWidth: 3,
        decimalPlaces: 0,
        propsForDots: { r: "5", strokeWidth: "2", stroke: isDark ? colors.background[0] : '#FFF' },
    };

    const journalActivityConfig = {
        ...chartConfig,
        color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
    };

    const topEmotionDetails = getEmotionDetails(stats.topEmotion);

    const getGraphSettings = () => {
        const now = new Date();
        if (timeframe === 'Year') {
            return { endDate: new Date(now.getFullYear(), 11, 31), numDays: 365, width: 950 };
        }
        if (timeframe === 'Month') {
            return { endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0), numDays: 31, width: width - 40 };
        }
        return { endDate: now, numDays: 7, width: width - 40 };
    };

    const settings = getGraphSettings();

    return (
        <View style={[styles.container, { backgroundColor: colors.background[0] }]}>
            <StatusBar barStyle={colors.status} translucent backgroundColor="transparent" />
            <View style={styles.headerBackground}>
                <View style={[styles.blueWave, { backgroundColor: colors.primary, opacity: isDark ? 0.2 : 0.7 }]} />
                <View style={[styles.darkWave, { backgroundColor: isDark ? '#334155' : '#94A3B8', opacity: 0.3 }]} />
            </View>

            <ScrollView
                contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20, paddingBottom: 120 }]}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
            >
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: colors.textMain }]}>Insights</Text>
                    <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Your emotional resonance, visualized.</Text>
                </View>

                {/* Timeframe Picker */}
                <View style={[styles.pickerContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                    {['Day', 'Month', 'Year'].map((item) => (
                        <TouchableOpacity
                            key={item}
                            onPress={() => setTimeframe(item)}
                            style={[styles.pickerItem, timeframe === item && { backgroundColor: isDark ? colors.primary : '#FFF' }]}
                        >
                            <Text style={[styles.pickerText, { color: timeframe === item ? (isDark ? '#FFF' : colors.primary) : colors.textSecondary }]}>{item}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Mini Stats Grid */}
                <View style={styles.grid}>
                    <View style={[styles.miniCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                        <View style={[styles.iconCircle, { backgroundColor: colors.primary + '20' }]}>
                            <Ionicons name="stats-chart" size={20} color={colors.primary} />
                        </View>
                        <Text style={[styles.miniValue, { color: colors.textMain }]}>{stats.total}</Text>
                        <Text style={[styles.miniLabel, { color: colors.textSecondary }]}>Total Echoes</Text>
                    </View>
                    <View style={[styles.miniCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                        <LottieView source={topEmotionDetails.animation} autoPlay loop style={{ width: 45, height: 45 }} />
                        <Text style={[styles.miniValue, { color: colors.textMain, marginTop: 4 }]} numberOfLines={1}>{topEmotionDetails.label}</Text>
                        <Text style={[styles.miniLabel, { color: colors.textSecondary }]}>Dominant</Text>
                    </View>
                </View>

                {/* Journal Contributions Graph */}
                <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Journal Contributions</Text>
                <View style={[styles.chartCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder, paddingLeft: 0, paddingRight: 0 }]}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
                        <ContributionGraph 
                            key={`contribution-${chartKey}`}
                            values={journalActivityData} 
                            endDate={settings.endDate} 
                            numDays={settings.numDays} 
                            width={settings.width} 
                            height={220} 
                            chartConfig={journalActivityConfig} 
                            gutterSize={2}
                            squareSize={18}
                        />
                    </ScrollView>
                </View>

                {/* Mood Flow Line Chart */}
                <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Mood Flow</Text>
                <View style={[styles.chartCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                    {moodFlowData ? (
                        <LineChart key={`line-${chartKey}`} data={moodFlowData} width={width - 40} height={200} chartConfig={chartConfig} bezier withInnerLines={false} withOuterLines={false} style={styles.chartStyle} />
                    ) : (
                        <View style={styles.emptyContainer}><Text style={{ color: colors.textSecondary }}>No data for this period</Text></View>
                    )}
                </View>

                {/* Emotional Profile (Pie Chart) */}
                <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Emotional Profile</Text>
                <View style={[styles.chartCard, { backgroundColor: colors.glass, borderColor: colors.glassBorder, paddingBottom: 0 }]}>
                    {pieData.length > 0 ? (
                        <View style={{ width: '100%', alignItems: 'center' }}>
                            <PieChart data={pieData} width={width} height={180} chartConfig={chartConfig} accessor={"population"} backgroundColor={"transparent"} paddingLeft={(width / 4).toString()} hasLegend={false} absolute />
                            <View style={styles.fixedLegendContainer}>
                                <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
                                    {pieData.map((item, index) => {
                                        const details = getEmotionDetails(item.name);
                                        return (
                                            <View key={index} style={[styles.legendItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }]}>
                                                <View style={[styles.colorIndicator, { backgroundColor: item.color }]} />
                                                <LottieView source={details.animation} autoPlay loop style={styles.legendLottie} />
                                                <View style={{ flex: 1 }}>
                                                    <Text style={[styles.legendText, { color: colors.textMain }]}>{details.label}</Text>
                                                    <Text style={{ color: colors.textSecondary, fontSize: 10 }}>{item.population} echoes</Text>
                                                </View>
                                                <Text style={[styles.percentageText, { color: colors.primary }]}>{Math.round((item.population / (stats.total || 1)) * 100)}%</Text>
                                            </View>
                                        );
                                    })}
                                </ScrollView>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.emptyContainer}><Text style={{ color: colors.textSecondary }}>No logs found</Text></View>
                    )}
                </View>

                {/* Emotional Resilience (Stability Chart) */}
                <Text style={[styles.sectionTitle, { color: colors.textMain }]}>Emotional Resilience</Text>
                <View style={[styles.chartCard, { flexDirection: 'row', backgroundColor: colors.glass, borderColor: colors.glassBorder, padding: 20 }]}>
                    <ProgressChart 
                        key={`resilience-${chartKey}`}
                        data={{ data: [stats.stability] }} 
                        width={width * 0.35} 
                        height={120} 
                        strokeWidth={12} 
                        radius={40} 
                        hideLegend={true} 
                        chartConfig={{ ...chartConfig, color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})` }} 
                    />
                    <View style={{ flex: 1, justifyContent: 'center', marginLeft: 15 }}>
                        <Text style={[styles.miniValue, { color: colors.textMain, fontSize: 28, marginTop: 0 }]}>{Math.round(stats.stability * 100)}%</Text>
                        <Text style={[styles.miniLabel, { color: colors.textSecondary }]}>Stability Score</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

// ... Styles remain the same ...
const styles = StyleSheet.create({
    container: { flex: 1 },
    headerBackground: { position: 'absolute', top: 0, width: '100%', height: height * 0.25 },
    blueWave: { position: 'absolute', top: -50, right: -50, width: width * 1.2, height: height * 0.2, borderBottomLeftRadius: 300, transform: [{ rotate: '-10deg' }] },
    darkWave: { position: 'absolute', top: -30, right: -80, width: width * 0.8, height: height * 0.18, borderBottomLeftRadius: 200, transform: [{ rotate: '-5deg' }] },
    scrollContent: { paddingHorizontal: 20 },
    header: { marginBottom: 25, marginTop: 10 },
    headerTitle: { fontSize: 38, fontWeight: '900', letterSpacing: -1.5 },
    headerSubtitle: { fontSize: 16, fontWeight: '500', opacity: 0.8 },
    pickerContainer: { flexDirection: 'row', padding: 5, borderRadius: 20, marginBottom: 25 },
    pickerItem: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 16 },
    pickerText: { fontWeight: '800', fontSize: 14 },
    sectionTitle: { fontSize: 20, fontWeight: '800', marginBottom: 16, marginTop: 12, letterSpacing: -0.5 },
    chartCard: {
        borderRadius: 32, paddingVertical: 20, alignItems: 'center', overflow: 'hidden', marginBottom: 20, borderWidth: 1.5,
        ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20 }, android: {} })
    },
    chartStyle: { borderRadius: 20, paddingRight: 40, marginTop: 10, marginLeft: -10 },
    grid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
    miniCard: { width: (width - 60) / 2, padding: 20, alignItems: 'center', borderRadius: 30, borderWidth: 1.5 },
    iconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    miniValue: { fontSize: 20, fontWeight: '900', marginTop: 12, letterSpacing: -0.5 },
    miniLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4, opacity: 0.7 },
    emptyContainer: { height: 180, justifyContent: 'center', alignItems: 'center', width: '100%' },
    fixedLegendContainer: { width: '100%', height: 220, paddingHorizontal: 15, marginTop: 5 },
    legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, padding: 12, borderRadius: 24 },
    colorIndicator: { width: 5, height: 30, borderRadius: 3, marginRight: 12 },
    legendLottie: { width: 38, height: 38, marginRight: 12 },
    legendText: { fontSize: 15, fontWeight: '800' },
    percentageText: { fontSize: 18, fontWeight: '900' }
});

export default Insights;