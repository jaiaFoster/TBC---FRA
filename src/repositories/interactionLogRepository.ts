import { getDatabase } from "@/db/database";
import { debugLogger } from "@/debug/debugLogger";
import { InteractionLog, InteractionType } from "@/models/interactionLog";
import { isoNow } from "@/utils/dateUtils";
import { createId } from "@/utils/id";

export type InteractionLogInput = {
  friendId: string;
  interactionType: InteractionType;
  date: string;
  notes: string;
};

export async function listLogsForFriend(friendId: string): Promise<InteractionLog[]> {
  const db = await getDatabase();
  return db.getAllAsync<InteractionLog>(
    "SELECT * FROM interaction_logs WHERE friendId = ? ORDER BY date DESC, createdAt DESC",
    friendId
  );
}

export async function createInteractionLog(input: InteractionLogInput): Promise<InteractionLog> {
  const db = await getDatabase();
  const log: InteractionLog = {
    id: createId("log"),
    friendId: input.friendId,
    interactionType: input.interactionType,
    date: input.date,
    notes: input.notes.trim(),
    createdAt: isoNow()
  };
  debugLogger.info("interactionLogRepository", "Creating interaction log", log);
  await db.runAsync(
    `INSERT INTO interaction_logs (id, friendId, interactionType, date, notes, createdAt)
     VALUES (?, ?, ?, ?, ?, ?)`,
    log.id,
    log.friendId,
    log.interactionType,
    log.date,
    log.notes,
    log.createdAt
  );
  return log;
}

export async function deleteInteractionLog(id: string): Promise<void> {
  const db = await getDatabase();
  debugLogger.info("interactionLogRepository", "Deleting interaction log", { id });
  await db.runAsync("DELETE FROM interaction_logs WHERE id = ?", id);
}

export async function getMostRecentLogDate(friendId: string): Promise<string | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ date: string }>(
    "SELECT date FROM interaction_logs WHERE friendId = ? ORDER BY date DESC LIMIT 1",
    friendId
  );
  return row?.date ?? null;
}
