import { getFriend, updateLastContactedAt } from "@/repositories/friendRepository";
import {
  createInteractionLog,
  deleteInteractionLog,
  getMostRecentLogDate,
  InteractionLogInput
} from "@/repositories/interactionLogRepository";
import { syncInteractionDeleted, syncInteractionLogged } from "./backendSyncService";
import { rescheduleFriendReminders } from "./reminderScheduler";

export async function logInteraction(input: InteractionLogInput) {
  const log = await createInteractionLog(input);
  const friend = await getFriend(input.friendId);
  if (friend) {
    if (!friend.lastContactedAt || new Date(log.date) > new Date(friend.lastContactedAt)) {
      friend.lastContactedAt = log.date;
      await updateLastContactedAt(friend.id, log.date);
    }
    await rescheduleFriendReminders({ ...friend, lastContactedAt: friend.lastContactedAt });
  }
  syncInteractionLogged(input.friendId, log);
  return log;
}

export async function deleteInteractionAndRecalculate(friendId: string, logId: string): Promise<void> {
  await deleteInteractionLog(logId);
  syncInteractionDeleted(logId, friendId);
  const latestDate = await getMostRecentLogDate(friendId);
  await updateLastContactedAt(friendId, latestDate);
  const friend = await getFriend(friendId);
  if (friend) await rescheduleFriendReminders({ ...friend, lastContactedAt: latestDate });
}
