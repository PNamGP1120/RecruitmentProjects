import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from '../screens/Main/HomeScreen';
import StartScreen from "../screens/Auth/StartScreen";
import LoginScreen from "../screens/Auth/LoginScreen";
import RegisterScreen from "../screens/Auth/RegisterScreen";
// import thêm các màn chính khác

const Stack = createNativeStackNavigator();

export default function AppStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen name="Start" component={StartScreen}/>
            <Stack.Screen name="Login" component={LoginScreen}/>
            <Stack.Screen name="Register" component={RegisterScreen}/>
        </Stack.Navigator>

    );
}
