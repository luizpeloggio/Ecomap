import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ThemedView } from "./themed-view";
import { ThemedText } from "./themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";

export interface ReportFormData {
  category: string;
  description: string;
  imageUri?: string;
}

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: ReportFormData) => void;
}

const CATEGORIES = [
  "Lixo Irregular",
  "Desmatamento/Poda Ilegal",
  "Poluição de Rio/Lago",
  "Animal Silvestre em Risco",
  "Outros",
];

export default function ReportModal({
  visible,
  onClose,
  onSubmit,
}: ReportModalProps) {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);

  const cardBg = useThemeColor({}, "cardBackground");
  const cardBorder = useThemeColor({}, "cardBorder");
  const inputBg = useThemeColor({}, "inputBackground");
  const textColor = useThemeColor({}, "text");
  const subtitleColor = useThemeColor({}, "icon");
  const placeholderColor = useThemeColor({}, "placeholder");
  const tintColor = useThemeColor({}, "tint");

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissão necessária",
        "Precisamos de acesso à galeria para anexar fotos."
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissão necessária",
        "Precisamos de acesso à câmera para tirar fotos."
      );
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    if (!description.trim()) {
      Alert.alert("Atenção", "Por favor, adicione uma descrição do problema.");
      return;
    }
    onSubmit({
      category,
      description,
      imageUri: imageUri || undefined,
    });
    // Reset form
    setCategory(CATEGORIES[0]);
    setDescription("");
    setImageUri(null);
  };

  const handleClose = () => {
    setCategory(CATEGORIES[0]);
    setDescription("");
    setImageUri(null);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <ThemedView style={[styles.container, { backgroundColor: cardBg, borderTopColor: cardBorder, borderWidth: 1 }]}>
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <ThemedText type="subtitle" style={styles.title}>
              Novo Reporte
            </ThemedText>
            <ThemedText style={[styles.subtitle, { color: subtitleColor }]}>
              Sua localização atual será anexada.
            </ThemedText>

            <ThemedText type="defaultSemiBold" style={styles.label}>
              Categoria
            </ThemedText>
            <View style={styles.categoryContainer}>
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      { backgroundColor: isSelected ? tintColor : inputBg, borderColor: isSelected ? tintColor : cardBorder },
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        { color: isSelected ? "#FFF" : textColor, fontWeight: isSelected ? "bold" : "normal" },
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <ThemedText type="defaultSemiBold" style={styles.label}>
              Descrição
            </ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: inputBg, borderColor: cardBorder, color: textColor }]}
              placeholder="Descreva o que está acontecendo..."
              placeholderTextColor={placeholderColor}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <ThemedText type="defaultSemiBold" style={styles.label}>
              Evidência (Opcional)
            </ThemedText>
            <View style={styles.mediaButtons}>
              <TouchableOpacity style={[styles.mediaButton, { backgroundColor: inputBg }]} onPress={takePhoto}>
                <Text style={[styles.mediaButtonText, { color: textColor }]}>📷 Tirar Foto</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.mediaButton, { backgroundColor: inputBg }]} onPress={pickImage}>
                <Text style={[styles.mediaButtonText, { color: textColor }]}>🖼️ Galeria</Text>
              </TouchableOpacity>
            </View>

            {imageUri && (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => setImageUri(null)}
                >
                  <Text style={styles.removeImageText}>X</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.footer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton, { borderColor: cardBorder }]}
                onPress={handleClose}
              >
                <Text style={[styles.cancelButtonText, { color: subtitleColor }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.submitButton, { backgroundColor: tintColor }]}
                onPress={handleSubmit}
              >
                <Text style={styles.submitButtonText}>Salvar Reporte</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
  },
  scroll: {
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
  },
  title: {
    fontSize: 22,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  label: {
    marginTop: 10,
    marginBottom: 8,
    fontSize: 16,
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    minHeight: 100,
    marginBottom: 10,
  },
  mediaButtons: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 15,
  },
  mediaButton: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  mediaButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  imagePreviewContainer: {
    position: "relative",
    marginBottom: 15,
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 14,
  },
  removeImageButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  removeImageText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
  },
  submitButton: {
    // Background dynamic
  },
  cancelButtonText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  submitButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});
