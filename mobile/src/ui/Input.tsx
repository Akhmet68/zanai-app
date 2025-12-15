import React from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { colors } from "../core/colors";

type Props = {
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
};

export default function Input(props: Props) {
  return (
    <View style={styles.wrap}>
      <TextInput
        {...props}
        style={styles.input}
        placeholderTextColor={colors.muted}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 46,
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: colors.border,
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  input: { fontSize: 15, color: colors.text },
});
