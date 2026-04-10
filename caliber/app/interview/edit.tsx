import { Ionicons } from "@expo/vector-icons";
import { DatePicker, Host } from "@expo/ui/swift-ui";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ActionSheetIOS, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { INTERVIEW_MAP, ROLE_TEMPLATES, type InterviewType } from "../../constants/mock-data";

const METHODS: { value: InterviewType; label: string }[] = [
  { value: "In-person", label: "In-person" },
  { value: "Phone", label: "Phone" },
  { value: "Video", label: "Video" },
];

function SectionHeader({ title }: { title: string }) {
  return (
    <Text style={{ fontSize: 13, fontWeight: "600", color: "#8E8E8E", textTransform: "uppercase", letterSpacing: 0.5, marginLeft: 4 }}>
      {title}
    </Text>
  );
}

function Separator() {
  return <View style={{ height: 0.5, backgroundColor: "rgba(0,0,0,0.08)", marginLeft: 16 }} />;
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ backgroundColor: "#fff", borderRadius: 14, borderCurve: "continuous", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
      {children}
    </View>
  );
}

export default function EditInterviewScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const interview = INTERVIEW_MAP[id];

  const [name, setName] = useState(interview?.name ?? "");
  const [role, setRole] = useState(interview?.role ?? ROLE_TEMPLATES[0].role);
  const [dateTime, setDateTime] = useState<Date>(() => new Date());
  const [method, setMethod] = useState<InterviewType>(
    interview?.type === "Google Meet" || interview?.type === "Zoom" ? "Video" : (interview?.type ?? "In-person")
  );

  if (!interview) return null;

  return (
    <>
      <Stack.Screen options={{ title: "Edit Interview", headerLargeTitle: false }} />

      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button onPress={() => router.back()}>Cancel</Stack.Toolbar.Button>
      </Stack.Toolbar>

      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button onPress={() => router.back()}>Save</Stack.Toolbar.Button>
      </Stack.Toolbar>

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        automaticallyAdjustKeyboardInsets
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, gap: 24, paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Candidate */}
        <View style={{ gap: 8 }}>
          <SectionHeader title="Candidate" />
          <Card>
            <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14 }}>
              <Text style={{ fontSize: 16, color: "#1A1A1A", width: 80 }}>Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Full name"
                placeholderTextColor="#C0C0C0"
                returnKeyType="done"
                textAlign="right"
                style={{ flex: 1, fontSize: 16, color: "#1A1A1A", padding: 0 }}
              />
            </View>
          </Card>
        </View>

        {/* Interview Details */}
        <View style={{ gap: 8 }}>
          <SectionHeader title="Interview Details" />
          <Card>
            {/* Position */}
            <TouchableOpacity
              onPress={() => {
                const options = [...ROLE_TEMPLATES.map((t) => t.role), "Cancel"];
                ActionSheetIOS.showActionSheetWithOptions(
                  { title: "Select Position", options, cancelButtonIndex: options.length - 1, tintColor: "#1A1A1A" },
                  (i) => { if (i < ROLE_TEMPLATES.length) setRole(ROLE_TEMPLATES[i].role); }
                );
              }}
              activeOpacity={0.7}
              style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14 }}
            >
              <Text style={{ flex: 1, fontSize: 16, color: "#1A1A1A" }}>Position</Text>
              <Text style={{ fontSize: 16, color: "#8E8E8E", marginRight: 6 }}>{role}</Text>
              <Ionicons name="chevron-forward" size={16} color="#C0C0C0" />
            </TouchableOpacity>

            <Separator />

            {/* Date & Time */}
            <View style={{ paddingHorizontal: 16, paddingVertical: 4 }}>
              <Host matchContents style={{ width: "100%" }}>
                <DatePicker
                  title="Date & Time"
                  selection={dateTime}
                  displayedComponents={["date", "hourAndMinute"]}
                  onDateChange={setDateTime}
                />
              </Host>
            </View>

            <Separator />

            {/* Method */}
            <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 }}>
              <Text style={{ flex: 1, fontSize: 16, color: "#1A1A1A" }}>Method</Text>
              <View style={{ flexDirection: "row", gap: 6 }}>
                {METHODS.map((m) => {
                  const active = method === m.value;
                  return (
                    <TouchableOpacity
                      key={m.value}
                      onPress={() => setMethod(m.value)}
                      activeOpacity={0.8}
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 20,
                        backgroundColor: active ? "#2A6B3C" : "#F0F0F0",
                      }}
                    >
                      <Text style={{ fontSize: 13, fontWeight: "500", color: active ? "#fff" : "#8E8E8E" }}>
                        {m.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>
    </>
  );
}
