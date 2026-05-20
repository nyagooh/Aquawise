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
| Upload | UI exists, no actual POST | `POST /api/v1/networks/upload/` + Celery | Wire upload form to real endpoint |
| Sensors | Synthesized mock telemetry | `Sensor`, `SensorReading` models + WebSocket | Real sensor API + live WebSocket |
| Alerts | Auto-generated from static data | `AlertRule`, `AlertEvent` models | Real alert feed from API |
| Analytics / NRW | Age-weighted NRW estimate (hardcoded) | `LeakRiskScore`, `AnomalyEvent` models | Replace with real ML scores |
| Multi-tenancy | ✅ Org name shown in sidebar via AuthContext | `Organisation` + `Project` per user | Project switcher |
| API client | ✅ Axios + React Query + JWT interceptor | DRF at `/api/v1/` | — done |
| Environment | ✅ `.env` + proxy config | DRF at `http://localhost:8000` | — done |
| WebSocket | None | Django Channels at `ws/sensors/{network_id}/` | WebSocket hook |

---

## Phase Overview

```
Phase 1 ──► Phase 2 ──► Phase 3 ──► Phase 4 ──► Phase 5 ──► Phase 6
API Client   Network      Upload      Sensors     Alerts      Analytics
& Auth  ✅   Map from ✅  Pipeline    Live Data   & Rules     & NRW
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
  - `WaterNetwork`, `NetworkUpload`, `ValidationReport`, `UploadStatus`
  - `NetworkStats`, `EnhancedNetworkStats`, `MaterialBreakdown`, `ZoneBreakdown` *(extended — added rich stats types)*
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
  - `useUploadStatus(uploadId)` → polls `GET /api/v1/networks/{id}/validate/` every 3s until terminal status *(added ahead of Phase 3)*
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

---

## Phase 3 — Upload Pipeline ⬜
**Goal:** DemoHub upload actually calls the backend, shows real validation results, and polls for completion.

### 3.1 Wire upload form ⬜
- [ ] DemoHub `UploadView`: replace no-op with real `POST /api/v1/networks/upload/` (multipart)
  - Only `.zip` (shapefile) accepted at this stage; `.inp` shows "coming soon"
  - Show upload progress (Axios `onUploadProgress`)
- [ ] On success (202): receive `{ upload_id, status }` → enter polling state

### 3.2 Status polling ⬜
- [ ] Use `useUploadStatus(uploadId)` hook (already built in Phase 2) to poll every 3s
- [ ] Show animated progress steps: Uploading → Processing → Validating → Done
- [ ] On `complete` / `complete_warnings`: show `ValidationReport` card
  - Pipe count, node count, warnings list, roughness gaps
- [ ] On `failed`: show error from `validation_report.error`
- [ ] On success: add new network to `NetworkContext`, prompt user to switch to it

### 3.3 Validation report UI ⬜
- [ ] `src/components/ValidationReport.tsx` — renders `validation_report` JSON:
  - Summary row: pipes ingested, nodes ingested, zones, total length
  - Warnings accordion (expandable list)
  - "Open in Map" button → switches active network + navigates to `/gis`

---

## Phase 4 — Sensors: Live Data + WebSocket ⬜
**Goal:** Sensors page and map asset panels show real readings; map updates in real-time via WebSocket.

### 4.1 Sensor list & readings ⬜
- [ ] Sensors page: replace mock telemetry table with `GET /api/v1/sensors/`
  - Filter by `network_id`, `sensor_type`, `status`
- [ ] Sensor detail panel: `GET /api/v1/sensors/{id}/readings/?start=&end=&resample=1h`
  - Sparkline chart updated with real 24h data

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
  - Used in dev to test the full WebSocket pipeline without real hardware

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

### 6.3 NRW page ⬜
- [ ] NRW page: derive real NRW per zone from:
  - `GET /api/v1/networks/{id}/stats/` (zone breakdown)
  - Leak risk scores per zone
  - Replace hardcoded `age_distribution` NRW formula

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
| F-M3 | ⬜ Not started | Shapefile upload → real validation report → network appears on map |
| F-M4 | ⬜ Not started | Sensor readings are real; map updates live via WebSocket |
| F-M5 | ⬜ Not started | Alerts feed from backend; rule CRUD; real-time alert toast |
| F-M6 | ⬜ Not started | Leak risk layer on map; anomaly events on dashboard; real NRW per zone |

---

## Backend Endpoints Consumed Per Phase

| Phase | Endpoints |
|-------|-----------|
| 1 ✅ | `POST /api/v1/auth/token/`, `POST /api/v1/auth/token/refresh/`, `GET /api/v1/auth/me/` |
| 2 ✅ | `GET /api/v1/networks/`, `GET /api/v1/networks/{id}/`, `GET /api/v1/networks/{id}/pipes/`, `/nodes/`, `/zones/`, `/assets/`, `/stats/` |
| 3 | `POST /api/v1/networks/upload/`, `GET /api/v1/networks/{upload_id}/validate/` |
| 4 | `GET /api/v1/sensors/`, `GET /api/v1/sensors/{id}/readings/`, `WS /ws/sensors/{network_id}/` |
| 5 | `GET /api/v1/alerts/events/`, `GET/POST/PUT/DELETE /api/v1/alerts/rules/` |
| 6 | `GET /api/v1/analytics/anomalies/`, `GET /api/v1/analytics/leak-risk/`, `GET /api/v1/analytics/demand-forecast/` |

---

## Notes

- **Static GeoJSON files** (`/public/data/kisumu-*.geojson`) remain usable as demo/offline fallback until Phase 3 is done — don't delete them early.
- **Backend Phase alignment:** Frontend Phases 1–3 align with Backend Phase 1 (Foundation). Frontend Phase 4 aligns with Backend Phase 4 (Real-Time). Frontend Phase 6 aligns with Backend Phase 5 (ML).
- **EPANET ingestion** (Backend Phase 1.3) will extend Phase 3 of this roadmap once the backend task is implemented.
- **Deferred from Phase 2:** bbox viewport-based pipe loading and zone polygon overlays — deferred to avoid complexity; `staleTime: Infinity` on pipe queries means no excess requests for now.
