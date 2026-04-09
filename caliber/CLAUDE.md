# Caliber — Claude Context

## What This Is

Caliber is an iOS app for managing in-person interview calls, built for hourly-role hiring managers. The initial demo customer is Potbelly Sandwich Shop. It is a **POC to validate UI/UX** — there is no backend, no auth, and no real API calls. All data is mock.

The app has a brand switcher (Potbelly ↔ Taco Bell) accessible from the Settings screen for demo purposes.

---

## Tech Stack

- **Expo SDK 55**, Expo Router, React Native 0.83.4
- **TypeScript** — strict mode, no implicit any
- **New Architecture enabled** (Fabric renderer)
- **iOS only** — no Android or web targets currently

### Key Dependencies

| Package | Purpose |
|---|---|
| `expo-audio` | Audio recording + playback |
| `expo-image` | Raster image rendering (Potbelly/Taco Bell logos only) |
| `expo-glass-effect` | `GlassView` used for the floating action bars |
| `@expo/vector-icons` (Ionicons) | All icons — see below |
| `react-native-reanimated` | Animated waveform bars |
| `react-native-gesture-handler` | Required for bottom sheet |
| `@gorhom/bottom-sheet` v5 | Speed picker sheet in audio player |
| `react-native-safe-area-context` | Safe area insets |
| `react-native-screens` | Native screen stack |

---

## Project Structure

```
app/
  _layout.tsx              # Root stack — wraps GestureHandlerRootView + BrandProvider
  index.tsx                # My Interviews list (upcoming + past sections)
  settings.tsx             # Settings modal (brand switcher lives here)
  profile.tsx              # User profile modal
  dialer.tsx               # Phone dialer modal
  interview/
    [id].tsx               # Interview detail — three states: upcoming/inprogress/past
    edit.tsx               # Edit candidate modal
  positions/
    index.tsx              # Positions list modal
    [role].tsx             # Position detail + criteria editor
    new.tsx                # New position modal

components/
  animated-waveform.tsx    # 9 independently animated Reanimated bars (used during recording)

contexts/
  brand-context.tsx        # BrandContext — brand state + useBrand() + useToggleBrand()

constants/
  mock-data.ts             # All mock interviews, role templates, and brand-aware getters

assets/images/
  Potbelly_Sandwich_Shop_logo.png
  taco_bell_logo.png
```

---

## Coding Conventions

### Styles — use `StyleSheet`
New code must use `StyleSheet.create()`. Migrate existing inline styles when touching a file for other reasons. One-off dynamic values (e.g. `{ width: someValue }`) can still be inline.

```tsx
// ✅ correct
const styles = StyleSheet.create({ container: { flex: 1 } });

// ❌ avoid for new code
<View style={{ flex: 1 }} />
```

### Icons — always Ionicons
Use `@expo/vector-icons` Ionicons for **all** icons. Do not use `expo-image` with SF symbol sources — they fail to render silently on iOS.

```tsx
import { Ionicons } from "@expo/vector-icons";
<Ionicons name="call" size={20} color="#fff" />
```

### Images — expo-image for raster assets only
`expo-image` is only for the Potbelly and Taco Bell logo PNGs. Do not use it for icons.

### Rounded corners
Always pair `borderRadius` with `borderCurve: "continuous"` for the iOS squircle shape.

### Shadows
Use `boxShadow` (web syntax), not `elevation`. Example: `boxShadow: "0 1px 3px rgba(0,0,0,0.06)"`.

### Colors
| Token | Value | Usage |
|---|---|---|
| Brand green | `#2A6B3C` | Active states, CTAs |
| Dark green | `#1A5C4A` | Hired/Shortlisted status pills |
| Background gray | `#F0F0F0` | Screen background, input fills |
| Primary text | `#1A1A1A` | |
| Secondary text | `#8E8E8E` | |
| Destructive | `#FF3B30` | Rejected status, destructive actions |

---

## Key Architectural Decisions

### Brand context
`BrandContext` (in `contexts/brand-context.tsx`) stores the active brand (`"potbelly"` | `"tacobell"`). The settings screen has a subtle `swap-horizontal-outline` icon to toggle it. All screens pull brand-aware data via getters:

```ts
getBrandUpcoming(brand)
getBrandSections(brand)
getBrandInterviewMap(brand)
getBrandRoleTemplates(brand)
```

These apply a JSON transformation that replaces `"Sandwich Associate"` → `"Team Member"` and `"Potbelly"` → `"Taco Bell"` for the Taco Bell brand.

### Root layout requirements
`app/_layout.tsx` must keep `GestureHandlerRootView` as the outermost wrapper (required by `@gorhom/bottom-sheet`) and `BrandProvider` inside it.

```tsx
<GestureHandlerRootView style={{ flex: 1 }}>
  <BrandProvider>
    <Stack ...>
```

### @expo/ui/swift-ui — do not use
`@expo/ui/swift-ui` components (`BottomSheet`, `VStack`, `HStack`, `Slider`, etc.) crash with `EXC_CRASH (SIGABRT)` at `SwiftUIVirtualViewObjC` when React Native's fabric renderer tries to mount them. They cannot be nested inside RN views. Avoid entirely — use `@gorhom/bottom-sheet` and standard RN components instead.

### Audio player speed control
Speed state is owned by `InterviewDetail` and passed down as props: `InterviewDetail` → `PastBar` → `AudioPlayer`. `AudioPlayer` calls `player.setPlaybackRate(speed)` via `useEffect`. The speed picker is a `@gorhom/bottom-sheet` with preset pill buttons (0.5×–3.5×).

### Interview detail states
`app/interview/[id].tsx` has three UI states controlled by a `status` local state:
- `"upcoming"` — shows Start Interview CTA (`UpcomingBar`)
- `"inprogress"` — shows recording controls with timer + waveform (`InProgressBar`)
- `"past"` — shows AI summary/transcript tabs + audio playback (`PastBar` + `AudioPlayer`)

---

## What to Avoid

- **Don't add `@expo/ui/swift-ui` components** — they crash the app
- **Don't use `expo-image` for icons** — use Ionicons
- **Don't add `elevation`** — use `boxShadow`
- **Don't use `borderRadius` without `borderCurve: "continuous"`** on pill/card shapes
- **Don't add inline styles to new code** — use `StyleSheet.create()`
- **Don't add a backend, auth, or API calls** — this is a POC; keep everything mock
- **Don't add features beyond what's asked** — no speculative abstractions
