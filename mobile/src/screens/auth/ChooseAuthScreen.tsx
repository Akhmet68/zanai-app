import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Screen from "../../ui/Screen";
import Button from "../../ui/Button";
import { colors } from "../../core/colors";

export default function ChooseAuthScreen({ navigation }: any) {
  return (
    <Screen>
      <View style={styles.top}>
        <Image source={require("../../../assets/zanai-logo.png")} style={styles.logo} />
      </View>

      <View style={styles.center}>
        <Text style={styles.brand}>ZanAI</Text>
      </View>

      <View style={styles.bottom}>
        <Button title="Kiru" onPress={() => navigation.navigate("Login")} />
        <View style={{ height: 12 }} />
        <Button title="Tirkelu" onPress={() => navigation.navigate("Register")} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { alignItems: "center", paddingTop: 14 },
  logo: { width: 170, height: 46, resizeMode: "contain" },

  center: { flex: 1, justifyContent: "flex-end", alignItems: "center", paddingBottom: 22 },
  brand: { fontSize: 20, fontWeight: "700", color: colors.text },

  bottom: { paddingHorizontal: 22, paddingBottom: 32 },
});
