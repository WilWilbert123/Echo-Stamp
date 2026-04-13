import { Ionicons } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { memo, useState } from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';

/**
 * VideoPlayerWithThumbnail: Displays a video with a play button overlay
 * Shows the first frame as thumbnail, with play button overlay
 */
export const VideoPlayerWithThumbnail = memo(({
  uri,
  style = {},
  nativeControls = true,
  contentFit = 'cover',
  onPlayStart = null,
  isVisible = true,
  autoPlay = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isLoading, setIsLoading] = useState(false);
  const playerRef = React.useRef(null);

  const player = useVideoPlayer(uri, (p) => {
    playerRef.current = p;
    p.loop = false;
  });

  // Auto-play when visible and autoPlay is true
  React.useEffect(() => {
    if (!playerRef.current) return;
    
    if (autoPlay && isVisible && !isPlaying) {
      setIsPlaying(true);
      playerRef.current.play();
    } else if (!isVisible && isPlaying && autoPlay) {
      setIsPlaying(false);
      playerRef.current.pause();
    }
  }, [autoPlay, isVisible]);

  // Play/pause based on isPlaying state
  React.useEffect(() => {
    if (!playerRef.current) return;
    
    if (isPlaying) {
      playerRef.current.play();
    } else {
      playerRef.current.pause();
    }
  }, [isPlaying]);

  const handlePlayPress = () => {
    setIsPlaying(true);
    setIsLoading(true);
    if (playerRef.current) {
      playerRef.current.play();
    }
    onPlayStart?.();
  };

  return (
    <View style={[{ position: 'relative', overflow: 'hidden', backgroundColor: '#1a1a1a' }, style]}>
      <VideoView
        style={style}
        player={player}
        nativeControls={nativeControls && isPlaying}
        contentFit={contentFit}
        onStatusUpdate={(status) => {
          // Only update loading state when actively playing
          if (isPlaying) {
            setIsLoading(status.isLoading);
          }
        }}
      />

      {/* Play Button Overlay - Shows when not playing */}
      {!isPlaying && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {isLoading ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : (
            <TouchableOpacity
              onPress={handlePlayPress}
              style={{
                width: 60,
                height: 60,
                borderRadius: 30,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons name="play" size={32} color="#000" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
});

/**
 * Compact video player for message/chat previews with smaller play button
 */
export const CompactVideoPlayer = ({
  uri,
  style = {},
  onDownload = null,
}) => {
  return (
    <VideoPlayerWithThumbnail
      uri={uri}
      style={style}
      nativeControls={true}
      contentFit="cover"
      autoPlay={false}
    />
  );
};
