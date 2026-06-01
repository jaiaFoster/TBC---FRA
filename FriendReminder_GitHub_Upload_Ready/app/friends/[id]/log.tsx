import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { InteractionType, interactionTypeLabels, interactionTypes } from "@/models/interactionLog";
import { Friend } from "@/models/friend";
import { getFriend } from "@/repositories/friendRepository";
import { logInteraction } from "@/services/interactionLogService";
import { colors } from "@/theme/colors";
import { isoToday } from "@/utils/dateUtils";

export default function LogInteractionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [friend, setFriend] = useState<Friend | null>(null);
  const [interactionType, setInteractionType] = useState<InteractionType>("texted");
  const [date, setDate] = useState(isoToday().slice(0, 10));
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!id) return;
    getFriend(id).then((loaded) => {
      setFriend(loaded);
      if (loaded) setInteractionType(loaded.preferredInteractionType);
    });
  }, [id]);

  async function save() {
    if (!friend) return;
    const isoDate = new Date(`${date}T12:00:00`).toISOString();
    await logInteraction({ friendId: friend.id, interactionType, date: isoDate, notes });
    router.replace(`/friends/${friend.id}`);
  }

  return (
    <Screen>
      <Text style={styles.title}>Log Interaction</Text>
      {friend && <Text style={styles.meta}>{friend.name}</Text>}

      <Text style={styles.label}>Interaction type</Text>
      <View style={styles.segmentRow}>
        {interactionTypes.map((type) => (
          <Text key={type} onPress={() => setInteractionType(type)} style={[styles.segment, interactionType === type && styles.segmentActive]}>
            {interactionTypeLabels[type]}
          </Text>
        ))}
      </View>

      <Text style={styles.label}>Date</Text>
      <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" />

      <Text style={styles.label}>Notes</Text>
      <TextInput style={[styles.input, styles.textArea]} value={notes} onChangeText={setNotes} multiline placeholder="Optional note" />

      <PrimaryButton onPress={save} disabled={!friend}>Save Interaction</PrimaryButton>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 28, fontWeight: "900" },
  meta: { color: colors.muted, fontSize: 16 },
  label: { color: colors.text, fontWeight: "800" },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 8, minHeight: 46, paddingHorizontal: 12, fontSize: 16 },
  textArea: { minHeight: 100, paddingTop: 12, textAlignVertical: "top" },
  segmentRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  segment: { overflow: "hidden", borderRadius: 8, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: colors.surface, color: colors.text, fontWeight: "700" },
  segmentActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft, color: colors.primary }
});
