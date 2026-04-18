import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../Explore.style';
import { QUICK_ACCESS_CATEGORIES } from '../utils/Explore.utils';

export const QuickAccess = ({ onSelectCategory, colors, selectedCategory }) => (
    <View style={styles.quickAccessContainer}>
        <Text style={[styles.quickAccessTitle, { color: colors.textSecondary }]}>Quick Access</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickAccessScroll}>
            {QUICK_ACCESS_CATEGORIES.map((cat) => (
                <TouchableOpacity
                    key={cat.id}
                    onPress={() => onSelectCategory(cat)}
                    style={[
                        styles.quickAccessItem,
                        {
                            backgroundColor: selectedCategory?.id === cat.id ? cat.color : colors.glass,
                            borderColor: selectedCategory?.id === cat.id ? cat.color : colors.glassBorder
                        }
                    ]}
                >
                    <Ionicons
                        name={cat.icon}
                        size={20}
                        color={selectedCategory?.id === cat.id ? 'white' : cat.color}
                    />
                    <Text style={[
                        styles.quickAccessLabel,
                        { color: selectedCategory?.id === cat.id ? 'white' : colors.textMain }
                    ]}>
                        {cat.name}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    </View>
);