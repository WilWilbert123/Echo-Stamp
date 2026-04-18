import { Ionicons } from '@expo/vector-icons';
import { FlatList, Modal, Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../Explore.style';

export const CategoryModal = ({ visible, onClose, group, onSelectCategory, colors }) => {
    if (!group) return null;

    const renderCategory = ({ item }) => (
        <TouchableOpacity
            style={[styles.modalCategoryItem, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}
            onPress={() => {
                onSelectCategory(item);
                onClose();
            }}
        >
            <View style={[styles.modalCategoryIcon, { backgroundColor: item.color + '20' }]}>
                <Ionicons name={item.icon} size={24} color={item.color} />
            </View>
            <View style={styles.modalCategoryInfo}>
                <Text style={[styles.modalCategoryName, { color: colors.textMain }]}>{item.name}</Text>
                <Text style={[styles.modalCategoryRadius, { color: colors.textSecondary }]}>
                    {item.radius >= 1000 ? `${item.radius/1000}km` : `${item.radius}m`} radius
                </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
    );

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={styles.categoryModalOverlay}>
                <View style={[styles.categoryModalContent, { backgroundColor: colors.background[0] }]}>
                    <View style={styles.categoryModalHeader}>
                        <TouchableOpacity onPress={onClose} style={styles.categoryModalBack}>
                            <Ionicons name="arrow-back" size={24} color={colors.textMain} />
                        </TouchableOpacity>
                        <View style={[styles.categoryModalIcon, { backgroundColor: group.color + '20' }]}>
                            <Ionicons name={group.icon} size={28} color={group.color} />
                        </View>
                        <Text style={[styles.categoryModalTitle, { color: colors.textMain }]}>{group.name}</Text>
                        <Text style={[styles.categoryModalSubtitle, { color: colors.textSecondary }]}>
                            {group.categories.length} categories available
                        </Text>
                    </View>
                    
                    <FlatList
                        data={group.categories}
                        keyExtractor={(item) => item.id}
                        renderItem={renderCategory}
                        contentContainerStyle={styles.categoryModalList}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            </View>
        </Modal>
    );
};