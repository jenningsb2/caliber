import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Mock history data ──────────────────────────────────────────────────────

interface ChatHistoryEntry {
  id: string;
  title: string;
  scope: string; // "All interviews" or candidate name
  scopeIcon: "globe-outline" | "person-outline";
}

interface ChatHistorySection {
  title: string;
  data: ChatHistoryEntry[];
}

const HISTORY_SECTIONS: ChatHistorySection[] = [
  {
    title: "Today",
    data: [
      {
        id: "h1",
        title: "Who should I follow up with?",
        scope: "All interviews",
        scopeIcon: "globe-outline",
      },
      {
        id: "h2",
        title: "Compare my shift lead candidates",
        scope: "All interviews",
        scopeIcon: "globe-outline",
      },
    ],
  },
  {
    title: "This Week",
    data: [
      {
        id: "h3",
        title: "Key strengths and areas to probe",
        scope: "Marcus Webb",
        scopeIcon: "person-outline",
      },
      {
        id: "h4",
        title: "Follow-up questions before offer",
        scope: "Priya Nair",
        scopeIcon: "person-outline",
      },
    ],
  },
  {
    title: "This Month",
    data: [
      {
        id: "h5",
        title: "Who's ready to hire right now?",
        scope: "All interviews",
        scopeIcon: "globe-outline",
      },
      {
        id: "h6",
        title: "Availability conflicts across candi...",
        scope: "All interviews",
        scopeIcon: "globe-outline",
      },
    ],
  },
  {
    title: "Older",
    data: [
      {
        id: "h7",
        title: "Interview prep for shift lead role",
        scope: "All interviews",
        scopeIcon: "globe-outline",
      },
      {
        id: "h8",
        title: "What to ask a delivery driver cand...",
        scope: "Carlos Mendoza",
        scopeIcon: "person-outline",
      },
      {
        id: "h9",
        title: "Cashier candidate red flags to watc...",
        scope: "All interviews",
        scopeIcon: "globe-outline",
      },
    ],
  },
];

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function ChatHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");

  const q = query.toLowerCase();
  const filteredSections = HISTORY_SECTIONS.map((section) => ({
    ...section,
    data: section.data.filter(
      (entry) =>
        entry.title.toLowerCase().includes(q) ||
        entry.scope.toLowerCase().includes(q)
    ),
  })).filter((section) => section.data.length > 0);

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.headerBack}
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={22} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat history</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInput}>
          <Ionicons name="search-outline" size={16} color="#8E8E8E" />
          <TextInput
            placeholder="Search"
            placeholderTextColor="#8E8E8E"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            clearButtonMode="while-editing"
            style={styles.searchText}
          />
        </View>
      </View>

      {/* List */}
      <ScrollView
        style={styles.flex}
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        {filteredSections.map((section) => (
          <View key={section.title}>
            {/* Section header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>

            {/* Rows */}
            {section.data.map((entry, i) => (
              <TouchableOpacity
                key={entry.id}
                style={styles.row}
                activeOpacity={0.6}
                onPress={() => router.push("/chat")}
              >
                <View style={styles.rowContent}>
                  <Text style={styles.rowTitle} numberOfLines={1}>
                    {entry.title}
                  </Text>
                  <View style={styles.rowMeta}>
                    <Ionicons
                      name={entry.scopeIcon}
                      size={12}
                      color="#8E8E8E"
                    />
                    <Text style={styles.rowScope}>{entry.scope}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#CACACA" />
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {filteredSections.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No matching chats</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerBack: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
    color: "#1A1A1A",
    textAlign: "center",
  },
  headerSpacer: {
    width: 40,
  },

  // Search
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  searchInput: {
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

  // Section
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8E8E8E",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Row
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.08)",
  },
  rowContent: {
    flex: 1,
    gap: 3,
    marginRight: 12,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  rowMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rowScope: {
    fontSize: 13,
    color: "#8E8E8E",
  },

  // Empty
  emptyState: {
    paddingTop: 60,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 15,
    color: "#8E8E8E",
  },
});
