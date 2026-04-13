import { VideoPlayerWithThumbnail } from '../../../../../utils/videoThumbnail';
import { styles } from '../feed.styles';

const GalleryVideoItem = ({ uri, isVisible }) => {
    return (
        <VideoPlayerWithThumbnail
            uri={uri}
            style={styles.fullImg}
            nativeControls={true}
            contentFit="contain"
            isVisible={isVisible}
            autoPlay={isVisible}
        />
    );
};

export default GalleryVideoItem;