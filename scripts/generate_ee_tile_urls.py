#!/usr/bin/env python3
"""
Gera URLs de tiles do Earth Engine (válidas por um período) para colar em
constants/earth-engine-tiles.ts.

Pré-requisitos:
  python3 -m pip install -r scripts/requirements-ee.txt
  earthengine authenticate   # ou ee.Authenticate() na primeira execução

Uso:
  export EE_PROJECT=wide-maxim-431503-b9   # seu projeto Google Cloud com EE
  python3 scripts/generate_ee_tile_urls.py

As camadas abaixo são um ponto de partida (Landsat 9 / NDVI / MNDWI / JRC)
recortadas para a Grande Natal. Substitua as funções build_* pelo mesmo código
que você usa no Earth Engine Code Editor se precisar de resultados idênticos
aos mapas originais.
"""

from __future__ import annotations

import os
import sys

try:
    import ee
except ImportError:
    print(
        "Instale o cliente Python do Earth Engine:\n"
        "  python3 -m pip install -r scripts/requirements-ee.txt",
        file=sys.stderr,
    )
    raise

# Projeto onde os mapas são hospedados (mesmo ID das URLs em earth-engine-tiles.ts).
PROJECT_ID = os.environ.get("EE_PROJECT", "wide-maxim-431503-b9")

# Grande Natal, RN (aprox.). Ajuste se suas análises usam outro recorte.
NATAL = ee.Geometry.Rectangle([-35.55, -6.12, -34.88, -5.58])


def _l9_sr_median() -> ee.Image:
    """Landsat 9 L2 SR — mediana de uma janela seca para reduzir nuvens."""
    col = (
        ee.ImageCollection("LANDSAT/LC09/C02/T1_L2")
        .filterBounds(NATAL)
        .filterDate("2023-05-01", "2023-10-31")
        .filter(ee.Filter.lt("CLOUD_COVER", 40))
    )
    return col.median()


def _scale_sr(img: ee.Image) -> ee.Image:
    """Converte bandas SR_B* para reflectância ~0–1."""
    return img.select(["SR_B2", "SR_B3", "SR_B4", "SR_B5", "SR_B6"]).multiply(
        0.0000275
    ).add(-0.2)


def build_landsat9_rgb() -> ee.Image:
    """RGB verdadeiro (Evapotranspiração / base Landsat no app)."""
    raw = _l9_sr_median()
    rgb = _scale_sr(raw).select(["SR_B4", "SR_B3", "SR_B2"])
    return rgb


def build_ndvi() -> ee.Image:
    """Índice de vegetação (Área arborizada → Índice de Vegetação)."""
    raw = _l9_sr_median()
    s = _scale_sr(raw)
    nir = s.select("SR_B5")
    red = s.select("SR_B4")
    return nir.subtract(red).divide(nir.add(red)).rename("NDVI").clamp(-1, 1)


def build_sombreamento_proxy() -> ee.Image:
    """
    Proxy visual para sombreamento: SWIR1 (mais escuro = sombra/água urbana).
    Substitua pela sua camada se usar índice próprio no Code Editor.
    """
    raw = _l9_sr_median()
    return _scale_sr(raw).select("SR_B6").rename("SWIR1")


def build_mndwi_water() -> ee.Image:
    """MNDWI para corpos d'água (rios + lagos no mesmo índice)."""
    raw = _l9_sr_median()
    s = _scale_sr(raw)
    green = s.select("SR_B3")
    swir = s.select("SR_B6")
    return green.subtract(swir).divide(green.add(swir)).rename("MNDWI").clamp(-1, 1)


def build_jrc_water_occurrence() -> ee.Image:
    """Água estática (JRC) — útil para 'Lagos' vs linhas de rio no MNDWI."""
    jrc = ee.Image("JRC/GSW1_4/GlobalSurfaceWater").select("occurrence")
    return jrc.clip(NATAL)


def tile_url_template(map_id: dict) -> str:
    """Extrai o template .../tiles/{z}/{x}/{y} retornado pelo cliente EE."""
    tf = map_id.get("tile_fetcher")
    if tf is not None:
        url = getattr(tf, "url_format", None)
        if url:
            return url
        if isinstance(tf, dict):
            return tf.get("url_format") or tf.get("urlFormat") or ""
    return (
        map_id.get("url_format")
        or map_id.get("urlFormat")
        or map_id.get("tile_url")
        or ""
    )


def main() -> None:
    ee.Initialize(project=PROJECT_ID)

    layers: list[tuple[str, ee.Image, dict]] = [
        (
            "LANDSAT9_NATAL_TILE_URL",
            build_landsat9_rgb(),
            {"min": 0, "max": 0.35, "gamma": 1.25},
        ),
        (
            "VEGETACAO_NATAL_TILE_URL",
            build_ndvi(),
            {"min": -0.2, "max": 0.8, "palette": ["#8c510a", "#f6e8c3", "#01665e"]},
        ),
        (
            "SOMBREAMENTO_NATAL_TILE_URL",
            build_sombreamento_proxy(),
            {"min": 0, "max": 0.45, "palette": ["#ffffcc", "#636363", "#1a1a1a"]},
        ),
        (
            "CORPOS_AGUA_NATAL_TILE_URL",
            build_mndwi_water(),
            {"min": -1, "max": 0.5, "palette": ["#0d0887", "#6a00a8", "#b12a90", "#e16462"]},
        ),
        (
            "RIOS_NATAL_TILE_URL",
            build_mndwi_water(),
            {"min": -0.2, "max": 0.65, "palette": ["#001133", "#0066cc", "#99ddff"]},
        ),
        (
            "LAGOS_NATAL_TILE_URL",
            build_jrc_water_occurrence(),
            {"min": 0, "max": 100, "palette": ["#f7fbff", "#6baed6", "#08519c"]},
        ),
    ]

    print("// Cole em constants/earth-engine-tiles.ts (substitua as URLs antigas)\n")
    print("/** Gerado por scripts/generate_ee_tile_urls.py — tokens expiram com o tempo. */")

    for name, image, vis in layers:
        mid = image.getMapId(vis)
        url = tile_url_template(mid)
        if not url:
            keys = list(mid) if isinstance(mid, dict) else type(mid).__name__
            print(
                f"// ERRO: não foi possível obter URL para {name}. map_id: {keys}",
                file=sys.stderr,
            )
            sys.exit(1)
        print(f'export const {name} =')
        print(f'  "{url}";')
        print()

    print(f"export const MAP_CENTER_NATAL: [number, number] = [-5.7945, -35.2094];")


if __name__ == "__main__":
    main()
