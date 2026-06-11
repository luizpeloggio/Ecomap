import React from "react";
import { StyleSheet, TouchableOpacity, Image, ImageSourcePropType } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { IconSymbol } from "@/components/ui/icon-symbol";

export interface AreaItem {
  id: string;
  title: string;
  icon: ImageSourcePropType;
  color: string;
  subItems: string[];
}

interface AreaAccordionProps {
  item: AreaItem;
  isExpanded: boolean;
  selectedSubItem: string | null;
  onToggle: () => void;
  onSelectSubItem: (subItem: string) => void;
  children?: React.ReactNode;
}

export function AreaAccordion({
  item,
  isExpanded,
  selectedSubItem,
  onToggle,
  onSelectSubItem,
  children,
}: AreaAccordionProps) {
  const cardBg = useThemeColor({}, "cardBackground");
  const cardBorder = useThemeColor({}, "cardBorder");
  const subitemHeaderBg = useThemeColor({}, "subitemHeader");
  const subitemContentBg = useThemeColor({}, "subitemContent");
  const iconColorDefault = useThemeColor({}, "icon");

  return (
    <ThemedView
      style={[
        styles.accordionContainer,
        {
          backgroundColor: cardBg,
          borderColor: cardBorder,
          borderLeftColor: isExpanded ? item.color : cardBorder,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onToggle}
        style={[
          styles.areaCard,
          isExpanded && { backgroundColor: subitemHeaderBg },
        ]}
      >
        <ThemedView style={styles.areaRow}>
          <Image source={item.icon} style={styles.icon} />
          <ThemedText
            type="defaultSemiBold"
            style={[
              styles.areaText,
              isExpanded && { color: item.color },
            ]}
          >
            {item.title}
          </ThemedText>
        </ThemedView>
        <IconSymbol
          size={20}
          name={isExpanded ? "chevron.up" : "chevron.down"}
          color={isExpanded ? item.color : iconColorDefault}
        />
      </TouchableOpacity>

      {isExpanded && (
        <ThemedView style={[styles.subItemsContainer, { backgroundColor: subitemContentBg }]}>
          {item.subItems.map((sub, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.subItemRow, { borderBottomColor: cardBorder }]}
              onPress={() => onSelectSubItem(sub)}
            >
              <ThemedView
                style={[
                  styles.radioOuter,
                  selectedSubItem === sub && {
                    borderColor: item.color,
                  },
                ]}
              >
                {selectedSubItem === sub && (
                  <ThemedView
                    style={[
                      styles.radioInner,
                      { backgroundColor: item.color },
                    ]}
                  />
                )}
              </ThemedView>
              <ThemedText
                style={[
                  styles.subItemText,
                  selectedSubItem === sub && { fontWeight: "bold" },
                ]}
              >
                {sub}
              </ThemedText>
            </TouchableOpacity>
          ))}
          {children}
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  accordionContainer: {
    borderRadius: 14,
    overflow: "hidden",
    borderLeftWidth: 6,
    borderWidth: 1,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  areaCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  areaRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  areaText: { marginLeft: 15, fontSize: 15 },
  icon: { width: 28, height: 28, resizeMode: "contain" },
  subItemsContainer: { paddingBottom: 10 },
  subItemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
  },
  subItemText: { fontSize: 14 },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#BBB",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  radioInner: { width: 8, height: 8, borderRadius: 4 },
});
