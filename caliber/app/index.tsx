import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { GlassView } from "expo-glass-effect";
import { Stack, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ActionSheetIOS, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import potbellyLogo from "../assets/images/Potbelly_Sandwich_Shop_logo.png";
import tacoBellLogo from "../assets/images/taco_bell_logo.png";
import { IONICON, getBrandSections, getBrandUpcoming, type CandidateStatus, type Interview, type InterviewType } from "../constants/mock-data";
import { useBrand } from "../contexts/brand-context";

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
  const { brand } = useBrand();
  return (
    <TouchableOpacity activeOpacity={0.7} onPress={() => router.push("/settings")}>
      <View style={styles.avatarButton}>
        <Image
          source={brand === "potbelly" ? potbellyLogo : tacoBellLogo}
          style={styles.avatarImage}
          contentFit="contain"
        />
      </View>
    </TouchableOpacity>
  );
}

function TypeMeta({ type }: { type: InterviewType }) {
  return (
    <View style={styles.typeMeta}>
      <Ionicons name={IONICON[type]} size={12} color="#8E8E8E" />
      <Text style={styles.typeMetaText}>{type}</Text>
    </View>
  );
}

function UpcomingCard({ interview, onPress }: { interview: Interview; onPress: () => void }) {
  const [clock, ampm] = interview.time.split(" ");
  const statusStyle = STATUS_STYLE[interview.candidateStatus];

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.92} style={styles.upcomingCard}>
      {/* Time badge */}
      <View style={styles.timeBadge}>
        <Text style={styles.timeClock}>{clock}</Text>
        <Text style={styles.timeAmpm}>{ampm}</Text>
      </View>

      {/* Info */}
      <View style={styles.upcomingInfo}>
        <Text style={styles.upcomingName}>{interview.name}</Text>
        <Text style={styles.upcomingRole}>{interview.role}</Text>
        <TypeMeta type={interview.type} />
      </View>

      {/* Status pill */}
      <View style={[styles.statusPill, { backgroundColor: statusStyle.bg }]}>
        <Text style={[styles.statusPillText, { color: statusStyle.color }]}>
          {interview.candidateStatus}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function InterviewCard({ interview, onPress }: { interview: Interview; onPress: () => void }) {
  const statusStyle = STATUS_STYLE[interview.candidateStatus];

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.95} style={styles.interviewCard}>
      <View style={styles.interviewCardLeft}>
        <Text style={styles.interviewName}>{interview.name}</Text>
        <Text style={styles.interviewRole}>{interview.role}</Text>
        <View style={styles.interviewMeta}>
          <Text style={styles.interviewMetaText}>{interview.durationMin} min • </Text>
          <TypeMeta type={interview.type} />
        </View>
      </View>
      <View style={styles.interviewCardRight}>
        <View style={[styles.statusPill, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.statusPillText, { color: statusStyle.color }]}>
            {interview.candidateStatus}
          </Text>
        </View>
        {interview.score !== undefined && (
          <View style={styles.scoreRow}>
            <Ionicons name="checkmark-circle" size={12} color="#2A6B3C" />
            <Text style={styles.scoreText}>
              {interview.score.value}/{interview.score.outOf}
            </Text>
          </View>
        )}
        <Text style={styles.interviewDateTime}>
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
  const { brand } = useBrand();
  const [query, setQuery] = useState("");
  const [positionFilter, setPositionFilter] = useState<string | null>(null);
  const bottomBarHeight = 52 + insets.bottom + 24;

  const upcoming = useMemo(() => getBrandUpcoming(brand), [brand]);
  const sections = useMemo(() => getBrandSections(brand), [brand]);

  const allRoles = useMemo(
    () => Array.from(new Set([...upcoming, ...sections.flatMap((s) => s.data)].map((i) => i.role))).sort(),
    [upcoming, sections]
  );

  function handlePositionFilter() {
    const options = [...allRoles, "Clear filter", "Cancel"];
    ActionSheetIOS.showActionSheetWithOptions(
      { title: "Filter by Position", options, cancelButtonIndex: options.length - 1, destructiveButtonIndex: options.length - 2, tintColor: "#1A1A1A" },
      (i) => {
        if (i < allRoles.length) setPositionFilter(allRoles[i]);
        else if (i === allRoles.length) setPositionFilter(null);
      }
    );
  }

  const q = query.toLowerCase();
  const matchesFilters = (i: Interview) =>
    (i.name.toLowerCase().includes(q) || i.role.toLowerCase().includes(q)) &&
    (positionFilter === null || i.role === positionFilter);

  const filteredUpcoming = upcoming.filter(matchesFilters);
  const filteredSections = sections.map((s) => ({
    ...s,
    data: s.data.filter(matchesFilters),
  })).filter((s) => s.data.length > 0);

  return (
    <>
      <Stack.Screen options={{ title: "My Interviews", headerRight: () => <HeaderRight /> }} />

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardDismissMode="on-drag"
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: bottomBarHeight }}
        showsVerticalScrollIndicator={false}
      >
        {/* Search bar */}
        <View style={styles.searchRow}>
          <View style={styles.searchInput}>
            <Ionicons name="search-outline" size={16} color="#8E8E8E" />
            <TextInput
              placeholder="Search interviews"
              placeholderTextColor="#8E8E8E"
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
              clearButtonMode="while-editing"
              style={styles.searchText}
            />
          </View>
          <TouchableOpacity
            onPress={handlePositionFilter}
            activeOpacity={0.7}
            style={[styles.filterButton, positionFilter ? styles.filterButtonActive : undefined]}
          >
            <Ionicons name="filter" size={14} color={positionFilter ? "#fff" : "#8E8E8E"} />
            <Text style={[styles.filterButtonText, positionFilter ? styles.filterButtonTextActive : undefined]} numberOfLines={1}>
              {positionFilter ?? "Filter"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Coming up */}
        {filteredUpcoming.length > 0 && (
          <View style={styles.upcomingSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Coming up</Text>
              <Text style={styles.sectionCount}>{filteredUpcoming.length} scheduled</Text>
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

        {/* Past interviews */}
        {filteredSections.length > 0 && (
          <View style={styles.pastSection}>
            {filteredSections.map((section) => (
              <View key={section.title} style={styles.pastSectionGroup}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
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
      <View style={[styles.fab, { bottom: insets.bottom + 16 }]}>
        <TouchableOpacity activeOpacity={0.8} onPress={() => router.push("/dialer")}>
          <GlassView colorScheme="dark" style={styles.fabPhone}>
            <Ionicons name="call" size={20} color="#fff" />
          </GlassView>
        </TouchableOpacity>
        <TouchableOpacity style={styles.fabChat} activeOpacity={0.8} onPress={() => router.push("/chat")}>
          <GlassView colorScheme="dark" style={styles.fabChatGlass}>
            <Ionicons name="sparkles" size={18} color="#fff" />
            <Text style={styles.fabChatText}>Chat with Caliber</Text>
          </GlassView>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.8}>
          <GlassView colorScheme="dark" style={styles.fabMic}>
            <Ionicons name="mic" size={20} color="#fff" />
          </GlassView>
        </TouchableOpacity>
      </View>
    </>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Header
  avatarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "#DEDEDE",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: 28,
    height: 28,
  },

  // TypeMeta
  typeMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  typeMetaText: {
    fontSize: 13,
    color: "#8E8E8E",
  },

  // UpcomingCard
  upcomingCard: {
    backgroundColor: "#F0F0F0",
    borderRadius: 14,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  timeBadge: {
    width: 62,
    alignItems: "center",
    backgroundColor: "#F7F7F7",
    borderRadius: 10,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    paddingVertical: 8,
    gap: 1,
  },
  timeClock: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    fontVariant: ["tabular-nums"],
  },
  timeAmpm: {
    fontSize: 11,
    fontWeight: "500",
    color: "#8E8E8E",
  },
  upcomingInfo: {
    flex: 1,
    gap: 2,
  },
  upcomingName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  upcomingRole: {
    fontSize: 13,
    color: "#8E8E8E",
  },

  // InterviewCard
  interviewCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderCurve: "continuous",
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  },
  interviewCardLeft: {
    flex: 1,
    gap: 2,
  },
  interviewName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  interviewRole: {
    fontSize: 14,
    color: "#8E8E8E",
  },
  interviewMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  interviewMetaText: {
    fontSize: 13,
    color: "#8E8E8E",
  },
  interviewCardRight: {
    alignItems: "flex-end",
    gap: 6,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  scoreText: {
    fontSize: 13,
    color: "#2A6B3C",
    fontWeight: "600",
  },
  interviewDateTime: {
    fontSize: 13,
    color: "#8E8E8E",
  },

  // Shared
  statusPill: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: "600",
  },

  // Screen
  scrollView: {
    flex: 1,
    backgroundColor: "#fff",
  },
  searchRow: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    borderRadius: 12,
    borderCurve: "continuous",
    paddingHorizontal: 12,
    gap: 8,
    height: 40,
  },
  searchText: {
    flex: 1,
    fontSize: 15,
    color: "#1A1A1A",
  },
  filterButton: {
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderCurve: "continuous",
    backgroundColor: "#F0F0F0",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  filterButtonActive: {
    backgroundColor: "#2A6B3C",
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#8E8E8E",
  },
  filterButtonTextActive: {
    color: "#fff",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8E8E8E",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginLeft: 2,
  },
  sectionCount: {
    fontSize: 13,
    color: "#8E8E8E",
  },
  upcomingSection: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
    gap: 8,
  },
  pastSection: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
    gap: 16,
  },
  pastSectionGroup: {
    gap: 8,
  },

  // FAB
  fab: {
    position: "absolute",
    left: 24,
    right: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  fabPhone: {
    backgroundColor: "rgba(0,0,0,0.75)",
    borderRadius: 100,
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  fabChat: {
    flex: 1,
  },
  fabChatGlass: {
    backgroundColor: "#2A6B3C",
    borderRadius: 100,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    overflow: "hidden",
  },
  fabChatText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  fabMic: {
    backgroundColor: "rgba(0,0,0,0.75)",
    borderRadius: 100,
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
});
