import React, { useEffect } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../app/navigation/navigation_root/AuthNavigator";

type Props = NativeStackScreenProps<AuthStackParamList, "Splash">;

export default function SplashScreen({ navigation }: Props) {
  useEffect(() => {
    const t = setTimeout(() => {
      navigation.replace("Onboarding"); 
    }, 900);

    return () => clearTimeout(t);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require("../../../assets/zanai-logo.png")}
        style={styles.logo}
      />

      <View style={styles.center}>
        <Text style={styles.title}>ZanAI</Text>
        <Text style={styles.subtitle}>Загрузка...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", alignItems: "center" },
  logo: { width: 160, height: 44, marginTop: 56, resizeMode: "contain" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 34, fontWeight: "700" },
  subtitle: { marginTop: 8, fontSize: 16, opacity: 0.6 },
});
