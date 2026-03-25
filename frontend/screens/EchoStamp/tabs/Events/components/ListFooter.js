import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

const ListFooter = ({ styles, onOpen, colors }) => (
  <TouchableOpacity 
    onPress={() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onOpen();
    }}
    style={styles.createCard}
  >
    <Ionicons name="add-circle" size={32} color={colors.primary} />
    <View>
      <Text style={styles.createText}>Host a Meetup</Text>
      <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
        Pin a location and gather the squad
      </Text>
    </View>
  </TouchableOpacity>
);

export default React.memo(ListFooter);