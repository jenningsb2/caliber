import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useRef, useState } from "react";
import {
  ActionSheetIOS,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getBrandInterviewMap } from "../constants/mock-data";
import { useBrand } from "../contexts/brand-context";

// ─── Types ──────────────────────────────────────────────────────────────────

type Scope = "today" | "past7" | "past30";

const SCOPE_LABELS: Record<Scope, string> = {
  today: "Today",
  past7: "Past 7 days",
  past30: "Past 30 days",
};

interface Footnote {
  index: number;
  interviewId: string;
  label: string; // e.g. "Marcus Webb — Shift Lead"
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  footnotes?: Footnote[];
  thinkingSeconds?: number;
}

// ─── Mock responses ─────────────────────────────────────────────────────────

const SUGGESTED_GENERAL = [
  "Who should I follow up with?",
  "Compare my shift lead candidates",
  "Who's ready to hire?",
  "What are the biggest concerns?",
];

const SUGGESTED_SCOPED = [
  "Summarize this interview",
  "What were the key strengths?",
  "What should I ask in a follow-up?",
  "How does this candidate compare?",
];

function getMockResponse(question: string, interviewId?: string, brand?: string): ChatMessage {
  const q = question.toLowerCase();

  if (interviewId) {
    return getScopedResponse(question, interviewId);
  }

  if (q.includes("follow up")) {
    return {
      id: Date.now().toString(),
      role: "assistant",
      thinkingSeconds: 4,
      content: `Based on your recent interviews, here are the candidates who need follow-up:

**Ready to advance:**
\u2022 **Marcus Webb** \u2014 Shift Lead. Score: 23/25. Schedule a second conversation about growth expectations and confirm Sunday availability. [1]
\u2022 **Priya Nair** \u2014 Cashier. Score: 24/25. Confirm PM shift availability \u2014 if she's open to evenings, move to offer. [2]

**Needs clarification:**
\u2022 **Carlos Mendoza** \u2014 Delivery Driver. Request driving record and written confirmation of weekend availability. [3]
\u2022 **Fatima Al-Hassan** \u2014 Cashier. Get manager reference on cash handling and clarify Sunday coverage. [4]

**Revisit later:**
\u2022 **Noah Reyes** \u2014 Shift Lead. Revisit in 6\u20138 weeks when weekend availability opens. Ask him to get food handler certified as a commitment signal. [5]`,
      footnotes: [
        { index: 1, interviewId: "5", label: "Marcus Webb \u2014 Shift Lead" },
        { index: 2, interviewId: "7", label: "Priya Nair \u2014 Cashier" },
        { index: 3, interviewId: "6", label: "Carlos Mendoza \u2014 Delivery Driver" },
        { index: 4, interviewId: "11", label: "Fatima Al-Hassan \u2014 Cashier" },
        { index: 5, interviewId: "12", label: "Noah Reyes \u2014 Shift Lead" },
      ],
    };
  }

  if (q.includes("shift lead") || q.includes("compare")) {
    return {
      id: Date.now().toString(),
      role: "assistant",
      thinkingSeconds: 6,
      content: `You've interviewed 3 shift lead candidates recently. Here's how they compare:

**Marcus Webb** \u2014 Score: 23/25 \u2b50 Top pick
Strongest overall. 5 years food service, direct leadership at Chipotle and Panera. ServSafe certified. Only gap: no Sunday availability. [1]

**James Okafor** \u2014 Score: 20/25
Solid and dependable. 4 years QSR, 1 year formal lead at Subway. Reduced waste 15%. Conflict resolution is a known gap. Weekday afternoons/evenings only. [2]

**Noah Reyes** \u2014 Score: 19/25
High potential, not ready yet. Informal lead at Taco Bell, no official title. Enthusiastic but answers lack structure. No weekends for 2 months. [3]

**Recommendation:** Marcus is the clear frontrunner. James is a reliable backup for weekday-heavy coverage. Noah is a hold-and-develop candidate.`,
      footnotes: [
        { index: 1, interviewId: "5", label: "Marcus Webb \u2014 Shift Lead" },
        { index: 2, interviewId: "8", label: "James Okafor \u2014 Shift Lead" },
        { index: 3, interviewId: "12", label: "Noah Reyes \u2014 Shift Lead" },
      ],
    };
  }

  if (q.includes("ready to hire") || q.includes("hire")) {
    return {
      id: Date.now().toString(),
      role: "assistant",
      thinkingSeconds: 3,
      content: `Two candidates are closest to offer-ready:

**Priya Nair** \u2014 Cashier. Score: 24/25.
Exceptional customer service, POS-trained, bilingual. Only needs PM shift confirmation. If she's flexible on evenings, extend the offer. [1]

**Marcus Webb** \u2014 Shift Lead. Score: 23/25.
Strong leadership, certified, experienced. Needs a second conversation about growth path and Sunday availability before committing. [2]

Everyone else needs either more information, scheduling alignment, or a follow-up conversation before advancing.`,
      footnotes: [
        { index: 1, interviewId: "7", label: "Priya Nair \u2014 Cashier" },
        { index: 2, interviewId: "5", label: "Marcus Webb \u2014 Shift Lead" },
      ],
    };
  }

  if (q.includes("concern") || q.includes("biggest")) {
    return {
      id: Date.now().toString(),
      role: "assistant",
      thinkingSeconds: 5,
      content: `Across your recent interviews, these issues came up most:

**Availability gaps**
4 of your candidates have scheduling constraints. Weekends are the most common conflict \u2014 especially Marcus Webb [1] (no Sundays), James Okafor [2] (weekdays only), and Noah Reyes [3] (no weekends for 2 months).

**Unverified claims**
Carlos Mendoza's on-time delivery rate and driving record are self-reported with no documentation [4]. Fatima Al-Hassan's cash handling claim needs a manager reference [5].

**Experience depth**
Noah Reyes [3] and Imani Jackson [6] both lack formal experience for their target roles. They're coachable but would need significant onboarding investment.`,
      footnotes: [
        { index: 1, interviewId: "5", label: "Marcus Webb \u2014 Shift Lead" },
        { index: 2, interviewId: "8", label: "James Okafor \u2014 Shift Lead" },
        { index: 3, interviewId: "12", label: "Noah Reyes \u2014 Shift Lead" },
        { index: 4, interviewId: "6", label: "Carlos Mendoza \u2014 Delivery Driver" },
        { index: 5, interviewId: "11", label: "Fatima Al-Hassan \u2014 Cashier" },
        { index: 6, interviewId: "13", label: "Imani Jackson \u2014 Sandwich Associate" },
      ],
    };
  }

  // Fallback
  return {
    id: Date.now().toString(),
    role: "assistant",
    thinkingSeconds: 3,
    content: `I looked across your recent interviews but couldn't find a specific match for that question. Try asking about follow-ups, candidate comparisons, or hiring readiness.`,
  };
}

function getScopedResponse(question: string, interviewId: string): ChatMessage {
  const q = question.toLowerCase();

  if (q.includes("summarize") || q.includes("summary")) {
    return {
      id: Date.now().toString(),
      role: "assistant",
      thinkingSeconds: 4,
      content: `Here's a quick summary of this interview:

The candidate demonstrated solid experience and came prepared with specific examples. Key discussion points included their prior role responsibilities, availability, and growth goals.

Check the **Summary** tab on the interview detail for the full AI-generated breakdown including experience snapshot, key highlights, and noted gaps.`,
    };
  }

  if (q.includes("strength")) {
    return {
      id: Date.now().toString(),
      role: "assistant",
      thinkingSeconds: 3,
      content: `Based on the interview scoring, the top-rated criteria were:

\u2022 Areas where the candidate scored 5/5 showed real depth \u2014 specific examples, measurable outcomes, and unprompted detail.
\u2022 Communication came across as confident and well-structured.
\u2022 Prior experience aligned closely with the role requirements.

The **Coaching** tab has more detail on what went well and areas for follow-up.`,
    };
  }

  if (q.includes("follow-up") || q.includes("follow up") || q.includes("ask")) {
    return {
      id: Date.now().toString(),
      role: "assistant",
      thinkingSeconds: 5,
      content: `For the follow-up conversation, focus on the gaps identified in the initial interview:

\u2022 **Availability** \u2014 If there were scheduling constraints, get specific dates and confirm flexibility.
\u2022 **Unverified claims** \u2014 Ask for documentation or references for any self-reported metrics.
\u2022 **Growth expectations** \u2014 If the candidate mentioned career goals, align on what the development path looks like at your location.

Keep it conversational \u2014 the goal is to fill in gaps, not re-interview.`,
    };
  }

  if (q.includes("compare")) {
    return {
      id: Date.now().toString(),
      role: "assistant",
      thinkingSeconds: 4,
      content: `Compared to other candidates for the same role, this candidate sits in the upper range based on overall score and interviewer feedback.

To see a side-by-side comparison, try asking me in the general chat (without an interview selected) \u2014 I can compare all candidates for a given position.`,
    };
  }

  return {
    id: Date.now().toString(),
    role: "assistant",
    thinkingSeconds: 3,
    content: `I reviewed the data from this interview. Try asking about the summary, key strengths, follow-up questions, or how this candidate compares to others.`,
  };
}

// ─── Text renderer ──────────────────────────────────────────────────────────

function RichText({
  content,
  footnotes,
  onFootnoteTap,
}: {
  content: string;
  footnotes?: Footnote[];
  onFootnoteTap?: (interviewId: string) => void;
}) {
  const lines = content.split("\n");

  return (
    <View style={styles.richTextContainer}>
      {lines.map((line, lineIdx) => {
        if (line.trim() === "") {
          return <View key={lineIdx} style={styles.richTextSpacer} />;
        }

        const isBullet = line.trimStart().startsWith("\u2022");

        return (
          <View
            key={lineIdx}
            style={isBullet ? styles.bulletRow : undefined}
          >
            <Text style={styles.assistantText}>
              {renderInline(line, footnotes, onFootnoteTap)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function renderInline(
  text: string,
  footnotes?: Footnote[],
  onFootnoteTap?: (interviewId: string) => void
): React.ReactNode[] {
  // Split on bold markers and footnote refs
  const parts = text.split(/(\*\*[^*]+\*\*|\[\d+\])/g);

  return parts.map((part, i) => {
    // Bold
    const boldMatch = part.match(/^\*\*(.+)\*\*$/);
    if (boldMatch) {
      return (
        <Text key={i} style={styles.boldText}>
          {boldMatch[1]}
        </Text>
      );
    }

    // Footnote
    const fnMatch = part.match(/^\[(\d+)\]$/);
    if (fnMatch && footnotes) {
      const fnIndex = parseInt(fnMatch[1]);
      const fn = footnotes.find((f) => f.index === fnIndex);
      if (fn && onFootnoteTap) {
        return (
          <Text
            key={i}
            style={styles.footnoteLink}
            onPress={() => onFootnoteTap(fn.interviewId)}
          >
            [{fnIndex}]
          </Text>
        );
      }
    }

    return <Text key={i}>{part}</Text>;
  });
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function ChatHeader({ onNewChat }: { onNewChat: () => void }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
      <TouchableOpacity
        style={styles.headerButton}
        activeOpacity={0.7}
        onPress={() => router.back()}
      >
        <Ionicons name="chevron-back" size={22} color="#1A1A1A" />
      </TouchableOpacity>

      <View style={styles.headerRight}>
        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.7}
          onPress={onNewChat}
        >
          <Ionicons name="create-outline" size={20} color="#1A1A1A" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerButton}
          activeOpacity={0.7}
          onPress={() => router.push("/chat-history")}
        >
          <Ionicons name="time-outline" size={20} color="#1A1A1A" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function SuggestedQuestions({
  questions,
  onSelect,
}: {
  questions: string[];
  onSelect: (q: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.suggestionsContent}
      style={styles.suggestionsScroll}
    >
      {questions.map((q) => (
        <TouchableOpacity
          key={q}
          style={styles.suggestionPill}
          activeOpacity={0.7}
          onPress={() => onSelect(q)}
        >
          <Text style={styles.suggestionText}>{q}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

function ThinkingIndicator({ seconds }: { seconds?: number }) {
  return (
    <View style={styles.thinkingRow}>
      <Text style={styles.thinkingText}>
        {seconds ? `Thought for ${seconds}s` : "Thinking\u2026"}
      </Text>
    </View>
  );
}

function MessageView({
  message,
  onFootnoteTap,
}: {
  message: ChatMessage;
  onFootnoteTap: (interviewId: string) => void;
}) {
  if (message.role === "user") {
    return (
      <View style={styles.userMessageRow}>
        <Text style={styles.userMessageText}>{message.content}</Text>
      </View>
    );
  }

  return (
    <View style={styles.assistantMessageRow}>
      {message.thinkingSeconds && (
        <ThinkingIndicator seconds={message.thinkingSeconds} />
      )}
      <RichText
        content={message.content}
        footnotes={message.footnotes}
        onFootnoteTap={onFootnoteTap}
      />
    </View>
  );
}

function InputBar({
  value,
  onChangeText,
  onSend,
  scopeLabel,
  onScopePress,
  placeholder,
}: {
  value: string;
  onChangeText: (t: string) => void;
  onSend: () => void;
  scopeLabel: string;
  onScopePress?: () => void;
  placeholder: string;
}) {
  const canSend = value.trim().length > 0;

  return (
    <View style={styles.inputBar}>
      <TextInput
        style={styles.inputText}
        placeholder={placeholder}
        placeholderTextColor="#8E8E8E"
        value={value}
        onChangeText={onChangeText}
        multiline
        returnKeyType="default"
      />
      <View style={styles.inputBottomRow}>
        <TouchableOpacity
          style={styles.scopePill}
          activeOpacity={0.7}
          onPress={onScopePress}
        >
          <Text style={styles.scopeText}>{scopeLabel}</Text>
          {onScopePress && (
            <Ionicons name="chevron-up" size={14} color="#8E8E8E" />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sendButton, canSend && styles.sendButtonActive]}
          activeOpacity={0.7}
          onPress={onSend}
          disabled={!canSend}
        >
          <Ionicons
            name="send"
            size={16}
            color={canSend ? "#fff" : "#8E8E8E"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Screen ─────────────────────────────────────────────────────────────────

export default function ChatScreen() {
  const { interviewId } = useLocalSearchParams<{ interviewId?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { brand } = useBrand();

  const interviewMap = useMemo(() => getBrandInterviewMap(brand), [brand]);
  const scopedInterview = interviewId ? interviewMap[interviewId] : undefined;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [scope, setScope] = useState<Scope>("past7");
  const [isThinking, setIsThinking] = useState(false);

  const scrollRef = useRef<ScrollView>(null);

  const suggestedQuestions = scopedInterview ? SUGGESTED_SCOPED : SUGGESTED_GENERAL;
  const hasMessages = messages.length > 0;

  function handleScopePress() {
    if (scopedInterview) return; // no scope change in interview mode
    const options: Scope[] = ["today", "past7", "past30"];
    const labels = options.map((o) => SCOPE_LABELS[o]);
    ActionSheetIOS.showActionSheetWithOptions(
      {
        title: "Chat scope",
        options: [...labels, "Cancel"],
        cancelButtonIndex: labels.length,
        tintColor: "#1A1A1A",
      },
      (i) => {
        if (i < options.length) setScope(options[i]);
      }
    );
  }

  function handleSend(text?: string) {
    const content = (text ?? inputText).trim();
    if (!content || isThinking) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsThinking(true);

    // Simulate thinking delay
    const mockResponse = getMockResponse(content, interviewId, brand);
    const delay = (mockResponse.thinkingSeconds ?? 2) * 250; // compressed for UX

    setTimeout(() => {
      setMessages((prev) => [...prev, { ...mockResponse, id: `ai-${Date.now()}` }]);
      setIsThinking(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }, delay);

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }

  function handleFootnoteTap(id: string) {
    router.push(`/interview/${id}?status=past&peek=1`);
  }

  const scopeLabel = scopedInterview
    ? `${scopedInterview.name} \u2014 ${scopedInterview.role}`
    : SCOPE_LABELS[scope];

  const placeholder = scopedInterview
    ? `Ask about ${scopedInterview.name}...`
    : "Chat with all your interviews";

  return (
    <View style={styles.screen}>
      <ChatHeader onNewChat={() => setMessages([])} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Messages area */}
        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={[
            styles.messagesContent,
            !hasMessages && styles.messagesContentEmpty,
          ]}
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => (
            <MessageView
              key={msg.id}
              message={msg}
              onFootnoteTap={handleFootnoteTap}
            />
          ))}
          {isThinking && <ThinkingIndicator />}
        </ScrollView>

        {/* Suggested questions */}
        {!hasMessages && (
          <SuggestedQuestions
            questions={suggestedQuestions}
            onSelect={(q) => handleSend(q)}
          />
        )}

        {/* Input bar */}
        <View style={{ paddingBottom: insets.bottom + 8 }}>
          <InputBar
            value={inputText}
            onChangeText={setInputText}
            onSend={() => handleSend()}
            scopeLabel={scopeLabel}
            onScopePress={scopedInterview ? undefined : handleScopePress}
            placeholder={placeholder}
          />
        </View>
      </KeyboardAvoidingView>
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
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
  },
  headerRight: {
    flexDirection: "row",
    gap: 8,
  },

  // Messages
  messagesContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 20,
  },
  messagesContentEmpty: {
    flex: 1,
  },
  userMessageRow: {
    alignItems: "flex-end",
  },
  userMessageText: {
    fontSize: 16,
    color: "#8E8E8E",
    maxWidth: "85%",
  },
  assistantMessageRow: {
    gap: 8,
  },

  // Rich text
  richTextContainer: {
    gap: 2,
  },
  richTextSpacer: {
    height: 10,
  },
  assistantText: {
    fontSize: 15,
    color: "#1A1A1A",
    lineHeight: 22,
  },
  boldText: {
    fontWeight: "700",
    color: "#1A1A1A",
  },
  bulletRow: {
    paddingLeft: 4,
  },
  footnoteLink: {
    color: "#2A6B3C",
    fontSize: 13,
    fontWeight: "600",
  },

  // Thinking
  thinkingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  thinkingText: {
    fontSize: 13,
    color: "#8E8E8E",
    fontStyle: "italic",
  },

  // Suggestions
  suggestionsScroll: {
    flexGrow: 0,
    marginBottom: 8,
  },
  suggestionsContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  suggestionPill: {
    borderWidth: 1,
    borderColor: "#DEDEDE",
    borderRadius: 20,
    borderCurve: "continuous",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  suggestionText: {
    fontSize: 14,
    color: "#1A1A1A",
  },

  // Input bar
  inputBar: {
    marginHorizontal: 16,
    backgroundColor: "#F0F0F0",
    borderRadius: 18,
    borderCurve: "continuous",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    gap: 8,
  },
  inputText: {
    fontSize: 15,
    color: "#1A1A1A",
    maxHeight: 100,
    minHeight: 20,
  },
  inputBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  scopePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  scopeText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#8E8E8E",
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#DEDEDE",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonActive: {
    backgroundColor: "#2A6B3C",
  },
});
