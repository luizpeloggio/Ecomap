import React, { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker, UrlTile } from "react-native-maps";

import { MAP_CENTER_NATAL } from "@/constants/earth-engine-tiles";

import type { AmbientalMapProps } from "./ambiental-map.types";

/**
 * Mapa nativo (iOS/Android): base Google Maps + sobreposição dos tiles do Earth Engine.
 */
export default function AmbientalMap({
  markerCoord,
  tileUrl,
  tileKey,
  reports,
  resiliencePoints,
  onReportPress,
  onMapPress
}: AmbientalMapProps) {
  const mapRef = useRef<MapView>(null);
  const { latitude, longitude } = markerCoord;

  useEffect(() => {
    mapRef.current?.animateToRegion(
      {
        latitude,
        longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      },
      800,
    );
  }, [latitude, longitude]);

  return (
    <View style={styles.wrap}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider="google"
        initialRegion={{
          latitude: MAP_CENTER_NATAL[0],
          longitude: MAP_CENTER_NATAL[1],
          latitudeDelta: 0.15,
          longitudeDelta: 0.15,
        }}
        onPress={(e) => onMapPress?.(e.nativeEvent.coordinate)}
      >
        {tileUrl ? (
          <UrlTile
            key={tileKey ?? tileUrl}
            urlTemplate={tileUrl}
            zIndex={1}
            opacity={0.8}
            maximumZ={19}
          />
        ) : null}
        
        {reports?.map((report) => (
          <Marker
            key={`report-${report.id}`}
            coordinate={{ latitude: report.latitude, longitude: report.longitude }}
            pinColor="orange"
            title={report.category}
            description={report.description}
            onCalloutPress={() => onReportPress?.(report)}
          />
        ))}

        {resiliencePoints?.map((point, index) => (
          <Marker
            key={`resilience-${point.type}-${index}`}
            coordinate={{ latitude: point.latitude, longitude: point.longitude }}
            pinColor={point.type === "park" ? "green" : point.type === "ecoponto" ? "purple" : "blue"}
            title={point.title}
            description={
              point.type === "park"
                ? "Parque / Praça de Resiliência"
                : point.type === "ecoponto"
                  ? "Ecoponto / Ponto de Reciclagem"
                  : "Ponto de Hidratação"
            }
          />
        ))}

        <Marker
          coordinate={markerCoord}
          title="Local selecionado"
          description="Segure e arraste para ajustar a posição"
          draggable
          onDragEnd={(e) => onMapPress?.(e.nativeEvent.coordinate)}
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, width: "100%", minHeight: 250 },
  map: { ...StyleSheet.absoluteFillObject },
});
