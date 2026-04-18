import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, TouchableOpacity } from 'react-native';
import { styles } from '../Explore.style';
import { CATEGORY_GROUPS } from '../utils/Explore.utils';

export const CategoryGroupList = ({ onSelectGroup, colors }) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryGroupScroll}>
        {CATEGORY_GROUPS.map((group) => (
            <TouchableOpacity
                key={group.id}
                onPress={() => onSelectGroup(group)}
                style={[
                    styles.categoryGroupPill,
                    { backgroundColor: colors.glass, borderColor: colors.glassBorder }
                ]}
            >
                <Ionicons name={group.icon} size={18} color={group.color} />
                <Text style={[styles.categoryGroupLabel, { color: colors.textMain }]}>
                    {group.name}
                </Text>
            </TouchableOpacity>
        ))}
    </ScrollView>
);