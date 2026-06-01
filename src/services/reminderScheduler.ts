import { Friend } from "@/models/friend";
import { getSettings } from "@/repositories/settingsRepository";
import { getBeforeDueDate, getDueDate } from "./friendStatusService";
import { cancelNotification, notificationIds, scheduleNotification } from "./notificationService";
import { listFriends } from "@/repositories/friendRepository";

export async function cancelFriendReminders(friendId: string): Promise<void> {
  await cancelNotification(notificationIds.friendOverdue(friendId));
  await cancelNotification(notificationIds.friendBeforeDue(friendId));
}

export async function rescheduleFriendReminders(friend: Friend): Promise<void> {
  await cancelFriendReminders(friend.id);
  const settings = await getSettings();
  if (!settings.notificationsEnabled || friend.isArchived || !friend.lastContactedAt) return;

  const dueDate = getDueDate(friend);
  if (dueDate) {
    await scheduleNotification(
      notificationIds.friendOverdue(friend.id),
      `${friend.name} is due for a check-in`,
      `Your ${friend.cadenceDays}-day cadence is up.`,
      dueDate
    );
  }

  if (settings.notifyBeforeDue) {
    const beforeDate = getBeforeDueDate(friend, settings.daysBeforeDue);
    if (beforeDate) {
      await scheduleNotification(
        notificationIds.friendBeforeDue(friend.id),
        `${friend.name} is coming due soon`,
        `A quick hello now keeps the relationship warm.`,
        beforeDate
      );
    }
  }
}

export async function rescheduleAllFriendReminders(): Promise<void> {
  const friends = await listFriends(false);
  await Promise.all(friends.map(rescheduleFriendReminders));
}
