import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const GlassButton = ({ title, onPress, style, loading, textStyle, children, contentStyle }) => {
  const { colors, isDark } = useTheme();

  return (
    <TouchableOpacity 
      onPress={onPress} 
      activeOpacity={0.8} 
      disabled={loading}
      style={[
        styles.container, 
        { borderColor: isDark ? colors.glassBorder : 'rgba(0, 0, 0, 0.1)' },
        style
      ]}
    >
      <View style={[
        styles.solidBackground, 
        { backgroundColor: isDark ? 'rgba(255, 255, 255, 0)' : 'rgba(255, 255, 255, 0)' },
        contentStyle
      ]}>
        {loading ? (
          <ActivityIndicator color={textStyle?.color || colors.primary} />
        ) : children ? (
          children
        ) : (
          <Text style={[styles.text, { color: colors.primary }, textStyle]}>{title}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  solidBackground: {
    height: '100%',
    paddingHorizontal: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#01579B',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default GlassButton;