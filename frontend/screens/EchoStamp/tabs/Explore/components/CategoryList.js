import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, TouchableOpacity } from 'react-native';
import { styles } from '../Explore.style';
import { CATEGORIES } from '../utils/Explore.utils';

export const CategoryList = ({ selectedCategory, onSelect, userLocation, colors }) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
        {CATEGORIES.map((cat) => (
            <TouchableOpacity
                key={cat.id}
                onPress={() => userLocation && onSelect(userLocation.latitude, userLocation.longitude, cat)}
                style={[
                    styles.categoryPill,
                    {
                        backgroundColor: selectedCategory?.id === cat.id ? cat.color : colors.glass,
                        borderColor: selectedCategory?.id === cat.id ? cat.color : colors.glassBorder
                    }
                ]}
            >
                <Ionicons
                    name={cat.icon}
                    size={16}
                    color={selectedCategory?.id === cat.id ? 'white' : cat.color}
                />
                <Text style={[styles.categoryLabel, { color: selectedCategory?.id === cat.id ? 'white' : colors.textMain }]}>
                    {cat.name}
                </Text>
            </TouchableOpacity>
        ))}
    </ScrollView>
);