import * as SQLite from "expo-sqlite";
import { debugLogger } from "@/debug/debugLogger";
import { runMigrations } from "./migrations";

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync("friend-reminder.db");
    const db = await dbPromise;
    await db.execAsync("PRAGMA foreign_keys = ON;");
    await runMigrations(db);
    debugLogger.info("db", "Database initialized");
  }
  return dbPromise;
}
