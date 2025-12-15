import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import NewsHomeScreen from "../../../screens/news/NewsHomeScreen";
import LawsHomeScreen from "../../../screens/laws/LawsHomeScreen";
import ChatScreen from "../../../screens/ai/ChatScreen";
import MyCasesScreen from "../../../screens/cases/MyCasesScreen";
import ProfileScreen from "../../../screens/profile/ProfileScreen";

import CustomTabBar from "../../../ui/CustomTabBar";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={NewsHomeScreen} />
      <Tab.Screen name="Laws" component={LawsHomeScreen} />
      <Tab.Screen name="AI" component={ChatScreen} />
      <Tab.Screen name="Cases" component={MyCasesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
