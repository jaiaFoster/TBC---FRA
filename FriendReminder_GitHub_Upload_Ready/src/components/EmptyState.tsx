import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme/colors";

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.surface, borderRadius: 8, borderWidth: 1, borderColor: colors.border, padding: 18, gap: 6 },
  title: { color: colors.text, fontWeight: "800", fontSize: 17 },
  body: { color: colors.muted, lineHeight: 20 }
});
