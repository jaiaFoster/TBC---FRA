import * as Notifications from "expo-notifications";
import { debugLogger } from "@/debug/debugLogger";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false
  })
});

export const notificationIds = {
  friendOverdue: (friendId: string) => `friendReminder.friend.${friendId}.overdue`,
  friendBeforeDue: (friendId: string) => `friendReminder.friend.${friendId}.beforeDue`,
  dailySummary: "friendReminder.dailySummary",
  debugTest: "friendReminder.debug.test"
};

export async function getPermissionStatus(): Promise<Notifications.PermissionStatus> {
  const permissions = await Notifications.getPermissionsAsync();
  return permissions.status;
}

export async function requestNotificationPermission(): Promise<Notifications.PermissionStatus> {
  const permissions = await Notifications.requestPermissionsAsync();
  debugLogger.info("notifications", "Permission requested", permissions);
  return permissions.status;
}

export async function scheduleNotification(identifier: string, title: string, body: string, date: Date): Promise<void> {
  await cancelNotification(identifier);
  if (date.getTime() <= Date.now()) {
    debugLogger.info("notifications", "Skipping past notification", { identifier, date });
    return;
  }
  debugLogger.info("notifications", "Scheduling notification", { identifier, date });
  await Notifications.scheduleNotificationAsync({
    identifier,
    content: { title, body },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date }
  });
}

export async function cancelNotification(identifier: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch (error) {
    debugLogger.warn("notifications", "Cancel notification failed", { identifier, error });
  }
}

export async function scheduleDebugNotification(): Promise<void> {
  await scheduleNotification(
    notificationIds.debugTest,
    "Friend Reminder test",
    "Debug notification scheduled 10 seconds ago.",
    new Date(Date.now() + 10000)
  );
}

export async function getPendingNotifications() {
  const pending = await Notifications.getAllScheduledNotificationsAsync();
  debugLogger.info("notifications", "Pending notifications", pending);
  return pending;
}
