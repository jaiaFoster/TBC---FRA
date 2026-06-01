import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text } from "react-native";
import { FriendForm, FriendFormValues } from "@/components/FriendForm";
import { Screen } from "@/components/Screen";
import { Friend } from "@/models/friend";
import { getFriend, updateFriend } from "@/repositories/friendRepository";
import { rescheduleFriendReminders } from "@/services/reminderScheduler";

export default function EditFriendScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [friend, setFriend] = useState<Friend | null>(null);

  useEffect(() => {
    if (id) getFriend(id).then(setFriend);
  }, [id]);

  async function save(values: FriendFormValues) {
    if (!friend) return;
    const updated = {
      ...friend,
      name: values.name,
      notes: values.notes,
      cadenceDays: values.cadenceDays,
      preferredInteractionType: values.preferredInteractionType
    };
    await updateFriend(updated);
    await rescheduleFriendReminders(updated);
    router.replace(`/friends/${friend.id}`);
  }

  return (
    <Screen>
      <Text style={{ fontSize: 28, fontWeight: "900" }}>Edit Friend</Text>
      {friend && <FriendForm initialFriend={friend} defaultCadenceDays={friend.cadenceDays} onSubmit={save} />}
    </Screen>
  );
}
