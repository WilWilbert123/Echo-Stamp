import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const GlassButton = ({ title, onPress, style, loading, textStyle, children, contentStyle }) => {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      activeOpacity={0.8} 
      disabled={loading}
      style={[styles.container, style]}
    >
      <View style={[styles.solidBackground, contentStyle]}>
        {loading ? (
          <ActivityIndicator color={textStyle?.color || '#01579B'} />
        ) : children ? (
          children
        ) : (
          <Text style={[styles.text, textStyle]}>{title}</Text>
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)', 
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