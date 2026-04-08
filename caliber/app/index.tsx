import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { GlassView } from "expo-glass-effect";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import potbellyLogo from "../assets/images/Potbelly_Sandwich_Shop_logo.png";
import { IONICON, SECTIONS, UPCOMING, type CandidateStatus, type Interview, type InterviewType } from "../constants/mock-data";

const STATUS_STYLE: Record<CandidateStatus, { bg: string; color: string }> = {
  Applied:     { bg: "#E0E0E0", color: "#555" },
  Screening:   { bg: "#E0E0E0", color: "#555" },
  Shortlisted: { bg: "#1A5C4A", color: "#fff" },
  Hired:       { bg: "#1A5C4A", color: "#fff" },
  Rejected:    { bg: "#FF3B30", color: "#fff" },
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function HeaderRight() {
  const router = useRouter();
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={() => router.push("/settings")}>
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          borderWidth: 1.5,
          borderColor: "#DEDEDE",
          backgroundColor: "#fff",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <Image
          source={potbellyLogo}
          style={{ width: 28, height: 28 }}
          contentFit="contain"
        />
      </View>
    </TouchableOpacity>
  );
}

function TypeMeta({ type }: { type: InterviewType }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
      <Ionicons name={IONICON[type]} size={12} color="#8E8E8E" />
      <Text style={{ fontSize: 13, color: "#8E8E8E" }}>{type}</Text>
    </View>
  );
}

function UpcomingCard({
  interview,
  onPress,
}: {
  interview: Interview;
  onPress: () => void;
}) {
  const [clock, ampm] = interview.time.split(" ");

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.92}
      style={{
        backgroundColor: "#F0F0F0",
        borderRadius: 14,
        borderCurve: "continuous",
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.08)",
        padding: 14,
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
      }}
    >
      {/* Time badge */}
      <View
        style={{
          width: 62,
          alignItems: "center",
          backgroundColor: "#F7F7F7",
          borderRadius: 10,
          borderCurve: "continuous",
          borderWidth: 1,
          borderColor: "rgba(0,0,0,0.08)",
          paddingVertical: 8,
          gap: 1,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "700", color: "#1A1A1A", fontVariant: ["tabular-nums"] }}>
          {clock}
        </Text>
        <Text style={{ fontSize: 11, fontWeight: "500", color: "#8E8E8E" }}>{ampm}</Text>
      </View>

      {/* Info */}
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontSize: 16, fontWeight: "600", color: "#1A1A1A" }}>
          {interview.name}
        </Text>
        <Text style={{ fontSize: 13, color: "#8E8E8E" }}>{interview.role}</Text>
        <TypeMeta type={interview.type} />
      </View>

      {/* Status */}
      <View
        style={{
          backgroundColor: STATUS_STYLE[interview.candidateStatus].bg,
          borderRadius: 20,
          paddingHorizontal: 10,
          paddingVertical: 4,
        }}
      >
        <Text style={{ fontSize: 12, fontWeight: "600", color: STATUS_STYLE[interview.candidateStatus].color }}>
          {interview.candidateStatus}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function InterviewCard({
  interview,
  onPress,
}: {
  interview: Interview;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.95}
      style={{
        backgroundColor: "#fff",
        borderRadius: 12,
        borderCurve: "continuous",
        padding: 14,
        flexDirection: "row",
        alignItems: "flex-start",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontSize: 17, fontWeight: "600", color: "#1A1A1A" }}>
          {interview.name}
        </Text>
        <Text style={{ fontSize: 14, color: "#8E8E8E" }}>{interview.role}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Text style={{ fontSize: 13, color: "#8E8E8E" }}>
            {interview.durationMin} min •{" "}
          </Text>
          <TypeMeta type={interview.type} />
        </View>
      </View>
      <View style={{ alignItems: "flex-end", gap: 6 }}>
        <View
          style={{
            backgroundColor: STATUS_STYLE[interview.candidateStatus].bg,
            borderRadius: 20,
            paddingHorizontal: 10,
            paddingVertical: 4,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: "600", color: STATUS_STYLE[interview.candidateStatus].color }}>
            {interview.candidateStatus}
          </Text>
        </View>
        {interview.score !== undefined && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
            <Ionicons name="checkmark-circle" size={12} color="#2A6B3C" />
            <Text style={{ fontSize: 13, color: "#2A6B3C", fontWeight: "600" }}>
              {interview.score.value}/{interview.score.outOf}
            </Text>
          </View>
        )}
        <Text style={{ fontSize: 13, color: "#8E8E8E" }}>
          {interview.date} • {interview.time}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function InterviewsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const bottomBarHeight = 52 + insets.bottom + 24;

  const q = query.toLowerCase();
  const filteredUpcoming = UPCOMING.filter(
    (i) => i.name.toLowerCase().includes(q) || i.role.toLowerCase().includes(q)
  );
  const filteredSections = SECTIONS.map((s) => ({
    ...s,
    data: s.data.filter(
      (i) => i.name.toLowerCase().includes(q) || i.role.toLowerCase().includes(q)
    ),
  })).filter((s) => s.data.length > 0);

  return (
    <>
      <Stack.Screen
        options={{
          title: "My Interviews",
          headerRight: () => <HeaderRight />,
        }}
      />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardDismissMode="on-drag"
        style={{ flex: 1, backgroundColor: "#fff" }}
        contentContainerStyle={{ paddingBottom: bottomBarHeight }}
        showsVerticalScrollIndicator={false}
      >
        {/* Search bar */}
        <View style={{ backgroundColor: "#fff", paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#F0F0F0", borderRadius: 12, borderCurve: "continuous", paddingHorizontal: 12, gap: 8, height: 40 }}>
            <Ionicons name="search-outline" size={16} color="#8E8E8E" />
            <TextInput
              placeholder="Search interviews"
              placeholderTextColor="#8E8E8E"
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
              clearButtonMode="while-editing"
              style={{ flex: 1, fontSize: 15, color: "#1A1A1A" }}
            />
          </View>
        </View>

        {/* Coming up — white band */}
        {filteredUpcoming.length > 0 && (
          <View style={{ backgroundColor: "#fff", paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20, gap: 8 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 2 }}>
              <Text style={{ fontSize: 13, fontWeight: "600", color: "#8E8E8E", textTransform: "uppercase", letterSpacing: 0.5 }}>
                Coming up
              </Text>
              <Text style={{ fontSize: 13, color: "#8E8E8E" }}>
                {filteredUpcoming.length} scheduled
              </Text>
            </View>
            {filteredUpcoming.map((interview) => (
              <UpcomingCard
                key={interview.id}
                interview={interview}
                onPress={() => router.push(`/interview/${interview.id}?status=upcoming`)}
              />
            ))}
          </View>
        )}

        {/* Past interviews — gray band */}
        {filteredSections.length > 0 && (
          <View style={{ backgroundColor: "#F0F0F0", paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8, gap: 16 }}>
            {filteredSections.map((section) => (
              <View key={section.title} style={{ gap: 8 }}>
                <Text style={{ fontSize: 13, fontWeight: "600", color: "#8E8E8E", textTransform: "uppercase", letterSpacing: 0.5, marginLeft: 2 }}>
                  {section.title}
                </Text>
                {section.data.map((interview) => (
                  <InterviewCard
                    key={interview.id}
                    interview={interview}
                    onPress={() => router.push(`/interview/${interview.id}?status=past`)}
                  />
                ))}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating action bar */}
      <View
        style={{
          position: "absolute",
          bottom: insets.bottom + 16,
          left: 24,
          right: 24,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        <TouchableOpacity activeOpacity={0.8} onPress={() => router.push("/dialer")}>
          <GlassView
            colorScheme="dark"
            style={{
              backgroundColor: "#2A6B3C",
              borderRadius: 100,
              width: 52,
              height: 52,
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <Ionicons name="call" size={20} color="#fff" />
          </GlassView>
        </TouchableOpacity>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={0.8}>
          <GlassView
            colorScheme="dark"
            style={{
              backgroundColor: "rgba(0,0,0,0.75)",
              borderRadius: 100,
              height: 52,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 8,
              overflow: "hidden",
            }}
          >
            <Ionicons name="mic" size={18} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 15, fontWeight: "600" }}>
              Start interview
            </Text>
          </GlassView>
        </TouchableOpacity>
      </View>
    </>
  );
}
