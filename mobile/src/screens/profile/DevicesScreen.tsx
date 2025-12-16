import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Screen from "../../ui/Screen";
import Header from "../../ui/Header";
import { colors } from "../../core/colors";
import { useNavigation } from "@react-navigation/native";

export default function DevicesScreen() {
  const navigation = useNavigation<any>();
  return (
    <Screen>
      <Header leftVariant="back" rightVariant="none" onPressLeft={() => navigation.goBack()} />
      <View style={styles.container}>
        <Text style={styles.title}>Устройства</Text>
        <Text style={styles.text}>Тут будет список активных сессий.</Text>
      </View>
    </Screen>
  );
}
const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 8 },
  title: { fontSize: 28, fontWeight: "900", color: colors.text },
  text: { marginTop: 8, color: colors.muted },
});
