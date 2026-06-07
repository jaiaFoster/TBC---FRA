import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { FriendRow } from "@/components/FriendRow";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { Friend } from "@/models/friend";
import { FriendStatus } from "@/models/friendStatus";
import { listFriends } from "@/repositories/friendRepository";
import { calculateFriendStatus } from "@/services/friendStatusService";
import { colors } from "@/theme/colors";

const filters: Array<FriendStatus | "all"> = ["all", "overdue", "neverContacted", "dueSoon", "good"];

export default function FriendsScreen() {
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FriendStatus | "all">("all");

  useFocusEffect(useCallback(() => void listFriends(false).then(setFriends), []));

  const filtered = useMemo(() => {
    return friends.filter((friend) => {
      const matchesSearch = friend.name.toLowerCase().includes(search.trim().toLowerCase());
      const matchesFilter = filter === "all" || calculateFriendStatus(friend) === filter;
      return matchesSearch && matchesFilter;
    });
  }, [friends, search, filter]);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>All Friends</Text>
        <PrimaryButton onPress={() => router.push("/friends/add")} style={styles.addButton}>Add</PrimaryButton>
      </View>
      <PrimaryButton tone="secondary" onPress={() => router.push("/friends/import-contacts")}>Import from Contacts</PrimaryButton>
      <TextInput style={styles.input} value={search} onChangeText={setSearch} placeholder="Search by name" />
      <View style={styles.filterRow}>
        {filters.map((item) => (
          <Text key={item} onPress={() => setFilter(item)} style={[styles.filter, filter === item && styles.filterActive]}>
            {item === "all" ? "All" : item === "neverContacted" ? "Never" : item === "dueSoon" ? "Due soon" : item[0].toUpperCase() + item.slice(1)}
          </Text>
        ))}
      </View>
      <View style={styles.list}>
        {filtered.map((friend) => (
          <FriendRow key={friend.id} friend={friend} onPress={() => router.push(`/friends/${friend.id}`)} />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { color: colors.text, fontSize: 28, fontWeight: "900" },
  addButton: { minWidth: 88 },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 8, minHeight: 46, paddingHorizontal: 12, fontSize: 16 },
  filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  filter: { overflow: "hidden", borderRadius: 8, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: colors.surface, color: colors.text, fontWeight: "700" },
  filterActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft, color: colors.primary },
  list: { gap: 10 }
});
