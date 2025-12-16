import React from "react";
import { View, Pressable, StyleSheet, Platform } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../core/colors";

const ICONS: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  Home: { active: "home", inactive: "home-outline" },
  Laws: { active: "document-text", inactive: "document-text-outline" },
  AI: { active: "sparkles", inactive: "sparkles-outline" },
  Cases: { active: "grid", inactive: "grid-outline" },
  Profile: { active: "person", inactive: "person-outline" },
};

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 10);

  return (
    <View style={[styles.container, { paddingBottom: bottomPad }]}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;

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
            navigation.emit({ type: "tabLongPress", target: route.key });
          };

          if (route.name === "AI") {
            return (
              <View key={route.key} style={styles.aiSlot}>
                <Pressable
                  onPress={onPress}
                  onLongPress={onLongPress}
                  style={({ pressed }) => [
                    styles.aiButton,
                    pressed && { transform: [{ translateY: -18 }, { scale: 0.96 }], opacity: 0.95 },
                  ]}
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  accessibilityLabel={descriptors[route.key]?.options?.tabBarAccessibilityLabel}
                >
                  <Ionicons name="sparkles" size={22} color="#FFFFFF" />
                </Pressable>
              </View>
            );
          }

          const cfg = ICONS[route.name] ?? { active: "ellipse", inactive: "ellipse-outline" };
          const iconName = isFocused ? cfg.active : cfg.inactive;
          const color = isFocused ? colors.navy : colors.muted;

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              onLongPress={onLongPress}
              style={({ pressed }) => [
                styles.item,
                pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] },
              ]}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={descriptors[route.key]?.options?.tabBarAccessibilityLabel}
            >
              <Ionicons name={iconName} size={24} color={color} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
    paddingTop: 8,
    alignItems: "center",
  },
  bar: {
    width: "92%",
    height: 66,
    backgroundColor: colors.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  item: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  aiSlot: {
    width: 68,
    alignItems: "center",
    justifyContent: "center",
  },
  aiButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#0B0B0B",
    alignItems: "center",
    justifyContent: "center",
    transform: [{ translateY: -18 }],

    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: Platform.OS === "android" ? 10 : 0,
  },
});
