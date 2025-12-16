import React, { useEffect, useMemo, useRef } from "react";
import { View, Image, StyleSheet, ActivityIndicator, Animated } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Screen from "../../ui/Screen";
import { colors } from "../../core/colors";

const LOGO = require("../../../assets/zanai-logo.png");

export default function SplashScreen() {
  const navigation = useNavigation<any>();

  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.98)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 320, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 8, tension: 90, useNativeDriver: true }),
    ]).start();

    const t = setTimeout(() => {
      navigation.replace("Onboarding");
    }, 850);

    return () => clearTimeout(t);
  }, [navigation, opacity, scale]);

  const animStyle = useMemo(
    () => ({ opacity, transform: [{ scale }] }),
    [opacity, scale]
  );

  return (
    <Screen contentStyle={{ paddingTop: 0 }} edges={["left", "right"]}>
      <View style={styles.center}>
        <Animated.View style={animStyle}>
          <Image source={LOGO} style={styles.logo} />
        </Animated.View>

        <ActivityIndicator style={{ marginTop: 18 }} color={colors.navy} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.white },
  logo: { width: 210, height: 54, resizeMode: "contain" },
});
