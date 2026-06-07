import { debugLogger } from "@/debug/debugLogger";

type WebState = {
  friends: Array<Record<string, unknown>>;
  interactionLogs: Array<Record<string, unknown>>;
};

const STORAGE_KEY = "friendReminder.webDatabase.v1";

function loadState(): WebState {
  if (typeof window === "undefined") return { friends: [], interactionLogs: [] };
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return { friends: [], interactionLogs: [] };
  return JSON.parse(raw) as WebState;
}

function saveState(state: WebState): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

let state = loadState();

function byName(a: Record<string, unknown>, b: Record<string, unknown>) {
  return String(a.name ?? "").localeCompare(String(b.name ?? ""), undefined, { sensitivity: "base" });
}

function byLogDateNewest(a: Record<string, unknown>, b: Record<string, unknown>) {
  const dateDiff = new Date(String(b.date)).getTime() - new Date(String(a.date)).getTime();
  if (dateDiff !== 0) return dateDiff;
  return new Date(String(b.createdAt)).getTime() - new Date(String(a.createdAt)).getTime();
}

const webDb = {
  async execAsync() {
    debugLogger.info("db", "Web database initialized");
  },

  async getAllAsync<T>(sql: string, ...params: unknown[]): Promise<T[]> {
    if (sql.includes("FROM friends")) {
      const includeArchived = !sql.includes("WHERE isArchived = 0");
      return state.friends
        .filter((friend) => includeArchived || friend.isArchived === 0)
        .sort(byName) as T[];
    }

    if (sql.includes("FROM interaction_logs")) {
      const [friendId] = params;
      return state.interactionLogs
        .filter((log) => log.friendId === friendId)
        .sort(byLogDateNewest) as T[];
    }

    return [];
  },

  async getFirstAsync<T>(sql: string, ...params: unknown[]): Promise<T | null> {
    if (sql.includes("FROM friends")) {
      const [id] = params;
      return (state.friends.find((friend) => friend.id === id) as T | undefined) ?? null;
    }

    if (sql.includes("FROM interaction_logs")) {
      const [friendId] = params;
      const log = state.interactionLogs
        .filter((item) => item.friendId === friendId)
        .sort(byLogDateNewest)[0];
      return log ? ({ date: log.date } as T) : null;
    }

    return null;
  },

  async runAsync(sql: string, ...params: unknown[]): Promise<void> {
    if (sql.startsWith("INSERT INTO friends")) {
      const [id, name, notes, createdAt, lastContactedAt, cadenceDays, preferredInteractionType, isArchived] = params;
      state.friends.push({ id, name, notes, createdAt, lastContactedAt, cadenceDays, preferredInteractionType, isArchived });
    } else if (sql.startsWith("UPDATE friends") && sql.includes("lastContactedAt = ? WHERE id = ?")) {
      const [lastContactedAt, id] = params;
      state.friends = state.friends.map((friend) => (friend.id === id ? { ...friend, lastContactedAt } : friend));
    } else if (sql.startsWith("UPDATE friends SET isArchived")) {
      const [id] = params;
      state.friends = state.friends.map((friend) => (friend.id === id ? { ...friend, isArchived: 1 } : friend));
    } else if (sql.startsWith("UPDATE friends")) {
      const [name, notes, lastContactedAt, cadenceDays, preferredInteractionType, isArchived, id] = params;
      state.friends = state.friends.map((friend) =>
        friend.id === id ? { ...friend, name, notes, lastContactedAt, cadenceDays, preferredInteractionType, isArchived } : friend
      );
    } else if (sql.startsWith("DELETE FROM friends WHERE id")) {
      const [id] = params;
      state.friends = state.friends.filter((friend) => friend.id !== id);
      state.interactionLogs = state.interactionLogs.filter((log) => log.friendId !== id);
    } else if (sql.startsWith("DELETE FROM friends")) {
      state.friends = [];
    } else if (sql.startsWith("INSERT INTO interaction_logs")) {
      const [id, friendId, interactionType, date, notes, createdAt] = params;
      state.interactionLogs.push({ id, friendId, interactionType, date, notes, createdAt });
    } else if (sql.startsWith("DELETE FROM interaction_logs WHERE id")) {
      const [id] = params;
      state.interactionLogs = state.interactionLogs.filter((log) => log.id !== id);
    } else if (sql.startsWith("DELETE FROM interaction_logs")) {
      state.interactionLogs = [];
    }

    saveState(state);
  }
};

export async function getDatabase() {
  return webDb;
}

export async function runDatabaseOperation<T>(label: string, operation: (db: typeof webDb) => Promise<T>): Promise<T> {
  try {
    return await operation(webDb);
  } catch (error) {
    debugLogger.error("db", `Web database operation failed: ${label}`, error);
    throw error;
  }
}
