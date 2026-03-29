import AsyncStorage from "@react-native-async-storage/async-storage";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials, setLoading } from "../redux/authSlice";
import ForgotPassword from "../screens/Auths/ForgotPassword";
import Login from "../screens/Auths/Login";
import OtpVerification from "../screens/Auths/OtpVerification";
import ResetPassword from "../screens/Auths/ResetPassword";
import Signup from "../screens/Auths/Signup";
import CreateEcho from "../screens/Home/CreateEcho";
import Intro from "../screens/Intro";
import MainTabs from "../screens/MainTabs";
import About from "../screens/Profile/About";
import Help from "../screens/Profile/Help";
import PrivacySecurity from "../screens/Profile/PrivacySecurity";
import Terms from "../screens/Profile/Terms";
import API from "../services/api";

const Stack = createNativeStackNavigator();

const HomeStackNavigator = () => {
    const { isAuthenticated, loading } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const [isAppLoading, setIsAppLoading] = useState(true);

    useEffect(() => {
        const checkAutoLogin = async () => {
            try {
                if (!isAuthenticated) {
                    const lastEmail = await AsyncStorage.getItem('last_email');
                    if (lastEmail) {
                        const prefKey = `save_creds_pref_${lastEmail.toLowerCase().trim()}`;
                        const savePref = await AsyncStorage.getItem(prefKey);
                        const shouldSave = savePref !== null ? savePref === 'true' : true;

                        if (shouldSave) {
                            const sanitized = lastEmail.toLowerCase().trim().replace(/[^a-zA-Z0-9._-]/g, '_');
                            const key = `user_credentials_${sanitized}`;
                            const savedCreds = await SecureStore.getItemAsync(key);

                            if (savedCreds) {
                                dispatch(setLoading(true));
                                const { email, password } = JSON.parse(savedCreds);
                                const response = await API.post('/users/login', { email, password });
                                
                                if (!response.data.twoFactorRequired) {
                                    dispatch(setCredentials(response.data));
                                }
                            }
                        }
                    }
                }
            } catch (error) {
                console.log("Auto-login failed:", error);
            } finally {
                setIsAppLoading(false);
                dispatch(setLoading(false));
            }
        };

        checkAutoLogin();
    }, [dispatch]);

    if (loading || isAppLoading) {
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