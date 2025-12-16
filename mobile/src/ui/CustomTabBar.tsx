import React from "react";
import { View, Pressable, StyleSheet, Text, Platform } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../core/colors";

export const TAB_BAR_HEIGHT = 66; // высота "плашки"
export const TAB_BAR_TOP_GAP = 8; // воздух над плашкой

const ICONS_OUTLINE: Record<string, keyof typeof Ionicons.glyphMap> = {
  Home: "home-outline",
  Laws: "document-text-outline",
  AI: "sparkles-outline",
  Cases: "grid-outline",
  Profile: "person-outline",
};

const ICONS_FILLED: Partial<Record<string, keyof typeof Ionicons.glyphMap>> = {
  Home: "home",
  Laws: "document-text",
  Cases: "grid",
  Profile: "person",
};

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 10);

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.container,
        {
          paddingBottom: bottomPad,
        },
      ]}
    >
      <View style={styles.bar} pointerEvents="auto">
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

          // Центр. кнопка Ai
          if (route.name === "AI") {
            return (
              <View key={route.key} style={styles.aiSlot}>
                <Pressable
                  onPress={onPress}
                  onLongPress={onLongPress}
                  style={({ pressed }) => [
                    styles.aiButton,
                    pressed && { opacity: 0.9 },
                  ]}
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  accessibilityLabel={
                    descriptors[route.key]?.options?.tabBarAccessibilityLabel
                  }
                >
                  <Text style={styles.aiText}>Ai</Text>
                </Pressable>
              </View>
            );
          }

          const iconName =
            (isFocused ? ICONS_FILLED[route.name] : ICONS_OUTLINE[route.name]) ??
            "ellipse-outline";

          const iconColor = isFocused ? colors.navy : colors.muted;

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              onLongPress={onLongPress}
              style={({ pressed }) => [styles.item, pressed && { opacity: 0.7 }]}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={
                descriptors[route.key]?.options?.tabBarAccessibilityLabel
              }
            >
              <Ionicons name={iconName} size={24} color={iconColor} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // ВАЖНО: absolute, чтобы таббар не “сжимал” экран и не ломал SafeArea сверху
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,

    backgroundColor: "transparent",
    paddingTop: TAB_BAR_TOP_GAP,
    alignItems: "center",
  },

  bar: {
    width: "92%",
    height: TAB_BAR_HEIGHT,
    backgroundColor: colors.white,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,

    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 6 },
    }),
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
    transform: [{ translateY: -10 }],
  },
  aiText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 18,
    letterSpacing: 0.3,
  },
});
