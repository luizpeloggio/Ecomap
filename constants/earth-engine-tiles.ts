/**
 * Camadas de tiles do Earth Engine. Cada URL tem o formato
 * `.../maps/{mapId}-{token}/tiles/{z}/{x}/{y}`: o sufixo após o hífen é um **token
 * de sessão** retornado por `getMapId()` / API REST. Ele **expira**; quando isso
 * acontece, o app deixa de mostrar a camada (401 no tile). Gere novas URLs no
 * Earth Engine (Code Editor ou script com `ee.Image(...).getMapId(...)`) e
 * substitua as constantes abaixo, ou sirva os tiles via backend com credencial
 * de serviço (recomendado em produção).
 */
export const LANDSAT9_NATAL_TILE_URL =
  "https://earthengine.googleapis.com/v1/projects/wide-maxim-431503-b9/maps/dcba1c7b9acc5444aa36b80a824b52dd-b50766d3f73f663a45a59dc3ce4dcae5/tiles/{z}/{x}/{y}";

export const VEGETACAO_NATAL_TILE_URL =
  "https://earthengine.googleapis.com/v1/projects/wide-maxim-431503-b9/maps/14dae528f808d38a74ee681ad3b31d98-f31e78a6e94b1bbdff8d1a30fd838350/tiles/{z}/{x}/{y}";

export const SOMBREAMENTO_NATAL_TILE_URL =
  "https://earthengine.googleapis.com/v1/projects/wide-maxim-431503-b9/maps/214125331af2bf34f5d1efa788c8e67f-2b89e47bfd257ea3bbdfd48cf9825eb4/tiles/{z}/{x}/{y}";

export const CORPOS_AGUA_NATAL_TILE_URL =
  "https://earthengine.googleapis.com/v1/projects/wide-maxim-431503-b9/maps/c249949fe5c619da67e7cad3b11777c2-c1870d8b3bd54472deeb7a3a8c16ed55/tiles/{z}/{x}/{y}";

export const RIOS_NATAL_TILE_URL =
  "https://earthengine.googleapis.com/v1/projects/wide-maxim-431503-b9/maps/cd8eb09e994f29ebffee6c9b19018a19-11bc6ee4ebdec0b5c5eb7edf4b2449f1/tiles/{z}/{x}/{y}";

export const LAGOS_NATAL_TILE_URL =
  "https://earthengine.googleapis.com/v1/projects/wide-maxim-431503-b9/maps/985c79643db0440c193fdec2ab596f4b-5881529685d047e799a8bfd81d4a7aff/tiles/{z}/{x}/{y}";

export const MAP_CENTER_NATAL: [number, number] = [-5.7945, -35.2094];
