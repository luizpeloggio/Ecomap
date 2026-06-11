import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import {
  CircleMarker,
  LayersControl,
  MapContainer,
  TileLayer,
  useMap,
  useMapEvents,
  Popup,
} from "react-leaflet";

import { MAP_CENTER_NATAL } from "@/constants/earth-engine-tiles";

import type { AmbientalMapProps } from "./ambiental-map.types";

function FlyToMarker({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([latitude, longitude], Math.max(map.getZoom(), 13), {
      duration: 0.6,
    });
  }, [latitude, longitude, map]);
  return null;
}

function MapEvents({
  onMapPress,
}: {
  onMapPress?: (coord: { latitude: number; longitude: number }) => void;
}) {
  useMapEvents({
    click(e) {
      onMapPress?.({ latitude: e.latlng.lat, longitude: e.latlng.lng });
    },
  });
  return null;
}

/**
 * Mapa na web (Leaflet): OSM + camada Landsat 9 (Earth Engine), como no seu fragmento.
 */
const LEAFLET_CSS_HREF =
  "https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css";

export default function AmbientalMap({
  markerCoord,
  tileUrl,
  tileName,
  reports,
  resiliencePoints,
  onReportPress,
  onMapPress,
}: AmbientalMapProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const existing = document.querySelector(
      `link[href="${LEAFLET_CSS_HREF}"]`,
    ) as HTMLLinkElement | null;
    if (existing?.sheet) {
      setReady(true);
      return;
    }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = LEAFLET_CSS_HREF;
    link.onload = () => setReady(true);
    link.onerror = () => setReady(true);
    document.head.appendChild(link);
  }, []);

  if (!ready) {
    return <View style={styles.wrap} />;
  }

  const overlayUrl = tileUrl;
  const overlayName = tileName ?? "Dados (satélite)";

  return (
    <View style={styles.wrap}>
      <MapContainer
        center={MAP_CENTER_NATAL}
        zoom={12}
        style={{ height: "100%", width: "100%", minHeight: 250 }}
        scrollWheelZoom
      >
        <FlyToMarker
          latitude={markerCoord.latitude}
          longitude={markerCoord.longitude}
        />
        <MapEvents onMapPress={onMapPress} />
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="OpenStreetMap">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          </LayersControl.BaseLayer>

          {overlayUrl ? (
            <LayersControl.Overlay checked name={overlayName}>
              <TileLayer
                url={overlayUrl}
                opacity={0.7}
                attribution="Map data &copy; Google Earth Engine / USGS"
              />
            </LayersControl.Overlay>
          ) : null}
        </LayersControl>

        <CircleMarker
          center={[markerCoord.latitude, markerCoord.longitude]}
          radius={8}
          pathOptions={{
            color: "#007AFF",
            fillColor: "#007AFF",
            fillOpacity: 0.9,
          }}
        />

        {reports?.map((report) => (
          <CircleMarker
            key={`report-${report.id}`}
            center={[report.latitude, report.longitude]}
            radius={8}
            pathOptions={{
              color: "#E67E22",
              fillColor: "#E67E22",
              fillOpacity: 0.9,
            }}
            eventHandlers={{
              click: () => onReportPress?.(report),
            }}
          />
        ))}

        {resiliencePoints?.map((point, index) => {
          const color = point.type === "park" ? "#2ECC71" : point.type === "ecoponto" ? "#8E44AD" : "#3498DB";
          return (
            <CircleMarker
              key={`resilience-${point.type}-${index}`}
              center={[point.latitude, point.longitude]}
              radius={8}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: 0.9,
              }}
            >
              <Popup>{point.title}</Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, width: "100%", minHeight: 250 },
});
