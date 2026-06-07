import { backendClient, BackendResult } from "@/api/backendClient";
import { API_BASE_URL } from "@/config/env";
import { debugLogger } from "@/debug/debugLogger";
import { Friend } from "@/models/friend";
import { InteractionLog } from "@/models/interactionLog";
import { getAnonymousDeviceId } from "./deviceIdentityService";

async function withDevice<T>(operation: (deviceId: string) => Promise<BackendResult<T>>): Promise<BackendResult<T>> {
  const deviceId = await getAnonymousDeviceId();
  return operation(deviceId);
}

async function bestEffort<T>(label: string, operation: () => Promise<BackendResult<T>>): Promise<BackendResult<T>> {
  try {
    const result = await operation();
    if (!result.ok) {
      debugLogger.warn("backendSync", `${label} failed`, result.error);
    } else {
      debugLogger.info("backendSync", `${label} succeeded`);
    }
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected backend sync failure.";
    debugLogger.warn("backendSync", `${label} failed`, message);
    return { ok: false, error: message };
  }
}

export function syncFriendCreated(friend: Friend): void {
  void bestEffort("friend_created", () => withDevice(async (deviceId) => {
    await backendClient.upsertDevice(deviceId);
    const result = await backendClient.createFriend(friend, deviceId);
    await backendClient.trackEvent(deviceId, "friend_created", { friendId: friend.id });
    return result;
  }));
}

export function syncFriendUpdated(friend: Friend): void {
  void bestEffort("friend_updated", () => withDevice(async (deviceId) => {
    const result = await backendClient.updateFriend(friend, deviceId);
    await backendClient.trackEvent(deviceId, friend.isArchived ? "friend_archived" : "friend_updated", { friendId: friend.id });
    return result;
  }));
}

export function syncInteractionLogged(friendId: string, interaction: InteractionLog): void {
  void bestEffort("interaction_logged", () => withDevice(async (deviceId) => {
    const result = await backendClient.createInteraction(friendId, interaction, deviceId);
    await backendClient.trackEvent(deviceId, "interaction_logged", { friendId, interactionId: interaction.id });
    return result;
  }));
}

export function syncInteractionDeleted(interactionId: string, friendId: string): void {
  void bestEffort("interaction_deleted", () => withDevice(async (deviceId) => {
    const result = await backendClient.deleteInteraction(interactionId, deviceId);
    await backendClient.trackEvent(deviceId, "interaction_deleted", { friendId, interactionId });
    return result;
  }));
}

export function trackEventBestEffort(eventName: string, eventPayload: Record<string, unknown> = {}): void {
  void bestEffort(eventName, () => withDevice((deviceId) => backendClient.trackEvent(deviceId, eventName, eventPayload)));
}

export async function testBackendHealth(): Promise<BackendResult> {
  const result = await bestEffort("backend_health_tested", async () => {
    const health = await backendClient.health();
    const deviceId = await getAnonymousDeviceId();
    await backendClient.trackEvent(deviceId, "backend_health_tested", { ok: health.ok });
    return health;
  });
  return result;
}

export async function registerDevice(testerName = ""): Promise<BackendResult> {
  return bestEffort("register_device", () => withDevice((deviceId) => backendClient.upsertDevice(deviceId, testerName)));
}

export async function sendTestEvent(): Promise<BackendResult> {
  return bestEffort("debug_test_event", () =>
    withDevice((deviceId) => backendClient.trackEvent(deviceId, "debug_test_event", { sentAt: new Date().toISOString() }))
  );
}

export function getApiBaseUrl(): string {
  return API_BASE_URL || "(not configured)";
}
