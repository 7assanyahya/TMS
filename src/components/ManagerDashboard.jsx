import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { ArrowLeft, Activity, Grid, AlertTriangle } from 'lucide-react';
import { useTrafficData } from '../hooks/useTrafficData';
import './ManagerDashboard.css';

// Fix leaflet default icon issue if we were using it (we are using custom divIcons though)
// but good practice to keep in mind.



function MapController({ organizers }) {
    const map = useMap();

    React.useEffect(() => {
        const activeOrgs = organizers.filter(o => o.active);
        if (activeOrgs.length === 0) return;

        const bounds = L.latLngBounds(activeOrgs.map(o => [o.lat, o.lng]));
        if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15, animate: true });
        }
    }, [organizers, map]);

    return null;
}

export default function ManagerDashboard({ onBack }) {
    const { organizers } = useTrafficData();

    // Summary Stats
    const stats = useMemo(() => {
        return {
            total: organizers.length,
            active: organizers.filter(o => o.active).length,
            congestion: organizers.filter(o => o.status === 'congestion').length,
            accident: organizers.filter(o => o.status === 'accident').length,
        };
    }, [organizers]);

    return (
        <div className="manager-container">
            {/* Sidebar */}
            <div className="dashboard-sidebar">
                <div className="sidebar-header">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white">Command Center</h2>
                        <div className="live-indicator">
                            <span className="live-dot"></span> Live
                        </div>
                    </div>
                    <p className="text-slate-400 text-sm mt-1">Riyadh Sector A</p>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-value text-blue-400">{stats.active}/{stats.total}</div>
                        <div className="stat-label">Units Active</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-value text-red-500">{stats.accident}</div>
                        <div className="stat-label">Accidents</div>
                    </div>
                </div>

                <div className="p-4 pb-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Field Reports
                </div>

                <div className="alerts-list">
                    {organizers.map(org => (
                        <div
                            key={org.id}
                            className={`alert-item alert-${org.status}`}
                        >
                            <div className={`w-2 h-2 rounded-full mt-2
                ${org.status === 'clear' ? 'bg-green-500' :
                                    org.status === 'congestion' ? 'bg-orange-500' : 'bg-red-500'
                                }`}
                            />
                            <div>
                                <div className="text-sm font-bold text-white flex items-center gap-2">
                                    {org.name}
                                    {!org.active && <span className="text-xs text-slate-500">(Off Duty)</span>}
                                </div>
                                <div className="text-xs text-slate-400 capitalize">
                                    Status: <span className={
                                        org.status === 'accident' ? 'text-red-400 font-bold' :
                                            org.status === 'congestion' ? 'text-orange-400' : 'text-slate-400'
                                    }>{org.status}</span>
                                </div>
                                <div className="text-xs text-slate-600 font-mono mt-1">
                                    {org.lat.toFixed(4)}, {org.lng.toFixed(4)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Map */}
            <div className="map-wrapper">
                <button onClick={onBack} className="back-btn-float glass-panel hover:text-blue-400 transition-colors">
                    <ArrowLeft size={20} />
                </button>

                <MapContainer
                    center={[24.7136, 46.6753]}
                    zoom={13}
                    scrollWheelZoom={true}
                    style={{ height: "100%", width: "100%" }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />
                    <MapController organizers={organizers} />

                    {organizers.filter(o => o.active).map(org => (
                        <Marker
                            key={org.id}
                            position={[org.lat, org.lng]}
                            icon={L.divIcon({
                                className: `custom-marker marker-${org.status}`,
                                html: `<div class="marker-inner"></div>`,
                                iconSize: [40, 40],
                                iconAnchor: [20, 20] // center
                            })}
                        >
                            <Popup className="glass-popup">
                                <div className="p-2">
                                    <strong className="text-slate-900">{org.name}</strong><br />
                                    Status: {org.status}
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
}
