import * as Location from "expo-location";
import { File as ExpoFile, Paths } from "expo-file-system";
import React, { useEffect, useState, useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  View,
  Text,
  Share,
  Platform,
  TouchableOpacity,
} from "react-native";

import AmbientalMap from "@/components/ambiental-map";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import PieChart from "@/components/pie-chart";
import ReportModal, { ReportFormData } from "@/components/report-modal";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  CORPOS_AGUA_NATAL_TILE_URL,
  LAGOS_NATAL_TILE_URL,
  LANDSAT9_NATAL_TILE_URL,
  RIOS_NATAL_TILE_URL,
  SOMBREAMENTO_NATAL_TILE_URL,
  VEGETACAO_NATAL_TILE_URL,
} from "@/constants/earth-engine-tiles";
import { addReport, getReports, initDB, deleteReport, Report } from "@/services/db";
import { AreaAccordion } from "@/components/area-accordion";
import { SearchBar } from "@/components/search-bar";
import { FloatingActionButton } from "@/components/floating-action-button";
import { useThemeColor } from "@/hooks/use-theme-color";
import {
  fetchSocialVulnerability,
  fetchResilienceInfrastructure,
  SocialVulnerabilityData,
  ResilienceInfrastructureData,
  FALLBACK_VULNERABILITY,
  FALLBACK_RESILIENCE
} from "@/services/home-data";
import {
  fetchAtmosphericDynamics,
  AtmosphericDynamicsData,
  FALLBACK_ATMOSPHERIC,
  AirQualityData,
  FALLBACK_AIR_QUALITY,
  fetchAirQuality
} from "@/services/climate-data";
const AREAS_DATA = [
  {
    id: "1",
    title: "Área Urbanizada",
    icon: require("@/assets/images/construcao-da-cidade.png"),
    color: "#E67E22",
    subItems: [
      "Impermeabilização do solo",
      "Vegetação Urbana",
      "Albedo de Superfície",
      "Densidade Populacional",
    ],
  },
  {
    id: "2",
    title: "Corpos de Água",
    color: "#3498DB",
    icon: require("@/assets/images/rio.png"),
    subItems: ["Rios", "Lagos"],
  },
  {
    id: "3",
    title: "Área Arborizada",
    color: "#27AE60",
    icon: require("@/assets/images/arvores.png"),
    subItems: ["Índice de Vegetação", "Sombreamento", "Evapotranspiração"],
  },
  {
    id: "5",
    title: "Dinâmica Atmosférica",
    color: "#F1C40F",
    icon: require("@/assets/images/vento.png"),
    subItems: ["Corredores de Vento", "Umidade Relativa do Ar"],
  },
  {
    id: "6",
    title: "Infraestrutura de Resiliência",
    color: "#8E44AD",
    icon: require("@/assets/images/parque.png"),
    subItems: ["Parques e Praças", "Pontos de Hidratação", "Ecopontos de Reciclagem"],
  },
  {
    id: "7",
    title: "Reportes da Comunidade",
    color: "#E67E22",
    icon: require("@/assets/images/pessoas-juntas.png"),
    subItems: ["Ocorrências Ambientais"],
  },
];

export default function App() {
  const WATER_TOTAL_PERCENTAGE_IN_AREA = 3.6448595940482456;
  const RIOS_PERCENTAGE_IN_AREA = 3.6448595940482456;
  const LAGOS_PERCENTAGE_IN_AREA = 0;
  const RIOS_PERCENTAGE_OF_WATER = 100;
  const LAGOS_PERCENTAGE_OF_WATER = 0;
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedAreaId, setExpandedAreaId] = useState<string | null>(null);
  const [selectedSubItem, setSelectedSubItem] = useState<string | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);

  const [vulnerabilityData, setVulnerabilityData] = useState<SocialVulnerabilityData>(FALLBACK_VULNERABILITY);
  const [resilienceData, setResilienceData] = useState<ResilienceInfrastructureData>(FALLBACK_RESILIENCE);
  const [atmosphericData, setAtmosphericData] = useState<AtmosphericDynamicsData>(FALLBACK_ATMOSPHERIC);
  const [airQualityData, setAirQualityData] = useState<AirQualityData>(FALLBACK_AIR_QUALITY);
  const [loadingRealHome, setLoadingRealHome] = useState(false);

  const [markerCoord, setMarkerCoord] = useState({
    latitude: -5.79448,
    longitude: -35.211,
  });

  const cardBg = useThemeColor({}, 'cardBackground');
  const cardBorder = useThemeColor({}, 'cardBorder');
  const textColor = useThemeColor({}, 'text');
  const subtitleColor = useThemeColor({}, 'icon');

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permissão necessária",
          "Ative a localização para usar o mapa.",
        );
      }
      try {
        await initDB();
        const loadedReports = await getReports();
        setReports(loadedReports);
      } catch (e) {
        console.error("Failed to init db or fetch reports", e);
      }

      setLoadingRealHome(true);
      try {
        const vul = await fetchSocialVulnerability();
        setVulnerabilityData(vul);
        const res = await fetchResilienceInfrastructure();
        setResilienceData(res);
        const atm = await fetchAtmosphericDynamics();
        setAtmosphericData(atm);
        const aq = await fetchAirQuality();
        setAirQualityData(aq);
      } catch (e) {
        console.error("Failed to load real home indicators", e);
      } finally {
        setLoadingRealHome(false);
      }
    })();
  }, []);

  const handleAddReport = async (data: ReportFormData) => {
    try {
      await addReport({
        ...data,
        latitude: markerCoord.latitude,
        longitude: markerCoord.longitude,
      });
      const updatedReports = await getReports();
      setReports(updatedReports);
      setModalVisible(false);
      Alert.alert("Sucesso", "Reporte salvo com sucesso!");
    } catch (e) {
      console.error(e);
      Alert.alert("Erro", "Falha ao salvar reporte.");
    }
  };

  const handleDeleteReport = async (id: number) => {
    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja excluir esta ocorrência?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteReport(id);
              const loadedReports = await getReports();
              setReports(loadedReports);
            } catch (err) {
              console.error("Failed to delete report:", err);
            }
          },
        },
      ]
    );
  };

  const handleExportCSV = async () => {
    if (reports.length === 0) {
      Alert.alert("Erro", "Não há ocorrências para exportar.");
      return;
    }

    const headers = "ID,Categoria,Descricao,Latitude,Longitude,Data\n";
    const rows = reports
      .map(
        (r) =>
          `"${r.id}","${r.category.replace(/"/g, '""')}","${(r.description || "").replace(/"/g, '""')}","${r.latitude}","${r.longitude}","${new Date(
            r.timestamp
          ).toISOString()}"`
      )
      .join("\n");
    const csvContent = headers + rows;

    try {
      if (Platform.OS === "web") {
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "reportes_ambientais_natal.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const file = new ExpoFile(Paths.document, "reportes_ambientais_natal.csv");
        file.write(csvContent);
        const fileUri = file.uri;

        await Share.share({
          url: fileUri,
          title: "Ocorrências Ambientais - Natal/RN",
          message: `Compartilhando relatório de ocorrências ambientais com ${reports.length} registro(s).`,
        });
      }
    } catch (err) {
      console.error("Erro ao exportar CSV:", err);
      Alert.alert("Erro", "Não foi possível exportar as ocorrências.");
    }
  };

  const toggleArea = (id: string) => {
    setExpandedAreaId(expandedAreaId === id ? null : id);
    setSelectedSubItem(null);
  };

  const handleLocationSearch = async () => {
    if (!searchText.trim()) return;
    setLoading(true);
    try {
      const result = await Location.geocodeAsync(`${searchText}, Natal, RN`);
      if (result.length > 0) {
        const { latitude, longitude } = result[0];
        setMarkerCoord({ latitude, longitude });
      }
    } catch {
      Alert.alert("Erro", "Falha na busca.");
    } finally {
      setLoading(false);
    }
  };

  const arborizadaTile =
    expandedAreaId === "3"
      ? selectedSubItem === "Sombreamento"
        ? {
            url: SOMBREAMENTO_NATAL_TILE_URL,
            name: "Sombreamento (Landsat)",
            key: "arborizada-sombreamento",
          }
        : selectedSubItem === "Evapotranspiração"
          ? {
              url: LANDSAT9_NATAL_TILE_URL,
              name: "Evapotranspiração (Landsat)",
              key: "arborizada-evapotranspiracao",
            }
          : {
              url: VEGETACAO_NATAL_TILE_URL,
              name: "Vegetação (Landsat)",
              key: "arborizada-vegetacao",
            }
      : null;

  const aguaTile =
    expandedAreaId === "2"
      ? {
        url:
          selectedSubItem === "Rios"
            ? RIOS_NATAL_TILE_URL
            : selectedSubItem === "Lagos"
              ? LAGOS_NATAL_TILE_URL
              : CORPOS_AGUA_NATAL_TILE_URL,
        name:
          selectedSubItem === "Rios"
            ? "Rios (Earth Engine)"
            : selectedSubItem === "Lagos"
              ? "Lagos/Lagoas (Earth Engine)"
              : "Rios e Lagos (Earth Engine)",
        key: `agua-${selectedSubItem ?? "todos"}`,
      }
      : null;

  const urbanizadaTile =
    expandedAreaId === "1"
      ? {
          url: LANDSAT9_NATAL_TILE_URL,
          name: "Uso do Solo (Landsat 9)",
          key: "urbanizada-landsat",
        }
      : null;

  const arborizadaChart =
    expandedAreaId === "3"
      ? selectedSubItem === "Índice de Vegetação"
        ? {
          title: "Índice de Vegetação (NDVI)",
          subtitle: "Classes principais estimadas (em %)",
          data: [
            { label: "Baixa", value: 28, color: "#D35400" },
            { label: "Média", value: 44, color: "#27AE60" },
            { label: "Alta", value: 28, color: "#1E8449" },
          ],
        }
        : selectedSubItem === "Sombreamento"
          ? {
            title: "Sombreamento",
            subtitle: "Cobertura relativa (em %)",
            data: [
              { label: "Baixo", value: 40, color: "#F5B041" },
              { label: "Médio", value: 38, color: "#7F8C8D" },
              { label: "Alto", value: 22, color: "#2C3E50" },
            ],
          }
          : selectedSubItem === "Evapotranspiração"
            ? {
              title: "Evapotranspiração",
              subtitle: "Faixas principais (em %)",
              data: [
                { label: "Baixa", value: 35, color: "#A569BD" },
                { label: "Média", value: 45, color: "#5DADE2" },
                { label: "Alta", value: 20, color: "#21618C" },
              ],
            }
            : {
              title: "Cobertura Vegetal de Natal",
              subtitle: "Distribuição estimada (IBGE / MapBiomas)",
              data: [
                { label: "Mata Nativa / Parques", value: 12.3, color: "#1E8449" },
                { label: "Arborização Urbana", value: 15.2, color: "#2ECC71" },
                { label: "Sem Cobertura Arbórea", value: 72.5, color: "#BDC3C7" },
              ],
            }
      : null;

  const aguaChart =
    expandedAreaId === "2"
      ? selectedSubItem === "Rios"
        ? {
          title: "Rios",
          subtitle: `% na área: ${RIOS_PERCENTAGE_IN_AREA.toFixed(
            2,
          )}% | % da água total: ${RIOS_PERCENTAGE_OF_WATER.toFixed(2)}%`,
          data: [
            { label: "Rios", value: RIOS_PERCENTAGE_IN_AREA, color: "#1F618D" },
            {
              label: "Demais superfícies",
              value: Math.max(0, 100 - RIOS_PERCENTAGE_IN_AREA),
              color: "#D6EAF8",
            },
          ],
        }
        : selectedSubItem === "Lagos"
          ? {
            title: "Lagos/Lagoas",
            subtitle: `% na área: ${LAGOS_PERCENTAGE_IN_AREA.toFixed(
              2,
            )}% | % da água total: ${LAGOS_PERCENTAGE_OF_WATER.toFixed(2)}%`,
            data: [
              { label: "Lagos/Lagoas", value: LAGOS_PERCENTAGE_IN_AREA, color: "#5DADE2" },
              {
                label: "Demais superfícies",
                value: Math.max(0, 100 - LAGOS_PERCENTAGE_IN_AREA),
                color: "#D6EAF8",
              },
            ],
          }
          : {
            title: "Rios e Lagos",
            subtitle: `Água total na área analisada: ${WATER_TOTAL_PERCENTAGE_IN_AREA.toFixed(
              2,
            )}%`,
            data: [
              { label: "Rios", value: RIOS_PERCENTAGE_OF_WATER, color: "#1F618D" },
              { label: "Lagos/Lagoas", value: LAGOS_PERCENTAGE_OF_WATER, color: "#5DADE2" },
            ],
          }
      : null;

  const urbanizadaChart =
    expandedAreaId === "1"
      ? {
          title: "Divisão Territorial de Natal",
          subtitle: "Uso do solo oficial (IBGE)",
          data: [
            { label: "Área Urbanizada", value: 59.3, color: "#E67E22" },
            { label: "Área Não Urbanizada", value: 40.7, color: "#27AE60" },
          ],
        }
      : null;

  const mapResiliencePoints = useMemo(() => {
    if (expandedAreaId !== "6") return [];
    if (selectedSubItem === "Parques e Praças") {
      return resilienceData.points.filter(p => p.type === "park");
    }
    if (selectedSubItem === "Pontos de Hidratação") {
      return resilienceData.points.filter(p => p.type === "drinking_water");
    }
    if (selectedSubItem === "Ecopontos de Reciclagem") {
      return resilienceData.points.filter(p => p.type === "ecoponto");
    }
    return resilienceData.points;
  }, [expandedAreaId, selectedSubItem, resilienceData.points]);

  const activeTile = aguaTile ?? arborizadaTile ?? urbanizadaTile;
  const activeReports = expandedAreaId === "7" ? reports : undefined;

  return (
    <View style={{ flex: 1 }}>
      <ParallaxScrollView
        headerBackgroundColor={{ light: "#D1FAE5", dark: "#065F46" }}
        headerImage={
          <ThemedView style={styles.headerContainer}>
            <AmbientalMap
              markerCoord={markerCoord}
              tileUrl={activeTile?.url ?? null}
              tileName={activeTile?.name}
              tileKey={activeTile?.key}
              reports={activeReports}
              resiliencePoints={mapResiliencePoints}
              onReportPress={(report) => {
                Alert.alert(report.category, report.description);
              }}
              onMapPress={setMarkerCoord}
            />
            <Image
              source={require("@/assets/images/logo.png")}
              style={styles.logoOnMap}
            />
            {loading && (
              <ThemedView style={styles.loader}>
                <ActivityIndicator size="small" color="#059669" />
              </ThemedView>
            )}
          </ThemedView>
        }
      >
        <ThemedView style={styles.content}>
          <SearchBar
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleLocationSearch}
            placeholder="Buscar bairro ou rua em Natal..."
          />

          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Camadas de Análise
          </ThemedText>

          {AREAS_DATA.map((item) => {
            const isExpanded = expandedAreaId === item.id;
            return (
              <AreaAccordion
                key={item.id}
                item={item}
                isExpanded={isExpanded}
                selectedSubItem={selectedSubItem}
                onToggle={() => toggleArea(item.id)}
                onSelectSubItem={setSelectedSubItem}
              >
                {item.id === "3" && arborizadaChart ? (
                  <PieChart
                    title={arborizadaChart.title}
                    subtitle={arborizadaChart.subtitle}
                    data={arborizadaChart.data}
                  />
                ) : null}

                {item.id === "2" && aguaChart ? (
                  <PieChart
                    title={aguaChart.title}
                    subtitle={aguaChart.subtitle}
                    data={aguaChart.data}
                  />
                ) : null}

                {item.id === "1" ? (
                  <View>
                    {urbanizadaChart && (
                      <PieChart
                        title={urbanizadaChart.title}
                        subtitle={urbanizadaChart.subtitle}
                        data={urbanizadaChart.data}
                      />
                    )}
                    <View style={[styles.infoCard, { backgroundColor: cardBg, borderColor: cardBorder, marginTop: 12 }]}>
                      <View style={styles.infoCardHeaderRow}>
                        <Text style={[styles.infoCardTitle, { color: textColor }]}>
                          Uso do Solo e Urbanização (IBGE)
                        </Text>
                        {loadingRealHome && (
                          <ActivityIndicator size="small" color="#059669" />
                        )}
                      </View>
                      <View style={[styles.infoRow, selectedSubItem === "Impermeabilização do solo" && styles.infoRowSelected]}>
                        <Text style={[styles.infoLabel, { color: subtitleColor }]}>Área Urbanizada Oficial:</Text>
                        <Text style={[styles.infoValue, { color: textColor }]}>99,31 km²</Text>
                      </View>
                      <View style={[styles.infoRow, selectedSubItem === "Impermeabilização do solo" && styles.infoRowSelected]}>
                        <Text style={[styles.infoLabel, { color: subtitleColor }]}>Taxa de Impermeabilização:</Text>
                        <Text style={[styles.infoValue, { color: textColor }]}>59,3% do solo</Text>
                      </View>
                      <View style={[styles.infoRow, selectedSubItem === "Vegetação Urbana" && styles.infoRowSelected]}>
                        <Text style={[styles.infoLabel, { color: subtitleColor }]}>Arborização de Vias Públicas:</Text>
                        <Text style={[styles.infoValue, { color: textColor }]}>90,9%</Text>
                      </View>
                      <View style={[styles.infoRow, selectedSubItem === "Albedo de Superfície" && styles.infoRowSelected]}>
                        <Text style={[styles.infoLabel, { color: subtitleColor }]}>Albedo de Superfície Médio:</Text>
                        <Text style={[styles.infoValue, { color: textColor }]}>0,18 (Reflexão Solar)</Text>
                      </View>
                      <View style={[styles.infoRow, selectedSubItem === "Densidade Populacional" && styles.infoRowSelected]}>
                        <Text style={[styles.infoLabel, { color: subtitleColor }]}>Densidade Populacional Real:</Text>
                        <Text style={[styles.infoValue, { color: textColor }]}>
                          {vulnerabilityData.density} hab./km²
                        </Text>
                      </View>
                    </View>
                  </View>
                ) : null}

                {item.id === "5" ? (
                  <View style={[styles.infoCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                    <View style={styles.infoCardHeaderRow}>
                      <Text style={[styles.infoCardTitle, { color: textColor }]}>
                        Dinâmica Atmosférica em Tempo Real (Open-Meteo)
                      </Text>
                      {loadingRealHome && (
                        <ActivityIndicator size="small" color="#059669" />
                      )}
                    </View>
                    <View style={[styles.infoRow, selectedSubItem === "Corredores de Vento" && styles.infoRowSelected]}>
                      <Text style={[styles.infoLabel, { color: subtitleColor }]}>Velocidade do Vento:</Text>
                      <Text style={[styles.infoValue, { color: textColor }]}>
                        {atmosphericData.windSpeed} km/h
                      </Text>
                    </View>
                    <View style={[styles.infoRow, selectedSubItem === "Corredores de Vento" && styles.infoRowSelected]}>
                      <Text style={[styles.infoLabel, { color: subtitleColor }]}>Direção do Vento:</Text>
                      <Text style={[styles.infoValue, { color: textColor }]}>
                        {atmosphericData.windDirection}°
                      </Text>
                    </View>
                    <View style={[styles.infoRow, selectedSubItem === "Umidade Relativa do Ar" && styles.infoRowSelected]}>
                      <Text style={[styles.infoLabel, { color: subtitleColor }]}>Umidade Relativa:</Text>
                      <Text style={[styles.infoValue, { color: textColor }]}>
                        {atmosphericData.relativeHumidity}%
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={[styles.infoLabel, { color: subtitleColor }]}>Pressão Atmosférica:</Text>
                      <Text style={[styles.infoValue, { color: textColor }]}>
                        {atmosphericData.surfacePressure} hPa
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={[styles.infoLabel, { color: subtitleColor }]}>Índice UV:</Text>
                      <Text style={[styles.infoValue, { color: textColor }]}>
                        {atmosphericData.uvIndex}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={[styles.infoLabel, { color: subtitleColor }]}>Cobertura de Nuvens:</Text>
                      <Text style={[styles.infoValue, { color: textColor }]}>
                        {atmosphericData.cloudCover}%
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={[styles.infoLabel, { color: subtitleColor }]}>Qualidade do Ar (PM2.5):</Text>
                      <Text style={[styles.infoValue, { color: textColor }]}>
                        {airQualityData.pm25} µg/m³
                      </Text>
                    </View>

                    {/* Alertas de Saúde Humana */}
                    <View style={styles.alertContainer}>
                      <Text style={styles.alertHeader}>Recomendações Ambientais e de Saúde:</Text>
                      
                      <View style={styles.alertRow}>
                        <Text style={styles.alertDot}>•</Text>
                        <Text style={[styles.alertText, { color: subtitleColor }]}>
                          {atmosphericData.uvIndex < 3
                            ? "Índice UV Baixo: Seguro para atividades externas sem proteção."
                            : atmosphericData.uvIndex < 6
                              ? "Índice UV Moderado: Use protetor solar e evite exposição prolongada."
                              : atmosphericData.uvIndex < 8
                                ? "Índice UV Alto: Protetor solar (FPS 30+), chapéu e óculos de sol recomendados."
                                : "Índice UV Crítico: Evite exposição direta ao sol. Risco extremo de queimaduras."}
                        </Text>
                      </View>

                      <View style={styles.alertRow}>
                        <Text style={styles.alertDot}>•</Text>
                        <Text style={[styles.alertText, { color: subtitleColor }]}>
                          {airQualityData.pm25 <= 12
                            ? "Qualidade do ar Excelente: Ideal para esportes ao ar livre em Natal."
                            : airQualityData.pm25 <= 35
                              ? "Qualidade do ar Boa: Adequado para a população geral."
                              : "Qualidade do ar Moderada/Ruim: Pessoas sensíveis devem reduzir esforço físico prolongado."}
                        </Text>
                      </View>
                    </View>
                  </View>
                ) : null}

                {item.id === "6" ? (
                  <View style={[styles.infoCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                    <View style={styles.infoCardHeaderRow}>
                      <Text style={[styles.infoCardTitle, { color: textColor }]}>
                        Resiliência Urbana de Natal (OpenStreetMap)
                      </Text>
                      {loadingRealHome && (
                        <ActivityIndicator size="small" color="#059669" />
                      )}
                    </View>
                    <View style={[styles.infoRow, selectedSubItem === "Parques e Praças" && styles.infoRowSelected]}>
                      <Text style={[styles.infoLabel, { color: subtitleColor }]}>Parques e Praças Mapeados:</Text>
                      <Text style={[styles.infoValue, { color: textColor }]}>
                        {resilienceData.parksCount}
                      </Text>
                    </View>
                    <View style={[styles.infoRow, selectedSubItem === "Pontos de Hidratação" && styles.infoRowSelected]}>
                      <Text style={[styles.infoLabel, { color: subtitleColor }]}>Pontos de Hidratação Públicos:</Text>
                      <Text style={[styles.infoValue, { color: textColor }]}>
                        {resilienceData.drinkingWaterCount}
                      </Text>
                    </View>
                    <View style={[styles.infoRow, selectedSubItem === "Ecopontos de Reciclagem" && styles.infoRowSelected]}>
                      <Text style={[styles.infoLabel, { color: subtitleColor }]}>Ecopontos de Reciclagem:</Text>
                      <Text style={[styles.infoValue, { color: textColor }]}>
                        {resilienceData.ecopontosCount}
                      </Text>
                    </View>

                    {selectedSubItem === "Parques e Praças" && resilienceData.parksList.length > 0 && (
                      <View style={styles.listSection}>
                        <Text style={[styles.listSectionTitle, { color: textColor }]}>Alguns Parques/Praças de Destaque:</Text>
                        {resilienceData.parksList.map((park, i) => (
                          <Text key={i} style={[styles.listItem, { color: subtitleColor }]}>• {park}</Text>
                        ))}
                      </View>
                    )}

                    {selectedSubItem === "Pontos de Hidratação" && resilienceData.drinkingWaterList.length > 0 && (
                      <View style={styles.listSection}>
                        <Text style={[styles.listSectionTitle, { color: textColor }]}>Pontos de Água Potável Encontrados:</Text>
                        {resilienceData.drinkingWaterList.map((water, i) => (
                          <Text key={i} style={[styles.listItem, { color: subtitleColor }]}>• {water}</Text>
                        ))}
                      </View>
                    )}

                    {selectedSubItem === "Ecopontos de Reciclagem" && resilienceData.ecopontosList && resilienceData.ecopontosList.length > 0 && (
                      <View style={styles.listSection}>
                        <Text style={[styles.listSectionTitle, { color: textColor }]}>Ecopontos Mapeados (Descarte Seletivo):</Text>
                        {resilienceData.ecopontosList.map((eco, i) => (
                          <Text key={i} style={[styles.listItem, { color: subtitleColor }]}>• {eco}</Text>
                        ))}
                      </View>
                    )}
                  </View>
                ) : null}

                {item.id === "7" ? (
                  <View style={[styles.infoCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                    <View style={styles.infoCardHeaderRow}>
                      <Text style={[styles.infoCardTitle, { color: textColor }]}>
                        Ocorrências Ambientais Registradas
                      </Text>
                      {reports.length > 0 && (
                        <TouchableOpacity
                          style={styles.exportButton}
                          onPress={handleExportCSV}
                        >
                          <Text style={styles.exportButtonText}>Exportar (CSV)</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    {reports.length === 0 ? (
                      <Text style={[styles.emptyText, { color: subtitleColor }]}>
                        Nenhuma ocorrência local registrada ainda. Toque no botão &quot;+ Reportar&quot; abaixo para registrar!
                      </Text>
                    ) : (
                      reports.map((report) => (
                        <View key={report.id} style={styles.reportItemRow}>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.reportCategoryText, { color: textColor }]}>
                              {report.category}
                            </Text>
                            {report.description ? (
                              <Text style={[styles.reportDescText, { color: subtitleColor }]}>
                                {report.description}
                              </Text>
                            ) : null}
                            <Text style={[styles.reportTimeText, { color: subtitleColor }]}>
                              Coordenadas: {report.latitude.toFixed(4)}, {report.longitude.toFixed(4)} | {new Date(report.timestamp).toLocaleString("pt-BR")}
                            </Text>
                          </View>
                          <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() => handleDeleteReport(report.id!)}
                          >
                            <Text style={styles.deleteButtonText}>Excluir</Text>
                          </TouchableOpacity>
                        </View>
                      ))
                    )}
                  </View>
                ) : null}
              </AreaAccordion>
            );
          })}
        </ThemedView>
      </ParallaxScrollView>

      <FloatingActionButton
        onPress={() => setModalVisible(true)}
        label="+ Reportar"
      />

      <ReportModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleAddReport}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: { flex: 1, width: "100%", minHeight: 250, position: "relative" },
  logoOnMap: {
    position: "absolute",
    top: 50,
    right: 20,
    width: 50,
    height: 50,
    resizeMode: "contain",
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 25,
  },
  loader: {
    position: "absolute",
    top: 20,
    left: 20,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 20,
    elevation: 5,
  },
  content: { padding: 16, gap: 10 },
  sectionTitle: { marginTop: 10, fontSize: 18, marginBottom: 5 },
  infoCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
    gap: 8,
  },
  infoCardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: "bold",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  infoRowSelected: {
    backgroundColor: "rgba(5, 150, 105, 0.08)",
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  infoLabel: {
    fontSize: 13,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: "bold",
  },
  listSection: {
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    paddingTop: 8,
    gap: 4,
  },
  listSectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 2,
  },
  listItem: {
    fontSize: 12,
    paddingLeft: 6,
  },
  exportButton: {
    backgroundColor: "#059669",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  exportButtonText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "bold",
  },
  emptyText: {
    fontSize: 12,
    textAlign: "center",
    marginVertical: 10,
    fontStyle: "italic",
  },
  reportItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.1)",
    paddingVertical: 8,
    gap: 10,
  },
  reportCategoryText: {
    fontSize: 13,
    fontWeight: "bold",
  },
  reportDescText: {
    fontSize: 12,
    marginTop: 2,
  },
  reportTimeText: {
    fontSize: 10,
    marginTop: 4,
  },
  deleteButton: {
    backgroundColor: "#DC2626",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "bold",
  },
  alertContainer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    paddingTop: 8,
    gap: 6,
  },
  alertHeader: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#059669",
    marginBottom: 2,
  },
  alertRow: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 4,
  },
  alertDot: {
    fontSize: 12,
    color: "#059669",
  },
  alertText: {
    fontSize: 12,
    flex: 1,
  },
});
