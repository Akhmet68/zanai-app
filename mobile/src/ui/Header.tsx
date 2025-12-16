import React from "react";
import { View, Image, Pressable, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../core/colors";

const LOGO = require("../../assets/zanai-logo.png");

type Props = {
  rightVariant?: "default" | "none";
  lang?: string;
  onPressLang?: () => void;
  onPressSearch?: () => void;
};

export default function Header({
  rightVariant = "default",
  lang = "RU",
  onPressLang,
  onPressSearch,
}: Props) {
  return (
    <View style={styles.wrap}>
      <Image source={LOGO} style={styles.logo} />

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
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    height: 22,
    width: 110,
    resizeMode: "contain",
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  rightPlaceholder: { width: 40, height: 40 },

  langBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  langText: { color: colors.text, fontWeight: "700", fontSize: 12 },

  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
});
