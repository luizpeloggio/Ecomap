import { Report } from "@/services/db";

export type MapMarkerPoint = {
  latitude: number;
  longitude: number;
  title: string;
  type: 'park' | 'drinking_water' | 'ecoponto';
};

export type AmbientalMapProps = {
  markerCoord: { latitude: number; longitude: number };
  /**
   * URL de tiles a ser exibida como overlay.
   * Quando `null`, não exibimos nenhuma camada de satélite.
   */
  tileUrl: string | null;
  /** Nome da camada exibida no controle (web). */
  tileName?: string;
  /** Chave para forcar refresh do overlay de tiles no mapa nativo. */
  tileKey?: string;
  /** Lista de ocorrências ambientais para exibir no mapa */
  reports?: Report[];
  /** Lista de pontos de infraestrutura de resiliência */
  resiliencePoints?: MapMarkerPoint[];
  /** Callback quando clicar num marcador de reporte */
  onReportPress?: (report: Report) => void;
  /** Callback quando o usuário clicar ou tocar no mapa */
  onMapPress?: (coord: { latitude: number; longitude: number }) => void;
};
