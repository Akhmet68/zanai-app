import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../core/colors";

type Props = { title?: string };

const Header = ({ title = "ZanAI" }: Props) => {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16, paddingVertical: 12 },
  title: { fontSize: 18, fontWeight: "800", color: colors.text },
});
