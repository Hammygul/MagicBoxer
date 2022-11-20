import React from 'react';
import OrdersScreen from '../screens/OrdersScreen';
import LoginScreen from '../screens/LoginScreen';
import Details from "../screens/Details";
import Display from "../screens/Display";

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';


const Stack = createNativeStackNavigator();

function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LoginScreen">
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="OrdersScreen" component={OrdersScreen} />
        <Stack.Screen name="Details" component={Details} />
        <Stack.Screen name="Display" component={Display} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}



export default AppNavigator;
