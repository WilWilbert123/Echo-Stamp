import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useSelector } from 'react-redux';
import ForgotPassword from "../screens/Auths/ForgotPassword";
import Login from "../screens/Auths/Login";
import OtpVerification from "../screens/Auths/OtpVerification";
import ResetPassword from "../screens/Auths/ResetPassword";
import Signup from "../screens/Auths/Signup";
import VideoCallScreen from "../screens/Chat/VideoCallScreen";
import CreateEcho from "../screens/Home/CreateEcho";
import Intro from "../screens/Intro";
import MainTabs from "../screens/MainTabs";
import About from "../screens/Profile/About";
import Help from "../screens/Profile/Help";
import PrivacySecurity from "../screens/Profile/PrivacySecurity";
import Terms from "../screens/Profile/Terms";

const Stack = createNativeStackNavigator();

const HomeStackNavigator = () => {
    const { isAuthenticated, loading } = useSelector((state) => state.auth);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
                <ActivityIndicator size="large" color="#fff" />
            </View>
        );
    }

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {isAuthenticated ? (
                < >
                    <Stack.Screen name="MainTabsRoot" component={MainTabs} />
                    <Stack.Screen name="Create" component={CreateEcho} options={{ animation: 'slide_from_bottom', presentation: 'modal' }} />
                    <Stack.Screen name="PrivacySecurity" component={PrivacySecurity} />

                    <Stack.Screen name="SecurityOtpVerify" component={OtpVerification} />
                    <Stack.Screen name="ResetPassword" component={ResetPassword} />
                    <Stack.Screen name="Help" component={Help} />
                    <Stack.Screen name="Terms" component={Terms} />
                    <Stack.Screen name="About" component={About} /> 
                    <Stack.Screen 
                        name="VideoCall" 
                        component={VideoCallScreen} 
                        options={{ gestureEnabled: false, headerShown: false }} 
                    />
                </ >
            ) : (
                < >
                    <Stack.Screen name="Intro" component={Intro} />
                    <Stack.Screen name="Login" component={Login} options={{ animationTypeForReplace: isAuthenticated ? 'pop' : 'push', }} />
                    <Stack.Screen name="Signup" component={Signup} />
                    <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
                    <Stack.Screen name="OtpVerification" component={OtpVerification} />
                    <Stack.Screen name="ResetPassword" component={ResetPassword} />
                </ >
            )}
        </Stack.Navigator>
    );
};

export default HomeStackNavigator;