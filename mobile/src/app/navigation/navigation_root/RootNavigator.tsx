import React from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AuthNavigator from "./AuthNavigator";
import TabNavigator from "./TabNavigator";
import { useAuth } from "../../auth/AuthContext";
import { colors } from "../../../core/colors";
import Screen from "../../../ui/Screen";

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;

  Favorites: undefined;
  Subscription: undefined;
  Devices: undefined;
  ChangePassword: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function Placeholder({ title }: { title: string }) {
  return (
    <Screen>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: "800", color: colors.text }}>{title}</Text>
        <Text style={{ marginTop: 8, color: colors.muted, textAlign: "center" }}>
          Экран подключён. Дальше можно заменить на реальную реализацию.
        </Text>
      </View>
    </Screen>
  );
}

const FavoritesScreen = () => <Placeholder title="Favorites" />;
const SubscriptionScreen = () => <Placeholder title="Subscription" />;
const DevicesScreen = () => <Placeholder title="Devices" />;
const ChangePasswordScreen = () => <Placeholder title="ChangePassword" />;

export default function RootNavigator() {
  const { initializing, isAuthed } = useAuth();

  if (initializing) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator color={colors.navy} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthed ? (
        <>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen name="Favorites" component={FavoritesScreen} />
          <Stack.Screen name="Subscription" component={SubscriptionScreen} />
          <Stack.Screen name="Devices" component={DevicesScreen} />
          <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}
