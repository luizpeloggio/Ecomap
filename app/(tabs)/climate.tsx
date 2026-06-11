import React, { useState, useMemo, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  CLIMATE_DATA,
  YearClimate,
  fetchRealClimateData,
  fetchAtmosphericDynamics,
  AtmosphericDynamicsData,
  FALLBACK_ATMOSPHERIC,
  AirQualityData,
  FALLBACK_AIR_QUALITY,
  fetchAirQuality
} from '@/services/climate-data';
import { PrecipitationChart, TemperatureChart } from '@/components/climate-charts';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function ClimateScreen() {
  const [climateList, setClimateList] = useState<YearClimate[]>(CLIMATE_DATA);
  const [selectedYear, setSelectedYear] = useState<number>(CLIMATE_DATA[0].year);
  const [loadingReal, setLoadingReal] = useState<boolean>(false);
  const [atmosphericData, setAtmosphericData] = useState<AtmosphericDynamicsData>(FALLBACK_ATMOSPHERIC);
  const [airQualityData, setAirQualityData] = useState<AirQualityData>(FALLBACK_AIR_QUALITY);

  const cardBg = useThemeColor({}, 'cardBackground');
  const cardBorder = useThemeColor({}, 'cardBorder');
  const inputBg = useThemeColor({}, 'inputBackground');
  const textColor = useThemeColor({}, 'text');
  const subtitleColor = useThemeColor({}, 'icon');
  const primaryColor = useThemeColor({}, 'tint');

  useEffect(() => {
    let active = true;
    const loadRealData = async () => {
      setLoadingReal(true);
      try {
        const realData = await fetchRealClimateData();
        if (active && realData.length > 0) {
          setClimateList(realData);
          setSelectedYear(realData[0].year);
        }
      } catch (err) {
        console.error("Error loading climate API:", err);
      } finally {
        if (active) setLoadingReal(false);
      }
    };

    const loadAtmospheric = async () => {
      try {
        const atm = await fetchAtmosphericDynamics();
        if (active) {
          setAtmosphericData(atm);
        }
      } catch (err) {
        console.error("Error loading atmospheric dynamics API:", err);
      }
    };

    const loadAirQuality = async () => {
      try {
        const aq = await fetchAirQuality();
        if (active) {
          setAirQualityData(aq);
        }
      } catch (err) {
        console.error("Error loading air quality API:", err);
      }
    };

    loadRealData();
    loadAtmospheric();
    loadAirQuality();
    return () => {
      active = false;
    };
  }, []);

  const selectedData = useMemo(() => {
    return (climateList.find(d => d.year === selectedYear) ?? climateList[0]) as YearClimate;
  }, [climateList, selectedYear]);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D1FAE5', dark: '#065F46' }}
      headerImage={
        <View style={[styles.headerContainer, { backgroundColor: primaryColor }]}>
          <IconSymbol name="thermometer.sun.fill" size={48} color="#FFF" style={{ marginBottom: 8 }} />
          <ThemedText type="title" style={styles.headerTitle}>Série Histórica</ThemedText>
          <ThemedText style={styles.headerSubtitle}>Clima real de Natal (Open-Meteo API)</ThemedText>
        </View>
      }>
      
      <ThemedView style={styles.container}>
        <View style={styles.sectionHeader}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
            Selecione o Ano
          </ThemedText>
          {loadingReal && (
            <View style={styles.apiLoader}>
              <ActivityIndicator size="small" color={primaryColor} />
              <Text style={[styles.apiLoaderText, { color: subtitleColor }]}>Buscando...</Text>
            </View>
          )}
        </View>
        
        <View style={styles.yearSelectorWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.yearScroll}>
            {climateList.map((item) => {
              const isSelected = selectedYear === item.year;
              return (
                <TouchableOpacity
                  key={item.year}
                  style={[
                    styles.yearButton,
                    {
                      backgroundColor: isSelected ? primaryColor : inputBg,
                      borderColor: isSelected ? primaryColor : cardBorder,
                    }
                  ]}
                  onPress={() => setSelectedYear(item.year)}
                >
                  <Text style={[
                    styles.yearText,
                    {
                      color: isSelected ? '#FFF' : textColor,
                    }
                  ]}>
                    {item.year}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <Text style={[styles.summaryTitle, { color: textColor }]}>Resumo de {selectedYear}</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: subtitleColor }]}>Temperatura Média</Text>
              <Text style={styles.summaryValueRed}>{selectedData.avgTemp} °C</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: subtitleColor }]}>Precipitação Total</Text>
              <Text style={styles.summaryValueBlue}>{selectedData.totalPrecipitation} mm</Text>
            </View>
          </View>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <Text style={[styles.summaryTitle, { color: textColor }]}>Dinâmica Atmosférica Atual (Natal)</Text>
          <View style={styles.summaryRow}>
            <View style={styles.atmItem}>
              <IconSymbol name="wind" size={24} color={primaryColor} />
              <Text style={[styles.atmValue, { color: textColor }]}>{atmosphericData.windSpeed} km/h</Text>
              <Text style={[styles.atmLabel, { color: subtitleColor }]}>Vento (Dir: {atmosphericData.windDirection}°)</Text>
            </View>
            <View style={styles.atmItem}>
              <IconSymbol name="drop.fill" size={24} color={primaryColor} />
              <Text style={[styles.atmValue, { color: textColor }]}>{atmosphericData.relativeHumidity}%</Text>
              <Text style={[styles.atmLabel, { color: subtitleColor }]}>Umidade do Ar</Text>
            </View>
          </View>
          <View style={[styles.summaryRow, { marginTop: 14 }]}>
            <View style={styles.atmItem}>
              <IconSymbol name="barometer" size={24} color={primaryColor} />
              <Text style={[styles.atmValue, { color: textColor }]}>{atmosphericData.surfacePressure} hPa</Text>
              <Text style={[styles.atmLabel, { color: subtitleColor }]}>Pressão Atmosférica</Text>
            </View>
            <View style={styles.atmItem}>
              <IconSymbol name="sun.max.fill" size={24} color={primaryColor} />
              <Text style={[styles.atmValue, { color: textColor }]}>{atmosphericData.uvIndex}</Text>
              <Text style={[styles.atmLabel, { color: subtitleColor }]}>Índice UV</Text>
            </View>
          </View>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: cardBg, borderColor: cardBorder, marginTop: 16 }]}>
          <Text style={[styles.summaryTitle, { color: textColor }]}>Qualidade do Ar Atual (Natal)</Text>
          <View style={styles.summaryRow}>
            <View style={styles.atmItem}>
              <IconSymbol name="drop.fill" size={24} color="#059669" />
              <Text style={[styles.atmValue, { color: textColor }]}>{airQualityData.pm25} µg/m³</Text>
              <Text style={[styles.atmLabel, { color: subtitleColor }]}>Material PM2.5</Text>
            </View>
            <View style={styles.atmItem}>
              <IconSymbol name="drop.fill" size={24} color="#059669" />
              <Text style={[styles.atmValue, { color: textColor }]}>{airQualityData.pm10} µg/m³</Text>
              <Text style={[styles.atmLabel, { color: subtitleColor }]}>Material PM10</Text>
            </View>
          </View>
          <View style={[styles.summaryRow, { marginTop: 14 }]}>
            <View style={styles.atmItem}>
              <IconSymbol name="wind" size={24} color="#059669" />
              <Text style={[styles.atmValue, { color: textColor }]}>{airQualityData.co} µg/m³</Text>
              <Text style={[styles.atmLabel, { color: subtitleColor }]}>Monóxido de Carbono (CO)</Text>
            </View>
            <View style={styles.atmItem}>
              <IconSymbol name="sun.max.fill" size={24} color="#059669" />
              <Text style={[styles.atmValue, { color: textColor }]}>{airQualityData.o3} µg/m³</Text>
              <Text style={[styles.atmLabel, { color: subtitleColor }]}>Ozônio (O3)</Text>
            </View>
          </View>
          <View style={[styles.summaryRow, { marginTop: 14 }]}>
            <View style={styles.atmItem}>
              <IconSymbol name="wind" size={24} color="#059669" />
              <Text style={[styles.atmValue, { color: textColor }]}>{airQualityData.no2} µg/m³</Text>
              <Text style={[styles.atmLabel, { color: subtitleColor }]}>Dióxido de Nitrogênio (NO2)</Text>
            </View>
            <View style={styles.atmItem}>
              <IconSymbol name="barometer" size={24} color="#059669" />
              <Text style={[styles.atmValue, { color: textColor }]}>{airQualityData.so2} µg/m³</Text>
              <Text style={[styles.atmLabel, { color: subtitleColor }]}>Dióxido de Enxofre (SO2)</Text>
            </View>
          </View>
        </View>

        <View style={styles.chartsContainer}>
          <TemperatureChart data={selectedData.data} />
          <PrecipitationChart data={selectedData.data} />
        </View>

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
  },
  container: {
    flex: 1,
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
  },
  apiLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  apiLoaderText: {
    fontSize: 12,
  },
  yearSelectorWrapper: {
    marginHorizontal: -16, // to allow scroll overflow cleanly
    marginBottom: 20,
  },
  yearScroll: {
    paddingHorizontal: 16,
    gap: 10,
  },
  yearButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  yearText: {
    fontWeight: 'bold',
  },
  summaryCard: {
    padding: 16,
    borderRadius: 14,
    marginBottom: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  summaryValueRed: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E74C3C',
  },
  summaryValueBlue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3498DB',
  },
  chartsContainer: {
    gap: 15,
  },
  atmItem: {
    alignItems: 'center',
    flex: 1,
  },
  atmValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  atmLabel: {
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
});
