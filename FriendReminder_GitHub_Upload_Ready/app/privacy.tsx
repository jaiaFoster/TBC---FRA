import { StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/Screen";
import { colors } from "@/theme/colors";

export default function PrivacyScreen() {
  return (
    <Screen>
      <Text style={styles.title}>Privacy</Text>
      <View style={styles.card}>
        <Text style={styles.body}>
          Friend Reminder does not read your messages, calls, or private communication history. All MVP data is manually entered and stored locally on your device.
        </Text>
        <Text style={styles.body}>
          This MVP has no backend, no accounts, and no cloud sync. It stores friend details, cadences, notes, settings, and manual interaction logs on the device.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 28, fontWeight: "900" },
  card: { backgroundColor: colors.surface, borderRadius: 8, borderWidth: 1, borderColor: colors.border, padding: 18, gap: 12 },
  body: { color: colors.text, fontSize: 16, lineHeight: 24 }
});
