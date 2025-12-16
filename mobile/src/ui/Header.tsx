import React from "react";
import { View, Image, Pressable, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../core/colors";

const LOGO = require("../../assets/zanai-logo.png");

type Props = {
  leftVariant?: "none" | "back" | "menu";
  onPressLeft?: () => void;

  rightVariant?: "default" | "none";
  lang?: string;
  onPressLang?: () => void;
  onPressSearch?: () => void;
};

export default function Header({
  leftVariant = "none",
  onPressLeft,
  rightVariant = "default",
  lang = "RU",
  onPressLang,
  onPressSearch,
}: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.left}>
        {leftVariant !== "none" ? (
          <Pressable onPress={onPressLeft} style={styles.leftBtn} hitSlop={10}>
            <Ionicons
              name={leftVariant === "back" ? "arrow-back" : "menu"}
              size={22}
              color={colors.text}
            />
          </Pressable>
        ) : (
          <View style={styles.leftPlaceholder} />
        )}

        <Image source={LOGO} style={styles.logo} />
      </View>

      {rightVariant === "default" ? (
        <View style={styles.right}>
          <Pressable onPress={onPressLang} style={styles.langBtn} hitSlop={8}>
            <Text style={styles.langText}>{lang}</Text>
            <Ionicons name="chevron-down" size={16} color={colors.muted} />
          </Pressable>

          <Pressable onPress={onPressSearch} style={styles.iconBtn} hitSlop={8}>
            <Ionicons name="search-outline" size={22} color={colors.text} />
          </Pressable>
        </View>
      ) : (
        <View style={styles.rightPlaceholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  left: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  leftBtn: {
    width: 42,
    height: 42,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  leftPlaceholder: { width: 42, height: 42 },

  logo: {
    height: 36,
    width: 190,
    resizeMode: "contain",
  },

  right: { flexDirection: "row", alignItems: "center", gap: 10 },
  rightPlaceholder: { width: 42, height: 42 },

  langBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  langText: { color: colors.text, fontWeight: "800", fontSize: 12 },

  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
});
