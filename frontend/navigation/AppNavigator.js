import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomePage from '../pages/Home/HomePage';
import HomePage2 from '../pages/Home/HomePage2';
import LoginPage from '../pages/Login/LoginPage';
import RegisterPageUser from '../pages/Register/RegisterPageUser';
import RegisterPageMechanic from '../pages/Register/RegisterPageMechanic';
import TopUpPage from '../pages/Home/TopUpPage';
import PaymentScreen from '../pages/Home/PaymentPage';
import EmailVerificationPage from '../pages/Register/VerificationPage';
import LocationPicker from '../pages/Order/LocationPickerPage';
import KendalaForm from '../pages/Order/KendalaFormPage' 
import TakeOrderPage from '../pages/Order/TakeOrderPage';
import TransactionMechanic from '../pages/Home/TransactionMechanic';
import ChatPage from '../pages/Order/ChatPage';// Pastikan sudah diimport dengan benar
import PaymentPage from '../pages/Order/PaymentPage';
import TransactionUser from '../pages/Home/TransactionUser';

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
          name="Home2" 
          component={HomePage2} 
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
        <Stack.Screen 
          name="LocationPicker" 
          component={LocationPicker}  // Pastikan ini ada di dalam navigator
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="KendalaForm" 
          component={KendalaForm}  // Pastikan ini ada di dalam navigator
          options={{ headerShown: false }} 
        />
          <Stack.Screen 
          name="TakeOrder" 
          component={TakeOrderPage}  // Pastikan ini ada di dalam navigator
          options={{ headerShown: false }} 
        />
          <Stack.Screen 
          name="TransaksiMechanic" 
          component={TransactionMechanic}  // Pastikan ini ada di dalam navigator
          options={{ headerShown: false }} 
        />
          <Stack.Screen 
          name="ChatPage" 
          component={ChatPage}  // Pastikan ini ada di dalam navigator
          options={{ headerShown: false }} 
        />
          <Stack.Screen 
          name="PaymentPage" 
          component={PaymentPage}  // Pastikan ini ada di dalam navigator
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="TransactionUser" 
          component={TransactionUser}  // Pastikan ini ada di dalam navigator
          options={{ headerShown: false }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
