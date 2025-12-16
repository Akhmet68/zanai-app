import React from "react";
import { View, Image, Pressable, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

const LOGO = require("../../../assets/zanai-logo.png");

export default function ChooseAuthScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.top}>
        <Image source={LOGO} style={styles.logo} />
      </View>

      <View style={styles.bottom}>
        <Pressable style={styles.btn} onPress={() => navigation.navigate("Login")}>
          <Text style={styles.btnText}>Kiru</Text>
        </Pressable>

        <Pressable style={[styles.btn, { marginTop: 14 }]} onPress={() => navigation.navigate("Register")}>
          <Text style={styles.btnText}>Tirkelu</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  top: { flex: 1, alignItems: "center", justifyContent: "flex-start", paddingTop: 18 },
  logo: { width: 160, height: 40, resizeMode: "contain" },
  bottom: { paddingHorizontal: 20, paddingBottom: 18 },
  btn: {
    height: 58,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#0B0F1A",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  btnText: { fontSize: 16, fontWeight: "700", color: "#0B0F1A" },
});
