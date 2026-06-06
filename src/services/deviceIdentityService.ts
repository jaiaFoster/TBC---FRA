import AsyncStorage from "@react-native-async-storage/async-storage";
import { debugLogger } from "@/debug/debugLogger";

const DEVICE_ID_KEY = "friendReminder.anonymousDeviceId.v1";

function randomHex(length: number): string {
  let value = "";
  for (let index = 0; index < length; index += 1) {
    value += Math.floor(Math.random() * 16).toString(16);
  }
  return value;
}

function createUuid(): string {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi && "randomUUID" in cryptoApi && typeof cryptoApi.randomUUID === "function") {
    return cryptoApi.randomUUID();
  }

  return `${randomHex(8)}-${randomHex(4)}-4${randomHex(3)}-${(8 + Math.floor(Math.random() * 4)).toString(16)}${randomHex(3)}-${randomHex(12)}`;
}

export async function getAnonymousDeviceId(): Promise<string> {
  const existing = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;

  const deviceId = createUuid();
  await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
  debugLogger.info("deviceIdentity", "Created anonymous device ID", { deviceId });
  return deviceId;
}

export async function clearAnonymousDeviceId(): Promise<void> {
  await AsyncStorage.removeItem(DEVICE_ID_KEY);
}
