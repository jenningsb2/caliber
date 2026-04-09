import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BrandProvider } from "../contexts/brand-context";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <BrandProvider>
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
        <Stack.Screen name="dialer" options={{ presentation: "modal" }} />
        <Stack.Screen name="profile" options={{ presentation: "modal" }} />
        <Stack.Screen name="interview/edit" options={{ presentation: "modal" }} />
        <Stack.Screen
          name="chat"
          options={{
            headerShown: false,
            presentation: "modal",
            gestureDirection: "vertical",
          }}
        />
        <Stack.Screen
          name="chat-history"
          options={{
            headerShown: false,
            presentation: "modal",
            gestureDirection: "vertical",
          }}
        />
      </Stack>
    </BrandProvider>
    </GestureHandlerRootView>
  );
}
