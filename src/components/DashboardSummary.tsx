import { StyleSheet, Text, View } from "react-native";
import { Friend } from "@/models/friend";
import { groupFriendsByStatus } from "@/services/friendStatusService";
import { colors } from "@/theme/colors";

export function DashboardSummary({ friends }: { friends: Friend[] }) {
  const groups = groupFriendsByStatus(friends);
  const items = [
    ["Active", friends.length],
    ["Overdue", groups.overdue.length],
    ["Due soon", groups.dueSoon.length],
    ["Never", groups.neverContacted.length]
  ] as const;

  return (
    <View style={styles.grid}>
      {items.map(([label, value]) => (
        <View key={label} style={styles.card}>
          <Text style={styles.value}>{value}</Text>
          <Text style={styles.label}>{label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", gap: 8 },
  card: { flex: 1, backgroundColor: colors.surface, borderRadius: 8, borderWidth: 1, borderColor: colors.border, padding: 12 },
  value: { color: colors.text, fontSize: 24, fontWeight: "900" },
  label: { color: colors.muted, fontSize: 12, marginTop: 4 }
});
