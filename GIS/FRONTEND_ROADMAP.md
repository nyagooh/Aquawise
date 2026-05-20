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
| Auth | None — hardcoded "Demo User" | JWT (`/api/v1/auth/token/`) | Login page + token management |
| Network data | Static GeoJSON from `/public/data/` | `GET /api/v1/networks/{id}/pipes/` etc. | Replace static files with API calls |
| Upload | UI exists, no actual POST | `POST /api/v1/networks/upload/` + Celery | Wire upload form to real endpoint |
| Sensors | Synthesized mock telemetry | `Sensor`, `SensorReading` models + WebSocket | Real sensor API + live WebSocket |
| Alerts | Auto-generated from static data | `AlertRule`, `AlertEvent` models | Real alert feed from API |
| Analytics / NRW | Age-weighted NRW estimate (hardcoded) | `LeakRiskScore`, `AnomalyEvent` models | Replace with real ML scores |
| Multi-tenancy | None | `Organisation` + `Project` per user | Org/project context in UI |
| API client | None — plain fetch to `/public/data/` | DRF at `/api/v1/` | Axios + React Query |
| Environment | No `.env`, no backend URL | DRF at `http://localhost:8000` | `.env` + proxy config |
| WebSocket | None | Django Channels at `ws/sensors/{network_id}/` | WebSocket hook |

---

## Phase Overview

```
Phase 1 ──► Phase 2 ──► Phase 3 ──► Phase 4 ──► Phase 5 ──► Phase 6
API Client   Network      Upload      Sensors     Alerts      Analytics
& Auth       Map from     Pipeline    Live Data   & Rules     & NRW
             Backend
```

---

## Phase 1 — API Client, Auth & Environment ⬜
**Goal:** Every page can talk to the backend. Users log in with real credentials.

### 1.1 Project setup ⬜
- [ ] Add dependencies: `axios`, `@tanstack/react-query`, `react-hook-form`, `zod`
- [ ] Create `.env` / `.env.example`:
  ```
  VITE_API_BASE_URL=http://localhost:8000/api/v1
  VITE_WS_BASE_URL=ws://localhost:8000
  ```
- [ ] Add Vite proxy in `vite.config.ts` so `/api` → `http://localhost:8000` (avoids CORS in dev)
- [ ] Create `src/lib/api.ts` — Axios instance with:
  - `baseURL` from `VITE_API_BASE_URL`
  - Request interceptor: attach `Authorization: Bearer <token>` from localStorage
  - Response interceptor: 401 → redirect to `/login`, 403 → toast error
- [ ] Wrap `main.tsx` with `<QueryClientProvider>`

### 1.2 Auth context ⬜
- [ ] Create `src/context/AuthContext.tsx`:
  - State: `user` (id, email, role, organisation), `accessToken`, `refreshToken`
  - Actions: `login()`, `logout()`, `refreshAccess()`
  - Persist tokens to `localStorage` (`aw-access`, `aw-refresh`)
- [ ] `login()` calls `POST /api/v1/auth/token/` (SimpleJWT) with `{username, password}`
- [ ] `refreshAccess()` calls `POST /api/v1/auth/token/refresh/`
- [ ] Axios interceptor retries on 401 using refresh token before redirect

### 1.3 Login page ⬜
- [ ] Create `src/pages/Login.tsx` — email + password form using `react-hook-form` + `zod`
- [ ] Add route `/login` in `App.tsx`
- [ ] `<ProtectedRoute>` wrapper: redirects to `/login` if no valid token
- [ ] Wrap all dashboard routes (`/dashboard`, `/gis`, `/alerts`, etc.) in `<ProtectedRoute>`
- [ ] Sidebar: replace hardcoded "Demo User" with user from `AuthContext` (name, role badge)
- [ ] Topbar: add logout button

### 1.4 Type definitions ⬜
- [ ] Create `src/types/api.ts` — shared TypeScript interfaces matching backend models:
  - `Organisation`, `Project`, `WaterNetwork`
  - `Pipe`, `Node`, `Zone`, `Asset` (GeoJSON Feature wrappers)
  - `Sensor`, `SensorReading`, `AlertRule`, `AlertEvent`
  - `NetworkUpload`, `ValidationReport`
  - `PaginatedResponse<T>`, `GeoJSONFeatureCollection<T>`

---

## Phase 2 — Network Map from Backend API ⬜
**Goal:** GISMap page loads pipes, nodes, zones, and stats from the live backend instead of `/public/data/`.

### 2.1 Network selection ⬜
- [ ] Create `src/context/NetworkContext.tsx`:
  - State: `networks[]`, `activeNetwork` (the selected `WaterNetwork`)
  - On login: fetch `GET /api/v1/networks/` → populate list
  - Persist `activeNetworkId` to `localStorage`
- [ ] Add a network selector dropdown in Topbar (or dedicated `/networks` page)
- [ ] All map + dashboard pages read `activeNetwork` from context

### 2.2 Replace static data loader ⬜
- [ ] Replace `src/data/network.ts` `loadNetwork()` with React Query hooks:
  - `useNetworkStats(networkId)` → `GET /api/v1/networks/{id}/stats/`
  - `useNetworkDetail(networkId)` → `GET /api/v1/networks/{id}/`
  - `usePipes(networkId, bbox?, zoneId?)` → `GET /api/v1/networks/{id}/pipes/`
  - `useNodes(networkId, bbox?, zoneId?)` → `GET /api/v1/networks/{id}/nodes/`
  - `useZones(networkId)` → `GET /api/v1/networks/{id}/zones/`
  - `useAssets(networkId, bbox?)` → `GET /api/v1/networks/{id}/assets/`
- [ ] Keep static `/public/data/kisumu-*.geojson` as a fallback for demo/offline mode only

### 2.3 GISMap dynamic loading ⬜
- [ ] GISMap passes current map bounds as `?bbox=minx,miny,maxx,maxy` on every move
- [ ] Debounce bbox updates (300ms) to avoid excessive requests
- [ ] Loading spinner while fetching; error banner on failure
- [ ] Zones rendered as polygon overlays using `GET /api/v1/networks/{id}/zones/`
- [ ] SidePanel pipe/asset detail reads from feature `properties` (same structure as API response)

### 2.4 Dashboard KPIs from API ⬜
- [ ] Dashboard KPI band: replace hardcoded values with data from `useNetworkStats()`
  - Total pipes, total length km, health score (open / total), materials breakdown
- [ ] Zones table: replace mock rows with zones from `useZones()`
- [ ] Materials donut / bar: derive from `stats.materials_breakdown` (to be added to stats endpoint)

---

## Phase 3 — Upload Pipeline ⬜
**Goal:** DemoHub upload actually calls the backend, shows real validation results, and polls for completion.

### 3.1 Wire upload form ⬜
- [ ] DemoHub `UploadView`: replace no-op with real `POST /api/v1/networks/upload/` (multipart)
  - Only `.zip` (shapefile) accepted at this stage; `.inp` shows "coming soon"
  - Show upload progress (Axios `onUploadProgress`)
- [ ] On success (202): receive `{ upload_id, status }` → enter polling state

### 3.2 Status polling ⬜
- [ ] Poll `GET /api/v1/networks/{upload_id}/validate/` every 3 seconds until status ∈ `{complete, complete_warnings, failed}`
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
  - Passes JWT as query param (Django Channels auth: `?token=<access_token>`)
- [ ] On incoming reading: update the relevant sensor in React Query cache (`queryClient.setQueryData`)

### 4.3 Live map updates ⬜
- [ ] Asset icons on GISMap: update level/pressure indicators from WebSocket stream
- [ ] Tank level gauge redraws on new `level_pct` reading
- [ ] Pressure valve icon colour changes on threshold breach (green / amber / red)
- [ ] "Last updated" timestamp shown on asset tooltip

### 4.4 MQTT mock for development ⬜
- [ ] Add `scripts/mock_mqtt.py` (or document the existing backend mock publisher)
  - Publishes random readings to `aquawise/{org_id}/sensors/{sensor_id}/reading` every 5 s
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
- [ ] For networks > 2,000 pipes: switch from L.polyline per feature to a single GeoJSON layer (`L.geoJSON`) using the backend's `iterator` streaming
- [ ] Implement bbox-based tile loading: only fetch pipes visible in current viewport, re-fetch on significant pan/zoom
- [ ] Consider `leaflet.vectorgrid` for very large networks (Phase 2+)

### TypeScript & code quality ⬜
- [ ] Enable `"strict": true` throughout (already on in tsconfig — enforce for new files)
- [ ] Add `eslint` + `@typescript-eslint` + `prettier` (align with backend's `ruff`)
- [ ] Remove `/src/data/data.ts` (legacy mock data file) once Phase 2 is complete
- [ ] Remove `/public/data/*.geojson` once Phase 3 is complete (or move to a fixtures folder)

---

## Milestone Summary

| Milestone | Phase | Deliverable |
|-----------|-------|-------------|
| F-M1 | Phase 1 | Login works; JWT stored; all routes protected; API client configured |
| F-M2 | Phase 2 | GISMap loads pipes/nodes/zones from backend API; Dashboard KPIs are live |
| F-M3 | Phase 3 | Shapefile upload → real validation report → network appears on map |
| F-M4 | Phase 4 | Sensor readings are real; map updates live via WebSocket |
| F-M5 | Phase 5 | Alerts feed from backend; rule CRUD; real-time alert toast |
| F-M6 | Phase 6 | Leak risk layer on map; anomaly events on dashboard; real NRW per zone |

---

## Backend Endpoints Consumed Per Phase

| Phase | Endpoints |
|-------|-----------|
| 1 | `POST /api/v1/auth/token/`, `POST /api/v1/auth/token/refresh/` |
| 2 | `GET /api/v1/networks/`, `GET /api/v1/networks/{id}/`, `GET /api/v1/networks/{id}/pipes/`, `/nodes/`, `/zones/`, `/assets/`, `/stats/` |
| 3 | `POST /api/v1/networks/upload/`, `GET /api/v1/networks/{upload_id}/validate/` |
| 4 | `GET /api/v1/sensors/`, `GET /api/v1/sensors/{id}/readings/`, `WS /ws/sensors/{network_id}/` |
| 5 | `GET /api/v1/alerts/events/`, `GET/POST/PUT/DELETE /api/v1/alerts/rules/` |
| 6 | `GET /api/v1/analytics/anomalies/`, `GET /api/v1/analytics/leak-risk/`, `GET /api/v1/analytics/demand-forecast/` |

---

## Notes

- **Static GeoJSON files** (`/public/data/kisumu-*.geojson`) remain usable as demo/offline fallback until Phase 3 is done — don't delete them early.
- **Backend Phase alignment:** Frontend Phases 1–3 align with Backend Phase 1 (Foundation). Frontend Phase 4 aligns with Backend Phase 4 (Real-Time). Frontend Phase 6 aligns with Backend Phase 5 (ML).
- **EPANET ingestion** (Backend Phase 1.3) will extend Phase 3 of this roadmap once the backend task is implemented.
