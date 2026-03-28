 
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { useTheme } from '../../context/ThemeContext';

const VideoCallScreen = ({ route, navigation }) => {
    const { roomId, callType } = route.params || {};
    const { user: currentUser } = useSelector((state) => state.auth);
    const { colors } = useTheme();

   
    const appID = Number(process.env.EXPO_PUBLIC_ZEGO_APP_ID) || 0; 
    const appSign = process.env.EXPO_PUBLIC_ZEGO_APP_SIGN || ""; 

    if (!appID || !appSign || !roomId || !currentUser) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background[0] }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ color: colors.textMain, marginTop: 10 }}>Connecting to Echo-sphere...</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background[0] }]}>
            <ZegoUIKitPrebuiltCall
                appID={appID}
                appSign={appSign}
                userID={currentUser?.id || currentUser?._id || String(Date.now())} 
                userName={`${currentUser?.firstName || 'User'} ${currentUser?.lastName || ''}`}
                callID={roomId} 
                
                config={{
                    ...(callType === 'video' ? ONE_ON_ONE_VIDEO_CALL_CONFIG : ONE_ON_ONE_VOICE_CALL_CONFIG),
                    onHangUp: () => { navigation.goBack(); },
                }}
            />
        </View>
    );
};

export default VideoCallScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});