import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

const { width, height } = Dimensions.get('window');

const BrandedHeader = ({ colors, isDark }) => {
    return (
        <View style={styles.headerBackground} pointerEvents="none">
            <View style={[styles.blueWave, { backgroundColor: colors.primary, opacity: isDark ? 0.3 : 0.8 }]} />
            <View style={[styles.darkWave, { backgroundColor: isDark ? '#1E293B' : '#637D8B' }]} />
        </View>
    );
};

const styles = StyleSheet.create({
    headerBackground: { 
        position: 'absolute', 
        top: 5, 
        left: 0,
        right: 0,
        width: width, 
        height: height * 0.25,
       
    },
    blueWave: { 
        position: 'absolute', 
        top: -50, 
        right: -50, 
        width: width * 1.2, 
        height: height * 0.2, 
        borderBottomLeftRadius: 300, 
        transform: [{ rotate: '-10deg' }] 
    },
    darkWave: { 
        position: 'absolute', 
        top: -30, 
        right: -80, 
        width: width * 0.8, 
        height: height * 0.18, 
        opacity: 0.6, 
        borderBottomLeftRadius: 200, 
        transform: [{ rotate: '-5deg' }] 
    },
});

export default BrandedHeader;