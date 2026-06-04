import { Link, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Platform, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { PrimaryButton } from "@/components/PrimaryButton";
import { Screen } from "@/components/Screen";
import { AppSettings, getSettings, saveSettings } from "@/repositories/settingsRepository";
import { clearAllLocalData, seedDebugData } from "@/debug/debugSeedService";
import { getPendingNotifications, getPermissionStatus, requestNotificationPermission, scheduleDebugNotification } from "@/services/notificationService";
import { getApiBaseUrl, registerDevice, sendTestEvent, testBackendHealth } from "@/services/backendSyncService";
import { getAnonymousDeviceId } from "@/services/deviceIdentityService";
import { rescheduleAllFriendReminders } from "@/services/reminderScheduler";
import { colors } from "@/theme/colors";

export default function SettingsScreen() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [permission, setPermission] = useState<string>("unknown");

  const load = useCallback(async () => {
    setSettings(await getSettings());
    setPermission(await getPermissionStatus());
  }, []);
  useFocusEffect(useCallback(() => void load(), [load]));

  async function patch(next: Partial<AppSettings>) {
    if (!settings) return;
    const updated = { ...settings, ...next };
    setSettings(updated);
    await saveSettings(updated);
    await rescheduleAllFriendReminders();
  }

  async function askPermission() {
    setPermission(await requestNotificationPermission());
  }

  if (!settings) return <Screen><Text>Loading settings...</Text></Screen>;

  return (
    <Screen>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <Text style={styles.meta}>Permission: {permission}</Text>
        <PrimaryButton onPress={askPermission}>Request Permission</PrimaryButton>
        <SettingSwitch label="Enable reminders" value={settings.notificationsEnabled} onValueChange={(value) => patch({ notificationsEnabled: value })} />
        <SettingSwitch label="Notify before due" value={settings.notifyBeforeDue} onValueChange={(value) => patch({ notifyBeforeDue: value })} />
        <NumberSetting label="Days before due" value={settings.daysBeforeDue} onChange={(value) => patch({ daysBeforeDue: value })} />
        <SettingSwitch label="Daily summary" value={settings.dailySummaryEnabled} onValueChange={(value) => patch({ dailySummaryEnabled: value })} />
        <NumberSetting label="Daily summary hour" value={settings.dailySummaryHour} onChange={(value) => patch({ dailySummaryHour: value })} />
        <NumberSetting label="Default cadence" value={settings.defaultCadenceDays} onChange={(value) => patch({ defaultCadenceDays: value })} />
      </View>

      <Link href="/privacy" style={styles.privacyLink}>Privacy details</Link>

      {__DEV__ && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Development Debug</Text>
          <PrimaryButton tone="secondary" onPress={async () => {
            const result = await testBackendHealth();
            Alert.alert(result.ok ? "Backend healthy" : "Backend unavailable", result.ok ? "Health check succeeded." : result.error ?? "Health check failed.");
          }}>Test Backend Health</PrimaryButton>
          <PrimaryButton tone="secondary" onPress={async () => {
            const result = await registerDevice();
            Alert.alert(result.ok ? "Device registered" : "Register failed", result.ok ? "Anonymous device sent to backend." : result.error ?? "Register failed.");
          }}>Register Device</PrimaryButton>
          <PrimaryButton tone="secondary" onPress={async () => {
            const result = await sendTestEvent();
            Alert.alert(result.ok ? "Event sent" : "Event failed", result.ok ? "Debug event sent to backend." : result.error ?? "Event failed.");
          }}>Send Test Event</PrimaryButton>
          <PrimaryButton tone="secondary" onPress={() => Alert.alert("API base URL", getApiBaseUrl())}>Show API Base URL</PrimaryButton>
          <PrimaryButton tone="secondary" onPress={async () => Alert.alert("Anonymous Device ID", await getAnonymousDeviceId())}>Show Device ID</PrimaryButton>
          <PrimaryButton tone="secondary" onPress={async () => { await seedDebugData(); Alert.alert("Seeded", "Sample friends and logs were created."); }}>Seed Sample Data</PrimaryButton>
          <PrimaryButton tone="secondary" onPress={async () => { await scheduleDebugNotification(); Alert.alert("Scheduled", "Debug notification will fire in about 10 seconds."); }}>Schedule Debug Notification</PrimaryButton>
          <PrimaryButton tone="secondary" onPress={async () => { const pending = await getPendingNotifications(); Alert.alert("Pending notifications", `${pending.length} scheduled. Details are in the console.`); }}>Log Pending Notifications</PrimaryButton>
          <PrimaryButton tone="danger" onPress={async () => { await clearAllLocalData(); await load(); Alert.alert("Cleared", "Local friends, logs, and settings were reset."); }}>Clear Local Data</PrimaryButton>
          <Text style={styles.meta}>Debug tools are visible only in development. Platform: {Platform.OS}</Text>
        </View>
      )}
    </Screen>
  );
}

function SettingSwitch({ label, value, onValueChange }: { label: string; value: boolean; onValueChange: (value: boolean) => void }) {
  return (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
}

function NumberSetting({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <View style={styles.numberRow}>
      <Text style={styles.settingLabel}>{label}</Text>
      <TextInput style={styles.numberInput} value={String(value)} onChangeText={(text) => onChange(Math.max(1, Number.parseInt(text, 10) || 1))} keyboardType="number-pad" />
    </View>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 28, fontWeight: "900" },
  card: { backgroundColor: colors.surface, borderRadius: 8, borderWidth: 1, borderColor: colors.border, padding: 16, gap: 12 },
  sectionTitle: { color: colors.text, fontSize: 19, fontWeight: "900" },
  meta: { color: colors.muted, lineHeight: 20 },
  privacyLink: { color: colors.primary, fontWeight: "800", fontSize: 16 },
  settingRow: { minHeight: 44, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  settingLabel: { color: colors.text, fontSize: 16, fontWeight: "700" },
  numberRow: { gap: 6 },
  numberInput: { backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1, borderRadius: 8, minHeight: 44, paddingHorizontal: 12, fontSize: 16 }
});
