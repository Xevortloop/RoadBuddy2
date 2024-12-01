import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomePage from '../pages/Home/HomePage';
import LoginPage from '../pages/Login/LoginPage';
import RegisterPageUser from '../pages/Register/RegisterPageUser';
import RegisterPageMechanic from '../pages/Register/RegisterPageMechanic';
import TopUpPage from '../pages/Home/TopUpPage';
import PaymentScreen from '../pages/Home/PaymentPage';
import EmailVerificationPage from '../pages/Register/VerificationPage'; // Pastikan sudah diimport dengan benar

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen 
          name="Home" 
          component={HomePage} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Login" 
          component={LoginPage} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="RegisterUser" 
          component={RegisterPageUser} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="RegisterMechanic" 
          component={RegisterPageMechanic} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="TopUpPage" 
          component={TopUpPage} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="PaymentScreen" 
          component={PaymentScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="EmailVerification" 
          component={EmailVerificationPage}  // Pastikan ini ada di dalam navigator
          options={{ headerShown: false }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
