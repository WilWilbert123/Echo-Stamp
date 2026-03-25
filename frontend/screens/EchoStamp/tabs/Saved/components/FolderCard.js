import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

const FolderCard = ({ item, styles }) => (
    <TouchableOpacity style={styles.folderCard}>
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <View style={[styles.iconBox, { backgroundColor: `${item.color}20` }]}>
                <Ionicons name={item.icon} size={24} color={item.color} />
            </View>
            <Text style={styles.folderTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.folderCount}>{item.count} items</Text>
        </View>
    </TouchableOpacity>
);

export default React.memo(FolderCard);