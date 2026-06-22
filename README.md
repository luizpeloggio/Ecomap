# EcoMap - Portal e Aplicativo de Análise Ambiental de Natal/RN

Aplicativo móvel e web híbrido para monitoramento socioambiental da cidade de Natal/RN, permitindo que os cidadãos acompanhem dados climáticos, visualizem dados georreferenciados via Google Earth Engine e registrem ocorrências ambientais colaborativamente.

📖 Sobre o Projeto
O **EcoMap** foi desenvolvido como o projeto final da disciplina de Desenvolvimento para Dispositivos Móveis no curso de **Ciência da Computação da UERN**. O objetivo do sistema é unir dados demográficos, climáticos, geográficos e relatos colaborativos para fornecer uma visão integrada do ecossistema e da resiliência urbana da cidade de Natal/RN. 

O app combina dados científicos reais de satélite (Landsat 9) processados pelo **Google Earth Engine**, mapeamento urbano dinâmico do **OpenStreetMap** (via Overpass API), estatísticas oficiais do **IBGE (SIDRA e Cidades)** e monitoramento de clima e qualidade do ar em tempo real (via **Open-Meteo**), tudo integrado em uma interface unificada e interativa que funciona perfeitamente tanto em smartphones quanto em navegadores web.

---
# Tela Inicial
<img width="300" height="550" alt="ecomap" src="https://github.com/user-attachments/assets/1b6aa300-d207-4d4c-b6c5-0c27c6a94d9f" />

✨ Funcionalidades

👤 Usuário e Localização
* **Geolocalização**: Rastreamento da localização do usuário para posicionamento inicial e plotagem precisa de reportes.
* **Busca de Endereços**: Barra de pesquisa integrada para geocodificação direta via OpenStreetMap (Expo Location), permitindo localizar rapidamente qualquer rua, avenida ou bairro de Natal/RN.

🗺️ Mapa Ambiental Interativo (Híbrido)
* **Arquitetura Multiplataforma**: Renderização inteligente que utiliza mapas nativos (`react-native-maps`) em dispositivos móveis (Android/iOS) e mapas baseados em Leaflet (`react-leaflet`) para a interface Web.
* **Marcadores Dinâmicos**: Exibição visual diferenciada de pontos de infraestrutura ecológica e reportes da comunidade.

🛰️ Camadas de Satélite (Google Earth Engine)
Apresenta no mapa camadas temáticas de satélite processadas diretamente a partir de dados históricos e atuais do satélite **Landsat 9** e bases científicas globais:
* **Uso do Solo e Urbanização**: Camada RGB verdadeiro para visualização da mancha urbana e impermeabilização do solo de Natal.
* **Corpos de Água**: Análise espectral de rios e lagos utilizando o índice MNDWI (*Modified Normalized Difference Water Index*) combinado com dados de ocorrência de água do JRC (*Joint Research Centre*).
* **Área Arborizada (NDVI)**: Cobertura vegetal em tempo real baseada no índice NDVI (*Normalized Difference Vegetation Index*).
* **Sombreamento Urbano**: Proxy visual de ilhas de calor e sombras projetadas gerado por reflectância infravermelha de ondas curtas (SWIR1).
* **Evapotranspiração**: Análise térmica de liberação de vapor de água pela vegetação e solo.

🏥 Dinâmica Atmosférica e Qualidade do Ar (Tempo Real)
* **Condições do Ar**: Monitoramento detalhado e atualizado de poluentes gasosos e particulados (PM2.5, PM10, Monóxido de Carbono - CO, Ozônio - O3, Dióxido de Nitrogênio - NO2, e Dióxido de Enxofre - SO2).
* **Dinâmica Atmosférica**: Velocidade e direção do vento, umidade relativa do ar, pressão barométrica, índice UV e cobertura de nuvens via API do Open-Meteo.
* **Alertas e Recomendações**: Orientações automáticas de saúde integradas ao app (ex.: cuidados com exposição solar recomendados com base no Índice UV do dia e recomendações de exercícios com base na concentração de partículas PM2.5).

🏙️ Infraestrutura de Resiliência Urbana (OpenStreetMap)
Mapeamento e contagem em tempo real (via Overpass API) de elementos cruciais para a resiliência urbana em Natal/RN:
* **Parques e Praças**: Espaços verdes públicos catalogados no OpenStreetMap (`leisure=park`).
* **Pontos de Hidratação**: Bebedouros e pontos de acesso público à água potável mapeados (`amenity=drinking_water`).
* **Ecopontos de Reciclagem**: Pontos públicos dedicados ao descarte seletivo de resíduos recicláveis (`amenity=recycling`).

📊 Gráficos de Série Histórica
* **Histórico de 70 Anos**: Visualização de série histórica climática (com dados reais consolidados de 2018 a 2023 obtidos pela Open-Meteo Archive API).
* **Gráficos Climáticos**: Gráficos de barras e linhas interativos mostrando a variação de temperatura média e precipitação acumulada ao longo dos meses do ano selecionado.
* **Distribuição Territorial**: Gráficos de pizza dinâmicos com a proporção oficial do uso do solo, distribuição de rios/lagos e cobertura de vegetação no município.

📢 Reportes Colaborativos da Comunidade
* **Registro de Infrações/Crimes Ambientais**: Registro fácil de ocorrências em categorias (descarte irregular de lixo, poluição sonora, queimadas, desmatamento, vazamentos, etc.).
* **Evidência Fotográfica**: Captura de fotos em tempo real através da câmera do celular ou seleção direta na galeria.
* **Mapeamento Simplificado**: Fixação automática das coordenadas geográficas tocando no mapa interativo.
* **Histórico e Exclusão**: Tela dedicada para ver todas as ocorrências registradas em ordem cronológica com opção de remoção permanente.
* **Exportação para CSV**: Permite exportar os relatos locais da comunidade para um arquivo `.csv` (download direto no navegador para Web ou menu nativo de compartilhamento em celulares).

---

⚙️ Tecnologias Utilizadas

Frontend (Mobile & Web)
* **Expo (SDK 54)**: Framework de desenvolvimento híbrido.
* **React Native**: Criação de interfaces nativas móveis.
* **Expo Router**: Roteamento baseado em arquivos para gerenciar as abas principais (Home, Histórico, Clima) e telas secundárias.
* **TypeScript & JavaScript**: Linguagens de programação.
* **Expo SQLite**: Banco de dados relacional local embarcado para armazenamento offline das ocorrências.
* **Expo Location**: Acesso à geolocalização do dispositivo e busca por endereços (geocodificação).
* **Expo Camera** & **Expo Image Picker**: Interfaces para captura e seleção de imagens.
* **React Native Maps** (Native) & **Leaflet / React-Leaflet** (Web): Visualização e manipulação de mapas dinâmicos e overlays WMS de satélite.
* **React Native Reanimated**: Motor de animações para transições fluidas no layout.

Scripts de Processamento Geográfico
* **Python 3.12**
* **Google Earth Engine Python API (ee)**: Autenticação e requisição de processamento de imagens do satélite Landsat 9 para geração de tokens temporários de tiles.

APIs de Integração e Provedores de Dados
* **IBGE SIDRA API (Tabelas 9514/9515)**: População, densidade e estatísticas demográficas de Natal.
* **IBGE Cidades API**: Dados históricos de PIB para cálculo de renda per capita.
* **OpenStreetMap Overpass API**: Extração de dados de infraestrutura urbana em tempo real.
* **Open-Meteo Archive & Forecast APIs**: Histórico climatológico de Natal e monitoramento meteorológico e qualidade do ar em tempo real.

---

🚀 Instalação e Execução

### Pré-requisitos
Certifique-se de possuir instalado em sua máquina:
* [Node.js](https://nodejs.org/) (versão LTS recomendada)
* [Python 3.10 ou superior](https://www.python.org/)
* Conta e acesso ao [Google Earth Engine](https://earthengine.google.com/) (necessário para renovação de overlays de satélite)

### 1. Clonar o Repositório
```bash
git clone https://github.com/luizpeloggio/Ecomap.git
cd Ecomap
```

### 2. Configurar e Executar o Frontend (React Native / Expo)
Instale as dependências do aplicativo e inicie o servidor de desenvolvimento do Expo:
```bash
# Instalar dependências do projeto
npm install

# Iniciar o Expo Dev Server
npx expo start
```
Após o servidor iniciar, você pode abrir o aplicativo:
* Pressionando `w` no terminal para rodar a versão **Web** no navegador.
* Escaneando o QR Code exibido com o app **Expo Go** em seu celular (Android ou iOS) para rodar a versão **Nativa**.

### 3. Atualizar Overlays do Earth Engine (Opcional - Script Python)
Os tokens gerados pelo Google Earth Engine para as camadas de satélite expiram após um determinado período (24 a 48 horas). Caso as camadas parem de carregar (erro 401/403 nos blocos do mapa), você pode rodar o script utilitário para gerar novas URLs e atualizar o arquivo `constants/earth-engine-tiles.ts`:

1. Instale as dependências do script Python:
```bash
pip install -r scripts/requirements-ee.txt
```
2. Autentique sua conta do Google Earth Engine no terminal:
```bash
earthengine authenticate
```
3. Defina seu projeto do Google Cloud habilitado com a API do Earth Engine e execute o script:
```bash
export EE_PROJECT="seu-projeto-gcp-earth-engine"
python scripts/generate_ee_tile_urls.py
```
4. O script gerará as novas constantes. Copie o resultado do terminal e substitua o conteúdo do arquivo `constants/earth-engine-tiles.ts`.

---

📂 Estrutura do Projeto

```text
Ecomap/
├── .vscode/               # Configurações do ambiente de desenvolvimento
├── app/                   # Diretório de roteamento (Expo Router)
│   ├── (tabs)/            # Abas principais da navegação
│   │   ├── _layout.tsx    # Layout de abas e ícones de navegação
│   │   ├── index.tsx      # Dashboard Principal (Mapa e Camadas de Análise)
│   │   ├── history.tsx    # Histórico de Ocorrências Locais
│   │   └── climate.tsx    # Clima de Natal (Série Histórica, Gráficos e Poluentes)
│   ├── _layout.tsx        # Layout raiz do aplicativo
│   └── modal.tsx          # Tela de modal auxiliar
├── assets/                # Assets estáticos (imagens, fontes e logos)
├── components/            # Componentes visuais e reutilizáveis
│   ├── ui/                # Elementos básicos de UI (Colapsáveis, ícones)
│   ├── ambiental-map.tsx  # Componente de mapa nativo para Mobile
│   ├── ambiental-map.web.tsx # Componente de mapa Leaflet para a versão Web
│   ├── area-accordion.tsx # Accordion para seleção de camadas ambientais
│   ├── climate-charts.tsx # Gráficos de barras e linhas de temperatura/chuva
│   ├── floating-action-button.tsx # Botão flutuante (+ Reportar)
│   ├── pie-chart.tsx      # Gráficos de pizza da divisão territorial/cobertura
│   └── report-modal.tsx   # Modal e formulário para novos relatos ambientais
├── constants/             # Constantes globais
│   ├── earth-engine-tiles.ts # URLs das camadas do Google Earth Engine
│   └── theme.ts           # Configuração de cores (Dark/Light Mode)
├── hooks/                 # Hooks customizados para gerenciamento de tema e estilos
├── scripts/               # Scripts utilitários de suporte ao projeto
│   ├── generate_ee_tile_urls.py # Script Python para renovação dos tiles do Earth Engine
│   ├── requirements-ee.txt # Dependências do script Python
│   └── reset-project.js   # Script auxiliar para redefinição do template
├── services/              # Integração de APIs e serviços do sistema
│   ├── climate-data.ts    # Conexão com a Open-Meteo (Clima e Qualidade do Ar)
│   ├── db.ts              # Inicialização e operações do SQLite local (Reports)
│   └── home-data.ts       # Chamadas ao IBGE (Demografia) e OpenStreetMap (Overpass)
├── tsconfig.json          # Arquivo de configuração do TypeScript
└── package.json           # Dependências e scripts npm do projeto
```

---

🔐 Regras de Negócio

* **Privacidade dos Relatos**: Todos os reportes de crimes ou infrações criados através do aplicativo são salvos unicamente de forma local no banco de dados SQLite do dispositivo do usuário. Nenhuma informação é transmitida a servidores externos.
* **Geolocalização Obrigatória para Reportes**: O usuário precisa conceder permissão de localização do dispositivo ou selecionar ativamente um ponto específico do mapa para que as coordenadas da ocorrência sejam gravadas.
* **Validade das Camadas de Satélite**: Como as URLs geradas pelo Earth Engine dependem de tokens de sessão efêmeros, o aplicativo conta com dados estáticos e fallbacks integrados, permitindo o funcionamento das estatísticas principais mesmo em caso de expiração do token.
* **Resiliência e Fallbacks**: Os dados climáticos (Open-Meteo) e demográficos (IBGE) contam com conjuntos de dados locais de contingência (*fallbacks*). Caso as APIs estejam offline ou haja problemas de conexão, o app consome as médias e índices de contingência sem interromper a navegação.
* **Mapeamento e Exportação de Relatórios**: No ambiente Web, a exportação de dados gera diretamente o download de um arquivo `.csv` na pasta de downloads do navegador. No ambiente móvel, o app grava um arquivo temporário no FileSystem e dispara o menu nativo de compartilhamento do sistema operacional (permitindo envio por WhatsApp, E-mail, ou armazenamento em nuvem).

---

📈 Status do Projeto

* [x] Integração de Mapas Híbridos (React Native Maps & React Leaflet)
* [x] Conexão com Google Earth Engine (Overlays de satélite Landsat 9 - NDVI, MNDWI, SWIR1)
* [x] Script utilitário em Python para renovar os tokens do Earth Engine
* [x] Integração com IBGE (SIDRA e Cidades para demografia e PIB de Natal em tempo real)
* [x] Integração com OpenStreetMap (Overpass API para resiliência - parques, bebedouros, ecopontos)
* [x] Integração com Open-Meteo (Clima e qualidade do ar em tempo real, além de série histórica com gráficos)
* [x] Banco de dados local SQLite persistente para ocorrências ambientais
* [x] Registro e histórico de ocorrências com suporte à remoção e anexação de fotos
* [x] Exportação de ocorrências coletadas em formato CSV (Web e Mobile)
* [x] Suporte completo a Dark Mode e Light Mode dinâmico

---

👨💻 Autor

**Manoel Luiz**
Graduando em Ciência da Computação - UERN
Projeto desenvolvido como projeto final para a disciplina de Dispositivos Móveis.
