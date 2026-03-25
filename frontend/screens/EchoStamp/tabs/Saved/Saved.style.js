import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');

export const getStyles = (colors, isDark) => StyleSheet.create({
    container: { flex: 1 },
    loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 120, paddingTop: 10 },
    statsBar: { flexDirection: 'row', padding: 20, borderRadius: 25, borderWidth: 1, alignItems: 'center', marginBottom: 25, backgroundColor: colors.glass, borderColor: colors.glassBorder },
    statItem: { flex: 1, alignItems: 'center' },
    statNum: { fontSize: 20, fontWeight: '900', color: colors.textMain },
    statLabel: { fontSize: 12, fontWeight: '600', marginTop: 2, color: colors.textSecondary },
    divider: { width: 1, height: 30, marginHorizontal: 10, backgroundColor: colors.glassBorder },
    sectionTitle: { fontSize: 20, fontWeight: '900', letterSpacing: -0.5, color: colors.textMain },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    folderCard: { width: (width - 55) / 2, padding: 20, borderRadius: 30, borderWidth: 1, marginBottom: 15, backgroundColor: colors.glass, borderColor: colors.glassBorder },
    iconBox: { width: 45, height: 45, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    folderTitle: { fontWeight: '800', fontSize: 15, color: colors.textMain },
    folderCount: { fontSize: 12, fontWeight: '600', marginTop: 4, color: colors.textSecondary },
    swipeContainer: { marginBottom: 12, overflow: 'hidden', borderRadius: 22 },
    recentCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 22, borderWidth: 1, width: width - 40, backgroundColor: colors.glass, borderColor: colors.glassBorder },
    deleteBtn: { width: 80, justifyContent: 'center', alignItems: 'center', borderRadius: 22, marginLeft: 10, backgroundColor: '#EF4444' },
    recentImg: { width: 55, height: 55, borderRadius: 15 },
    recentInfo: { flex: 1, marginLeft: 15 },
    recentTitle: { fontWeight: '700', fontSize: 15, color: colors.textMain },
    recentDate: { fontSize: 12, marginTop: 2, color: colors.textSecondary },
    emptyState: { alignItems: 'center', marginTop: 40, opacity: 0.5 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: width * 0.8, padding: 25, borderRadius: 35, alignItems: 'center', backgroundColor: isDark ? '#1E293B' : '#FFF' },
    modalIconBox: { width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', marginBottom: 20, backgroundColor: colors.primary + '20' },
    modalTitle: { fontSize: 22, fontWeight: '900', marginBottom: 10, textAlign: 'center', color: colors.textMain },
    modalSub: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 25, opacity: 0.7, color: colors.textSecondary },
    closeBtn: { width: '100%', paddingVertical: 16, borderRadius: 20, alignItems: 'center', backgroundColor: colors.primary },
    closeBtnText: { fontWeight: '900', fontSize: 16, color: '#FFF' }
});