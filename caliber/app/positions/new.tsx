import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { type ScoringCriterion } from "../../constants/mock-data";

// ─── Mock generation ──────────────────────────────────────────────────────────

type Generated = {
  criteria: Omit<ScoringCriterion, "id">[];
  coachingPrompts: string[];
};

function mockGenerate(_role: string, _jd: string): Promise<Generated> {
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve({
        criteria: [
          { label: "Relevant Experience", description: "Has prior experience in a comparable role or industry.", maxScore: 5 },
          { label: "Communication Skills", description: "Communicates clearly and confidently with customers and teammates.", maxScore: 5 },
          { label: "Culture & Attitude", description: "Demonstrates a positive, team-oriented attitude and aligns with company values.", maxScore: 5 },
          { label: "Role-Specific Knowledge", description: "Understands the core responsibilities and requirements of the position.", maxScore: 5 },
          { label: "Availability", description: "Schedule aligns with the hours and coverage the role requires.", maxScore: 5 },
        ],
        coachingPrompts: [
          "Tell me about a time you had to handle a difficult situation at work — what did you do?",
          "What does a great day at work look like to you?",
          "How do you prioritize when multiple things need your attention at once?",
          "What are you looking for in your next role that you didn't have in your last one?",
          "Walk me through your availability — days, hours, and any constraints we should know about.",
        ],
      });
    }, 1800)
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

type Mode = "idle" | "manual" | "jd";

export default function NewPositionScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [roleName, setRoleName] = useState("");
  const [mode, setMode] = useState<Mode>("idle");
  const [jd, setJd] = useState("");
  const [generating, setGenerating] = useState(false);

  const roleValid = roleName.trim().length > 0;
  const canGenerate = roleValid && jd.trim().length > 0;

  function handleManualCreate() {
    if (!roleValid) return;
    router.replace(`/positions/${encodeURIComponent(roleName.trim())}`);
  }

  async function handleGenerate() {
    if (!canGenerate) return;
    setGenerating(true);
    const result = await mockGenerate(roleName.trim(), jd.trim());
    setGenerating(false);
    router.replace({
      pathname: "/positions/[role]",
      params: {
        role: encodeURIComponent(roleName.trim()),
        generated: JSON.stringify(result),
      },
    });
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "New Position",
          headerLargeTitle: false,
        }}
      />

      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button onPress={() => router.back()}>Cancel</Stack.Toolbar.Button>
      </Stack.Toolbar>

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        automaticallyAdjustKeyboardInsets
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Role name */}
        <View style={{ backgroundColor: "#fff", borderRadius: 14, borderCurve: "continuous", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12 }}>
            <Ionicons name="briefcase-outline" size={18} color="#8E8E8E" />
            <TextInput
              placeholder="Position name (e.g. Barista)"
              placeholderTextColor="#B0B0B0"
              value={roleName}
              onChangeText={(t) => { setRoleName(t); setMode("idle"); }}
              autoFocus
              returnKeyType="done"
              style={{ flex: 1, fontSize: 16, color: "#1A1A1A" }}
            />
          </View>
        </View>

        {/* Path picker — only show once a name is entered */}
        {roleValid && mode === "idle" && (
          <View style={{ gap: 10 }}>
            <Text style={{ fontSize: 13, color: "#8E8E8E", marginLeft: 2 }}>How would you like to set up this position?</Text>
            <View style={{ gap: 10 }}>
              <TouchableOpacity
                onPress={handleManualCreate}
                activeOpacity={0.88}
                style={{ backgroundColor: "#fff", borderRadius: 14, borderCurve: "continuous", padding: 16, flexDirection: "row", alignItems: "center", gap: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
              >
                <View style={{ width: 40, height: 40, borderRadius: 10, borderCurve: "continuous", backgroundColor: "#F0F0F0", alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name="create-outline" size={20} color="#1A1A1A" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: "600", color: "#1A1A1A" }}>Start from scratch</Text>
                  <Text style={{ fontSize: 13, color: "#8E8E8E", marginTop: 2 }}>Add criteria and questions manually</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#C0C0C0" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setMode("jd")}
                activeOpacity={0.88}
                style={{ backgroundColor: "#fff", borderRadius: 14, borderCurve: "continuous", padding: 16, flexDirection: "row", alignItems: "center", gap: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
              >
                <View style={{ width: 40, height: 40, borderRadius: 10, borderCurve: "continuous", backgroundColor: "#1A1A1A", alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name="sparkles-outline" size={20} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: "600", color: "#1A1A1A" }}>Generate with AI</Text>
                  <Text style={{ fontSize: 13, color: "#8E8E8E", marginTop: 2 }}>Paste a job description to auto-fill criteria</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#C0C0C0" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* JD input */}
        {mode === "jd" && (
          <View style={{ gap: 12 }}>
            <View style={{ backgroundColor: "#fff", borderRadius: 14, borderCurve: "continuous", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <TextInput
                placeholder="Paste the job description here…"
                placeholderTextColor="#B0B0B0"
                value={jd}
                onChangeText={setJd}
                multiline
                autoFocus
                style={{ fontSize: 14, color: "#1A1A1A", lineHeight: 21, padding: 16, minHeight: 180 }}
              />
            </View>

            <TouchableOpacity
              onPress={handleGenerate}
              activeOpacity={0.85}
              style={{
                height: 52,
                borderRadius: 14,
                borderCurve: "continuous",
                backgroundColor: canGenerate && !generating ? "#1A1A1A" : "#C0C0C0",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {generating ? (
                <>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={{ color: "#fff", fontSize: 15, fontWeight: "600" }}>Generating…</Text>
                </>
              ) : (
                <>
                  <Ionicons name="sparkles-outline" size={18} color="#fff" />
                  <Text style={{ color: "#fff", fontSize: 15, fontWeight: "600" }}>Generate criteria</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setMode("idle")} activeOpacity={0.7} style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 14, color: "#8E8E8E" }}>Back</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </>
  );
}
