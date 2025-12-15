import React from "react";
import { View, Pressable, StyleSheet, Text } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../core/colors";

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Home: "home-outline",
  Laws: "document-text-outline",
  AI: "sparkles-outline",
  Cases: "grid-outline",
  Profile: "person-outline",
};

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
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
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          // Центр. кнопка Ai (как в макете)
          if (route.name === "AI") {
            return (
              <View key={route.key} style={styles.aiSlot}>
                <Pressable
                  onPress={onPress}
                  onLongPress={onLongPress}
                  style={({ pressed }) => [
                    styles.aiButton,
                    pressed && { opacity: 0.85 },
                  ]}
                >
                  <Text style={styles.aiText}>Ai</Text>
                </Pressable>
              </View>
            );
          }

          const color = isFocused ? colors.navy : colors.muted;
          const iconName = ICONS[route.name] ?? "ellipse-outline";

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              onLongPress={onLongPress}
              style={({ pressed }) => [styles.item, pressed && { opacity: 0.7 }]}
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
    transform: [{ translateY: -10 }], // чуть “вылезает” вверх как в макете
  },
  aiText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 18,
    letterSpacing: 0.5,
  },
});
