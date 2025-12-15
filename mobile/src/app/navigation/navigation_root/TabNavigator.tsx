import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import NewsHomeScreen from "../../../screens/news/NewsHomeScreen";
import LawsHomeScreen from "../../../screens/laws/LawsHomeScreen";
import ChatScreen from "../../../screens/ai/ChatScreen";
import MyCasesScreen from "../../../screens/cases/MyCasesScreen";
import ProfileScreen from "../../../screens/profile/ProfileScreen";

export type TabParamList = {
  Home: undefined;
  Laws: undefined;
  AI: undefined;
  Cases: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={NewsHomeScreen} options={{ title: "Новости" }} />
      <Tab.Screen name="Laws" component={LawsHomeScreen} options={{ title: "Законы" }} />
      <Tab.Screen name="AI" component={ChatScreen} options={{ title: "AI" }} />
      <Tab.Screen name="Cases" component={MyCasesScreen} options={{ title: "Кейсы" }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: "Профиль" }} />
    </Tab.Navigator>
  );
}
