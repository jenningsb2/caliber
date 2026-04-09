import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import potbellyLogo from "../assets/images/Potbelly_Sandwich_Shop_logo.png";
import tacoBellLogo from "../assets/images/taco_bell_logo.png";
import { BRAND_META } from "../constants/mock-data";
import { useBrand, useToggleBrand } from "../contexts/brand-context";

type SettingsRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
};

function SettingsRow({ icon, label, value, onPress, destructive }: SettingsRowProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 13, paddingHorizontal: 16 }}
    >
      <Ionicons name={icon} size={20} color={destructive ? "#FF3B30" : "#1A1A1A"} />
      <Text style={{ flex: 1, fontSize: 16, color: destructive ? "#FF3B30" : "#1A1A1A" }}>{label}</Text>
      {value && <Text style={{ fontSize: 15, color: "#8E8E8E" }}>{value}</Text>}
      {!destructive && <Ionicons name="chevron-forward" size={16} color="#C0C0C0" />}
    </TouchableOpacity>
  );
}

function Separator() {
  return <View style={{ height: 0.5, backgroundColor: "rgba(0,0,0,0.08)", marginLeft: 48 }} />;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 4 }}>
      <Text style={{ fontSize: 13, fontWeight: "600", color: "#8E8E8E", textTransform: "uppercase", letterSpacing: 0.5, marginLeft: 16, marginBottom: 4 }}>
        {title}
      </Text>
      <View style={{ backgroundColor: "#fff", borderRadius: 14, borderCurve: "continuous", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        {children}
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [autoSummary, setAutoSummary] = useState(true);
  const { brand } = useBrand();
  const toggleBrand = useToggleBrand();
  const meta = BRAND_META[brand];

  return (
    <>
      <Stack.Screen options={{ title: "Settings", headerLargeTitle: false, presentation: "modal" }} />
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button onPress={() => router.back()}>Done</Stack.Toolbar.Button>
      </Stack.Toolbar>

      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, gap: 24, paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile card */}
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
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              borderWidth: 1.5,
              borderColor: "#DEDEDE",
              backgroundColor: "#F5F5F5",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <Image
              source={brand === "potbelly" ? potbellyLogo : tacoBellLogo}
              style={{ width: 44, height: 44 }}
              contentFit="contain"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 17, fontWeight: "600", color: "#1A1A1A" }}>{meta.name}</Text>
            <Text style={{ fontSize: 14, color: "#8E8E8E" }}>{meta.email}</Text>
          </View>
          <TouchableOpacity onPress={toggleBrand} activeOpacity={0.6} style={{ padding: 6 }}>
            <Ionicons name="swap-horizontal-outline" size={20} color="#C0C0C0" />
          </TouchableOpacity>
        </View>

        {/* Organization */}
        <Section title="Organization">
          <SettingsRow icon="briefcase-outline" label="Positions" onPress={() => router.push("/positions")} />
        </Section>

        {/* Interviews */}
        <Section title="Interviews">
          <SettingsRow icon="notifications-outline" label="Interview reminders" value="15 min" />
        </Section>

        {/* AI */}
        <Section title="AI & Summaries">
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, paddingHorizontal: 16 }}>
            <Ionicons name="sparkles-outline" size={20} color="#1A1A1A" />
            <Text style={{ flex: 1, fontSize: 16, color: "#1A1A1A" }}>Auto-generate summary</Text>
            <Switch value={autoSummary} onValueChange={setAutoSummary} trackColor={{ true: "#2A6B3C" }} />
          </View>
          <Separator />
          <SettingsRow icon="language-outline" label="Transcription language" value="English" />
        </Section>

        {/* Account */}
        <Section title="Account">
          <SettingsRow icon="person-outline" label="Profile" onPress={() => router.push("/profile")} />
          <Separator />
          <SettingsRow icon="lock-closed-outline" label="Privacy" />
          <Separator />
          <SettingsRow icon="help-circle-outline" label="Help & Feedback" />
        </Section>

        {/* Sign out */}
        <Section title="">
          <SettingsRow icon="log-out-outline" label="Sign out" destructive />
        </Section>
      </ScrollView>
    </>
  );
}
