import React from "react";
import { SafeAreaView, View, Text, StyleSheet, Image } from "react-native";

export default function SplashScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      {/* Лого сверху */}
      <View style={styles.top}>
        <Image
          source={require("../../../assets/zanai-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Центр */}
      <View style={styles.center}>
        <Text style={styles.title}>ZanAI</Text>
        <Text style={styles.subtitle}>Загрузка...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },

  top: {
    paddingTop: 10,
    alignItems: "center",
  },

  logo: {
    width: 140,
    height: 48,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 40, 
  },

  title: { fontSize: 28, fontWeight: "800" },
  subtitle: { marginTop: 6, fontSize: 14, opacity: 0.7 },
});
