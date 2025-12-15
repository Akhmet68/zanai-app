import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const LABELS: Record<string, string> = {
  Home: "Главная",
  Laws: "Законы",
  AI: "AI",
  Cases: "Кейсы",
  Profile: "Профиль",
};

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const isAI = route.name === "AI";

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name as never);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          const label =
            (descriptors[route.key]?.options.tabBarLabel as string) ??
            LABELS[route.name] ??
            route.name;

          if (isAI) {
            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                onLongPress={onLongPress}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                style={styles.aiBtn}
              >
                <Text style={styles.aiText}>AI</Text>
              </Pressable>
            );
          }

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              onLongPress={onLongPress}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              style={styles.item}
            >
              <Text style={[styles.label, isFocused && styles.labelActive]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: "transparent",
  },
  bar: {
    marginHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#111",
    backgroundColor: "#fff",
    height: 64,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 64,
  },
  label: {
    fontSize: 12,
    color: "#444",
  },
  labelActive: {
    color: "#111",
    fontWeight: "700",
  },
  aiBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 6,
  },
  aiText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
});
