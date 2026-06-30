# 🚥 Smart Traffic Management System (STMS)

### Human-as-a-Sensor IoT Integration

The Smart Traffic Management System (STMS) is a real-time operational platform that bridges field personnel and central command. Using the "Human-as-a-Sensor" concept, every field organizer's smartphone becomes an IoT node, streaming live traffic intelligence to a central dashboard — no fixed cameras or sensors required.

## 🌟 Project Vision

Traditional traffic systems rely on costly cameras and sensors. This system leverages the agility of human organizers: each one reports location, road status, and incidents directly to a centralized dashboard, letting managers make data-driven decisions in seconds.

## 🛠 Key Features

### 👤 Organizer Interface (The IoT Node)
- **Real-Time Geolocation** — continuous high-accuracy GPS tracking streamed to the command center over WebSockets.
- **One-Tap Reporting** — instant road status reports: 🟢 Fluid, 🟡 Congested, 🔴 Blocked.
- **Presence Management** — toggle between Active, On Break, or Emergency.
- **Bi-Directional Communication** — receive instructions dispatched live from the command center.

### 📊 Manager Dashboard (The Command Center)
- **Geospatial Live Map** — bird's-eye view of every online organizer and managed traffic zone.
- **Color-Coded Areas** — road/zone polylines change color (open / flow-control / closed) based on manager actions.
- **Instant Alert System** — audio-visual notification the moment an organizer reports an accident or declares an emergency.
- **Task Dispatching** — select an organizer and push a direct instruction to their device.

## 🏗 System Architecture

Real-time data loop:

1. **Sensing** — the Organizer app collects GPS coordinates and manual status input.
2. **Transmission** — data is sent over a Socket.io WebSocket connection for near-zero latency.
3. **Processing** — the backend validates state, caches the latest organizer snapshot in Redis, and broadcasts it to every connected dashboard.
4. **Logging** — status reports and dispatched commands are persisted to MongoDB for history/auditing.
5. **Action** — the manager analyzes the map and dispatches commands back down to specific organizers.

## 💻 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite |
| Mapping | Leaflet / React-Leaflet |
| Real-Time Engine | Socket.io |
| Backend | Node.js & Express |
| Live Location Cache | Redis |
| Persistent Logs (areas, reports, commands) | MongoDB / Mongoose |

## 📁 Project Layout

```
TMS/
├── src/             # React frontend (Organizer app + Manager dashboard)
├── server/          # Express + Socket.io backend
│   └── src/
│       ├── config/    # Mongo & Redis connections
│       ├── models/    # Mongoose schemas (Area, ReportLog, CommandLog)
│       ├── routes/    # REST API (area CRUD)
│       └── sockets/   # Real-time event handlers
└── docker-compose.yml # Local MongoDB + Redis
```

## 🚀 Installation & Setup

### 1. Start MongoDB & Redis

```bash
docker compose up -d
```

(Or point `MONGODB_URI` / `REDIS_URL` at your own instances.)

### 2. Backend

```bash
cd server
npm install
cp .env.example .env   # adjust PORT / CLIENT_ORIGIN / MONGODB_URI / REDIS_URL
npm run dev
```

The backend listens on `http://localhost:5000` by default and exposes:
- `GET /health` — health check
- `REST /api/areas` — area CRUD (create/list/update status/delete)
- A Socket.io endpoint for organizer location/status/presence and manager-to-organizer command dispatch.

> If Redis is unreachable the server falls back to an in-memory organizer cache (dev convenience). If MongoDB is unreachable, area persistence and history logging are disabled but live tracking keeps working.

### 3. Frontend

```bash
npm install
cp .env.example .env   # set VITE_SOCKET_URL / VITE_API_URL if not running on localhost:5000
npm run dev
```

Open the printed Vite URL on your laptop (Command Center) and on your phone (Field Organizer) — both connect to the same backend and sync in real time.

## 🗺 Roadmap

- [ ] AI Integration: predictive congestion forecasting from historical field data.
- [ ] Native Mobile App: Flutter/React Native client for better battery use and background GPS.
- [ ] Hardware Extension: LoRaWAN sensor integration for areas without cellular coverage.
