import AsyncStorage from "@react-native-async-storage/async-storage";
import { debugLogger } from "@/debug/debugLogger";

const SETTINGS_KEY = "friendReminder.settings.v1";

export type AppSettings = {
  notificationsEnabled: boolean;
  notifyBeforeDue: boolean;
  daysBeforeDue: number;
  dailySummaryEnabled: boolean;
  dailySummaryHour: number;
  defaultCadenceDays: number;
};

export const defaultSettings: AppSettings = {
  notificationsEnabled: false,
  notifyBeforeDue: true,
  daysBeforeDue: 2,
  dailySummaryEnabled: false,
  dailySummaryHour: 9,
  defaultCadenceDays: 14
};

export async function getSettings(): Promise<AppSettings> {
  const raw = await AsyncStorage.getItem(SETTINGS_KEY);
  if (!raw) return defaultSettings;
  return { ...defaultSettings, ...JSON.parse(raw) };
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  debugLogger.info("settingsRepository", "Saving settings", settings);
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export async function clearSettings(): Promise<void> {
  await AsyncStorage.removeItem(SETTINGS_KEY);
}
