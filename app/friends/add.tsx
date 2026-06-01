import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text } from "react-native";
import { FriendForm, FriendFormValues } from "@/components/FriendForm";
import { Screen } from "@/components/Screen";
import { createFriend } from "@/repositories/friendRepository";
import { getSettings } from "@/repositories/settingsRepository";
import { logInteraction } from "@/services/interactionLogService";
import { rescheduleFriendReminders } from "@/services/reminderScheduler";
import { isoToday } from "@/utils/dateUtils";

export default function AddFriendScreen() {
  const router = useRouter();
  const [defaultCadenceDays, setDefaultCadenceDays] = useState(14);

  useEffect(() => {
    getSettings().then((settings) => setDefaultCadenceDays(settings.defaultCadenceDays));
  }, []);

  async function save(values: FriendFormValues) {
    const friend = await createFriend({
      name: values.name,
      notes: values.notes,
      cadenceDays: values.cadenceDays,
      preferredInteractionType: values.preferredInteractionType
    });
    if (values.setLastContactedToday) {
      await logInteraction({ friendId: friend.id, interactionType: values.preferredInteractionType, date: isoToday(), notes: "Initial contact." });
    } else {
      await rescheduleFriendReminders(friend);
    }
    router.replace(`/friends/${friend.id}`);
  }

  return (
    <Screen>
      <Text style={{ fontSize: 28, fontWeight: "900" }}>Add Friend</Text>
      <FriendForm defaultCadenceDays={defaultCadenceDays} showTodayToggle onSubmit={save} />
    </Screen>
  );
}
