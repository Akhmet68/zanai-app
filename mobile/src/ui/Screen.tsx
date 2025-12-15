import React from "react";
import { SafeAreaView, StyleSheet, ViewStyle } from "react-native";
import { colors } from "../core/colors";

export default function Screen({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return <SafeAreaView style={[styles.root, style]}>{children}</SafeAreaView>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
});
