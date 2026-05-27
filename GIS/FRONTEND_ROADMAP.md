# Frontend Integration Roadmap
## AquaWise GIS — React → Django Backend Alignment

**Frontend:** `/home/tomlee/Desktop/dev/Aquawise/GIS` (Vite + React 18 + TypeScript + Leaflet)  
**Backend:** `/home/tomlee/Desktop/dev/Aquawise/GIS/backend` (Django + GeoDjango + DRF + Channels)  
**Created:** 2026-05-20

> **Legend:** ✅ Done &nbsp;|&nbsp; 🔧 In progress &nbsp;|&nbsp; ⬜ Not started

---

## Current State Gap Analysis

| Area | Frontend Now | Backend Now | Gap |
|------|-------------|-------------|-----|
| Auth | ✅ JWT login, protected routes, AuthContext | JWT (`/api/v1/auth/token/`) | — done |
| Network data | ✅ API when active network; static GeoJSON fallback | `GET /api/v1/networks/{id}/pipes/` etc. | bbox tile loading, zone overlays |
| Upload | ✅ Real POST with progress, status polling, EPANET support | `POST /api/v1/networks/upload/` + Celery | — done |
| Sensors | ✅ Real nodes from API; junction nodes from pipe endpoints | `Sensor`, `SensorReading` models + WebSocket | Real sensor API + live WebSocket |
| Alerts | ✅ Wired to real API (AlertEvent) | `AlertRule`, `AlertEvent` models | Real alert feed from API |
| NRW | ✅ Wired to real stats API (deriveNRWFromStats) | `LeakRiskScore`, `AnomalyEvent` models | Replace with real ML scores |
| Reports | ✅ Wired to real stats API (deriveFromStats) | — | — |
| Multi-tenancy | ✅ Org name shown in sidebar via AuthContext | `Organisation` + `Project` per user | Project switcher |
| API client | ✅ Axios + React Query + JWT interceptor | DRF at `/api/v1/` | — done |
| Environment | ✅ `.env` + proxy config | DRF at `http://localhost:8000` | — done |
| WebSocket | None | Django Channels at `ws/sensors/{network_id}/` | WebSocket hook |

---

## Phase Overview

```
Phase 1 ──► Phase 2 ──► Phase 3 ──► Phase 4 ──► Phase 5 ──► Phase 6
API Client   Network      Upload      Sensors     Alerts      Analytics
& Auth  ✅   Map from ✅  Pipeline ✅ Live Data   & Rules     & NRW
             Backend
```

---

## Phase 1 — API Client, Auth & Environment ✅
**Goal:** Every page can talk to the backend. Users log in with real credentials.

### 1.1 Project setup ✅
- [x] Add dependencies: `axios`, `@tanstack/react-query`, `react-hook-form`, `zod`, `@hookform/resolvers`
- [x] Create `.env` / `.env.example` with `VITE_API_BASE_URL` and `VITE_WS_BASE_URL`
- [x] Add Vite proxy in `vite.config.ts` — `/api` → `http://localhost:8000`, `/ws` → `ws://localhost:8000`
- [x] Create `src/lib/api.ts` — Axios instance with:
  - `baseURL` from `VITE_API_BASE_URL`
  - Request interceptor: attach `Authorization: Bearer <token>` from localStorage
  - Response interceptor: 401 → silent refresh (queued), redirect to `/login` if refresh fails
- [x] Wrap `main.tsx` with `<QueryClientProvider>` (staleTime 30s, no retry on 4xx)
- [x] Create `src/vite-env.d.ts` — TypeScript `ImportMetaEnv` declarations for Vite env vars *(added — was not in original plan)*

### 1.2 Auth context ✅
- [x] Create `src/context/AuthContext.tsx`:
  - State: `user` (id, email, role, organisation), `isLoading`
  - Actions: `login()`, `logout()`
  - Persist tokens to `localStorage` (`aw-access`, `aw-refresh`) via `tokenStorage` helper
  - Rehydrates on mount by calling `GET /api/v1/auth/me/` if access token exists
- [x] `login()` calls `POST /api/v1/auth/token/` → then `GET /api/v1/auth/me/` to populate user
- [x] Axios interceptor retries on 401 with `POST /api/v1/auth/token/refresh/`; queues concurrent requests during refresh

### 1.3 Login page ✅
- [x] Create `src/pages/Login.tsx` — username + password form using `react-hook-form` + `zod`
- [x] Add route `/login` in `App.tsx`
- [x] `<ProtectedRoute>` wrapper: redirects to `/login` with `state.from` if no valid token; shows spinner while loading
- [x] Wrap all dashboard routes (`/dashboard`, `/gis`, `/alerts`, `/nrw`, `/sensors`, `/reports`) in `<ProtectedRoute>`
- [x] Sidebar: replaced hardcoded "Demo User" with real user from `AuthContext` (display name, org name / role, initials avatar)
- [x] Sidebar: sign-out button calls `logout()` + navigates to `/login`

### 1.4 Type definitions ✅
- [x] Create `src/types/api.ts` — shared TypeScript interfaces matching all backend models:
  - `Organisation`, `AuthUser`, `UserRole`, `Project`
  - `WaterNetwork`, `NetworkUpload` (with `network: string | null` FK), `ValidationReport`, `UploadStatus`
  - `FileType` — `'shapefile' | 'epanet' | 'epanet_inp' | 'epanet_net'`
  - `NetworkStats`, `EnhancedNetworkStats`, `MaterialBreakdown`, `ZoneBreakdown` *(extended — added rich stats types)*
  - `NetworkNodeType` — `'junction' | 'reservoir' | 'tank' | 'meter'`; `nodes_breakdown` in `EnhancedNetworkStats`
  - `PipeProperties`, `NodeProperties`, `ZoneProperties`, `AssetProperties` + GeoJSON Feature/FeatureCollection wrappers
  - `Sensor`, `SensorReading`, `AnomalyEvent`, `LeakRiskScore`, `LeakRiskFeatureCollection` *(added — not in original plan)*
  - `AlertRule`, `AlertEvent`, `Notification`
  - `SimulationRun`, `HydraulicScenario`, `PressureResult`, `FlowResult` *(added — not in original plan)*
  - `WSSensorReading`, `WSAlertEvent`, `WSMessage` — discriminated union for WebSocket messages *(added — not in original plan)*
  - `PaginatedResponse<T>`, `GeoJSONGeometry`, `GeoJSONFeature<P>`, `GeoJSONFeatureCollection<P>`

---

## Phase 2 — Network Map from Backend API ✅
**Goal:** GISMap page loads pipes, nodes, zones, and stats from the live backend instead of `/public/data/`.

### 2.1 Network selection ✅
- [x] Create `src/context/NetworkContext.tsx`:
  - State: `networks[]`, `activeNetwork`, `isLoading`
  - On mount: fetch `GET /api/v1/networks/` via `useNetworks()` hook → populate list
  - Persist `activeNetworkId` to `localStorage` (`aw-active-network`); rehydrates and validates against fetched list on load
- [x] Add `NetworkSelector` dropdown in Topbar — shows globe icon + network name + chevron; dropdown lists all networks with pipe count and km
- [x] All map + dashboard pages read `activeNetwork` from context

### 2.2 React Query hooks ✅
- [x] Create `src/hooks/useNetworkQueries.ts`:
  - `useNetworks()` → `GET /api/v1/networks/`
  - `useNetworkDetail(networkId)` → `GET /api/v1/networks/{id}/`
  - `useNetworkStats(networkId)` → `GET /api/v1/networks/{id}/stats/`
  - `usePipes(networkId, bbox?)` → `GET /api/v1/networks/{id}/pipes/`
  - `useNodes(networkId, bbox?)` → `GET /api/v1/networks/{id}/nodes/`
  - `useZones(networkId)` → `GET /api/v1/networks/{id}/zones/`
  - `useAssets(networkId, bbox?)` → `GET /api/v1/networks/{id}/assets/`
  - `useUploadStatus(uploadId)` → polls `GET /api/v1/networks/{id}/validate/` every 3s until terminal status
  - `useNetworkUploads(networkId)` → `GET /api/v1/networks/{id}/uploads/` *(added in Phase 3)*
  - `useEpanetUpload(networkId)` → mutation `POST /api/v1/networks/{id}/epanet/` *(added in Phase 3)*
- [x] Keep static `/public/data/kisumu-*.geojson` as fallback for demo/offline mode

### 2.3 GISMap dynamic loading ✅ (partial)
- [x] GISMap loads pipes from `usePipes(activeNetwork.id)` when a network is selected
- [x] API pipe adapter: derives `ui_class` from diameter/status (≥200mm→main, ≥75mm→distribution, else→household, closed/out_of_service→backfeed); flattens `MultiLineString` → multiple `LineString` features
- [x] Builds synthetic `NetworkMeta` from `WaterNetwork` + adapted pipes (bbox from PostGIS polygon, center, pipe class counts)
- [x] Loading spinner shows network name + pipe count while API fetch is in flight
- [x] Error banner shown on API failure
- [x] Shell subtitle reflects active network name vs. demo label
- [x] Falls back to static Kisumu GeoJSON when no active network (demo mode fully preserved)
- [ ] Pass current map bounds as `?bbox=minx,miny,maxx,maxy` on map move (debounced 300ms) *(deferred)*
- [ ] Zone polygon overlay layer from `useZones()` *(deferred)*
- [ ] Node layer from `useNodes()` *(deferred)*

### 2.4 Dashboard KPIs from API ✅
- [x] Dashboard dual-mode: uses `useNetworkStats()` when `activeNetwork` set, static data otherwise
- [x] API KPI band: pipe network km, open pipe count, total nodes, health %, material types, zone count
- [x] Materials bar chart from `stats.materials_breakdown`
- [x] Age distribution chart from `stats.age_distribution`
- [x] Pipe status breakdown (open/closed/out_of_service) from `stats.status_breakdown`
- [x] Service zones table from `stats.zones_breakdown`
- [x] Loading skeleton shown while stats fetch is in flight
- [x] Data sources card: shapefile ✓ always; EPANET status from `useNetworkUploads`; inline "Attach EPANET →" file button *(added in Phase 3)*

---

## Phase 3 — Upload Pipeline ✅
**Goal:** DemoHub upload actually calls the backend, shows real validation results, and polls for completion.

### 3.1 Wire upload form ✅
- [x] DemoHub `UploadView`: real `POST /api/v1/networks/upload/` (multipart)
  - `.zip` (shapefile) required; `.inp` / `.net` (EPANET) optional alongside
  - Shows upload progress (Axios `onUploadProgress`)
  - Staged file list shows file type badge + EPANET label
  - Submit disabled until a `.zip` is staged
- [x] On success (202): receive `{ upload_id, status }` → enter polling state
- [x] Unauthenticated wall: shows sign-in prompt instead of upload form when not logged in

### 3.2 Status polling ✅
- [x] `useUploadStatus(uploadId)` polls every 3s until terminal status
- [x] Animated progress steps: Uploading → Ingesting shapefile → (Attaching EPANET) → Ready
- [x] On `complete` / `complete_warnings`: show `ValidationReport` inline
  - Pipe count, node count, warnings accordion
- [x] On `failed`: show error from `validation_report.error`
- [x] On success: refetch `networks` query → new network visible in `NetworkSelector` immediately

### 3.3 Validation report UI ✅ (inline in DemoHub)
- [x] Summary row: pipes ingested, nodes ingested, warnings count
- [x] Warnings `<details>` accordion (expandable list)
- [x] "Open in map →" button + "Upload another" button
- [ ] Separate `src/components/ValidationReport.tsx` component *(deferred — inline implementation sufficient)*

### 3.4 EPANET upload support ✅ *(added — not in original plan)*
- [x] DemoHub drop zone accepts `.zip` + optional `.inp` / `.net` in one session
- [x] After shapefile ingestion completes, EPANET file is auto-POSTed to `POST /api/v1/networks/{id}/epanet/`
  — the `network_id` is read from the validated upload response
- [x] Extra "Attaching EPANET" progress step shown when EPANET file is staged
- [x] EPANET upload failure is non-fatal (shapefile network still usable)
- [x] Dashboard "Data sources" card: shapefile ✓; EPANET status (attached / processing / missing); inline attach button for existing networks
- [x] `useEpanetUpload(networkId)` mutation — `POST /api/v1/networks/{id}/epanet/`
- [x] `useNetworkUploads(networkId)` query — `GET /api/v1/networks/{id}/uploads/`

---

## Phase 4 — Sensors: Live Data + WebSocket ⬜
**Goal:** Sensors page and map asset panels show real readings; map updates in real-time via WebSocket.

### 4.1 Sensor list from network nodes ✅ (partial — nodes only, no sensor readings)
- [x] Sensors page: two-mode — uses `useNodes()` + `useNetworkStats()` from API when active network set; static demo data otherwise
- [x] `adaptNodes()` maps API nodes → `AssetFeature | JunctionNode` for display
  - `reservoir`/`tank` → "Reservoir · level sensor" row
  - `meter` → "Meter / bulk valve" row
  - `junction` → "Network junction" topology row (5th filter category)
- [x] KPI tiles use `apiStats.nodes_breakdown` for accurate counts per node type
- [x] Table capped at 500 rows with overflow notice
- [x] Filter tabs: All · Reservoir · Pressure valve · Meter/bulk valve · Flow sensor · Network junction
- [x] "View on map" navigation per row
- [ ] Real sensor readings replacing zero/mock values *(deferred — needs Phase 4 sensor registry)*
- [ ] Sensor detail panel with 24h sparkline *(deferred)*

### 4.2 WebSocket hook ⬜
- [ ] Create `src/hooks/useNetworkSocket.ts`:
  ```typescript
  // Connects to: ws://<host>/ws/sensors/<networkId>/?token=<jwt>
  // Emits: { type: 'reading', sensor_id, value, unit, timestamp }
  ```
  - Reconnects automatically on disconnect (exponential backoff)
  - Passes JWT as query param (Django Channels auth)
- [ ] On incoming reading: update the relevant sensor in React Query cache (`queryClient.setQueryData`)

### 4.3 Live map updates ⬜
- [ ] Asset icons on GISMap: update level/pressure indicators from WebSocket stream
- [ ] Tank level gauge redraws on new `level_pct` reading
- [ ] Pressure valve icon colour changes on threshold breach (green / amber / red)
- [ ] "Last updated" timestamp shown on asset tooltip

### 4.4 MQTT mock for development ⬜
- [ ] Add `scripts/mock_mqtt.py` — publishes random readings to `aquawise/{org_id}/sensors/{sensor_id}/reading` every 5s

---

## Phase 4 — NRW & Reports from API ✅ *(completed ahead of schedule)*

### NRW page ✅
- [x] `NRW.tsx` dual-mode: uses `deriveNRWFromStats(stats, networkName)` when API data available; static demo data otherwise
- [x] `EnhancedNetworkStats.total_length_km: number | null` handled correctly
- [x] Zone breakdown, material loss rates, age-weighted NRW estimate all from real API data

### Reports page ✅
- [x] `Reports.tsx` full rewrite: dual-mode with `deriveFromStats(stats, networkName)` for API; `deriveFromStatic(d)` for demo
- [x] `ops-network-bar` shows active network name
- [x] All chart data (materials, age, zones) sourced from `EnhancedNetworkStats`
- [x] Graceful empty states for missing breakdown data
- [x] `reports-empty-note` CSS class added

---

## Phase 5 — Alerts: Real Alert Feed ⬜
**Goal:** Alerts page and sidebar badge reflect real `AlertEvent` records from the backend.

### 5.1 Alert feed ⬜
- [ ] Alerts page: replace auto-generated alerts with `GET /api/v1/alerts/events/`
  - Filter params: `severity`, `resolved`, `zone_id`, `network_id`
  - Paginated (DRF `PageNumberPagination`)
- [ ] Sidebar badge count: `GET /api/v1/alerts/events/?resolved=false&page_size=1` → use `count`
- [ ] Alert row: open detail panel with full `AlertEvent` + linked `AlertRule`

### 5.2 Alert rules CRUD ⬜
- [ ] New page / modal: `AlertRule` management
  - `GET/POST /api/v1/alerts/rules/` — list + create
  - `PUT/DELETE /api/v1/alerts/rules/{id}/` — edit + delete
  - Fields: metric, operator, threshold, zone filter, notification channels (SMS/email/push)
- [ ] Inline rule creation from map: right-click sensor → "Create alert rule for this sensor"

### 5.3 Real-time alert push ⬜
- [ ] Add alert channel to existing WebSocket connection: `{ type: 'alert', event: AlertEvent }`
- [ ] Toast notification on new critical alert
- [ ] Sidebar badge increments without page refresh

---

## Phase 6 — Analytics: NRW + Leak Risk + Anomaly Detection ⬜
**Goal:** Replace age-weighted NRW estimates with real ML scores from the backend.

### 6.1 Leak risk layer ⬜
- [ ] GISMap: add toggle layer "Leak Risk" — calls `GET /api/v1/analytics/leak-risk/` (GeoJSON)
  - Pipes coloured by risk score (green → yellow → red)
  - Tooltip shows score, contributing factors (material age, pressure variance)

### 6.2 Anomaly events ⬜
- [ ] Dashboard: "Anomalies" card — `GET /api/v1/analytics/anomalies/?resolved=false&limit=5`
- [ ] Alerts page: add anomaly events tab (alongside rule-based alerts)
- [ ] Map: anomaly events shown as pulsing markers at the affected sensor location

### 6.3 NRW page — real ML scores ⬜
- [ ] Replace age-weighted NRW estimate with real leak risk scores per zone:
  - `GET /api/v1/networks/{id}/stats/` (zone breakdown)
  - Leak risk scores per zone from ML model
- [ ] Demand-adjusted NRW (billed vs. input)

### 6.4 Demand forecast ⬜
- [ ] New chart on Dashboard: `GET /api/v1/analytics/demand-forecast/?zone=X&horizon=7d`
  - 7-day demand forecast line chart per zone

---

## Cross-Cutting Improvements

### Error handling & UX ⬜
- [ ] Global error boundary (`src/components/ErrorBoundary.tsx`)
- [ ] React Query global error handler → toast notifications (`sonner` or `react-hot-toast`)
- [ ] Empty state components for all data tables / map layers
- [ ] Skeleton loaders for cards + map layer while data loads

### Map performance ⬜
- [ ] Bbox-based tile loading: fetch only pipes visible in viewport, re-fetch on significant pan/zoom (debounced 300ms)
- [ ] For networks > 2,000 pipes: switch from per-feature `L.polyline` to `L.geoJSON` layer
- [ ] Consider `leaflet.vectorgrid` for very large networks (Phase 2+)

### TypeScript & code quality ⬜
- [ ] Add `eslint` + `@typescript-eslint` + `prettier` (align with backend's `ruff`)
- [ ] Remove `/src/data/data.ts` (legacy mock data file) once Phase 3 is complete
- [ ] Remove `/public/data/*.geojson` once Phase 3 is complete (or move to a fixtures folder)

---

## Milestone Summary

| Milestone | Status | Deliverable |
|-----------|--------|-------------|
| F-M1 | ✅ Done | Login works; JWT stored; all routes protected; API client configured |
| F-M2 | ✅ Done | GISMap loads pipes from backend API; Dashboard KPIs live from stats endpoint |
| F-M3 | ✅ Done | Shapefile upload → real validation + polling → network on map; EPANET optional attach; Data sources card |
| F-M4 | 🔧 Partial | Sensors/NRW/Reports wired to real API nodes & stats; live WebSocket readings still pending |
| F-M5 | ⬜ Not started | Alerts feed from backend; rule CRUD; real-time alert toast |
| F-M6 | ⬜ Not started | Leak risk layer on map; anomaly events on dashboard; real NRW per zone |

---

## Backend Endpoints Consumed Per Phase

| Phase | Endpoints |
|-------|-----------|
| 1 ✅ | `POST /api/v1/auth/token/`, `POST /api/v1/auth/token/refresh/`, `GET /api/v1/auth/me/` |
| 2 ✅ | `GET /api/v1/networks/`, `GET /api/v1/networks/{id}/`, `/pipes/`, `/nodes/`, `/zones/`, `/assets/`, `/stats/` |
| 3 ✅ | `POST /api/v1/networks/upload/`, `GET /api/v1/networks/{upload_id}/validate/`, `POST /api/v1/networks/{id}/epanet/`, `GET /api/v1/networks/{id}/uploads/` |
| 4 | `GET /api/v1/sensors/`, `GET /api/v1/sensors/{id}/readings/`, `WS /ws/sensors/{network_id}/` |
| 5 | `GET /api/v1/alerts/events/`, `GET/POST/PUT/DELETE /api/v1/alerts/rules/` |
| 6 | `GET /api/v1/analytics/anomalies/`, `GET /api/v1/analytics/leak-risk/`, `GET /api/v1/analytics/demand-forecast/` |

---

## Notes

- **Static GeoJSON files** (`/public/data/kisumu-*.geojson`) remain usable as demo/offline fallback — do not delete until Phase 4+ is complete.
- **Backend Phase alignment:** Frontend Phases 1–3 align with Backend Phase 1 (Foundation). Frontend Phase 4 aligns with Backend Phase 4 (Real-Time). Frontend Phase 6 aligns with Backend Phase 5 (ML).
- **EPANET .net files:** The binary `.net` format has no geographic coordinates (canvas pixels only). Only `.inp` text files with a `[COORDINATES]` section can provide real node positions. Users should export `.inp` from EPANET/WaterGEMS for meaningful node data.
- **Deferred from Phase 2:** bbox viewport-based pipe loading and zone polygon overlays — deferred to avoid complexity; `staleTime: Infinity` on pipe queries means no excess requests for now.
