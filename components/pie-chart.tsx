import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Svg, { G, Path, Circle } from "react-native-svg";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";

export type PieSlice = {
  label: string;
  /** Value in percentage points. Must sum to ~100. */
  value: number;
  color: string;
};

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

function degToRad(deg: number) {
  return (Math.PI / 180) * deg;
}

function formatPercent(value: number) {
  if (!Number.isFinite(value)) return "0%";
  const hasFraction = Math.abs(value - Math.round(value)) >= 0.01;
  const formatted = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: hasFraction ? 2 : 0,
  }).format(value);
  return `${formatted}%`;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const a = degToRad(angleDeg - 90);
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
}

export default function PieChart({
  title,
  subtitle,
  data,
  size = 170,
}: {
  title: string;
  subtitle?: string;
  data: PieSlice[];
  size?: number;
}) {
  const cardBg = useThemeColor({}, "cardBackground");
  const cardBorder = useThemeColor({}, "cardBorder");
  const subtitleColor = useThemeColor({}, "icon");

  const normalized = useMemo(() => {
    const sum = data.reduce((acc, s) => acc + (Number.isFinite(s.value) ? s.value : 0), 0);
    if (sum <= 0) return [];
    // Normalize defensively in case it doesn't sum to exactly 100
    return data.map((s) => ({ ...s, value: (s.value / sum) * 100 }));
  }, [data]);

  const total = normalized.reduce((acc, s) => acc + s.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const r = (size / 2) * 0.95;

  let cursor = 0;

  return (
    <ThemedView style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
      <ThemedText type="defaultSemiBold" style={styles.title}>
        {title}
      </ThemedText>
      {!!subtitle && (
        <ThemedText style={[styles.subtitle, { color: subtitleColor }]}>
          {subtitle}
        </ThemedText>
      )}

      <View style={styles.row}>
        <View style={styles.chart}>
          <Svg width={size} height={size}>
            <G>
              {normalized.map((s, idx) => {
                const startAngle = (cursor / 100) * 360;
                const endAngle = ((cursor + s.value) / 100) * 360;
                cursor += s.value;
                // Avoid rendering tiny floating-point gaps.
                const end = idx === normalized.length - 1 ? 360 : endAngle;
                return (
                  <Path
                    key={`${s.label}-${idx}`}
                    d={arcPath(cx, cy, r, startAngle, end)}
                    fill={s.color}
                  />
                );
              })}
              <Circle cx={cx} cy={cy} r={r * 0.55} fill={cardBg} />
            </G>
          </Svg>

          <View style={styles.centerLabel}>
            <ThemedText type="defaultSemiBold" style={styles.centerValue}>
              {formatPercent(clamp01(total / 100) * 100)}
            </ThemedText>
            <ThemedText style={[styles.centerHint, { color: subtitleColor }]}>
              distribuição
            </ThemedText>
          </View>
        </View>

        <View style={styles.legend}>
          {normalized.map((s) => (
            <View key={s.label} style={styles.legendRow}>
              <View style={[styles.swatch, { backgroundColor: s.color }]} />
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.legendLabel}>{s.label}</ThemedText>
              </View>
              <ThemedText style={styles.legendPct}>{formatPercent(s.value)}</ThemedText>
            </View>
          ))}
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  title: { fontSize: 15, marginBottom: 4 },
  subtitle: { fontSize: 12, marginBottom: 10 },
  row: { flexDirection: "row", gap: 12, alignItems: "center" },
  chart: { width: 170, height: 170, justifyContent: "center", alignItems: "center" },
  centerLabel: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  centerValue: { fontSize: 18 },
  centerHint: { fontSize: 11 },
  legend: { flex: 1, gap: 8 },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  swatch: { width: 12, height: 12, borderRadius: 3 },
  legendLabel: { fontSize: 12 },
  legendPct: { fontSize: 12 },
});

