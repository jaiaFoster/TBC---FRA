import { Pressable, StyleSheet, Text, View } from "react-native";
import { Friend } from "@/models/friend";
import { calculateFriendStatus } from "@/services/friendStatusService";
import { relativeContactText } from "@/utils/dateUtils";
import { colors } from "@/theme/colors";
import { StatusBadge } from "./StatusBadge";

export function FriendRow({ friend, onPress }: { friend: Friend; onPress: () => void }) {
  const initials = friend.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials || "?"}</Text>
      </View>
      <View style={styles.main}>
        <Text style={styles.name}>{friend.name}</Text>
        <Text style={styles.meta}>{relativeContactText(friend.lastContactedAt)} · every {friend.cadenceDays} days</Text>
      </View>
      <StatusBadge status={calculateFriendStatus(friend)} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12
  },
  pressed: { opacity: 0.75 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
  avatarText: { color: colors.primary, fontWeight: "800" },
  main: { flex: 1, gap: 4 },
  name: { color: colors.text, fontSize: 16, fontWeight: "800" },
  meta: { color: colors.muted, fontSize: 13 }
});
