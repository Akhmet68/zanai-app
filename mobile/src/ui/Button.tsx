import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { colors } from "../core/colors";

type Props = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "outline";
  disabled?: boolean;
};

export default function Button({
  title,
  onPress,
  variant = "outline",
  disabled,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variant === "primary" ? styles.primary : styles.outline,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.text,
          variant === "primary" ? styles.textPrimary : styles.textOutline,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.2,
  },
  outline: { backgroundColor: "transparent", borderColor: colors.border },
  primary: { backgroundColor: colors.navy, borderColor: colors.navy },
  text: { fontSize: 16, fontWeight: "600" },
  textOutline: { color: colors.text },
  textPrimary: { color: colors.white },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
});
