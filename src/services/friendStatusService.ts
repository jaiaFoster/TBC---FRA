import { Friend } from "@/models/friend";
import { FriendStatus } from "@/models/friendStatus";
import { daysBetween, reminderDateFromLastContact, addDays } from "@/utils/dateUtils";

export function calculateFriendStatus(friend: Pick<Friend, "lastContactedAt" | "cadenceDays">, today = new Date()): FriendStatus {
  if (!friend.lastContactedAt) return "neverContacted";
  const days = daysBetween(friend.lastContactedAt, today);
  if (days > friend.cadenceDays) return "overdue";
  if (days >= Math.ceil(friend.cadenceDays * 0.8)) return "dueSoon";
  return "good";
}

export function getDueDate(friend: Pick<Friend, "lastContactedAt" | "cadenceDays">): Date | null {
  return reminderDateFromLastContact(friend.lastContactedAt, friend.cadenceDays);
}

export function getBeforeDueDate(friend: Pick<Friend, "lastContactedAt" | "cadenceDays">, daysBeforeDue: number): Date | null {
  const due = getDueDate(friend);
  if (!due) return null;
  const beforeDue = addDays(due, -Math.max(0, daysBeforeDue));
  beforeDue.setHours(9, 0, 0, 0);
  return beforeDue;
}

export function groupFriendsByStatus(friends: Friend[]): Record<FriendStatus, Friend[]> {
  return friends.reduce<Record<FriendStatus, Friend[]>>(
    (groups, friend) => {
      groups[calculateFriendStatus(friend)].push(friend);
      return groups;
    },
    { good: [], dueSoon: [], overdue: [], neverContacted: [] }
  );
}
