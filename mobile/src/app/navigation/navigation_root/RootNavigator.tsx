import React, { useMemo } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AuthNavigator from "./AuthNavigator";
import TabNavigator from "./TabNavigator";
import { AuthProvider, useAuth } from "../../auth/AuthContext";

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigatorInner() {
  const { isAuthed } = useAuth();

  const initialRouteName = useMemo<keyof RootStackParamList>(
    () => (isAuthed ? "Main" : "Auth"),
    [isAuthed]
  );

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{ headerShown: false }}
    >
      {isAuthed ? (
        <Stack.Screen name="Main" component={TabNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <AuthProvider>
      <RootNavigatorInner />
    </AuthProvider>
  );
}
