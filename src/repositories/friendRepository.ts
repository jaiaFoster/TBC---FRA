import { getDatabase, runDatabaseOperation } from "@/db/database";
import { debugLogger } from "@/debug/debugLogger";
import { Friend, FriendInput } from "@/models/friend";
import { createId } from "@/utils/id";
import { isoNow } from "@/utils/dateUtils";

type FriendRow = Omit<Friend, "isArchived"> & { isArchived: number };

function mapFriend(row: FriendRow): Friend {
  return { ...row, isArchived: row.isArchived === 1 };
}

export async function listFriends(includeArchived = false): Promise<Friend[]> {
  return runDatabaseOperation("list friends", async (db) => {
    const rows = await db.getAllAsync<FriendRow>(
      `SELECT * FROM friends ${includeArchived ? "" : "WHERE isArchived = 0"} ORDER BY name COLLATE NOCASE ASC`
    );
    return rows.map(mapFriend);
  });
}

export async function getFriend(id: string): Promise<Friend | null> {
  return runDatabaseOperation("get friend", async (db) => {
    const row = await db.getFirstAsync<FriendRow>("SELECT * FROM friends WHERE id = ?", id);
    return row ? mapFriend(row) : null;
  });
}

export async function createFriend(input: FriendInput): Promise<Friend> {
  const friend: Friend = {
    id: createId("friend"),
    name: input.name.trim(),
    notes: input.notes.trim(),
    createdAt: isoNow(),
    lastContactedAt: input.lastContactedAt ?? null,
    cadenceDays: input.cadenceDays,
    preferredInteractionType: input.preferredInteractionType,
    isArchived: false
  };
  debugLogger.info("friendRepository", "Creating friend", friend);
  await runDatabaseOperation("create friend", (db) =>
    db.runAsync(
      `INSERT INTO friends (id, name, notes, createdAt, lastContactedAt, cadenceDays, preferredInteractionType, isArchived)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      friend.id,
      friend.name,
      friend.notes,
      friend.createdAt,
      friend.lastContactedAt,
      friend.cadenceDays,
      friend.preferredInteractionType,
      0
    )
  );
  return friend;
}

export async function updateFriend(friend: Friend): Promise<void> {
  const db = await getDatabase();
  debugLogger.info("friendRepository", "Updating friend", friend);
  await db.runAsync(
    `UPDATE friends
     SET name = ?, notes = ?, lastContactedAt = ?, cadenceDays = ?, preferredInteractionType = ?, isArchived = ?
     WHERE id = ?`,
    friend.name.trim(),
    friend.notes.trim(),
    friend.lastContactedAt,
    friend.cadenceDays,
    friend.preferredInteractionType,
    friend.isArchived ? 1 : 0,
    friend.id
  );
}

export async function archiveFriend(id: string): Promise<void> {
  const db = await getDatabase();
  debugLogger.info("friendRepository", "Archiving friend", { id });
  await db.runAsync("UPDATE friends SET isArchived = 1 WHERE id = ?", id);
}

export async function deleteFriend(id: string): Promise<void> {
  const db = await getDatabase();
  debugLogger.info("friendRepository", "Deleting friend", { id });
  await db.runAsync("DELETE FROM friends WHERE id = ?", id);
}

export async function updateLastContactedAt(friendId: string, date: string | null): Promise<void> {
  const db = await getDatabase();
  debugLogger.info("friendRepository", "Updating lastContactedAt", { friendId, date });
  await db.runAsync("UPDATE friends SET lastContactedAt = ? WHERE id = ?", date, friendId);
}

export async function clearFriends(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync("DELETE FROM interaction_logs");
  await db.runAsync("DELETE FROM friends");
}
