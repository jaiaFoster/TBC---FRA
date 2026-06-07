import { useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import {
  ImportableContact,
  importSelectedContacts,
  requestContactsAndLoadNames
} from "@/services/contactImportService";
import { colors } from "@/theme/colors";

export default function ImportContactsScreen() {
  const router = useRouter();
  const [contacts, setContacts] = useState<ImportableContact[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("Only contacts you select will be added. Phone numbers and email addresses are not read or uploaded.");
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return contacts.filter((contact) => !query || contact.name.toLocaleLowerCase().includes(query));
  }, [contacts, search]);

  async function loadContacts() {
    setLoading(true);
    try {
      const result = await requestContactsAndLoadNames();
      if (!result.granted) {
        setMessage(result.reason);
        return;
      }
      setContacts(result.contacts);
      setMessage(`${result.contacts.length} named contacts available. Select only the people you want to add.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Contacts could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  function toggleContact(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function importContacts() {
    const selected = contacts.filter((contact) => selectedIds.has(contact.id));
    setLoading(true);
    try {
      const result = await importSelectedContacts(selected);
      Alert.alert(
        "Contacts import complete",
        `Created ${result.createdCount} friend${result.createdCount === 1 ? "" : "s"}. Skipped ${result.skippedDuplicateCount} duplicate${result.skippedDuplicateCount === 1 ? "" : "s"}.`,
        [{ text: "Done", onPress: () => router.replace("/friends") }]
      );
    } catch (error) {
      Alert.alert("Import failed", error instanceof Error ? error.message : "Selected contacts could not be imported.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Text style={styles.title}>Import from Contacts</Text>
      <Text style={styles.message}>{message}</Text>
      {contacts.length === 0 ? (
        <PrimaryButton onPress={loadContacts} disabled={loading}>{loading ? "Loading Contacts..." : "Choose Contacts"}</PrimaryButton>
      ) : (
        <>
          <TextInput style={styles.input} value={search} onChangeText={setSearch} placeholder="Search contacts" />
          <Text style={styles.selected}>{selectedIds.size} selected</Text>
          <View style={styles.list}>
            {filtered.map((contact) => {
              const selected = selectedIds.has(contact.id);
              return (
                <Pressable key={contact.id} onPress={() => toggleContact(contact.id)} style={[styles.row, selected && styles.rowSelected]}>
                  <View style={[styles.checkbox, selected && styles.checkboxSelected]} />
                  <Text style={styles.name}>{contact.name}</Text>
                </Pressable>
              );
            })}
          </View>
          <PrimaryButton onPress={importContacts} disabled={loading || selectedIds.size === 0}>
            {loading ? "Importing..." : `Import ${selectedIds.size} Selected`}
          </PrimaryButton>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 28, fontWeight: "900" },
  message: { color: colors.muted, lineHeight: 21 },
  input: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 8, minHeight: 46, paddingHorizontal: 12, fontSize: 16 },
  selected: { color: colors.primary, fontWeight: "800" },
  list: { gap: 8 },
  row: { minHeight: 48, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 8, backgroundColor: colors.surface },
  rowSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  checkbox: { width: 20, height: 20, borderWidth: 2, borderColor: colors.border, borderRadius: 4, backgroundColor: colors.surface },
  checkboxSelected: { borderColor: colors.primary, backgroundColor: colors.primary },
  name: { flex: 1, color: colors.text, fontSize: 16, fontWeight: "700" }
});
