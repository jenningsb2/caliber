import { Ionicons } from "@expo/vector-icons";
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
} from "expo-audio";
import * as Clipboard from "expo-clipboard";
import { GlassView } from "expo-glass-effect";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useBrand } from "../../contexts/brand-context";
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActionSheetIOS, Alert, Animated, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import potbellyLogo from "../../assets/images/Potbelly_Sandwich_Shop_logo.png";
import tacoBellLogo from "../../assets/images/taco_bell_logo.png";
import { AnimatedWaveform } from "../../components/animated-waveform";
import {
  getBrandInterviewMap,
  getBrandRoleTemplates,
  InterviewStatus,
  type AISummary,
  type CandidateStatus,
  type CriterionScore,
  type ScoringCriterion,
} from "../../constants/mock-data";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

const STATUS_STYLE: Record<CandidateStatus, { bg: string; color: string }> = {
  Applied:     { bg: "#E0E0E0", color: "#555" },
  Screening:   { bg: "#E0E0E0", color: "#555" },
  Shortlisted: { bg: "#1A5C4A", color: "#fff" },
  Hired:       { bg: "#1A5C4A", color: "#fff" },
  Rejected:    { bg: "#FF3B30", color: "#fff" },
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function Pill({
  children,
  bg,
}: {
  children: React.ReactNode;
  bg: string;
  color: string;
}) {
  return (
    <View
      style={{
        backgroundColor: bg,
        borderRadius: 20,
        borderCurve: "continuous",
        paddingHorizontal: 12,
        paddingVertical: 6,
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
      }}
    >
      {children}
    </View>
  );
}

type Tab = "Summary" | "Coaching" | "Transcript" | "Comments";
const TABS: Tab[] = ["Summary", "Coaching", "Transcript", "Comments"];

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: "#E4E4E4",
        borderRadius: 10,
        borderCurve: "continuous",
        padding: 3,
        gap: 2,
      }}
    >
      {TABS.map((tab) => (
        <TouchableOpacity
          key={tab}
          onPress={() => onChange(tab)}
          style={{
            flex: 1,
            paddingVertical: 7,
            alignItems: "center",
            backgroundColor: active === tab ? "#fff" : "transparent",
            borderRadius: 8,
            borderCurve: "continuous",
            boxShadow: active === tab ? "0 1px 3px rgba(0,0,0,0.1)" : undefined,
          }}
          activeOpacity={0.7}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: active === tab ? "600" : "400",
              color: active === tab ? "#1A1A1A" : "#8E8E8E",
            }}
          >
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function SummarySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: 15, fontWeight: "700", color: "#1A1A1A" }}>{title}</Text>
      {children}
    </View>
  );
}

function SummaryCard({ summary }: { summary: AISummary }) {
  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 14,
        borderCurve: "continuous",
        padding: 16,
        gap: 18,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      <SummarySection title="Experience Snapshot">
        <Text selectable style={{ fontSize: 15, color: "#3A3A3A", lineHeight: 22 }}>
          {summary.experienceSnapshot}
        </Text>
      </SummarySection>

      <SummarySection title="Key Highlights">
        <View style={{ gap: 4 }}>
          {summary.keyHighlights.map((h, i) => (
            <View key={i} style={{ flexDirection: "row", gap: 8 }}>
              <Text style={{ fontSize: 15, color: "#3A3A3A", lineHeight: 22 }}>•</Text>
              <Text selectable style={{ flex: 1, fontSize: 15, color: "#3A3A3A", lineHeight: 22 }}>
                {h}
              </Text>
            </View>
          ))}
        </View>
      </SummarySection>

      <SummarySection title="Communication & Fit">
        <Text selectable style={{ fontSize: 15, color: "#3A3A3A", lineHeight: 22 }}>
          {summary.communicationFit}
        </Text>
      </SummarySection>

      <SummarySection title="Noted Gaps">
        <Text selectable style={{ fontSize: 15, color: "#3A3A3A", lineHeight: 22 }}>
          {summary.notedGaps}
        </Text>
      </SummarySection>

      <Text selectable style={{ fontSize: 15, color: "#3A3A3A", lineHeight: 22 }}>
        <Text style={{ fontWeight: "700" }}>Availability: </Text>
        {summary.availability}
      </Text>
    </View>
  );
}

function NumberedList({ items }: { items: string[] }) {
  return (
    <View style={{ gap: 8 }}>
      {items.map((item, i) => (
        <View key={i} style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
          <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: "#F0F0F0", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
            <Text style={{ fontSize: 11, fontWeight: "700", color: "#8E8E8E" }}>{i + 1}</Text>
          </View>
          <Text style={{ flex: 1, fontSize: 14, color: "#3A3A3A", lineHeight: 20 }}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function CoachingCard({ interview, interviewStatus }: { interview: import("../../constants/mock-data").Interview; interviewStatus: InterviewStatus }) {
  const { brand } = useBrand();
  const template = useMemo(
    () => getBrandRoleTemplates(brand).find((t) => t.role === interview.role),
    [brand, interview.role]
  );

  if (!template) {
    return <PlaceholderCard label="No coaching template for this role" />;
  }

  // ── Upcoming: interview guide ─────────────────────────────────────────────
  if (interviewStatus === "upcoming") {
    return (
      <View style={{ gap: 12 }}>
        <View style={{ backgroundColor: "#fff", borderRadius: 14, borderCurve: "continuous", padding: 16, gap: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <Text style={{ fontSize: 15, fontWeight: "700", color: "#1A1A1A" }}>Interview Guide</Text>
          <Text style={{ fontSize: 13, color: "#8E8E8E", lineHeight: 18 }}>
            These are the key areas to evaluate for a {interview.role}. Use the questions below to probe each one.
          </Text>
        </View>

        {/* Criteria checklist */}
        <View style={{ backgroundColor: "#fff", borderRadius: 14, borderCurve: "continuous", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          {template.criteria.map((criterion, i) => (
            <View key={criterion.id}>
              <View style={{ padding: 14, gap: 3 }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#1A1A1A" }}>{criterion.label}</Text>
                <Text style={{ fontSize: 13, color: "#8E8E8E", lineHeight: 18 }}>{criterion.description}</Text>
              </View>
              {i < template.criteria.length - 1 && (
                <View style={{ height: 0.5, backgroundColor: "rgba(0,0,0,0.08)", marginLeft: 14 }} />
              )}
            </View>
          ))}
        </View>

        {/* Questions to ask */}
        <View style={{ backgroundColor: "#fff", borderRadius: 14, borderCurve: "continuous", padding: 16, gap: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <Text style={{ fontSize: 15, fontWeight: "700", color: "#1A1A1A" }}>Questions to Ask</Text>
          <NumberedList items={template.coachingPrompts} />
        </View>
      </View>
    );
  }

  // ── Past / in-progress: score breakdown + interviewer feedback ────────────
  const criterionScores: CriterionScore[] = interview.criterionScores ?? [];
  const totalMax = template.criteria.reduce((sum: number, c: ScoringCriterion) => sum + c.maxScore, 0);
  const totalScore = criterionScores.reduce((sum: number, cs: CriterionScore) => sum + cs.score, 0);
  const pct = totalMax > 0 ? totalScore / totalMax : 0;
  const feedback = interview.interviewerFeedback;

  return (
    <View style={{ gap: 12 }}>
      {/* Overall score */}
      {criterionScores.length > 0 && (
        <View style={{ backgroundColor: "#fff", borderRadius: 14, borderCurve: "continuous", padding: 16, gap: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontSize: 15, fontWeight: "700", color: "#1A1A1A" }}>Overall Score</Text>
            <Text style={{ fontSize: 20, fontWeight: "700", color: "#1A1A1A" }}>{totalScore}/{totalMax}</Text>
          </View>
          <View style={{ height: 6, backgroundColor: "#F0F0F0", borderRadius: 3 }}>
            <View style={{ height: 6, width: `${pct * 100}%`, backgroundColor: pct >= 0.8 ? "#2A6B3C" : pct >= 0.6 ? "#E6A817" : "#FF3B30", borderRadius: 3 }} />
          </View>
        </View>
      )}

      {/* Per-criterion breakdown */}
      <View style={{ backgroundColor: "#fff", borderRadius: 14, borderCurve: "continuous", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        {template.criteria.map((criterion, i) => {
          const cs = criterionScores.find((s: CriterionScore) => s.criterionId === criterion.id);
          const score = cs?.score ?? null;
          const barPct = score !== null ? score / criterion.maxScore : 0;
          return (
            <View key={criterion.id}>
              <View style={{ padding: 14, gap: 6 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={{ fontSize: 14, fontWeight: "600", color: "#1A1A1A", flex: 1 }}>{criterion.label}</Text>
                  <Text style={{ fontSize: 14, fontWeight: "600", color: score !== null ? "#1A1A1A" : "#C0C0C0" }}>
                    {score !== null ? `${score}/${criterion.maxScore}` : "—"}
                  </Text>
                </View>
                {cs?.note && <Text style={{ fontSize: 13, color: "#8E8E8E", lineHeight: 18 }}>{cs.note}</Text>}
                {score !== null && (
                  <View style={{ height: 4, backgroundColor: "#F0F0F0", borderRadius: 2, marginTop: 2 }}>
                    <View style={{ height: 4, width: `${barPct * 100}%`, backgroundColor: barPct >= 0.8 ? "#2A6B3C" : barPct >= 0.6 ? "#E6A817" : "#FF3B30", borderRadius: 2 }} />
                  </View>
                )}
              </View>
              {i < template.criteria.length - 1 && (
                <View style={{ height: 0.5, backgroundColor: "rgba(0,0,0,0.08)", marginLeft: 14 }} />
              )}
            </View>
          );
        })}
      </View>

      {/* Interviewer feedback */}
      {feedback ? (
        <View style={{ gap: 12 }}>
          <View style={{ backgroundColor: "#fff", borderRadius: 14, borderCurve: "continuous", padding: 16, gap: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <Text style={{ fontSize: 15, fontWeight: "700", color: "#1A1A1A" }}>Overall Impression</Text>
            <Text style={{ fontSize: 14, color: "#3A3A3A", lineHeight: 21 }}>{feedback.overallImpression}</Text>
          </View>

          <View style={{ backgroundColor: "#fff", borderRadius: 14, borderCurve: "continuous", padding: 16, gap: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Ionicons name="checkmark-circle" size={16} color="#2A6B3C" />
              <Text style={{ fontSize: 15, fontWeight: "700", color: "#1A1A1A" }}>What Went Well</Text>
            </View>
            <NumberedList items={feedback.whatWentWell} />
          </View>

          <View style={{ backgroundColor: "#fff", borderRadius: 14, borderCurve: "continuous", padding: 16, gap: 10, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Ionicons name="arrow-up-circle" size={16} color="#E6A817" />
              <Text style={{ fontSize: 15, fontWeight: "700", color: "#1A1A1A" }}>Areas to Improve</Text>
            </View>
            <NumberedList items={feedback.areasToImprove} />
          </View>

          <View style={{ backgroundColor: "#fff", borderRadius: 14, borderCurve: "continuous", padding: 16, gap: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Ionicons name="arrow-forward-circle" size={16} color="#1A1A1A" />
              <Text style={{ fontSize: 15, fontWeight: "700", color: "#1A1A1A" }}>Suggested Follow-up</Text>
            </View>
            <Text style={{ fontSize: 14, color: "#3A3A3A", lineHeight: 21 }}>{feedback.suggestedFollowUp}</Text>
          </View>
        </View>
      ) : (
        <PlaceholderCard label="Interviewer feedback" />
      )}
    </View>
  );
}

function PlaceholderCard({ label }: { label: string }) {
  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 14,
        borderCurve: "continuous",
        padding: 32,
        alignItems: "center",
        gap: 8,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      <Ionicons name="document-outline" size={28} color="#C0C0C0" />
      <Text style={{ fontSize: 14, color: "#A0A0A0" }}>{label} will appear here</Text>
    </View>
  );
}

// ─── Transcript Sheet ────────────────────────────────────────────────────────

type TranscriptLine = { speaker: "interviewer" | "candidate"; text: string };

const MOCK_TRANSCRIPT: TranscriptLine[] = [
  { speaker: "interviewer", text: "Thanks for coming in today. Can you start by telling me a bit about yourself?" },
  { speaker: "candidate",   text: "Sure! I've been working in food service for about three years. Most recently I was at Chipotle managing a team of eight people during peak hours." },
  { speaker: "interviewer", text: "That's great experience. How did you handle situations when the team was short-staffed?" },
  { speaker: "candidate",   text: "I'd jump in wherever needed — on the line, taking orders, whatever kept things moving. I'd also communicate clearly with the team so everyone knew the plan." },
  { speaker: "interviewer", text: "Can you give me an example of a time you resolved a conflict between team members?" },
  { speaker: "candidate",   text: "Yeah, we had two people butting heads over scheduling. I sat them both down separately, listened to each side, and then found a schedule that worked for everyone. Things smoothed out pretty quickly." },
  { speaker: "interviewer", text: "How's your availability looking? We need coverage on weekends." },
  { speaker: "candidate",   text: "I'm fully available Monday through Saturday. Sundays I have a family commitment in the morning but I could do afternoons." },
  { speaker: "interviewer", text: "That could work. Do you have any questions for us?" },
  { speaker: "candidate",   text: "Yeah — what does growth look like here? I'm interested in eventually moving into a shift lead or management role." },
];


// ─── Comments ───────────────────────────────────────────────────────────────

type CommentAuthor = {
  name: string;
  initials: string;
  role: "interviewer" | "admin";
  color: string;
};

const ADMIN_BY_BRAND: Record<string, CommentAuthor> = {
  potbelly: { name: "Brandi Adams", initials: "BA", role: "admin", color: "#5B5FC7" },
  tacobell: { name: "Ken Guardino", initials: "KG", role: "admin", color: "#5B5FC7" },
};

const ME: CommentAuthor = { name: "Me", initials: "BJ", role: "interviewer", color: "#2A6B3C" };

type Comment = {
  id: string;
  author: CommentAuthor;
  text: string;
  time: string;
};

function getMockComments(brand: string): Comment[] {
  const admin = ADMIN_BY_BRAND[brand] ?? ADMIN_BY_BRAND.potbelly;
  return [
    {
      id: "c1",
      author: admin,
      text: "Nice work on this one. The conflict resolution probing was solid \u2014 you got a specific example without leading him.",
      time: "Sun, 3:15 PM",
    },
    {
      id: "c2",
      author: ME,
      text: "Thanks! I almost let the scheduling question slide but circled back. Still didn\u2019t pin down Sunday availability though.",
      time: "Sun, 3:22 PM",
    },
    {
      id: "c3",
      author: admin,
      text: "Yeah, that\u2019s the one gap. Before we move forward, can you follow up with him on Sundays? Also \u2014 the \u201cover-qualified\u201d concern is real. Make sure to frame the development path early in the next conversation so he doesn\u2019t lose interest.",
      time: "Sun, 3:30 PM",
    },
    {
      id: "c4",
      author: ME,
      text: `@${admin.name} will do \u2014 I\u2019ll reach out tomorrow and report back.`,
      time: "Sun, 3:35 PM",
    },
    {
      id: "c5",
      author: admin,
      text: "Perfect. One more thing \u2014 next time try to ask about their long-term goals earlier in the conversation. He brought it up at the end but it would\u2019ve helped shape your questions throughout. Overall though, really strong interview @BJ.",
      time: "Sun, 3:42 PM",
    },
  ];
}

function renderCommentText(text: string) {
  // Match @Name or @First Last (greedy two-word match)
  const parts = text.split(/(@[A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/g);
  return parts.map((part, i) => {
    if (part.startsWith("@")) {
      return (
        <Text key={i} style={{ fontWeight: "600", color: "#5B5FC7" }}>
          {part}
        </Text>
      );
    }
    return <Text key={i}>{part}</Text>;
  });
}

function CommentsThread({
  comments,
  onSend,
}: {
  comments: Comment[];
  onSend: (text: string) => void;
}) {
  const [input, setInput] = useState("");

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setInput("");
  }

  return (
    <>
      <View style={{ backgroundColor: "#fff", borderRadius: 14, borderCurve: "continuous", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        {comments.map((comment, i) => (
          <View key={comment.id}>
            {i > 0 && <View style={{ height: 0.5, backgroundColor: "rgba(0,0,0,0.08)" }} />}
            <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 14 }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: comment.author.color, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: 13, fontWeight: "700", color: "#fff" }}>{comment.author.initials}</Text>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={{ fontSize: 13, fontWeight: "600", color: "#1A1A1A" }}>
                    {comment.author.name}
                  </Text>
                  {comment.author.role === "admin" && (
                    <View style={{ backgroundColor: "#EDEDFF", borderRadius: 6, borderCurve: "continuous", paddingHorizontal: 6, paddingVertical: 1 }}>
                      <Text style={{ fontSize: 11, fontWeight: "600", color: "#5B5FC7" }}>HR</Text>
                    </View>
                  )}
                  <Text style={{ fontSize: 12, color: "#8E8E8E" }}>{comment.time}</Text>
                </View>
                <Text style={{ fontSize: 14, color: "#3A3A3A", lineHeight: 20 }}>
                  {renderCommentText(comment.text)}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Compose */}
      <View style={{ backgroundColor: "#fff", borderRadius: 14, borderCurve: "continuous", paddingHorizontal: 12, paddingTop: 10, paddingBottom: 8, boxShadow: "0 1px 3px rgba(0,0,0,0.06)", gap: 6 }}>
        <TextInput
          style={{ fontSize: 14, color: "#1A1A1A", minHeight: 20, maxHeight: 80, paddingHorizontal: 2 }}
          placeholder="Add a comment..."
          placeholderTextColor="#8E8E8E"
          value={input}
          onChangeText={setInput}
          multiline
        />
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <TouchableOpacity
            onPress={() => setInput((prev) => prev + "@")}
            activeOpacity={0.7}
            style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: "#F0F0F0", alignItems: "center", justifyContent: "center" }}
          >
            <Ionicons name="at" size={16} color="#8E8E8E" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSend}
            activeOpacity={0.7}
            style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: input.trim() ? "#2A6B3C" : "#DEDEDE", alignItems: "center", justifyContent: "center" }}
          >
            <Ionicons name="send" size={14} color={input.trim() ? "#fff" : "#8E8E8E"} />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

// ─── Bottom Action Bars ───────────────────────────────────────────────────────

function UpcomingBar({ onStart }: { onStart: () => void }) {
  return (
    <TouchableOpacity onPress={onStart} activeOpacity={0.8}>
      <GlassView
        colorScheme="dark"
        style={{
          backgroundColor: "rgba(0,0,0,0.75)",
          borderRadius: 100,
          height: 52,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
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
  );
}

function formatSpeed(s: number) {
  return s === Math.floor(s) ? `${s}×` : `${s}×`;
}

function AudioPlayer({ uri, speed, onSpeedPress }: { uri: string; speed: number; onSpeedPress: () => void }) {
  const player = useAudioPlayer({ uri });
  const status = useAudioPlayerStatus(player);
  const [barWidth, setBarWidth] = useState(0);

  const current = status.currentTime ?? 0;
  const total = status.duration ?? 0;
  const progress = total > 0 ? current / total : 0;
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!status.playing && total > 0 && current >= total - 0.5) {
      setFinished(true);
    }
  }, [status.playing]);

  useEffect(() => {
    player.setPlaybackRate(speed);
  }, [speed]);

  function handlePlay() {
    if (finished) {
      player.seekTo(0);
      setFinished(false);
    }
    player.play();
  }

  function handleSeek(locationX: number) {
    if (total > 0 && barWidth > 0) {
      player.seekTo((locationX / barWidth) * total);
      setFinished(false);
    }
  }

  return (
    <>
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 100,
          borderCurve: "continuous",
          paddingVertical: 10,
          paddingHorizontal: 10,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          borderWidth: 1,
          borderColor: "rgba(0,0,0,0.07)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
        }}
      >
        <TouchableOpacity
          onPress={() => (status.playing ? player.pause() : handlePlay())}
          style={{
            backgroundColor: "#2D2D2D",
            borderRadius: 100,
            width: 44,
            height: 44,
            alignItems: "center",
            justifyContent: "center",
          }}
          activeOpacity={0.8}
        >
          <Ionicons name={status.playing ? "pause" : "play"} size={18} color="#fff" />
        </TouchableOpacity>

        <View style={{ flex: 1, gap: 6 }}>
          {/* Scrubber */}
          <View onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}>
            <Pressable
              style={{ height: 20, justifyContent: "center" }}
              onPress={(e) => handleSeek(e.nativeEvent.locationX)}
            >
              <View style={{ height: 3, backgroundColor: "#E0E0E0", borderRadius: 2 }}>
                <View
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: barWidth * progress,
                    backgroundColor: "#1A1A1A",
                    borderRadius: 2,
                  }}
                />
              </View>
              {barWidth > 0 && (
                <View
                  style={{
                    position: "absolute",
                    left: Math.max(0, barWidth * progress - 5),
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: "#1A1A1A",
                  }}
                />
              )}
            </Pressable>
          </View>
          {/* Times */}
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontSize: 12, color: "#8E8E8E", fontVariant: ["tabular-nums"] }}>
              {formatTime(current)}
            </Text>
            <Text style={{ fontSize: 12, color: "#8E8E8E", fontVariant: ["tabular-nums"] }}>
              {formatTime(total)}
            </Text>
          </View>
        </View>

        {/* Speed button */}
        <TouchableOpacity
          onPress={onSpeedPress}
          activeOpacity={0.7}
          style={{
            width: 44,
            height: 44,
            borderRadius: 100,
            backgroundColor: speed !== 1 ? "#2A6B3C" : "#F0F0F0",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: "700", color: speed !== 1 ? "#fff" : "#1A1A1A" }}>
            {formatSpeed(speed)}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

function PastBar({ onChat, onResume, recordingUri, speed, onSpeedPress }: { onChat: () => void; onResume: () => void; recordingUri: string | null; speed: number; onSpeedPress: () => void }) {
  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={0.8} onPress={onChat}>
          <GlassView
            colorScheme="dark"
            style={{
              backgroundColor: "#2A6B3C",
              borderRadius: 100,
              height: 52,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              overflow: "hidden",
            }}
          >
            <Ionicons name="sparkles" size={18} color="#fff" />
            <Text style={{ color: "#fff", fontSize: 15, fontWeight: "600" }}>
              Chat with Caliber
            </Text>
          </GlassView>
        </TouchableOpacity>
        <TouchableOpacity onPress={onResume} activeOpacity={0.8}>
          <GlassView
            colorScheme="dark"
            style={{
              backgroundColor: "rgba(0,0,0,0.75)",
              borderRadius: 100,
              width: 52,
              height: 52,
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <Ionicons name="mic" size={20} color="#fff" />
          </GlassView>
        </TouchableOpacity>
      </View>
      {recordingUri != null && <AudioPlayer uri={recordingUri} speed={speed} onSpeedPress={onSpeedPress} />}
    </View>
  );
}

type RecorderState = "idle" | "active" | "paused";

function InProgressBar({
  audioRecorder,
  onRecorderStateChange,
  onEnd,
}: {
  audioRecorder: ReturnType<typeof useAudioRecorder>;
  recorderState: RecorderState;
  onRecorderStateChange: (s: RecorderState) => void;
  onEnd: (uri: string | null) => void;
}) {
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);

  // Start or resume recording on mount
  useEffect(() => {
    let cancelled = false;

    async function startOrResume() {
      try {
        // Always do a fresh start (expo-audio doesn't support appending to stopped recordings)
        const { granted } = await requestRecordingPermissionsAsync();
        if (cancelled || !granted) {
          if (!granted) Alert.alert("Microphone access required", "Please allow microphone access in Settings to record interviews.");
          return;
        }
        await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
        await audioRecorder.prepareToRecordAsync();
        if (cancelled) return;
        audioRecorder.record();
        onRecorderStateChange("active");
      } catch (e) {
        console.warn("Recording start failed:", e);
      }
    }
    startOrResume();

    return () => { cancelled = true; };
  }, []);

  // Count-up timer
  useEffect(() => {
    if (paused) return;
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, [paused]);

  async function handlePause() {
    try {
      if (paused) {
        audioRecorder.record();
        onRecorderStateChange("active");
      } else {
        audioRecorder.pause();
        onRecorderStateChange("paused");
      }
      setPaused((p) => !p);
    } catch (e) {
      console.warn("Pause/resume failed:", e);
    }
  }

  async function handleEnd() {
    try {
      await audioRecorder.stop();
      onRecorderStateChange("idle");
    } catch (e) {
      console.warn("Stop failed:", e);
    }
    onEnd(audioRecorder.uri ?? null);
  }

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      {/* Pause / Resume */}
      <TouchableOpacity onPress={handlePause} activeOpacity={0.8}>
        <GlassView
          colorScheme="dark"
          style={{
            backgroundColor: "rgba(0,0,0,0.75)",
            borderRadius: 100,
            width: 52,
            height: 52,
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <Ionicons name={paused ? "play" : "pause"} size={20} color="#fff" />
        </GlassView>
      </TouchableOpacity>

      {/* Timer + waveform */}
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          backgroundColor: "rgba(255,255,255,0.85)",
          borderRadius: 100,
          height: 52,
          borderWidth: 1,
          borderColor: "rgba(0,0,0,0.08)",
        }}
      >
        <Text style={{ fontSize: 17, fontWeight: "600", color: "#1A1A1A", fontVariant: ["tabular-nums"] }}>
          {formatTime(elapsed)}
        </Text>
        {!paused && <AnimatedWaveform />}
      </View>

      {/* End */}
      <TouchableOpacity onPress={handleEnd} activeOpacity={0.8}>
        <GlassView
          colorScheme="light"
          style={{
            borderRadius: 100,
            paddingHorizontal: 24,
            height: 52,
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            backgroundColor: "rgba(255,255,255,0.85)",
            borderWidth: 1,
            borderColor: "rgba(0,0,0,0.12)",
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: "600", color: "#1A1A1A" }}>End</Text>
        </GlassView>
      </TouchableOpacity>
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function InterviewDetail() {
  const { id, status: statusParam, peek } = useLocalSearchParams<{
    id: string;
    status: InterviewStatus;
    peek?: string;
  }>();
  const isPeek = peek === "1";

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { brand } = useBrand();
  const interviewMap = useMemo(() => getBrandInterviewMap(brand), [brand]);
  const interview = interviewMap[id];
  const [status, setStatus] = useState<InterviewStatus>(statusParam ?? "upcoming");
  const [activeTab, setActiveTab] = useState<Tab>("Summary");
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [candidateStatus, setCandidateStatus] = useState<CandidateStatus>(
    interview?.candidateStatus ?? "Applied"
  );
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [recorderState, setRecorderState] = useState<RecorderState>("idle");
  const [speed, setSpeed] = useState(1);
  const [comments, setComments] = useState<Comment[]>(() => getMockComments(brand));
  const [showSpeedSheet, setShowSpeedSheet] = useState(false);
  const speedSheetRef = useRef<BottomSheet>(null);

  useEffect(() => {
    if (showSpeedSheet) {
      speedSheetRef.current?.expand();
    } else {
      speedSheetRef.current?.close();
    }
  }, [showSpeedSheet]);

  const renderBackdrop = useCallback(
    (props: React.ComponentProps<typeof BottomSheetBackdrop>) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} pressBehavior="close" />
    ),
    []
  );
  const toastY = useRef(new Animated.Value(100)).current;
  const toastOpacity = useRef(new Animated.Value(1)).current;
  const [toastVisible, setToastVisible] = useState(false);

  function showToast() {
    setToastVisible(true);
    toastY.setValue(100);
    toastOpacity.setValue(1);
    Animated.sequence([
      Animated.spring(toastY, { toValue: 0, useNativeDriver: true, bounciness: 8, speed: 14 }),
      Animated.delay(800),
      Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setToastVisible(false));
  }

  if (!interview) return null;

  const STATUS_OPTIONS: CandidateStatus[] = ["Applied", "Screening", "Shortlisted", "Hired", "Rejected"];

  function showStatusPicker() {
    if (process.env.EXPO_OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [...STATUS_OPTIONS, "Cancel"],
          cancelButtonIndex: STATUS_OPTIONS.length,
          title: "Update candidate status",
        },
        (index) => {
          if (index < STATUS_OPTIONS.length) setCandidateStatus(STATUS_OPTIONS[index]);
        }
      );
    } else {
      Alert.alert(
        "Update status",
        undefined,
        STATUS_OPTIONS.map((s) => ({ text: s, onPress: () => setCandidateStatus(s) }))
      );
    }
  }

  const statusStyle = STATUS_STYLE[candidateStatus];
  const bottomBarHeight = 52 + insets.bottom + 32;

  return (
    <>
      <Stack.Screen
        options={{
          headerLargeTitle: false,
          headerTitle: () => (
            <View style={{ alignItems: "center", gap: 1 }}>
              <Text style={{ fontSize: 17, fontWeight: "600", color: "#1A1A1A" }}>
                {interview.name}
              </Text>
              <Text style={{ fontSize: 12, color: "#8E8E8E" }}>
                {interview.role}
              </Text>
            </View>
          ),
        }}
      />

      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Menu icon="ellipsis">
          <Stack.Toolbar.MenuAction icon="bubble.left" onPress={() => router.push(`/chat?interviewId=${id}`)}>
            Chat with Caliber
          </Stack.Toolbar.MenuAction>
          <Stack.Toolbar.MenuAction icon="square.and.arrow.up" onPress={() => Alert.alert("Share summary", "Coming soon")}>
            Share summary
          </Stack.Toolbar.MenuAction>
          <Stack.Toolbar.MenuAction icon="pencil" onPress={() => router.push(`/interview/edit?id=${id}`)}>
            Edit candidate
          </Stack.Toolbar.MenuAction>
          <Stack.Toolbar.MenuAction
            icon="trash"
            destructive
            onPress={() =>
              Alert.alert("Delete interview", "This cannot be undone.", [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive" },
              ])
            }
          >
            Delete interview
          </Stack.Toolbar.MenuAction>
        </Stack.Toolbar.Menu>
      </Stack.Toolbar>

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        automaticallyAdjustKeyboardInsets
        keyboardDismissMode="on-drag"
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 16,
          gap: 16,
          paddingBottom: isPeek ? 32 : bottomBarHeight,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Pill badges */}
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          <Pill bg="#1A1A1A" color="#fff">
            <Ionicons name="calendar-outline" size={13} color="#fff" />
            <Text style={{ color: "#fff", fontWeight: "500", fontSize: 13 }}>
              {interview.date} • {interview.time}
            </Text>
          </Pill>
          {interview.score && (
            <Pill bg="#2A6B3C" color="#fff">
              <Ionicons name="checkmark-circle" size={14} color="#fff" />
              <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>
                {interview.score.value}/{interview.score.outOf}
              </Text>
            </Pill>
          )}
          <TouchableOpacity onPress={showStatusPicker} activeOpacity={0.7}>
            <Pill bg={statusStyle.bg} color={statusStyle.color}>
              <Text style={{ color: statusStyle.color, fontWeight: "600", fontSize: 13 }}>
                {candidateStatus}
              </Text>
              <Ionicons name="chevron-down" size={12} color={statusStyle.color} />
            </Pill>
          </TouchableOpacity>
        </View>

        {/* Tab bar */}
        <TabBar active={activeTab} onChange={setActiveTab} />

        {/* Tab content */}
        {activeTab === "Summary" && (
          <>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontSize: 24, fontWeight: "700", color: "#1A1A1A" }}>
                AI Summary
              </Text>
              {interview.aiSummary && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={async () => {
                    const s = interview.aiSummary!;
                    const text = [
                      `Experience: ${s.experienceSnapshot}`,
                      `Highlights: ${s.keyHighlights.join(", ")}`,
                      `Communication & Fit: ${s.communicationFit}`,
                      `Noted Gaps: ${s.notedGaps}`,
                      `Availability: ${s.availability}`,
                    ].join("\n\n");
                    await Clipboard.setStringAsync(text);
                    showToast();
                  }}
                >
                  <Ionicons name="copy-outline" size={20} color="#8E8E8E" />
                </TouchableOpacity>
              )}
            </View>
            {interview.aiSummary ? (
              <SummaryCard summary={interview.aiSummary} />
            ) : (
              <PlaceholderCard label="AI Summary" />
            )}
          </>
        )}
        {activeTab === "Coaching" && <CoachingCard interview={interview} interviewStatus={status} />}
        {activeTab === "Transcript" && (
          <>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontSize: 24, fontWeight: "700", color: "#1A1A1A" }}>Transcript</Text>
              {status === "past" && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={async () => {
                    const text = MOCK_TRANSCRIPT.map((l) =>
                      `${l.speaker === "interviewer" ? "Me" : interview.name}: ${l.text}`
                    ).join("\n\n");
                    await Clipboard.setStringAsync(text);
                    showToast();
                  }}
                >
                  <Ionicons name="copy-outline" size={20} color="#8E8E8E" />
                </TouchableOpacity>
              )}
            </View>
            {status === "past" ? (
              <View style={{ backgroundColor: "#fff", borderRadius: 14, borderCurve: "continuous", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                {MOCK_TRANSCRIPT.map((line, i) => {
                  const isInterviewer = line.speaker === "interviewer";
                  const initial = interview.name.trim()[0]?.toUpperCase() ?? "?";
                  const showDivider = i > 0;
                  return (
                    <View key={i}>
                      {showDivider && <View style={{ height: 0.5, backgroundColor: "rgba(0,0,0,0.12)" }} />}
                      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 14 }}>
                        {isInterviewer ? (
                          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#F0F0F0", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                            <Image source={brand === "potbelly" ? potbellyLogo : tacoBellLogo} style={{ width: 22, height: 22 }} contentFit="contain" />
                          </View>
                        ) : (
                          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#D4A574", alignItems: "center", justifyContent: "center" }}>
                            <Text style={{ fontSize: 15, fontWeight: "700", color: "#fff" }}>{initial}</Text>
                          </View>
                        )}
                        <View style={{ flex: 1, gap: 2 }}>
                          <Text style={{ fontSize: 13, fontWeight: "600", color: "#1A1A1A" }}>
                            {isInterviewer ? "Me" : interview.name}
                          </Text>
                          <Text style={{ fontSize: 14, color: "#3A3A3A", lineHeight: 20 }}>{line.text}</Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
              <PlaceholderCard label="Transcript" />
            )}
          </>
        )}
        {activeTab === "Comments" && (
          <CommentsThread
            comments={comments}
            onSend={(text) => {
              setComments((prev) => [
                ...prev,
                {
                  id: `c-${Date.now()}`,
                  author: ME,
                  text,
                  time: "Just now",
                },
              ]);
            }}
          />
        )}
      </ScrollView>

      {/* Floating action bar */}
      {!isPeek && (
        <View
          style={{
            position: "absolute",
            bottom: insets.bottom + 16,
            left: 24,
            right: 24,
          }}
        >
          {status === "upcoming" && (
            <UpcomingBar onStart={() => setStatus("inprogress")} />
          )}
          {status === "past" && <PastBar onChat={() => router.push(`/chat?interviewId=${id}`)} onResume={() => setStatus("inprogress")} recordingUri={recordingUri} speed={speed} onSpeedPress={() => setShowSpeedSheet(true)} />}
          {status === "inprogress" && (
            <InProgressBar
              audioRecorder={audioRecorder}
              recorderState={recorderState}
              onRecorderStateChange={setRecorderState}
              onEnd={(uri) => { setRecordingUri(uri); setStatus("past"); }}
            />
          )}
        </View>
      )}

      {/* Toast */}
      {toastVisible && (
        <Animated.View
          pointerEvents="none"
          style={{
            position: "absolute",
            bottom: insets.bottom + 90,
            alignSelf: "center",
            transform: [{ translateY: toastY }],
            opacity: toastOpacity,
            backgroundColor: "#1A1A1A",
            borderRadius: 20,
            height: 40,
            paddingHorizontal: 16,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
          }}
        >
          <Ionicons name="copy-outline" size={22} color="#fff" />
          <View>
            <Text style={{ fontSize: 15, fontWeight: "600", color: "#fff" }}>Copied to clipboard</Text>
          </View>
        </Animated.View>
      )}

      <BottomSheet
        ref={speedSheetRef}
        index={-1}
        enableDynamicSizing
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        onClose={() => setShowSpeedSheet(false)}
      >
        <BottomSheetView style={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 24 }}>
          {/* Large speed readout */}
          <Text style={{ fontSize: 52, fontWeight: "700", color: "#1A1A1A", textAlign: "center", marginTop: 8, marginBottom: 28 }}>
            {speed % 1 === 0 ? `${speed}.0×` : `${speed}×`}
          </Text>
          {/* Preset pills */}
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 10, marginBottom: 8 }}>
            {([0.5, 1, 1.5, 2, 2.5, 3, 3.5] as number[]).map((p) => {
              const active = speed === p;
              return (
                <TouchableOpacity
                  key={p}
                  onPress={() => setSpeed(p)}
                  activeOpacity={0.7}
                  style={{
                    paddingVertical: 10,
                    paddingHorizontal: 18,
                    borderRadius: 20,
                    backgroundColor: active ? "#2A6B3C" : "#F0F0F0",
                  }}
                >
                  <Text style={{ fontSize: 15, fontWeight: "600", color: active ? "#fff" : "#1A1A1A" }}>
                    {p % 1 === 0 ? `${p}.0×` : `${p}×`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </BottomSheetView>
      </BottomSheet>
    </>
  );
}
