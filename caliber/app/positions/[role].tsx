import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ROLE_TEMPLATES, type ScoringCriterion } from "../../constants/mock-data";

function CriterionRow({
  criterion,
  onEdit,
  onDelete,
}: {
  criterion: ScoringCriterion;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <View>
      <View style={{ padding: 14, flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ fontSize: 15, fontWeight: "600", color: "#1A1A1A" }}>{criterion.label}</Text>
          <Text style={{ fontSize: 13, color: "#8E8E8E", lineHeight: 18 }}>{criterion.description}</Text>
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity onPress={onEdit} activeOpacity={0.7} style={{ padding: 4 }}>
            <Ionicons name="pencil-outline" size={16} color="#8E8E8E" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} activeOpacity={0.7} style={{ padding: 4 }}>
            <Ionicons name="trash-outline" size={16} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function CriterionForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Partial<ScoringCriterion>;
  onSave: (c: Omit<ScoringCriterion, "id">) => void;
  onCancel: () => void;
}) {
  const [label, setLabel] = useState(initial?.label ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const valid = label.trim().length > 0 && description.trim().length > 0;

  return (
    <View
      style={{
        backgroundColor: "#F7F7F7",
        borderRadius: 12,
        borderCurve: "continuous",
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.08)",
        padding: 14,
        gap: 10,
      }}
    >
      <TextInput
        placeholder="Criterion label (e.g. Leadership Experience)"
        placeholderTextColor="#B0B0B0"
        value={label}
        onChangeText={setLabel}
        style={{ fontSize: 15, color: "#1A1A1A", fontWeight: "600" }}
      />
      <View style={{ height: 0.5, backgroundColor: "rgba(0,0,0,0.08)" }} />
      <TextInput
        placeholder="What are you evaluating? (e.g. Has managed or led a team…)"
        placeholderTextColor="#B0B0B0"
        value={description}
        onChangeText={setDescription}
        multiline
        style={{ fontSize: 14, color: "#3A3A3A", lineHeight: 20, minHeight: 56 }}
      />
      <View style={{ flexDirection: "row", gap: 8, marginTop: 2 }}>
        <TouchableOpacity
          onPress={onCancel}
          style={{ flex: 1, height: 40, borderRadius: 10, borderCurve: "continuous", backgroundColor: "#EBEBEB", alignItems: "center", justifyContent: "center" }}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 14, fontWeight: "600", color: "#1A1A1A" }}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => valid && onSave({ label: label.trim(), description: description.trim(), maxScore: 5 })}
          style={{ flex: 1, height: 40, borderRadius: 10, borderCurve: "continuous", backgroundColor: valid ? "#1A1A1A" : "#C0C0C0", alignItems: "center", justifyContent: "center" }}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 14, fontWeight: "600", color: "#fff" }}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function PositionDetailScreen() {
  const { role: roleParam, generated: generatedParam } = useLocalSearchParams<{ role: string; generated?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const decoded = decodeURIComponent(roleParam ?? "");
  const template = ROLE_TEMPLATES.find((t) => t.role === decoded);

  const generatedData = generatedParam ? JSON.parse(generatedParam) : null;

  const [criteria, setCriteria] = useState<ScoringCriterion[]>(() => {
    if (generatedData) {
      return generatedData.criteria.map((c: Omit<ScoringCriterion, "id">, i: number) => ({ ...c, id: `gen-${i}` }));
    }
    return template?.criteria ?? [];
  });
  const [coachingPrompts, setCoachingPrompts] = useState<string[]>(
    generatedData?.coachingPrompts ?? template?.coachingPrompts ?? []
  );
  const [addingCriterion, setAddingCriterion] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addingPrompt, setAddingPrompt] = useState(false);
  const [newPrompt, setNewPrompt] = useState("");

  const totalMax = criteria.reduce((s, c) => s + c.maxScore, 0);

  function handleAddCriterion(c: Omit<ScoringCriterion, "id">) {
    const id = `custom-${Date.now()}`;
    setCriteria((prev) => [...prev, { ...c, id }]);
    setAddingCriterion(false);
  }

  function handleEditCriterion(id: string, c: Omit<ScoringCriterion, "id">) {
    setCriteria((prev) => prev.map((x) => (x.id === id ? { ...c, id } : x)));
    setEditingId(null);
  }

  function handleDeleteCriterion(id: string) {
    Alert.alert("Remove criterion", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => setCriteria((prev) => prev.filter((x) => x.id !== id)) },
    ]);
  }

  function handleAddPrompt() {
    if (newPrompt.trim()) {
      setCoachingPrompts((prev) => [...prev, newPrompt.trim()]);
      setNewPrompt("");
      setAddingPrompt(false);
    }
  }

  function handleDeletePrompt(i: number) {
    setCoachingPrompts((prev) => prev.filter((_, idx) => idx !== i));
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: decoded,
          headerLargeTitle: false,
        }}
      />

      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button onPress={() => router.back()}>Cancel</Stack.Toolbar.Button>
      </Stack.Toolbar>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button variant="done">Save</Stack.Toolbar.Button>
      </Stack.Toolbar>

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, gap: 20, paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* AI-generated banner */}
        {generatedData && (
          <View style={{ backgroundColor: "#1A1A1A", borderRadius: 12, borderCurve: "continuous", padding: 14, flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Ionicons name="sparkles-outline" size={16} color="#fff" />
            <Text style={{ flex: 1, fontSize: 13, color: "#fff", lineHeight: 18 }}>
              Criteria and questions were generated from the job description. Review and edit before saving.
            </Text>
          </View>
        )}

        {/* Summary */}
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 14,
            borderCurve: "continuous",
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}
        >
          <View style={{ width: 44, height: 44, borderRadius: 10, borderCurve: "continuous", backgroundColor: "#F0F0F0", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="briefcase-outline" size={20} color="#1A1A1A" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 17, fontWeight: "600", color: "#1A1A1A" }}>{decoded}</Text>
            <Text style={{ fontSize: 13, color: "#8E8E8E", marginTop: 2 }}>
              {criteria.length} criteria • {totalMax} pts total
            </Text>
          </View>
        </View>

        {/* Scoring Criteria */}
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 13, fontWeight: "600", color: "#8E8E8E", textTransform: "uppercase", letterSpacing: 0.5, marginLeft: 2 }}>
            Scoring Criteria
          </Text>
          <View style={{ backgroundColor: "#fff", borderRadius: 14, borderCurve: "continuous", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            {criteria.map((criterion, i) => (
              <View key={criterion.id}>
                {editingId === criterion.id ? (
                  <View style={{ padding: 14 }}>
                    <CriterionForm
                      initial={criterion}
                      onSave={(c) => handleEditCriterion(criterion.id, c)}
                      onCancel={() => setEditingId(null)}
                    />
                  </View>
                ) : (
                  <CriterionRow
                    criterion={criterion}
                    onEdit={() => setEditingId(criterion.id)}
                    onDelete={() => handleDeleteCriterion(criterion.id)}
                  />
                )}
                {i < criteria.length - 1 && (
                  <View style={{ height: 0.5, backgroundColor: "rgba(0,0,0,0.08)", marginLeft: 46 }} />
                )}
              </View>
            ))}

            {addingCriterion && (
              <View style={{ padding: 14 }}>
                <CriterionForm
                  onSave={handleAddCriterion}
                  onCancel={() => setAddingCriterion(false)}
                />
              </View>
            )}

            {!addingCriterion && (
              <TouchableOpacity
                onPress={() => setAddingCriterion(true)}
                activeOpacity={0.7}
                style={{ flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderTopWidth: criteria.length > 0 ? 0.5 : 0, borderTopColor: "rgba(0,0,0,0.08)" }}
              >
                <Ionicons name="add-circle-outline" size={20} color="#8E8E8E" />
                <Text style={{ fontSize: 15, color: "#8E8E8E" }}>Add criterion</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Coaching Prompts */}
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 13, fontWeight: "600", color: "#8E8E8E", textTransform: "uppercase", letterSpacing: 0.5, marginLeft: 2 }}>
            Interview Questions
          </Text>
          <View style={{ backgroundColor: "#fff", borderRadius: 14, borderCurve: "continuous", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            {coachingPrompts.map((prompt, i) => (
              <View key={i}>
                <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 14 }}>
                  <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: "#F0F0F0", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: "#8E8E8E" }}>{i + 1}</Text>
                  </View>
                  <Text style={{ flex: 1, fontSize: 14, color: "#3A3A3A", lineHeight: 20 }}>{prompt}</Text>
                  <TouchableOpacity onPress={() => handleDeletePrompt(i)} activeOpacity={0.7} style={{ padding: 4 }}>
                    <Ionicons name="trash-outline" size={15} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
                {i < coachingPrompts.length - 1 && (
                  <View style={{ height: 0.5, backgroundColor: "rgba(0,0,0,0.08)", marginLeft: 46 }} />
                )}
              </View>
            ))}

            {addingPrompt ? (
              <View style={{ padding: 14, gap: 10, borderTopWidth: coachingPrompts.length > 0 ? 0.5 : 0, borderTopColor: "rgba(0,0,0,0.08)" }}>
                <TextInput
                  placeholder="Enter a question or probe…"
                  placeholderTextColor="#B0B0B0"
                  value={newPrompt}
                  onChangeText={setNewPrompt}
                  multiline
                  autoFocus
                  style={{ fontSize: 14, color: "#1A1A1A", lineHeight: 20, minHeight: 44 }}
                />
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => { setAddingPrompt(false); setNewPrompt(""); }}
                    style={{ flex: 1, height: 40, borderRadius: 10, borderCurve: "continuous", backgroundColor: "#EBEBEB", alignItems: "center", justifyContent: "center" }}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 14, fontWeight: "600", color: "#1A1A1A" }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleAddPrompt}
                    style={{ flex: 1, height: 40, borderRadius: 10, borderCurve: "continuous", backgroundColor: newPrompt.trim() ? "#1A1A1A" : "#C0C0C0", alignItems: "center", justifyContent: "center" }}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 14, fontWeight: "600", color: "#fff" }}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={{ flexDirection: "row", alignItems: "center", borderTopWidth: coachingPrompts.length > 0 ? 0.5 : 0, borderTopColor: "rgba(0,0,0,0.08)" }}>
                <TouchableOpacity
                  onPress={() => setAddingPrompt(true)}
                  activeOpacity={0.7}
                  style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 10, padding: 14 }}
                >
                  <Ionicons name="add-circle-outline" size={20} color="#8E8E8E" />
                  <Text style={{ fontSize: 15, color: "#8E8E8E" }}>Add question</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={{ marginRight: 14, flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#007AFF", borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12 }}
                >
                  <Ionicons name="sparkles-outline" size={13} color="#fff" />
                  <Text style={{ fontSize: 13, fontWeight: "600", color: "#fff" }}>Generate more</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Danger zone */}
        <TouchableOpacity
          onPress={() => Alert.alert("Delete position", `Remove "${decoded}" and all its criteria?`, [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: () => router.back() },
          ])}
          activeOpacity={0.7}
          style={{
            backgroundColor: "#fff",
            borderRadius: 14,
            borderCurve: "continuous",
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}
        >
          <Ionicons name="trash-outline" size={18} color="#FF3B30" />
          <Text style={{ fontSize: 16, color: "#FF3B30", fontWeight: "500" }}>Delete position</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}
