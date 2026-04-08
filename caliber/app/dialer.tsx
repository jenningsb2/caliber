import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const KEYS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["*", "0", "#"],
];

const SUB: Record<string, string> = {
  "2": "ABC", "3": "DEF", "4": "GHI", "5": "JKL",
  "6": "MNO", "7": "PQRS", "8": "TUV", "9": "WXYZ",
  "0": "+", "1": "", "*": "", "#": "",
};

export default function DialerScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [number, setNumber] = useState("");
  const [cursorOn, setCursorOn] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setCursorOn((v) => !v), 500);
    return () => clearInterval(id);
  }, []);

  function handleKey(key: string) {
    setNumber((prev) => (prev.length < 15 ? prev + key : prev));
  }

  function handleDelete() {
    setNumber((prev) => prev.slice(0, -1));
  }

  function handleCall() {
    if (number.length === 0) return;
    // In production this would open tel: link
    // Linking.openURL(`tel:${number}`);
  }

  // Format number for display: (555) 123-4567
  function formatDisplay(n: string) {
    if (n.length === 0) return "";
    const digits = n.replace(/\D/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    return n;
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "",
          headerLargeTitle: false,
          presentation: "modal",
        }}
      />
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button icon="chevron.down" onPress={() => router.back()} />
      </Stack.Toolbar>

      <View style={{ flex: 1, backgroundColor: "#fff", paddingHorizontal: 32, paddingBottom: insets.bottom + 24 }}>
        {/* Number display */}
        <View style={{ flex: 1, alignItems: "center", justifyContent: "flex-end", paddingBottom: 32, width: "100%" }}>
          <Text
            numberOfLines={1}
            style={{
              fontSize: 28,
              fontWeight: "500",
              color: "#1A1A1A",
              letterSpacing: 2,
              fontVariant: ["tabular-nums"],
              maxWidth: "100%",
            }}
          >
            {formatDisplay(number)}
            <Text style={{ color: cursorOn ? "#1A1A1A" : "transparent", fontWeight: "200" }}>|</Text>
          </Text>
        </View>

        {/* Keypad */}
        <View style={{ gap: 12 }}>
          {KEYS.map((row, r) => (
            <View key={r} style={{ flexDirection: "row", justifyContent: "center", gap: 20 }}>
              {row.map((key) => (
                <TouchableOpacity
                  key={key}
                  onPress={() => handleKey(key)}
                  activeOpacity={0.6}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: "#F0F0F0",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                  }}
                >
                  <Text style={{ fontSize: 28, fontWeight: "400", color: "#1A1A1A", lineHeight: 32, marginTop: key === "*" ? 8 : 0 }}>
                    {key}
                  </Text>
                  {SUB[key] ? (
                    <Text style={{ fontSize: 10, fontWeight: "600", color: "#8E8E8E", letterSpacing: 1 }}>
                      {SUB[key]}
                    </Text>
                  ) : null}
                </TouchableOpacity>
              ))}
            </View>
          ))}

          {/* Bottom row: spacer, call, delete */}
          <View style={{ flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 20 }}>
            <View style={{ width: 80 }} />
            <TouchableOpacity
              onPress={handleCall}
              activeOpacity={0.8}
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: number.length > 0 ? "#2A6B3C" : "#C0C0C0",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="call" size={30} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDelete}
              onLongPress={() => setNumber("")}
              activeOpacity={0.6}
              style={{ width: 80, height: 80, alignItems: "center", justifyContent: "center" }}
            >
              {number.length > 0 && (
                <Ionicons name="backspace-outline" size={26} color="#8E8E8E" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );
}
