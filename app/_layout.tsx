import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { getDatabase } from "@/db/database";
import { colors } from "@/theme/colors";

export default function RootLayout() {
  useEffect(() => {
    getDatabase().catch((error) => console.error("Database startup failed", error));
  }, []);

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
