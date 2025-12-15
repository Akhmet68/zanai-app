import React, { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Screen from "../../ui/Screen";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import { colors } from "../../core/colors";

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  return (
    <Screen>
      <View style={styles.top}>
        <Image source={require("../../../assets/zanai-logo.png")} style={styles.logo} />
      </View>

      <View style={styles.form}>
        <Text style={styles.title}>Tirkelu</Text>

        <Input placeholder="Esiminiz" value={name} onChangeText={setName} />
        <View style={{ height: 12 }} />
        <Input
          placeholder="Poshtanyz"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <View style={{ height: 12 }} />
        <Input
          placeholder="Qupiya soz"
          value={pass}
          onChangeText={setPass}
          secureTextEntry
          autoCapitalize="none"
        />

        <View style={{ height: 16 }} />

        <Button title="Juiege kiru" variant="primary" onPress={() => {}} />

        <View style={{ height: 14 }} />

        <Text style={styles.bottomText}>
          Juiede barsyń ba?{" "}
          <Text style={styles.link} onPress={() => navigation.navigate("Login")}>
            "kiru"
          </Text>
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { alignItems: "center", paddingTop: 14 },
  logo: { width: 170, height: 46, resizeMode: "contain" },

  form: { marginTop: "auto", paddingHorizontal: 22, paddingBottom: 32 },
  title: { fontSize: 22, fontWeight: "800", textAlign: "center", marginBottom: 14 },

  bottomText: { textAlign: "center", color: colors.muted, fontSize: 12 },
  link: { color: colors.navy, fontWeight: "700" },
});
