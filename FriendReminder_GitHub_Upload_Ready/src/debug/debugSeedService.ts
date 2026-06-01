import { clearFriends, createFriend } from "@/repositories/friendRepository";
import { clearSettings, saveSettings, defaultSettings } from "@/repositories/settingsRepository";
import { logInteraction } from "@/services/interactionLogService";
import { addDays, isoNow, startOfLocalDay } from "@/utils/dateUtils";

function dayOffset(days: number): string {
  return addDays(startOfLocalDay(), days).toISOString();
}

export async function seedDebugData(): Promise<void> {
  await clearFriends();

  const recent = await createFriend({
    name: "Maya Chen",
    notes: "College friend. Ask about ceramics class.",
    cadenceDays: 14,
    preferredInteractionType: "texted"
  });
  await logInteraction({ friendId: recent.id, interactionType: "texted", date: dayOffset(-2), notes: "Sent a quick voice memo." });

  const dueSoon = await createFriend({
    name: "Jordan Lee",
    notes: "Prefers calls on Sunday afternoons.",
    cadenceDays: 14,
    preferredInteractionType: "called"
  });
  await logInteraction({ friendId: dueSoon.id, interactionType: "called", date: dayOffset(-12), notes: "Caught up after work." });

  const overdue = await createFriend({
    name: "Priya Patel",
    notes: "Ask about the new job.",
    cadenceDays: 10,
    preferredInteractionType: "hungOut"
  });
  await logInteraction({ friendId: overdue.id, interactionType: "hungOut", date: dayOffset(-16), notes: "Coffee downtown." });

  await createFriend({
    name: "Sam Rivera",
    notes: "Met at the founder meetup.",
    cadenceDays: 21,
    preferredInteractionType: "other",
    lastContactedAt: null
  });
}

export async function clearAllLocalData(): Promise<void> {
  await clearFriends();
  await clearSettings();
  await saveSettings(defaultSettings);
}

export const debugSeedCreatedAt = isoNow;
