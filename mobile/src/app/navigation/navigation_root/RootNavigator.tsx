import React, { useMemo, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AuthNavigator from "./AuthNavigator";
import TabNavigator from "./TabNavigator";

import SubscriptionScreen from "../../../screens/profile/SubscriptionScreen";
import FavoritesScreen from "../../../screens/profile/FavoritesScreen";
import DevicesScreen from "../../../screens/profile/DevicesScreen";
import ChangePasswordScreen from "../../../screens/profile/ChangePasswordScreen";

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;

  Subscription: undefined;
  Favorites: undefined;
  Devices: undefined;
  ChangePassword: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const [isAuthed] = useState(true);

  const initialRouteName = useMemo<keyof RootStackParamList>(
    () => (isAuthed ? "Main" : "Auth"),
    [isAuthed]
  );

  return (
    <Stack.Navigator initialRouteName={initialRouteName} screenOptions={{ headerShown: false }}>
      {isAuthed ? (
        <>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen name="Subscription" component={SubscriptionScreen} />
          <Stack.Screen name="Favorites" component={FavoritesScreen} />
          <Stack.Screen name="Devices" component={DevicesScreen} />
          <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}
