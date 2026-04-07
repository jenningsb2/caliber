import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerLargeTitle: true,
        headerShadowVisible: false,
        headerLargeTitleShadowVisible: false,
        headerBackButtonDisplayMode: "minimal",
        contentStyle: { backgroundColor: "#F0F0F0" },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="interview/[id]" />
      <Stack.Screen name="settings" options={{ presentation: "modal" }} />
      <Stack.Screen name="positions/index" options={{ presentation: "modal" }} />
      <Stack.Screen name="positions/[role]" />
      <Stack.Screen name="positions/new" options={{ presentation: "modal" }} />
    </Stack>
  );
}
