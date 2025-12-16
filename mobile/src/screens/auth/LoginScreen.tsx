import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  StyleSheet,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";

const LOGO = require("../../../assets/zanai-logo.png");

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  // Smooth keyboard spacer
  const keyboardSpace = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent as any, (e: any) => {
      Animated.timing(keyboardSpace, {
        toValue: e?.endCoordinates?.height ?? 0,
        duration: e?.duration ?? 250,
        useNativeDriver: false,
      }).start();
    });

    const hideSub = Keyboard.addListener(hideEvent as any, (e: any) => {
      Animated.timing(keyboardSpace, {
        toValue: 0,
        duration: e?.duration ?? 250,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [keyboardSpace]);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            flexGrow: 1,
            paddingTop: insets.top + 10,
            paddingBottom: insets.bottom + 16,
            paddingHorizontal: 20,
          }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        >
          {/* Top bar: back + logo */}
          <View style={styles.topBar}>
            <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={28} color="#0B0F1A" />
            </Pressable>

            <Image source={LOGO} style={styles.logo} />
          </View>

          {/* Spacer */}
          <View style={{ flex: 1 }} />

          {/* Form */}
          <View>
            <Text style={styles.title}>Kiru</Text>

            <View style={styles.field}>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Esim/poshta"
                placeholderTextColor="#9AA3AF"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                style={styles.input}
                returnKeyType="next"
              />
            </View>

            <View style={styles.field}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Qupiya soz"
                placeholderTextColor="#9AA3AF"
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry={!showPass}
                style={[styles.input, { paddingRight: 48 }]}
                returnKeyType="done"
              />

              <Pressable
                onPress={() => setShowPass((v) => !v)}
                hitSlop={12}
                style={styles.eyeBtn}
              >
                <Ionicons
                  name={showPass ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color="#6B7280"
                />
              </Pressable>
            </View>

            <Pressable onPress={() => {}} style={styles.forgotBtn}>
              <Text style={styles.forgotText}>Qupiya sozdi qaja ondeu</Text>
            </Pressable>

            <Pressable onPress={() => {}} style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>Juiege kiru</Text>
            </Pressable>

            <Pressable
              onPress={() => navigation.navigate("Register")}
              style={{ marginTop: 14, alignItems: "center" }}
            >
              <Text style={styles.bottomText}>
                Juiede joqsýn ba? <Text style={styles.link}>"tirkelu"</Text>
              </Text>
            </Pressable>
          </View>

          {/* Smooth keyboard space */}
          <Animated.View style={{ height: keyboardSpace }} />
        </ScrollView>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  backBtn: {
    position: "absolute",
    left: 0,
    height: 44,
    width: 44,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  logo: {
    height: 22,
    width: 100,
    resizeMode: "contain",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    color: "#0B0F1A",
    marginBottom: 14,
  },
  field: {
    position: "relative",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  input: {
    height: 56,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#0B0F1A",
  },
  eyeBtn: {
    position: "absolute",
    right: 14,
    top: 0,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  forgotBtn: {
    alignItems: "center",
    marginTop: 6,
    marginBottom: 16,
  },
  forgotText: {
    fontSize: 13,
    color: "#6B7280",
  },
  primaryBtn: {
    height: 58,
    borderRadius: 18,
    backgroundColor: "#0B1E4B",
    justifyContent: "center",
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  bottomText: {
    color: "#6B7280",
    fontSize: 13,
  },
  link: {
    color: "#0B1E4B",
    fontWeight: "700",
  },
});
