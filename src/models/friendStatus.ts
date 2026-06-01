export type FriendStatus = "good" | "dueSoon" | "overdue" | "neverContacted";

export const statusLabels: Record<FriendStatus, string> = {
  good: "Good",
  dueSoon: "Due soon",
  overdue: "Overdue",
  neverContacted: "Never contacted"
};
