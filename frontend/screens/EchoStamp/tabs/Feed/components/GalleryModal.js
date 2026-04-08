import { Download, X } from 'lucide-react-native';
import { Dimensions, FlatList, Image, Modal, TouchableOpacity, View } from 'react-native';
import GalleryVideoItem from '../components/GalleryVideoItem';
import { styles } from '../feed.styles';
import { checkIsVideo, downloadMedia } from '../utils/feedUtils';

const { width } = Dimensions.get('window');

const GalleryModal = ({ visible, images, activeIndex, onClose, onScroll }) => (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
        <View style={styles.blackBg}>
            <TouchableOpacity style={styles.closeGallery} onPress={onClose}>
                <X color="white" size={28} />
            </TouchableOpacity>
            <TouchableOpacity 
                style={styles.downloadGallery} 
                onPress={() => downloadMedia(images[activeIndex])}
            >
                <Download color="white" size={28} />
            </TouchableOpacity>
            <FlatList
                data={images}
                horizontal
                pagingEnabled
                onScroll={(e) => onScroll(Math.round(e.nativeEvent.contentOffset.x / width))}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item, index }) => (
                    <View style={styles.gallerySlide}>
                        {checkIsVideo(item) ? (
                            <GalleryVideoItem uri={item} isVisible={visible && activeIndex === index} />
                        ) : (
                            <Image source={{ uri: item }} style={styles.fullImg} resizeMode="contain" />
                        )}
                    </View>
                )}
                showsHorizontalScrollIndicator={false}
            />
        </View>
    </Modal>
);

export default GalleryModal;