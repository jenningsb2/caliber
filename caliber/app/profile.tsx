import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useRef, useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Field = { icon: keyof typeof Ionicons.glyphMap; label: string; placeholder: string };

const FIELDS: Field[] = [
  { icon: "person-outline", label: "Full name", placeholder: "e.g. Jordan Smith" },
  { icon: "briefcase-outline", label: "Job title", placeholder: "e.g. Hiring Manager" },
  { icon: "business-outline", label: "Company", placeholder: "e.g. Potbelly Sandwich Shop" },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");

  const values = [name, title, company];
  const setters = [setName, setTitle, setCompany];
  const ref0 = useRef<TextInput>(null);
  const ref1 = useRef<TextInput>(null);
  const ref2 = useRef<TextInput>(null);
  const refs = [ref0, ref1, ref2];

  const [avatarPressed, setAvatarPressed] = useState(false);
  const hasChanges = name.trim() || title.trim() || company.trim();

  return (
    <>
      <Stack.Screen
        options={{
          title: "Profile",
          headerLargeTitle: false,
          presentation: "modal",
        }}
      />

      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button onPress={() => router.back()}>Cancel</Stack.Toolbar.Button>
      </Stack.Toolbar>

      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          onPress={() => {
            // Save logic goes here
            router.back();
          }}
          style={hasChanges ? {} : { opacity: 0.4 }}
        >
          Save
        </Stack.Toolbar.Button>
      </Stack.Toolbar>

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, gap: 24, paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar placeholder */}
        <View style={{ alignItems: "center", paddingVertical: 8, gap: 12 }}>
            <TouchableOpacity
            activeOpacity={1}
            onPressIn={() => setAvatarPressed(true)}
            onPressOut={() => setAvatarPressed(false)}
          >
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: "#E8EFE9",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {avatarPressed ? (
                <Ionicons name="pencil" size={28} color="#2A6B3C" />
              ) : name.trim() ? (
                <Text style={{ fontSize: 28, fontWeight: "600", color: "#2A6B3C" }}>
                  {name.trim().charAt(0).toUpperCase()}
                </Text>
              ) : (
                <Ionicons name="person" size={32} color="#2A6B3C" />
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Fields */}
        <View style={{ backgroundColor: "#fff", borderRadius: 14, borderCurve: "continuous", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          {FIELDS.map((field, i) => (
            <View key={field.label}>
              {i > 0 && (
                <View style={{ height: 0.5, backgroundColor: "rgba(0,0,0,0.08)", marginLeft: 48 }} />
              )}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14 }}>
                <Ionicons name={field.icon} size={20} color="#8E8E8E" />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={{ fontSize: 12, color: "#8E8E8E", fontWeight: "500" }}>{field.label}</Text>
                  <TextInput
                    ref={refs[i]}
                    value={values[i]}
                    onChangeText={setters[i]}
                    placeholder={field.placeholder}
                    placeholderTextColor="#C0C0C0"
                    returnKeyType={i < FIELDS.length - 1 ? "next" : "done"}
                    onSubmitEditing={() => refs[i + 1]?.current?.focus()}
                    style={{ fontSize: 16, color: "#1A1A1A", padding: 0 }}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </>
  );
}
