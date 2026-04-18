import { Ionicons } from '@expo/vector-icons';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import { styles } from '../Explore.style';
import { RADIUS_OPTIONS } from '../utils/Explore.utils';

export const RadiusSelector = ({ visible, onClose, currentRadius, onSelectRadius, colors }) => {
    return (
        <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
            <TouchableOpacity style={styles.radiusModalOverlay} activeOpacity={1} onPress={onClose}>
                <View style={[styles.radiusModalContent, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
                    <View style={styles.radiusModalHeader}>
                        <Text style={[styles.radiusModalTitle, { color: colors.textMain }]}>Search Radius</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={colors.textMain} />
                        </TouchableOpacity>
                    </View>
                    {RADIUS_OPTIONS.map((option) => (
                        <TouchableOpacity
                            key={option.id}
                            style={[
                                styles.radiusOption,
                                currentRadius === option.meters && { backgroundColor: colors.primary + '20' }
                            ]}
                            onPress={() => {
                                onSelectRadius(option.meters);
                                onClose();
                            }}
                        >
                            <View style={styles.radiusOptionLeft}>
                                <Ionicons 
                                    name={currentRadius === option.meters ? "radio-button-on" : "radio-button-off"} 
                                    size={20} 
                                    color={colors.primary} 
                                />
                                <Text style={[styles.radiusOptionLabel, { color: colors.textMain }]}>{option.name}</Text>
                            </View>
                            <Text style={[styles.radiusOptionValue, { color: colors.primary }]}>{option.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </TouchableOpacity>
        </Modal>
    );
};