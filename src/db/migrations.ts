import type { SQLiteDatabase } from "expo-sqlite";

export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS friends (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      notes TEXT NOT NULL DEFAULT '',
      createdAt TEXT NOT NULL,
      lastContactedAt TEXT,
      cadenceDays INTEGER NOT NULL,
      preferredInteractionType TEXT NOT NULL,
      isArchived INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS interaction_logs (
      id TEXT PRIMARY KEY NOT NULL,
      friendId TEXT NOT NULL,
      interactionType TEXT NOT NULL,
      date TEXT NOT NULL,
      notes TEXT NOT NULL DEFAULT '',
      createdAt TEXT NOT NULL,
      FOREIGN KEY(friendId) REFERENCES friends(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_interaction_logs_friend_date
      ON interaction_logs(friendId, date DESC);
  `);
}
