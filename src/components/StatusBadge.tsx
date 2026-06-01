import { StyleSheet, Text, View } from "react-native";
import { FriendStatus, statusLabels } from "@/models/friendStatus";
import { colors } from "@/theme/colors";

const stylesByStatus: Record<FriendStatus, { backgroundColor: string; color: string }> = {
  good: { backgroundColor: colors.successSoft, color: colors.success },
  dueSoon: { backgroundColor: colors.warningSoft, color: colors.warning },
  overdue: { backgroundColor: colors.dangerSoft, color: colors.danger },
  neverContacted: { backgroundColor: colors.neutralSoft, color: colors.muted }
};

export function StatusBadge({ status }: { status: FriendStatus }) {
  const palette = stylesByStatus[status];
  return (
    <View style={[styles.badge, { backgroundColor: palette.backgroundColor }]}>
      <Text style={[styles.text, { color: palette.color }]}>{statusLabels[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: "flex-start", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  text: { fontSize: 12, fontWeight: "700" }
});
