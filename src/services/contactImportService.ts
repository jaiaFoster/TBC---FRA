import * as Contacts from "expo-contacts";
import { Platform } from "react-native";
import { Friend } from "@/models/friend";
import { createFriend, listFriends } from "@/repositories/friendRepository";
import { getSettings } from "@/repositories/settingsRepository";
import { syncFriendCreated, trackEventBestEffort } from "@/services/backendSyncService";

export type ImportableContact = {
  id: string;
  name: string;
};

export type ContactImportResult = {
  selectedCount: number;
  createdCount: number;
  skippedDuplicateCount: number;
  createdFriends: Friend[];
};

export function normalizeContactName(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

export async function requestContactsAndLoadNames(): Promise<
  { granted: true; contacts: ImportableContact[] } | { granted: false; reason: string }
> {
  if (Platform.OS === "web") {
    return { granted: false, reason: "Contacts import is available in the iPhone or Android app." };
  }

  const permission = await Contacts.requestPermissionsAsync();
  if (permission.status !== Contacts.PermissionStatus.GRANTED) {
    return { granted: false, reason: "Contacts permission was not granted. You can enable it later in device Settings." };
  }

  const response = await Contacts.getContactsAsync({
    fields: [Contacts.Fields.Name],
    sort: Contacts.SortTypes.FirstName
  });
  const contacts = response.data
    .map((contact) => ({ id: contact.id, name: contact.name?.trim() ?? "" }))
    .filter((contact) => contact.name.length > 0);

  return { granted: true, contacts };
}

export async function importSelectedContacts(selectedContacts: ImportableContact[]): Promise<ContactImportResult> {
  const [existingFriends, settings] = await Promise.all([listFriends(true), getSettings()]);
  const knownNames = new Set(existingFriends.map((friend) => normalizeContactName(friend.name)));
  const createdFriends: Friend[] = [];
  let skippedDuplicateCount = 0;

  for (const contact of selectedContacts) {
    const normalizedName = normalizeContactName(contact.name);
    if (!normalizedName || knownNames.has(normalizedName)) {
      skippedDuplicateCount += 1;
      continue;
    }

    const friend = await createFriend({
      name: contact.name,
      notes: "",
      cadenceDays: settings.defaultCadenceDays,
      preferredInteractionType: "texted",
      lastContactedAt: null
    });
    knownNames.add(normalizedName);
    createdFriends.push(friend);
    syncFriendCreated(friend);
  }

  const result = {
    selectedCount: selectedContacts.length,
    createdCount: createdFriends.length,
    skippedDuplicateCount,
    createdFriends
  };
  trackEventBestEffort("contacts_import_completed", {
    selectedCount: result.selectedCount,
    createdCount: result.createdCount,
    skippedDuplicateCount: result.skippedDuplicateCount
  });
  return result;
}
