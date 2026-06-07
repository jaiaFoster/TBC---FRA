import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { getDatabase } from "@/db/database";
import { colors } from "@/theme/colors";

export default function RootLayout() {
  const [databaseReady, setDatabaseReady] = useState(false);
  const [databaseError, setDatabaseError] = useState<string | null>(null);

  const prepareDatabase = useCallback(() => {
    setDatabaseError(null);
    void getDatabase()
      .then(() => setDatabaseReady(true))
      .catch((error) => setDatabaseError(error instanceof Error ? error.message : "Local database setup failed."));
  }, []);

  useEffect(() => {
    prepareDatabase();
  }, [prepareDatabase]);

  if (!databaseReady) {
    return (
      <View style={styles.loading}>
        {databaseError ? (
          <>
            <Text style={styles.loadingTitle}>Local database setup failed</Text>
            <Text style={styles.loadingBody}>{databaseError}</Text>
            <Pressable onPress={prepareDatabase} style={styles.retryButton}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </>
        ) : (
          <>
            <ActivityIndicator color={colors.primary} size="large" />
            <Text style={styles.loadingTitle}>Preparing local database...</Text>
          </>
        )}
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
          headerTitleStyle: { fontWeight: "800" },
          contentStyle: { backgroundColor: colors.background }
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14, padding: 24, backgroundColor: colors.background },
  loadingTitle: { color: colors.text, fontSize: 20, fontWeight: "800", textAlign: "center" },
  loadingBody: { color: colors.muted, lineHeight: 21, textAlign: "center" },
  retryButton: { minHeight: 46, minWidth: 120, alignItems: "center", justifyContent: "center", borderRadius: 8, backgroundColor: colors.primary },
  retryText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" }
});
