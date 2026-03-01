import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

const GlassButton = ({ title, onPress, style }) => {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      activeOpacity={0.8} 
      style={[styles.container, style]}
    >
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.4)', 'rgba(255, 255, 255, 0.1)']}
        style={styles.gradient}
      >
        {/* MAKE SURE THIS TEXT COMPONENT IS HERE */}
        <Text style={styles.text}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    marginVertical: 10,
    
  },
  gradient: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    alignItems: 'center',
    justifyContent: 'center', // Centers the text
  },
  text: {
    color: '#01579B',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center', // Added for safety
  },
});

export default GlassButton;