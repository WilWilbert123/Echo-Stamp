import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from 'react';
import { useSelector } from 'react-redux';
import ForgotPassword from "../screens/Auths/ForgotPassword";
import Login from "../screens/Auths/Login";
import OtpVerification from "../screens/Auths/OtpVerification";
import ResetPassword from "../screens/Auths/ResetPassword";
import Signup from "../screens/Auths/Signup";
import CreateEcho from "../screens/Home/CreateEcho";
import Intro from "../screens/Intro";
import MainTabs from "../screens/MainTabs";
import PrivacySecurity from "../screens/Profile/PrivacySecurity";

const Stack = createNativeStackNavigator();

const HomeStackNavigator = () => {
    // Access authentication state from Redux
    const { isAuthenticated } = useSelector((state) => state.auth);

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {isAuthenticated ? (
                // --- AUTHENTICATED STACK ---
                <>
                    <Stack.Screen name="MainTabsRoot" component={MainTabs} />
                    <Stack.Screen  name="Create"   component={CreateEcho}  options={{  animation: 'slide_from_bottom',  presentation: 'modal'   }}   /> 
                     <Stack.Screen name="PrivacySecurity" component={PrivacySecurity} />  
                </>
            ) : (
                // --- UNAUTHENTICATED STACK ---
                <>
                <Stack.Screen name="Intro" component={Intro} />
                    <Stack.Screen name="Login"   component={Login}  options={{  animationTypeForReplace: isAuthenticated ? 'pop' : 'push',  }}  />
                    <Stack.Screen   name="Signup"  component={Signup}  />
                      <Stack.Screen   name="ForgotPassword"  component={ForgotPassword}  />   
                      <Stack.Screen name="OtpVerification" component={OtpVerification} />  
                       <Stack.Screen name="ResetPassword" component={ResetPassword} />   
                       
                </>
            )}
        </Stack.Navigator>
    );
};

export default HomeStackNavigator;