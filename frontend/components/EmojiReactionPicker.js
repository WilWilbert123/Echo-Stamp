import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const EMOJIS = [
    '👍', '❤️', '😂', '😮', '😢', '🙏', '🎉', '🔥', '👏', '😡'
];

const EmojiReactionPicker = ({ visible, onClose, onSelectEmoji, position }) => {
    const [selectedEmoji, setSelectedEmoji] = useState(null);

    const handleSelect = (emoji) => {
        setSelectedEmoji(emoji);
        setTimeout(() => {
            onSelectEmoji(emoji);
            setSelectedEmoji(null);
            onClose();
        }, 150);
    };

    if (!visible) return null;

    // Calculate position to ensure modal stays within screen bounds
    const calculatePosition = () => {
        const pickerWidth = 220;
        const pickerHeight = 80; // Approximate height of the picker
        
        let left = position.x - (pickerWidth / 2);
        let top = position.y - pickerHeight - 10;
        
        // Adjust horizontal position if out of bounds
        if (left < 10) {
            left = 10;
        } else if (left + pickerWidth > screenWidth - 10) {
            left = screenWidth - pickerWidth - 10;
        }
        
        // Adjust vertical position if out of bounds (show above or below touch)
        if (top < 50) {
            // Show below the touch point if above would be cut off
            top = position.y + 20;
        }
        
        return { left, top };
    };

    const { left, top } = calculatePosition();

    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <View
                    style={[
                        styles.pickerContainer,
                        {
                            position: 'absolute',
                            left: left,
                            top: top,
                        }
                    ]}
                >
                    <LinearGradient
                        colors={['#1e293b', '#0f172a']}
                        style={styles.gradientContainer}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.emojiGrid}>
                            {EMOJIS.map((emoji, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.emojiButton,
                                        selectedEmoji === emoji && styles.emojiButtonSelected
                                    ]}
                                    onPress={() => handleSelect(emoji)}
                                >
                                    <Text style={styles.emojiText}>{emoji}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View style={[styles.triangle, { 
                            alignSelf: 'center',
                            position: 'absolute',
                            bottom: -10,
                            left: position.x - left - 10,
                        }]} />
                    </LinearGradient>
                </View>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    pickerContainer: {
        zIndex: 1000,
    },
    gradientContainer: {
        borderRadius: 20,
        padding: 12,
        position: 'relative',
    },
    emojiGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        width: 220,
        gap: 8,
    },
    emojiButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    emojiButtonSelected: {
        backgroundColor: 'rgba(99, 102, 241, 0.3)',
        transform: [{ scale: 1.1 }],
    },
    emojiText: {
        fontSize: 28,
    },
    triangle: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 10,
        borderRightWidth: 10,
        borderTopWidth: 10,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: '#1e293b',
    },
});

export default EmojiReactionPicker;