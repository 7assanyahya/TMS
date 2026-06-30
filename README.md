# 🚥 Smart Traffic Management System (STMS)

### Human-as-a-Sensor IoT Integration

STMS is a real-time operational platform that bridges field personnel and central command.
Using the "Human-as-a-Sensor" concept, every field organizer's smartphone becomes an IoT node,
streaming live traffic intelligence to a central command center — no fixed cameras or sensors required.

## 🌟 Vision

Traditional traffic systems rely on costly cameras and sensors. STMS leverages the agility of
human organizers: each one reports location, road status, and incidents directly to a centralized
dashboard, letting managers make data-driven decisions in seconds.

## 🛠 Features

### 👤 Field Organizer (the IoT node)
- **Real-time geolocation** — continuous high-accuracy GPS, streamed live to the command center.
- **One-tap reporting** — 🟢 Fluid · 🟡 Congested · 🔴 Blocked.
- **Presence management** — Active / On Break / Emergency toggle.
- **Incoming commands** — receive movement orders dispatched from the command center in real time.

### 📊 Command Center (the manager dashboard)
- **Live geospatial map** — every online unit and managed zone at a glance.
- **Color-coded zones** — roads/zones change color (open / flow-control / closed) on manager action.
- **Critical-incident alerts** — audio-visual notification the instant a unit reports an accident
  or declares an emergency.
- **Task dispatch** — select a unit and push a direct instruction to their device.

## 💻 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite 7 |
| Styling | Tailwind CSS v4 (command-center / control-room design system) |
| Mapping | Leaflet / React-Leaflet |
| Realtime backend | Firebase Realtime Database |
| Icons | lucide-react |

The entire app is a client-side SPA backed by **Firebase Realtime Database** — every organizer
and the command center subscribe to the same live data, so updates propagate across devices
instantly with no custom server to run.

## 🗂 Data Model (Firebase Realtime DB)

```
organizers/{id} : { id, name, lat, lng,
                    status: clear|congestion|accident,
                    presence: active|break|emergency,
                    online: bool }            // online via onDisconnect
areas/{id}      : { id, name,
                    type: road|walkway|parking|event_space,
                    status: open|flow-control|closed,
                    path: [[lat,lng], …] }
commands/{id}   : { message, timestamp }      // manager → organizer dispatch
```

## 📁 Project Layout

```
src/
├── App.jsx                  # role/view state machine + session persistence
├── index.css                # Tailwind v4 import + @theme design tokens + Leaflet/marker globals
├── lib/firebase.js          # Firebase app + Realtime DB handle
├── hooks/useTrafficData.js  # live subscriptions + mutations (organizers, areas, commands)
└── components/
    ├── Landing.jsx           # role selection console
    ├── OrganizerLogin.jsx    # unit registration
    ├── OrganizerApp.jsx      # field node: GPS, reporting, presence, incoming commands
    ├── ManagerDashboard.jsx  # command center: map, stats, zone control, dispatch, alerts
    ├── AddAreaForm.jsx       # draw-on-map zone editor
    └── MapDrawHandler.jsx    # leaflet click-to-draw helper
```

## 🚀 Getting Started

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # production build
npm run lint     # eslint
```

The Firebase project config ships in `src/lib/firebase.js` (Realtime Database `tmsp-c9e4d`).
To point at your own project, replace that config with your Firebase console values and ensure
Realtime Database rules permit the reads/writes you need.

Open the app on a phone as **Field Organizer** and on a laptop as **Command Center** — the map
updates in real time as the organizer moves and reports.

## 🗺 Roadmap

- [ ] AI: predictive congestion forecasting from historical field data.
- [ ] Native mobile app (Flutter / React Native) for background GPS + battery optimization.
- [ ] LoRaWAN hardware sensors for areas without cellular coverage.
