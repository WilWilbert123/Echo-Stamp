import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const RecentSaveCard = ({ item, styles, colors, onNavigate, onDelete }) => (
    <View style={styles.swipeContainer}>
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={width - 40}
            bounces
            decelerationRate="fast"
            contentContainerStyle={{ width: (width - 40) + 80 }}
        >
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => onNavigate(item)}
                style={styles.recentCard}
            >
                <Image source={{ uri: item.image }} style={styles.recentImg} />
                <View style={styles.recentInfo}>
                    <Text style={styles.recentTitle} numberOfLines={1}>{item.name || item.title}</Text>
                    <Text style={styles.recentDate} numberOfLines={1}>
                        {item.address || item.location || 'No address available'}
                    </Text>
                </View>
                <Ionicons name="chevron-back" size={16} color={colors.textSecondary} style={{ opacity: 0.3 }} />
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => onDelete(item.id)}
                style={styles.deleteBtn}
            >
                <Ionicons name="trash-outline" size={24} color="white" />
            </TouchableOpacity>
        </ScrollView>
    </View>
);

export default React.memo(RecentSaveCard);