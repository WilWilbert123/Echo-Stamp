import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from 'react';
import { useSelector } from 'react-redux';
import CreateEcho from "../screens/CreateEcho";
import Login from "../screens/Login";
import MainTabs from "../screens/MainTabs";
import Signup from "../screens/Signup"; // Import your Signup screen

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
                    <Stack.Screen 
                        name="Create" 
                        component={CreateEcho} 
                        options={{ 
                            animation: 'slide_from_bottom',
                            presentation: 'modal' 
                        }} 
                    /> 
                </>
            ) : (
                // --- UNAUTHENTICATED STACK ---
                <>
                    <Stack.Screen 
                        name="Login" 
                        component={Login} 
                        options={{
                            animationTypeForReplace: isAuthenticated ? 'pop' : 'push',
                        }} 
                    />
                    <Stack.Screen 
                        name="Signup" 
                        component={Signup} 
                    />
                </>
            )}
        </Stack.Navigator>
    );
};

export default HomeStackNavigator;