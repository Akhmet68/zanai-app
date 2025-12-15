import React, { useEffect } from "react";
import { SafeAreaView, View, Text, StyleSheet, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function SplashScreen() {
  const navigation = useNavigation<any>();

  useEffect(() => {
    const t = setTimeout(() => {
      navigation.replace("ChooseAuth");
    }, 1200);

    return () => clearTimeout(t);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.ringWrap}>
          <Image
            source={require("../../../assets/ai-avatar.png")}
            style={styles.ring}
            resizeMode="contain"
          />

          <Image
            source={require("../../../assets/zanai-logo.png")}
            style={styles.ringLogo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>ZanAI</Text>
        <Text style={styles.subtitle}>Загрузка...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  content: { flex: 1, alignItems: "center", justifyContent: "center" },

  ringWrap: { width: 260, height: 260, marginBottom: 16 },
  ring: { width: "100%", height: "100%" },

  ringLogo: {
    position: "absolute",
    top: 18,
    alignSelf: "center",
    width: 110,
    height: 40,
  },

  title: { fontSize: 28, fontWeight: "800" },
  subtitle: { marginTop: 6, fontSize: 14, opacity: 0.7 },
});
