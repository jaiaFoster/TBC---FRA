import { useState } from "react";
import { StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { InteractionType, interactionTypeLabels, interactionTypes } from "@/models/interactionLog";
import { Friend } from "@/models/friend";
import { colors } from "@/theme/colors";
import { PrimaryButton } from "./PrimaryButton";

export type FriendFormValues = {
  name: string;
  notes: string;
  cadenceDays: number;
  preferredInteractionType: InteractionType;
  setLastContactedToday?: boolean;
};

export function FriendForm({
  initialFriend,
  defaultCadenceDays,
  showTodayToggle,
  onSubmit
}: {
  initialFriend?: Friend;
  defaultCadenceDays: number;
  showTodayToggle?: boolean;
  onSubmit: (values: FriendFormValues) => void;
}) {
  const [name, setName] = useState(initialFriend?.name ?? "");
  const [notes, setNotes] = useState(initialFriend?.notes ?? "");
  const [cadenceDays, setCadenceDays] = useState(String(initialFriend?.cadenceDays ?? defaultCadenceDays));
  const [preferredInteractionType, setPreferredInteractionType] = useState<InteractionType>(initialFriend?.preferredInteractionType ?? "texted");
  const [setLastContactedToday, setSetLastContactedToday] = useState(false);

  const parsedCadence = Math.max(1, Number.parseInt(cadenceDays, 10) || defaultCadenceDays);

  return (
    <View style={styles.form}>
      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Friend name" autoCapitalize="words" />

      <Text style={styles.label}>Cadence days</Text>
      <TextInput style={styles.input} value={cadenceDays} onChangeText={setCadenceDays} keyboardType="number-pad" />

      <Text style={styles.label}>Preferred interaction</Text>
      <View style={styles.segmentRow}>
        {interactionTypes.map((type) => (
          <Text
            key={type}
            onPress={() => setPreferredInteractionType(type)}
            style={[styles.segment, preferredInteractionType === type && styles.segmentActive]}
          >
            {interactionTypeLabels[type]}
          </Text>
        ))}
      </View>

      <Text style={styles.label}>Notes</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={notes}
        onChangeText={setNotes}
        placeholder="What should future you remember?"
        multiline
      />

      {showTodayToggle && (
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Set last contacted to today</Text>
          <Switch value={setLastContactedToday} onValueChange={setSetLastContactedToday} />
        </View>
      )}

      <PrimaryButton
        disabled={!name.trim()}
        onPress={() => onSubmit({ name, notes, cadenceDays: parsedCadence, preferredInteractionType, setLastContactedToday })}
      >
        Save
      </PrimaryButton>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: 10 },
  label: { color: colors.text, fontWeight: "800" },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 8, minHeight: 46, paddingHorizontal: 12, fontSize: 16 },
  textArea: { minHeight: 100, paddingTop: 12, textAlignVertical: "top" },
  segmentRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  segment: { overflow: "hidden", borderRadius: 8, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: colors.surface, color: colors.text, fontWeight: "700" },
  segmentActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft, color: colors.primary },
  toggleRow: { minHeight: 50, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  toggleLabel: { color: colors.text, fontSize: 16 }
});
