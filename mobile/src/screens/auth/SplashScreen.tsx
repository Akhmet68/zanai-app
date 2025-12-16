import React, { useEffect } from "react";
import { View, Image, StyleSheet, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Screen from "../../ui/Screen";
import { colors } from "../../core/colors";

const LOGO = require("../../../assets/zanai-logo.png");

export default function SplashScreen() {
  const navigation = useNavigation<any>();

  useEffect(() => {
    const t = setTimeout(() => {
      navigation.replace("Onboarding");
    }, 900);
    return () => clearTimeout(t);
  }, [navigation]);

  return (
    <Screen contentStyle={{ paddingTop: 0 }}>
      <View style={styles.center}>
        <Image source={LOGO} style={styles.logo} />
        <ActivityIndicator style={{ marginTop: 18 }} color={colors.navy} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  logo: { width: 190, height: 46, resizeMode: "contain" },
});
