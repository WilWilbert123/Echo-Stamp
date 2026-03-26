import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const ThemeModal = ({ visible, onClose }) => {
  const { colors, isDark, toggleTheme, setCustomColor } = useTheme();

  const colorPresets = [
    '#000000', '#FFFFFF', '#6366F1', '#4F46E5', 
    '#06B6D4', '#10B981', '#84CC16', '#FACC15', 
    '#F59E0B', '#F97316', '#EF4444', '#EC4899', 
    '#D946EF', '#8B5CF6', '#64748B', '#475569'
  ];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { 
          backgroundColor: isDark ? '#1E293B' : '#FFFFFF', 
          borderColor: colors.glassBorder 
        }]}>
          
          <Text style={[styles.title, { color: colors.textMain }]}>Appearance</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Choose your style</Text>

          {/* Mode Selection */}
          <View style={styles.modeRow}>
            <TouchableOpacity 
              style={[styles.modeBox, isDark && { borderColor: colors.primary, borderWidth: 2 }]} 
              onPress={() => toggleTheme('dark')}
            >
              <Ionicons name="moon" size={24} color={isDark ? colors.primary : colors.textSecondary} />
              <Text style={[styles.modeText, { color: colors.textMain }]}>Dark</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.modeBox, !isDark && { borderColor: colors.primary, borderWidth: 2 }]} 
              onPress={() => toggleTheme('light')}
            >
              <Ionicons name="sunny" size={24} color={!isDark ? colors.primary : colors.textSecondary} />
              <Text style={[styles.modeText, { color: colors.textMain }]}>Light</Text>
            </TouchableOpacity>
          </View>

          {/* Color Customization */}
          <Text style={[styles.subtitle, { color: colors.textSecondary, marginTop: 20 }]}>Theme Accent</Text>
          
          <View style={styles.colorRow}>
            {colorPresets.map((hex) => {
              const isSelected = colors.primary === hex;
              return (
                <TouchableOpacity
                  key={hex}
                  style={[
                    styles.colorCircle, 
                    { backgroundColor: hex },
                    hex === '#FFFFFF' && { borderWidth: 1, borderColor: '#CBD5E1' },
                    isSelected && { borderWidth: 3, borderColor: isDark ? '#FFF' : '#000' }
                  ]}
                  onPress={() => setCustomColor('primary', hex)}
                >
                  {isSelected && (
                    <Ionicons 
                      name="checkmark" 
                      size={16} 
                      color={hex === '#FFFFFF' ? '#000' : '#FFF'} 
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity 
            style={[styles.doneBtn, { backgroundColor: colors.primary }]} 
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={[styles.doneBtnText, { color: colors.primary === '#FFFFFF' ? '#000' : '#FFF' }]}>
              Done
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  container: { width: '90%', padding: 25, borderRadius: 30, borderWidth: 1 },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  subtitle: { fontSize: 14, textAlign: 'center', marginBottom: 15, opacity: 0.8 },
  modeRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  modeBox: { 
    flex: 1, 
    height: 70, 
    backgroundColor: 'rgba(150,150,150,0.1)', 
    borderRadius: 18, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modeText: { marginTop: 4, fontWeight: '600', fontSize: 12 },
  colorRow: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'center', 
    gap: 12, 
    marginTop: 10,
    paddingHorizontal: 5
  },
  colorCircle: { 
    width: 35, 
    height: 35, 
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  doneBtn: { marginTop: 25, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  doneBtnText: { fontWeight: 'bold', fontSize: 16 }
});

export default ThemeModal;