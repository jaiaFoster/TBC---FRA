import * as SQLite from "expo-sqlite";
import { debugLogger } from "@/debug/debugLogger";
import { runMigrations } from "./migrations";

let initializationPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!initializationPromise) {
    initializationPromise = initializeDatabase().catch((error) => {
      initializationPromise = null;
      debugLogger.error("db", "Database initialization failed", error);
      throw error;
    });
  }
  return initializationPromise;
}

export async function runDatabaseOperation<T>(
  label: string,
  operation: (db: SQLite.SQLiteDatabase) => Promise<T>
): Promise<T> {
  const db = await getDatabase();
  try {
    return await operation(db);
  } catch (error) {
    debugLogger.error("db", `SQLite operation failed: ${label}`, error);
    throw error;
  }
}

async function initializeDatabase(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync("friend-reminder.db");
  await db.execAsync("PRAGMA foreign_keys = ON;");
  await runMigrations(db);

  const tables = await db.getAllAsync<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name IN ('friends', 'interaction_logs') ORDER BY name"
  );
  if (tables.length !== 2) {
    throw new Error(`Local database migration incomplete. Found tables: ${tables.map((table) => table.name).join(", ") || "none"}`);
  }

  debugLogger.info("db", "Database initialized", { tables: tables.map((table) => table.name) });
  return db;
}
