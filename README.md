# Uhai WashWise

A real-time water quality monitoring dashboard for Kisumu, Kenya. Built to help water operators and communities track contamination risk, sensor readings, and safety alerts across five sub-regions near key water bodies.

![Dashboard Preview](Uhaiwashwise1_page-0001%201.png)

---

## What it does

- **Live sensor readings** — temperature and turbidity from real sensors; pH, dissolved oxygen, conductivity, and nitrates from simulation
- **Region-based filtering** — switch between All Regions and specific sub-regions (Dunga, Ahero, Nyalenda, Kibos, Kondele)
- **Parameter trend charts** — 24-hour area chart per region showing safe range boundaries
- **Water quality predictions** — 7-day contamination risk forecast per region with expandable details
- **Alerts table** — filterable by severity (Critical / Warning / Resolved)
- **Monitoring stations** — status of all water source stations per region
- **Dark / light mode** — toggle in the header

---

## Regions covered

| Region | Water Body |
|--------|-----------|
| Dunga | Lake Victoria — Dunga Beach |
| Ahero | Nyando River & Irrigation Canals |
| Nyalenda | Nyalenda Wetland & Streams |
| Kibos | Kibos River |
| Kondele | Kondele Municipal Water Points |

---

## Tech stack

| Tool | Version | Purpose |
|------|---------|---------|
| React | 18 | UI framework |
| TypeScript | 4 | Type safety |
| Vite | 2 | Build tool & dev server |
| Tailwind CSS | 3 | Styling |
| Recharts | 2 | Charts |
| Lucide React | 1 | Icons |
| Geist Sans | — | Font |

> **Note:** This project requires **Node.js 12–16**. Node 17+ uses Vite 3+ which has breaking changes with this setup.

---

## Getting started

### 1. Clone the repo

```bash
git clone https://github.com/nyagooh/Aquawise.git
cd Aquawise
```

### 2. Install dependencies

```bash
cd dashboard
npm install
```

### 3. Start the dev server

```bash
npm run dev -- --port 3030
```

Open [http://localhost:3030](http://localhost:3030) in your browser.

### 4. Build for production

```bash
npm run build
```

Output goes to `dashboard/dist/`.

---

## Project structure

```
Aquawise/
└── dashboard/
    ├── public/            # Static assets (logo, etc.)
    ├── src/
    │   ├── components/    # All UI components
    │   │   ├── Header.tsx             # Top bar with search, theme toggle, clock
    │   │   ├── Sidebar.tsx            # Navigation sidebar
    │   │   ├── SensorCard.tsx         # Individual sensor reading card
    │   │   ├── ParameterChart.tsx     # 24h trend chart (region view)
    │   │   ├── AlertsTable.tsx        # Filterable alerts list
    │   │   ├── RegionalPredictions.tsx # 7-day forecast accordion
    │   │   └── WaterSourceMap.tsx     # Station status list
    │   ├── context/
    │   │   ├── ThemeContext.tsx        # Light/dark mode state
    │   │   └── NavigationContext.tsx  # Sidebar navigation & scroll
    │   ├── data/
    │   │   └── mockData.ts            # All data: sensors, alerts, regions
    │   ├── utils/
    │   │   └── riskCalculator.ts      # Sensor risk level helpers
    │   ├── App.tsx                    # Root layout and region logic
    │   └── index.css                  # Global styles, card system
    ├── tailwind.config.js             # Color palette, typography
    └── vite.config.ts                 # Vite config
```

---

## Swapping in real data

All data lives in `src/data/mockData.ts`. To connect real sensors:

1. Replace `currentReadings` values with your API response
2. Replace `recentAlerts` with alerts from your backend
3. Replace `regionPredictions` with model output
4. The `timeSeriesData` function generates 24h mock data — replace with a real time-series API call

---

## Color system

Primary blue: `#2563EB` · Background light: `#E8EEF8` · Background dark: `#1A2332`

All colors are defined in `tailwind.config.js` under `theme.extend.colors` and can be changed in one place.
