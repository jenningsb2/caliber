import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import { GlassView } from "expo-glass-effect";
import { Stack, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import potbellyLogo from "../assets/images/Potbelly_Sandwich_Shop_logo.png";
import tacoBellLogo from "../assets/images/taco_bell_logo.png";
import {
  INTERVIEWERS,
  IONICON,
  LOCATIONS,
  getBrandAdminSections,
  getBrandAdminUpcoming,
  getBrandInboxItems,
  getBrandSections,
  getBrandUpcoming,
  type CandidateStatus,
  type Interview,
  type InterviewType,
} from "../constants/mock-data";
import { useBrand } from "../contexts/brand-context";
import { useRole } from "../contexts/role-context";

const STATUS_STYLE: Record<CandidateStatus, { bg: string; color: string }> = {
  Applied:     { bg: "#E0E0E0", color: "#555" },
  Screening:   { bg: "#E0E0E0", color: "#555" },
  Shortlisted: { bg: "#1A5C4A", color: "#fff" },
  Hired:       { bg: "#1A5C4A", color: "#fff" },
  Rejected:    { bg: "#FF3B30", color: "#fff" },
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function HeaderRight({ unreadCount }: { unreadCount: number }) {
  const router = useRouter();
  const { brand } = useBrand();
  return (
    <View style={styles.headerRightRow}>
      <TouchableOpacity activeOpacity={0.7} onPress={() => router.push("/inbox")}>
        <View style={styles.headerIconButton}>
          <Ionicons name="chatbubbles-outline" size={20} color="#1A1A1A" />
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
      <TouchableOpacity activeOpacity={0.7} onPress={() => router.push("/settings")}>
        <View style={styles.avatarButton}>
          <Image
            source={brand === "potbelly" ? potbellyLogo : tacoBellLogo}
            style={styles.avatarImage}
            contentFit="contain"
          />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const INTERVIEWER_COLORS: Record<string, string> = {
  "Bailey Jennings": "#2A6B3C",
  "Maria Santos": "#D4742C",
  "Terrence Blake": "#8B5CF6",
  "Ashley Kim": "#EC4899",
  "Darnell Price": "#D4742C",
  "Jenna Liu": "#8B5CF6",
  "Marco Ruiz": "#EC4899",
};

function InterviewerPill({ name }: { name: string }) {
  const [first, last] = name.split(" ");
  const label = `${first} ${last?.[0] ?? ""}.`;
  const initial = first[0];
  const color = INTERVIEWER_COLORS[name] ?? "#8E8E8E";

  return (
    <View style={styles.interviewerPill}>
      <View style={[styles.interviewerAvatar, { backgroundColor: color }]}>
        <Text style={styles.interviewerAvatarText}>{initial}</Text>
      </View>
      <Text style={styles.interviewerPillText}>{label}</Text>
    </View>
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

function UpcomingCard({ interview, onPress, showMeta }: { interview: Interview; onPress: () => void; showMeta?: boolean }) {
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

      {/* Right column */}
      <View style={styles.upcomingRight}>
        {showMeta && interview.interviewer && (
          <InterviewerPill name={interview.interviewer} />
        )}
        <View style={[styles.statusPill, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.statusPillText, { color: statusStyle.color }]}>
            {interview.candidateStatus}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function InterviewCard({ interview, onPress, showMeta }: { interview: Interview; onPress: () => void; showMeta?: boolean }) {
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
        <Text style={styles.interviewDateTime}>
          {interview.date} • {interview.time}
        </Text>
      </View>
      <View style={styles.interviewCardRight}>
        {showMeta && interview.interviewer && (
          <InterviewerPill name={interview.interviewer} />
        )}
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
      </View>
    </TouchableOpacity>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function InterviewsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { brand } = useBrand();
  const { role } = useRole();
  const isAdmin = role === "admin";
  const [query, setQuery] = useState("");
  const [positionFilter, setPositionFilter] = useState<string | null>(null);
  const [interviewerFilter, setInterviewerFilter] = useState<string | null>(null);
  const [locationFilter, setLocationFilter] = useState<string | null>(null);
  const bottomBarHeight = 52 + insets.bottom + 24;
  const filterSheetRef = useRef<BottomSheet>(null);

  // Reset admin-only filters when switching roles
  useEffect(() => {
    setInterviewerFilter(null);
    setLocationFilter(null);
    setPositionFilter(null);
  }, [role]);

  const upcoming = useMemo(
    () => isAdmin ? getBrandAdminUpcoming(brand) : getBrandUpcoming(brand),
    [brand, isAdmin]
  );
  const sections = useMemo(
    () => isAdmin ? getBrandAdminSections(brand) : getBrandSections(brand),
    [brand, isAdmin]
  );
  const inboxItems = useMemo(() => getBrandInboxItems(brand, role), [brand, role]);
  const unreadCount = useMemo(() => inboxItems.filter((i) => i.unread).length, [inboxItems]);

  const allRoles = useMemo(
    () => Array.from(new Set([...upcoming, ...sections.flatMap((s) => s.data)].map((i) => i.role))).sort(),
    [upcoming, sections]
  );
  const allInterviewers = useMemo(() => INTERVIEWERS[brand === "tacobell" ? "tacobell" : "potbelly"], [brand]);
  const allLocations = useMemo(() => LOCATIONS[brand === "tacobell" ? "tacobell" : "potbelly"], [brand]);

  const activeFilterCount = [positionFilter, interviewerFilter, locationFilter].filter(Boolean).length;

  const q = query.toLowerCase();
  const matchesFilters = (i: Interview) =>
    (i.name.toLowerCase().includes(q) || i.role.toLowerCase().includes(q)) &&
    (positionFilter === null || i.role === positionFilter) &&
    (interviewerFilter === null || i.interviewer === interviewerFilter) &&
    (locationFilter === null || i.location === locationFilter);

  const filteredUpcoming = upcoming.filter(matchesFilters);
  const filteredSections = sections.map((s) => ({
    ...s,
    data: s.data.filter(matchesFilters),
  })).filter((s) => s.data.length > 0);

  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />,
    []
  );

  return (
    <>
      <Stack.Screen options={{ title: isAdmin ? "All Interviews" : "My Interviews", headerRight: () => <HeaderRight unreadCount={unreadCount} /> }} />

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
            onPress={() => filterSheetRef.current?.expand()}
            activeOpacity={0.7}
            style={[styles.filterButton, activeFilterCount > 0 ? styles.filterButtonActive : undefined]}
          >
            <Ionicons name="filter" size={14} color={activeFilterCount > 0 ? "#fff" : "#8E8E8E"} />
            <Text style={[styles.filterButtonText, activeFilterCount > 0 ? styles.filterButtonTextActive : undefined]} numberOfLines={1}>
              {activeFilterCount > 0 ? `Filter · ${activeFilterCount}` : "Filter"}
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
                showMeta={isAdmin}
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
                    showMeta={isAdmin}
                    onPress={() => router.push(`/interview/${interview.id}?status=past`)}
                  />
                ))}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating action bar */}
      <View style={[styles.fab, { bottom: 16 }]}>
        <GlassView colorScheme="light" style={styles.fabGlass}>
          {!isAdmin && (
            <TouchableOpacity activeOpacity={0.8} onPress={() => router.push("/dialer")}>
              <GlassView colorScheme="dark" style={styles.fabPhone}>
                <Ionicons name="call" size={20} color="#fff" />
              </GlassView>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.fabChat} activeOpacity={0.8} onPress={() => router.push("/chat")}>
            <GlassView colorScheme="dark" style={styles.fabChatGlass}>
              <Ionicons name="sparkles" size={18} color="#fff" />
              <Text style={styles.fabChatText}>Chat with Caliber</Text>
            </GlassView>
          </TouchableOpacity>
          {!isAdmin && (
            <TouchableOpacity activeOpacity={0.8} onPress={() => router.push("/interview/new?status=inprogress")}>
              <GlassView colorScheme="dark" style={styles.fabMic}>
                <Ionicons name="mic" size={20} color="#fff" />
              </GlassView>
            </TouchableOpacity>
          )}
        </GlassView>
      </View>

      {/* Filter bottom sheet */}
      <BottomSheet
        ref={filterSheetRef}
        index={-1}
        snapPoints={[isAdmin ? "55%" : "35%"]}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.sheetHandle}
      >
        <BottomSheetScrollView contentContainerStyle={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Filters</Text>

          {/* Position filter */}
          <Text style={styles.sheetSectionLabel}>Position</Text>
          <View style={styles.sheetPillRow}>
            {allRoles.map((r) => (
              <TouchableOpacity
                key={r}
                activeOpacity={0.7}
                onPress={() => setPositionFilter(positionFilter === r ? null : r)}
                style={[styles.sheetPill, positionFilter === r && styles.sheetPillActive]}
              >
                <Text style={[styles.sheetPillText, positionFilter === r && styles.sheetPillTextActive]}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Admin-only filters */}
          {isAdmin && (
            <>
              <Text style={styles.sheetSectionLabel}>Interviewer</Text>
              <View style={styles.sheetPillRow}>
                {allInterviewers.map((name) => (
                  <TouchableOpacity
                    key={name}
                    activeOpacity={0.7}
                    onPress={() => setInterviewerFilter(interviewerFilter === name ? null : name)}
                    style={[styles.sheetPill, interviewerFilter === name && styles.sheetPillActive]}
                  >
                    <Text style={[styles.sheetPillText, interviewerFilter === name && styles.sheetPillTextActive]}>{name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.sheetSectionLabel}>Location</Text>
              <View style={styles.sheetPillRow}>
                {allLocations.map((loc) => (
                  <TouchableOpacity
                    key={loc}
                    activeOpacity={0.7}
                    onPress={() => setLocationFilter(locationFilter === loc ? null : loc)}
                    style={[styles.sheetPill, locationFilter === loc && styles.sheetPillActive]}
                  >
                    <Text style={[styles.sheetPillText, locationFilter === loc && styles.sheetPillTextActive]}>{loc}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* Clear all */}
          {activeFilterCount > 0 && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                setPositionFilter(null);
                setInterviewerFilter(null);
                setLocationFilter(null);
              }}
              style={styles.clearFiltersButton}
            >
              <Text style={styles.clearFiltersText}>Clear all filters</Text>
            </TouchableOpacity>
          )}
        </BottomSheetScrollView>
      </BottomSheet>
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
  upcomingRight: {
    alignItems: "flex-end",
    gap: 6,
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
    left: 16,
    right: 16,
  },
  fabGlass: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 100,
    borderCurve: "continuous",
    padding: 6,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.08)",
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

  // Header right
  headerRightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },
  unreadBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#FF3B30",
    borderRadius: 7,
    minWidth: 14,
    height: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  unreadBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#fff",
  },

  // Interviewer pill
  interviewerPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F7F7F7",
    borderRadius: 12,
    borderCurve: "continuous",
    paddingLeft: 3,
    paddingRight: 8,
    paddingVertical: 3,
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.06)",
  },
  interviewerAvatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  interviewerAvatarText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
  },
  interviewerPillText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#555",
  },

  // Filter bottom sheet
  sheetBackground: {
    backgroundColor: "#fff",
    borderRadius: 20,
    borderCurve: "continuous",
  },
  sheetHandle: {
    backgroundColor: "#DEDEDE",
    width: 36,
  },
  sheetContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  sheetSectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8E8E8E",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sheetPillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  sheetPill: {
    borderWidth: 1,
    borderColor: "#DEDEDE",
    borderRadius: 20,
    borderCurve: "continuous",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  sheetPillActive: {
    backgroundColor: "#2A6B3C",
    borderColor: "#2A6B3C",
  },
  sheetPillText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1A1A1A",
  },
  sheetPillTextActive: {
    color: "#fff",
  },
  clearFiltersButton: {
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF3B30",
  },
});
