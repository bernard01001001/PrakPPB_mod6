import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  Canvas,
  Circle,
  RadialGradient,
  vec,
  BlurMask,
  Group,
  SweepGradient,
} from "@shopify/react-native-skia";
import {
  useSharedValue,
  withRepeat,
  withTiming,
  useDerivedValue,
  Easing,
} from "react-native-reanimated";
import { tokens } from "../theme/tokens.js";

const { color } = tokens;

export function TempOrb({ temperature = 25.0, threshold = 30.0 }) {
  const pulse = useSharedValue(0);
  const rotation = useSharedValue(0);
  const ripple1 = useSharedValue(0);
  const ripple2 = useSharedValue(0);

  useEffect(() => {
    // Animasi denyut (breathing pulse) pada bola utama
    pulse.value = withRepeat(
      withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    // Rotasi cincin halo luar
    rotation.value = withRepeat(
      withTiming(Math.PI * 2, { duration: 3500, easing: Easing.linear }),
      -1,
      false
    );

    // Efek gelombang riak 1 (Ripple 1)
    ripple1.value = withRepeat(
      withTiming(1, { duration: 2400, easing: Easing.out(Easing.ease) }),
      -1,
      false
    );

    // Efek gelombang riak 2 (Ripple 2 - delay alami)
    const timeout = setTimeout(() => {
      ripple2.value = withRepeat(
        withTiming(1, { duration: 2400, easing: Easing.out(Easing.ease) }),
        -1,
        false
      );
    }, 1200);

    return () => clearTimeout(timeout);
  }, []);

  // Status suhu
  const isDanger = temperature >= threshold;
  const isWarning = !isDanger && temperature >= threshold - 3;

  const sphereColors = isDanger
    ? ["#fca5a5", "#ef4444", "#7f1d1d"]
    : isWarning
    ? ["#fde047", "#f97316", "#7c2d12"]
    : [color.primary, "#0284c7", color.bg];

  const glowColor = isDanger ? "#ef4444" : isWarning ? "#f97316" : color.primary;

  // Ukuran derivatif untuk animasi Skia
  const sphereRadius = useDerivedValue(() => 75 + pulse.value * 6);
  const haloRadius = useDerivedValue(() => 90 + pulse.value * 10);
  const transformRing = useDerivedValue(() => [{ rotate: rotation.value }]);

  // Skala & Opasitas untuk efek Ripple yang memancar keluar
  const ripple1Radius = useDerivedValue(() => 75 + ripple1.value * 55);
  const ripple1Opacity = useDerivedValue(() => 1 - ripple1.value);

  const ripple2Radius = useDerivedValue(() => 75 + ripple2.value * 55);
  const ripple2Opacity = useDerivedValue(() => 1 - ripple2.value);

  const size = 260;
  const center = size / 2;

  return (
    <View style={styles.wrapper}>
      <Canvas style={{ width: size, height: size }}>
        <Circle cx={center} cy={center} r={haloRadius} color={glowColor} opacity={0.25}>
          <BlurMask blur={20} style="normal" />
        </Circle>

        <Circle
          cx={center}
          cy={center}
          r={ripple1Radius}
          style="stroke"
          strokeWidth={1.5}
          color={glowColor}
          opacity={ripple1Opacity}
        />

        <Circle
          cx={center}
          cy={center}
          r={ripple2Radius}
          style="stroke"
          strokeWidth={1.5}
          color={glowColor}
          opacity={ripple2Opacity}
        />

        <Group origin={vec(center, center)} transform={transformRing}>
          <Circle
            cx={center}
            cy={center}
            r={88}
            style="stroke"
            strokeWidth={2.5}
            opacity={0.6}
          >
            <SweepGradient
              c={vec(center, center)}
              colors={[glowColor, "transparent", glowColor]}
            />
          </Circle>
        </Group>

        <Circle cx={center} cy={center} r={sphereRadius}>
          <RadialGradient
            c={vec(center - 20, center - 20)}
            r={90}
            colors={sphereColors}
          />
        </Circle>
      </Canvas>

      <View style={styles.overlayText}>
        <Text style={styles.tempValue}>{Number(temperature).toFixed(1)}°C</Text>
        <Text
          style={[
            styles.statusLabel,
            { color: isDanger ? "#650020" : isWarning ? "#993300" : "#06006e" },
          ]}
        >
          {isDanger ? "BAHAYA" : isWarning ? "WASPADA" : "NORMAL"}
        </Text>
      </View>
    </View>
  );
}

export default TempOrb;

const styles = StyleSheet.create({
  wrapper: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  overlayText: {
    position: "absolute",
    alignItems: "center",
  },
  tempValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
    fontFamily: "monospace",
    letterSpacing: -0.5,
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    marginTop: 4,
    fontFamily: "monospace",
  },
});