import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Screen from "../../ui/Screen";
import Button from "../../ui/Button";
import { colors } from "../../core/colors";

export default function OnboardingScreen({ navigation }: any) {
  return (
    <Screen>
      <View style={styles.top}>
        <Image source={require("../../../assets/zanai-logo.png")} style={styles.logo} />
      </View>

      <View style={styles.bottom}>
        <Text style={styles.title}>ZanAI</Text>
        <Text style={styles.subtitle}>
          Юридический помощник: AI чат, ДТП, документы и кейсы.
        </Text>

        <Button title="Bastau" onPress={() => navigation.navigate("ChooseAuth")} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { alignItems: "center", paddingTop: 14 },
  logo: { width: 170, height: 46, resizeMode: "contain" },

  bottom: { marginTop: "auto", paddingHorizontal: 22, paddingBottom: 32 },
  title: { fontSize: 32, fontWeight: "800", color: colors.text, marginBottom: 6 },
  subtitle: { color: colors.muted, fontSize: 15, marginBottom: 18 },
});
