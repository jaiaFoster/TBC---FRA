import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { EmptyState } from "@/components/EmptyState";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { StatusBadge } from "@/components/StatusBadge";
import { Friend } from "@/models/friend";
import { InteractionLog, interactionTypeLabels } from "@/models/interactionLog";
import { archiveFriend, getFriend } from "@/repositories/friendRepository";
import { listLogsForFriend } from "@/repositories/interactionLogRepository";
import { calculateFriendStatus } from "@/services/friendStatusService";
import { deleteInteractionAndRecalculate, logInteraction } from "@/services/interactionLogService";
import { cancelFriendReminders } from "@/services/reminderScheduler";
import { colors } from "@/theme/colors";
import { formatShortDate, isoToday, relativeContactText } from "@/utils/dateUtils";

export default function FriendDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [friend, setFriend] = useState<Friend | null>(null);
  const [logs, setLogs] = useState<InteractionLog[]>([]);

  const load = useCallback(async () => {
    if (!id) return;
    const nextFriend = await getFriend(id);
    setFriend(nextFriend);
    setLogs(nextFriend ? await listLogsForFriend(id) : []);
  }, [id]);

  useFocusEffect(useCallback(() => void load(), [load]));

  async function quickMarkToday() {
    if (!friend) return;
    await logInteraction({ friendId: friend.id, interactionType: friend.preferredInteractionType, date: isoToday(), notes: "Quick mark contacted today." });
    await load();
  }

  async function archive() {
    if (!friend) return;
    await archiveFriend(friend.id);
    await cancelFriendReminders(friend.id);
    router.replace("/");
  }

  async function confirmDeleteLog(logId: string) {
    if (!friend) return;
    Alert.alert("Delete interaction?", "This recalculates the friend's last contacted date.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteInteractionAndRecalculate(friend.id, logId);
          await load();
        }
      }
    ]);
  }

  if (!friend) {
    return (
      <Screen>
        <EmptyState title="Friend not found" body="This friend may have been archived or deleted." />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>{friend.name}</Text>
        <StatusBadge status={calculateFriendStatus(friend)} />
      </View>

      <View style={styles.card}>
        <Text style={styles.meta}>{relativeContactText(friend.lastContactedAt)}</Text>
        <Text style={styles.body}>Cadence: every {friend.cadenceDays} days</Text>
        <Text style={styles.body}>Preferred: {interactionTypeLabels[friend.preferredInteractionType]}</Text>
        {friend.notes ? <Text style={styles.notes}>{friend.notes}</Text> : null}
      </View>

      <View style={styles.actions}>
        <PrimaryButton onPress={() => router.push(`/friends/${friend.id}/log`)}>Log Interaction</PrimaryButton>
        <PrimaryButton tone="secondary" onPress={quickMarkToday}>Mark Today</PrimaryButton>
        <PrimaryButton tone="secondary" onPress={() => router.push(`/friends/${friend.id}/edit`)}>Edit</PrimaryButton>
        <PrimaryButton tone="danger" onPress={archive}>Archive</PrimaryButton>
      </View>

      <Text style={styles.sectionTitle}>Interaction History</Text>
      {logs.length === 0 ? (
        <EmptyState title="No interactions yet" body="Log the first one when you reach out." />
      ) : (
        logs.map((log) => (
          <View key={log.id} style={styles.logRow}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.logTitle}>{interactionTypeLabels[log.interactionType]} · {formatShortDate(log.date)}</Text>
              {log.notes ? <Text style={styles.meta}>{log.notes}</Text> : null}
            </View>
            <Text onPress={() => confirmDeleteLog(log.id)} style={styles.delete}>Delete</Text>
          </View>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: 8 },
  title: { color: colors.text, fontSize: 30, fontWeight: "900" },
  card: { backgroundColor: colors.surface, borderRadius: 8, borderWidth: 1, borderColor: colors.border, padding: 16, gap: 8 },
  meta: { color: colors.muted, lineHeight: 20 },
  body: { color: colors.text, fontSize: 16 },
  notes: { color: colors.text, lineHeight: 21, marginTop: 6 },
  actions: { gap: 10 },
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: "900" },
  logRow: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.surface, borderRadius: 8, borderWidth: 1, borderColor: colors.border, padding: 14 },
  logTitle: { color: colors.text, fontWeight: "800", fontSize: 16 },
  delete: { color: colors.danger, fontWeight: "800" }
});
