import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from "react-native-reanimated";

const BARS = [
  { maxH: 14, duration: 380, delay: 0 },
  { maxH: 22, duration: 320, delay: 60 },
  { maxH: 10, duration: 420, delay: 130 },
  { maxH: 26, duration: 360, delay: 20 },
  { maxH: 18, duration: 400, delay: 90 },
  { maxH: 24, duration: 340, delay: 160 },
  { maxH: 12, duration: 440, delay: 50 },
  { maxH: 20, duration: 380, delay: 110 },
  { maxH: 16, duration: 360, delay: 70 },
];

function WaveBar({ maxH, duration, delay }: (typeof BARS)[0]) {
  const height = useSharedValue(3);

  useEffect(() => {
    height.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(maxH, { duration }),
          withTiming(3, { duration })
        ),
        -1
      )
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({ height: height.value }));

  return (
    <Animated.View
      style={[
        { width: 3, borderRadius: 2, backgroundColor: "#FF3B30", alignSelf: "center" },
        animStyle,
      ]}
    />
  );
}

export function AnimatedWaveform() {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
      {BARS.map((bar, i) => (
        <WaveBar key={i} {...bar} />
      ))}
    </View>
  );
}
