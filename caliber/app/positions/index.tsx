import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getBrandRoleTemplates } from "../../constants/mock-data";
import { useBrand } from "../../contexts/brand-context";

export default function PositionsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { brand } = useBrand();
  const roleTemplates = getBrandRoleTemplates(brand);

  return (
    <>
      <Stack.Screen
        options={{
          title: "Positions",
          headerLargeTitle: false,
        }}
      />

      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button onPress={() => router.back()}>Close</Stack.Toolbar.Button>
      </Stack.Toolbar>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button icon="plus" onPress={() => router.push("/positions/new")} />
      </Stack.Toolbar>

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ fontSize: 14, color: "#8E8E8E", lineHeight: 20, marginBottom: 4 }}>
          Define the roles your org hires for and the criteria used to evaluate candidates during interviews.
        </Text>

        {roleTemplates.map((template) => (
          <TouchableOpacity
            key={template.role}
            activeOpacity={0.92}
            onPress={() => router.push(`/positions/${encodeURIComponent(template.role)}`)}
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
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                borderCurve: "continuous",
                backgroundColor: "#F0F0F0",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="briefcase-outline" size={18} color="#1A1A1A" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: "600", color: "#1A1A1A" }}>{template.role}</Text>
              <Text style={{ fontSize: 13, color: "#8E8E8E", marginTop: 2 }}>
                {template.criteria.length} criteria • {template.criteria.reduce((s, c) => s + c.maxScore, 0)} pts total
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#C0C0C0" />
          </TouchableOpacity>
        ))}

        {/* Add position */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push("/positions/new")}
          style={{
            borderWidth: 1.5,
            borderColor: "rgba(0,0,0,0.1)",
            borderStyle: "dashed",
            borderRadius: 14,
            borderCurve: "continuous",
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <Ionicons name="add-circle-outline" size={18} color="#8E8E8E" />
          <Text style={{ fontSize: 15, color: "#8E8E8E", fontWeight: "500" }}>Add position</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}
