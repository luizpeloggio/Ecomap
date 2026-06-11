import React from "react";
import { StyleSheet, TouchableOpacity, GestureResponderEvent } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";

interface FloatingActionButtonProps {
  onPress: (event: GestureResponderEvent) => void;
  label?: string;
  color?: string;
}

export function FloatingActionButton({
  onPress,
  label = "+",
  color,
}: FloatingActionButtonProps) {
  const tintColor = useThemeColor({}, 'tint');
  const bg = color || tintColor;

  return (
    <TouchableOpacity
      style={[styles.fab, { backgroundColor: bg }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <ThemedText style={styles.fabText}>{label}</ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  fabText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});
