import React from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { useThemeColor } from "@/hooks/use-theme-color";
import { IconSymbol } from "@/components/ui/icon-symbol";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmitEditing: () => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChangeText,
  onSubmitEditing,
  placeholder = "Buscar...",
}: SearchBarProps) {
  const inputBg = useThemeColor({}, "cardBackground");
  const cardBorder = useThemeColor({}, "cardBorder");
  const inputText = useThemeColor({}, "text");
  const placeholderColor = useThemeColor({}, "placeholder");

  return (
    <View style={[styles.searchContainer]}>
      <View style={[styles.searchWrapper, { backgroundColor: inputBg, borderColor: cardBorder }]}>
        <IconSymbol size={20} name="magnifyingglass" color={placeholderColor} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: inputText }]}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmitEditing}
          returnKeyType="search"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    marginBottom: 8,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    padding: 0, // Reset default padding in android
  },
});
