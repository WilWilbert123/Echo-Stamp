import React from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useTheme } from '../../../../context/ThemeContext';
import FeatureModal from './components/FeatureModal';
import FolderCard from './components/FolderCard';
import RecentSaveCard from './components/RecentSaveCard';
import { useSaved } from './hooks/useSaved';
import { getStyles } from './Saved.style';

const Saved = () => {
    const { colors, isDark } = useTheme();
    const styles = getStyles(colors, isDark);
    const {
        collections, recentSaves, isLoading, isRefreshing, modalVisible,
        setModalVisible, activeFeature, loadSavedData, handleGoToAtlas, confirmDelete
    } = useSaved(colors);

    if (isLoading && recentSaves.length === 0) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.background[0] }}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => loadSavedData(true)} tintColor={colors.primary} />}
            >
                {/* Stats Bar Component logic could be extracted if needed */}
                <View style={styles.statsBar}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNum}>{recentSaves.length}</Text>
                        <Text style={styles.statLabel}>Saved Places</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statNum}>{collections.length}</Text>
                        <Text style={styles.statLabel}>Folders</Text>
                    </View>
                </View>

                <Text style={[styles.sectionTitle, { marginBottom: 15 }]}>Collections</Text>
                <View style={styles.grid}>
                    {collections.map(item => <FolderCard key={item.id} item={item} styles={styles} />)}
                </View>

                <Text style={[styles.sectionTitle, { marginTop: 10 }]}>Recently Bookmarked</Text>
                <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 15 }}>Swipe left on a card to delete</Text>

                {recentSaves.map(item => (
                    <RecentSaveCard key={item.id} item={item} styles={styles} colors={colors} onNavigate={handleGoToAtlas} onDelete={confirmDelete} />
                ))}
            </ScrollView>

            <FeatureModal visible={modalVisible} featureName={activeFeature} onClose={() => setModalVisible(false)} styles={styles} colors={colors} />
        </View>
    );
};

export default Saved;