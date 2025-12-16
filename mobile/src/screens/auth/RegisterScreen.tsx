import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";

const LOGO = require("../../../assets/zanai-logo.png");

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
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
        >
          {/* Top bar: back + logo */}
          <View style={styles.topBar}>
            <Pressable
              onPress={() => navigation.goBack()}
              hitSlop={12}
              style={styles.backBtn}
            >
              <Ionicons name="chevron-back" size={28} color="#0B0F1A" />
            </Pressable>

            <Image source={LOGO} style={styles.logo} />
          </View>

          <View style={{ flex: 1 }} />

          <View>
            <Text style={styles.title}>Tirkelu</Text>

            <View style={styles.field}>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Esiminiz"
                placeholderTextColor="#9AA3AF"
                autoCapitalize="words"
                style={styles.input}
              />
            </View>

            <View style={styles.field}>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Poshtanyz"
                placeholderTextColor="#9AA3AF"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                style={styles.input}
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

            <Pressable onPress={() => {}} style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>Juiege kiru</Text>
            </Pressable>

            <Pressable
              onPress={() => navigation.navigate("Login")}
              style={{ marginTop: 14, alignItems: "center" }}
            >
              <Text style={styles.bottomText}>
                Juiede barsýn ba? <Text style={styles.link}>"kiru"</Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
  primaryBtn: {
    height: 58,
    borderRadius: 18,
    backgroundColor: "#0B1E4B",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
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
