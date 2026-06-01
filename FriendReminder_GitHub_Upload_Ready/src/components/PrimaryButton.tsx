import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { colors } from "@/theme/colors";

type Props = {
  children: ReactNode;
  onPress: () => void;
  tone?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  style?: ViewStyle;
};

export function PrimaryButton({ children, onPress, tone = "primary", disabled, style }: Props) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        tone === "secondary" && styles.secondary,
        tone === "danger" && styles.danger,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style
      ]}
    >
      <Text style={[styles.text, tone === "secondary" && styles.secondaryText]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 46,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    backgroundColor: colors.primary
  },
  secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  danger: { backgroundColor: colors.danger },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.82 },
  text: { color: "#FFFFFF", fontWeight: "700", fontSize: 16 },
  secondaryText: { color: colors.text }
});
