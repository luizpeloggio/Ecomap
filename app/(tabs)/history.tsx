import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Image, Text, RefreshControl, Platform, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getReports, deleteReport, Report } from '@/services/db';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function HistoryScreen() {
  const [reports, setReports] = useState<Report[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const cardBg = useThemeColor({}, 'cardBackground');
  const cardBorder = useThemeColor({}, 'cardBorder');
  const inputBg = useThemeColor({}, 'inputBackground');
  const textColor = useThemeColor({}, 'text');
  const subtitleColor = useThemeColor({}, 'icon');
  const primaryColor = useThemeColor({}, 'tint');

  const fetchReports = async () => {
    try {
      const data = await getReports();
      setReports(data);
    } catch (e) {
      console.error("Erro ao carregar histórico", e);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReports();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReports();
    setRefreshing(false);
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      "Excluir Ocorrência",
      "Deseja realmente remover esta ocorrência permanentemente?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteReport(id);
              await fetchReports();
            } catch (e) {
              console.error("Erro ao deletar reporte", e);
              Alert.alert("Erro", "Não foi possível excluir a ocorrência.");
            }
          }
        }
      ]
    );
  };

  const renderItem = (item: Report, index: number) => {
    const date = new Date(item.timestamp).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

    return (
      <View key={item.id?.toString() || index.toString()} style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
        {item.imageUri ? (
          <Image source={{ uri: item.imageUri }} style={styles.cardImage} />
        ) : (
          <View style={[styles.noImageContainer, { backgroundColor: inputBg, borderColor: cardBorder }]}>
            <IconSymbol name="camera.fill" size={24} color={subtitleColor} style={{ marginBottom: 4 }} />
            <Text style={[styles.noImageText, { color: subtitleColor }]}>Sem Foto</Text>
          </View>
        )}
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={[styles.category, { color: textColor }]} numberOfLines={1}>{item.category}</Text>
            {item.id && (
              <TouchableOpacity onPress={() => handleDelete(item.id!)} style={styles.deleteButton} hitSlop={12}>
                <IconSymbol name="trash.fill" size={18} color="#EF4444" />
              </TouchableOpacity>
            )}
          </View>
          <Text style={[styles.date, { color: subtitleColor }]}>{date}</Text>
          <Text style={[styles.description, { color: subtitleColor }]} numberOfLines={3}>
            {item.description}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D1FAE5', dark: '#065F46' }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primaryColor} />
      }
      headerImage={
        <View style={[styles.headerContainer, { backgroundColor: primaryColor }]}>
          <IconSymbol name="list.bullet.clipboard.fill" size={48} color="#FFF" style={{ marginBottom: 8 }} />
          <ThemedText type="title" style={styles.headerTitle}>Histórico</ThemedText>
          <Text style={styles.headerSubtitle}>Suas ocorrências ambientais registradas</Text>
        </View>
      }>
      <ThemedView style={styles.container}>
        {reports.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol name="photo.on.rectangle.angled" size={40} color={subtitleColor} style={{ marginBottom: 12 }} />
            <Text style={[styles.emptyText, { color: subtitleColor }]}>Você ainda não possui reportes registrados.</Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {reports.map((item, index) => renderItem(item, index))}
          </View>
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  listContainer: {
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    gap: 15,
  },
  emptyContainer: {
    marginTop: 60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    minHeight: 110,
  },
  cardImage: {
    width: 100,
    height: '100%',
  },
  noImageContainer: {
    width: 100,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
  },
  noImageText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  category: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  deleteButton: {
    padding: 2,
  },
  date: {
    fontSize: 11,
    marginTop: 2,
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
  },
});
