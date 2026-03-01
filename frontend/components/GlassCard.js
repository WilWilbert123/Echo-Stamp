// frontend/components/GlassCard.js
import React from 'react';
import { StyleSheet, View } from 'react-native';

const GlassCard = ({ children, style }) => {
  return (
    // Ensure this is a standard View without 'pointerEvents="none"'
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0)',
    borderRadius: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    // Avoid using 'position: absolute' here unless necessary
  },
});

export default GlassCard;