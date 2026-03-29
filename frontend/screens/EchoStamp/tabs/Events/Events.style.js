import { Dimensions, StyleSheet } from 'react-native';

const { height } = Dimensions.get('window');

export const getStyles = (colors, isDark) => StyleSheet.create({
  scrollContent: { padding: 20, paddingBottom: 120 },
  
  // Spotlight Header
  spotlightCard: { padding: 25, borderRadius: 30, flexDirection: 'row', alignItems: 'center', marginBottom: 25, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, backgroundColor: colors.primary },
  spotlightTextContent: { flex: 1 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start', marginBottom: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4ADE80', marginRight: 6 },
  liveText: { color: '#FFF', fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
  spotlightTitle: { fontSize: 26, fontWeight: '900', color: '#FFF' },
  
  // Event Cards
  eventCard: { borderRadius: 24, borderWidth: 1, marginBottom: 20, overflow: 'hidden', backgroundColor: colors.glass, borderColor: colors.glassBorder },
  eventImage: { width: '100%', height: 200 },
  eventDetails: { padding: 18 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  categoryBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: colors.primary + '20' },
  categoryText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', color: colors.primary },
  eventTitle: { fontSize: 20, fontWeight: '800', marginBottom: 6, color: colors.textMain },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  
  // Attendee List
  attendeeDropdown: { backgroundColor: 'rgba(0,0,0,0.03)', padding: 10, borderRadius: 12, marginVertical: 10 },
  attendeeName: { fontSize: 13, color: colors.textSecondary, marginBottom: 4 },
  
  // Card Buttons
  cardActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: colors.glassBorder },
  miniActionBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 10, backgroundColor: colors.primary + '15' },
  miniActionText: { fontWeight: 'bold', fontSize: 14 },
  
  // Footer / Create Action
  createCard: { padding: 20, borderRadius: 24, borderWidth: 2, alignItems: 'center', flexDirection: 'row', gap: 15, marginTop: 10, borderColor: colors.primary, borderStyle: 'dashed' },
  createText: { fontWeight: '800', fontSize: 17, color: colors.textMain },
  
  // Modal Styles
  modalOverlay: { flex: 1, justifyContent: 'center', paddingTop: 150, backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.4)' },
  modalBox: { borderTopLeftRadius: 35, borderTopRightRadius: 35, height: height * 0.85, width: '100%', paddingHorizontal: 20, elevation: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.3, shadowRadius: 15, backgroundColor: isDark ? colors.background[0] : '#FFF' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 15 },
  modalHandle: { width: 45, height: 5, borderRadius: 10, alignSelf: 'center', marginTop: 10, backgroundColor: colors.glassBorder },
  modalTitle: { fontSize: 22, fontWeight: '900', color: colors.textMain },
  inputLabel: { fontSize: 14, fontWeight: '700', marginBottom: 8, marginTop: 15, opacity: 0.8, color: colors.textMain },
  input: { width: '100%', padding: 16, borderRadius: 16, borderWidth: 1, fontSize: 16, color: colors.textMain, borderColor: colors.glassBorder, backgroundColor: colors.glass },
  searchContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 16, paddingHorizontal: 12, borderColor: colors.glassBorder, backgroundColor: colors.glass },
  searchInput: { flex: 1, paddingVertical: 14, fontSize: 15, color: colors.textMain },
  searchIconBtn: { padding: 8 },
  miniMapWrapper: { width: '100%', height: 200, borderRadius: 24, overflow: 'hidden', marginTop: 15, borderWidth: 1, borderColor: colors.glassBorder },
  miniMap: { width: '100%', height: '100%' },
  previewContainer: { marginTop: 20, borderRadius: 20, overflow: 'hidden', height: 150 },
  resultImage: { width: '100%', height: '100%' },
  resultOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 15, backgroundColor: 'rgba(0,0,0,0.6)' },
  resultName: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  resultSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  modalActions: { paddingVertical: 20, paddingBottom: 40, borderTopWidth: 1, borderTopColor: colors.glassBorder },
  actionBtn: { paddingVertical: 18, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  actionBtnText: { color: '#FFF', fontWeight: '900', fontSize: 18 }
});