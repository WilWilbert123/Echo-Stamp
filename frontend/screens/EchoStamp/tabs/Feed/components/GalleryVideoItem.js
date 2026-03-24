import { useVideoPlayer, VideoView } from 'expo-video';
import { useEffect } from 'react';
import { styles } from '../feed.styles';

const GalleryVideoItem = ({ uri, isVisible }) => {
    const player = useVideoPlayer(uri, (player) => {
        player.loop = true;
        if (isVisible) player.play();
    });

    useEffect(() => {
        if (isVisible) player.play();
        else player.pause();
    }, [isVisible, player]);

    return (
        <VideoView
            style={styles.fullImg}
            player={player}
            nativeControls
            contentFit="contain"
        />
    );
};

export default GalleryVideoItem;