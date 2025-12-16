import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import NewsHomeScreen from "../../../screens/news/NewsHomeScreen";
import LawsHomeScreen from "../../../screens/laws/LawsHomeScreen";
import ChatScreen from "../../../screens/ai/ChatScreen";
import MyCasesScreen from "../../../screens/cases/MyCasesScreen";
import ProfileScreen from "../../../screens/profile/ProfileScreen";

import CustomTabBar, { TAB_BAR_HEIGHT } from "../../../ui/CustomTabBar";

export type TabParamList = {
  Home: undefined;
  Laws: undefined;
  AI: undefined;
  Cases: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
  const insets = useSafeAreaInsets();

  // ✅ резервируем только то, что реально перекрывает экран (бар + нижний safe area)
  const bottomPad = Math.max(insets.bottom, 10);
  const reservedBottom = TAB_BAR_HEIGHT + bottomPad;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
      }}
      sceneContainerStyle={{ paddingBottom: reservedBottom }}
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
