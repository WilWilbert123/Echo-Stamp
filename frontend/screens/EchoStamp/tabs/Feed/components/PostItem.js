import { useNavigation } from '@react-navigation/native';
import { Eye, Heart, MapPin, MessageCircle, MoreHorizontal, Play, Share2 } from 'lucide-react-native';
import { memo } from 'react';
import { Image, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { toggleLikeAsync } from '../../../../../redux/journalSlice';
import { styles } from '../feed.styles';
import { checkIsVideo, getRelativeTime } from '../utils/feedUtils';

const PostItem = memo(({ item, colors, onOpenGallery, onOpenComments }) => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const currentUser = useSelector(state => state.auth.user);
    const isLiked = item.likes?.includes(currentUser?._id || currentUser?.id);
    
    const author = item.userId;
    const mediaCount = item.media?.length || 0;
    const isMainVid = checkIsVideo(item.media?.[0]);

    const handleShare = async () => {
        try {
            const shareMsg = `Check out this Echo: ${item.title}\n${item.description}\n\n${item.media?.[0] || ''}`;
            await Share.share({ message: shareMsg });
        } catch (error) { console.log(error); }
    };

    const handleViewEcho = () => {
        navigation.navigate('Atlas', {
            zoomTo: {
                latitude: item.location.lat,
                longitude: item.location.lng,
                journalId: item._id,
                title: item.title,
                address: item.location.address || "Pinned Location",
                image: item.media?.[0] || null,
                autoNavigate: true,
                autoStreetView: false
            }
        });
    };

    return (
        <View style={[styles.card, { backgroundColor: colors.glass, borderColor: colors.glassBorder }]}>
            <View style={styles.userInfo}>
                <View style={[styles.avatar, { backgroundColor: colors.primary + '30', borderWidth: 1, borderColor: colors.primary }]}>
                    {author?.profilePicture ? (
                        <Image source={{ uri: author.profilePicture }} style={styles.avatarImage} />
                    ) : (
                        <Text style={[styles.avatarLetter, { color: colors.primary }]}>
                            {author?.firstName ? author.firstName.charAt(0).toUpperCase() : 'U'}
                        </Text>
                    )}
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.userName, { color: colors.textMain }]}>
                        {author?.firstName ? `${author.firstName} ${author.lastName}` : (author?.username || 'Explorer')}
                    </Text>
                    <View style={styles.locationRow}>
                        <MapPin size={10} color={colors.primary} style={{ marginTop: 2 }} />
                        <Text style={[styles.timeText, { color: colors.textSecondary }]}>
                            {item.location?.address || 'Deep Wilderness'} • {getRelativeTime(item.createdAt)}
                        </Text>
                    </View>
                </View>
                <TouchableOpacity onPress={() => {}}>
                    <MoreHorizontal size={20} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>

            <TouchableOpacity activeOpacity={0.7} onPress={() => onOpenComments(item)} style={styles.contentArea}>
                <Text style={[styles.postTitle, { color: colors.textMain }]}>{item.title}</Text>
                <Text style={[styles.postContent, { color: colors.textSecondary }]} numberOfLines={3}>
                    {item.description}
                </Text>
            </TouchableOpacity>

            {mediaCount > 0 && (
                <TouchableOpacity activeOpacity={0.9} style={styles.imageGrid} onPress={() => onOpenGallery(item.media)}>
                    <View style={styles.gridImageMain}>
                        <Image source={{ uri: item.media[0] }} style={StyleSheet.absoluteFill} />
                        {isMainVid && (
                            <View style={styles.overlay}>
                                <Play size={32} color="white" fill="white" />
                            </View>
                        )}
                    </View>
                    {mediaCount > 1 && (
                        <View style={styles.sideImages}>
                            <Image source={{ uri: item.media[1] }} style={styles.sideImg} />
                            {mediaCount > 2 && (
                                <View style={styles.sideImgContainer}>
                                    <Image source={{ uri: item.media[2] }} style={styles.sideImg} />
                                    {mediaCount > 3 && (
                                        <View style={styles.overlay}>
                                            <Text style={styles.overlayText}>+{mediaCount - 2}</Text>
                                        </View>
                                    )}
                                </View>
                            )}
                        </View>
                    )}
                </TouchableOpacity>
            )}

            <View style={styles.interactionBar}>
                <View style={styles.stats}>
                    <TouchableOpacity style={styles.statItem} onPress={() => dispatch(toggleLikeAsync(item._id))}>
                        <Heart size={20} color={isLiked ? '#FF4B4B' : colors.textSecondary} fill={isLiked ? '#FF4B4B' : 'transparent'} />
                        <Text style={[styles.statText, { color: colors.textSecondary }]}>{item.likes?.length || 0}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.statItem} onPress={() => onOpenComments(item)}>
                        <MessageCircle size={20} color={colors.textSecondary} />
                        <Text style={[styles.statText, { color: colors.textSecondary }]}>{item.comments?.length || 0}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.statItem} onPress={handleShare}>
                        <Share2 size={18} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={[styles.reactBtn, { backgroundColor: colors.primary }]} onPress={handleViewEcho}>
                    <Eye size={14} color="#FFF" style={{ marginRight: 6 }} />
                    <Text style={styles.reactBtnText}>View Echo</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
});

export default PostItem;