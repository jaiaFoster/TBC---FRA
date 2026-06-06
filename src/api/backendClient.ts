import { API_BASE_URL } from "@/config/env";
import { Friend } from "@/models/friend";
import { InteractionLog } from "@/models/interactionLog";
import { createId } from "@/utils/id";

export type BackendResult<T = unknown> = {
  ok: boolean;
  data?: T;
  error?: string;
};

function apiUrl(path: string): string {
  const base = API_BASE_URL.replace(/\/+$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

async function request<T>(path: string, options?: RequestInit): Promise<BackendResult<T>> {
  if (!API_BASE_URL) {
    return { ok: false, error: "EXPO_PUBLIC_API_BASE_URL is not configured." };
  }

  try {
    const response = await fetch(apiUrl(path), {
      ...options,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...options?.headers
      }
    });
    const json = (await response.json().catch(() => null)) as BackendResult<T> | null;

    if (!response.ok) {
      return { ok: false, error: json?.error ?? `Backend returned HTTP ${response.status}` };
    }

    return json ?? { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Backend request failed." };
  }
}

function friendPayload(friend: Friend, deviceId: string) {
  return {
    id: friend.id,
    deviceId,
    device_id: deviceId,
    name: friend.name,
    notes: friend.notes,
    cadenceDays: friend.cadenceDays,
    cadence_days: friend.cadenceDays,
    preferredInteractionType: friend.preferredInteractionType,
    preferred_interaction_type: friend.preferredInteractionType,
    lastContactedAt: friend.lastContactedAt,
    last_contacted_at: friend.lastContactedAt,
    isArchived: friend.isArchived,
    is_archived: friend.isArchived,
    createdAt: friend.createdAt,
    created_at: friend.createdAt
  };
}

function interactionPayload(interaction: InteractionLog, deviceId: string) {
  return {
    id: interaction.id,
    deviceId,
    device_id: deviceId,
    friendId: interaction.friendId,
    friend_id: interaction.friendId,
    interactionType: interaction.interactionType,
    interaction_type: interaction.interactionType,
    date: interaction.date,
    notes: interaction.notes,
    createdAt: interaction.createdAt,
    created_at: interaction.createdAt
  };
}

export const backendClient = {
  health() {
    return request("/api/health/");
  },

  upsertDevice(deviceId: string, testerName = "") {
    return request("/api/devices/", {
      method: "POST",
      body: JSON.stringify({ id: deviceId, testerName, tester_name: testerName })
    });
  },

  createFriend(friend: Friend, deviceId: string) {
    return request("/api/friends/", {
      method: "POST",
      body: JSON.stringify(friendPayload(friend, deviceId))
    });
  },

  updateFriend(friend: Friend, deviceId: string) {
    return request(`/api/friends/${encodeURIComponent(friend.id)}/`, {
      method: "PATCH",
      body: JSON.stringify(friendPayload(friend, deviceId))
    });
  },

  createInteraction(friendId: string, interaction: InteractionLog, deviceId: string) {
    return request(`/api/friends/${encodeURIComponent(friendId)}/interactions/`, {
      method: "POST",
      body: JSON.stringify(interactionPayload(interaction, deviceId))
    });
  },

  deleteInteraction(interactionId: string, deviceId: string) {
    return request(`/api/interactions/${encodeURIComponent(interactionId)}/?deviceId=${encodeURIComponent(deviceId)}`, {
      method: "DELETE"
    });
  },

  trackEvent(deviceId: string, eventName: string, eventPayload: Record<string, unknown> = {}) {
    return request("/api/events/", {
      method: "POST",
      body: JSON.stringify({
        id: createId("event"),
        deviceId,
        device_id: deviceId,
        eventName,
        event_name: eventName,
        eventPayload,
        event_payload: eventPayload,
        appVersion: "0.1.0",
        app_version: "0.1.0"
      })
    });
  }
};
