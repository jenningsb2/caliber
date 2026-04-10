import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getBrandInboxItems, type InboxItem } from "../constants/mock-data";
import { useBrand } from "../contexts/brand-context";
import { useRole } from "../contexts/role-context";

// ─── Sub-components ─────────────────────────────────────────────────────────

function InboxRow({ item, onPress }: { item: InboxItem; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.row}>
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: item.lastCommentAuthorColor }]}>
        <Text style={styles.avatarText}>{item.lastCommentAuthorInitials}</Text>
      </View>

      {/* Content */}
      <View style={styles.rowContent}>
        <View style={styles.rowTopLine}>
          <Text style={styles.candidateName} numberOfLines={1}>
            {item.candidateName}
          </Text>
          <Text style={styles.candidateRole}>{item.candidateRole}</Text>
          {item.replied && (
            <View style={styles.repliedChip}>
              <Ionicons name="checkmark" size={10} color="#2A6B3C" />
              <Text style={styles.repliedChipText}>Replied</Text>
            </View>
          )}
        </View>
        <Text style={styles.commentAuthor}>{item.lastCommentAuthor}</Text>
        <Text style={styles.commentPreview} numberOfLines={2}>
          {item.lastComment}
        </Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>

      {/* Unread dot */}
      {item.unread && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
}

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function InboxScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { brand } = useBrand();
  const { role } = useRole();

  const items = useMemo(() => getBrandInboxItems(brand, role), [brand, role]);
  const unread = items.filter((i) => i.unread);
  const read = items.filter((i) => !i.unread);

  return (
    <>
      <Stack.Screen options={{ title: "Inbox", headerLargeTitle: false, presentation: "modal" }} />
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button onPress={() => router.back()}>Done</Stack.Toolbar.Button>
      </Stack.Toolbar>

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        {unread.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>New</Text>
            {unread.map((item) => (
              <InboxRow
                key={item.id}
                item={item}
                onPress={() => router.push(`/interview/${item.interviewId}?status=past&tab=Comments&commentId=${item.commentId}`)}
              />
            ))}
          </View>
        )}

        {read.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Earlier</Text>
            {read.map((item) => (
              <InboxRow
                key={item.id}
                item={item}
                onPress={() => router.push(`/interview/${item.interviewId}?status=past&tab=Comments&commentId=${item.commentId}`)}
              />
            ))}
          </View>
        )}

        {items.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={40} color="#DEDEDE" />
            <Text style={styles.emptyText}>No comments yet</Text>
          </View>
        )}
      </ScrollView>
    </>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: "#F0F0F0",
  },
  section: {
    paddingTop: 16,
    gap: 1,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8E8E8E",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginLeft: 18,
    marginBottom: 8,
  },

  // Row
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.08)",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  rowContent: {
    flex: 1,
    gap: 2,
  },
  rowTopLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  candidateName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    flexShrink: 1,
  },
  candidateRole: {
    fontSize: 13,
    color: "#8E8E8E",
  },
  repliedChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "#E8F5E9",
    borderRadius: 6,
    borderCurve: "continuous",
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  repliedChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#2A6B3C",
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: "500",
    color: "#555",
  },
  commentPreview: {
    fontSize: 14,
    color: "#3A3A3A",
    lineHeight: 19,
  },
  time: {
    fontSize: 12,
    color: "#8E8E8E",
    marginTop: 2,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2A6B3C",
    marginTop: 6,
  },

  // Empty
  emptyState: {
    alignItems: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: "#8E8E8E",
  },
});
