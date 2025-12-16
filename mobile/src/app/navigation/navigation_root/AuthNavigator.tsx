import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SplashScreen from "../../../screens/auth/SplashScreen";
import OnboardingScreen from "../../../screens/auth/OnboardingScreen";
import ChooseAuthScreen from "../../../screens/auth/ChooseAuthScreen";
import LoginScreen from "../../../screens/auth/LoginScreen";
import RegisterScreen from "../../../screens/auth/RegisterScreen";
import VerifyEmailScreen from "../../../screens/auth/VerifyEmailScreen";

export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  ChooseAuth: undefined;
  Login: undefined;
  Register: undefined;
  VerifyEmail: undefined; // ✅
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="ChooseAuth" component={ChooseAuthScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
    </Stack.Navigator>
  );
}
