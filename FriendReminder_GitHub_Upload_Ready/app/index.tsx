import { Link, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { DashboardSummary } from "@/components/DashboardSummary";
import { EmptyState } from "@/components/EmptyState";
import { FriendRow } from "@/components/FriendRow";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { Friend } from "@/models/friend";
import { listFriends } from "@/repositories/friendRepository";
import { groupFriendsByStatus } from "@/services/friendStatusService";
import { colors } from "@/theme/colors";

export default function DashboardScreen() {
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);

  const load = useCallback(async () => setFriends(await listFriends(false)), []);
  useFocusEffect(useCallback(() => void load(), [load]));

  const groups = groupFriendsByStatus(friends);
  const recently = [...friends]
    .filter((friend) => friend.lastContactedAt)
    .sort((a, b) => new Date(b.lastContactedAt ?? 0).getTime() - new Date(a.lastContactedAt ?? 0).getTime())
    .slice(0, 3);

  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>Friend Reminder</Text>
          <Text style={styles.title}>Stay close, locally.</Text>
        </View>
        <Link href="/settings" style={styles.link}>Settings</Link>
      </View>

      <DashboardSummary friends={friends} />
      <PrimaryButton onPress={() => router.push("/friends/add")}>Add Friend</PrimaryButton>
      <PrimaryButton tone="secondary" onPress={() => router.push("/friends")}>All Friends</PrimaryButton>

      {friends.length === 0 ? (
        <EmptyState title="No friends yet" body="Add a friend or seed debug data from Settings to try the flow." />
      ) : (
        <>
          <Section title="Overdue" friends={groups.overdue} />
          <Section title="Never contacted" friends={groups.neverContacted} />
          <Section title="Due soon" friends={groups.dueSoon} />
          <Section title="Recently contacted" friends={recently} />
        </>
      )}
    </Screen>
  );
}

function Section({ title, friends }: { title: string; friends: Friend[] }) {
  const router = useRouter();
  if (friends.length === 0) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {friends.map((friend) => (
        <FriendRow key={friend.id} friend={friend} onPress={() => router.push(`/friends/${friend.id}`)} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 16 },
  kicker: { color: colors.primary, fontWeight: "900", fontSize: 13, textTransform: "uppercase" },
  title: { color: colors.text, fontSize: 30, fontWeight: "900", marginTop: 2 },
  link: { color: colors.primary, fontWeight: "800", fontSize: 16 },
  section: { gap: 10 },
  sectionTitle: { color: colors.text, fontSize: 20, fontWeight: "900" }
});
